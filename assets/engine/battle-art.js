// Painted light, restrained atmosphere and a separate visual language for each art.
// Presentation is independent from combat calculations.
const PALETTES={jade:[0xaee9d1,0xf2ffe9],gold:[0xe1b974,0xfff2c9],ice:[0x78c9ed,0xe8fbff],violet:[0xb49be9,0xf1e8ff],venom:[0x9dbb68,0xe1f2a0],blood:[0xc95c75,0xffd4b6],water:[0x6fcec9,0xddfff0]};
const STYLES={
 normal:['slash','jade','斬','普通攻擊'],edge:['sword','jade','劍','青鋒劍法'],fallenleaf:['leaves','gold','葉','落葉劍譜'],cloud:['combo','jade','雲','流雲連斬'],void:['swords','gold','御','太虛御劍'],windblade:['wind','jade','風','逐風刀訣'],
 rockfist:['palm','gold','拳','碎岩拳'],wildstrike:['palm','gold','掌','裂石掌'],riverpalm:['drain','water','潮','碧潮回生掌'],drain:['drain','blood','噬','噬血掌'],burn:['flame','blood','焰','燃血魔刃'],
 thunder:['lightning','violet','雷','掌心雷'],thunderfinger:['lightning','ice','霆','驚雷指譜'],frost:['frost','ice','霜','霜華劍氣'],freeze:['freeze','ice','冰','千里冰封'],
 poison:['poison','venom','毒','蝕骨毒霧'],herbpoison:['vines','venom','藤','青藤毒經'],claw:['claw','gold','爪','裂空獸爪'],summon:['summon','jade','靈','山海共鳴'],
 guard:['guard','jade','御','護體'],stoneguard:['stone','gold','磐','磐石護身訣'],aegis:['guard','violet','盾','洞玄靈盾'],
 heal:['heal','jade','丹','回春丹'],mend:['heal','jade','元','回元術'],wildheal:['heal','gold','息','歸元養氣訣'],elixir:['blossom','jade','春','丹霞回春術'],break:['break','gold','破','破招']
};
export function techniqueStyle(id,type){const fallback={guard:'guard',heal:'mend',poison:'poison',frost:'frost',freeze:'freeze',drain:'drain',burn:'burn',summon:'summon'}[type]||'normal';const [family,palette,seal,name]=STYLES[id]||STYLES[fallback];return {id,family,palette,seal,name,colors:PALETTES[palette],self:['guard','stone','heal','blossom'].includes(family),melee:['slash','sword','leaves','combo','wind','flame','claw','break'].includes(family)};}
const reducedMotion=()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
function fade(scene,node,duration=500,props={}){scene.tweens.add({targets:node,alpha:0,duration,...props,onComplete:()=>node.destroy()});return node;}
function graphic(scene,depth=22){return scene.add.graphics().setDepth(depth);}
function path(g,points,color,width=2,alpha=1){g.lineStyle(width,color,alpha);g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.strokePath();}
function arcPoints(x,y,rx,ry,start,end,angle=0){return Array.from({length:35},(_,i)=>{const a=start+(end-start)*i/34,px=Math.cos(a)*rx,py=Math.sin(a)*ry;return [x+px*Math.cos(angle)-py*Math.sin(angle),y+px*Math.sin(angle)+py*Math.cos(angle)];});}
function bezier(a,b,c){return Array.from({length:29},(_,i)=>{const t=i/28,u=1-t;return [u*u*a[0]+2*u*t*b[0]+t*t*c[0],u*u*a[1]+2*u*t*b[1]+t*t*c[1]];});}
function glowTexture(scene){const key='battle-soft-light-v1';if(!scene.textures.exists(key)){const texture=scene.textures.createCanvas(key,128,128),ctx=texture.context,gradient=ctx.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(255,255,255,.65)');gradient.addColorStop(.3,'rgba(255,255,255,.24)');gradient.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);texture.refresh();}return key;}
function glow(scene,x,y,color,size=100,alpha=.5,duration=500){const node=scene.add.image(x,y,glowTexture(scene)).setTint(color).setDisplaySize(size,size).setAlpha(alpha).setDepth(18);return fade(scene,node,duration,{scaleX:node.scaleX*1.4,scaleY:node.scaleY*1.4});}
function sparks(scene,x,y,color,count=14,radius=90){for(let i=0;i<count;i++){const a=i/count*Math.PI*2+.27,r=radius*(.45+(i%4)*.16),node=scene.add.circle(x,y,i%3===0?2:1,color,.9).setDepth(25);fade(scene,node,380+i%4*70,{x:x+Math.cos(a)*r,y:y+Math.sin(a)*r*.7,ease:'Cubic.easeOut'});}}
function ring(scene,x,y,color,rx=65,ry=25,duration=650){const g=graphic(scene,18);g.lineStyle(1.4,color,.65);g.strokeEllipse(0,0,rx*2,ry*2);g.setPosition(x,y).setScale(.7);return fade(scene,g,duration,{scaleX:1.35,scaleY:1.35});}
function crescent(scene,x,y,color,angle=-.65,radius=95){const g=graphic(scene),points=arcPoints(0,0,radius,radius*.4,-2.6,.85,angle);path(g,points,color,18,.065);path(g,points,color,8,.2);path(g,points,0xf4fff2,2.5,.95);g.setPosition(x,y).setScale(.65);fade(scene,g,440,{scaleX:1.2,scaleY:1.2,x:x+26});}
function rune(scene,x,y,color){const g=graphic(scene,17);g.lineStyle(1,color,.45);g.strokeEllipse(0,0,126,40);g.strokeEllipse(0,0,100,30);for(let i=0;i<8;i++){const a=i*Math.PI/4;path(g,[[Math.cos(a)*55,Math.sin(a)*17],[Math.cos(a)*66,Math.sin(a)*22]],color,2,.7);}g.setPosition(x,y);fade(scene,g,750,{scaleX:1.15,scaleY:1.15});}
function blade(scene,x,y,color,rotation=0){const g=graphic(scene);g.fillStyle(color,.15);g.fillTriangle(-10,24,0,-93,10,24);path(g,[[0,34],[0,-87]],color,5,.75);path(g,[[0,25],[0,-78]],0xfffbe3,1.5);path(g,[[-11,23],[11,23]],color,3);g.setPosition(x,y).setRotation(rotation);return g;}
function bolt(scene,x,y,color,offset=0){const points=Array.from({length:9},(_,i)=>[x+offset+(i===8?0:Math.sin(i*9.3+offset)*24),35+i*(y-35)/8]);const g=graphic(scene);path(g,points,color,16,.08);path(g,points,color,6,.4);path(g,points,0xf6f4ff,2.4);for(let i=3;i<7;i+=2)path(g,[points[i],[points[i][0]+35,points[i][1]+10],[points[i][0]+22,points[i][1]+32]],color,1.4,.8);fade(scene,g,260);glow(scene,x,y,color,150,.6,380);}
function shards(scene,x,y,color,frozen=false){for(let i=0;i<(frozen?8:5);i++){const g=graphic(scene,19),height=45+(i%3)*27;g.fillStyle(color,.18);g.fillTriangle(-10,0,0,-height,12,0);path(g,[[-10,0],[0,-height],[12,0]],0xdffaff,1,.8);path(g,[[0,-height],[2,-4]],color,1,.6);g.setPosition(x-66+i*19,y+18+Math.sin(i)*8).setScale(1,.1);scene.tweens.add({targets:g,scaleY:1,duration:260,delay:i*38,ease:'Cubic.easeOut'});fade(scene,g,frozen?1050:700,{delay:250});}}
function leafBurst(scene,x,y,color,count=12){for(let i=0;i<count;i++){const g=graphic(scene);g.fillStyle(color,.65);g.fillEllipse(0,0,4,13);g.setPosition(x+(i%4)*12,y-i*8).setRotation(i*.7);fade(scene,g,750+i*18,{x:x-100+i*21,y:y+45+i%3*14,rotation:i*.7+2});}}
function shield(scene,x,y,color,stone=false){const g=graphic(scene);if(stone){for(let i=0;i<5;i++){const a=-Math.PI+i*Math.PI/4,px=Math.cos(a)*75,py=Math.sin(a)*90;g.fillStyle(color,.2);g.fillTriangle(px-10,py+12,px,py-19,px+15,py+9);path(g,[[px-10,py+12],[px,py-19],[px+15,py+9]],color,1.4,.8);}}else{const points=Array.from({length:7},(_,i)=>[Math.cos(i*Math.PI/3-Math.PI/2)*76,Math.sin(i*Math.PI/3-Math.PI/2)*105]);g.fillStyle(color,.06);g.fillPoints(points,true);path(g,points,color,2,.7);g.lineStyle(1,color,.2);g.strokeEllipse(0,0,130,184);for(let i=0;i<6;i++)path(g,[[0,0],points[i]],color,1,.15);}g.setPosition(x,y).setScale(.6);scene.tweens.add({targets:g,scaleX:1,scaleY:1,duration:230,ease:'Cubic.easeOut'});fade(scene,g,900,{delay:200});rune(scene,x,y+117,color);glow(scene,x,y,color,200,.35,1000);}
function healing(scene,x,y,color,blossom=false){rune(scene,x,y+123,color);for(let i=0;i<3;i++)scene.time.delayedCall(i*120,()=>ring(scene,x,y+100-i*30,color,55-i*8,15));for(let i=0;i<14;i++){const node=scene.add.circle(x+Math.sin(i*2.4)*48,y+120,blossom?2.8:1.6,color,.75).setDepth(23);fade(scene,node,850+i%3*100,{y:y-70-i%4*12,x:node.x+Math.cos(i)*20,delay:i*25});}glow(scene,x,y+20,color,210,.4,1000);}
function techniqueEffect(scene,style,x,y,hero){const [color,light]=style.colors;const delay=(ms,fn)=>scene.time.delayedCall(ms,fn);
 switch(style.family){
 case 'slash':crescent(scene,x,y,color,-.6,72);sparks(scene,x,y,light,8,55);break;
 case 'sword':crescent(scene,x,y,color,-.8,114);delay(90,()=>crescent(scene,x-30,y-8,color,-.8,80));sparks(scene,x,y,light);break;
 case 'combo':for(let i=0;i<3;i++)delay(i*115,()=>{crescent(scene,x+(i-1)*17,y+(i-1)*12,color,i%2?.7:-.8,95+i*7);sparks(scene,x,y,light,6,65);});break;
 case 'swords':for(let i=0;i<5;i++){const node=blade(scene,hero.x+85+i*34,hero.y-240-i%2*40,color,Math.PI/2+.35);scene.tweens.add({targets:node,x:x+(i-2)*18,y:y-20+(i-2)*14,duration:330,delay:i*65,ease:'Cubic.easeIn',onComplete:()=>{node.destroy();crescent(scene,x,y,light,-.8,55);sparks(scene,x,y,color,5,50);}});}rune(scene,x,y+110,color);break;
 case 'wind':for(let i=0;i<4;i++)delay(i*55,()=>crescent(scene,x-i*24,y+i*10,color,-.5,130-i*12));leafBurst(scene,x,y,color,7);break;
 case 'leaves':crescent(scene,x,y,color,.65,110);leafBurst(scene,x,y,color,16);break;
 case 'palm':for(let i=0;i<3;i++)delay(i*70,()=>ring(scene,x,y,color,45+i*19,45+i*19,450));glow(scene,x,y,color,180,.5);sparks(scene,x,y,light,18,105);break;
 case 'lightning':rune(scene,x,y+120,color);for(let i=0;i<(style.id==='thunderfinger'?3:2);i++)delay(i*105,()=>{bolt(scene,x,y,color,(i-1)*17);sparks(scene,x,y,light,10,75);});break;
 case 'frost':crescent(scene,x,y,color,-.65,120);shards(scene,x,y+110,color);sparks(scene,x,y,light,15,110);break;
 case 'freeze':rune(scene,x,y+110,color);shards(scene,x,y+115,color,true);glow(scene,x,y,color,270,.45,1000);for(let i=0;i<3;i++)delay(i*110,()=>ring(scene,x,y+90,color,95,28));break;
 case 'poison':for(let i=0;i<7;i++){const cloud=scene.add.image(x+(i-3)*23,y+45-i%3*28,glowTexture(scene)).setTint(color).setDisplaySize(105,105).setAlpha(.36).setDepth(19);fade(scene,cloud,1000,{y:cloud.y-40,x:cloud.x+Math.sin(i)*35});}sparks(scene,x,y+50,light,12,65);break;
 case 'vines':for(let i=0;i<4;i++){const g=graphic(scene),px=x-58+i*35;path(g,bezier([px,y+110],[px+(i%2?-80:80),y],[px,y-72]),color,3,.8);g.setAlpha(0);scene.tweens.add({targets:g,alpha:.8,duration:200,delay:i*50});fade(scene,g,700,{delay:300});}leafBurst(scene,x,y,color,12);break;
 case 'drain':for(let i=0;i<7;i++){const mote=scene.add.circle(x,y+20,i%2?3:2,color,.9).setDepth(23);const points=bezier([x,y+20],[480,y-150+i*30],[hero.x,hero.y-100]);let motion={t:0};scene.tweens.add({targets:motion,t:1,duration:600,delay:i*45,onUpdate:()=>{const point=points[Math.min(28,Math.floor(motion.t*28))];mote.setPosition(...point);},onComplete:()=>mote.destroy()});}ring(scene,x,y,color,75,65);delay(500,()=>healing(scene,hero.x,hero.y-120,color));break;
 case 'flame':crescent(scene,x,y,color,-.85,125);for(let i=0;i<12;i++){const g=graphic(scene);g.fillStyle(i%2?color:light,.65);g.fillTriangle(-4,6,0,-19-i%3*7,5,5);g.setPosition(x-65+i*12,y+65-i%3*15);fade(scene,g,700+i%3*80,{y:g.y-75,scaleX:.3,scaleY:.3});}glow(scene,x,y,color,180,.4);break;
 case 'claw':for(let i=0;i<3;i++)delay(i*45,()=>{const g=graphic(scene);path(g,bezier([x-60+i*27,y-90],[x+10+i*20,y],[x-10+i*23,y+85]),color,12,.12);path(g,bezier([x-60+i*27,y-90],[x+10+i*20,y],[x-10+i*23,y+85]),light,2.5,.9);fade(scene,g,450);});sparks(scene,x,y,color);break;
 case 'summon':rune(scene,hero.x+100,hero.y,color);if(scene.textures.exists('monster-wolf')){const spirit=scene.add.image(hero.x+70,hero.y-80,'monster-wolf').setDisplaySize(210,165).setTint(color).setAlpha(.48).setDepth(19);fade(scene,spirit,380,{x:x,y:y+60,scaleX:spirit.scaleX*1.2,scaleY:spirit.scaleY*1.2});}delay(320,()=>{crescent(scene,x,y,light,.6,100);sparks(scene,x,y,color,22,130);});break;
 case 'guard':shield(scene,hero.x,hero.y-130,color);break;
 case 'stone':shield(scene,hero.x,hero.y-130,color,true);break;
 case 'heal':case 'blossom':healing(scene,hero.x,hero.y-130,color,style.family==='blossom');break;
 case 'break':for(const angle of [-.7,.7])crescent(scene,x,y,color,angle,125);ring(scene,x,y,color,110,75);sparks(scene,x,y,light,24,120);break;
 }
}
export function createBattleAtmosphere(scene,map=0){
 const color=[0xb6cda1,0x99c9cf,0x9dc8d8,0xd3e9ee,0xb5a1cd,0xe5d9af][map]||0xb6cda1;
 const key='battle-vignette-v1';if(!scene.textures.exists(key)){const texture=scene.textures.createCanvas(key,960,540),ctx=texture.context,g=ctx.createRadialGradient(480,230,130,480,270,540);g.addColorStop(0,'rgba(5,17,20,0)');g.addColorStop(.65,'rgba(5,17,20,.12)');g.addColorStop(1,'rgba(4,13,17,.72)');ctx.fillStyle=g;ctx.fillRect(0,0,960,540);texture.refresh();}scene.add.image(480,270,key).setDepth(5);
 const shafts=graphic(scene,2);shafts.fillStyle(color,.035);for(let i=0;i<3;i++)shafts.fillTriangle(780+i*55,-20,410+i*85,470,520+i*75,470);
 const still=reducedMotion();for(let i=0;i<12;i++){const mote=scene.add.circle(60+(i*137)%850,70+(i*59)%360,i%4===0?1.8:1,color,.2+i%3*.08).setDepth(i%3===0?14:3);if(!still)scene.tweens.add({targets:mote,x:mote.x-25,y:mote.y-35,alpha:.1,duration:3300+i*260,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});}
 const mist=scene.add.image(530,455,glowTexture(scene)).setTint(color).setDisplaySize(690,70).setAlpha(.09).setDepth(3);if(!still)scene.tweens.add({targets:mist,x:460,alpha:.04,duration:7000,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
 const frame=graphic(scene,28);for(const [x,flip] of [[22,1],[938,-1]]){path(frame,[[x,40],[x,22],[x+28*flip,22]],0xd4c292,1,.55);path(frame,[[x,500],[x,518],[x+28*flip,518]],0xd4c292,1,.4);}return {color};
}
export function playTechnique(scene,{actor,enemy,action,presentation={},onImpact=()=>{},onCounter=()=>{}}){
 const id=action==='guard'||action==='heal'||action==='break'?action:presentation.id||action==='attack'&&'normal'||action;
 const style=techniqueStyle(id,presentation.type),still=reducedMotion(),x=enemy?.x??730,y=(enemy?.y??425)-120,hero={x:actor.root.x,y:actor.root.y};
 const impact=still?120:style.family==='swords'?740:style.family==='summon'?600:style.melee?370:430,duration=still?550:style.family==='freeze'||style.family==='swords'?1650:1450;
 const name=presentation.name||style.name;
 const title=scene.add.text(480,104,name,{fontFamily:'"Noto Serif TC",serif',fontSize:'30px',color:'#f5e7c6',stroke:'#16322c',strokeThickness:3,letterSpacing:5}).setOrigin(.5).setDepth(32).setAlpha(0);
 scene.tweens.add({targets:title,alpha:1,duration:still?0:170});fade(scene,title,350,{delay:still?220:750});
 if(actor.perform)actor.perform(style.family);else if(style.self)actor.guard();else if(style.melee)actor.attack();else actor.cast?.();
 if(!still){rune(scene,hero.x,hero.y-1,style.colors[0]);glow(scene,hero.x+20,hero.y-135,style.colors[0],110,.25,400);if(style.melee)scene.tweens.add({targets:actor.root,x:hero.x+150,duration:220,yoyo:true,hold:240,ease:'Cubic.easeInOut'});}
 if(still){scene.time.delayedCall(impact,()=>{ring(scene,style.self?hero.x:x,style.self?hero.y-90:y,style.colors[0],50,30,220);onImpact(style);});}
 else{scene.time.delayedCall(style.family==='swords'?150:style.family==='summon'?180:impact,()=>techniqueEffect(scene,style,x,y,hero));scene.time.delayedCall(impact,()=>{if(!style.self&&presentation.damage>0&&enemy){scene.tweens.add({targets:enemy,x:enemy.x+16,duration:75,yoyo:true,repeat:1});if(['break','lightning','freeze'].includes(style.family))scene.cameras.main.shake(100,.0014);}onImpact(style);});}
 scene.time.delayedCall(still?330:1030,()=>{if(presentation.harm>0&&enemy){if(!still)scene.tweens.add({targets:enemy,x:enemy.x-105,duration:140,yoyo:true,hold:60,ease:'Cubic.easeInOut'});actor.hit();onCounter(style);}});
 return {duration,style};
}
