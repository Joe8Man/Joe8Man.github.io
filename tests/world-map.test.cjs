// Run with: node tests/world-map.test.cjs
const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('path').join(__dirname,'..','Xianxia.html'),'utf8');
const code=html.split('<script>').pop().split('</script>')[0].split('\ninitPageArt();')[0];
const element={innerHTML:'',value:'測試修士',style:{},dataset:{},addEventListener(){},classList:{contains(){return false},add(){},remove(){}},querySelectorAll(){return []},querySelector(){return element}};
const sandbox={console,Math,Date,JSON,Number,Object,Array,Set,String,document:{getElementById(){return element},querySelector(){return element},querySelectorAll(){return []},addEventListener(){}},window:{addEventListener(){}},setTimeout(){},clearTimeout(){},setInterval(){},localStorage:{getItem(){return null},setItem(){}},performance:{now(){return 0}}};
vm.createContext(sandbox);vm.runInContext(code,sandbox);
vm.runInContext(`
let checks=0,saves=0,rendered=0,simPower=200;function check(x,msg){if(!x)throw Error(msg);checks++}
const els=new Map();document.getElementById=id=>{if(!els.has(id))els.set(id,{value:'測試修士',innerHTML:'',children:[{}],textContent:'',classList:{toggle(){}},scrollIntoView(){},style:{},dataset:{}});return els.get(id)};document.querySelector=()=>({focus(){}});
renderAll=()=>{renderMap()};renderAuto=()=>{rendered++};save=()=>{saves++};toast=()=>{};power=()=>simPower;
draft={root:0,body:0,stats:[10,10,10,10,10,10]};state=initial();state.hp=maxHP();state.steps=5;
renderMap();check(selectedRegion===0&&!mapSceneOpen,'opens map at actual location');
check((atlasLandmarks().match(/data-atlas-region=/g)||[]).length===6,'all six regions browseable');
const progress=JSON.stringify(state.journey.progress);selectAtlasRegion(5);check(selectedRegion===5&&state.location===0&&state.steps===5&&saves===0,'browsing locked land consumes nothing and does not move');
check(atlasRegionCard(5).includes('disabled')&&atlasRegionCard(5).includes(REALMS[4]),'locked destination explains requirements');
travel(5);check(state.location===0&&state.steps===5,'locked travel is rejected');
selectAtlasRegion(1);travel(1);check(state.location===0&&state.steps===5,'power gate rejected at action time');
simPower=600;travel(1);check(state.location===1&&state.steps===4&&selectedRegion===1&&mapSceneOpen,'travel costs one step and opens scene');check(JSON.stringify(state.journey.progress)===progress,'travel preserves each route');
travel(1);check(state.steps===4,'reentering current place never charges');
returnToAtlas();check(!mapSceneOpen&&selectedRegion===1,'return shows actual location');enterRegionScene(1);check(mapSceneOpen&&state.steps===4&&rendered===1,'enter current scene costs no energy');
returnToAtlas();enterRegionScene(0);check(!mapSceneOpen&&state.location===1,'cannot enter a remote scene without travel');
state.steps=0;simPower=100000;state.realm=4;travel(2);check(state.location===1&&state.steps===0,'no energy blocks travel');
state.steps=5;state.journey.pending={map:1,kind:0};selectAtlasRegion(2);travel(2);check(state.location===1&&state.steps===5&&selectedRegion===2,'pending event permits browsing but prevents travel');
state.journey.pending=null;state.auto.active=true;travel(2);check(state.location===1&&state.steps===5,'active auto battle blocks travel');returnToAtlas();check(state.auto.active&&!mapSceneOpen,'returning to map does not stop auto activity');
state.auto.active=false;state.realm=0;simPower=100000;travel(2);check(state.location===1,'realm gate remains enforced despite high power');state.realm=1;travel(2);check(state.location===2&&state.steps===4,'qualified travel succeeds');
const view=mapKey();renderMap();check(mapKey()===view,'stable render key');
state=initial();renderMap();check(selectedRegion===0&&!mapSceneOpen,'new or imported character resets temporary map selection');
console.log(checks+' world-map behavior checks passed');
`,sandbox);
