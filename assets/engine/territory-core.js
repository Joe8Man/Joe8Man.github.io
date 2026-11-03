/* Resource holdings: wall-clock ledger, deterministic NPC raids, no backend. */
(function(root){'use strict';
const HOUR=3600000,RAID=6*HOUR,DURATION=300000,CAPTURE=180,WARNING=900000;
const catalog=[
 ['bamboo','青溪靈田',0,37,91,.06,45,150],['marsh','澤心藥圃',1,58,51,.12,70,260],
 ['reef','歸墟晶礦',2,80,70,.24,100,390],['snow','寒泉靈池',3,42,46,.48,135,530],
 ['shade','幽谷藥田',4,23,37,.96,190,690],['sky','雲頂靈脈',5,63,19,1.92,255,860]
].map(([id,name,map,x,y,xp,gold,force])=>({id,name,map,x,y,xp,gold,force,art:`assets/territory-v1/${id}.webp`}));
const defaults=(now=Date.now())=>({version:1,at:now,sect:null,disciples:Array.from({length:12},(_,i)=>({id:i,level:0,site:null})),sites:{},history:[]});
function valid(t){const n=x=>Number.isFinite(x)&&x>=0&&x<=1e16,i=(x,max)=>Number.isInteger(x)&&x>=0&&x<=max;if(!t||t.version!==1||!n(t.at)||!(t.sect===null||i(t.sect,5))||!Array.isArray(t.disciples)||t.disciples.length!==12||!t.disciples.every((d,j)=>d.id===j&&i(d.level,10)&&(d.site===null||catalog.some(s=>s.id===d.site)))||!t.sites||Array.isArray(t.sites)||Object.keys(t.sites).some(id=>!catalog.some(s=>s.id===id))||!Array.isArray(t.history)||t.history.length>40||!t.history.every(e=>e&&n(e.at)&&typeof e.text==='string'&&e.text.length<=300))return false;
 for(const [id,s] of Object.entries(t.sites)){if(!s||typeof s.owned!=='boolean'||!['captured','nextRaid','nextPay','cycle','warned','ward','bank','attack'].every(k=>n(s[k]))||!i(s.ward,10)||!Number.isInteger(s.cycle)||s.bank>=1e6||s.owned&&(s.nextRaid<=s.captured||s.nextPay<=s.captured)||t.disciples.filter(d=>d.site===id).length>3)return false;}
 return t.disciples.every(d=>d.site===null||t.sites[d.site]?.owned);
}
function normalize(t,now,sect){if(!t)t=defaults(now);if(t.sect!==sect){t.sect=sect;for(const d of t.disciples)d.site=null;t.sites={};}return t;}
const strength=(t,id)=>(t.sites[id]?.ward||0)*24+80+t.disciples.filter(d=>d.site===id).reduce((s,d)=>s+100*(1+d.level*.3),0);
const force=(site,record)=>Math.round(site.force*(1+((record.cycle*7+site.map*3)%6)*.03));
function capture(t,id,now){const site=catalog.find(s=>s.id===id);if(!site||t.sect===null||t.sites[id]?.owned)return false;t.sites[id]={owned:true,captured:now,nextRaid:now+RAID,nextPay:now+HOUR,cycle:0,warned:0,ward:0,bank:0,attack:0};return true;}
function note(t,at,text){t.history.unshift({at,text});t.history.length=Math.min(40,t.history.length);}
function settle(t,now){now=Math.max(t.at,now);let xp=0,gold=0;const notices=[];let lost=0,won=0;
 for(const site of catalog){const s=t.sites[site.id];if(!s?.owned)continue;let cursor=t.at;
  while(s.owned&&cursor<=now){const end=s.attack?s.attack+DURATION:Infinity,warning=s.warned===s.nextRaid?Infinity:s.nextRaid-WARNING,event=Math.max(cursor,Math.min(s.nextPay,s.attack?Infinity:s.nextRaid,end,warning));
   const until=Math.min(now,event),seconds=Math.max(0,until-cursor)/1000;xp+=site.xp*seconds;cursor=until;if(event>now)break;
   if(warning<=cursor&&!s.attack&&s.warned!==s.nextRaid){s.warned=s.nextRaid;notices.push(site.name+'將於 15 分鐘內遭反攻，請檢查駐守。');}
   if(!s.attack&&s.nextRaid<=cursor){s.attack=s.nextRaid;notices.push(site.name+'正在被攻擊！五分鐘內可入場支援。');note(t,s.attack,site.name+'遭高手反攻。');}
   if(s.attack&&s.attack+DURATION<=cursor){const held=strength(t,site.id)>=force(site,s);if(held){won++;note(t,cursor,site.name+'由駐守弟子與大陣守住。');s.cycle++;s.nextRaid=s.attack+RAID;s.attack=0;}else{s.owned=false;lost++;for(const d of t.disciples)if(d.site===site.id)d.site=null;note(t,cursor,site.name+'失守，後續收益停止。');notices.push(site.name+'已被奪回，駐守弟子撤回宗門。');}}
   if(s.owned&&s.nextPay<=cursor){s.bank+=site.gold;const pay=Math.floor(s.bank);s.bank-=pay;gold+=pay;s.nextPay+=HOUR;}
   if(cursor>=now)break;
  }
 }
 t.at=now;if(gold){note(t,now,'資源地每小時結算：靈石 +'+gold+'。');notices.push('資源地收益結算：靈石 +'+gold+'。');}if(won)notices.push('駐軍成功守住 '+won+' 次反攻。');return {xp,gold,notices,lost,won};
}
function defend(t,id,now){const s=t.sites[id];if(!s?.owned||!s.attack)return false;s.cycle++;s.nextRaid=s.attack+RAID;s.attack=0;note(t,now,catalog.find(x=>x.id===id).name+'由你親自守住。');return true;}
root.XianxiaTerritories={catalog,HOUR,RAID,DURATION,CAPTURE,defaults,normalize,valid,strength,force,capture,settle,defend,note};
})(typeof window==='undefined'?globalThis:window);

