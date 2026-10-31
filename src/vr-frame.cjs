// Electron can deliver a dirty rectangle without valid pixels outside it.
// Retain a complete canvas instead of stretching or submitting a partial repaint.
class VrFrame {
 constructor(width,height){this.width=width;this.height=height;this.bytes=Buffer.alloc(width*height*4);this.ready=false;}
 update(bytes,size,dirty){if(!Buffer.isBuffer(bytes)||!size||!dirty)return null;const {width:w,height:h}=size;if(!Number.isInteger(w)||!Number.isInteger(h)||bytes.length!==w*h*4)return null;const x=Math.max(0,Math.floor(dirty.x)),y=Math.max(0,Math.floor(dirty.y)),right=Math.min(this.width,Math.ceil(dirty.x+dirty.width)),bottom=Math.min(this.height,Math.ceil(dirty.y+dirty.height));if(right<=x||bottom<=y)return null;const full=x===0&&y===0&&right===this.width&&bottom===this.height,whole=w===this.width&&h===this.height,cropped=w===right-x&&h===bottom-y;if(!whole&&!cropped||!this.ready&&!full)return null;for(let row=y;row<bottom;row++){const start=whole?(row*w+x)*4:((row-y)*w)*4;bytes.copy(this.bytes,(row*this.width+x)*4,start,start+(right-x)*4);}this.ready=true;return Buffer.from(this.bytes);}
}
module.exports={VrFrame};
