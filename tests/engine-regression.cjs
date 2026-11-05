const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const original=vm.runInContext;
vm.runInContext=function(code,context,...args){if(typeof code==='string'&&code.includes('const ITEMS=')&&context.window&&!context.window.XianxiaCombatRules){for(const name of ['boss-core','world-core','territory-core','field-core','territory-combat'])original(fs.readFileSync(path.join(process.cwd(),'assets','engine',name+'.js'),'utf8'),context);}return original(code,context,...args);};
require(path.resolve(process.argv[2]));
