/* The club's greeting text. No text or voice data is sent to a service. */
(() => {
  'use strict';
  const phrases=[
    ['Привет, Алиса! Как здорово, что ты здесь!', 'bright'],
    ['Ух-ух, Алиса! Я рада тебя видеть!', 'bright'],
    ['Здравствуй, Алиса! Как твоё настроение?', 'soft'],
    ['Алиса, привет! Вот мы и встретились!', 'bright'],
    ['Привет, Алиса! Крылышком тебе машу!', 'play'],
    ['Алиса, ку-ку! Это я, Ух!', 'play'],
    ['С возвращением, Алиса! Я по тебе скучала.', 'soft'],
    ['Привет, Алиса! Устроилась поудобнее?', 'soft'],
    ['Алиса, привет! Что сегодня откроем?', 'bright'],
    ['Ух-ух! Привет, Алиса! Дай крыло!', 'play'],
    ['Привет, Алиса! Я тут, рядом.', 'soft'],
    ['Здорово, Алиса! Готова к приключениям?', 'bright'],
    ['Алиса, привет! Хочешь узнать мой секрет?', 'soft'],
    ['Привет, Алиса! Лови совиное объятие!', 'play'],
    ['Снова вместе, Алиса! Привет!', 'bright'],
    ['Алиса, привет! Сегодня можно не спешить.', 'soft'],
    ['Привет, Алиса! Я припасла для тебя улыбку.', 'soft'],
    ['Алиса, привет! Пёрышки в порядке, можно начинать!', 'play'],
    ['Как хорошо, что ты заглянула, Алиса! Привет!', 'bright'],
    ['Ух ты, это Алиса! Привет, подружка!', 'play']
  ].map(([text,tone])=>Object.freeze({text,tone}));
  function makeDeck(random=Math.random){
    let queue=[],previous=-1;
    return ()=>{
      if(!queue.length){
        queue=phrases.map((_,i)=>i);
        for(let i=queue.length-1;i>0;i--){
          const j=Math.floor(random()*(i+1));
          [queue[i],queue[j]]=[queue[j],queue[i]];
        }
        if(queue[queue.length-1]===previous){
          const n=queue.length-1;
          [queue[0],queue[n]]=[queue[n],queue[0]];
        }
      }
      previous=queue.pop();
      return previous;
    };
  }
  // Reuse the already-published «Привет, Алиса!» clip if a local Russian
  // voice is missing. Never send the greeting text to a network TTS engine.
  const clip=new URL('../../audio/uh/15wbr9l.mp3',document.currentScript.src).href;
  const expression={bright:[1.47,1.03,1.04],soft:[1.25,.92,.94],play:[1.58,1.09,1.12]};
  let player,active,timer=0,serial=0;
  const audio=()=>window.TopouhAudio;
  function stop(){
    ++serial;
    clearTimeout(timer);
    if(active){
      active.onstart=active.onend=active.onerror=null;
      window.speechSynthesis.cancel();
      active=null;
    }
    if(player&&!player.paused)player.pause();
    audio()?.duck(false);
  }
  function play(i){
    const entry=phrases[i];
    if(!entry)return false;
    stop();
    if(audio()?.get()?.effects===false)return true;
    const turn=serial, [pitch,rate,clipRate]=expression[entry.tone];
    const finish=()=>{
      if(turn!==serial)return;
      clearTimeout(timer);
      active=null;
      audio()?.duck(false);
    };
    const useClip=()=>{
      if(turn!==serial)return;
      clearTimeout(timer);
      if(active){
        active.onstart=active.onend=active.onerror=null;
        window.speechSynthesis.cancel();
        active=null;
      }
      try{
        player ||= new Audio(clip);
        player.onended=player.onerror=finish;
        player.currentTime=0;
        player.playbackRate=clipRate;
        player.play().catch(finish);
      }catch(_){finish();}
    };
    audio()?.duck(true);
    try{
      const tts=window.speechSynthesis;
      const voice=tts?.getVoices().find(v=>v.localService===true&&/^ru(?:-|_|$)/i.test(v.lang));
      if(voice){
        const u=new SpeechSynthesisUtterance(entry.text);
        u.voice=voice;u.lang=voice.lang;u.pitch=pitch;u.rate=rate;
        active=u;
        u.onstart=()=>clearTimeout(timer);u.onend=finish;u.onerror=useClip;
        timer=setTimeout(useClip,800);
        tts.cancel();tts.speak(u);
        return true;
      }
    }catch(_){}
    useClip();
    return true;
  }
  window.addEventListener('pagehide',stop);
  window.addEventListener('topouh-audio-change',()=>{
    if(audio()?.get()?.effects===false)stop();
  });
  window.TopouhGreetings=Object.freeze({phrases:Object.freeze(phrases),makeDeck,play,stop});
})();
