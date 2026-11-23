(() => {
'use strict';
const data=window.GEO_DATA, app=document.getElementById('app');
function el(tag,cl,text){const n=document.createElement(tag);if(cl)n.className=cl;if(text)n.textContent=text;return n;}
function btn(text,fn,cl){const b=el('button',cl,text);b.type='button';b.addEventListener('click',fn);return b;}
function svg(tag,attrs={}){const node=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))node.setAttribute(k,v);return node;}
const roles=['GB','FR','ES'];
const seen=new Set();
const roster=Array.isArray(data?.countries)?data.countries.filter(c=>{
 if(!c||!(/^[A-Z]{2}$/.test(c.id))||typeof c.name!=='string'||typeof c.region!=='string'||!Array.isArray(c.paths)||!c.paths.some(p=>p?.d)||!Array.isArray(c.center)||!c.center.slice(0,2).every(Number.isFinite)||c.center.length<2||seen.has(c.id))return false;
 seen.add(c.id);return true;
}):[];
if(!roster.length){app.replaceChildren(el('p','','Не удалось загрузить карты атласа.'));return;}
const prefix=roles.map(id=>roster.find(c=>c.id===id)).filter(Boolean);
const pending=roster.filter(c=>!prefix.includes(c)), regions=new Map();
for(const c of pending){if(!regions.has(c.region))regions.set(c.region,[]);regions.get(c.region).push(c);}
const lessons=[];
function add(region,list){if(!list.length)return;lessons.push({id:list.map(c=>c.id).join('-'),region,list});}
add(prefix[0]?.region||'Европа',prefix);
function distance(a,b){
 const [ax,ay]=a.center,[bx,by]=b.center, lon=Math.abs(ax-bx);
 return Math.hypot(Math.min(lon,360-lon)*Math.cos((ay+by)*Math.PI/360),ay-by);
}
for(const [region,remaining] of regions){
 const pool=[...remaining];
 while(pool.length){
  const n=[4,7,8].includes(pool.length)?4:Math.min(3,pool.length);
  const first=pool.shift(),list=[first];
  while(list.length<n){
   let nearest=0;for(let j=1;j<pool.length;j++)if(distance(first,pool[j])<distance(first,pool[nearest]))nearest=j;
   list.push(pool.splice(nearest,1)[0]);
  }
  add(region,list);
 }
}
const STORE='topouh-v2-github-geography-v1';
function read(){try{const a=JSON.parse(localStorage.getItem(STORE)||'[]');return new Set(Array.isArray(a)?a.filter(x=>typeof x==='string'):[]);}catch(_){return new Set();}}
const passed=new Set([...read()].filter(id=>lessons.some(l=>l.id===id)));function save(){try{localStorage.setItem(STORE,JSON.stringify([...passed]));}catch(_){}}
const world=[-180,-85,360,165];
let lesson,phase='study',i=0,asked=[],selected=null,checked=null,view='region',flags=[];
const getTarget=()=>phase==='study'?lesson.list[i]:asked[i];
function focus(n){n.tabIndex=-1;requestAnimationFrame(()=>n.focus({preventScroll:true}));}
function place(){
 const contain=el('div');app.replaceChildren(contain);window.scrollTo(0,0);return contain;
}
function shuffle(list){const a=[...list];for(let k=a.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[a[k],a[j]]=[a[j],a[k]];}return a;}
function flag(c,name){const n=el('img','flag');n.src='flags/'+c.id.toLowerCase()+'.svg';n.alt=name;n.width=225;n.height=104;n.draggable=false;return n;}
const regionOrder=['Европа','Азия','Африка','Северная Америка','Южная Америка','Океания'];
const menuRegions=[...new Set([...regionOrder.filter(r=>lessons.some(l=>l.region===r)),...lessons.map(l=>l.region)])];
let regionMenu=menuRegions[0],reviewOnly=false;
const owlArt='../belarusian-assets/subject-owls-v2/world.svg';
function owl(){const img=el('img','geo-owl');img.src=owlArt;img.alt='';img.width=270;img.height=250;return img;}
function nameOf(l){return l.list.map(c=>c.name).join(' · ');}
function meter(finished,total,accessibleName){
 const m=el('progress','meter');m.value=finished;m.max=total;m.setAttribute('aria-label',accessibleName);return m;
}
function menu(keepId){
 const w=typeof keepId==='string'?el('div'):place(),title=el('h1','geo-title','География с Ух');
 const top=el('section','geo-overview'),hero=el('div','hero'),copy=el('div','hero-copy');
 const next=lessons.find(l=>!passed.has(l.id))||lessons[0], finished=passed.size===lessons.length;
 copy.append(el('p','kicker','ВНЕ ШКОЛЫ · ГЕОГРАФИЯ'),title,el('p','geo-lead','Узнавай страны по флагу и открывай их на карте вместе с Ух.'));
 const suggestion=el('div','geo-suggestion');
 suggestion.append(el('span','',finished?'ВСЕ УРОКИ ПРОЙДЕНЫ':'СЛЕДУЮЩИЙ УРОК'),el('strong','',nameOf(next)),
  btn(finished?'Повторить первый урок':'Начать урок',()=>start(next),'btn'));
 copy.append(suggestion);hero.append(copy,owl());
 const prog=el('aside','geo-progress');
 prog.append(el('span','kicker','ТВОЙ АТЛАС'),el('strong','geo-fraction',passed.size+' / '+lessons.length),
  el('p','','Пройдено уроков'),meter(passed.size,lessons.length,'Всего пройдено уроков'),
  el('p','geo-count',roster.length+' стран и их флаги'));
 top.append(hero,prog);w.append(top);
 const area=el('section','sections'), nav=el('div','region-nav');
 nav.setAttribute('role','group');nav.setAttribute('aria-label','Части света');
 area.append(el('h2','geo-section-title','Выбери часть света'),nav);
 for(const [n,region] of menuRegions.entries()){
  const k='geo-region-'+n,b=btn(region,()=>{regionMenu=region;menu(k)},'region-pill');
  b.id=k;b.setAttribute('aria-pressed',String(region===regionMenu));nav.append(b);
 }
 const section=el('div','geo-region-section'), line=el('div','region-head'), local=lessons.filter(l=>l.region===regionMenu), done=local.filter(l=>passed.has(l.id));
 const r=btn('Только пройденные',()=>{reviewOnly=!reviewOnly;menu('geo-review')},'region-pill');
 r.id='geo-review';r.setAttribute('aria-pressed',String(reviewOnly));
 const h=el('h3','',regionMenu), count=el('span','',done.length+' из '+local.length+' пройдено');line.append(h,count,r);section.append(line);
 const group=el('div','lesson-list');section.append(group);area.append(section);w.append(area);
 for(const [n,l] of local.entries()){
  const complete=passed.has(l.id);if(reviewOnly&&!complete)continue;
  const b=btn('',()=>start(l),'lesson-button'+(complete?' done':'')+(next===l&&!complete?' next':''));
  b.append(el('span','lesson-num',String(n+1).padStart(2,'0')),el('strong','',nameOf(l)),
     el('span','lesson-status',complete?'✓ Пройдено · повторить':next===l?'Следующий урок':'Открыть урок'));
  group.append(b);
 }
 if(!group.children.length)group.append(el('p','geo-empty','Здесь пока нет пройденных уроков. Чтобы увидеть все, выключи фильтр.'));
 if(typeof keepId==='string'){app.replaceChildren(w);document.getElementById(keepId)?.focus({preventScroll:true});}
 else focus(title);
}
function start(l){lesson=l;phase='study';i=0;view='region';selected=checked=null;render(true);}
function choices(c){if(lesson.list.length>=3)return shuffle(lesson.list);return shuffle([...lesson.list,...roster.filter(x=>x.region===c.region&&!lesson.list.includes(x)).slice(0,3-lesson.list.length),...roster.filter(x=>x.region!==c.region&&!lesson.list.includes(x)).slice(0,3-lesson.list.length)].slice(0,3));}
function move(){
 selected=checked=null;
 if(phase==='study'){
  i++;if(i===lesson.list.length){phase='flag';asked=shuffle(lesson.list);i=0;flags=choices(getTarget());if(view==='focus')view='region';}
 }else if(phase==='flag'){
  phase='map';
 }else{
  phase='flag';i++;
  if(i===asked.length){passed.add(lesson.id);save();return done();}
  flags=choices(getTarget());
 }
 render(true);
}
function mapBox(l,mode){
 if(mode==='world')return world;
 if(mode==='focus'){
  const bounds=getTarget().bounds;
  if(Array.isArray(bounds)&&bounds.length===4&&bounds.every(Number.isFinite)){
   const [left,top,right,bottom]=bounds,w=right-left,h=bottom-top;
   if(w>165||h>105)return world;
   const pad=Math.max(.50,Math.max(w,h)*.22);
   return [left-pad,top-pad,Math.max(w,.15)+pad*2,Math.max(h,.15)+pad*2];
  }
 }
 const xy=l.list.map(c=>c.center);
 const lon=xy.map(p=>p[0]),lat=xy.map(p=>p[1]);
 if(Math.max(...lon)-Math.min(...lon)>160)return world;
 const left=Math.min(...lon),right=Math.max(...lon),top=Math.min(...lat),bottom=Math.max(...lat);
 const pad=Math.max(8,(right-left)*.26), padY=Math.max(6,(bottom-top)*.40);
 const x=Math.max(-180,left-pad),y=Math.max(-85,top-padY);
 const endX=Math.min(180,right+pad),endY=Math.min(80,bottom+padY);
 return [x,y,endX-x,endY-y];
}
function drawMap(){
 const figure=el('figure','atlas'), caption=el('figcaption','',phase==='map'?'На карте: '+getTarget().name:'Атлас'),target=getTarget();
 const viewBox=mapBox(lesson,view), [x0,y0,mw,mh]=viewBox;
 const map=svg('svg',{class:'map',viewBox:viewBox.join(' '),preserveAspectRatio:'xMidYMid meet','aria-hidden':'true',focusable:'false'});
 for(const p of Array.isArray(data.land)?data.land:[])if(p?.d)map.append(svg('path',{class:'land',d:p.d}));
 const state=c=>c.id===selected?' '+(checked?(checked==='good'?'good':'wrong'):'selected'):phase==='study'&&c.id===target.id?' good':'';
 const valid=lesson.list.map(c=>c.id);
 for(const c of roster)for(const p of c.paths)if(p?.d){
  const path=svg('path',{class:'country'+state(c),d:p.d,'fill-rule':'evenodd'});
  if(phase==='map'&&valid.includes(c.id)){
   path.dataset.selectable='1';path.addEventListener('click',()=>{if(checked)return;selected=c.id;render(false,'check')});
  }
  map.append(path);
 }
 // Explicit markers complement very small outlines, especially at world zoom.
 for(const [number,c] of lesson.list.entries()){
  if(c.center[0]<x0||c.center[0]>x0+mw||c.center[1]<y0||c.center[1]>y0+mh)continue;
  if(phase==='map'||(phase==='study'&&c.id===target.id)){
   const radius=Math.max(.24,Math.min(4.1,Math.max(mw,mh)*.018)), [cx,cy]=c.center;
   const g=svg('g',{class:'map-marker'+(phase==='map'?' interactive':'')});
   g.append(svg('circle',{class:'small'+state(c),cx,cy,r:radius}));
   if(phase==='map'){
    const label=svg('text',{class:'map-marker-number',x:cx,y:cy,'font-size':radius*1.32,'text-anchor':'middle','dominant-baseline':'central'});
    label.textContent=String(number+1);g.append(label);
    g.addEventListener('click',()=>{if(checked)return;selected=c.id;render(false,'check')});
   }
   map.append(g);
  }
 }
 figure.append(caption,map);
 const bar=el('div','chips');
 const views=[['region','Страны урока'],['world','Весь мир']];
 if(phase==='study')views.splice(1,0,['focus','Эта страна']);
 for(const [value,label] of views){
  const b=btn(label,()=>{view=value;render(false,'zoom-'+value)});
  b.id='zoom-'+value;b.setAttribute('aria-pressed',String(view===value));bar.append(b);
 }
 figure.append(bar);
 if(phase==='map'){
  const detail=el('details');detail.open=true;
  detail.append(el('summary','','Выбор метки с клавиатуры'),el('p','','Номера совпадают с метками на карте. Рядом с каждой указано её положение.'));
  const alternative=el('div','chips');
  const longitude=lesson.list.map(c=>c.center[0]),latitude=lesson.list.map(c=>c.center[1]);
  const xMid=(Math.min(...longitude)+Math.max(...longitude))/2,yMid=(Math.min(...latitude)+Math.max(...latitude))/2;
  const describe=c=>{
   const [x,y]=c.center,betweenX=Math.max((Math.max(...longitude)-Math.min(...longitude))*.16,.25),betweenY=Math.max((Math.max(...latitude)-Math.min(...latitude))*.16,.25);
   const horizontal=Math.abs(x-xMid)<betweenX?'':x<xMid?'запад':'восток';
   const vertical=Math.abs(y-yMid)<betweenY?'':y<yMid?'север':'юг';
   const quadrant=vertical&&horizontal?(vertical==='север'?'северо-':'юго-')+horizontal:vertical||horizontal||'середина';
   const cc=(d,pos,neg)=>Math.abs(d).toFixed(1).replace('.0','')+'° '+(d>=0?pos:neg);
   return quadrant+', '+cc(-y,'с. ш.','ю. ш.')+' · '+cc(x,'в. д.','з. д.');
  };
  for(const [i,c] of lesson.list.entries()){
   const b=btn('Метка '+(i+1)+' · '+describe(c),()=>{selected=c.id;render(false,'choice-'+c.id)});
   b.id='choice-'+c.id;b.setAttribute('aria-pressed',String(selected===c.id));b.disabled=Boolean(checked);alternative.append(b);
  }
  detail.append(alternative);figure.append(detail);
 }else if(phase==='study'){
  const d=el('p','',target.name+' · '+target.region+'. Метка и зелёный контур показывают страну.');
  figure.append(d);
 }
 return figure;
}
function render(changeFocus,keepId){
 const w=changeFocus?place():el('div'), head=el('div','stage-head'),title=el('h1','','Флаги и страны · '+lesson.region);
 const stage=el('div','stage'),desk=el('section','desk'),target=getTarget(),cmd=el('div','commands');stage.dataset.phase=phase;
 const label=phase==='study'?'Знакомство':phase==='flag'?'Проверка флага':'Проверка карты';
 const counter=el('div','geo-stage-meta');counter.append(el('span','',label+' · '+(i+1)+' из '+lesson.list.length),meter(i+1,lesson.list.length,'Шаг в текущей части урока'));
 head.append(title,counter);
 w.append(btn('← К урокам',menu,'back'),head,stage);stage.append(desk,drawMap());
 const h=el('h2','',phase==='study'?target.name:phase==='flag'?'Какой флаг у страны «'+target.name+'»?':'Найди на карте: '+target.name);
 desk.append(el('p','kicker',phase==='study'?'КАРТОЧКА СТРАНЫ':'ПРОВЕРЬ СЕБЯ'),h);
 if(phase==='study'){
  desk.append(flag(target,'Флаг страны '+target.name),el('p','','Запомни флаг и найди зелёный контур на карте. Чуть позже попробуй выбрать самостоятельно.'));
  cmd.append(btn(i===lesson.list.length-1?'Начать проверку':'Следующая страна',move,'btn'));
 }else{
  if(phase==='flag'){
   const group=el('div','choices');
   for(const [n,c] of flags.entries()){
    const b=btn('',()=>{selected=c.id;render(false,'flag-'+c.id)},checked&&selected===c.id?checked:'');
    b.id='flag-'+c.id;b.setAttribute('aria-pressed',String(selected===c.id));b.disabled=Boolean(checked);
    const descriptions={GB:'Синее поле, белые диагональные полосы и красные кресты.',FR:'Три вертикальные полосы: синяя, белая, красная.',ES:'Три горизонтальные полосы: красная, широкая жёлтая, красная. На жёлтой полосе герб.'};
    const detail=c.flagDescription||descriptions[c.id];
    const alt='Флаг '+(n+1)+' из '+flags.length+(detail?'. '+detail:'');
    b.append(flag(c,alt));group.append(b);
   }desk.append(group);
  }else desk.append(el('p','','Нажми на форму страны или её метку. Можно выбрать номер метки в списке под картой.'));
  const message=el('p','status',checked==='good'?'Верно!':checked==='wrong'?'Пока не совпало. Посмотри на задание ещё раз.':selected?'Выбрано. Теперь нажми «Проверить».':'');
  message.setAttribute('role','status');if(checked)message.dataset.result=checked;desk.append(message);
  if(!checked){
   const b=btn('Проверить',()=>{if(!selected)return;checked=selected===target.id?'good':'wrong';render(false,'after-check');},'btn');
   b.disabled=!selected;b.id='check';cmd.append(b);
  }else if(checked==='wrong'){
   const b=btn('Попробовать ещё',()=>{selected=checked=null;render(true);},'btn');
   b.id='after-check';cmd.append(b);
  }else{
   const b=btn(phase==='flag'?'Теперь на карте':'Дальше',move,'btn');
   b.id='after-check';cmd.append(b);
  }
 }
 desk.append(cmd);
 if(!changeFocus)app.replaceChildren(w);
 if(changeFocus)focus(h);else if(keepId)document.getElementById(keepId)?.focus({preventScroll:true});
}
function done(){
 const w=place(),card=el('section','end'),title=el('h1','','Маршрут пройден!'),body=el('div','geo-end-copy');
 body.append(el('p','kicker','АТЛАС ПОПОЛНИЛСЯ'),title,el('p','',nameOf(lesson)),el('p','','Ты узнала флаги и нашла страны на карте. Результат сохранён в этом браузере.'));
 const controls=el('div','commands'),next=lessons.find(l=>!passed.has(l.id));
 if(next)controls.append(btn('Следующий урок',()=>start(next),'btn'));
 controls.append(btn('Повторить этот урок',()=>start(lesson),'btn soft'),btn('К списку уроков',menu,'btn soft'));
 body.append(controls);card.append(body,owl());w.append(card);focus(title);
}
menu();
})();
