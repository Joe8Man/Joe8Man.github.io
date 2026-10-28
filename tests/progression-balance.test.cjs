// Run with: node tests/qingzhou.test.cjs
// Run with: node tests/world-map.test.cjs
const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('path').join(__dirname,'..','Xianxia.html'),'utf8');
const code=html.split('<script>').pop().split('</script>')[0].split('\ninitPageArt();')[0];
const element={innerHTML:'',value:'測試修士',style:{},dataset:{},addEventListener(){},classList:{contains(){return false},add(){},remove(){},toggle(){}},querySelectorAll(){return []},querySelector(){return element}};
const sandbox={console,Math,Date,JSON,Number,Object,Array,Set,String,document:{getElementById(){return element},querySelector(){return element},querySelectorAll(){return []},addEventListener(){}},window:{addEventListener(){}},setTimeout(){},clearTimeout(){},setInterval(){},localStorage:{getItem(){return null},setItem(){}},performance:{now(){return 0}}};
vm.createContext(sandbox);vm.runInContext(code,sandbox);
function matrixChecks(){
let checks=0;function ok(v,m){if(!v)throw Error(m);checks++}
renderAll=()=>{};renderHUD=()=>{};renderMap=()=>{};renderBattle=()=>{};save=()=>{};log=()=>{};toast=()=>{};chat=()=>{};showModal=()=>{};closeModal=()=>{};artFeedback=()=>{};playExpeditionSlash=()=>{};expeditionFeedback=()=>{};rememberJourney=()=>{};updateQzFight=()=>{};
let reference,stance='steady';power=()=>reference.power;maxHP=()=>reference.hp;
function fresh(map,depth,id){reference=encounterReference(map,depth,id);draft={root:0,body:0,stats:Array(6).fill(10)};state=initial();state.realm=5;state.foundation='mortal';state.location=map;state.artifact.unlocked=true;state.hp=maxHP();state.items.heal=3;combat=null;route='map';qz().clears[depth]=1;solo().stance=stance;solo().manualHeal=false}
function manual(map,depth,id){fresh(map,depth,id);const node=id==='wolfking'?3:id==='construct'?2:1;qz().run={node,depth,goal:'hunt',path:'unpicked',clue:node===2?2:0,seed:1,enemy:id,hidden:false,won:false,ruinDone:false};qzPending();qzBeginFight(id);const f=qz().fight,trail=[state.hp];let count=0;while(qz().fight&&count++<120){if(id==='wolfking'||id==='construct'){if(state.hp/maxHP()<.45&&state.items.heal>0)use('heal');if(soloHeavy(id,f.round+1))qzGuard()}qzTick(1);trail.push(state.hp)}return {trail,win:qz().kills[id]>0,hp:state.hp,rounds:f.round,pills:f.pills}}
const rows=[];
for(const stanceChoice of ['steady','assault','focus'])for(let map=0;map<6;map++)for(let depth=0;depth<3;depth++){stance=stanceChoice;
 const ordinary=[];
 for(const id of ['wolf','bee','boar','serpent','ape']){
 const m=manual(map,depth,id);ok(m.win||stance==='focus','ordinary at intended combat stance '+map+depth+id);fresh(map,depth,id);const stats=qzEnemyStats(id,depth);state.auto={...autoDefaults(),active:true,map,clock:0,useHeal:false,fight:{qzId:id,qzDepth:depth,qzPoison:0,hp:stats.max,max:stats.max,round:0,elite:false,roll:.2}};const f=state.auto.fight;let ticks=0;while(state.auto.active&&state.auto.fight&&ticks++<120)autoTick(1);ok(state.auto.kills===1||(!state.auto.active&&state.hp<maxHP()*.2),'auto wins or safely retreats '+map+depth+id);ok(state.hp===m.trail[f.round],'same incoming health trajectory '+map+depth+id);if(state.auto.kills===1)ok(f.round===m.rounds,'same kill rounds');ordinary.push(m.rounds);
 }
 const boss=manual(map,depth,'wolfking'),guardian=manual(map,depth,'construct');ok(boss.win&&boss.pills<=3,'boss with bounded supplies '+map+depth);ok(guardian.win,'guardian with preparation '+map+depth);if(stance==='steady')rows.push({map,depth,normalRounds:ordinary,bossRounds:boss.rounds,bossPills:boss.pills});
 fresh(map,depth,'boar');reference={power:reference.power*1.5,hp:reference.hp*1.5};state.hp=maxHP();const es=qzEnemyStats('boar',depth,true);state.auto={...autoDefaults(),active:true,map,clock:0,useHeal:true,fight:{qzId:'boar',qzDepth:depth,qzPoison:0,hp:es.max,max:es.max,round:0,elite:true,roll:.2}};let eliteTicks=0;while(state.auto.active&&state.auto.fight&&eliteTicks++<120)autoTick(1);ok(state.auto.kills===1,'auto elite possible with bounded supplies '+map+depth+stance);
 const ordinaryStats=qzEnemyStats('wolf',depth),elite=qzEnemyStats('wolf',depth,true);ok(elite.max>ordinaryStats.max&&elite.attack>ordinaryStats.attack,'elite is harder');
}
console.log(JSON.stringify(rows));console.log(checks+' six-region manual-auto progression checks passed');
}
vm.runInContext("("+matrixChecks.toString()+")()",sandbox);
