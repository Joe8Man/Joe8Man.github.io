const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'Xianxia.html'),'utf8');
const element={value:'測試修士',style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){}};
const context=vm.createContext({
 console,window:{addEventListener(){}},
 document:{getElementById:()=>element,querySelectorAll:()=>[],addEventListener(){}},
 localStorage:{getItem:()=>null,setItem(){}},performance:{now:()=>0},setTimeout(){},setInterval(){}
});
for(const name of ['boss-core','world-core','territory-core','field-core','territory-combat']){
 vm.runInContext(fs.readFileSync(path.join(root,'assets','engine',name+'.js'),'utf8'),context);
}
vm.runInContext(html.split('<script>').pop().split('\ninitPageArt();')[0],context);
context.assert=assert;


vm.runInContext(`
 const productionSave=save;
 renderAll=renderHUD=renderMap=log=toast=checkCeremony=()=>{};
 closeModal=()=>{modalKind='';};
 showModal=kind=>{modalKind=kind;};
 save=()=>{};
 draft={root:0,body:0,stats:Array(6).fill(10)};
 function fresh(){
  state=initial();state.artifact.unlocked=true;state.hp=maxHP();combat=null;
 }
 fresh();
 const dailyOffline=offlineCultivation(86400);
 assert.equal(dailyOffline,offlineCultivation(172800));
 assert.ok(Math.abs(dailyOffline-offlineCultivation(7200)*12)<1e-8);
 state.boostUntil=Date.now()+60000;
 assert.equal(offlineCultivation(86400),dailyOffline);
 state.boostUntil=0;
 for(let map=0;map<6;map++){
  assert.ok(expeditionXP(map,1)>expeditionXP(map,0));
  assert.ok(expeditionXP(map,0,true)>expeditionXP(map,0));
  assert.ok(expeditionXP(map)>Math.round(expeditionXP(map)*.84));
 }
 const ordinary=expeditionXP(0);
 assert.ok(ordinary>17);
 assert.ok(dungeonClearXP(0,0,true)>dungeonClearXP(0,0,false));
 const old=snapshot();delete old.progressionBalance;
 old.xp=PRIOR_NEED[0]*1.25;
 const converted=migrateSave(old);
 assert.equal(converted.xp,NEED[0]*1.25);
 assert.equal(converted.total,old.total);
 assert.equal(migrateSave(converted).xp,converted.xp);
 for(let realm=0;realm<REALMS.length;realm++){
  for(const stage of [0,8]){
   const previous=Math.round(PRIOR_NEED[realm]*(1+stage*(realm===0?.8:.3)+stage*stage*(realm===0?.55:.14)));
   const legacy={...old,realm,stage,xp:previous*.6};
   const updated=migrateSave(legacy);
   assert.ok(Math.abs(updated.xp/needXP(updated)-.6)<1e-12);
  }
 }
 fresh();
 const clock=Date.now;
 Date.now=()=>100000000;
 lastFrame=Date.now()-3600000;
 document.hidden=true;
 const beforeHidden=state.xp;
 assert.equal(productionSave(),true);
 assert.equal(state.xp-beforeHidden,offlineCultivation(3600));
 productionSave();
 assert.equal(state.xp-beforeHidden,offlineCultivation(3600));
 document.hidden=false;
 Date.now=clock;
 fresh();state.mainStoryStep=3;
 const before=state.xp;
 advanceMainStory();
 assert.equal(state.xp-before,mainStoryXP(MAIN_STORY[3]));
 assert.equal(state.mainStoryStep,4);
 advanceMainStory();
 assert.equal(state.xp-before,mainStoryXP(MAIN_STORY[3]));
 fresh();power=()=>200000;
 const first=fieldStart({mode:'dungeon',depth:0});
 const kill=first.reward({key:1,id:'wolfking',boss:true});
 assert.equal(kill.xp,expeditionXP(0)*6+dungeonClearXP(0,0,true));
 assert.equal(state.auto.xp,kill.xp);
 assert.equal(first.reward({key:1,id:'wolfking',boss:true}),null);
 first.stop();
 const repeat=fieldStart({mode:'dungeon',depth:0});
 const later=repeat.reward({key:1,id:'wolfking',boss:true});
 assert.equal(later.xp,expeditionXP(0)*6+dungeonClearXP(0,0,false));
 repeat.stop();
 // Income-only simulation. Gear, martial skills and breakthrough supplies
 // are assumed ready, so these dates describe a faster bound, not a guarantee.
 const report=[];
 for(const minutes of [30,60,120]){
  fresh();
  const reached={};
  function spend(){
   while(state.realm<10&&state.xp>=needXP()){
    state.xp-=needXP();
    if(state.stage>=8){state.realm++;state.stage=0;reached[state.realm]??=day;}
    else state.stage++;
   }
  }
  let day;
  for(day=1;day<=120&&state.realm<6;day++){
   state.xp+=offlineCultivation(86400-minutes*60);
   spend();
   for(let minute=0;minute<minutes;minute++){
    // Ordinary starter improves its build gradually over the first two weeks.
    state.sect=day>=2?0:null;
    state.book=day>=7;
    state.artifact.level=Math.min(12,Math.floor(day/2));
    const map=Math.min(5,state.realm+1);
    const depth=day>=5?1:0;
    // Five ordinary kills/minute, one boss plus a clear every five minutes.
    state.xp+=rate(false)*60+expeditionXP(map,depth)*5;
    if(minute%5===4)state.xp+=expeditionXP(map,depth)*6+dungeonClearXP(map,depth,false);
    spend();
   }
  }
  report.push({minutes,reached,realm:state.realm});
 }
 console.log(JSON.stringify(report));
 assert.ok(report[1].reached[2]<report[0].reached[2]);
 assert.ok(report[2].reached[3]<report[1].reached[3]);
 assert.ok(report[0].reached[4]>20);
 for(let realm=6;realm<REALMS.length-1;realm++){
  const growth=NEED[realm+1]/NEED[realm]/2.2;
  assert.ok(growth>1&&growth<1.25);
 }
 console.log('Offline, rewards, migration and active-play progression checks passed');
`,context);
