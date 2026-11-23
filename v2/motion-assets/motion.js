(() => {
 'use strict';
 const root=document.documentElement, media=matchMedia('(prefers-reduced-motion: reduce)');
 const layout=document.querySelector('body main#today > .layout'), frame=document.querySelector('iframe#previewClub[src="club.html"]');
 const exactWeb=/^https?:$/.test(location.protocol);
 const kind='topouh:club-motion:v1';
 const finite=n=>typeof n==='number'&&Number.isFinite(n);
 const clamp=(value,max)=>Math.max(0,Math.min(value,max));
 if(layout){
  let parentY=0,pending=false,previous=-1;
  const depthCards=[['.feature',.38],['.rail',.30],['.editor-read',.35]]
   .map(([sel,scale])=>[layout.querySelector(sel),scale]).filter(([el])=>el);
  const reserve=()=>{
   const max=Math.max(0,...depthCards.map(([el,scale])=>el.offsetHeight*scale));
   layout.style.setProperty('--tp-card-travel',Math.ceil(max)+'px');
  };
  window.addEventListener('resize',reserve,{passive:true});
  if(typeof ResizeObserver!=='undefined'){
   const ob=new ResizeObserver(reserve);
   for(const [el] of depthCards)ob.observe(el);
  }
  reserve();
  const sync=()=>{
   pending=false;
   const y=media.matches?0:Math.round(clamp(Math.max(0,window.scrollY)+parentY,580));
   if(y!==previous){
    previous=y;root.style.setProperty('--tp-depth',String(y));
    const phase=Math.min(1,y/445);
    layout.style.setProperty('--tp-day-progress',String(phase));
    layout.style.setProperty('--tp-plan-progress',String(Math.min(1,y/580)));
    layout.style.setProperty('--tp-story-progress',String(Math.min(1,y/505)));
   }
  };
  const request=()=>{if(!pending){pending=true;requestAnimationFrame(sync);}};
  window.addEventListener('scroll',request,{passive:true});
  window.addEventListener('pageshow',request);
  media.addEventListener('change',request);
  if(exactWeb&&window.parent!==window)window.addEventListener('message',e=>{
   if(e.origin!==location.origin||e.source!==window.parent||!e.data||e.data.type!==kind||!finite(e.data.y))return;
   parentY=clamp(e.data.y,580);request();
  });
  layout.setAttribute('data-tp-depth','');
  request();
 }
 if(frame&&exactWeb){
  let position=null,pending=false,previous=-1;
  const visible=()=>!frame.hidden&&frame.isConnected;
  const measure=()=>{
   if(!visible()){position=null;return;}
   // Stock Topouh uses a fixed, viewport-sized iframe, so the Club owns the scroll.
   // If fitted into normal flow, relay only the page's offset within its top edge.
   position=getComputedStyle(frame).position==='fixed'?null:frame.getBoundingClientRect().top+window.scrollY;
  };
  const sync=()=>{
   pending=false;
   if(!visible()||!frame.contentWindow)return;
   const y=media.matches||position===null?0:Math.round(clamp(window.scrollY-position,580));
   if(y===previous)return;
   previous=y;
   frame.contentWindow.postMessage({type:kind,y},location.origin);
  };
  const request=()=>{if(!pending){pending=true;requestAnimationFrame(sync);}};
  const refresh=()=>{measure();request();};
  window.addEventListener('scroll',request,{passive:true});
  window.addEventListener('resize',refresh,{passive:true});
  window.addEventListener('pageshow',refresh);
  frame.addEventListener('load',()=>{previous=-1;refresh();});
  media.addEventListener('change',request);
  new MutationObserver(refresh).observe(frame,{attributes:true,attributeFilter:['hidden','style','class']});
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(refresh).observe(frame);
  refresh();
 }
})();
