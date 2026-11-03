/* Six fixed, optional endgame encounters. Cooldowns belong to the character save. */
(function(root){'use strict';
const catalog=[
 {id:'verdant',map:0,name:'萬古青麟',title:'竹海之祖',lair:'斷天古竹',x:4.1,y:85.5,color:'#a9d69b',power:13000,hp:208000,attack:1200,armor:.32,pattern:['area','charge','ranged'],skill:'裂地青焰',lore:'九州靈脈初生時，一縷青木之氣化作古麒麟。它曾守護竹海萬靈，卻在天裂之夜吞下魔種，自此封鎖斷天古竹，連昔日供奉它的修士也無法接近。',tip:'青焰震地後會連接衝撞，勿在正面停留。',relic:'青麟鎮岳印',slot:'charm'},
 {id:'marsh',map:1,name:'九首噬澤',title:'萬毒之源',lair:'九曲毒淵',x:66,y:87,color:'#74d8cf',power:26000,hp:416000,attack:2000,armor:.35,pattern:['ranged','area','ranged','charge'],skill:'九首毒潮',lore:'昔日雲夢仙人以九道鎖鏈鎮壓洪荒毒蛟，天裂後鎖鏈盡斷。毒蛟將九位守陣者的殘魂煉成九首，盤據澤底，所過之處連靈氣都染上劇毒。',tip:'毒潮扇射覆蓋廣，從彈幕間隙穿過，保留身法應對追擊。',relic:'九淵避劫珠',slot:'ring'},
 {id:'abyss',map:2,name:'歸墟龍皇',title:'沉海帝君',lair:'無日海眼',x:94,y:62,color:'#90c9f3',power:80000,hp:1280000,attack:4000,armor:.38,pattern:['charge','ranged','area'],skill:'滅世潮鳴',lore:'歸墟龍皇曾以一己之力托住東海龍宮。天裂令海眼逆流，它為救族人吞下破碎龍脈，卻被深海怨念侵蝕。如今龍宮已空，唯有它仍守著再也不會歸來的臣民。',tip:'龍皇衝鋒距離長，橫向閃避；狂暴後潮彈更密。',relic:'滄溟斷界劍',slot:'weapon'},
 {id:'frost',map:3,name:'寂天冰凰',title:'永夜霜主',lair:'絕音冰頂',x:50.4,y:10.5,color:'#c0e6ff',power:250000,hp:4000000,attack:8800,armor:.4,pattern:['ranged','area','charge','area'],skill:'霜羽天葬',lore:'崑崙仙寺曾供奉一枚千年凰卵，盼它焚去九州劫雲。卵破之日卻逢天裂，仙火化作極寒，冰凰一聲長鳴，將整座山頂與守卵僧人封進了不融的冰雪。',tip:'霜羽彈幕後有大範圍落霜，遠離預警圓心。',relic:'太素凰羽衣',slot:'robe'},
 {id:'nether',map:4,name:'無赦冥君',title:'斬魂戰主',lair:'萬魂戰塚',x:22.5,y:7.5,color:'#d1a6f0',power:650000,hp:10400000,attack:16000,armor:.43,pattern:['area','charge','charge','ranged'],skill:'斬魂鬼陣',lore:'此人原是鎮守往生門的仙將，以長戟抵擋萬鬼千年。天裂撕毀輪迴後，他將戰死部眾的魂魄鎖入甲冑，拒絕獨自轉生。如今甲下只剩一個執念：闖入者，皆為敵。',tip:'連續衝殺之間不要急著近身，等鬼戟落空再反擊。',relic:'無赦鎮魂璽',slot:'charm'},
 {id:'heaven',map:5,name:'星穹玄武',title:'負天古神',lair:'碎星天垣',x:94,y:29,color:'#efd494',power:1800000,hp:28800000,attack:27200,armor:.46,pattern:['area','ranged','charge','ranged'],skill:'墜星天罰',lore:'星穹玄武背負九州天穹，甲上每一道星紋都是一座古老仙城。天裂之後，它仍以肉身撐住破天，卻將靠近之人都視作奪取星核的入侵者。擊敗它的化身，方能取得補天遺寶。',tip:'星落與環形彈幕交替，持續移動並在缺口閃避。',relic:'補天星核戒',slot:'ring'}
].map((b,i)=>({...b,art:'assets/bosses-v1/'+b.id+'.webp',mapArt:'assets/bosses-v1/'+b.id+'-map.webp',gear:'worldboss-'+b.id,money:[4500,11000,26000,60000,140000,320000][i],crystal:12+i*4,fragment:8+i*3,insight:4+i*2}));
const cooldown=3600000,ids=new Set(catalog.map(b=>b.id));
function valid(records){return records!==null&&typeof records==='object'&&!Array.isArray(records)&&Object.keys(records).length<=6&&Object.entries(records).every(([id,r])=>ids.has(id)&&r&&Number.isSafeInteger(r.readyAt)&&r.readyAt>=0&&r.readyAt<=1e16&&Number.isSafeInteger(r.kills)&&r.kills>=0&&r.kills<=1e8);}
function remaining(record,now=Date.now()){return Math.max(0,Math.ceil(((record?.readyAt||0)-now)/1000));}
function countdown(seconds){const s=Math.max(0,Math.ceil(seconds));return String(Math.floor(s/3600)).padStart(2,'0')+':'+String(Math.floor(s%3600/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
root.XianxiaBosses={catalog,cooldown,valid,remaining,countdown};
})(typeof window==='undefined'?globalThis:window);
