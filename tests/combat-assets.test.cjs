const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
(async()=>{
 const art=await import('../assets/engine/combat-assets.js');let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++;};
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/combat-v1/manifest.json')));
 ok(manifest.sheets.length===19,'battle atlas pack includes all six sects, regions and bosses');
 for(const sheet of manifest.sheets){const file=path.join(__dirname,'../assets/combat-v1',sheet.file),{data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});ok(info.width===1024&&info.height===1024,'power-of-two mobile texture: '+sheet.name);
  for(let frame=0;frame<16;frame++){const x=frame%4*256,y=Math.floor(frame/4)*256;let count=0;for(let iy=y+16;iy<y+240;iy++)for(let ix=x+16;ix<x+240;ix++)if(data[(iy*1024+ix)*4+3]>40)count++;ok(count>100,'frame has visible art: '+sheet.name+'/'+frame);for(const [dx,dy] of [[0,0],[255,0],[0,255],[255,255]])ok(data[((y+dy)*1024+x+dx)*4+3]===0,'transparent cell corner: '+sheet.name+'/'+frame);}
 }
 for(let map=0;map<6;map++)for(const id of art.SPECIES){const ref=art.mobArt({map},{id});ok(art.SHEETS.includes(ref.sheet)&&ref.first>=0&&ref.first+ref.count<=16,'regional enemy resolves within atlas');}
 for(const id of Object.keys(art.BOSS_ROWS)){const profile={worldBoss:{id}},ref=art.mobArt(profile,{id:'worldboss'});ok(art.combatSheets(profile).includes(ref.sheet),'boss loads the same atlas its renderer uses');}
 ok(art.mobArt({map:0},{id:'cultivator'})===null,'named NPC appearance retains its own rig');
 for(let role=0;role<4;role++)ok(art.mobArt({territory:{}},{id:'cultivator',artRole:role}).first===role*4,'resource enemy archetype has own row');
 for(let sect=0;sect<6;sect++)for(let rank=0;rank<5;rank++){const outfit_id=`sect-${sect}-robe-${rank}`,sheet=art.sectCombatSheet(outfit_id),profile={appearance:{gender:'female',outfit_id}};ok(sheet===`sect-combat-${art.SECT_COMBAT[sect]}`&&art.combatSheets(profile).includes(sheet),'every rank maps to its sect representative battle atlas');}
 let lookedUp='';const unavailable=art.makeAtlasRig({textures:{exists(k){lookedUp=k;return false}}},{profile:{gender:'female',outfit_id:'sect-3-robe-4'}},0,0,1,false,()=>{});ok(unavailable===null&&lookedUp==='combat-sect-combat-ice','missing representative art falls back to existing rank-specific robe frames');
 ok(art.combatSheets({appearance:{outfit_id:'sect-0-robe-4'},opponent:{appearance:{outfit_id:'sect-3-robe-1'}}}).includes('sect-combat-ice'),'opponent sect atlas is loaded');
 const queued=[],textures={exists:k=>k==='combat-monsters-qingzhou'},scene={textures,load:{image:(k,url)=>queued.push({k,url})}};art.preloadCombatArt(scene,{map:0});ok(!queued.some(x=>x.k==='combat-monsters-qingzhou'),'already loaded atlases are reused');ok(queued.every(x=>x.url.includes(art.COMBAT_ART_VERSION)),'new asset URLs have cache version');
 console.log(checks+' atlas completeness, transparency, region/boss routing, clothing and cache checks passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
