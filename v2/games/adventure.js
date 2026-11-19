(()=>{'use strict';
const registry=window.TopouhGames=window.TopouhGames||[];
const css=`
.adv-scene{color:#214e45;border-radius:24px;padding:clamp(13px,3vw,24px);background:var(--adv-bg,#ecf8e7);border:1px solid #c9e3cc;overflow:hidden}
.adv-scene p{margin:.6rem 0;line-height:1.45}.adv-banner{display:flex;align-items:center;gap:12px}.adv-banner strong{font-size:1.15rem}.adv-hero{width:49px;height:49px;flex:none}
.adv-options{display:grid;grid-template-columns:repeat(auto-fit,minmax(132px,1fr));gap:9px;margin-top:12px}
.adv-option{min-height:60px;border:2px solid transparent;border-radius:16px;padding:8px 10px;background:#fff;color:#174e44;font:inherit;font-weight:760;line-height:1.2;cursor:pointer;text-align:left;transition:background .15s,border-color .15s}
.adv-option:hover{border-color:#60ac82;background:#fffcf4}.adv-option:focus-visible,.adv-direction:focus-visible{outline:3px solid #493984;outline-offset:2px}
.adv-selected{background:#d9efbf;border-color:#4d9567}.adv-status{min-height:1.45em;font-weight:700;color:#265349;margin-top:10px}.adv-micro{font-size:.88rem;color:#355c51}
.adv-map{display:grid;grid-template-columns:repeat(5,minmax(35px,58px));justify-content:center;gap:5px;margin:9px auto 12px;max-width:100%}
.adv-cell{aspect-ratio:1.12;border-radius:11px;background:#c9edd3;display:grid;place-items:center;position:relative}.adv-cell.adv-rock{background:#dcddd0}.adv-cell.adv-start{background:#c3e4e5}.adv-cell.adv-goal{background:#fdea99}.adv-cell.adv-visited{box-shadow:inset 0 -3px #6096653a}
.adv-cell.adv-active{outline:2px solid #3c8460;outline-offset:-2px}.adv-cell svg{width:70%;height:73%;pointer-events:none}
.adv-keys{display:grid;grid-template-columns:repeat(3,minmax(42px,55px));gap:5px;justify-content:center}.adv-direction{width:100%;height:39px;background:white;border:1px solid #8fc2a3;color:#174e44;border-radius:10px;font:inherit;font-weight:bold;cursor:pointer}.adv-direction:hover{background:#fff1cc}
.adv-direction:nth-child(1){grid-area:1/2}.adv-direction:nth-child(2){grid-area:2/1}.adv-direction:nth-child(3){grid-area:2/2}.adv-direction:nth-child(4){grid-area:2/3}
.adv-pack-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.adv-pack-pill{padding:4px 10px;border-radius:20px;background:#fff1b6;color:#4d4319;font-size:.9rem;font-weight:700}
.adv-pack-check{margin-top:12px;border:0;border-radius:20px;background:#28664e;color:#fff;padding:10px 16px;min-height:42px;font:inherit;font-weight:bold;cursor:pointer}.adv-pack-check:focus-visible{outline:3px solid #493984;outline-offset:3px}
.adv-route-mark{white-space:nowrap;font-size:.82rem;letter-spacing:.075em;text-transform:uppercase;color:#285e4a}
@media(max-width:470px){.adv-options{grid-template-columns:repeat(2,minmax(105px,1fr))}.adv-scene{padding:12px}.adv-hero{width:39px;height:39px}}@media(prefers-reduced-motion:reduce){.adv-option{transition:none}}
`;
function scene(p,ctx,bg){
 if(!document.getElementById('adv-mini-css')) {const style=ctx.el('style',css);style.id='adv-mini-css';document.head.append(style);}
 const s=ctx.el('section',null,'adv-scene');s.style.setProperty('--adv-bg',bg);p.append(s);return s
}
function picture(el,key,classes='adv-hero'){
 const paths={
  dragon:'<path d="M5 25c2-3 4 0 9-3l4-11c2-6 10-7 15-2 2 2 2 5 5 7 5 3 3 11-3 12 2 5-3 10-9 10l-1 4-5-1v-4c-4-2-6-4-6-9-4 2-8 1-9-3Z" fill="#81a64d"/><path d="M17 15l-4-5 6-1-1-5 7 3 2-5 5 6" fill="#f4bf50"/><ellipse cx="26" cy="27" rx="7" ry="9" fill="#cfdf73"/><circle cx="26" cy="15" r="4" fill="#fff2cd"/><circle cx="27" cy="15" r="1.7" fill="#31250f"/><circle cx="36" cy="18" r="2" fill="#dc787b"/>',
  map:'<path d="m4 11 11-4 12 4 14-5v28l-13 6-12-4-12 4Z" fill="#f9dd87"/><path d="M15 7v28m13-23v28" stroke="#dbab53" stroke-width="2"/><path d="M8 31c7 0 3-13 11-13 5 0 10 10 17-4" fill="none" stroke="#476f55" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 4"/><circle cx="37" cy="13" r="4" fill="#e17a69"/>',
  rock:'<path d="m5 33 5-14 9-8 12 3 10 17-8 5H13Z" fill="#a6ad9c"/><path d="m10 19 12 5 9-10m-9 10-3 12" fill="none" stroke="#7e8e80" stroke-width="2.3"/>',
  flag:'<path d="M15 38V7m1 1c10-6 11 6 23 1v16c-10 5-15-6-23-1" fill="#f5a461" stroke="#aa6735" stroke-width="2.5" stroke-linecap="round"/><path d="M8 38h18" stroke="#a28345" stroke-width="2.5" stroke-linecap="round"/>',
  bag:'<path d="M18 14v-3a5 5 0 0 1 10 0v3" fill="none" stroke="#82575d" stroke-width="3"/><path d="M11 16q0-3 4-3h16q5 0 5 5v17q0 5-5 5H15q-5 0-5-5Z" fill="#efa588"/><rect x="16" y="25" width="14" height="12" rx="4" fill="#ce676d"/><path d="M16 29h14" stroke="#fff0ce" stroke-width="2"/>'
 };
 const wrap=document.createElementNS('http://www.w3.org/2000/svg','svg');
 wrap.setAttribute('viewBox','0 0 44 44');wrap.setAttribute('aria-hidden','true');wrap.setAttribute('class',classes);wrap.innerHTML=paths[key];el.append(wrap)
}
const live=(ctx)=>{const out=ctx.el('div','','adv-status');out.setAttribute('role','status');out.setAttribute('aria-live','polite');return out};
const pick=(arr,ctx)=>arr[Math.floor(ctx.rng()*arr.length)];
function shuffled(array,ctx){
 const out=[...array];for(let i=out.length-1;i>0;i--){const j=Math.floor(ctx.rng()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out
}
const trail=[
 {name:'У пристани',clue:'След ведёт по сухой тропе. У правильного указателя нарисована волна.',good:'Сухая тропа · волна',bad:['Сухая тропа · лист','Мокрый мост · волна'],why:'Сверь оба признака: сухая тропа и волна.'},
 {name:'Тихая роща',clue:'Топа запомнил круглую табличку и маленькую звезду.',good:'Круг · звезда',bad:['Круг · облако','Квадрат · звезда'],why:'Нужны оба признака: круглая форма и звезда.'},
 {name:'У водопада',clue:'Ищи две точки и стрелку влево.',good:'Две точки · ←',bad:['Три точки · ←','Две точки · →'],why:'Сначала посчитай точки, потом посмотри, куда ведёт стрелка.'},
 {name:'Под фонарём',clue:'Нужен указатель с месяцем, который прикреплён высоко.',good:'Высоко · месяц',bad:['Низко · месяц','Высоко · солнце'],why:'Месяц должен быть высоко. Совпадения одного признака мало.'},
 {name:'На развилке',clue:'На карте прямой мост и флажок с полоской.',good:'Прямой мост · полоска',bad:['Дугообразный мост · полоска','Прямой мост · точка'],why:'Мост должен быть прямым, а на флажке нужна полоска.'},
 {name:'Перед бухтой',clue:'Тропа идёт между соснами, и у неё квадратная табличка.',good:'Сосны · квадрат',bad:['Сосны · круг','Берёзы · квадрат'],why:'Посмотри на деревья и на форму таблички.'}];
registry.push({
 id:'adv-trail',title:'По следам Топы',category:'adventure',accent:'#8dcf9a',description:'Сверяй две подсказки и выбирай тропу.',
 mount(p,ctx){
 const s=scene(p,ctx,'#e7f7e9'),banner=ctx.el('div',null,'adv-banner');picture(banner,'map');
 const heading=ctx.el('strong'),phase=ctx.el('span','','adv-route-mark'),clue=ctx.el('p'),opts=ctx.el('div',null,'adv-options'),out=live(ctx);
 const lead=ctx.el('div');lead.append(phase,ctx.el('br'),heading);banner.append(lead);s.append(banner,clue,opts,out);
 const route=shuffled(trail,ctx).slice(0,3);let at=0,busy=false;
 function show(){const node=route[at];opts.replaceChildren();out.textContent='';phase.textContent='Тропа '+(at+1)+' из '+route.length;heading.textContent=node.name;clue.textContent=node.clue;
   for(const name of shuffled([node.good,...node.bad],ctx))opts.append(ctx.button(name,()=>{
      if(busy)return;
      if(name!==node.good){out.textContent=node.why;return}
      if(++at===route.length){busy=true;out.textContent='Мы у бухты!';ctx.finish('Топа нашёл бухту по трём подсказкам.');return}
      show();out.textContent='Указатель найден. Теперь новая развилка.';opts.querySelector('button')?.focus()
   },'adv-option'))
 }
 show()
 }
});
const grids=[
 ['S...#','.###.','...#.','##...','....G'],
 ['S.#..','..#..','#....','..##.','....G'],
 ['S..#.','.#.#.','.#...','...#.','##..G'],
 ['S#...','....#','###..','..#..','....G'],
];
registry.push({
 id:'adv-map',title:'Шаги по острову',category:'adventure',accent:'#95d7ca',description:'Проведи Топу по полю до флажка, обходя валуны.',
 mount(p,ctx){
 const s=scene(p,ctx,'#e3f7ec'),h=ctx.el('div',null,'adv-banner');picture(h,'dragon');h.append(ctx.el('strong','Топа идёт к флажку'));s.append(h,ctx.el('p','Выбирай направление кнопками. Когда они в фокусе, можно нажимать стрелки на клавиатуре.'));
 let m=pick(grids,ctx);if(ctx.rng()>.5)m=m.map(row=>[...row].reverse().join(''));
 const tile=m.join(''),start=tile.indexOf('S'),goal=tile.indexOf('G'),seen=new Set([start]);
 let at=start,finished=false;const grid=ctx.el('div',null,'adv-map');grid.setAttribute('aria-hidden','true');
 const cells=Array.from(tile,(v)=>{const cls=v==='#'?' adv-rock':v==='S'?' adv-start':v==='G'?' adv-goal':'';const c=ctx.el('div',null,'adv-cell'+cls);grid.append(c);return c});
 const keys=ctx.el('div',null,'adv-keys'),out=live(ctx);keys.setAttribute('role','group');keys.setAttribute('aria-label','Управление Топой');s.append(grid,keys,out);
 function draw(){cells.forEach((c,i)=>{c.replaceChildren();c.classList.toggle('adv-active',i===at);c.classList.toggle('adv-visited',seen.has(i));if(i===at)picture(c,'dragon');else if(tile[i]==='#')picture(c,'rock');else if(i===goal)picture(c,'flag')})}
 const moves={ArrowUp:[0,-1],ArrowLeft:[-1,0],ArrowDown:[0,1],ArrowRight:[1,0]};
 function move(key){if(finished)return;const [dx,dy]=moves[key],x=at%5+dx,y=Math.floor(at/5)+dy,idx=y*5+x;if(x<0||x>4||y<0||y>4){out.textContent='Здесь край карты. Попробуй повернуть.';return}if(tile[idx]==='#'){out.textContent='На пути валун. Его можно обойти.';return}at=idx;seen.add(at);draw();out.textContent='Топа: ряд '+(y+1)+', столбец '+(x+1)+'.';if(at===goal){finished=true;ctx.finish('Топа обошёл валуны и добрался до флажка!')}}
 [['↑','Вверх','ArrowUp'],['←','Влево','ArrowLeft'],['↓','Вниз','ArrowDown'],['→','Вправо','ArrowRight']].forEach(([label,name,key])=>{const b=ctx.button(label,()=>move(key),'adv-direction');b.setAttribute('aria-label',name);keys.append(b)});
 keys.addEventListener('keydown',e=>{if(Object.hasOwn(moves,e.key)){e.preventDefault();move(e.key)}});
 draw();out.textContent='Топа на старте. Флажок в ряду '+(Math.floor(goal/5)+1)+', столбце '+(goal%5+1)+'.'
 }
});
const missions=[
 {who:'До старого маяка',clue:'Может пойти дождь, дорога незнакомая, а на привале захочется пить.',items:['Плащ','Карта','Фляга'],other:['Мяч','Карандаши','Колокольчик'],rem:['от дождя защитит плащ','дорогу поможет найти карта','воду возьмём во фляге']},
 {who:'Зарисовка с острова',clue:'Будем рисовать: нужно на чём рисовать, чем рисовать и чем убрать лишнюю линию.',items:['Блокнот','Карандаш','Ластик'],other:['Кружка','Плащ','Фонарик'],rem:['лист найдётся в блокноте','рисовать будем карандашом','лишнюю линию уберёт ластик']},
 {who:'К вечернему костру',clue:'Будет темно и прохладно. Топа хочет взять ещё тёплый напиток.',items:['Фонарик','Шарф','Термос'],other:['Скакалка','Блокнот','Лупа'],rem:['в темноте поможет фонарик','от холода спасёт шарф','напиток сохранит тёплым термос']},
 {who:'Письмо с острова',clue:'Топа хочет написать письмо: нужны лист, предмет для письма и то, куда вложить письмо.',items:['Бумага','Ручка','Конверт'],other:['Мяч','Ключ','Фляга'],rem:['письмо напишем на бумаге','для письма пригодится ручка','письмо вложим в конверт']},
];
registry.push({
 id:'adv-kit',title:'Рюкзак в дорогу',category:'adventure',accent:'#debff4',description:'Выбери три вещи, которые пригодятся именно в этом походе.',
 mount(p,ctx){
 const s=scene(p,ctx,'#f7edfb'),m=pick(missions,ctx);const head=ctx.el('div',null,'adv-pack-head'),banner=ctx.el('div',null,'adv-banner'),pill=ctx.el('span','Рюкзак: 0 из 3','adv-pack-pill'),opts=ctx.el('div',null,'adv-options'),out=live(ctx);
 picture(banner,'bag');banner.append(ctx.el('strong',m.who));head.append(banner,pill);s.append(head,ctx.el('p',m.clue),opts);
 const bag=new Set();let done=false;
 for(const name of shuffled([...m.items,...m.other],ctx)){const b=ctx.button(name,()=>{
   if(done)return;if(bag.has(name))bag.delete(name);else if(bag.size<3)bag.add(name);else {out.textContent='В рюкзак влезает три вещи. Сними одну, чтобы добавить другую.';return}
   b.setAttribute('aria-pressed',String(bag.has(name)));b.classList.toggle('adv-selected',bag.has(name));pill.textContent='Рюкзак: '+bag.size+' из 3';out.textContent=''
 },'adv-option');b.setAttribute('aria-pressed','false');opts.append(b)}
 const check=ctx.button('Проверить рюкзак',()=>{
   if(done)return;if(bag.size<3){out.textContent='Выбери три вещи. Подсказка о походе над карточками.';return}
   const miss=m.items.findIndex(x=>!bag.has(x));if(miss>=0){out.textContent='Пригодится ещё одна вещь: '+m.rem[miss]+'. Пересобери рюкзак.';return}
   done=true;ctx.finish('Рюкзак собран. Топа готов отправляться!')
 },'adv-pack-check');s.append(check,out)
 }
});
})();
