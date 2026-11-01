const api=()=>window.xianxiaTerritoryBridge;
const dialog=document.createElement('dialog');dialog.id='territoryDialog';dialog.className='world-dialog';dialog.setAttribute('aria-label','資源地與戰報');document.body.append(dialog);
let selected=null,dispatch=null,member=null,mode='sites';
const clock=at=>{const s=Math.max(0,Math.ceil((at-Date.now())/1000));return Math.floor(s/3600)+'時'+Math.floor(s%3600/60)+'分'+s%60+'秒';};
function render(){if(!api()?.state())return;const views=api().view(),t=api().state(),s=views.find(x=>x.id===selected),members=t.disciples;
 let body='';
 if(dispatch!==null){const d=members[dispatch];body=`<h2>調派弟子 ${d.id+1}</h2><p>目前：${views.find(s=>s.id===d.site)?.name||'宗門待命'} · 每處最多三人，反攻期間不可調動。</p><button class="world-btn" data-t-assign="${d.id}:">撤回宗門</button>${views.filter(s=>s.owned).map(s=>`<p>${s.name} · ${s.guards.length}/3</p><button class="world-btn" data-t-assign="${d.id}:${s.id}" ${s.attack||s.guards.length>=3||s.id===d.site?'disabled':''}>派往${s.name}</button>`).join('')}`;}
 else if(mode==='member'){const d=members[member];body=`<h2>駐守弟子 ${d.id+1}</h2><p>強化 ${d.level}/10 階 · 戰力 ${Math.round(100*(1+d.level*.3))}<br>目前：${views.find(s=>s.id===d.site)?.name||'宗門待命'}<br>宗門貢獻：${window.xianxiaBridge.snapshot().contribution}</p><p>每階增加 30 駐守戰力，一名弟子只能駐守一處。</p><button class="world-btn primary" data-territory-train="${d.id}" ${d.level>=10?'disabled':''}>${d.level>=10?'強化已滿':'強化弟子 · '+100*(d.level+1)+' 貢獻'}</button><button class="world-btn" data-territory-dispatch="${d.id}">調派／撤回</button>`;}
 else if(mode==='history'){body='<h2>資源地戰報</h2>'+t.history.map(e=>`<p>${new Date(e.at).toLocaleString('zh-TW')}<br>${e.text}</p>`).join('');if(!t.history.length)body+='<p>尚無戰報。</p>';}
 else if(s){body=`<span class="world-eyebrow">宗門資源地 · ${s.owned?'已取得採集資格':'待爭奪'}</span><h2>${s.name}</h2><p>修為 +${s.xp}/秒 · 靈石 ${s.gold}/小時<br>固定收益可與其他資源地疊加。</p><p>敵方戰力 ${s.enemy} · 駐防戰力 ${Math.round(s.strength)}<br>駐守：${s.guards.map(id=>'弟子'+(id+1)).join('、')||'尚未派人'}（${s.guards.length}/3）<br>防禦大陣 ${s.ward}/10 階</p>${s.owned?`<p>${s.attack?'反攻進行中 · 剩餘 '+clock(s.attack+300000):'下次反攻 '+clock(s.nextRaid)}<br>下次靈石結算 ${clock(s.nextPay)}</p><p>${s.strength>=s.enemy?'目前駐防足以應對這輪系統反攻。':'駐防不足，建議強化、調派弟子或親自支援。'}</p>${s.attack?`<button class="world-btn primary" data-t-fight="${s.id}" data-t-defense ${s.reason?'disabled':''}>親自進入防守</button>`:`<button class="world-btn" data-t-ward="${s.id}" ${s.ward>=10?'disabled':''}>${s.ward>=10?'大陣已圓滿':'強化大陣 · '+150*(s.ward+1)+' 貢獻'}</button>`}<button class="world-btn" data-t-sect>前往宗門駐守管理</button>`:`<p>擊破防禦大陣 → 擊退守將 → 中央圓圈連續守住 5 分鐘。高手入圈或離圈將重置計時，死亡或收劍需重新挑戰。</p><button class="world-btn primary" data-t-fight="${s.id}" ${s.reason?'disabled':''}>發動資源爭奪 · 3 精力</button>`}<p class="world-copy">${s.reason||''}</p>`;}
 else {body=`<h2>宗門資源地</h2><p>每 6 小時反攻 · 提前 15 分鐘預警 · 持續 5 分鐘<br>弟子與大陣自動防守，反攻時可親自支援。<br>離線按時間補算，失守停止後續收益；通知在遊戲內顯示。</p>${views.map(s=>`<article class="world-contract"><h3>${s.name} · ${s.attack?'交戰中':s.owned?'我方佔領':'尚未佔領'}</h3><p>+${s.xp} 修為/秒 · ${s.gold} 靈石/小時<br>${s.owned?(s.attack?'正在被攻擊':clock(s.nextRaid)+'後反攻'):'敵方戰力 '+s.enemy}</p><button class="world-btn" data-t-site="${s.id}">查看${s.name}</button></article>`).join('')}`;}
 dialog.innerHTML=`<button class="world-dialog-close" data-t-close aria-label="關閉資源地">×</button>${body}<div class="world-dialog-actions"><button class="world-btn" data-t-all>全部資源地</button><button class="world-btn" data-t-history>戰報</button><button class="world-btn" data-t-close>返回</button></div><p class="world-message" role="status" data-t-message></p>`;
}
function open(id=null){if(!api()?.state())return;api().update();selected=id;dispatch=null;mode='sites';render();if(!dialog.open)dialog.showModal();}
function close(){dialog.close();}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-territory-list')||b.hasAttribute('data-t-all')){open();return;}
 if(b.dataset.territoryTrain!==undefined){api().manage('train',b.dataset.territoryTrain);return;}
 if(b.dataset.territoryDispatch!==undefined){dispatch=Number(b.dataset.territoryDispatch);selected=null;render();if(!dialog.open)dialog.showModal();return;}
 if(b.dataset.tSite){open(b.dataset.tSite);return;}
 if(b.hasAttribute('data-t-history')){selected=null;dispatch=null;mode='history';render();return;}
 if(b.hasAttribute('data-t-close')){close();return;}
 if(b.dataset.tAssign!==undefined){api().manage('assign',b.dataset.tAssign);render();return;}
 if(b.dataset.tWard){api().manage('ward',b.dataset.tWard);render();return;}
 if(b.hasAttribute('data-t-sect')){close();window.xianxiaBridge.go('sect');document.querySelector('[data-sect-tab="territory"]')?.click();return;}
 if(b.dataset.tFight){const s=api().view().find(s=>s.id===b.dataset.tFight);if(!s)return;if(s.reason){dialog.querySelector('[data-t-message]').textContent=s.reason;return;}close();window.xianxiaField.open({mode:'territory',site:s.id,defense:b.hasAttribute('data-t-defense')});}
});
dialog.addEventListener('click',e=>{if(e.target===dialog)close();});
setInterval(()=>{if(dialog.open&&!document.hidden)render();},1000);
window.xianxiaTerritoryUI={open,member(id){member=id;dispatch=null;selected=null;mode='member';render();if(!dialog.open)dialog.showModal();},refresh(){if(dialog.open)render();}};
