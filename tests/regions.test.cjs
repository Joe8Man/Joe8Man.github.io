// Run with: node tests/qingzhou.test.cjs
// Run with: node tests/world-map.test.cjs
const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('path').join(__dirname,'..','Xianxia.html'),'utf8');
const code=html.split('<script>').pop().split('</script>')[0].split('\ninitPageArt();')[0];
const element={innerHTML:'',value:'測試修士',style:{},dataset:{},addEventListener(){},classList:{contains(){return false},add(){},remove(){},toggle(){}},querySelectorAll(){return []},querySelector(){return element}};
const sandbox={console,Math,Date,JSON,Number,Object,Array,Set,String,document:{getElementById(){return element},querySelector(){return element},querySelectorAll(){return []},addEventListener(){}},window:{addEventListener(){}},setTimeout(){},clearTimeout(){},setInterval(){},localStorage:{getItem(){return null},setItem(){}},performance:{now(){return 0}}};
vm.createContext(sandbox);vm.runInContext(code,sandbox);
function regionChecks(){
let checks=0,lastHtml='',lastToast='';function check(v,msg){if(!v)throw Error(msg);checks++}
renderAll=()=>{};renderHUD=()=>{};renderMap=()=>{};renderBattle=()=>{};save=()=>{};log=()=>{};chat=()=>{};toast=x=>lastToast=x;showModal=(kind,body)=>{modalKind=kind;lastHtml=body};closeModal=()=>{modalKind=''};artFeedback=()=>{};playExpeditionSlash=()=>{};expeditionFeedback=()=>{};rememberJourney=x=>{};renderEquipment=()=>{};renderBag=()=>{};
let simPower=999999;power=()=>simPower;maxHP=()=>1000000;
function fresh(map=1){draft={root:0,body:0,stats:[10,10,10,10,10,10]};state=initial();state.location=map;state.realm=5;state.foundation='mortal';state.artifact.unlocked=true;state.hp=maxHP();state.stones=10000;state.materials.insight=1000;state.items.heal=10;state.steps=12;combat=null;route='map';simPower=999999;}
const winTurn=()=>({damage:1e9,defense:0,qi:100,name:'測試',healed:0});
let allArt=[];
for(let map=1;map<=5;map++){
 fresh(map);allArt.push(...Object.values(qzEnemies()).map(m=>m.art));check(Object.keys(qzEnemies()).length===7,'seven species '+map);
 check(validSave(snapshot()),'new region state valid '+map);
 for(let depth=0;depth<3;depth++)for(const goal of Object.keys(QZ_GOALS)){
 fresh(map);qz().depth=depth;qz().goal=goal;martialTurn=winTurn;qzStart();check(qz().run?.node===0,'start '+map+depth+goal);check(validSave(snapshot()),'start save '+map+depth+goal);
 check(lastHtml.includes(REGION_EXPEDITIONS[map].nodes[0])&&!lastHtml.includes('竹海')&&!lastHtml.includes('青州'),'localized event '+map);
 qzChoose('aid');check(qz().run.node===1&&qz().run.clue>=2,'aid branch');check(validSave(snapshot()),'node1 save');qzChoose('fight');check(actionLock().includes(MAPS[map].name),'battle lock region');check(validSave(snapshot()),'monster save');
 const m=qz().fight.id;qzTick(1);check(qz().kills[m]===1&&qz().run.won,'normal reward');qzChoose('continue');check(qz().run.node===2,'ruin node');qzChoose('hidden');check(validSave(snapshot()),'hidden save');qzTick(1);check(state.ownedGear.includes('region-'+map+'-charm')&&qz().run.hidden,'regional charm');qzChoose('hidden');check(!qz().fight&&qz().kills.construct===1,'no duplicate hidden reward');qzChoose('continue');qzChoose('fight');check(validSave(snapshot()),'boss save');qzTick(1);
 check(qz().clears[depth]===1&&state.journey.clears[map]===1&&!qz().run,'clear '+map+depth+goal);check(state.ownedGear.includes('region-'+map+'-weapon'),'regional weapon');check(!state.ownedGear.includes('qz-wolffang'),'no Qingzhou gear leak');check(state.qingzhou.clears.every(x=>x===0),'independent Qingzhou progress');check(validSave(snapshot()),'complete save');
 check(lastHtml.includes(REGION_EXPEDITIONS[map].names[6])&&!lastHtml.includes('竹王牙刃'),'localized victory');
 }
 fresh(map);state.realm=0;simPower=0;qzStart();check(!qz().run,'entry gate '+map);state.realm=5;simPower=999999;qz().depth=2;state.realm=qzDepths()[2].realm-1;qzStart();check(!qz().run,'danger realm gate');
 fresh(map);qzStart();qzChoose('track');check(qz().run.enemy==='ape','track changes enemy');qzChoose('fight');state.hp=100;martialTurn=()=>({damage:0,defense:0,qi:100,name:'測試',healed:0});for(let n=0;n<4;n++){state.hp=100;use('heal')};check(qz().fight.pills===3&&state.items.heal===7,'regional pills cap');
 const bad=JSON.parse(JSON.stringify(snapshot()));bad.regionalExpeditions[map].fight.max++;check(!validSave(bad),'reject forged stats');const copy=migrateSave(snapshot());check(validSave(copy)&&copy.regionalExpeditions[map].fight.pills===3,'migration preserves regional fight');
 const rounds=qz().fight.round;document.hidden=true;qzTick(1);check(qz().fight.round===rounds,'background pauses');document.hidden=false;qzRetreat();check(!qz().run&&state.journey.pending===null,'retreat cleanup');check(autoUnlocked(),'retreat retains patrol unlock');
 fresh(map);state.journey.seen[map]=1;qz().depth=2;beginAuto();for(let n=0;n<4;n++)autoTick(1);check(state.auto.fight?.qzId&&state.auto.fight.qzDepth===0,'auto uncleared depth fallback');check(validSave(snapshot()),'auto valid');check(paintedWorldEnemy(map).includes(qzEnemies()[state.auto.fight.qzId].art),'auto sprite matches');state.auto.fight.roll=.2;state.auto.fight.hp=1;martialTurn=winTurn;autoTick(1);check(state.auto.kills===1&&Object.values(qz().kills).reduce((a,b)=>a+b,0)===1,'auto records regional kill');check(qz().clears.every(x=>x===0),'auto no boss clear');
 fresh(map);qz().clears[2]=1;qz().depth=2;state.journey.seen[map]=1;beginAuto();for(let n=0;n<4;n++)autoTick(1);check(state.auto.fight.qzDepth===2&&validSave(snapshot()),'auto cleared depth unlock');
 fresh(map);qzStart();qzChoose('bypass');qzChoose('sneak');qzChoose('continue');qzChoose('fight');const f=qz().fight;f.round=2;f.hp=f.max*.7;const before=f.hp;martialTurn=()=>({damage:0,defense:0,qi:100,name:'測試',healed:0});qzTick(1);const effect=REGION_EXPEDITIONS[map].effect;check(effect==='drain'?f.hp>before:effect==='frost'?f.frost:f.lines.some(x=>x.startsWith('震波追加')),'unique boss effect '+map);check(validSave(snapshot()),'boss effect save '+map);
 qzRetreat();qzStart();qzChoose('bypass');qzChoose('sneak');qzChoose('continue');qzChoose('fight');const controlled=qz().fight;controlled.round=2;controlled.hp=controlled.max*.7;martialTurn=()=>({damage:0,defense:0,qi:100,name:'控制',healed:0,control:true});const hp=controlled.hp;qzTick(1);check(controlled.hp===hp&&!controlled.frost&&!controlled.lines.some(x=>x.startsWith('震波追加')),'control blocks boss effect '+map);
 for(const kind of ['weapon','charm']){const id='region-'+map+'-'+kind;check(shopStock('gear:'+id)===null,'exclusive not sold');const length=state.ownedGear.length;buyGear(id);check(state.ownedGear.length===length,'exclusive purchase blocked')}
}
check(new Set(allArt).size===35,'35 independent art assets');
fresh(1);qzStart();const snap=snapshot();state.location=5;check(validSave(snap),'validation independent of active location');
const legacy=snapshot();delete legacy.regionalExpeditions;legacy.location=0;legacy.journey.pending=null;check(validSave(legacy)&&migrateSave(legacy).qingzhou,'legacy saves accepted');
help();check(lastHtml.includes('五區專章')&&lastHtml.includes('下回合直接傷害降低 30%'),'handbook describes mechanics');
console.log(checks+' five-region exploration, combat, rewards, save and auto checks passed');

}
vm.runInContext("("+regionChecks.toString()+")()",sandbox);
const assetDir=require('path').join(__dirname,'..','assets','regions-v1');
const sprites=fs.readdirSync(assetDir).filter(x=>x.endsWith('.webp'));
if(sprites.length!==35)throw Error('Expected 35 sprites');
for(const file of sprites){const bytes=fs.readFileSync(require('path').join(assetDir,file));if(bytes.length<1000||bytes.toString('ascii',0,4)!=='RIFF'||bytes.readUInt32LE(4)+8!==bytes.length)throw Error('Incomplete sprite: '+file)}
console.log('35 sprite file integrity checks passed');
