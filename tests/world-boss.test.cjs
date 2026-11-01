const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('Xianxia.html','utf8'),code=html.split('<script>').pop().split('</script>')[0].split('\ninitPageArt();')[0];
const element={innerHTML:'',value:'討伐修士',style:{},dataset:{},classList:{contains(){return false},add(){},remove(){},toggle(){}},addEventListener(){},querySelectorAll(){return[]},querySelector(){return element}};
let now=1800000000000;class Clock extends Date{static now(){return now;}}
const sandbox={console,Math,Date:Clock,JSON,Number,Object,Array,Set,String,document:{hidden:false,getElementById(){return element},querySelector(){return element},querySelectorAll(){return[]},addEventListener(){}},window:{addEventListener(){},dispatchEvent(){}},setTimeout(){},clearTimeout(){},setInterval(){},localStorage:{setItem(){},getItem(){return null}},performance:{now(){return 0}},assert,advanceClock:ms=>now+=ms};
vm.createContext(sandbox);for(const file of ['boss-core','world-core','field-core'])vm.runInContext(fs.readFileSync('assets/engine/'+file+'.js','utf8'),sandbox);vm.runInContext(code,sandbox);
function checks(){let count=0;const ok=(v,m)=>{assert.ok(v,m);count++;};renderAll=renderHUD=renderMap=renderRoute=save=log=toast=chat=showModal=closeModal=()=>{};
 const B=window.XianxiaBosses,W=window.XianxiaWorld,F=window.xianxiaFieldBridge;
 function fresh(){fieldSession=null;huntSession=null;combat=null;modalKind='';draft={root:0,body:0,stats:Array(6).fill(10)};state=initial();state.realm=7;state.stage=1;state.foundation='heaven';state.artifact.unlocked=true;state.hp=maxHP();state.journey.seen[0]=1;}
 fresh();ok(B.catalog.length===6&&new Set(B.catalog.map(b=>b.map)).size===6,'six regions each own one distinct boss');
 const legacy=snapshot();delete legacy.world.bosses;ok(validSave(legacy),'old saves without bosses still validate');const restored=migrateSave(legacy);ok(W.valid(restored.world)&&Object.keys(restored.world.bosses).length===0,'old saves gain empty boss records without losing resources');
 const bad=JSON.parse(JSON.stringify(state.world));bad.bosses={verdant:{readyAt:Infinity,kills:0}};ok(!W.valid(bad),'non-finite cooldown rejected');bad.bosses={unknown:{readyAt:0,kills:0}};ok(!W.valid(bad),'unknown boss rejected');
 for(const b of B.catalog){
  fresh();const steps=state.steps,view=worldBossViews().find(x=>x.id===b.id);ok(!view.reason&&!view.remaining&&view.lore&&view.art,'available boss has complete inspect data '+b.id);
  const result=worldCommand('worldboss',b.id);ok(result.battle?.boss===b.id&&state.steps===steps&&!fieldSession,'inspection/confirmation command cannot consume entry or begin simulation');
  const cfg=F.start(result.battle);ok(!cfg.error&&cfg.worldBoss.id===b.id&&state.location===b.map&&state.steps===steps-3,'confirmed entry consumes exactly three energy '+b.id);ok(validSave(snapshot()),'active boss save validates '+b.id);
  const model=new window.XianxiaFieldModel(cfg);ok(model.spawn()&&!model.spawn()&&model.mobs.length===1,'boss spawns exactly once with no waves '+b.id);const mob=model.mobs[0];ok(mob.max===b.hp&&mob.attack===b.attack&&mob.r===55,'fixed boss stats and large hitbox '+b.id);
  mob.hp=mob.max*.59;model.attackAt=1e9;model.tick(.05);ok(mob.phase===2&&mob.attack>b.attack,'second phase enrages '+b.id);mob.hp=mob.max*.24;model.tick(.05);ok(mob.phase===3&&mob.speed>58,'final phase strengthens '+b.id);
  model.damage(mob,1e12);ok(model.stopped&&state.ownedGear.includes(b.gear)&&state.world.bosses[b.id].kills===1,'victory grants wearable exclusive treasure and finishes '+b.id);
  ok(state.world.bosses[b.id].readyAt===Date.now()+3600000,'cooldown begins at actual kill time '+b.id);const gold=state.stones;model.damage(mob,1e12);cfg.reward(mob);ok(state.stones===gold,'duplicate death cannot award twice '+b.id);
  const saveCopy=JSON.parse(JSON.stringify(snapshot()));ok(validSave(saveCopy),'victory save validates including trophy '+b.id);state=migrateSave(saveCopy);ok(worldBossViews().find(x=>x.id===b.id).remaining===3600,'reload preserves one-hour countdown '+b.id);
  state.steps=12;state.hp=maxHP();ok(!!F.start({mode:'worldboss',boss:b.id}).error,'early rematch blocked '+b.id);W.advance(worldState(),800);ok(worldBossViews().find(x=>x.id===b.id).remaining===3600,'in-game days do not shorten wall-clock timer '+b.id);
  advanceClock(3599000);ok(worldBossViews().find(x=>x.id===b.id).remaining===1,'not available one second early '+b.id);advanceClock(1000);ok(!worldBossViews().find(x=>x.id===b.id).remaining,'respawns at exact hour '+b.id);
  const second=F.start({mode:'worldboss',boss:b.id});ok(!second.error,'respawned boss can be entered '+b.id);const crystals=state.materials.crystal,fragments=state.materials.fragment;second.reward({id:'worldboss',key:1,boss:true});F.stop();ok(state.ownedGear.filter(id=>id===b.gear).length===1&&state.materials.crystal===crystals+b.crystal+20&&state.materials.fragment===fragments+b.fragment+12,'duplicate trophies convert to precious materials '+b.id);
  ok(B.remaining(state.world.bosses[B.catalog.find(x=>x.id!==b.id).id])===0,'other bosses have independent timers '+b.id);
 }
 fresh();state.steps=2;ok(!!F.start({mode:'worldboss',boss:'verdant'}).error&&!fieldSession,'insufficient energy blocked before entry');fresh();state.realm=0;state.stage=0;state.foundation='unformed';ok(!!F.start({mode:'worldboss',boss:'heaven'}).error,'locked region cannot be bypassed');
 fresh();let cfg=F.start({mode:'worldboss',boss:'verdant'});F.stop();ok(!state.world.bosses.verdant,'retreat does not start respawn timer');ok(cfg.reward({id:'worldboss',key:1,boss:true})===null,'retreated session cannot award');
 fresh();cfg=F.start({mode:'worldboss',boss:'verdant'});const m=new window.XianxiaFieldModel(cfg);m.hurt(m.maxHP*100);ok(m.stopped&&!state.world.bosses.verdant&&state.hp>0,'low health retreat ends encounter without reward or cooldown');
 fresh();const ordinary=F.start('wild'),normal=new window.XianxiaFieldModel(ordinary);normal.spawn();ok(normal.mobs[0].id!=='worldboss'&&normal.wave===1,'ordinary waves remain separate');F.stop();
 console.log(count+' boss entry, fixed stats, phases, reward, old-save migration and wall-clock respawn checks passed');
}
vm.runInContext('('+checks.toString()+')()',sandbox);
for(const b of sandbox.window.XianxiaBosses.catalog){assert.ok(fs.existsSync(b.art));assert.match(html,/六大世界妖王/);}
console.log('Six artwork assets and updated game guide verified');
