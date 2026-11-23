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
  window.TopouhGreetings=Object.freeze({phrases:Object.freeze(phrases),makeDeck});
})();
