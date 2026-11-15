const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');
const {PCMFrames}=require('../src/clips-audio.cjs'),{ClipBuffer,decodeRecords,encodeRecord,writeParts}=require('../src/clips-buffer.cjs');
test('vectored replay writes retry partial headers and payloads without repeating bytes',async()=>{
 const parts=[Buffer.from('header'),Buffer.from('packet body'),Buffer.from('tail')],output=[];let call=0;
 await writeParts({async writev(rows){const all=Buffer.concat(rows),n=Math.min([1,6,2,9][call++%4],all.length);output.push(all.subarray(0,n));return {bytesWritten:n};}},parts);
 assert.equal(Buffer.concat(output).toString(),'headerpacket bodytail');assert(call>3);
 await assert.rejects(writeParts({writev:async()=>({bytesWritten:0})},parts),/could not be written/);
});
test('PCM parser preserves stereo bytes across every split and retains earlier delivered frames',()=>{
 const frames=Array.from({length:7},(_,i)=>Buffer.alloc(7680,i+1)),wire=Buffer.concat(frames.flatMap(b=>{const header=Buffer.alloc(4);header.writeUInt32LE(b.length);return [header,b];}));
 for(const split of [1,2,3,4,5,127,1024,7684,11000,wire.length]){const received=[],parser=new PCMFrames(b=>received.push(b));for(let at=0;at<wire.length;at+=split)parser.push(wire.subarray(at,at+split));assert.equal(received.length,frames.length);received.forEach((b,i)=>assert.deepEqual(Buffer.from(b),frames[i]));assert.equal(parser.body,null);assert.equal(parser.used,0);}
});
test('replay writer keeps one open segment, preserves offset views and closes its handle',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'orbit-transfer-')),buffer=await new ClipBuffer({root,seconds:30}).init();
 try{const data=Uint8Array.of(99,1,2,3,99).subarray(1,4),packet=t=>({track:'video',type:t===0?'key':'delta',timestamp:t/60,duration:1/60,sequenceNumber:t,data,...(t===0?{config:{codec:'avc1.42001f'}}:{})});
 await buffer.append([packet(0)]);const file=buffer.writer.file;for(let i=1;i<12;i++)await buffer.append([packet(i)]);assert.equal(buffer.writer.file,file);
 const snapshot=await buffer.freeze(),rows=await buffer.read(snapshot,0);assert.equal(rows.length,12);for(const row of rows)assert.deepEqual(row.data,Uint8Array.of(1,2,3));
 const bytes=await fs.readFile(snapshot.groups[0].file);assert.deepEqual(bytes,Buffer.concat(Array.from({length:12},(_,i)=>encodeRecord(packet(i)))));assert.equal(decodeRecords(bytes).length,12);await buffer.release(snapshot);await buffer.close();assert.equal(buffer.writer,null);await assert.rejects(file.stat(),/closed|EBADF/);
 }finally{await buffer.close();await fs.rm(root,{recursive:true,force:true});}
});
