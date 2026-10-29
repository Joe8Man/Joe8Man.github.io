/* Deterministic, DOM-free spatial combat. Every hit requires a collision. */
(function(root){'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
class FieldModel{
 constructor(config){this.cfg=config;this.random=config.random||Math.random;this.p={x:480,y:350,r:15};this.hp=config.hp;this.maxHP=config.maxHP;this.qi=100;this.time=0;this.mobs=[];this.shots=[];this.zones=[];this.events=[];this.cds={};this.kills=0;this.serial=0;this.spawnAt=.3;this.attackAt=.6;this.dashUntil=0;this.dashCD=0;this.wardUntil=0;this.summonUntil=0;this.summonAt=0;this.stopped=false;this.input={x:0,y:0};this.facing={x:1,y:0};this.nextBoss=10;this.bosses=0;this.waiting=false;}
 emit(kind,data={}){this.events.push({kind,...data});}
 drain(){return this.events.splice(0);}
 move(x,y){const l=Math.hypot(x,y);this.input={x:l>1?x/l:x,y:l>1?y/l:y};}
 target(range=Infinity){return this.mobs.filter(m=>!m.dead&&dist(m,this.p)<=range).sort((a,b)=>dist(a,this.p)-dist(b,this.p))[0];}
 spawn(){
  const boss=this.kills>=this.nextBoss;if(boss&&this.mobs.length)return false;
  const id=boss?'wolfking':['wolf','bee','boar','serpent','ape'][this.serial%5],stats=this.cfg.stats[id];if(!stats||!this.cfg.spend())return false;
  const angle=this.random()*Math.PI*2,x=clamp(this.p.x+Math.cos(angle)*330,55,905),y=clamp(this.p.y+Math.sin(angle)*270,75,590);
  const m={id,key:++this.serial,x,y,r:boss?32:id==='boar'?24:18,max:stats.max,hp:stats.max,attack:stats.attack,armor:stats.armor||0,speed:boss?58:id==='wolf'?81:id==='boar'?48:65,at:this.time+1.3,frozenUntil:0,slowUntil:0,boss,dead:false,hitUntil:0};this.mobs.push(m);if(boss)this.nextBoss+=10;this.emit('spawn',{mob:{...m}});return true;
 }
 damage(m,amount,source={}){
  if(m.dead||this.stopped)return;const critical=this.random()<.12,actual=Math.max(1,Math.round(amount*(1-m.armor)*(critical?1.6:1)));m.hp=Math.max(0,m.hp-actual);m.hitUntil=this.time+.12;
  if(source.freeze)m.frozenUntil=this.time+source.freeze;if(source.slow)m.slowUntil=this.time+source.slow;
  const d=dist(m,this.p)||1;m.x=clamp(m.x+(m.x-this.p.x)/d*(m.boss?3:12),35,925);m.y=clamp(m.y+(m.y-this.p.y)/d*(m.boss?3:12),55,605);
  if(source.drain)this.heal(Math.min(actual,m.hp+actual)*source.drain);if(this.cfg.leech)this.heal(Math.min(actual,m.hp+actual)*this.cfg.leech);
  this.emit('hit',{key:m.key,x:m.x,y:m.y,damage:actual,critical,effect:source.effect||'sword'});
  if(m.hp<=0){m.dead=true;this.kills++;if(m.boss)this.bosses++;const reward=this.cfg.reward(m);this.emit('kill',{mob:{...m},reward});}
 }
 hurt(amount){if(this.stopped||this.time<this.dashUntil||this.time<(this.invulnerableUntil||0))return;const damage=Math.max(1,Math.round(amount*(this.time<this.wardUntil?.45:1)*(1-Math.min(.65,this.cfg.defense||0))));this.hp=this.cfg.hurt(damage);this.invulnerableUntil=this.time+.25;this.emit('hurt',{damage});if(this.hp<this.maxHP*.2)this.stop('氣血不足，已安全撤回；收穫保留。');}
 heal(amount){if(amount<=0)return;const previous=this.hp;this.hp=this.cfg.heal(amount);if(this.hp>previous+1)this.emit('heal',{amount:this.hp-previous});}
 stop(reason='已收劍，收穫已保存。'){if(this.stopped)return;this.stopped=true;this.cfg.stop(reason);this.emit('stop',{reason});}
 projectile(x,y,angle,damage,options={}){this.shots.push({key:++this.serial,x,y,vx:Math.cos(angle)*(options.speed||510),vy:Math.sin(angle)*(options.speed||510),damage,r:options.r||7,team:options.team||'hero',pierce:options.pierce||1,seen:new Set(),expires:this.time+(options.life||1.8),effect:options.effect||'sword',...options});}
 zone(x,y,r,damage,life=.2,options={}){this.zones.push({key:++this.serial,x,y,r,damage,expires:this.time+life,at:this.time,interval:options.interval||.5,...options});this.emit('zone',{x,y,r,life,effect:options.effect||'wind'});}
 cast(id){
  if(this.stopped)return {error:'本場已結束。'};
  if(id==='dash'){if(this.time<this.dashCD)return {error:'身法冷卻中。'};this.dashCD=this.time+3.5;this.dashUntil=this.time+.28;this.dashDirection=Math.hypot(this.input.x,this.input.y)>.1?{...this.input}:{...this.facing};this.emit('dash');return {};}
  if(id==='heal'){if((this.cds.pill||0)>this.time||this.hp>=this.maxHP)return {error:'目前無需或無法服丹。'};if(!this.cfg.potion())return {error:'回春丹不足。'};this.cds.pill=this.time+5;this.heal(this.maxHP*.6);return {};}
  const a=this.cfg.moves.find(a=>a.id===id);if(!a)return {error:'尚未配置這個招式。'};if((this.cds[id]||0)>this.time)return {error:'招式冷卻中。'};if(this.qi<a.qi)return {error:'真氣不足。'};if(a.type==='heal'&&this.hp>=this.maxHP)return {error:'氣血已滿。'};if(a.type==='burn'&&this.hp<this.maxHP*.1)return {error:'氣血不足以燃血。'};
  this.qi-=a.qi;this.cds[id]=this.time+Math.max(1.5,a.cd*1.6);const target=this.target(),angle=target?Math.atan2(target.y-this.p.y,target.x-this.p.x):Math.atan2(this.facing.y,this.facing.x),base=this.cfg.attack*(a.mul||1)*(1+((a.level||1)-1)*.15),tx=target?.x??this.p.x+Math.cos(angle)*100,ty=target?.y??this.p.y+Math.sin(angle)*100;
  this.emit('cast',{id,name:a.name,type:a.type,x:tx,y:ty});
  if(a.type==='heal'){this.heal(this.maxHP*(.05+.02*(a.level||1)));return {};}
  if(a.type==='guard'){this.wardUntil=this.time+3;this.orbitUntil=this.time+3;this.orbitAt=0;return {};}
  if(a.type==='burn'){this.hp=this.cfg.hurt(this.maxHP*.04);}
  if(a.type==='freeze'){this.zone(this.p.x,this.p.y,210,base,.25,{freeze:2,effect:'ice'});return {};}
  if(a.type==='poison'){this.zone(tx,ty,115,base*.45,4,{effect:'poison',interval:.6});return {};}
  if(a.type==='summon'){this.summonUntil=this.time+9;this.summonAt=this.time;return {};}
  if(['thunder','thunderfinger'].includes(id)){this.zone(tx,ty,85,base,.2,{effect:'thunder'});return {};}
  if(['cloud','void','frost','fallenleaf'].includes(id)||a.type==='frost'){
   const count=id==='void'?5:3;for(let i=0;i<count;i++)this.projectile(this.p.x,this.p.y,angle+(i-(count-1)/2)*.19,base/count*1.4,{pierce:2,r:9,effect:a.type==='frost'?'ice':'sword',slow:a.type==='frost'?2:0});return {};
  }
  if(['rockfist','wildstrike','claw','windblade'].includes(id)){this.zone(this.p.x+Math.cos(angle)*90,this.p.y+Math.sin(angle)*90,110,base,.2,{effect:id==='claw'?'claw':'wind'});return {};}
  this.projectile(this.p.x,this.p.y,angle,base,{pierce:a.type==='drain'?2:1,r:12,effect:a.type==='drain'||a.type==='burn'?'blood':'sword',drain:a.type==='drain'?.18:0});return {};
 }
 tick(dt){
  if(this.stopped||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.05);this.time+=dt;this.qi=Math.min(100,this.qi+dt*7);
  let input=this.input,speed=180;if(this.time<this.dashUntil){input=this.dashDirection;speed=680;}if(Math.hypot(input.x,input.y)>.1)this.facing={...input};this.p.x=clamp(this.p.x+input.x*speed*dt,30,930);this.p.y=clamp(this.p.y+input.y*speed*dt,55,605);
  if(this.time>=this.spawnAt&&this.mobs.length<4){this.waiting=!this.spawn();this.spawnAt=this.time+(this.waiting?1:2.6);}
  const target=this.target(410);if(target&&this.time>=this.attackAt){this.attackAt=this.time+.78;this.projectile(this.p.x,this.p.y,Math.atan2(target.y-this.p.y,target.x-this.p.x),this.cfg.attack,{effect:'sword'});this.emit('attack',{x:target.x,y:target.y});}
  if(target&&this.time<this.summonUntil&&this.time>=this.summonAt){this.summonAt=this.time+.9;this.projectile(this.p.x+35,this.p.y-25,Math.atan2(target.y-this.p.y+25,target.x-this.p.x-35),this.cfg.attack*.6,{effect:'beast',speed:440});}
  if(this.time<(this.orbitUntil||0)&&this.time>=this.orbitAt){this.orbitAt=this.time+.55;this.zone(this.p.x,this.p.y,85,this.cfg.attack*.45,.1,{effect:'guard'});}
  for(const m of this.mobs){
   if(m.dead||this.time<m.frozenUntil)continue;const distance=dist(m,this.p);
   if(m.chargeUntil>this.time){m.x=clamp(m.x+m.vx*dt,35,925);m.y=clamp(m.y+m.vy*dt,55,605);if(dist(m,this.p)<m.r+this.p.r)this.hurt(m.attack*1.5);continue;}
   if(m.windup){if(this.time>=m.windup.until){const w=m.windup;m.windup=null;if(w.type==='ranged'){const angle=Math.atan2(w.y-m.y,w.x-m.x);for(let i=0;i<(m.boss?5:1);i++)this.projectile(m.x,m.y,angle+(i-(m.boss?2:0))*.23,m.attack,{team:'enemy',speed:m.boss?210:180,r:8,effect:m.id==='serpent'?'poison':'enemy',life:4});}else if(w.type==='charge'){const d=Math.hypot(w.x-m.x,w.y-m.y)||1;m.vx=(w.x-m.x)/d*390;m.vy=(w.y-m.y)/d*390;m.chargeUntil=this.time+.55;}else if(dist(this.p,w)<w.r+this.p.r)this.hurt(m.attack*(m.boss?1.8:1));m.at=this.time+(m.boss?1.4:1.5);}continue;}
   const ranged=['bee','serpent'].includes(m.id),stop=ranged?240:m.boss?105:42;
   if(distance>stop){const ms=m.speed*(this.time<m.slowUntil?.45:1);m.x=clamp(m.x+(this.p.x-m.x)/(distance||1)*ms*dt,35,925);m.y=clamp(m.y+(this.p.y-m.y)/(distance||1)*ms*dt,55,605);}
   if(this.time>=m.at&&(ranged||m.id==='boar'&&distance<280||distance<stop+35)){
    const type=ranged||m.boss&&m.key%2===0?'ranged':m.id==='boar'?'charge':'area';m.windup={type,x:this.p.x,y:this.p.y,r:m.boss?110:48,until:this.time+(m.boss?.9:.65)};this.emit('warning',{key:m.key,...m.windup});
   }
  }
  for(const shot of this.shots){shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;if(shot.team==='enemy'){if(dist(shot,this.p)<shot.r+this.p.r){this.hurt(shot.damage);shot.expires=0;}}else for(const m of this.mobs){if(m.dead||shot.seen.has(m.key)||shot.pierce<=0)continue;if(dist(shot,m)<shot.r+m.r){shot.seen.add(m.key);this.damage(m,shot.damage,shot);shot.pierce--;if(shot.pierce<=0)shot.expires=0;}}}
  for(const zone of this.zones)if(this.time>=zone.at){zone.at=this.time+zone.interval;for(const m of this.mobs)if(!m.dead&&dist(m,zone)<m.r+zone.r)this.damage(m,zone.damage,zone);}
  this.mobs=this.mobs.filter(m=>!m.dead);this.shots=this.shots.filter(s=>s.expires>this.time&&s.x>-40&&s.x<1000&&s.y>-40&&s.y<700);this.zones=this.zones.filter(z=>z.expires>this.time);
 }
}
root.XianxiaFieldModel=FieldModel;
})(typeof window==='undefined'?globalThis:window);
