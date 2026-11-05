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
(async()=>{
 let content='',field;
 renderAll=renderHUD=renderMap=log=toast=()=>{};
 showModal=(kind,html)=>{modalKind=kind;content=html;};
 closeModal=()=>{modalKind='';};
 routeTo=next=>{route=next;};
 save=()=>{};
 draft={root:0,body:0,stats:Array(6).fill(10)};
 function fresh(){state=initial();state.hp=maxHP();state.location=0;}
 window.xianxiaField={open:mode=>{field=fieldStart(mode);assert.equal(field.error,undefined);}};
 window.xianxiaWorldUI={
  questTravel:id=>!worldCommand('walk',id).error,
  questAction:(action,value)=>worldCommand(action,value)
 };
 fresh();
 await window.xianxiaMainStory.track();
 assert.match(content,/接下巡山委託/);
 advanceMainStory();
 await goMainStory();
 assert.match(content,/尋找照玄殘劍/);
 await goMainStory();
 assert.equal(state.artifact.unlocked,true);
 assert.equal(modalKind,'mainStory');
 assert.match(content,/查看殘劍上的刻痕/);
 assert.match(content,/任務獎勵 · 修為 .*竹影劍、青竹道袍/);
 const starterStones=state.stones;
 advanceMainStory();
 assert.deepEqual(state.ownedGear,['0-weapon','0-robe']);
 assert.equal(state.stones,starterStones);
 assert.match(content,/打開背包穿戴裝備/);
 await goMainStory();
 field.reward({key:1,id:'wolf'});
 field.stop();
 window.xianxiaMainStory.resumeAfterBattle('wild',0);
 assert.equal(modalKind,'');
 await goMainStory();
 field.reward({key:1,id:'bee'});
 field.stop();
 window.xianxiaMainStory.resumeAfterBattle('wild',0);
 assert.match(content,/除妖 2／2/);
 advanceMainStory();
 await goMainStory();
 assert.equal(route,'bag');
 assert.equal(mainStoryIndex(),4);
 state.stage=2;
 advanceMainStory();
 await goMainStory();
 assert.match(content,/以散修身分繼續/);
 advanceMainStory(true);
 power=()=>1000;
 await goMainStory();
 await goMainStory();
 assert.equal(modalKind,'trials');
 closeModal();
 window.xianxiaField.open({mode:'dungeon',depth:0});
 field.reward({key:1,id:'wolfking',boss:true});
 field.stop();
 window.xianxiaMainStory.resumeAfterBattle('dungeon',0);
 assert.match(content,/拓下石碑線索/);
 advanceMainStory();
 await goMainStory();
 const stones=state.stones;
 advanceMainStory();
 advanceMainStory();
 assert.match(content,/第2章 澤底尋鐘/);
 assert.equal(state.stones,stones+100);
 assert.equal(mainStoryIndex(),8);

 const completedQingzhou=snapshot();
 state=migrateSave(completedQingzhou);
 window.xianxiaMainStory.open();
 assert.match(content,/自動前往 · 煙水集/);
 assert.equal(window.xianxiaMainStory.tracker().progress,1);
 assert.equal(window.xianxiaMainStory.tracker().total,4);
 assert.equal(state.stones,completedQingzhou.stones);
 const afterQingzhou=state.stones;
 power=()=>100;
 await window.xianxiaMainStory.track();
 assert.match(content,/尚缺 350 戰力/);
 assert.equal(state.location,0);
 power=()=>200000;
 let sawSectBranch=false;
 for(let index=8;index<MAIN_STORY.length;index++){
  let step=mainStoryStepAt(index);
  assert.equal(mainStoryIndex(),index);
  const map=mainStoryMap(step);
  if(state.realm<REGION_REALM[map]){
   window.xianxiaMainStory.open();
   assert.match(content,/查看破境準備/);
   await goMainStory();
   assert.equal(mainStoryIndex(),index);
   state.realm=REGION_REALM[map];
   state.hp=maxHP();
  }
  if(step.scatter){
   assert.equal(step.place,'3:wild');
   state.sect=0;
   step=mainStoryStepAt(index);
   assert.equal(step.place,'3:sect');
   sawSectBranch=true;
  }
  await goMainStory();
  assert.equal(mainStoryAt(step.place),true);
  if(step.kills!==undefined){
   const before=worldKills(map);
   await goMainStory();
   for(let n=1;n<=step.kills;n++)field.reward({key:n,id:'wolf'});
   field.stop();
   assert.equal(worldKills(map),before+step.kills);
   window.xianxiaMainStory.resumeAfterBattle('wild',map);
   assert.match(content,new RegExp('除妖 '+step.kills+'／'+step.kills));
  }
  if(step.depth!==undefined){
   const wrongDepth=step.depth===0?1:0;
   qz(map).clears[wrongDepth]++;
   assert.equal(mainStoryReady(step),false);
   await goMainStory();
   assert.equal(field.mode,'dungeon');
   assert.equal(qz(map).depth,step.depth);
   field.reward({key:1,id:'wolfking',boss:true});
   field.stop();
   window.xianxiaMainStory.resumeAfterBattle('dungeon',map);
   assert.equal(mainStoryReady(step),true,JSON.stringify({step:step.title,map,clears:qz(map).clears,location:state.location,kind:modalKind}));
  }
  assert.equal(modalKind,'mainStory');
  const beforeReward={stones:state.stones,...state.materials};
  advanceMainStory();
  for(const [kind,amount] of Object.entries(step.chapterReward||{})){
   assert.equal((kind==='stones'?state.stones:state.materials[kind])-beforeReward[kind],amount);
  }
 }
 assert.equal(sawSectBranch,true);
 assert.equal(MAIN_STORY_CHAPTERS.length,6);
 assert.match(content,/第一卷 · 已完成/);
 assert.ok(state.stones>afterQingzhou);
 const finalSave=snapshot();
 state=migrateSave(finalSave);
 advanceMainStory();
 assert.equal(state.stones,finalSave.stones);
 assert.equal(mainStoryIndex(),MAIN_STORY.length);

 fresh();
 state.realm=2;
 state.mainStoryStep=MAIN_STORY.findIndex(step=>step.scatter);
 await goMainStory();
 assert.equal(mainStoryAt('3:wild'),true);
 assert.match(content,/無名散修/);
 advanceMainStory();
 assert.equal(mainStoryStepAt(mainStoryIndex()).title,'冰窟存證');

 fresh();
 state.world.place='wild';
 state.artifact.unlocked=true;
 state.qingzhou.kills.wolf=2;
 state=migrateSave(snapshot());
 assert.equal(mainStoryIndex(),0);
 await goMainStory();
 advanceMainStory();
 assert.match(content,/查看殘劍上的刻痕/);
 advanceMainStory();
 assert.match(content,/除妖 2／2/);
 advanceMainStory();
 assert.equal(mainStoryIndex(),3);

 fresh();
 state.mainStoryStep=4;
 state.ownedGear.push('0-weapon');
 state.equipment.weapon='0-weapon';
 const legacyStones=state.stones;
 state=migrateSave(snapshot());
 assert.deepEqual(state.ownedGear,['0-weapon','0-robe']);
 assert.equal(state.equipment.weapon,'0-weapon');
 assert.equal(state.stones,legacyStones);
 assert.equal(state.logs.filter(log=>log.msg.includes('補發竹林主線裝備')).length,1);
 state.ownedGear=state.ownedGear.filter(id=>id!=='0-robe');
 state=migrateSave(snapshot());
 assert.deepEqual(state.ownedGear,['0-weapon']);

 fresh();
 state=migrateSave(snapshot());
 state.mainStoryStep=1;
 state.journey.pending={map:0,kind:4,risk:0,roll:0};
 await window.xianxiaMainStory.track();
 assert.match(content,/data-action="encounter"/);
 showEncounter();
 assert.match(content,/握住殘劍/);
 resolveEncounter('sword');
 assert.equal(modalKind,'mainStory');
 assert.match(content,/查看殘劍上的刻痕/);
})()
`,context).then(()=>console.log('New story and old save continuation passed')).catch(error=>{
 console.error(error);
 process.exitCode=1;
});
