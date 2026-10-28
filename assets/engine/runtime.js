let loading;
export function loadPhaser(){if(window.Phaser)return Promise.resolve(window.Phaser);if(!loading)loading=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='assets/vendor/phaser-4.2.1.min.js';script.onload=()=>resolve(window.Phaser);script.onerror=()=>{loading=null;reject(Error('2D 引擎載入失敗，請重新整理。'));};document.head.append(script);});return loading;}
// Reuse the same painted appearance for profiles, exploration and combat.
const rigCache=new Map(),imageCache=new Map();
async function embeddedImage(url){if(!imageCache.has(url))imageCache.set(url,(async()=>{const response=await fetch(url);if(!response.ok)throw Error('角色素材載入失敗');const blob=await response.blob();return new Promise((ok,no)=>{const reader=new FileReader();reader.onload=()=>ok(reader.result);reader.onerror=no;reader.readAsDataURL(blob);});})());return imageCache.get(url);}
export async function prepareRig(profile={}){
 const key=(profile.gender||'male')+':'+(profile.outfit_id||'none');if(rigCache.has(key))return rigCache.get(key);
 const work=(async()=>{const frames=await Promise.all([0,1,2,3].map(async pose=>{const doc=new DOMParser().parseFromString(window.xianxiaBridge.publicArt(profile,pose),'image/svg+xml'),root=doc.documentElement;
 for(const image of root.querySelectorAll('image'))image.setAttribute('href',await embeddedImage(image.getAttribute('href')));
 root.setAttribute('x','0');root.setAttribute('y','0');root.setAttribute('width','360');root.setAttribute('height','260');
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="360" height="260" viewBox="0 0 360 260">'+new XMLSerializer().serializeToString(root)+'</svg>';
 const image=new Image();await new Promise((ok,no)=>{image.onload=ok;image.onerror=no;image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);});return image;}));return {key,frames};})();
 rigCache.set(key,work);try{return await work;}catch(e){rigCache.delete(key);throw e;}
}
export function makeRig(scene,rig,x,y,scale=1,flip=false){
 const root=scene.add.container(x,y);root.setScale(flip?-scale:scale,scale);const shadow=scene.add.ellipse(0,-3,95,16,0x07171b,.35);root.add(shadow);
 const frames=rig.frames.map((image,i)=>{const key='painted:'+rig.key+':'+i;if(!scene.textures.exists(key))scene.textures.addImage(key,image);const node=scene.add.image(0,0,key).setOrigin(.5,1).setVisible(i===0);root.add(node);return node;});
 let active=false,moving=false;const timers=[];const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const pose=i=>frames.forEach((f,n)=>f.setVisible(n===i));const later=(ms,fn)=>timers.push(scene.time.delayedCall(ms,fn));
 const idle=scene.tweens.add({targets:frames,y:-2,duration:1500,yoyo:true,repeat:-1,paused:reduced,ease:'Sine.easeInOut'});
 const walk=scene.tweens.add({targets:frames,y:-5,duration:180,yoyo:true,repeat:-1,paused:true,ease:'Sine.easeInOut'});
 return{root,setWalk(value){if(moving===value)return;moving=value;idle.pause();if(value&&!reduced)walk.play();else{walk.pause();frames.forEach(f=>f.y=0);if(!reduced)idle.resume();}},face(right){root.scaleX=Math.abs(root.scaleX)*(right?1:-1);},attack(){if(active)return;active=true;pose(1);later(150,()=>pose(2));later(380,()=>pose(3));later(620,()=>{pose(0);active=false;});},guard(){pose(3);later(650,()=>pose(0));},hit(){if(!active){pose(3);later(300,()=>pose(0));}if(!reduced)scene.tweens.add({targets:frames,alpha:.65,duration:90,yoyo:true,repeat:1});},destroy(){timers.forEach(t=>t.remove());root.destroy(true);}};
}
export async function makeGame(host,definition,{width=960,height=540,rigs=[]}={}){const Phaser=await loadPhaser();const prepared=await Promise.all(rigs.map(prepareRig));let sceneRef;let resolveReady,rejectReady;const ready=new Promise((ok,no)=>{resolveReady=ok;rejectReady=no;});class Scene extends Phaser.Scene{constructor(){super('journey');}preload(){definition.preload?.call(this);}create(){sceneRef=this;try{definition.create.call(this,prepared);resolveReady(this);}catch(e){rejectReady(e);}}update(t,dt){definition.update?.call(this,t,Math.min(dt,200));}}
 const game=new Phaser.Game({type:Phaser.AUTO,parent:host,width,height,backgroundColor:'#102524',transparent:!!definition.transparent,antialias:true,pixelArt:false,scene:[Scene],scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},audio:{noAudio:true},input:{keyboard:true},fps:{target:60}});await ready;const canvas=game.canvas;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',definition.label||'Phaser 2D 遊戲場景');return{game,scene:sceneRef,destroy(){game.destroy(true);},pause(){game.loop.sleep();},resume(){game.loop.wake();}};}
export function floatText(scene,x,y,text,color='#f3d393'){const node=scene.add.text(x,y,String(text),{fontFamily:'system-ui',fontSize:'22px',color,stroke:'#10201f',strokeThickness:4}).setOrigin(.5).setDepth(30);scene.tweens.add({targets:node,y:y-45,alpha:0,duration:900,onComplete:()=>node.destroy()});}
export function slash(scene,x,y,color=0xcceadb){const line=scene.add.graphics().setDepth(20);line.lineStyle(5,color,.95);line.beginPath();line.arc(x,y,65,-1.7,.7,false);line.strokePath();scene.tweens.add({targets:line,alpha:0,duration:300,onComplete:()=>line.destroy()});}
