const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'../assets/engine');
const scope={};
vm.runInNewContext(fs.readFileSync(path.join(root,'world-core.js'),'utf8'),scope);
vm.runInNewContext(fs.readFileSync(path.join(root,'territory-core.js'),'utf8'),scope);
vm.runInNewContext(fs.readFileSync(path.join(root,'boss-core.js'),'utf8'),scope);
const world=scope.XianxiaWorld,sites=scope.XianxiaTerritories.catalog,bosses=scope.XianxiaBosses.catalog;
const overlaps=(a,b,xLimit,yLimit)=>Math.abs(a.x-b.x)<xLimit&&Math.abs(a.y-b.y)<yLimit;
for(const site of sites){
 assert.ok(site.x>=10&&site.x<=90&&site.y>=8&&site.y<=92,`${site.id} inside map`);
 for(let region=0;region<world.regions.length;region++)for(const place of world.places){
  const point=world.point(region,place);
  assert.ok(!overlaps(site,point,8.5,8.6),`${site.id} must not obscure ${region}:${place}`);
 }
 for(const boss of bosses)assert.ok(!overlaps(site,boss,9.2,10.8),`${site.id} must not obscure boss ${boss.id}`);
 for(const other of sites)if(site!==other)assert.ok(!overlaps(site,other,8.2,8),`${site.id} must not obscure ${other.id}`);
}
console.log('Six territory markers clear all wild/site/boss hit targets.');
