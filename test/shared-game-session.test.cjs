const test=require('node:test'),assert=require('node:assert/strict');
const {RunningGames}=require('../src/running-games.cjs');
const game=(id,executable='D:\\Games\\GeometryDash.exe')=>({id,title:id,kind:'game',installed:true,versions:[{executable}]});
const row={pid:43,name:'GeometryDash',path:'D:\\Games\\GeometryDash.exe',started:'2026-11-13T01:00:00Z'};
test('the card explicitly launched wins a shared executable regardless of alphabetical order',async()=>{
 const games=[game('GD'),game('Geometry Dash')];const running=new RunningGames({games:()=>games,emit:()=>{},find:async()=>[row]});
 assert.equal((await running.scan())[0].id,'GD');running.noteLaunch('Geometry Dash');
 assert.deepEqual((await running.scan()).map(s=>s.id),['Geometry Dash']);
 assert.deepEqual((await running.scan()).map(s=>s.id),['Geometry Dash']);running.stop();
});
test('separate installed copies keep separate sessions and failed launch requests cannot claim unrelated paths',async()=>{
 const games=[game('GD'),game('Geometry Dash','E:\\Games\\GeometryDash.exe')];const rows=[row,{...row,pid:44,path:'E:\\Games\\GeometryDash.exe'}];
 const running=new RunningGames({games:()=>games,emit:()=>{},find:async()=>rows});running.noteLaunch('Geometry Dash');
 assert.equal((await running.scan()).length,2);assert.equal(running.sessions.get('Geometry Dash').pid,44);rows.pop();
 assert.deepEqual((await running.scan()).map(s=>s.id),['GD']);running.stop();
});
test('launch claims expire without process evidence, clear after exit and cannot be reused by a recycled PID',async()=>{
 let now=0,rows=[];const games=[game('GD'),game('Geometry Dash')],running=new RunningGames({games:()=>games,emit:()=>{},find:async()=>rows,clock:()=>now});
 running.noteLaunch('Geometry Dash');now=600001;await running.scan();assert.equal(running.launches.size,0);
 rows=[row];running.noteLaunch('Geometry Dash');await running.scan();assert.equal(running.sessions.has('Geometry Dash'),true);
 rows=[{...row,started:'2026-11-13T02:00:00Z'}];await running.scan();assert.equal(running.launches.size,0);assert.equal(running.sessions.has('GD'),true);running.stop();
});
test('a launch made during a slow scan is honored and only one process query is performed',async()=>{
 let resolve,count=0;const games=[game('GD'),game('Geometry Dash')];const running=new RunningGames({games:()=>games,emit:()=>{},find:()=>{count++;return new Promise(r=>resolve=r);}});
 const first=running.scan(),second=running.scan();running.noteLaunch('Geometry Dash');resolve([row]);await Promise.all([first,second]);assert.equal(count,1);assert.equal(running.snapshot()[0].id,'Geometry Dash');running.stop();
});
