(() => {
 'use strict';
 const key='topouh-v2-github-audio-v1', src=new URL('background.mp3',document.currentScript.src);
 const defaults={music:true,effects:true};
 const read=()=>{try{const x=JSON.parse(localStorage.getItem(key));return Object.fromEntries(Object.keys(defaults).map(k=>[k,x?.[k]!==false]));}catch(_){return {...defaults}}};
 let prefs=read(),track=null,context=null,started=false,ducked=false,waiting=false;
 const C=window.AudioContext||window.webkitAudioContext;
 let owner;
 try {const host=window.parent.document; if(window.parent!==window&&['previewClub','beFrame','catalogueFrame'].includes(window.frameElement?.id))owner=window.parent.TopouhAudio;} catch(_){}
 function refresh(){
  if(!started)return;
  if(prefs.effects&&C){
   try{context ||= new C();if(context.state==='suspended')context.resume().catch(()=>{});}catch(_){}
  }
  if(!prefs.music){if(track&&!track.paused)track.pause();return;}
  if(!track){track=new Audio(src.href);track.loop=true;track.volume=ducked?.035:.13;}
  if(track.paused&&!waiting){
   waiting=true;track.play().catch(()=>{}).finally(()=>{waiting=false;if(!prefs.music&&!track.paused)track.pause()});
  }
 }
 const local={
  get:()=>({...prefs}),
  gesture:()=>{started=true;refresh()},
  set(k,on){if(!Object.hasOwn(defaults,k))return;prefs={...prefs,[k]:!!on};try{localStorage.setItem(key,JSON.stringify(prefs))}catch(_){}refresh();window.dispatchEvent(new Event('topouh-audio-change'));},
  duck(on){ducked=!!on;if(track)track.volume=ducked?.035:.13;},
  status:()=>({playing:!!track&&!track.paused,position:track?.currentTime??0}),
  tone(kind){
   if(!prefs.effects||context?.state!=='running')return;
   const notes={forward:[659.25,783.99],back:[587.33,493.88],finish:[523.25,659.25,783.99],tap:[605]};
   (notes[kind]||notes.tap).forEach((freq,i)=>{
    const n=context.createOscillator(),g=context.createGain(),t=context.currentTime+.008+i*.047;
    n.type='sine';n.frequency.value=freq;g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(.045,t+.022);g.gain.exponentialRampToValueAtTime(.0001,t+.16);
    n.connect(g).connect(context.destination);n.start(t);n.stop(t+.17);
   });
  }
 };
 window.TopouhAudio=owner||local;
 if(!owner)window.addEventListener('storage',e=>{if(e.key===key||e.key===null){prefs=read();if(!prefs.music)track?.pause();window.dispatchEvent(new Event('topouh-audio-change'));}});
 const activate=e=>{if(e.isTrusted)window.TopouhAudio.gesture()};
 ['pointerdown','pointerup','click','keydown'].forEach(n=>window.addEventListener(n,activate,{capture:true,passive:true}));
 document.addEventListener('DOMContentLoaded',()=>{
  const api=window.TopouhAudio, avatar=document.querySelector('header .topouh-player');
  if(!avatar)return;
  let trigger=avatar;
  const make=(tag,text,cls)=>{const x=document.createElement(tag);if(text)x.textContent=text;if(cls)x.className=cls;if(tag==='button')x.type='button';return x};
  if(avatar.tagName!=='BUTTON'){
   trigger=make('button','',avatar.className);trigger.append(...avatar.childNodes);avatar.replaceWith(trigger);
  }
  trigger.removeAttribute('onclick');trigger.onclick=null;
  trigger.classList.add('topouh-sound-trigger');trigger.setAttribute('aria-label','Алиса: настройки звука');trigger.setAttribute('aria-expanded','false');
  const menu=make('dialog','','topouh-sound-panel'), title=make('h2','Настройки звука'), close=make('button','×','topouh-sound-close');
  menu.id='topouh-sound-panel';title.id='topouh-sound-title';menu.setAttribute('aria-labelledby',title.id);trigger.setAttribute('aria-controls',menu.id);trigger.setAttribute('aria-haspopup','dialog');
  close.setAttribute('aria-label','Закрыть настройки звука');close.addEventListener('click',()=>menu.close());
  menu.append(title,close);
  const rows={};
  for(const [k,label] of [['music','Музыка'],['effects','Эффекты']]){
   const b=make('button','','topouh-sound-row'), name=make('span',label), status=make('span','','topouh-sound-state');
   b.append(name,status);b.setAttribute('aria-label',label);status.setAttribute('aria-hidden','true');menu.append(b);
   b.addEventListener('click',()=>{api.set(k,!api.get()[k]);repaint();});rows[k]=[b,status];
  }
  if(trigger.id==='meBtn'&&typeof window.meClick==='function'){
   const profile=make('button','Для родителей','topouh-sound-row');profile.addEventListener('click',()=>{menu.close();setTimeout(()=>window.meClick(),0)});menu.append(profile);
  }
  function repaint(){const s=api.get();for(const k in rows){rows[k][0].setAttribute('aria-pressed',String(s[k]));rows[k][1].textContent=s[k]?'Вкл.':'Выкл.';}}
  document.body.append(menu);
  trigger.onclick=()=>{repaint();menu.showModal();trigger.setAttribute('aria-expanded','true');rows.music[0].focus()};
  menu.addEventListener('close',()=>{trigger.setAttribute('aria-expanded','false');trigger.focus({preventScroll:true})});
  menu.addEventListener('click',e=>{if(e.target===menu){const r=menu.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)menu.close()}});
  window.addEventListener('topouh-audio-change',repaint);
 });
})();
