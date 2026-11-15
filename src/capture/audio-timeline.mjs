/* Use the capture clock, not packet-arrival time or a second playback clock. */
export class AudioTimeline {
 constructor(origin,latency){if(!Number.isFinite(origin)||!Number.isFinite(latency)||latency<0||latency>.5)throw Error('Invalid audio clock.');this.origin=origin;this.latency=latency;this.frames=0;}
 read(bytes,videoEpoch){
  if(!bytes?.byteLength||bytes.byteLength%8||!Number.isFinite(videoEpoch))throw Error('Invalid stereo audio.');
  const data=new Float32Array(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)),frames=data.length/2,timestamp=this.origin-this.latency+this.frames/48000-videoEpoch;this.frames+=frames;
  const skip=Math.max(0,Math.ceil(-timestamp*48000-1e-5));if(skip>=frames)return null;
  for(let i=skip*2;i<data.length;i++)if(!Number.isFinite(data[i]))data[i]=0;
  return {data:data.subarray(skip*2),format:'f32',numberOfChannels:2,sampleRate:48000,timestamp:Math.max(0,timestamp+skip/48000)};
 }
}
