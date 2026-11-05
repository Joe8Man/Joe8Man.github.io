const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'Xianxia.html'),'utf8');
const element={value:'山海試行',style:{},dataset:{},classList:{add(){},remove(){},toggle(){},contains(){return false}},addEventListener(){},querySelectorAll(){return[]},insertAdjacentHTML(){}};
const context=vm.createContext({console,window:{addEventListener(){},dispatchEvent(){}},document:{getElementById:()=>element,querySelectorAll:()=>[],addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},performance:{now:()=>0},setTimeout(){},setInterval(){},assert});
context.setTestQuantity=n=>{element.value=String(n);};
for(const name of ['boss-core','world-core','territory-core','field-core','territory-combat'])vm.runInContext(fs.readFileSync(path.join(root,'assets','engine',name+'.js'),'utf8'),context);
vm.runInContext(html.split('<script>').pop().split('\ninitPageArt();')[0],context);
vm.runInContext(`
let content='';renderAll=renderHUD=renderMap=renderBattle=log=toast=()=>{};save=()=>{};showModal=(kind,body)=>{modalKind=kind;content=body;};closeModal=()=>{modalKind='';};
draft={root:0,body:0,stats:Array(6).fill(10)};
function fresh(map=0){state=initial();state.location=map;state.realm=5;state.foundation='mortal';state.hp=maxHP();state.stones=100000;state.artifact.unlocked=true;combat=null;fieldSession=null;territorySession=null;shMap=map;worldState().region=map;}
const clone=v=>JSON.parse(JSON.stringify(v));
assert.equal(Object.keys(SH_ITEMS).length,72);
fresh();assert.ok(validSave(snapshot()));assert.ok(window.xianxiaBridge.valid(snapshot()));
const old=snapshot();delete old.shanhai;assert.ok(validSave(old));assert.ok(validSave(migrateSave(old)));
for(let m=0;m<6;m++){
 fresh(m);for(let n=0;n<4;n++)shAdd(m,n,100);
 for(const index of Object.keys(SH_RECIPES).map(Number)){const id=shId(m,index),before=state.stones;assert.ok(shCraft(id));assert.equal(shCount(m,index),1);assert.ok(state.stones<before);}
 const stock=clone(sh().bag);state.stones=0;assert.equal(shCraft(shId(m,5)),false);assert.deepEqual(sh().bag,stock);state.stones=100000;
 const basePower=power(),baseHP=maxHP();assert.ok(shUse(shId(m,7)));assert.equal(power(),Math.round(basePower*(1+(2+m)/100)));assert.ok(shUse(shId(m,8)));assert.equal(maxHP(),Math.round(baseHP*(1+(3+m)/100)));
 assert.equal(shTransfer('supply:'+shId(m,7),'bag',1),false);
 shAdd(m,5,4);const count=shCount(m,5);assert.ok(shTransfer('supply:'+shId(m,5),'bag',3));assert.equal(shCount(m,5),count-3);assert.ok(shTransfer('supply:'+shId(m,5),'warehouse',2));assert.equal(shCount(m,5),count-1);assert.equal(shTransfer('supply:'+shId(m,5),'warehouse',2),false);
 assert.equal(shTransfer('supply:'+shId(m,5),'bag',.5),false);assert.equal(shTransfer('supply:'+shId(m,5),'bag',-1),false);
 const ward=state.items.ward;assert.ok(shUse(shId(m,6)));assert.equal(state.items.ward,ward+1);
 const xp=state.xp;state.hp=maxHP()/2;assert.ok(shUse(shId(m,5)));assert.ok(state.xp-xp<=needXP()*.01+1);assert.ok(state.hp>maxHP()/2);
 mountState().owned.push(MOUNT_IDS[m]);assert.ok(shUse(shId(m,9)));assert.equal(sh().mountCare[m],1);assert.ok(shTransfer('mount:'+MOUNT_IDS[m],'bag',1));assert.ok(!inventoryEntry('mount:'+MOUNT_IDS[m]));assert.ok(shTransfer('mount:'+MOUNT_IDS[m],'warehouse',1));
 assert.ok(shVisit(m));assert.ok(sh().treasure);assert.ok(validSave(snapshot()));assert.ok(shResolve('safe'));const collected=clone(sh().bag);assert.equal(shResolve('safe'),false);assert.deepEqual(sh().bag,collected);
 // Same game date cannot repeat the free visit; a map is consumed exactly once.
 sh().visits[m]=worldState().day;assert.equal(shVisit(m),false);shAdd(m,4);assert.ok(shUse(shId(m,4)));const pending=clone(snapshot());assert.ok(validSave(pending));const roll=sh().treasure.roll;assert.equal(migrateSave(pending).shanhai.treasure.roll,roll);assert.ok(shResolve('risk'));
 for(let k=0;k<12;k++)qzRecordKill('wolf');assert.equal(sh().kills[m],12);assert.ok(shCount(m,4)>=1);for(let other=0;other<6;other++)if(other!==m)assert.equal(sh().kills[other],0);
 assert.equal(shBounty('take'),false);state.sect=m;state.sectProgress=sectProgressDefaults(m);assert.ok(shBounty('take'));assert.equal(shBounty('claim'),false);for(let k=0;k<8;k++)qzRecordKill('wolf');assert.ok(shBounty('claim'));const c=state.contribution;assert.equal(shBounty('claim'),false);assert.equal(state.contribution,c);
 // Unique gear stays reserved, retains forge rank, and cannot be equipped from storage.
 const gear=m+'-weapon';state.ownedGear.push(gear);state.solo.forge[gear]=2;assert.ok(shTransfer('gear:'+gear,'bag',1));assert.ok(!inventoryEntry('gear:'+gear));assert.ok(state.ownedGear.includes(gear));equipGear(gear);assert.notEqual(state.equipment.weapon,gear);assert.ok(shTransfer('gear:'+gear,'warehouse',1));assert.equal(state.solo.forge[gear],2);state.equipment.weapon=gear;assert.equal(shTransfer('gear:'+gear,'bag',1),false);state.equipment.weapon=null;
 state.auto.active=true;assert.equal(shTransfer('item:heal','bag',1),false);assert.equal(shCraft(shId(m,5)),false);state.auto.active=false;
 assert.ok(shTransfer('item:heal','bag',1));assert.ok(shTransfer('material:crystal','bag',1)===false);assert.equal(shTransfer('material:insight','bag',1),false);assert.equal(shTransfer('item:sword','bag',1),false);
 // Three story chapters award once each, at real NPC locations, and survive saves.
 const n=window.XianxiaWorld.npcs.find(n=>n.map===m),w=worldState(),bond=window.XianxiaWorld.bond(w,n.id);w.place=window.XianxiaWorld.npcPlace(n,w);delete w.position;bond.affinity=60;shAdd(m,11,3);
 for(let stage=0;stage<3;stage++){assert.ok(shStory(n.id));assert.equal(sh().stories[n.id],stage+1);}assert.equal(shStory(n.id),false);
 assert.ok(validSave(snapshot()),'complete save region '+m);assert.ok(validSave(migrateSave(snapshot())));
 for(const tab of ['items','craft','travel','bounty','stories','build']){shMenu(tab,m);assert.ok(content.length>100);assert.ok(content.includes(MAPS[m].name));}
 shWarehouse('warehouse');assert.ok(content.includes('洞府倉庫'));
 const bad=clone(snapshot());bad.shanhai.bag[shId(m,0)]=-1;assert.equal(validSave(bad),false);const forged=clone(snapshot());forged.shanhai.warehouse['gear:no-such-gear']=1;assert.equal(validSave(forged),false);
}
fresh();state.hp=maxHP();const f=fieldStart();assert.ok(!f.error);const mob={key:'one',id:'wolf',boss:false};const before=sh().kills[0];assert.ok(f.reward(mob));assert.equal(sh().kills[0],before+1);assert.equal(f.reward(mob),null);assert.equal(sh().kills[0],before+1);assert.ok(fieldLoot().some(t=>t.includes('蒼狼牙')));assert.ok(validSave(snapshot()));fieldStop();
// World-boss duplicate callbacks cannot mint expansion materials.
fresh();state.realm=10;state.stage=1;state.foundation='heaven';state.hp=maxHP();const boss=window.XianxiaBosses.catalog[0],config=fieldStart({mode:'worldboss',boss:boss.id});assert.ok(!config.error);assert.ok(config.reward({key:'boss',id:'worldboss',boss:true}));const wins=sh().kills[0];assert.equal(config.reward({key:'boss2',id:'worldboss',boss:true}),null);assert.equal(sh().kills[0],wins);assert.ok(fieldLoot().some(t=>t.includes('竹心髓')));fieldStop();

// Resource stones act on the matching holding and obey raid and level limits.
for(let map=0;map<6;map++){
 fresh(map);state.sect=map;state.sectProgress=sectProgressDefaults(map);territoryUpdate();const T=window.XianxiaTerritories,t=territoryState(),site=T.catalog[map];T.capture(t,site.id,Date.now());shAdd(map,10,3);assert.ok(shUse(shId(map,10)));assert.equal(t.sites[site.id].ward,1);t.sites[site.id].attack=Date.now();assert.equal(shUse(shId(map,10)),undefined);assert.equal(shCount(map,10),2);t.sites[site.id].attack=0;t.sites[site.id].ward=10;shUse(shId(map,10));assert.equal(shCount(map,10),2);
}
// Confirmed trading is single-use and handles a stale stock count safely.
fresh();shAdd(0,0,4);modalKind='shItem';

sh().bag[shId(0,0)]=4;setTestQuantity(2);assert.ok(shAskTrade(shId(0,0),'sell'));const tradeToken=shTrade.token,oldGold=state.stones;assert.ok(shSettleTrade(tradeToken));assert.equal(shCount(0,0),2);assert.equal(state.stones,oldGold+20);assert.equal(shSettleTrade(tradeToken),false);modalKind='shItem';setTestQuantity(1);assert.ok(shAskTrade(shId(0,0),'discard'));assert.ok(shSettleTrade(shTrade.token));assert.equal(shCount(0,0),1);assert.equal(state.stones,oldGold+20);
console.log('Six-region crafting, 72 items, warehouse invariants, save migration, rune effects, treasure, bounties, stories, field and boss idempotency passed');
`,context);
for(const name of ['bamboo','marsh','sea','snow','nether','heaven']){const b=fs.readFileSync(path.join(root,'assets','expansion-v1','transparent',name+'.webp'));assert.ok(b.length>1000);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.readUInt32LE(4)+8,b.length);assert.equal(b.toString('ascii',12,16),'VP8X');assert.ok(b[20]&0x10,'alpha channel is required');}
for(let m=0;m<6;m++)for(let i=0;i<12;i++){const icon=vm.runInContext(`shIcon('sh-${m}-${i}')`,context);assert.match(icon,/transparent\/.*\.webp/);assert.match(icon,/<svg/);assert.ok(!icon.includes('items/sh-'));}
assert.match(html,/border-radius:12px;background:transparent}\.sh-tabs/);
console.log('Six transparent atlas headers, 72 clipped icon references, and transparent CSS checks passed');
