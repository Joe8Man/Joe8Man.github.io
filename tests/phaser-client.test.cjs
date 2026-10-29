const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('assets/engine/client.js','utf8').replace(/^import .*;\n/,'').split('\nstart().catch(')[0];let count=0;
function el(tag='div',props={},children=[]){const e={nodeType:1,tagName:tag.toUpperCase(),classList:{contains:c=>(props.classes||[]).includes(c)},hidden:!!props.hidden,open:!!props.open,type:props.type||'',disabled:!!props.disabled,value:props.value||'',placeholder:props.placeholder||'',dataset:props.dataset||{},textContent:props.text||'',innerText:props.text||'',parentElement:null,childNodes:children,display:props.display||'block',getAttribute:k=>props[k]??null,matches(selector){return selector.split(',').some(s=>{s=s.trim();if(s==='input:not([type=file]):not([type=hidden])')return tag==='input'&&!['file','hidden'].includes(this.type);if(s==='[aria-hidden=true]')return props['aria-hidden']==='true';if(s.startsWith('.'))return (props.classes||[]).includes(s.slice(1));if(s.startsWith('['))return false;return tag===s;});},closest(s){for(let p=this;p;p=p.parentElement)if(p.matches(s))return p;return null;},querySelector(s){for(const c of children){if(c.nodeType!==1)continue;if(c.matches(s))return c;const n=c.querySelector(s);if(n)return n;}return null;}};children.forEach(c=>c.parentElement=e);return e;}
const body=el('body');const context={document:{body,getElementById:()=>null},Map,Set,console,getComputedStyle:e=>({display:e.display}),ok:(v,m)=>{assert.ok(v,m);count++;},el};vm.createContext(context);vm.runInContext(source,context);
vm.runInContext(`{
 const action=el('button',{text:'服用回春丹'}),disabled=el('button',{text:'突破',disabled:true}),root=el('section',{},[action,disabled]);const rows=entries(root);ok(rows.length===2&&rows[0].el===action,'canvas actions retain the exact canonical target');ok(rows[1].disabled,'unmet gameplay conditions remain disabled');
 const hidden=el('section',{classes:['hidden']},[el('button',{text:'不可見'})]);ok(entries(hidden).length===0,'hidden routes cannot leak actions');
 const cssHidden=el('section',{display:'none'},[el('button',{text:'裝飾'})]);ok(entries(cssHidden).length===0,'CSS-hidden legacy blocks are not rendered');
 const icon=el('span',{'aria-hidden':'true',text:'☰'});ok(entries(icon).length===0,'decorative glyphs do not become layout rows');
 const legacy=el('dialog',{'aria-hidden':'true','data-phaser-legacy':''},[el('button',{text:'交談'})]);ok(entries(legacy).length===1,'hidden source dialog still supplies its canvas view model');
 const file=el('input',{type:'file'});ok(entries(file).length===0,'file picker stays with browser integration');
 const name=el('input',{value:'道友',placeholder:'仙名'});ok(entries(name)[0].type==='input','text editing remains an explicit input action');
 const checkbox=el('input',{type:'checkbox','aria-label':'選取靈草'});checkbox.checked=false;checkbox.click=()=>checkbox.checked=!checkbox.checked;invoke(checkbox);ok(checkbox.checked,'bulk inventory checkbox keeps its native checked transaction');
 const summary=el('summary',{text:'進階設定'}),detail=el('details',{},[summary,el('p',{text:'選項'})]);ok(entries(detail).length===1,'collapsed details show only their toggle');detail.open=true;ok(entries(detail).length===2,'expanded details expose content');
 ok(clamp(-4,0,1)===0&&clamp(5,0,1)===1,'touch and camera bounds clamp');
}`,context);
console.log(count+' Phaser client action, layout visibility and browser input checks passed');
// Resource ticks and cooldowns patch retained controls; only structural changes rebuild.
vm.runInContext(`{
 const root={querySelector:s=>({classList:{contains:()=>s==='[data-field-overlay]'}}),querySelectorAll:()=>[{dataset:{fieldCast:'sword'}}]};
 const map={key:'map'};const before=stableSignature(map,[],393,852);ok(before===stableSignature(map,[{text:'修為 +99'}],393,852),'passive cultivation cannot rebuild map controls');ok(before!==stableSignature(map,[],852,393),'orientation change rebuilds the layout');
 const battle={key:'battle',root};const first=stableSignature(battle,[],393,852);ok(first===stableSignature(battle,[{text:'冷卻 1.2s',disabled:true}],393,852),'cooldown and resource ticks retain battle control identities');root.querySelector=s=>({classList:{contains:()=>false}});ok(first!==stableSignature(battle,[],393,852),'pause overlay still changes the presentation');
 const mapChild={},mapContainer={list:[mapChild]},buttonChild={},buttonContainer={list:[buttonChild]},nextIcon={};mapLayer=mapContainer;mapCamera={id:2};scene={cameras:{main:{id:1}},children:{list:[mapContainer,buttonContainer]}};isolateCameras();ok(mapContainer.cameraFilter===1&&mapChild.cameraFilter===1,'world container and descendants are excluded from UI camera');ok(buttonContainer.cameraFilter===2&&buttonChild.cameraFilter===2,'control container and descendants are excluded from moving camera');buttonContainer.list.push(nextIcon);isolateCameras();ok(nextIcon.cameraFilter===2,'late loaded children also keep camera isolation');
}`,context);
console.log('Retained controls, orientation, pause and camera isolation checks passed');
vm.runInContext(`{
 const p=pageSlice(Array.from({length:18},(_,i)=>i),12,'bag-test');ok(p.items.length===12&&p.pages===2,'inventory uses twelve slots and preserves all items on two pages');panePages.set('bag-test',1);const next=pageSlice([0,1,2],12,'bag-test');ok(next.page===0&&next.items.length===3,'removing or filtering items clamps stale page indexes');
 const south=stickVector(0,20);ok(south.y===20&&south.inputY>0&&south.inputX===0,'downward touch moves both the knob and the character downward');const diagonal=stickVector(100,100);ok(Math.abs(Math.hypot(diagonal.x,diagonal.y)-32)<1e-8&&Math.abs(Math.hypot(diagonal.inputX,diagonal.inputY)-1)<1e-8,'diagonal stick throw is circular and cannot accelerate movement');ok(stickVector(1,1).inputX===0&&stickVector(1,1).inputY===0,'small touches inside the dead zone do not drift');
 const hiddenDetails=el('details',{},[el('article',{},[el('button',{text:'配置招式'})])]);ok(entries(hiddenDetails.childNodes[0]).length===1,'a selected card can show details from a closed source category');
}`,context);
console.log('Compact inventory pagination and circular joystick regression checks passed');
vm.runInContext(`{
 const calls=[],knob={setPosition(x,y){this.x=x;this.y=y;}},mark={setPosition(x,y){this.x=x;this.y=y;}},host={dataset:{}};window={xianxiaField:{move:(x,y)=>calls.push([x,y])}};document.getElementById=()=>host;stickVisual={x:85,y:300,knob,mark};stickOwner=7;updateStickPointer({x:85,y:325});ok(knob.y===325&&mark.y===325&&calls.at(-1)[1]>0,'touch feedback and movement use the same displacement');releaseStick();ok(stickOwner===null&&knob.y===300&&mark.y===300&&calls.at(-1).every(v=>v===0),'release recenters the knob and clears all movement');
}`,context);
console.log('Joystick displacement and release transaction checks passed');
