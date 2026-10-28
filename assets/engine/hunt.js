import {makeGame,makeRig,makeGroundShadow,floatText} from './runtime.js?v=5';
import {createBattleAtmosphere,techniqueStyle,playHuntEffect} from './battle-art.js?v=2';
const host=document.getElementById('phaserHunt'),api=()=>window.xianxiaHuntBridge;
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let runtime=null,actor=null,enemy=null,body=null,enemyBreath=null,opening=false,active=false,paused=false,epoch=0,hudAt=0,combo=0,lastHit=0,hitStop=false;
let audio=null,sound=true;
try{sound=localStorage.getItem('xianxia-hunt-sound')!=='off';}catch{}
const still=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function unlockSound(){if(!sound)return;try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;audio??=new Audio();audio.resume().catch(()=>{});}catch{sound=false;}}
function tone(kind){
 if(!sound||!audio||audio.state!=='running'||document.hidden)return;
 try{const at=audio.currentTime,osc=audio.createOscillator(),gain=audio.createGain(),critical=kind==='critical';osc.type=kind==='loot'?'sine':'triangle';osc.frequency.setValueAtTime(kind==='swing'?650:kind==='loot'?880:critical?220:420,at);osc.frequency.exponentialRampToValueAtTime(kind==='loot'?1320:kind==='swing'?230:90,at+.11);gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(kind==='swing'?.012:.028,at+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+.14);osc.connect(gain);gain.connect(audio.destination);osc.start(at);osc.stop(at+.16);osc.onended=()=>{osc.disconnect();gain.disconnect();};}catch{}
}
function message(text){const node=host.querySelector('[data-hunt-status]');if(node)node.textContent=text;}
function button(id,name,type){const style=techniqueStyle(id,type);return `<button class="hunt-skill tone-${style.palette}" data-hunt-command="art:${escape(id)}"><span class="technique-seal" aria-hidden="true">${style.seal}</span><strong>${escape(name)}</strong><small data-skill-detail></small><span class="hunt-skill-cooldown" data-skill-cd></span></button>`;}
function markup(v){return `<div class="hunt-heading"><div><span class="kicker">一劍入林 · 即時刷怪</span><h3>青州竹林</h3></div><div class="hunt-tools"><button class="text-action" data-hunt-sound aria-pressed="${sound}">${sound?'音效開':'音效關'}</button><button class="btn ghost" data-hunt-close>收劍離開</button></div></div><div class="hunt-vitals"><div><span>${escape(v.name)}</span><strong data-hunt-hp></strong><div class="hunt-bar"><i data-hunt-hpbar></i></div></div><div class="hunt-enemy-vital"><span data-hunt-enemy>尋找妖獸</span><strong data-hunt-foehp></strong><div class="hunt-bar enemy"><i data-hunt-foebar></i></div></div></div><div class="hunt-stage"><div class="engine-canvas" data-hunt-canvas></div><div class="hunt-pause-layer hidden" data-hunt-paused><span>劍息暫歇</span><p>準備好，再繼續。</p><button class="btn primary" data-hunt-resume>繼續刷怪</button></div><div class="hunt-combo" data-hunt-combo aria-hidden="true"></div></div><div class="hunt-flow"><span data-hunt-status role="status">循劍而行，妖獸將至。</span><button class="text-action" data-hunt-pause>暫停</button></div><div class="hunt-resource"><span>真氣 <b data-hunt-qi>100</b></span><span>精力 <b data-hunt-energy></b></span><small>自動普攻 · 點選施放技能</small></div><div class="hunt-skills">${v.moves.map(m=>button(m.id,m.name,m.type)).join('')}</div><div class="hunt-support"><button class="btn ghost" data-hunt-command="guard">護體 <small data-hunt-guard></small></button><button class="btn ghost" data-hunt-command="heal">回春丹 <small data-hunt-heal></small></button></div><div class="hunt-loot" data-hunt-loot aria-live="polite">擊敗妖獸，獲取修為與掉寶。</div><div class="hunt-totals"><span>擊敗 <b data-hunt-kills>0</b></span><span>修為 <b data-hunt-xp>+0</b></span><span>靈石 <b data-hunt-gold>+0</b></span></div><p class="hunt-note">每隻消耗 1 精力；技能沿用已配置功法。氣血不足 20% 自動撤回，離開即停止。切到背景會暫停，沒有離線戰鬥。</p>`;}
function hud(v){
 if(!v)return;const set=(selector,text)=>{const node=host.querySelector(selector);if(node)node.textContent=text;};
 set('[data-hunt-hp]',`${Math.max(0,Math.ceil(v.hp))} / ${v.maxHP}`);host.querySelector('[data-hunt-hpbar]').style.width=Math.max(0,Math.min(100,v.hp/v.maxHP*100))+'%';
 set('[data-hunt-enemy]',v.fight?.name||'尋找下一隻妖獸');set('[data-hunt-foehp]',v.fight?`${Math.ceil(v.fight.hp)} / ${v.fight.max}`:'');host.querySelector('[data-hunt-foebar]').style.width=(v.fight?Math.max(0,v.fight.hp/v.fight.max*100):0)+'%';
 set('[data-hunt-qi]',Math.floor(v.fight?.qi??100));set('[data-hunt-energy]',Math.floor(v.steps)+'/12');set('[data-hunt-kills]',v.kills);set('[data-hunt-xp]','+'+v.xp);set('[data-hunt-gold]','+'+v.stones);
 for(const m of v.moves){const node=host.querySelector(`[data-hunt-command="art:${m.id}"]`);if(!node)continue;node.disabled=paused||!v.active||!m.available;node.classList.toggle('cooling',m.remaining>0);node.querySelector('[data-skill-detail]').textContent=m.remaining>0?'冷卻中':`${m.qi} 真氣`;node.querySelector('[data-skill-cd]').textContent=m.remaining>0?m.remaining.toFixed(1)+'s':'';}
 const guard=host.querySelector('[data-hunt-command="guard"]'),heal=host.querySelector('[data-hunt-command="heal"]');guard.disabled=paused||!v.active||!v.fight||v.guardCD>0;heal.disabled=paused||!v.active||!v.fight||v.heal<1||v.healCD>0||(v.fight.pills||0)>=3||v.hp>=v.maxHP;set('[data-hunt-guard]',v.guardCD>0?v.guardCD.toFixed(1)+'s':'');set('[data-hunt-heal]',v.healCD>0?v.healCD.toFixed(1)+'s':'×'+v.heal);
 if(!v.active){message(v.reason);host.querySelector('[data-hunt-pause]').textContent='重新開始';}else host.querySelector('[data-hunt-pause]').textContent=paused?'繼續':'暫停';
}
function stopFrame(scene,critical){if(still()||hitStop)return;hitStop=true;scene.tweens.timeScale=0;scene.time.delayedCall(critical?65:38,()=>{scene.tweens.timeScale=1;hitStop=false;});}
function spawn(scene,event){
 enemyBreath?.stop();enemy?.destroy(true);const v=api().view();
 body=scene.add.image(0,0,'hunt-'+event.id).setOrigin(.5,1).setDisplaySize(event.id==='bee'?165:225,event.id==='bee'?165:215);
 enemy=scene.add.container(still()?735:950,425,[makeGroundShadow(scene,0,0,140,20),body]).setDepth(10);
 if(!still()){scene.tweens.add({targets:enemy,x:735,duration:320,ease:'Cubic.easeOut'});enemyBreath=scene.tweens.add({targets:body,scaleX:body.scaleX*1.012,scaleY:body.scaleY*1.025,duration:1100,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});actor.setWalk(true);scene.tweens.add({targets:actor.root,x:460,duration:350,ease:'Sine.easeOut',onComplete:()=>actor.setWalk(false)});}
 message(v.fight?.name+'出現 · 自動交鋒');
}
function loot(scene,event){
 enemyBreath?.stop();if(enemy){scene.tweens.add({targets:enemy,alpha:0,y:enemy.y+18,angle:still()?0:8,duration:320});}
 const line=`修為 +${event.xp} · 靈石 +${event.money}${event.bonus?' · '+event.bonus:''}`;host.querySelector('[data-hunt-loot]').textContent=line;message('擊倒妖獸，繼續前進。');tone('loot');
 floatText(scene,520,160,'修為 +'+event.xp,'#d6edb8');
 if(!still())for(let i=0;i<5;i++){const coin=scene.add.circle(690+(i-2)*15,390-i%2*15,3.5,0xe5c787).setDepth(24);scene.tweens.add({targets:coin,x:actor.root.x+20,y:410,alpha:0,duration:500,delay:130+i*45,ease:'Cubic.easeIn',onComplete:()=>coin.destroy()});}
}
function event(scene,event){
 if(event.kind==='spawn'){spawn(scene,event);return;}
 if(event.kind==='windup'){
  const style=techniqueStyle(event.id,event.type);scene.tweens.killTweensOf(actor.root);actor.perform(style.family,{interrupt:true});if(!style.self&&!still())scene.tweens.add({targets:actor.root,x:515,duration:150,yoyo:true,hold:100,ease:'Sine.easeInOut'});
  if(event.id!=='normal'){message(event.name+' · 施展');floatText(scene,420,100,event.name,'#e7dfbd');}tone('swing');playHuntEffect(scene,{actor,enemy,id:event.id,type:event.type,phase:'windup'});return;
 }
 if(event.kind==='hit'){
  playHuntEffect(scene,{actor,enemy,id:event.id,type:event.type,critical:event.critical});
  if(event.damage>0&&enemy){const target=enemy;body.setTintFill(event.critical?0xffe4ab:0xf5eddb);scene.time.delayedCall(75,()=>{if(body?.active)body.clearTint();});if(!still()){scene.tweens.add({targets:target,x:target.x+(event.critical?26:10),duration:75,yoyo:true,ease:'Cubic.easeOut'});if(event.critical)scene.cameras.main.shake(90,.003);}floatText(scene,target.x,target.y-150,(event.critical?'暴擊 ':'')+'−'+event.damage,event.critical?'#ffe3a1':'#e8edcf');stopFrame(scene,event.critical);tone(event.critical?'critical':'hit');
   combo=scene.time.now-lastHit<1900?combo+1:1;lastHit=scene.time.now;host.querySelector('[data-hunt-combo]').textContent=combo>1?combo+' 連擊':'';
  }
  if(event.healed>0)floatText(scene,actor.root.x,actor.root.y-160,'+'+Math.round(event.healed),'#b6ebbc');if(event.control)floatText(scene,enemy.x,170,'冰封','#bce8fa');return;
 }
 if(event.kind==='hurt'){actor.flash();if(!still())scene.tweens.add({targets:actor.root,x:actor.root.x-12,duration:70,yoyo:true});floatText(scene,actor.root.x,actor.root.y-160,'−'+event.damage,'#e7aa99');return;}
 if(event.kind==='kill'){loot(scene,event);return;}
 if(event.kind==='heal'||event.kind==='guard'){actor.perform(event.kind,{interrupt:true});playHuntEffect(scene,{actor,enemy,id:event.kind});if(event.healed)floatText(scene,actor.root.x,220,'+'+Math.round(event.healed),'#b6ebbc');return;}
 if(event.kind==='stop')message(event.reason);
}
function pause(){if(!active||paused)return;paused=true;runtime?.pause();audio?.suspend().catch(()=>{});host.querySelector('[data-hunt-paused]')?.classList.remove('hidden');hud(api().view());}
function resume(){if(!active)return;paused=false;runtime?.resume();unlockSound();host.querySelector('[data-hunt-paused]')?.classList.add('hidden');hud(api().view());}
async function open(){
 if(opening)return;if(active){host.scrollIntoView({block:'start',behavior:'smooth'});return;}
 unlockSound();const started=api()?.start();if(!started||started.error){window.alert(started?.error||'刷怪模式尚未準備好');return;}
 const ticket=++epoch;active=true;paused=false;opening=true;combo=0;hitStop=false;hudAt=0;
 document.body.classList.add('is-hunting');document.getElementById('route-map').classList.add('hunt-exploring');host.innerHTML=markup(started);host.classList.remove('hidden');hud(started);
 // Match the existing route without reopening either exploration scene.
 window.xianxiaBridge.go('map');
 try{
 const built=await makeGame(host.querySelector('[data-hunt-canvas]'),{label:'青州竹林即時刷怪，自動普攻與手動技能',preload(){this.load.image('hunt-background','assets/qingzhou-v1/scene.webp');for(const m of started.monsters)this.load.image('hunt-'+m.id,m.art);this.load.image('monster-wolf','assets/qingzhou-v1/wolf.webp');},create(rigs){if(ticket!==epoch||!active)return;this.add.image(480,270,'hunt-background').setDisplaySize(960,540);createBattleAtmosphere(this,0);actor=makeRig(this,rigs[0],300,440,1.05);actor.root.setDepth(10);this.add.text(480,38,'劍 起 竹 海',{fontFamily:'serif',fontSize:'18px',color:'#d9dfc1',stroke:'#102722',strokeThickness:3}).setOrigin(.5).setDepth(30);},update(_time,dt){if(!active||paused||ticket!==epoch)return;if(document.hidden){pause();return;}if(!document.querySelector('#modalOverlay.hidden')){pause();return;}if(hitStop)return;api().tick(Math.min(dt/1000,.1));for(const e of api().drain())event(this,e);hudAt+=dt;if(hudAt>=90){hudAt=0;hud(api().view());}}},{rigs:[started.appearance]});
 if(ticket!==epoch||!active){built.destroy();return;}runtime=built;if(paused)runtime.pause();host.style.scrollMarginTop=(Math.ceil(document.getElementById('playerDock')?.getBoundingClientRect().height||0)+12)+'px';host.scrollIntoView({block:'start',behavior:'smooth'});
 }catch(error){if(ticket!==epoch)return;api().stop('場景載入失敗，刷怪已停止');active=false;message('場景載入失敗，請收劍離開後再試。');console.error('hunt scene failed',error);}finally{if(ticket===epoch)opening=false;}
}
function close(){
 if(!active&&!opening&&host.classList.contains('hidden'))return;epoch++;api()?.stop();active=false;paused=false;opening=false;hitStop=false;runtime?.destroy();runtime=null;actor=enemy=body=null;enemyBreath=null;audio?.suspend().catch(()=>{});host.classList.add('hidden');document.body.classList.remove('is-hunting');document.getElementById('route-map').classList.remove('hunt-exploring');
}
host.addEventListener('click',async e=>{
 if(e.target.closest('[data-hunt-close]')){close();return;}
 if(e.target.closest('[data-hunt-sound]')){sound=!sound;try{localStorage.setItem('xianxia-hunt-sound',sound?'on':'off');}catch{}if(sound)unlockSound();const button=host.querySelector('[data-hunt-sound]');button.textContent=sound?'音效開':'音效關';button.setAttribute('aria-pressed',String(sound));return;}
 if(e.target.closest('[data-hunt-resume]'))return resume();
 if(e.target.closest('[data-hunt-pause]')){if(!api().view()?.active){close();await open();}else paused?resume():pause();return;}
 const command=e.target.closest('[data-hunt-command]')?.dataset.huntCommand;if(!command||paused||!runtime)return;unlockSound();const result=api().command(command);if(result.error)message(result.error);hud(api().view());
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('blur',pause);
window.xianxiaHunt={open,close,pause,resume,get active(){return active;},getState:()=>({active,paused,opening,combo,sceneReady:!!runtime})};
