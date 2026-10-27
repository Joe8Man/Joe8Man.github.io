// Run with: node tests/wardrobe.test.cjs
const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('path').join(__dirname,'..','Xianxia.html'),'utf8');
const code=html.split('<script>').pop().split('</script>')[0].split('\ninitPageArt();')[0];
const element={innerHTML:'',value:'測試修士',style:{},dataset:{},addEventListener(){},classList:{contains(){return false},add(){},remove(){}},querySelectorAll(){return []},querySelector(){return element}};
const sandbox={console,Math,Date,JSON,Number,Object,Array,Set,String,document:{getElementById(){return element},querySelector(){return element},querySelectorAll(){return []},addEventListener(){}},window:{addEventListener(){}},setTimeout(){},clearTimeout(){},setInterval(){},localStorage:{getItem(){return null},setItem(){}},performance:{now(){return 0}}};
vm.createContext(sandbox);vm.runInContext(code,sandbox);
vm.runInContext(`
let tests=0;function check(x,msg){if(!x)throw Error(msg);tests++}
renderAll=()=>{};save=()=>{saved++};toast=()=>{};log=()=>{};let locked='',saved=0;actionLock=()=>locked;
state={sect:0,rank:0,contribution:5000,wardrobe:wardrobeDefaults()};
check(Object.keys(ROBES).length===30,'30 outfits');
const outer='sect-0-robe-0',elder='sect-0-robe-3';
const before=state.contribution;buyRobe(elder);check(state.contribution===before&&state.wardrobe.owned.length===0,'rank blocks purchase');
buyRobe('sect-1-robe-0');check(state.contribution===before,'other sect blocked');
state.contribution=119;buyRobe(outer);check(state.contribution===119,'insufficient contribution blocked');
state.contribution=120;buyRobe(outer);check(state.contribution===0&&state.wardrobe.owned.includes(outer),'exact contribution deducted');
state.contribution=1000;buyRobe(outer);check(state.contribution===1000&&state.wardrobe.owned.length===1,'duplicate blocked');
wearRobe(elder);check(currentOutfit()===null,'unowned blocked');
wearRobe(outer);check(currentOutfit().id===outer,'wear');
const base=heroLayers('male',null),male=heroLayers('male'),female=heroLayers('female');
check(!base.includes('feColorMatrix')&&!male.includes('<filter')&&female.includes('wardrobe-v4/'),'default and both genders');
check(qingzhouHero().includes('wardrobe-v4/'),'combat uses robe');
wearRobe('default');check(currentOutfit()===null&&state.wardrobe.owned.includes(outer),'unequip retains collection');
state.rank=4;state.contribution=10000;buyRobe(elder);wearRobe(elder);check(currentOutfit().id===elder,'higher rank purchases lower');
locked='戰鬥中';const gold=state.contribution;buyRobe('sect-0-robe-4');wearRobe('default');check(state.contribution===gold&&currentOutfit().id===elder,'combat lock');locked='';
state.rank=0;check(currentOutfit()===null,'demotion hides high rank robe');state.rank=4;state.sect=null;check(currentOutfit()===null,'sectless default');state.sect=1;check(currentOutfit()===null,'different sect default');
check(validWardrobe(state.wardrobe),'valid wardrobe');check(!validWardrobe({owned:[outer,outer],equipped:null}),'duplicate save rejected');check(!validWardrobe({owned:['__proto__'],equipped:null}),'unknown save rejected');check(!validWardrobe({owned:[],equipped:outer}),'unowned equip rejected');
const round=JSON.parse(JSON.stringify(state.wardrobe));check(validWardrobe(round)&&round.equipped===elder,'wardrobe serializes');
draft={root:0,body:0,stats:[10,10,10,10,10,10]};state=initial();check(validSave(state),'new full save valid');const legacy=JSON.parse(JSON.stringify(state));delete legacy.wardrobe;check(validSave(legacy),'legacy full save accepted');const upgraded=migrateSave(legacy);check(validWardrobe(upgraded.wardrobe)&&upgraded.wardrobe.equipped===null,'legacy migration');state.wardrobe.owned=['bad'];check(!validSave(state),'invalid wardrobe rejects full save');
for(let sect=0;sect<6;sect++)for(let rank=0;rank<5;rank++){
 const id='sect-'+sect+'-robe-'+rank;state={sect,rank,contribution:ROBE_PRICES[rank],wardrobe:wardrobeDefaults()};buyRobe(id);wearRobe(id);
 check(state.contribution===0&&currentOutfit()?.id===id,'every sect and rank can purchase and wear');
 for(const gender of ['male','female']){const layer=heroLayers(gender);check(!layer.includes('stroke=')&&layer.includes('wardrobe-v4/'),'every gender omits the artificial chest emblem');check(!layer.includes('<filter'),'sect artwork has no runtime recoloring');const preview=wardrobePreview(currentOutfit());check(!preview.includes('<filter')&&preview.match(/<image /g).length===1&&preview.includes('-previews.webp'),'wardrobe preview uses one cached image without live filters');check(layer.includes('-crop')&&layer.includes('cell')||layer.includes('<path d='),'sprite clipped within own cell to prevent neighbors bleeding');check(sanctuaryCharacter(gender).includes('data-costume-pose="4"')&&sanctuaryCharacter(gender).includes(id),'sanctuary uses equipped rank and seated pose');check(costumeSVG(gender,currentOutfit()).includes('viewBox="'+robeCell(gender,currentOutfit()).join(' ')+'"'),'rank selects its own sprite region');check(SECT_COSTUMES[sect][gender][rank].length===5,'all five poses exist')}
}
state={sect:null,rank:0,wardrobe:wardrobeDefaults()};check(sanctuaryCharacter('female').includes('female-meditator.webp'),'sectless female retains original meditation art');check(sanctuaryCharacter('male').includes('pages-v1/meditator.webp'),'sectless male retains original meditation art');
console.log(tests+' wardrobe behavior and save checks passed');
`,sandbox);
new vm.Script(html.split('<script>').pop().split('</script>')[0]);
