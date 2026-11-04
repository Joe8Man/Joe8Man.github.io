// Shared generated battle atlases. Old illustrations remain the loading fallback.
export const COMBAT_ART_VERSION='20261103c';
export const REGIONS=['qingzhou','marsh','sea','snow','nether','heaven'];
export const SECT_COMBAT=['sword','academy','demon','ice','beast','pill'];
export const IDLE_ART_VERSION='20261104';
export function sectCombatSheet(outfitId){const match=/^sect-([0-5])-robe-[0-4]$/.exec(outfitId||'');return match?'sect-combat-'+SECT_COMBAT[Number(match[1])]:null;}
export const SPECIES=['wolf','bee','boar','serpent','ape','construct','wolfking'];
export const BOSS_ROWS={verdant:[0,0],marsh:[0,1],abyss:[0,2],frost:[1,0],nether:[1,1],heaven:[1,2]};
export const SHEETS=['hero-male','hero-female','human-enemies','effects-sword-arcane-ice','effects-blood-beast-pill',...REGIONS.map(r=>'monsters-'+r),'bosses-verdant-marsh-abyss','bosses-frost-nether-heaven',...SECT_COMBAT.map(s=>'sect-combat-'+s)];
const effectCells={slash:[0,0],sword:[0,1],swords:[0,3],combo:[0,0],leaves:[0,2],wind:[0,14],lightning:[0,4],guard:[0,6],stone:[1,12],frost:[0,8],freeze:[0,10],palm:[0,12],break:[0,12],drain:[1,0],flame:[1,2],claw:[1,5],summon:[1,4],poison:[1,8],vines:[1,9],heal:[1,10],blossom:[1,11],blood:[1,0],ice:[0,9],thunder:[0,4],beast:[1,7],enemy:[1,14]};
const FX_SHEETS=['effects-sword-arcane-ice','effects-blood-beast-pill'];
const still=()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
export function sheetURL(name){return 'assets/combat-v1/'+name+'.webp?v='+COMBAT_ART_VERSION;}
export function combatSheets(profile={}){const names=['hero-male','hero-female',...FX_SHEETS,'monsters-'+(REGIONS[profile.map]||REGIONS[0])];for(const outfitId of [profile.appearance?.outfit_id,profile.opponent?.appearance?.outfit_id]){const sheet=sectCombatSheet(outfitId);if(sheet&&!names.includes(sheet))names.push(sheet);}if(profile.territory)names.push('human-enemies');if(profile.worldBoss){const row=BOSS_ROWS[profile.worldBoss.id];if(row)names.push(row[0]===0?'bosses-verdant-marsh-abyss':'bosses-frost-nether-heaven');}return names;}
export function preloadCombatArt(scene,profile){for(const name of combatSheets(profile))if(!scene.textures.exists('combat-'+name))scene.load.image('combat-'+name,sheetURL(name));for(const appearance of [profile.appearance,profile.opponent?.appearance]){const outfit=sectCombatSheet(appearance?.outfit_id),idleName=outfit?outfit.slice('sect-combat-'.length):'plain';if(!scene.textures.exists('combat-idle-'+idleName))scene.load.image('combat-idle-'+idleName,'assets/map-idle/'+idleName+'.webp?v='+IDLE_ART_VERSION);}}
export function registerCombatFrames(scene){for(const name of [...SHEETS,...['plain',...SECT_COMBAT].map(s=>'idle-'+s)]){const key='combat-'+name;if(!scene.textures.exists(key))continue;const texture=scene.textures.get(key);if(texture.has('0'))continue;const image=texture.getSourceImage();const idle=name.startsWith('idle-'),count=idle?2:16,cols=idle?2:4,rows=idle?1:4;for(let i=0;i<count;i++){const x=Math.round((i%cols)*image.width/cols),y=Math.round(Math.floor(i/cols)*image.height/rows),right=Math.round((i%cols+1)*image.width/cols),bottom=Math.round((Math.floor(i/cols)+1)*image.height/rows);texture.add(String(i),0,x,y,right-x,bottom-y);}}}
export function monsterCell(id){const i=SPECIES.indexOf(id);return i<0?null:i*2;}
export function mobArt(profile,mob){
 if(profile.territory&&mob.id==='cultivator'&&mob.role!=='防禦大陣')return {sheet:'human-enemies',first:(mob.artRole??3)*4,count:4};
 if(mob.id==='worldboss'){const row=BOSS_ROWS[profile.worldBoss?.id];return row?{sheet:row[0]===0?'bosses-verdant-marsh-abyss':'bosses-frost-nether-heaven',first:row[1]*4,count:4}:null;}
 const first=monsterCell(mob.id);return first===null?null:{sheet:'monsters-'+(REGIONS[profile.map]||REGIONS[0]),first,count:2};
}
export function makeMobArt(scene,profile,mob,size=82){const ref=mobArt(profile,mob);if(!ref||!scene.textures.exists('combat-'+ref.sheet))return null;const node=scene.add.image(0,0,'combat-'+ref.sheet,String(ref.first)).setOrigin(.5,.94).setDisplaySize(size,size);node.combatArt=ref;return node;}
export function updateMobArt(node,mob,time){const ref=node?.combatArt;if(!ref)return;const attacking=!!mob.windup||mob.chargeUntil>time;const offset=ref.count===2?(attacking?1:0):attacking?(mob.chargeUntil>time?3:2):Math.floor(time*5)%4===1?1:0;node.setFrame(String(ref.first+offset));}
export function makeAtlasRig(scene,rig,x,y,scale,flip,shadowFactory){
 const gender=rig.profile?.gender==='female'?'female':'male',sectSheet=sectCombatSheet(rig.profile?.outfit_id),key='combat-'+(sectSheet||'hero-'+gender),base=gender==='female'?8:0;
 if(!scene.textures.exists(key))return null;
 const idleKey='combat-idle-'+(sectSheet?sectSheet.slice('sect-combat-'.length):'plain'),idleFrame=gender==='female'?'1':'0';const root=scene.add.container(x,y).setScale(flip?-scale:scale,scale),body=scene.add.image(0,0,idleKey,idleFrame).setOrigin(.5,.94).setDisplaySize(260,260);root.add([shadowFactory(scene,0,-3,95,16),body]);
 let moving=false,action=null,until=0,started=0,dead=false;const reduced=still();
 const sequences=sectSheet?{slash:[base+4,base+5,base+6,base+7],sword:[base+4,base+5,base+6,base+7],combo:[base+5,base+6,base+5,base+6,base+7],cast:[base+4,base+5,base+6,base+7],palm:[base+4,base+5,base+6,base+7],guard:[base+4],stone:[base+4],heal:[base+4,base+5,base+7],hurt:[base+7],fallen:[base+7]}:{slash:[4,5,6,7],sword:[4,5,6,7],combo:[5,6,5,6,5,6,7],claw:[5,6,7],wind:[5,6,7],leaves:[5,6,7],flame:[5,6,7],break:[5,6,7],palm:[8,9,10,11],cast:[8,9,10,11],guard:[13],stone:[13],heal:[8,9,10,11],blossom:[8,9,10,11],hurt:[14],fallen:[15]};
 const walking=sectSheet?[base,base+1,base+2,base+3]:[0,1,2,3],standing=sectSheet?[base]:[12];
 function update(){if(dead)return;const now=scene.time.now;if(action&&now>=until)action=null;const seq=action?sequences[action]||sequences.cast:moving?walking:standing;const index=reduced?0:action?Math.min(seq.length-1,Math.floor((now-started)/(until-started)*seq.length)):Math.floor(now/130)%seq.length;if(!action&&!moving){if(body.texture.key!==idleKey)body.setTexture(idleKey,idleFrame);}else{if(body.texture.key!==key)body.setTexture(key,String(seq[index]));body.setFrame(String(seq[index]));}body.setDisplaySize(260,260);}
 function perform(family='slash',{interrupt=false}={}){if(action&&!interrupt)return;action=family;started=scene.time.now;until=family==='fallen'?Infinity:started+(family==='combo'?650:['guard','heal','cast','stone','blossom'].includes(family)?650:440);update();}
 const flash=color=>{body.setTint(color||0xffe4c7);scene.time.delayedCall(80,()=>{if(body.active)body.clearTint();});};
 scene.events.on('update',update);root.once('destroy',()=>{dead=true;scene.events.off('update',update);});
 return {root,perform,flash,cast(){perform('cast');},setWalk(v){moving=!!v;update();},face(right){root.scaleX=Math.abs(root.scaleX)*(right?1:-1);},attack(){perform('slash');},guard(){perform('guard');},hit(){perform('hurt',{interrupt:true});flash();},destroy(){root.destroy(true);}};
}
export function combatEffect(scene,family,x,y,{size=130,angle=0,duration=420,depth=700,alpha=.9}={}){
 const cell=effectCells[family]||effectCells.slash,key='combat-'+FX_SHEETS[cell[0]];if(!scene.textures.exists(key))return null;
 // Cap decorative sprites so dense resource battles do not create unbounded VFX.
 scene._combatEffects=scene._combatEffects||new Set();if(scene._combatEffects.size>=32)return null;
 const node=scene.add.image(x,y,key,String(cell[1])).setDisplaySize(size,size).setRotation(angle).setDepth(depth).setAlpha(alpha);scene._combatEffects.add(node);node.once('destroy',()=>scene._combatEffects.delete(node));
 scene.tweens.add({targets:node,alpha:0,scaleX:node.scaleX*(still()?1:1.15),scaleY:node.scaleY*(still()?1:1.15),duration,onComplete:()=>node.destroy()});return node;
}
export function projectileArt(scene,effect,size){const cell=effectCells[effect]||effectCells.sword,key='combat-'+FX_SHEETS[cell[0]];if(!scene.textures.exists(key))return null;return scene.add.image(0,0,key,String(cell[1])).setDisplaySize(size,size).setDepth(500);}
export function enemyProjectileArt(scene,profile,size=42){const row=BOSS_ROWS[profile.worldBoss?.id],sheet=row?(row[0]===0?'bosses-verdant-marsh-abyss':'bosses-frost-nether-heaven'):'monsters-'+(REGIONS[profile.map]||REGIONS[0]),frame=row?12+row[1]:15,key='combat-'+sheet;if(profile.territory)return projectileArt(scene,'enemy',size);if(!scene.textures.exists(key))return null;return scene.add.image(0,0,key,String(frame)).setDisplaySize(size,size).setDepth(500);}
