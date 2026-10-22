function personal(input={}){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Invalid game notes.');
 if(typeof input.notes!=='string'||input.notes.length>16000)throw Error('Notes must be under 16,000 characters.');
 if(!Array.isArray(input.aliases)||input.aliases.length>12||input.aliases.some(a=>typeof a!=='string'||a.length>80))throw Error('Use up to 12 alternate names, each under 80 characters.');
 return {notes:input.notes.replaceAll('\0',''),aliases:[...new Set(input.aliases.map(a=>a.trim()).filter(Boolean))]};
}
module.exports={personal};
