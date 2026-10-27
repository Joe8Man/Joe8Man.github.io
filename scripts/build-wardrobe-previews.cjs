// Rasterize the game's code-native SVG renderer at build time, without live page filters.
// Requires sharp: NODE_PATH=<runtime-node-modules> node scripts/build-wardrobe-previews.cjs
const fs=require('fs'),path=require('path'),vm=require('vm'),sharp=require('sharp');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'Xianxia.html'),'utf8');
const code=html.split('<script>').pop().split('</script>')[0].split('\ninitPageArt();')[0];
const element={innerHTML:'',value:'',style:{},dataset:{},addEventListener(){},classList:{contains(){return false},add(){},remove(){}},querySelectorAll(){return []},querySelector(){return element}};
const sandbox={console,Math,Date,JSON,Number,Object,Array,Set,String,document:{getElementById(){return element},querySelector(){return element},querySelectorAll(){return []},addEventListener(){}},window:{addEventListener(){}},setTimeout(){},clearTimeout(){},setInterval(){},localStorage:{getItem(){return null},setItem(){}},performance:{now(){return 0}}};
vm.createContext(sandbox);vm.runInContext(code,sandbox);
const dir=path.join(root,'assets/wardrobe-v3');fs.mkdirSync(dir,{recursive:true});
(async()=>{for(const gender of ['male','female']){
 const source=(await sharp(path.join(root,'assets/wardrobe-v2',gender+'.webp')).png().toBuffer()).toString('base64');
 const composites=[];
 for(let sect=0;sect<6;sect++)for(let rank=0;rank<5;rank++){
  let svg=vm.runInContext(`costumeSVG('${gender}',ROBES['sect-${sect}-robe-${rank}'])`,sandbox);
  svg=svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="280" ').replaceAll('assets/wardrobe-v2/'+gender+'.webp','data:image/png;base64,'+source);
  const input=await sharp(Buffer.from(svg)).png().toBuffer();const stats=await sharp(input).stats();if(stats.channels[3].max===0)throw new Error('Empty sprite: '+gender+'/'+sect+'/'+rank);composites.push({input,left:sect*240,top:rank*280});
 }
 const file=path.join(dir,gender+'-previews.webp');await sharp({create:{width:1440,height:1400,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(composites).webp({quality:90,effort:5}).toFile(file);
 console.log(gender,fs.statSync(file).size+' bytes');
}})().catch(e=>{console.error(e);process.exitCode=1});
