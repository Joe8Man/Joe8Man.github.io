/* Spatial capture rules extend the existing skills, projectiles and controls. */
(function(root){'use strict';
class TerritoryModel extends root.XianxiaFieldModel{
 constructor(config){super(config);this.territory=config.territory;this.phase=this.territory.defense?'hold':'barrier';this.hold=0;this.p={x:480,y:this.territory.defense?330:520,r:15};this.spawnAt=.4;this.territoryCheckAt=0;}
 spawn(){if(this.stopped||!this.cfg.spend())return false;const f=this.territory.force;
 if(this.phase==='barrier'||this.phase==='guardian'){if(this.mobs.some(m=>!m.dead))return false;if(this.phaseSpawned){this.phase=this.phase==='barrier'?'guardian':'hold';this.phaseSpawned=false;this.emit('territoryPhase',{phase:this.phase});if(this.phase==='hold')return false;}
  this.addMob('cultivator',{max:f*(this.phase==='barrier'?4:2.6),attack:this.phase==='barrier'?0:f*.055,armor:this.phase==='barrier'?.45:.1},true,480,240);const m=this.mobs.at(-1);m.role=this.phase==='barrier'?'防禦大陣':'鎮守修士';if(this.phase==='barrier'){m.speed=0;m.at=1e12;}this.phaseSpawned=true;return true;
 }
 if(this.phase==='hold'&&this.time>=(this.nextChallenger||0)&&this.mobs.filter(m=>!m.dead).length<4){this.nextChallenger=this.time+12;const index=this.serial%4,points=[[80,120],[880,540],[80,540],[880,120]],p=points[index];this.addMob('cultivator',{max:f*.85,attack:f*.045},true,p[0],p[1]);const m=this.mobs.at(-1);m.role=['奪礦劍修','掠地散仙','破陣客卿','逐利高手'][index];return true;}return false;
 }
 tick(dt){if(this.stopped)return;super.tick(dt);if(this.stopped)return;dt=Math.max(0,Math.min(.05,dt));
 if(this.phase==='hold'){const inside=Math.hypot(this.p.x-480,this.p.y-330)<=95,contested=this.mobs.some(m=>!m.dead&&Math.hypot(m.x-480,m.y-330)<=95);this.controlling=inside&&!contested;if(this.controlling)this.hold+=dt;else if(!this.territory.defense)this.hold=0;this.territory.progress(this.hold);
  if(!this.territory.defense&&this.hold>=this.territory.required&&this.territory.win())this.stop('已站穩三分鐘，取得採集資格！請至宗門安排駐守弟子。');
 }
 if(this.time>=this.territoryCheckAt){this.territoryCheckAt=this.time+.25;const result=this.territory.check();if(result==='win')this.stop('反攻已結束，你成功守住資源地。');else if(result==='ended')this.stop('本次反攻已結算，請查看資源地戰報。');}
 }
}
root.XianxiaTerritoryModel=TerritoryModel;
})(typeof window==='undefined'?globalThis:window);
