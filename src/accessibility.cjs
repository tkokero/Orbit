const SCALES=[1,1.1,1.25,1.5];
function validate(input={}){if(!input||typeof input!=='object'||!SCALES.includes(input.scale??1))throw Error('Choose 100%, 110%, 125%, or 150% interface scaling.');return {scale:input.scale??1,contrast:input.contrast===true,focus:input.focus===true};}
module.exports={validate,SCALES};
