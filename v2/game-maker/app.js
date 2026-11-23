(()=>{'use strict';
const M=window.TopoMaker,$=s=>document.getElementById(s), key='topouh-v2-github-maker-v1';
const arts={
 owl:'<path d="M13 29q-10-6-8 4 3 10 12 9m19-13q10-6 8 4-3 10-12 9" fill="#118690"/><path d="M13 18q3-9 12-9 10 0 14 11l4 18q-2 12-18 12-16 0-18-12z" fill="#1ba5af" stroke="#255451" stroke-width="2"/><path d="M12 18 10 8l8 7m18 5 6-10-8 4" fill="#148691" stroke="#255451" stroke-width="2.3" stroke-linejoin="round"/><ellipse cx="21" cy="27" rx="7" ry="8" fill="#fff7dd"/><ellipse cx="32" cy="27" rx="7" ry="8" fill="#fff7dd"/><circle cx="23" cy="28" r="2.9" fill="#203844"/><circle cx="31" cy="28" r="2.9" fill="#203844"/><circle cx="23.6" cy="27.2" r=".8" fill="#fff7dd"/><circle cx="31.6" cy="27.2" r=".8" fill="#fff7dd"/><path d="m24 33 7-1-3 6zM15 49l-2 4m9-3-1 4m12-4 1 4m6-6 3 4" fill="#e9a948" stroke="#ce8e3c" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="26" cy="43" rx="8" ry="5" fill="#86d0d3"/>',
 dragon:'<path d="M6 40Q8 25 19 24 15 9 27 14l4-6 3 7q14 0 17 10 2 11-10 13l1 10-13 1-4-6Q16 49 6 40Z" fill="#93bc67" stroke="#385e49" stroke-width="2"/><path d="M23 21 17 14l5 1 1-5 7 5m-8 17-8-7v12l9-1m12 12 2 4h8m-21-5-3 5h7" fill="#d5b962" stroke="#52734e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="35" cy="24" rx="5" ry="6" fill="#fff3da"/><circle cx="36" cy="24" r="2.8" fill="#203844"/><path d="M42 31q5 2 8-1" fill="none" stroke="#48614b" stroke-width="2" stroke-linecap="round"/>',
 star:'<path d="M28 6l6.7 14.5 15.5 2.4-11.3 10.7 2.9 16L28 42l-13.8 7.6 2.9-16L5.8 22.9l15.5-2.4Z" fill="#f5c765" stroke="#9a6e3e" stroke-width="2.2" stroke-linejoin="round"/><path d="M19 26q5-1 8-9" fill="none" stroke="#fff3ad" stroke-width="3" stroke-linecap="round"/>',
 stone:'<path d="m4 40 7-20 17-10 17 8 8 20-9 9H12Z" fill="#a5a99d" stroke="#667b6e" stroke-width="2.5" stroke-linejoin="round"/><path d="m11 20 15 8 17-10m-17 10-6 13" fill="none" stroke="#7c8a7e" stroke-width="2.2"/>',
 finish:'<path d="M15 47V8m1 3q15-7 28 0v19q-15 5-28-2" fill="#eaa37f" stroke="#9e694f" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M6 48h19" stroke="#735d4c" stroke-width="3" stroke-linecap="round"/>',
 start:'<path d="M8 43h40M12 40V20q0-6 6-6h20q6 0 6 6v20M12 22h32" fill="#abce9e" stroke="#4b7759" stroke-width="2.7" stroke-linejoin="round" stroke-linecap="round"/><path d="M22 29h12m-5-4 5 4-5 5" fill="none" stroke="#45775f" stroke-width="2.8" stroke-linecap="round"/>'
};
const svg=(kind)=>`<svg viewBox="0 0 56 56" aria-hidden="true" focusable="false">${arts[kind]||''}</svg>`;
const names={forest:'Лесная поляна',sunset:'Тёплый закат',night:'Лунный сад',owl:'Совёнок Ух',dragon:'Дракончик Топа'};
const stages=[
 {name:'Мир',title:'Нарисуй настроение',text:'Выбери, где будет игра. Цвет поля изменится сразу, а правила пока останутся прежними.',type:'theme'},
 {name:'Герой',title:'Кто отправится в путь?',text:'Выбери Ух или Топу. Новый герой сразу появится на старте.',type:'hero'},
 {name:'Звёзды',title:'Спрячь звёзды',text:'Нажми клетку на поле, чтобы добавить звезду. Нажми на звезду ещё раз, чтобы убрать. Оставь хотя бы одну.',type:'stars'},
 {name:'Камни',title:'Построй обход',text:'Поставь камни, которые придётся обходить. Следи, чтобы к каждой звезде и флажку осталась дорожка.',type:'walls'},
 {name:'Время',title:'Выбери темп игры',text:'Время необязательно. Можно спокойно исследовать поле или попробовать собрать звёзды до звонка.',type:'limit'},
 {name:'Игра',title:'Готово. Теперь сыграй!',text:'Твоя игра готова к проверке. Собери все звёзды и доберись до флажка. Можно переиграть или снова поменять любое правило.',type:'play'}
];
let config=M.defaults(),stage=0,complete=false,state=null,timer=0,editAt=0;
try{const data=JSON.parse(localStorage.getItem(key)||'null');if(data){complete=data.complete===true;config=M.normalize(data.config);if(Number.isInteger(data.stage)&&data.stage>=0&&data.stage<stages.length)stage=data.stage}}catch(_){}
function save(){
 try{localStorage.setItem(key,JSON.stringify({config,stage,complete}));$('save').textContent='Сохранено на этом устройстве'}
 catch(_){$('save').textContent='Черновик открыт · сохранение недоступно'}
}
const make=(tag,text)=>{const e=document.createElement(tag);if(text)e.textContent=text;return e};
const tool=()=>['stars','walls'].includes(stages[stage].type)?stages[stage].type:null;
const cellName=(i)=>'Ряд '+(Math.floor(i/M.width)+1)+', клетка '+(i%M.width+1);
const board=$('board'),cells=Array.from({length:M.total},(_,i)=>{
 const b=make('button');b.type='button';b.className='cell edit-cell';
 b.addEventListener('click',()=>{
  if(state||!tool())return;
  editAt=i;
  const changed=M.edit(config,i,tool());
  if(config!==changed){config=changed;save();drawField()}
 });
 b.addEventListener('keydown',e=>{
  if(state||!tool()||!e.key.startsWith('Arrow'))return;
  const [dx,dy]=M.moves[e.key]||[];if(dx===undefined)return;
  e.preventDefault();
  let x=i%M.width+dx,y=Math.floor(i/M.width)+dy;
  while(x>=0&&x<M.width&&y>=0&&y<M.height){
   const next=y*M.width+x;
   if(next!==M.start&&next!==M.goal){editAt=next;drawField();cells[editAt].focus();break}
   x+=dx;y+=dy;
  }
 });
 board.append(b);return b;
});
const menu=stages.map((def,i)=>{
 const li=make('li'),b=make('button'),n=make('strong',String(i+1).padStart(2,'0'));
 b.type='button';b.append(n,document.createTextNode(def.name));b.onclick=()=>goStage(i);
 li.append(b);$('timeline').append(li);return b;
});
function option(parent,label,active,onclick,art){
 const b=make('button');b.type='button';if(art)b.innerHTML=art;b.append(document.createTextNode(label));
 b.setAttribute('aria-pressed',String(active));b.onclick=onclick;parent.append(b);return b;
}
function change(field,x){
 config={...config,[field]:x};save();drawStage();drawField();
 $('choices').querySelector('button[aria-pressed="true"]')?.focus({preventScroll:true});
}
function drawStage(){
 const def=stages[stage],choices=$('choices');choices.replaceChildren();
 $('stage-tag').textContent='ШАГ '+(stage+1)+' ИЗ '+stages.length;
 $('stage-title').textContent=def.title;$('stage-intro').textContent=def.text;
 $('prev').hidden=stage===0;
 $('next').textContent=stage===5?'Начать игру':'Дальше';
 menu.forEach((b,i)=>{if(i===stage)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
 const group=make('div');group.className='options';group.setAttribute('aria-label',def.title);
 if(def.type==='theme'){
  for(const n of M.themes)option(group,names[n],config.theme===n,()=>change('theme',n),`<span class="sample" aria-hidden="true" data-tone="${n}"></span>`);
 }else if(def.type==='hero'){
  for(const n of M.heroes)option(group,names[n],config.hero===n,()=>change('hero',n),svg(n));
 }else if(def.type==='limit'){
  for(const n of M.limits)option(group,n?n+' секунд':'Без таймера',config.limit===n,()=>change('limit',n));
 }else if(tool()){
  const note=make('p',def.type==='stars'?'Инструмент: звезда':'Инструмент: камень');note.className='tool-badge';
  const jump=make('button','Перейти к полю');jump.type='button';jump.className='tool-jump';
  jump.onclick=()=>cells[editAt].focus();
  group.append(note,jump);
 }else group.append(make('p','Управление: стрелки, WASD или кнопки под полем.'));
 choices.append(group);
}
function drawField(){
 const play=!!state, active=play&&state.result==='playing', shown=play?state.remaining:config.stars, edit=!play&&!!tool();
 $('preview').dataset.theme=config.theme;
 $('mode-label').textContent=active?'ИГРА ИДЁТ':play?'РЕЗУЛЬТАТ':'ЖИВОЕ ПРЕВЬЮ';
 $('maker-checked').hidden=!complete||stage!==stages.length-1;
 $('run').textContent=play?'К настройкам':'Проверить в игре';
 $('star-count').textContent=play?'★ Осталось звёзд: '+shown.length:'★ Звёзд на поле: '+shown.length;
 $('clock').hidden=!config.limit;renderClock();
 $('directions').hidden=!active;$('outcome').hidden=!play||active;
 for(const [i,b] of cells.entries()){
  const kind=(state?.pos??M.start)===i?config.hero:i===M.start?'start':i===M.goal?'finish':config.walls.includes(i)?'stone':shown.includes(i)?'star':'';
  const label=kind==='owl'||kind==='dragon'?names[kind]:({start:'старт',finish:'флажок',stone:'камень',star:'звезда'}[kind]||'пусто');
  if(b.dataset.kind!==kind){b.innerHTML=kind?svg(kind):'';b.dataset.kind=kind}
  b.dataset.here=String((state?.pos??M.start)===i);
  b.classList.toggle('edit-cell',edit);b.disabled=!edit||i===M.start||i===M.goal;
  b.tabIndex=edit&&i===editAt&&!b.disabled?0:-1;
  b.setAttribute('aria-label',cellName(i)+', '+label);
 }
 const problem=M.problem(config);
 $('local-tip').textContent=!play?(problem||(tool()?'Поле можно пройти. Старт и флажок на месте.':'')):'';
 const status=play?state.status:tool()?'Нажми на поле. Со стрелками можно перейти к другой клетке, Enter меняет выбранную.':'Настройки применяются сразу. Можно попробовать игру на любом шаге.';
 if($('board-status').textContent!==status)$('board-status').textContent=status;
 if(play&&!active){
  $('outcome-title').textContent=state.result==='win'?'Все звёзды собраны!':'Попробуем ещё?';
  $('outcome-note').textContent=state.result==='win'?'Сыграй ещё раз или вернись к настройкам и собери новый уровень.':'Можно переиграть или вернуться к настройкам и изменить время.';
 }
}
function renderClock(){
 if(config.limit){
  const left=state?.result==='win'&&state?.wonAt!=null?Math.max(0,Math.ceil((state.endsAt-state.wonAt)/1000)):state?.endsAt?Math.max(0,Math.ceil((state.endsAt-Date.now())/1000)):config.limit;
  $('clock').textContent='⏱ '+left+' с';
 }
}
function clearClock(){clearInterval(timer);timer=0}
function goStage(i){
 clearClock();state=null;stage=i;save();drawStage();drawField();$('stage-title').focus({preventScroll:true});
}
function play(){
 const warning=M.problem(config);
 if(warning){$('local-tip').textContent=warning;$('board-status').textContent=warning;return}
 clearClock();state=M.enter(config,Date.now());drawField();
 board.focus({preventScroll:true});
 if(window.matchMedia('(max-width: 710px)').matches)$('preview').scrollIntoView({block:'start'});
 if(config.limit)timer=setInterval(()=>{
  const next=M.tick(state,Date.now());
  if(next!==state){state=next;finish()}else renderClock();
 },150);
}
function finish(){clearClock();drawField();$('outcome-title').focus({preventScroll:false})}
function move(k){
 if(state?.result!=='playing')return;
 const now=Date.now();
 state=M.step(config,state,k,now);
 if(state.result==='win'){
  state={...state,wonAt:now};
  if(stage===stages.length-1&&!complete){complete=true;save();}
 }
 if(state.result==='playing')drawField();else finish();
}
$('run').onclick=()=>{if(!state)play();else{clearClock();state=null;drawField();$('run').focus({preventScroll:true})}};
$('replay').onclick=play;
$('prev').onclick=()=>goStage(Math.max(0,stage-1));
$('next').onclick=()=>stage===5?play():goStage(stage+1);
for(const b of $('directions').querySelectorAll('button'))b.onclick=()=>move(b.dataset.move);
$('preview').addEventListener('keydown',e=>{
 const k=e.key.length===1?e.key.toLowerCase():e.key;
 if(state?.result==='playing'&&M.moves[k]&&!e.metaKey&&!e.ctrlKey&&!e.altKey){e.preventDefault();move(k)}
});
drawStage();drawField();
})();
