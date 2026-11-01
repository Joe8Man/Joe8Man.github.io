const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('assets/engine/world.js','utf8');
const commandSource=source.slice(source.indexOf('function command(action,value)'),source.indexOf('function actionButton('));
const clickSource=source.split('\n').find(line=>line.startsWith("document.addEventListener('click',e=>{let n="));
let handler,modal=false,opened=0,closed=0,person=null,feedback={textContent:''};
const placeDialog={open:true,close(){this.open=false;closed++;},querySelector(){return feedback;}},dialog={open:false,showModal(){this.open=true;opened++;}},rosterDialog={close(){}},bossDialog={close(){}};
const sandbox={placeDialog,dialog,rosterDialog,bossDialog,document:{addEventListener(_kind,fn){handler=fn;}},window:{xianxiaField:{open(){}}},api:()=>({command(action){if(action==='explore'){modal=true;return {};}return {message:'尋得靈草 2。'};},view(){return {map:0,world:{place:'wild'}};}}),render(){},renderPerson(id){person=id;},cancelWalk(){},openPlace(){opened++;},host:{},innerWidth:400,walking:null,destination:null,selected:null,tab:'local',key:'',npc:null,message:''};
vm.createContext(sandbox);vm.runInContext(commandSource+'\n'+clickSource,sandbox);
sandbox.command('explore');assert.equal(modal,true);assert.equal(placeDialog.open,false,'秘境介面開啟後地點視窗必須關閉');
placeDialog.open=true;sandbox.command('opportunity');assert.equal(placeDialog.open,true,'一般尋訪保留地點視窗');assert.equal(feedback.textContent,'尋得靈草 2。','尋訪結果顯示於地點視窗');
for(const action of ['field','service','cultivate','continue']){placeDialog.open=true;sandbox.command(action);assert.equal(placeDialog.open,false,action+' 切換介面前關閉地點視窗');}
placeDialog.open=true;
handler({target:{closest(selector){return selector==='[data-w-person]'?{dataset:{wPerson:'npc-1'}}:null;}}});
assert.equal(person,'npc-1');assert.equal(placeDialog.open,false,'道友視窗開啟前關閉地點視窗');assert.equal(dialog.open,true);
console.log('World place actions, trial overlay, and NPC dialog checks passed');
