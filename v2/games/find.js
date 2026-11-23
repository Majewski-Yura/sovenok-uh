(() => {
  'use strict';
  const colour = ['#b06ceb', '#f48291', '#44baa6', '#f4bd55', '#719de7', '#dc8db6', '#76aa5a', '#bf8b5b', '#8882ea'];
  const pick = (rng, n) => Math.floor(rng() * n);
  const shuffle = (values, rng) => {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i--) {
      const j = pick(rng, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  const art = (button, paths, fill = '', box = '0 0 72 60') => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', box);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.style.color = fill;
    svg.innerHTML = paths;
    button.prepend(svg);
    return svg;
  };
  const shell = '<path d="M12 44C3 28 15 9 35 8c23-1 35 18 26 35l-15 2-5 8H31l-5-8Z" fill="currentColor"/><path d="M26 43C16 31 16 21 20 16m12 27C26 29 27 16 30 11m8 32c3-13 4-25 2-32m5 32c11-14 12-21 8-27" fill="none" stroke="#fff" stroke-opacity=".66" stroke-width="2.6" stroke-linecap="round"/>';
  const star = '<path d="m35 7 7 15 18 1-13 12 4 17-16-9-15 9 3-17-12-12 17-2Z" fill="#ffcf62" stroke="#a76516" stroke-width="2.5" stroke-linejoin="round"/><circle cx="31" cy="31" r="1.5" fill="#683612"/><circle cx="39" cy="31" r="1.5" fill="#683612"/><path d="M33 35q2 3 4 0" fill="none" stroke="#683612" stroke-width="1.4" stroke-linecap="round"/>';
  const css = `
    .tgf-panel { --tgf-ink:#39275b; padding:clamp(14px,3vw,28px); border-radius:26px; color:var(--tgf-ink); display:grid; gap:12px; }
    .tgf-panel p {margin:0}
    .tgf-shell {background:radial-gradient(ellipse at top,#ffedfb,#f2edff 65%,#dce8fd)}
    .tgf-post {background:radial-gradient(ellipse at top,#fff7dc,#ffe9e3 72%,#fbe1f7)}
    .tgf-map {background:radial-gradient(ellipse at 25% 15%,#e9e4ff,#e6efff 60%,#dfecfb)}
    .tgf-grid {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;max-width:490px;width:100%;margin-inline:auto}
    .tgf-card {min-width:0; overflow-wrap:anywhere; min-height:66px; display:grid; justify-items:center; align-content:center; gap:3px; background:#fffaf4; border:2px solid #fff; border-radius:18px; box-shadow:0 3px 0 #49335828; color:#39275b; font:inherit; padding:6px; cursor:pointer; transition:translate .16s,box-shadow .16s}
    .tgf-card svg {display:block;width:min(100%,62px);height:46px}
    .tgf-card:hover:not([aria-disabled=true]) {translate:0 -3px;box-shadow:0 6px 0 #49335828}
    .tgf-card:focus-visible, .tgf-action:focus-visible {outline:3px solid #5a399c;outline-offset:2px}
    .tgf-card[aria-disabled=true] {cursor:default}
    .tgf-card[data-open=true] {background:#fff2cb;border-color:#b58036}
    .tgf-card[data-miss=true] {background:#f3ecff;border-color:#bba8d7}
    .tgf-action {justify-self:start;border:0;border-radius:22px;background:#53407c;color:white;padding:9px 15px;font:inherit;cursor:pointer}
    .tgf-live {min-height:2.7em;color:#4e3a70}
    .tgf-mapgrid {grid-template-columns:repeat(4,minmax(0,1fr))}
    .tgf-mapgrid .tgf-card {background:#f9faff;min-height:44px;border-radius:12px}
    .tgf-mapgrid .tgf-card svg {height:22px}
    .tgf-mapgrid .tgf-card[data-open=true] {background:#fff2cb;border-color:#b58036}
    @media(prefers-reduced-motion:reduce){.tgf-card{transition:none}.tgf-card:hover:not([aria-disabled=true]){translate:none}}
  `;
  const setup = (p, ctx, style, hint) => {
    const {el} = ctx;
    const panel = el('section', '', 'tgf-panel ' + style);
    panel.append(el('style', css));
    const label = el('p', hint);
    const grid = el('div', '', 'tgf-grid');
    const live = el('p', '', 'tgf-live');
    live.setAttribute('role', 'status');
    live.setAttribute('aria-live', 'polite');
    live.setAttribute('aria-atomic','true');
    panel.append(label, grid, live);
    p.append(panel);
    return {panel, grid, label, live};
  };
  const add = (ctx, host, label, fn, cls = 'tgf-card') => {
    const b = ctx.button(label, fn, cls);
    b.classList.add(cls);
    host.append(b);
    return b;
  };
  const names = ['Лиловая','Розовая','Мятная','Медовая','Голубая','Малиновая'];
  const shellGame = {
    id:'find-shells',title:'Ракушки на отливе',category:'find',accent:'#b78ce9',
    description:'Запомни две ракушки, под которыми спрятались морские звёзды.',
    mount(p, ctx) {
      const {panel,grid,label,live}=setup(p,ctx,'tgf-shell','Две морские звезды прячутся под ракушками. Запомни их места, затем накрой звёзды. Можно смотреть сколько угодно.');
      const order=shuffle([0,1,2,3,4,5],ctx.rng);
      const hidden=new Set(shuffle([0,1,2,3,4,5],ctx.rng).slice(0,2));
      const found=new Set();
      let phase='look';
      const cards=order.map((c,i) => add(ctx,grid,names[c],() => {
        if (phase!=='play' || found.has(i)) return;
        if (!hidden.has(i)) {
          cards[i].dataset.miss='true';
          live.textContent=names[c]+' ракушка пуста. Вспомни, где ты видел звёздочку.';
          return;
        }
        found.add(i);
        paint();
        if (found.size===2) {
          phase='done';
          ctx.finish('Обе морские звезды найдены!');
          paint();
        } else live.textContent='Нашлась первая звезда. Под какой ракушкой вторая?';
      }));
      const paint=()=>{
        cards.forEach((b,i)=>{
          const c=order[i];
          const visible=(phase==='look'&&hidden.has(i))||found.has(i);
          const note=visible ? ' · звезда' : '';
          b.textContent=names[c]+note;
          b.setAttribute('aria-label',names[c]+' ракушка'+(visible?', под ней звезда':''));
          b.dataset.open=String(visible);
          b.setAttribute('aria-disabled',String(phase!=='play'||found.has(i)));
          art(b,shell+(visible?'<g transform="translate(37 13) scale(.54)">'+star+'</g>':''),colour[c]);
        });
      };
      const action=add(ctx,panel,'Накрыть ракушками',()=>{
        if (phase==='done') return;
        phase=phase==='look'?'play':'look';
        live.textContent='';
        label.textContent=phase==='look'?'Две звезды снова видны. Запоминай столько, сколько нужно.':'Открой те две ракушки, под которыми были звёзды.';
        cards.forEach(b=>delete b.dataset.miss);
        paint();
        action.textContent=phase==='look'?'Накрыть ракушками':'Посмотреть ещё раз';
        if(phase==='play') cards[0].focus();
      },'tgf-action');
      paint();
    }
  };
  const motifs = [
    ['Луна','<path d="M43 12a20 20 0 1 0 15 30C40 46 29 28 43 12Z" fill="currentColor"/>'],
    ['Лист','<path d="M15 45Q14 15 55 13q0 35-32 36Zm5 1 27-24" fill="currentColor" stroke="currentColor" stroke-width="3"/>'],
    ['Облако','<path d="M19 44a10 10 0 1 1 4-19 14 14 0 0 1 27 3 8 8 0 1 1 4 16Z" fill="currentColor"/>']
  ];
  const ribbons=[['Точки','<circle cx="29" cy="47" r="2"/><circle cx="36" cy="47" r="2"/><circle cx="43" cy="47" r="2"/>'],['Полоска','<path d="M27 47h18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>']];
  const postGame={
    id:'find-post',title:'Бюро открыток',category:'find',accent:'#f49f7b',
    description:'Найди одну открытку, которая подходит сразу по печати и по ленточке.',
    mount(p,ctx){
      const {grid,label,live}=setup(p,ctx,'tgf-post','');
      const targets=shuffle([0,1,2,3,4,5],ctx.rng).slice(0,3);
      let round=0;
      const draw=()=>{
        const wanted=targets[round];
        label.textContent=`Письмо ${round+1} из 3. Найди открытку: печать «${motifs[wanted%3][0]}», ленточка «${ribbons[wanted%2][0]}».`;
        grid.replaceChildren();
        let done=false;
        shuffle([0,1,2,3,4,5],ctx.rng).forEach((k)=>{
          const m=motifs[k%3],r=ribbons[k%2];
          const button=add(ctx,grid,`${m[0]} · ${r[0]}`,()=>{
            if(done) return;
            if(k===wanted){
              done=true;
              button.dataset.open='true';
              if(++round===targets.length){
                [...grid.children].forEach(c=>c.setAttribute('aria-disabled','true'));
                ctx.finish('Все три открытки попали в нужные конверты!');
              }
              else {live.textContent='Открытка подошла по двум подсказкам. Теперь следующее письмо.'; const next=add(ctx,grid,'Следующее письмо',()=>{draw();grid.firstElementChild.focus();},'tgf-action');next.focus();}
            } else {
              button.dataset.miss='true';
              live.textContent=k%3===wanted%3?'Печать совпадает, но ленточка другая.':k%2===wanted%2?'Ленточка совпадает, но печать другая.':'Пока не совпала ни печать, ни ленточка. Сверь обе подсказки.';
            }
          });
          art(button,'<rect x="9" y="6" width="54" height="49" rx="8" fill="#fff1dd" stroke="#794b6680" stroke-width="2"/><g transform="translate(10 1) scale(.72 .84)">'+m[1]+'</g><g fill="currentColor">'+r[1]+'</g>',colour[k]);
        });
      };
      draw();
    }
  };
  const letters=['А','Б','В','Г'];
  const coord=(n)=>letters[n%4]+(1+Math.floor(n/4));
  const mapGame={
    id:'find-stars',title:'Карта тихих звёзд',category:'find',accent:'#92a4ee',
    description:'Освети три точки на небесной сетке, читая буквы и номера.',
    mount(p,ctx){
      const {grid,label,live}=setup(p,ctx,'tgf-map','');
      grid.classList.add('tgf-mapgrid');
      const chosen=shuffle([0,1,2,3,4,5,6,7,8,9,10,11],ctx.rng).slice(0,3);
      let step=0;
      const prompt=()=>{const c=chosen[step];label.textContent=`Звезда ${step+1} из 3: найди столбец ${letters[c%4]} и строку ${1+Math.floor(c/4)}. Буква идёт первой.`;};
      for(let i=0;i<12;i++){
        const b=add(ctx,grid,coord(i),()=>{
          if(step===3 || b.dataset.open==='true') return;
          if(i!==chosen[step]){
            b.dataset.miss='true';
            live.textContent=coord(i)+': это другая точка. Сверь букву столбца и номер строки.';
            return;
          }
          b.dataset.open='true';
          b.setAttribute('aria-label',coord(i)+', звезда зажжена');
          b.setAttribute('aria-disabled','true');
          art(b,star);
          [...grid.children].forEach(c=>delete c.dataset.miss);
          if(++step===3) {
            [...grid.children].forEach(c=>c.setAttribute('aria-disabled','true'));
            label.textContent='Три точки теперь светятся.';
            ctx.finish('Созвездие зажглось!');
          } else {prompt();live.textContent='Звезда зажглась. '+label.textContent;}
        });
      }
      prompt();
    }
  };
  window.TopouhGames.push(shellGame,postGame,mapGame);
})();
