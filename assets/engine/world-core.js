/* Original world simulation. No DOM or storage access; canonical resources live in Xianxia.html. */
(function(root){
'use strict';
const places=['town','wild','sect','ruin'];
const regions=[
 {name:'青州竹林',town:'竹溪鎮',sect:'青嵐山門',ruin:'古劍廬',x:23,y:76,color:'#587e52'},
 {name:'雲夢大澤',town:'煙水集',sect:'雲夢道院',ruin:'澤底古陣',x:54,y:71,color:'#587e7c'},
 {name:'東海歸墟',town:'望潮港',sect:'滄海仙臺',ruin:'沉龍宮',x:85,y:47,color:'#417f8b'},
 {name:'崑崙雪境',town:'雪嶺驛',sect:'崑崙仙寺',ruin:'寒天古窟',x:40,y:20,color:'#627a8b'},
 {name:'幽冥古域',town:'忘川渡',sect:'幽都山門',ruin:'往生殿',x:13,y:17,color:'#7e648c'},
 {name:'九天仙闕',town:'天街',sect:'問道仙宮',ruin:'星河遺府',x:81,y:13,color:'#a48a59'}
];
const npcs=[
 ['bai','白雲舟','male',0,'散修劍客','爽朗','山路雖遠，與道友同行便不寂寞。','wolf'],
 ['lin','林青蘅','female',0,'採藥女修','溫和','竹影深處的靈草，可救人，也可養道。','serpent'],
 ['wen','溫知微','female',1,'雲夢術修','沉靜','霧散之前，先聽清自己的心。','bee'],
 ['lu','陸觀瀾','male',1,'遊方丹師','灑脫','一爐丹火，也能照見人間百態。','boar'],
 ['jiang','江望舒','female',2,'東海劍修','果決','海潮有來去，劍心當自明。','ape'],
 ['gu','顧滄溟','male',2,'歸墟尋寶人','機敏','龍宮的門未必在海底，或許就在潮聲裡。','serpent'],
 ['su','蘇聽雪','female',3,'崑崙弟子','清冷','雪落無聲，出劍亦當如此。','wolf'],
 ['pei','裴照夜','male',3,'雪嶺守關人','剛正','若想登高，先學會在風雪中站穩。','boar'],
 ['ye','葉幽蘭','female',4,'引魂修士','疏離','生死之外，也有人值得你記掛。','bee'],
 ['mo','墨無咎','male',4,'古域行者','寡言','心中有燈，便不怕路暗。','ape'],
 ['yun','雲星晚','female',5,'天闕星官','通透','滿天星辰，各有自己的歸途。','serpent'],
 ['ning','寧御風','male',5,'雲遊仙人','逍遙','仙途不只在高處，也在每一次相逢。','wolf']
].map(([id,name,gender,map,title,temper,line,enemy],i)=>({id,name,gender,map,title,temper,line,enemy,seed:i,outfit_id:`sect-${map}-robe-${i%3}`}));
const fresh=()=>({version:1,day:1,turn:0,place:'town',region:0,visited:['0-town'],bonds:{},bounty:null,claimedDay:0,auctionDay:0,omens:{},journal:['初入九州，仙途自此展開。']});
const integer=(v,max=1e8)=>Number.isSafeInteger(v)&&v>=0&&v<=max;
function valid(w){return !!w&&w.version===1&&integer(w.day)&&w.day>=1&&integer(w.turn,3)&&integer(w.region,5)&&places.includes(w.place)&&Array.isArray(w.visited)&&w.visited.length<=24&&new Set(w.visited).size===w.visited.length&&w.visited.every(k=>/^[0-5]-(town|wild|sect|ruin)$/.test(k))&&w.bonds&&typeof w.bonds==='object'&&!Array.isArray(w.bonds)&&Object.keys(w.bonds).every(id=>npcs.some(n=>n.id===id)&&validBond(w.bonds[id]))&&integer(w.claimedDay)&&integer(w.auctionDay)&&w.omens&&typeof w.omens==='object'&&!Array.isArray(w.omens)&&Object.keys(w.omens).every(k=>/^[0-5]$/.test(k)&&integer(w.omens[k]))&&Array.isArray(w.journal)&&w.journal.length<=24&&w.journal.every(x=>typeof x==='string'&&x.length<=200)&&(!w.bounty||integer(w.bounty.map,5)&&integer(w.bounty.baseline)&&integer(w.bounty.target,20)&&w.bounty.target>=1&&integer(w.bounty.accepted)&&w.bounty.accepted>=1);}
function validBond(b){return !!b&&integer(b.affinity,100)&&integer(b.talk)&&integer(b.gift)&&integer(b.discuss)&&typeof b.met==='boolean';}
function normalize(w,map=0){const result=valid(w)?w:fresh();if(result.region!==map){result.region=map;result.place='wild';}return result;}
function note(w,text){w.journal.unshift('第'+w.day+'日 · '+text);w.journal=w.journal.slice(0,24);}
function advance(w,n=1){w.turn+=n;while(w.turn>=4){w.turn-=4;w.day++;}return w.day;}
function date(w){const year=Math.floor((w.day-1)/360)+1,month=Math.floor((w.day-1)%360/30)+1,day=(w.day-1)%30+1;return `道曆 ${year} 年 ${month} 月 ${day} 日 · ${['清晨','午時','薄暮','夜深'][w.turn]}`;}
function bond(w,id){return w.bonds[id]??={affinity:0,talk:0,gift:0,discuss:0,met:false};}
function npcPlace(n,w){return ['town','wild','town','sect'][(Math.floor((w.day-1)/2)+n.seed)%4];}
function relation(n){return n>=75?'知交':n>=40?'同道':n>=15?'相識':'初逢';}
root.XianxiaWorld={regions,npcs,places,fresh,valid,normalize,note,advance,date,bond,npcPlace,relation};
})(typeof window==='undefined'?globalThis:window);
