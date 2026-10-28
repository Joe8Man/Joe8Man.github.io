// Run with: node tests/qingzhou.test.cjs
// Run with: node tests/world-map.test.cjs
const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('path').join(__dirname,'..','Xianxia.html'),'utf8');
const code=html.split('<script>').pop().split('</script>')[0].split('\ninitPageArt();')[0];
const element={innerHTML:'',value:'測試修士',style:{},dataset:{},addEventListener(){},classList:{contains(){return false},add(){},remove(){},toggle(){}},querySelectorAll(){return []},querySelector(){return element}};
const sandbox={console,Math,Date,JSON,Number,Object,Array,Set,String,document:{getElementById(){return element},querySelector(){return element},querySelectorAll(){return []},addEventListener(){}},window:{addEventListener(){}},setTimeout(){},clearTimeout(){},setInterval(){},localStorage:{getItem(){return null},setItem(){}},performance:{now(){return 0}}};
vm.createContext(sandbox);vm.runInContext(code,sandbox);
function beginnerChecks(){
let checks=0;function ok(v,m){if(!v)throw Error(m);checks++}
renderAll=()=>{};renderHUD=()=>{};renderMap=()=>{};renderBattle=()=>{};save=()=>{};log=()=>{};toast=()=>{};chat=()=>{};showModal=()=>{};closeModal=()=>{};artFeedback=()=>{};playExpeditionSlash=()=>{};expeditionFeedback=()=>{};rememberJourney=()=>{};updateQzFight=()=>{};
function fresh(stats=10){draft={root:0,body:0,stats:Array(6).fill(stats)};state=initial();state.artifact.unlocked=true;state.hp=maxHP();combat=null;route='map'}
const results=[];
for(const id of ['wolf','bee','boar','serpent','ape']){
 fresh();const max=qzEnemyStats(id,0).max;let a={hp:max,max,round:0},b={hp:max,max,round:0,qzId:id,qzDepth:0,qzPoison:0};
 for(let r=1;r<8;r++){a.round=b.round=r;const manual=expeditionTurn(a),auto=expeditionTurn(b);ok(manual.damage===auto.damage,'identical opening damage '+id+r);ok(expeditionHarm(qzEnemyStats(id,0).attack,1,manual)===expeditionHarm(qzEnemyStats(id,0).attack,1,auto),'identical incoming base '+id+r)}
 fresh();qz().run={node:1,depth:0,goal:'hunt',path:'unpicked',clue:0,seed:1,enemy:id,hidden:false,won:false,ruinDone:false};qzPending();qzBeginFight(id);let ticks=0;while(qz().fight&&ticks++<100)qzTick(1);ok(qz().kills[id]===1&&state.hp>0,'fresh manual victory '+id);results.push({id,rounds:ticks,hp:Math.round(state.hp)});
}
// Auto really uses the shared damage path, not just a helper that is never called.
fresh();const max=qzEnemyStats('wolf',0).max;state.auto={...autoDefaults(),active:true,clock:0,map:0,useHeal:false,fight:{qzId:'wolf',qzDepth:0,qzPoison:0,hp:max,max,round:0,elite:false,roll:.2}};const expected=expeditionTurn({hp:max,max,round:1});autoTick(1);ok(state.auto.fight.hp===max-Math.round(expected.damage*(1-QZ_ENEMIES.wolf.armor)),'actual auto damage matches manual');
fresh();state.auto={...autoDefaults(),active:true,clock:0,map:0,useHeal:true,fight:{qzId:'wolf',qzDepth:0,qzPoison:0,hp:120,max:120,round:0,elite:false,roll:.2,pills:3}};state.items.heal=10;state.hp=maxHP()*.1;autoTick(1);ok(state.items.heal===10&&!state.auto.active,'auto cannot exceed three pills');
fresh();qzStart();qzChoose('track');qzChoose('fight');const snap=JSON.parse(JSON.stringify(snapshot()));snap.qingzhou.fight.max=snap.qingzhou.fight.hp=priorBalancedQzStats('ape',0,false,0).max;ok(validSave(snap),'previous balanced encounter still loads');ok(qzEnemyStats('wolf',1).max>qzEnemyStats('wolf',0).max*4,'deep difficulty retained');ok(qzEnemyStats('wolfking',0).max>=1560,'boss difficulty retained');
for(const id of ['wolf','bee','boar','serpent','ape']){fresh(1);state.hp=maxHP()*.92;qz().run={node:1,depth:0,goal:'hunt',path:'track',clue:1,seed:1,enemy:id,hidden:false,won:false,ruinDone:false};qzPending();qzBeginFight(id);let ticks=0;const f=qz().fight;while(qz().fight&&ticks++<120)qzTick(1);ok(qz().kills[id]===1&&f.pills<=3,'lowest rolled stats, no equipment, bounded automatic healing '+id);}
console.log(JSON.stringify(results));console.log(checks+' beginner and manual-auto parity checks passed');
}
vm.runInContext("("+beginnerChecks.toString()+")()",sandbox);
