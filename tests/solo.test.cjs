// Run with: node tests/qingzhou.test.cjs
// Run with: node tests/world-map.test.cjs
const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('path').join(__dirname,'..','Xianxia.html'),'utf8');
const code=html.split('<script>').pop().split('</script>')[0].split('\ninitPageArt();')[0];
const element={innerHTML:'',value:'測試修士',style:{},dataset:{},addEventListener(){},classList:{contains(){return false},add(){},remove(){},toggle(){}},querySelectorAll(){return []},querySelector(){return element}};
const sandbox={console,Math,Date,JSON,Number,Object,Array,Set,String,document:{getElementById(){return element},querySelector(){return element},querySelectorAll(){return []},addEventListener(){}},window:{addEventListener(){}},setTimeout(){},clearTimeout(){},setInterval(){},localStorage:{getItem(){return null},setItem(){}},performance:{now(){return 0}}};
vm.createContext(sandbox);vm.runInContext(code,sandbox);
function soloChecks(){
let checks=0,body='',message='';function ok(v,m){if(!v)throw Error(m);checks++}
renderAll=()=>{};renderHUD=()=>{};renderMap=()=>{};renderBattle=()=>{};renderEquipment=()=>{};renderBag=()=>{};save=()=>{};log=()=>{};chat=()=>{};toast=x=>message=x;showModal=(k,b)=>{modalKind=k;body=b};closeModal=()=>{modalKind=''};artFeedback=()=>{};playExpeditionSlash=()=>{};expeditionFeedback=()=>{};rememberJourney=()=>{};
const realPower=power;let testPower=600;power=()=>testPower;maxHP=()=>100000;
function fresh(map=0){draft={root:0,body:0,stats:[10,10,10,10,10,10]};state=initial();state.location=map;state.artifact.unlocked=true;state.realm=5;state.foundation='mortal';state.hp=maxHP();state.stones=100000;state.materials.crystal=1000;state.materials.insight=100;state.steps=12;combat=null;route='map';testPower=999999}
for(let map=0;map<6;map++){
 fresh(map);ok(validSave(snapshot()),'initial save');const old=JSON.parse(JSON.stringify(snapshot()));delete old.solo;ok(validSave(old)&&migrateSave(old).solo.stance==='steady','old save migration');
 showSolo();ok(body.includes('江湖懸賞')&&body.includes('本地煉器坊'),'hub');
 const gear=map+'-weapon';let count=qz().drops.wolf;soloForge(gear);ok(!state.ownedGear.includes(gear)&&qz().drops.wolf===count,'insufficient materials atomic');qz().drops.wolf=100;qz().drops.wolfking=10;
 const cost=soloForgeCost(gear),stones=state.stones,crystals=state.materials.crystal;soloForge(gear);ok(state.ownedGear.includes(gear)&&qz().drops.wolf===100-cost.count&&state.stones===stones-cost.stones&&state.materials.crystal===crystals-cost.crystal,'craft costs exact');
 state.equipment.weapon=gear;const base=gearBonus().power;soloForge(gear);ok(solo().forge[gear]===1&&Math.abs(gearBonus().power-base*1.1)<.00001,'upgrade worn bonus');state.equipment.weapon=null;ok(gearBonus().power===0,'unequipped no bonus');
 for(let i=0;i<4;i++)soloForge(gear);ok(solo().forge[gear]===5&&qz().drops.wolfking===7,'tier3 to5 costs boss materials');const balance=state.stones;soloForge(gear);ok(solo().forge[gear]===5&&state.stones===balance,'upgrade cap');ok(validSave(snapshot()),'forged save valid');
 const other=((map+1)%6)+'-weapon';soloForge(other);ok(!state.ownedGear.includes(other),'foreign crafting blocked');const exclusive=map?'region-'+map+'-weapon':'qz-wolffang';ok(soloForgeReason(exclusive).includes('首勝'),'exclusive not crafted early');
 soloAccept();ok(solo().contract.id==='wolf'&&soloContractProgress()===0,'contract accepted');const contract=solo().contract;soloAccept();ok(solo().contract===contract,'no replacement');soloClaim();ok(solo().cycles[map]===0,'incomplete cannot claim');
 qz().kills.bee+=4;ok(soloContractProgress()===0,'wrong species no progress');qz().kills.wolf+=contract.target;ok(soloContractProgress()===contract.target,'target kills progress');const money=state.stones;soloClaim();ok(solo().contract===null&&solo().cycles[map]===1&&state.stones===money+120*(map+1),'exact claim reward');soloClaim();ok(state.stones===money+120*(map+1),'claim once');soloAccept();ok(solo().contract.id==='serpent'&&soloContractProgress()===0,'rotation and no retroactive kills');soloAbandon();ok(!solo().contract,'abandon');
 // Old in-progress encounters remain valid, newly created ones use the new balance.
 qzStart();qzChoose('track');qzChoose('fight');const f=qz().fight;ok(validSave(snapshot()),'new fight valid');const legacy=JSON.parse(JSON.stringify(snapshot())),q=map===0?legacy.qingzhou:legacy.regionalExpeditions[map];q.fight.hp=q.fight.max=legacyQzMax(f.id,0,false,map);ok(validSave(legacy),'legacy fight max valid');
 const snap=JSON.parse(JSON.stringify(snapshot()));(map===0?snap.qingzhou:snap.regionalExpeditions[map]).fight.paused='yes';ok(!validSave(snap),'malformed pause rejected');
 soloPause();state.hp=50000;const restHP=state.hp,restMoney=state.stones;meditateRest();ok(state.hp===restHP&&state.stones===restMoney,'pause cannot bypass pill cap with meditation');const round=f.round;const hp=state.hp;qzTick(1);ok(f.round===round&&state.hp===hp&&validSave(snapshot()),'pause persists and prevents progress');soloStance('assault');ok(solo().stance==='assault','switch while paused');soloStance('focus');ok(solo().stance==='assault','stance cooldown');soloPause();
 // Break a telegraphed ape strike and prevent its incoming damage.
 f.round=3;f.stanceUntil=0;f.martial={qi:100,cds:{}};soloBreak();ok(f.breakNext&&f.martial.qi===75,'break reserves qi');martialTurn=()=>({damage:0,defense:0,qi:75,name:'測試',healed:0});const before=state.hp;qzTick(1);ok(state.hp===before&&!f.breakNext,'break blocks heavy');soloBreak();ok(!f.breakNext,'break cooldown');ok(validSave(snapshot()),'tactical save valid');qzRetreat();
 // Fixed stats: a fitting route needs multiple normal attacks; overpowered builds retain speed.
 const reference=encounterReference(map,0).power;const ordinary=qzEnemyStats('wolf',0).max,boss=qzEnemyStats('wolfking',0).max;ok(ordinary/(reference*.14)>=4,'normal lives several rounds');ok(boss/(encounterReference(map,0,'wolfking').power*.14)>=12,'boss has time for mechanics');testPower=1;const stats=qzEnemyStats('wolf',0).max;testPower=999999;ok(qzEnemyStats('wolf',0).max===stats,'no player scaling');
}
fresh();const bad=JSON.parse(JSON.stringify(snapshot()));bad.solo.forge['0-weapon']=6;ok(!validSave(bad),'reject invalid upgrades');solo().contract={map:0,id:'wolf',base:100,target:3};ok(!validSave(snapshot()),'reject future base count');
help();ok(body.includes('百藝修行')&&body.includes('戰術暫停')&&body.includes('出售或丟棄'),'handbook');
console.log(checks+' single-player crafting, economy, bounties, tactics, balance and migration checks passed');

}
vm.runInContext("("+soloChecks.toString()+")()",sandbox);
