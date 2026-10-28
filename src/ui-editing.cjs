const EDITS=new Set(['undo','redo','cut','copy','paste','selectAll']);
function edit(contents,action){if(!EDITS.has(action))throw Error('Unsupported text action.');contents[action]();return true;}
function copyText(clipboard,text){if(typeof text!=='string'||text.length>100000)throw Error('Choose text under 100,000 characters.');clipboard.writeText(text);return true;}
function copyImage(contents,point,bounds){if(!Number.isFinite(point?.x)||!Number.isFinite(point?.y)||point.x<0||point.y<0||point.x>=bounds.width||point.y>=bounds.height)throw Error('The image is outside the window.');contents.copyImageAt(Math.floor(point.x),Math.floor(point.y));return true;}
function webLink(value){if(typeof value!=='string'||value.length>2048)throw Error('Invalid web link.');let url;try{url=new URL(value);}catch{throw Error('Invalid web link.');}if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw Error('Only public web links can be opened.');return url.href;}
module.exports={edit,copyText,copyImage,webLink};
