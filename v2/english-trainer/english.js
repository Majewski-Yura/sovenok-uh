(() => {
 'use strict';
 const ns='http://www.w3.org/2000/svg',say=window.speechSynthesis;
 const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e};
 function art(id){
  if(typeof id!=='string'||!/^[-a-z0-9]+$/.test(id))return null;
  const p=document.createElementNS(ns,'svg'),u=document.createElementNS(ns,'use');
  p.setAttribute('viewBox','0 0 64 64');p.setAttribute('aria-hidden','true');u.setAttribute('href','belarusian-assets/workshop-icons.svg#vis-'+id);
  p.append(u);return p;
 }
 let sequence=0,timer=0,playing=null;
 const show=s=>{window.TopouhAudio?.duck(s);};
 function stop(){
  sequence++;clearTimeout(timer);
  if(playing){try{say?.cancel()}catch(_){}playing=null;show(false);}
 }
 function speak(text,done){
  stop();
  if(!say||typeof SpeechSynthesisUtterance!=='function'){done(false);return}
  const ticket=sequence, phrase=new SpeechSynthesisUtterance(text);playing=phrase;
  phrase.lang='en-GB';phrase.rate=.79;
  const voices=say.getVoices?.()||[];
  const voice=voices.find(v=>v.localService&&/^en[-_]GB$/i.test(v.lang))||voices.find(v=>v.localService&&/^en[-_]/i.test(v.lang));
  if(!voice){playing=null;done(false);return;}
  phrase.voice=voice;
  const finish=ok=>{if(ticket!==sequence)return;clearTimeout(timer);playing=null;show(false);done(ok);};
  phrase.onend=()=>finish(true);phrase.onerror=()=>finish(false);
  show(true);timer=setTimeout(()=>{try{say.cancel()}catch(_){}finish(false)},9000);
  try{say.speak(phrase)}catch(_){finish(false);}
 }
 function btn(label,fn){const b=make('button',label,'eng-listen');b.type='button';b.addEventListener('click',fn);return b;}
 function pronounce(word){
  const status=make('span','','eng-speech-status');status.setAttribute('role','status');
  const b=btn('Послушать',()=>{status.textContent='';speak(word,ok=>{if(!ok)status.textContent='Озвучка недоступна в этом браузере.';});});
  b.setAttribute('aria-label','Послушать «'+word+'»');return [b,status];
 }
 function vocab(cardList) {
  const panel=make('section','','eng-vocab');
  panel.append(make('h3','Перед началом'),make('p','Посмотри на три карточки. Можно услышать, как звучат слова.'));
  const grid=make('div','','eng-vocab-grid');
  for(const [word,ru,id] of cardList){
   const card=make('article','','eng-vocab-card'),icon=art(id),head=make('b',word);head.lang='en-GB';
   if(icon)card.append(icon); card.append(head,make('p',ru),...pronounce(word));grid.append(card);
  }
  panel.append(grid);return panel;
 }
 function prompt(step){
  if(!step.art&&!step.audio&&!step.reading)return null;
  const box=make('section','','eng-stimulus');box.setAttribute('aria-label','Материал задания');
  if(step.art){const p=art(step.art);if(p)box.append(p);}
  if(step.altArt){const alt=make('span',step.altArt,'tvb-sr');box.append(alt);}
  if(step.reading){const line=make('p',step.reading,'eng-read');line.lang='en-GB';box.append(line);}
  if(step.audio){
   const text=make('p',step.audio,'eng-transcript');text.hidden=true;text.lang='en-GB';
   const status=make('span','','eng-speech-status');status.setAttribute('role','status');
   const speakBtn=btn('Послушать',()=>{status.textContent='';speak(step.audio,ok=>{
    if(!ok){status.textContent='Озвучка недоступна. Можно прочитать слова.';text.hidden=false;}
   });});
   const transcript=btn('Показать текст',()=>{text.hidden=!text.hidden;transcript.textContent=text.hidden?'Показать текст':'Скрыть текст';transcript.setAttribute('aria-expanded',String(!text.hidden));});
   transcript.setAttribute('aria-expanded','false');
   box.append(speakBtn,transcript,text,status);
  }
  return box;
 }
 window.addEventListener('pagehide',stop);
 window.TopouhEnglish=Object.freeze({art,vocab,prompt,stop});
})();
