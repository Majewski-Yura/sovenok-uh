(()=>{'use strict';
const games=window.TopouhGames, rotate=window.TopouhGameRotation;
if(!Array.isArray(games)||games.length!==12||new Set(games.map(g=>g.id)).size!==12)return;
const modal=document.querySelector('#miniPlay'), ui=document.querySelector('.play-cloud'), slots=[...ui.querySelectorAll('[data-game-slot]')];
if(!modal||slots.length!==3)return;
modal.classList.add('mg-modal');
const area=document.getElementById('playGame'), result=document.getElementById('playResult'), title=document.getElementById('playTitle'), desc=document.getElementById('playDesc');
const el=(tag,text='',cls='')=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e};
const button=(text,fn,cls='')=>{const b=el('button',text,cls);b.type='button';b.addEventListener('click',fn);return b};
let content=rotate.pickToday(games), cleanup=null, current=null, replay=0, launcher=null, activeRun=0;
function drawIfNewDay(){
 const now=rotate.pickToday(games);
 if(content.localDay!==now.localDay)content=now;
 for(const [idx,b] of slots.entries()){
  const g=content.picks[idx];
  b.querySelector('span').textContent=g.title;
  b.setAttribute('aria-label','Сыграть: '+g.title);
 }
}
function play(g){
 if(typeof cleanup==='function')cleanup();cleanup=null;
 current=g;area.replaceChildren();result.textContent='';
 title.textContent=g.title;desc.textContent=g.description;modal.style.setProperty('--minigame-accent',g.accent||'#d9c9f6');
 const seed=rotate.hash(content.localDay+':'+g.id+':'+replay), run=++activeRun;let done=false;
 const ctx={seed,rng:rotate.rng(seed),el,button,finish:(message)=>{
  if(done||run!==activeRun)return;done=true;
  result.textContent=message||'Получилось!';
  const r=button('Ещё раунд',()=>{if(run!==activeRun)return;replay++;play(g)},'mg-repeat');
  area.append(r);
 }};
 cleanup=g.mount(area,ctx);
}
slots.forEach((b,i)=>b.addEventListener('click',()=>{
 drawIfNewDay();replay=0;launcher=b;modal.showModal();play(content.picks[i]);
 const first=area.querySelector('button:not(:disabled)');
 if(first)first.focus({preventScroll:true});
}));
modal.addEventListener('close',()=>{activeRun++;current=null;if(typeof cleanup==='function')cleanup();cleanup=null;area.replaceChildren();if(launcher)launcher.focus({preventScroll:true})});
window.addEventListener('pageshow',drawIfNewDay);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!modal.open)drawIfNewDay()});
drawIfNewDay();
})();
