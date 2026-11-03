// Mechanical atlas preparation: transparent padding, consistent scale and foot baseline.
// Usage: node scripts/pack-combat-assets.cjs /absolute/path/source-manifest.json
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
async function pack(asset,out){
 const {data,info}=await sharp(asset.path).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const cells=[];
 for(let i=0;i<16;i++){
  const left=Math.round(i%4*info.width/4),top=Math.round(Math.floor(i/4)*info.height/4),right=Math.round((i%4+1)*info.width/4),bottom=Math.round((Math.floor(i/4)+1)*info.height/4);
  let x0=right,y0=bottom,x1=left,y1=top;
  for(let y=top;y<bottom;y++)for(let x=left;x<right;x++)if(data[(y*info.width+x)*4+3]>12){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  if(x1<x0||y1<y0)throw Error(asset.name+' empty cell '+i);
  cells.push({left:x0,top:y0,width:x1-x0+1,height:y1-y0+1});
 }
 const isHero=asset.name.startsWith('hero-'),isSect=asset.name.startsWith('sect-combat-'),isMonster=asset.name.startsWith('monsters-'),isBoss=asset.name.startsWith('bosses-'),isHuman=asset.name==='human-enemies';
 const groups=cells.map((c,i)=>isHero?0:isSect?Math.floor(i/8):isHuman||isBoss?Math.floor(i/4):isMonster&&i<14?Math.floor(i/2):i);
 const max=new Map();cells.forEach((c,i)=>max.set(groups[i],Math.max(max.get(groups[i])||0,c.width,c.height)));
 const overlays=[];
 for(let i=0;i<16;i++){
  const c=cells[i],ratio=224/max.get(groups[i]),width=Math.max(1,Math.round(c.width*ratio)),height=Math.max(1,Math.round(c.height*ratio));
  const input=await sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).extract(c).resize(width,height).png().toBuffer();
  const character=isHero||isSect||isHuman||(isBoss&&i<12)||(isMonster&&i<14);
  overlays.push({input,left:i%4*256+Math.floor((256-width)/2),top:Math.floor(i/4)*256+(character?240-height:Math.floor((256-height)/2))});
 }
 await sharp({create:{width:1024,height:1024,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(overlays).webp({quality:88,alphaQuality:100,effort:6}).toFile(path.join(out,asset.name+'.webp'));
 return {name:asset.name,file:asset.name+'.webp',width:1024,height:1024,columns:4,rows:4,frameWidth:256,frameHeight:256,frames:16,bytes:fs.statSync(path.join(out,asset.name+'.webp')).size};
}
async function main(){const assets=JSON.parse(fs.readFileSync(process.argv[2],'utf8')),out=path.resolve(__dirname,'../assets/combat-v1');fs.mkdirSync(out,{recursive:true});const manifest=path.join(out,'manifest.json'),previous=fs.existsSync(manifest)?JSON.parse(fs.readFileSync(manifest,'utf8')):{sheets:[]},sheets=new Map(previous.sheets.map(sheet=>[sheet.name,sheet]));for(const asset of assets){sheets.set(asset.name,await pack(asset,out));console.log(asset.name+' packed');}fs.writeFileSync(manifest,JSON.stringify({version:'20261103c',sheets:[...sheets.values()]},null,2)+'\n');}
main().catch(e=>{console.error(e);process.exitCode=1;});
