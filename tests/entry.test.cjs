const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++;};
function element(){return {innerHTML:'',textContent:'',disabled:false,open:false,style:{cssText:''},dataset:{},listeners:{},setAttribute(){},removeAttribute(){},addEventListener(name,cb){(this.listeners[name]??=[]).push(cb);},showModal(){this.open=true;},close(){this.open=false;},querySelector(){return element();},contains(){return false;}};}
(async()=>{
 const nodes=new Map();const body=element();body.append=el=>el.parentElement=body;
 const document={body,createElement:element,getElementById:id=>{if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);},querySelectorAll:()=>[]};
 let imports=0,finished=0,signouts=0,callbacks,localSave=null;const routes=[];
 const auth={onAuthStateChange(cb){callbacks=cb;},async getSession(){return {data:{session:null},error:null};},async signOut(){signouts++;return {error:null};}};
 const context={document,console,URLSearchParams,location:{search:'',origin:'https://example.test',pathname:'/Xianxia.html'},window:{addEventListener(){},xianxiaBridge:{snapshot:()=>localSave,finishEntry(){finished++;},showEntry(){document.getElementById('gameEntry').open=true;},currentRoute:()=> 'home',go:r=>routes.push(r),save(){}}},fakeImport:async()=>{imports++;return {createClient:()=>({auth})};},fetch:async()=>({ok:true,json:async()=>({external:{github:true,google:true}})}),queueMicrotask:fn=>fn(),setTimeout(){},localStorage:{getItem(){return null;}},assert,ok};vm.createContext(context);
 const online=fs.readFileSync('assets/online/online.js','utf8').replace("await import('https://esm.sh/@supabase/supabase-js@2.118.0')",'await fakeImport()');vm.runInContext(online,context);
 ok(imports===0,'title does not need auth network to enable guest play');
 vm.runInContext("user={id:'remembered-account'};window.xianxiaEntryMode='guest'",context);
 ok(!context.window.xianxiaOnline.signedIn&&context.window.xianxiaOnline.guest,'guest choice masks a remembered account');
 await vm.runInContext('window.xianxiaOnline.account()',context);
 ok(imports===1&&routes.length===0,'settings account dialog does not route to community');
 ok(vm.runInContext('dialog.open&&accountRequested',context),'settings opens account modal');
 ok(vm.runInContext("dialog.innerHTML.includes('登入帳號後可手動管理雲端進度')",context),'unsigned account view offers login');
 vm.runInContext("user={id:'account',email:'test@example.test'};render()",context);
 ok(vm.runInContext("dialog.innerHTML.includes('上傳目前進度')&&dialog.innerHTML.includes('查看雲端存檔')",context),'signed-in settings offers cloud controls');
 vm.runInContext('closeOnline()',context);ok(routes.length===0&&!vm.runInContext('dialog.open',context),'closing account settings returns to current game page');
 vm.runInContext("entryRequested=true;accountRequested=false;window.xianxiaEntryMode='account';finishEntry()",context);
 ok(vm.runInContext("dialog.innerHTML.includes('建立新角色')&&dialog.innerHTML.includes('查看雲端存檔')",context),'new device can choose cloud save before creating a character');ok(finished===0,'login alone does not create or overwrite a character');
 localSave={name:'既有角色'};vm.runInContext('finishEntry()',context);ok(vm.runInContext("dialog.innerHTML.includes('接續本機角色')",context),'existing local character remains an explicit choice');
 context.window.xianxiaOnline.cancelEntry();vm.runInContext("window.xianxiaEntryMode='guest';user={id:'remembered'}",context);callbacks('SIGNED_IN',{user:{id:'remembered'}});ok(finished===0,'late auth event cannot override guest choice');
 await vm.runInContext("window.xianxiaEntryMode='account';perform('logout')",context);ok(signouts===1&&localSave.name==='既有角色','logout retains local character');ok(document.getElementById('gameEntry').open,'logout returns to choice screen');
 const prefix=fs.readFileSync('tests/world.test.cjs','utf8').split('function checks(){')[0];
 function core(){let count=0;const test=(v,m)=>{assert.ok(v,m);count++;};renderAll=renderHUD=renderMap=()=>{};routeTo=n=>route=n;toast=()=>{};window.xianxiaOnline={signedIn:false,cancelEntry(){}};state=null;window.xianxiaEntryMode='title';start();test(state===null,'unsigned account cannot bypass entry');draft={root:0,body:0,stats:Array(6).fill(10)};enterGuest();test(window.xianxiaEntryMode==='guest'&&state===null,'guest choice opens creation without inventing a save');start();test(!!state&&state.hp===maxHP(),'guest can create valid character');test(validSave(snapshot()),'guest character uses standard save format');const name=state.name;enterGuest();test(state.name===name,'guest re-entry retains local character');settingsMenu();test(modalKind==='settings','gear opens settings');saveMenu();test(modalKind==='save','settings save page remains available');console.log(count+' entry core and settings checks passed');}
 vm.runInNewContext(prefix+"\nel.focus=()=>{};document.body={style:{}};sandbox.Event=function(){};vm.runInContext('('+"+JSON.stringify(core.toString())+"+')()',sandbox);",{require,console});
 console.log(checks+' optional authentication and guest isolation checks passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
