// Run with: node tests/qingzhou.test.cjs
// Run with: node tests/world-map.test.cjs
const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('path').join(__dirname,'..','Xianxia.html'),'utf8');
const code=html.split('<script>').pop().split('</script>')[0].split('\ninitPageArt();')[0];
const element={innerHTML:'',value:'測試修士',style:{},dataset:{},addEventListener(){},classList:{contains(){return false},add(){},remove(){},toggle(){}},querySelectorAll(){return []},querySelector(){return element}};
const sandbox={console,Math,Date,JSON,Number,Object,Array,Set,String,document:{getElementById(){return element},querySelector(){return element},querySelectorAll(){return []},addEventListener(){}},window:{addEventListener(){}},setTimeout(){},clearTimeout(){},setInterval(){},localStorage:{getItem(){return null},setItem(){}},performance:{now(){return 0}}};
vm.createContext(sandbox);vm.runInContext(code,sandbox);
function pacingChecks(){
let checks=0;function ok(v,m){if(!v)throw Error(m);checks++}
renderAll=()=>{};renderHUD=()=>{};save=()=>{};log=()=>{};toast=()=>{};checkCeremony=()=>{};closeModal=()=>{};showModal=()=>{};
function fresh(high=false){draft={root:high?5:0,body:high?4:0,stats:Array(6).fill(high?20:10)};state=initial();combat=null;state.artifact.unlocked=true;state.foundation='unformed';state.hp=maxHP()}
fresh();const base=rate(false);state.boostUntil=Date.now()+60000;ok(Math.abs(rate()/base-2)<1e-9,'array exactly x2');state.boostUntil=0;
state.martial.known.wildsword=2;state.stage=8;state.xp=1e10;const before=state.realm;ascend('mortal');ok(state.realm===before&&state.xp===1e10,'xp alone insufficient');
state.qingzhou.clears=[2,1,0];state.martial.known.wildstep=2;state.training.body=2;state.training.soul=2;state.ownedGear=['0-weapon'];solo().forge['0-weapon']=1;Object.assign(state.materials,{crystal:8,insight:4,fragment:4});
ok(breakthroughChecks().checks.every(x=>x.ok),'achievable independent foundation path');ok(!breakthroughChecks('heaven').checks.every(x=>x.ok),'heaven has extra requirements');
const old=snapshot(),copy=migrateSave(old);ok(copy.realm===old.realm&&copy.stage===old.stage&&copy.xp===old.xp,'migration preserves progress');
const random=Math.random;Math.random=()=>0;ascend('mortal');Math.random=random;ok(state.realm===1&&state.stage===0&&state.materials.crystal===0&&state.materials.insight===0&&state.materials.fragment===0,'success deducts exact requirements');ok(state.xp>0,'overflow retained');
for(let realm=0;realm<REALMS.length;realm++){fresh();state.realm=realm;state.foundation=realm?'mortal':'unformed';state.stage=8;ok(Number.isFinite(needXP())&&Number.isFinite(rate(false)),'finite pacing all realms');ok(breakthroughChecks().checks.some(c=>!c.ok),'xp cannot bypass realm preparation');const a=rate(false);state.book=true;state.sect=1;state.artifact.level=20;state.training.soul=20;const b=rate(false);ok(b/a<4,'stacking bounded');}
// Income-only upper-bound simulation: all non-XP preparation is assumed already complete.
// Once-daily 2h offline reward, session uptime, one click/sec for half session,
// and 5 ordinary kills/min. No boost, pills or rare events; faster builds separately.
for(const high of [false,true])for(const minutes of [30,60]){fresh(high);let day=0;const reached={};while(day<60&&state.realm<5){day++;const income=rate(false)*(7200+minutes*60)+gatherValue()*minutes*30+expeditionXP(Math.min(state.realm,5))*minutes*5;state.xp+=income;for(let i=0;i<30&&state.xp>=needXP();i++){state.xp-=needXP();if(state.stage>=8){state.realm++;state.stage=0;state.foundation='mortal';reached[state.realm]=day;if(state.realm>=5)break}else state.stage++}}console.log(JSON.stringify({build:high?'high aptitude':'ordinary',minutes,firstFoundation:reached[1],firstCore:reached[2],firstNascent:reached[3],atDay60:state.realm}));ok((reached[4]||61)>3,'no late game in three days');ok((reached[3]||61)>7,'multiweek core progression');}
fresh();const value=expeditionXP(0);state.realm=9;state.stage=8;ok(expeditionXP(0)===value,'low area XP fixed despite higher requirements');ok(gatherValue()<=Math.ceil(rate(false)),'click income bounded');
console.log(checks+' long-term progression and breakthrough checks passed');
}
vm.runInContext("("+pacingChecks.toString()+")()",sandbox);
