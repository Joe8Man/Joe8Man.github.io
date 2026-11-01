const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const data=new Map(),events=new Map(),sounds=[];
const gain=()=>({gain:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){}},connect(){},disconnect(){}});
class AudioContext{
 constructor(){this.currentTime=1;this.state='suspended';this.destination={};}
 createGain(){return gain();}
 createOscillator(){return {frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){},start(){sounds.push('start');},stop(){}};}
 resume(){this.state='running';return Promise.resolve();}
 suspend(){this.state='suspended';return Promise.resolve();}
}
const document={hidden:false,addEventListener:(name,fn)=>events.set(name,fn)};
const window={AudioContext,dispatchEvent(){}};
const localStorage={getItem:key=>data.get(key),setItem:(key,value)=>data.set(key,value)};
const context={window,document,localStorage,CustomEvent:class{},setInterval:()=>1,clearInterval(){}};
vm.runInNewContext(fs.readFileSync('assets/engine/audio.js','utf8'),context);
const audio=window.XianxiaAudio;
assert.equal(audio.enabled('music'),true);
assert.equal(audio.enabled('effects'),true);
audio.set('music',false);
assert.equal(data.get('xianxia-audio-music'),'off');
assert.equal(audio.enabled('effects'),true);
audio.set('effects',false);
events.get('pointerdown')();
setImmediate(()=>{
 audio.cue('hit');assert.equal(sounds.length,0,'muted effects make no sound');
 audio.set('effects',true);audio.cue('hit');assert.equal(sounds.length,1,'effects play independently of music');
 document.hidden=true;events.get('visibilitychange')();audio.cue('hit');assert.equal(sounds.length,1,'hidden game is silent');
 document.hidden=false;events.get('visibilitychange')();audio.set('music',true);
 assert.equal(data.get('xianxia-audio-music'),'on');
 console.log('Audio toggles, persistence, independent effects and visibility checks passed');
});
