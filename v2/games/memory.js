(function(){
  'use strict';
  const catalog=window.TopouhGames=window.TopouhGames||[];
  const sprites=[['leaf','лист','<path d="M10 29c0-11 9-18 24-19 2 17-7 27-17 27-5 0-7-3-7-8Z" fill="#77b999"/><path d="M10 38c4-6 9-11 16-16" stroke="#23694b" stroke-width="3" stroke-linecap="round" fill="none"/>'],
    ['bell','колокольчик','<path d="m11 32 4-14c2-7 12-9 16-2l5 16Z" fill="#ffca75"/><path d="M10 32h27" stroke="#985830" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="36" r="3" fill="#b87034"/><circle cx="24" cy="11" r="3" fill="#b87034"/>'],
    ['kettle','чайник','<path d="M30 20h6c8 0 8 12-1 12h-8" stroke="#5374aa" stroke-width="4" fill="none"/><path d="m16 23-10-4 7 12" fill="#5b86be"/><path d="M12 21c0-3 3-5 6-5h8c4 0 7 3 7 8v8c0 5-4 7-8 7h-5c-5 0-8-3-8-7Z" fill="#87afe0"/><path d="M19 15h8" stroke="#4a69a4" stroke-width="3" stroke-linecap="round"/>'],
    ['kite','воздушный змей','<path d="m24 8 13 13-13 15L11 21Z" fill="#e5a5d6"/><path d="M24 8v28M11 21h26m-13 15c0 5 7 3 6 7" fill="none" stroke="#9e558e" stroke-width="2" stroke-linecap="round"/>'],
    ['shell','ракушка','<path d="M24 12C11 7 6 22 10 28c2 3 7 5 10 10h8c4-4 8-7 10-12 4-9-8-19-14-14Z" fill="#fab48e"/><path d="m16 19 7 14m7-13-4 13" stroke="#af6558" fill="none" stroke-width="2.4" stroke-linecap="round"/>'],
    ['moon','луна','<path d="M31 9c-8 5-11 17-5 24 3 4 8 5 11 4-8 7-18 4-24-2-7-8-5-20 3-25 4-3 10-4 15-1Z" fill="#e7ba65"/><path d="M37 14v8m-4-4h8" stroke="#9a7abd" stroke-width="2" stroke-linecap="round"/>'],
    ['mitten','варежка','<path d="M15 35c-5-3-7-7-5-9 2-3 5-1 8 1l-1-13c0-9 15-9 17 0l1 15c0 5-3 10-10 10-4 0-8-2-10-4Z" fill="#a5a4e4"/><path d="M17 32c5 2 10 3 16 1" stroke="#5d57a4" stroke-width="2" fill="none"/>'],
    ['flower','цветок','<path d="M25 25v14c6-1 9-4 12-8-6-1-9 0-12 5" fill="#79ba9b" stroke="#427b61" stroke-width="2"/><path d="M24 13c-3-8-13-3-10 3-9 0-7 10 0 10-2 7 8 9 11 2 5 5 13-1 7-6 7-4 2-12-5-8Z" fill="#f1a3aa"/><circle cx="23" cy="21" r="4" fill="#d28a38"/>']
  ];
  const carton=['carton','коробочка','<path d="M5 18 24 10l19 8v18l-19 8-19-8Z" fill="#e6aa73" stroke="#5f4539" stroke-width="2.3" stroke-linejoin="round"/><path d="m5 18 19 8 19-8-19-8Z" fill="#ffe3a5" stroke="#5f4539" stroke-width="2.1" stroke-linejoin="round"/><path d="M24 26v18l19-8V18Z" fill="#c58362" stroke="#5f4539" stroke-width="2.1" stroke-linejoin="round"/><path d="m18 12.5 19 8v5l-5 2v-5l-19-8Z" fill="#fff3d5" stroke="#765546" stroke-width="1.3" stroke-linejoin="round"/><path d="M10 30l7 3" fill="none" stroke="#80513b" stroke-width="2" stroke-linecap="round"/>'];
  const css=`
  .tm-mem{--tm-ink:#253847;--tm-soft:#e3e8fa;color:var(--tm-ink);display:grid;gap:.74rem;margin:.3rem 0;text-align:left}
  .tm-mem p{margin:.1rem 0;line-height:1.43}
  .tm-mem-status{min-height:1.4em;font-weight:750;color:#455775}
  .tm-mem-grid,.tm-mem-ribbon,.tm-mem-moves{display:grid;grid-template-columns:repeat(var(--tm-cols,4),minmax(0,1fr));gap:clamp(.34rem,1vw,.72rem);align-items:stretch}
  .tm-mem .tm-mem-card,.tm-mem .tm-mem-choice,.tm-mem .tm-mem-next,.tm-mem-cardview{border:2px solid #c5cce5;color:var(--tm-ink);background:#f8fbff;border-radius:1rem;padding:.38rem .27rem;min-height:3.7rem;display:flex;flex-direction:column;gap:.14rem;align-items:center;justify-content:center;font:750 clamp(.68rem,2.4vw,1rem)/1.15 system-ui,sans-serif;text-align:center}
  .tm-mem .tm-mem-card,.tm-mem .tm-mem-choice,.tm-mem .tm-mem-next{cursor:pointer}
  .tm-mem button:focus-visible{outline:3px solid #52358c;outline-offset:3px}
  .tm-mem .tm-mem-card:not([aria-pressed=true]){background:repeating-linear-gradient(135deg,#ecf0fb,#ecf0fb 10px,#e7ebf7 10px,#e7ebf7 20px)}
  .tm-mem .tm-mem-card[aria-pressed=true],.tm-mem .tm-mem-choice:hover{background:#fbf0d7;border-color:#b28b64}
  .tm-mem .tm-mem-card[aria-disabled=true]{background:#e2f2e9;border-color:#84b79e;cursor:default}
  .tm-mem .tm-mem-next{background:#e5def5;border-color:#a79bcc;padding:.55rem .8rem;width:max-content;min-height:2.7rem}
  .tm-mem .tm-mem-next:hover{background:#dcd0f1}
  .tm-mem-icon{width:clamp(2rem,6vw,3.2rem);height:auto;aspect-ratio:1;overflow:visible}
  .tm-mem-card:not([aria-pressed=true]) .tm-mem-icon{width:clamp(2.65rem,7vw,3.45rem)}
  .tm-mem-cardview{background:#f8f4ea;position:relative}
  .tm-mem-rooftop .tm-mem-icon{box-sizing:content-box;padding:.15rem .42rem .3rem;background:#f3dfda;border-bottom:.16rem solid #aa6b64;border-radius:40% 40% .32rem .32rem}
  .tm-mem-cardview.tm-empty{border-style:dashed;background:#f8f9fd;min-height:4.9rem;color:#6b7091}
  .tm-mem-step{display:block;padding:.25rem .58rem;background:#edf0fc;border-radius:100px;width:max-content;font-size:.82rem;font-weight:800}
  .tm-mem-hide[hidden]{display:none!important}
  `;
  function styles(){
    if(document.getElementById('tm-mem-css'))return;
    const el=document.createElement('style');el.id='tm-mem-css';el.textContent=css;document.head.append(el);
  }
  function mix(values,rng){const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function picture(el,item,label=true){
    el.replaceChildren();
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 48 48');svg.setAttribute('aria-hidden','true');svg.classList.add('tm-mem-icon');svg.innerHTML=item[2];
    el.append(svg);
    if(label){const span=document.createElement('span');span.textContent=item[1];el.append(span)}
  }
  function frame(p,ctx,instruction){
    styles();
    const m=ctx.el('section',null,'tm-mem');p.append(m);
    const step=ctx.el('span',null,'tm-mem-step'), text=ctx.el('p',instruction), live=ctx.el('p','','tm-mem-status');
    live.setAttribute('role','status');live.setAttribute('aria-live','polite');m.append(step,text);
    return {m,step,text,live};
  }
  const pairs={
    id:'memory-owl-closet',title:'Ух наводит порядок',category:'memory',accent:'#d9e8f9',
    description:'Открывай коробочки и находи пары вещей.',
    mount(p,ctx){
      const {m,step,text,live}=frame(p,ctx,'Открой две коробочки. Если в них одинаковые вещи, коробочки останутся открытыми.');
      const board=ctx.el('div',null,'tm-mem-grid');board.setAttribute('role','group');board.setAttribute('aria-label','Коробочки');m.append(board,live);
      let round=0;
      const newRound=()=>{
        round++;step.textContent='Полка '+round+' из 2';live.textContent='';
        const need=round===1?3:4,pick=mix(sprites,ctx.rng).slice(0,need), deck=mix(pick.flatMap(x=>[x,x]),ctx.rng);
        board.style.setProperty('--tm-cols',need);board.replaceChildren();
        let first=null,found=0,locked=false;
        const cards=deck.map((item,i)=>{
          const card=ctx.button('',()=>choose(i),'tm-mem-card');
          const hide=()=>{
            picture(card,carton,false);
            card.setAttribute('aria-label','Коробочка '+(i+1)+', закрыта');
            card.setAttribute('aria-pressed','false');
          };
          hide();board.append(card);
          return {card,item,hide,hit:false};
        });
        function choose(i){
          const a=cards[i];if(locked||a.hit||i===first)return;
          picture(a.card,a.item);a.card.setAttribute('aria-label','Коробочка '+(i+1)+': '+a.item[1]);a.card.setAttribute('aria-pressed','true');
          if(first===null){first=i;live.textContent='Открыта коробочка: '+a.item[1]+'. Выбери вторую.';return}
          const j=first,b=cards[j];first=null;
          if(a.item===b.item){
            a.hit=b.hit=true;for(const o of [a,b])o.card.setAttribute('aria-disabled','true');
            found++;live.textContent='Пара найдена: '+a.item[1]+'. '+found+' из '+need+'.';
            if(found===need){
              if(round===2){ctx.finish('Две полки разобраны. Ух нашла все пары!');return}
              locked=true;const more=ctx.button('Следующая полка',()=>{
                more.remove();newRound();board.querySelector('button').focus();
              },'tm-mem-next');m.append(more);more.focus();
            }
            return;
          }
          locked=true;live.textContent='Это '+b.item[1]+' и '+a.item[1]+'. Нажми «Закрыть коробочки», когда запомнишь.';
          const close=ctx.button('Закрыть коробочки',()=>{
            a.hide();b.hide();locked=false;close.remove();a.card.focus();
          },'tm-mem-next');m.append(close);close.focus();
        }
      };
      newRound();
    }
  };
  const pattern={
    id:'memory-rooftop-trail',title:'Тропа по крышам',category:'memory',accent:'#e2d9f6',
    description:'Запомни площадки с символами слева направо и повтори маршрут.',
    mount(p,ctx){
      const {m,step,text,live}=frame(p,ctx,'Ух покажет маршрут слева направо. Запомни его и повтори.');
      const ribbon=ctx.el('div',null,'tm-mem-ribbon'), moves=ctx.el('div',null,'tm-mem-moves');
      moves.setAttribute('role','group');moves.setAttribute('aria-label','Следующая площадка');moves.classList.add('tm-mem-hide');
      m.append(ribbon,moves,live);
      let round=0,seq=[],done=0,controls=[],view=null;
      const rooftop=(node,item)=>{node.classList.add('tm-mem-rooftop');picture(node,item)};
      function display(){
        round++;done=0;
        step.textContent='Маршрут '+round+' из 3';
        text.textContent='Запомни символы на площадках слева направо. Смотри столько, сколько нужно.';
        const bag=mix(sprites,ctx.rng).slice(0,4);seq=mix(bag,ctx.rng).slice(0,round+1);
        ribbon.style.setProperty('--tm-cols',seq.length);moves.style.setProperty('--tm-cols',4);
        ribbon.replaceChildren();moves.replaceChildren();moves.hidden=true;
        live.textContent='';
        seq.forEach((item,i)=>{const box=ctx.el('div',null,'tm-mem-cardview');rooftop(box,item);box.setAttribute('aria-label',(i+1)+': '+item[1]);ribbon.append(box)});
        view=ctx.button('Запомнила, пора идти',()=>{
          view.remove();view=null;
          text.textContent='Проведи Ух по тем же площадкам. Можно посмотреть маршрут снова.';
          fill();moves.hidden=false;moves.querySelector('button').focus();
          const review=ctx.button('Показать маршрут ещё раз',()=>{
            controls.forEach(b=>b.disabled=true);
            seq.forEach((item,i)=>{const el=ribbon.children[i];rooftop(el,item);el.classList.remove('tm-empty');el.setAttribute('aria-label',(i+1)+': '+item[1])});
            review.remove();view=ctx.button('Снова скрыть маршрут',()=>{
              view.remove();view=null;fill();for(const b of controls)b.disabled=false;
              controls[0].focus();m.append(review);view=review;
            },'tm-mem-next');m.append(view);view.focus();
          },'tm-mem-next');m.append(review);view=review;
        },'tm-mem-next');m.append(view);
        controls=bag.map(item=>{
          const b=ctx.button('',()=>press(item),'tm-mem-choice');
          rooftop(b,item);moves.append(b);return b;
        });
      }
      function fill(){
        [...ribbon.children].forEach((el,i)=>{
          if(i<done){rooftop(el,seq[i]);el.classList.remove('tm-empty');el.setAttribute('aria-label',(i+1)+': '+seq[i][1]);return}
          el.textContent=String(i+1);el.classList.add('tm-empty');el.setAttribute('aria-label','Шаг '+(i+1)+', пока пусто');
        });
      }
      function press(item){
        if(done>=seq.length)return;
        if(item!==seq[done]){live.textContent='Не эта площадка. Попробуй другую, или посмотри маршрут снова.';return}
        done++;fill();live.textContent='Верно! Шаг '+done+' из '+seq.length+'.';
        if(done!==seq.length)return;
        controls.forEach(b=>b.disabled=true);if(view){view.remove();view=null}
        if(round===3){ctx.finish('Ух прошла все три маршрута!');return}
        const next=ctx.button('Следующий маршрут',()=>{next.remove();display();view.focus()},'tm-mem-next');m.append(next);next.focus();
      }
      display();
    }
  };
  const missing={
    id:'memory-market-stall',title:'Что забрала Ух?',category:'memory',accent:'#f6dfba',
    description:'Рассмотри прилавок и узнай, какая вещь исчезла.',
    mount(p,ctx){
      const {m,step,text,live}=frame(p,ctx,'Рассмотри вещи на прилавке. Когда будешь готова, Ух уберёт одну.');
      const board=ctx.el('div',null,'tm-mem-ribbon'), opts=ctx.el('div',null,'tm-mem-moves');
      opts.setAttribute('role','group');opts.setAttribute('aria-label','Что исчезло');opts.classList.add('tm-mem-hide');
      m.append(board,opts,live);let round=0,control=null;
      function show(){
        round++;step.textContent='Прилавок '+round+' из 3';
        board.style.setProperty('--tm-cols',round===3?4:3);opts.style.setProperty('--tm-cols',3);
        board.replaceChildren();opts.replaceChildren();opts.hidden=true;live.textContent='';
        text.textContent='Рассмотри прилавок. Когда будешь готова, Ух уберёт одну вещь.';
        const all=mix(sprites,ctx.rng), len=round===3?4:3, goods=all.slice(0,len);
        const index=Math.floor(ctx.rng()*len), target=goods[index];
        const spots=goods.map(item=>{const e=ctx.el('div',null,'tm-mem-cardview');picture(e,item);board.append(e);return e});
        control=ctx.button('Ух, спрячь одну вещь',()=>{
          control.remove();
          spots[index].textContent='Пусто';spots[index].classList.add('tm-empty');
          text.textContent='Что лежало на пустом месте?';opts.hidden=false;
          let found=false;
          mix([target,...all.slice(len,len+2)],ctx.rng).forEach(item=>{
            const c=ctx.button('',()=>{
              if(found)return;
              if(item!==target){c.disabled=true;live.textContent='Этой вещи на прилавке не было. Попробуй ещё.';opts.querySelector('button:not(:disabled)').focus();return}
              found=true;opts.querySelectorAll('button').forEach(b=>b.disabled=true);picture(spots[index],target);
              spots[index].classList.remove('tm-empty');live.textContent='Верно! Исчезла вещь: '+target[1]+'.';
              if(round===3){ctx.finish('Три прилавка проверены. Ух ничего не потеряла!');return}
              control=ctx.button('Следующий прилавок',()=>{control.remove();show();control.focus()},'tm-mem-next');
              m.append(control);control.focus();
            },'tm-mem-choice');picture(c,item);opts.append(c);
          });
          opts.querySelector('button').focus();
        },'tm-mem-next');m.append(control);
      }
      show();
    }
  };
  catalog.push(pairs,pattern,missing);
})();
