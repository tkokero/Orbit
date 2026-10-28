const {newsBanner}=require('./game-news.cjs');
const {isIP}=require('node:net');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function decode(value){return String(value).replace(/&(?:amp|lt|gt|quot|apos|nbsp|#\d{1,7}|#x[a-f0-9]{1,6});/gi,entity=>{const known={'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&nbsp;':' '};if(known[entity.toLowerCase()])return known[entity.toLowerCase()];const n=entity[2].toLowerCase()==='x'?parseInt(entity.slice(3,-1),16):Number(entity.slice(2,-1));return n>0&&n<=0x10ffff?String.fromCodePoint(n):'';});}
function safeLink(value,base){try{const text=decode(value).trim();if(!text)return null;const u=new URL(text,base);if(!['https:','http:'].includes(u.protocol)||u.username||u.password||u.port||isIP(u.hostname.replace(/^\[|\]$/g,''))||!u.hostname.includes('.')||/(?:^|\.)(?:localhost|local|internal|test|invalid)$/.test(u.hostname))return null;return u.href;}catch{return null;}}
function imageUrl(value,base){const steam=newsBanner('[img]'+decode(value)+'[/img]');if(steam)return steam;const url=safeLink(value,base);return url?.startsWith('https:')?url:null;}
function attribute(tag,name){const match=new RegExp('\\b'+name+'\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))','i').exec(tag);return match&&(match[1]??match[2]??match[3]);}
const label=text=>decode(String(text).replace(/<[^>]*>/g,'').replace(/\[\/?[a-z][^\]\n]*\]/gi,''));
// Input is already escaped. Only this fixed list vocabulary can become markup.
function lists(text){
 const stack=[];let out='',offset=0;
 const content=value=>{if(stack.length&&!stack.at(-1).item){if(!value.trim())return;out+='<li>';stack.at(-1).item=true;}out+=value;};
 const close=()=>{const row=stack.pop();if(row.item)out+='</li>';out+='</'+row.tag+'>';};
 for(const m of text.matchAll(/\[(\/?)(list|olist|\*)(?:=([^\]\n]{0,30}))?\]/gi)){
  content(text.slice(offset,m.index));offset=m.index+m[0].length;const name=m[2].toLowerCase();
  if(name==='*'){
   if(m[1]){if(stack.at(-1)?.item){out+='</li>';stack.at(-1).item=false;}continue;}
   if(!stack.length){out+='<ul>';stack.push({name:'list',tag:'ul',item:false});}
   if(stack.at(-1).item)out+='</li>';out+='<li>';stack.at(-1).item=true;
  }else if(m[1]){const index=stack.findLastIndex(row=>row.name===name);if(index>=0)while(stack.length>index)close();}
  else if(stack.length<32){if(stack.length&&!stack.at(-1).item){out+='<li>';stack.at(-1).item=true;}const tag=name==='olist'||m[3]?'ol':'ul';out+='<'+tag+'>';stack.push({name,tag,item:false});}
 }
 content(text.slice(offset));while(stack.length)close();return out;
}
/* Only a small static vocabulary is emitted. Link/image destinations stay in the main process. */
function article(contents,{baseUrl}={}){
 const images=[],links=[],tokens=[];
 const token=html=>'\uE000'+(tokens.push(html)-1)+'\uE001';
 const link=(destination,text)=>{const url=safeLink(destination,baseUrl);if(!url||links.length>=128)return escape(label(text));const index=links.push(url)-1;return ' '+token(`<a href="${escape(url)}" data-article-link="${index}" rel="noopener noreferrer">${escape(label(text)||url)}</a>`)+ ' ';};
 const image=(source,alt='Article image')=>{const url=imageUrl(source,baseUrl);if(!url||images.length>=24)return '';const index=images.push(url)-1;return token(`<figure><img data-article-image="${index}" alt="${escape(label(alt))}" loading="lazy" decoding="async"><figcaption hidden>Image unavailable. Open the article in your browser to view it.</figcaption></figure>`);};
 let text=String(contents||'').slice(0,200000).replace(/[\uE000\uE001]/g,'').replace(/<(script|style|iframe|object)\b[^>]*>[\s\S]*?<\/\1>/gi,'');
 text=text.replace(/<img\b[^>]*>/gi,tag=>image(attribute(tag,'src')||'',attribute(tag,'alt')||'Article image'));
 text=text.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi,(_,attrs,copy)=>link(attribute(attrs,'href')||'',copy));
 text=text.replace(/\[img\s+src\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\]\s]+))\s*\](?:\[\/img\])?/gi,(_,a,b,c)=>image(a||b||c));
 text=text.replace(/\[img\]([\s\S]*?)\[\/img\]/gi,(_,url)=>image(url));
 text=text.replace(/\[url(?:=([^\]]*))?\]([\s\S]*?)\[\/url\]/gi,(_,destination,copy)=>link(destination?.replace(/^(["'])(.*)\1$/,'$2')||label(copy),copy));
 text=text.replace(/<(\/?)(ul|ol|li|h[1-6]|strong|em|b|i)\b[^>]*>/gi,(_,end,name)=>{const tag=({ul:'list',ol:'olist',li:'*',strong:'b',em:'i'})[name.toLowerCase()]||name.toLowerCase();return '['+end+tag+']';});
 text=text.replace(/<\/?(?:p|div|br|figure)\b[^>]*>/gi,'\n').replace(/<[^>]*>/g,'').replace(/\[\/?p\]/gi,'\n').replace(/\r\n?/g,'\n');
 text=text.replace(/&(?:bull|#8226|#x2022);/gi,'•').replace(/(\[\*\]\s*)[•●▪]\s*/g,'$1').replace(/([^\n])([•●▪])/g,'$1\n$2');
 // Some announcements use one long line of literal bullet characters.
 text=text.replace(/(^|\n)((?:[ \t]*[•●▪][^\n]*(?:\n+|$))+)/g,(_,prefix,block)=>prefix+'[list]'+block.split(/[•●▪]/).map(x=>x.trim()).filter(Boolean).map(x=>'[*]'+x+'[/*]').join('')+'[/list]\n');
 text=text.replace(/https?:\/\/[^\s<>\[\]\uE000\uE001]+/gi,raw=>{const tail=/[.,;:!?)}]+$/.exec(raw)?.[0]||'';const url=raw.slice(0,raw.length-tail.length);return link(url,url)+tail;});
 text=escape(decode(text));
 const tags={b:'strong',i:'em',u:'u',strike:'s',quote:'blockquote',code:'pre'};
 text=lists(text).replace(/\[(h[1-6]|b|i|u|strike|quote|code)\]/gi,(_,tag)=>'<'+(tags[tag.toLowerCase()]||'h2')+'>').replace(/\[\/(h[1-6]|b|i|u|strike|quote|code)\]/gi,(_,tag)=>'</'+(tags[tag.toLowerCase()]||'h2')+'>').replace(/\[\/?[a-z][^\]\n]{0,400}\]/gi,'').replace(/\n/g,'<br>').replace(/(<(?:ul|ol)>|<\/li>)(?:\s*<br>\s*)+/g,'$1').replace(/(?:<br>\s*)+(<\/(?:li|ul|ol)>)/g,'$1');
 for(let pass=0;pass<4&&text.includes('\uE000');pass++)text=text.replace(/\uE000(\d+)\uE001/g,(_,index)=>tokens[Number(index)]||'');
 text=text.replace(/(<\/(?:h2|ul|ol|blockquote|pre)>)(?:\s*<br>\s*)+/g,'$1').replace(/(?:<br>\s*)+(?=<(?:h2|ul|ol|blockquote|pre)>)/g,'');
 return {html:text,images,links};
}
module.exports={article,safeLink,imageUrl};
