'use strict';
((root)=>{
const own=(x,k)=>Object.prototype.hasOwnProperty.call(x,k);
const check=(s,x)=>{
 if(s.type==='pick')return x===s.answer;
 if(s.type==='build')return Array.isArray(x)&&x.length===s.answer.length&&x.every((id,i)=>s.answer[i]===id);
 return !!x&&Object.keys(x).length===s.options.length&&s.options.every(t=>own(x,t.id)&&x[t.id]===s.answer[t.id]);
};
const allowed=(lessons,earned,i)=>i===0||earned.has(lessons[i-1].id);
const key=/^be-(0[1-9]|[1-3]\d|4[0-2])$/;
function validate(data){if(!Array.isArray(data)||![14,42].includes(data.length))throw Error('lesson count');
 const modes=['pick','build','sort','match'];
 for(const [i,l] of data.entries()){
  if(l.id!=='be-'+String(i+1).padStart(2,'0')||l.steps.length!==4||l.exam.length!==2)throw Error(l.id);
  for(const s of [...l.steps,...l.exam]){
   if(!modes.includes(s.type)||!s.prompt||!s.hint||!s.success||!s.id||s.options.length<2)throw Error(l.id+' / '+s.id);
   const ids=new Set(s.options.map(x=>x.id));if(ids.size!==s.options.length||s.options.some(x=>!x.text))throw Error(s.id+' options');
   if(s.type==='build'&&(!Array.isArray(s.answer)||new Set(s.answer).size!==s.answer.length||s.answer.some(x=>!ids.has(x))))throw Error(s.id+' build');
   if(s.type==='pick'&&!ids.has(s.answer))throw Error(s.id+' pick');
   if(s.type==='sort'||s.type==='match'){
    const groups=new Set(s.groups.map(x=>x.id));
    if(groups.size!==s.groups.length||Object.keys(s.answer).length!==ids.size||Object.entries(s.answer).some(([k,v])=>!ids.has(k)||!groups.has(v)))throw Error(s.id+' groups');
    if(s.type==='match'&&new Set(Object.values(s.answer)).size!==ids.size)throw Error(s.id+' pairs');
   }
  }
 }
 return data;
}
if(typeof module!=='undefined')module.exports={check,allowed,validate};
if(!root.document)return;
const d=root.document, lessons=validate(root.BE_LESSONS), app=d.getElementById('studio'), wallet=d.getElementById('wallet');
const embedded=root.parent!==root, origin=location.origin, earned=new Set();
let ix=-1,n=0,view='home',mode='practice',selected=null,row=[],placed={},locked=false,correct=false,score=0,showHint=false,feedback='',busReady=false;
let pending=null,rewardText='',celebrate=false,seen=0;
const scenes=['letters','mail','forest','workshop','story'];
const tint=['lav','lime','peach','blue'];
const sv='http://www.w3.org/2000/svg';
const STAR='M18 1l8 13 14 4-10 10 2 14-13-7-13 5 3-14L1 16l14-3 3-12z';
const motifs={
 leaf:['#dafa74','M5 26Q8 4 35 5Q36 32 11 32L5 37M10 30L27 14'],
 needle:['#cbbbfd','M7 36L28 8Q36 0 38 6Q40 10 33 17L7 36ZM29 10l4-3'],
 window:['#dcecff','M6 6h28v28H6zM20 6v28M6 20h28'],
 owl:['#8be1e4','M6 10l7 4q7-3 14 0l7-4v19q-1 9-14 9T6 29ZM12 22h1m14 0h1m-10 4h4'],
 dragon:['#dafa74','M6 27Q9 14 18 13l2-6 5 7 8 1 4 9-8 8H11Z M25 21h1'],
 letter:['#fbd1c1','M5 9h30v23H5zM5 10l15 13 15-13'],
 star:['#ffdc79',STAR],book:['#cbbbfd','M20 36Q13 30 4 32V10q10-2 16 4 6-6 16-4v22q-9-2-16 4Zm0 0V14'],
 house:['#fbd1c1','M4 19L20 5l16 14M8 17v19h24V17m-15 19V25h7v11'],
 sun:['#ffdc79','M29 20a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-16v4m0 24v4M4 20h4m24 0h4M8 8l3 3m18 18 3 3m0-24-3 3m-18 18-3 3'],
 cloud:['#dcecff','M12 31Q4 31 4 24q0-6 7-7 0-9 9-9 8 0 10 8 7 0 7 8 0 7-8 7Z'],
 water:['#a8d8fc','M20 5Q9 22 9 27a11 11 0 0 0 22 0Q31 22 20 5Z'],
 path:['#fbd1c1','M8 35q23-6 10-12T31 6h7q-22 10-8 16T21 37Z'],
 pencil:['#ffdc79','M6 34l2-11L28 4l8 9-21 20Z M8 23l7 10m8-22 8 9'],
 moon:['#ffdc79','M30 34A16 16 0 1 1 18 5q-6 22 12 29Z'],
 apple:['#fba8a4','M20 13Q6 5 5 22q1 17 11 15l4-2 4 2q10 2 11-15-1-17-15-9Zm0-1q0-5 6-8'],
 bird:['#cbbbfd','M5 14l9 6q1-10 11-10 8 0 9 8l4 3-5 2q-2 12-15 12Q9 32 5 14Z'],
 cup:['#fbd1c1','M7 14h23v10a12 12 0 0 1-23 0Zm23 3h5v6l-5 3M5 35h31'],
 fish:['#a8d8fc','M4 20q12-16 24-5l8-6v21l-8-6Q16 37 4 20Zm7 0h1'],
 tree:['#dafa74','M17 37v-8m6 8v-8M20 4q-7 5-7 9-8 3-7 10 2 7 14 7 12 0 14-7 1-7-7-10 0-4-7-9Z'],
 flower:['#fba8cf','M19 37V27m0 6-9-4m9 4 8-4M19 11q-7-10-11-3-2 4 5 8-5 6 1 9 4 1 5-5 3 6 8 4 6-3-1-8 6-4 2-8-5-6-9 3Z'],
 bag:['#fbd1c1','M7 13h26l3 23H4zm7 2V9a6 6 0 0 1 12 0v6'],
 key:['#ffdc79','M14 20a8 8 0 1 1 7-10 8 8 0 0 1-7 10Zm5-3 15 15-3 4-3-3-2 2-4-4 2-2-8-8'],
 "school-spark":["#ffdc79","M18 3l1 7m0 20v7M3 20h7m20 0h7M7 7l6 6m14 14 6 6M32 7l-5 6M13 27l-6 6M20 11q1 8 9 9-8 1-9 9-1-8-9-9 8-1 9-9Z"],
 "school-orchard":["#dafa74","M17 36v-7m8 7v-7M20 6q-9 1-9 8-7 1-7 8 3 10 15 6 12 4 16-5 1-6-6-8 0-8-9-9ZM13 17h2m5-5h2m3 10h2"],
 "school-branch":["#f0d9af","M5 33q14-13 29-21M16 24l-2-9m8 4 7 4m-1-8 1-7M31 9q2-6 7-5-1 6-7 5ZM11 16q-8-3-8-10 7-1 11 8"],
 "school-forest":["#dafa74","M6 34v-5m13 5v-6m13 6v-6M6 11l-5 9h3l-3 8h10l-3-8h3Zm13-6-7 13h4l-5 10h16l-5-10h4Zm13 6-6 10h3l-4 8h14l-4-8h3Z"],
 "school-stump":["#f0d9af","M9 16v13q-2 4-6 5l9 2 11-2 13 2q-4-4-5-9V16M9 16c0-8 22-8 22 0s-22 7-22 0Zm5 0c0-4 12-4 12 0s-12 4-12 0Zm3 12v4m9-7v5"],
 "school-nest":["#f0d9af","M4 23q2 12 16 12 13 0 16-12-15-4-32 0Zm2 3 27 4M10 31l22-5M12 23q-5-12 2-13 5 2 4 12m5-1q-1-12 5-11 6 3 1 12"],
 "school-river":["#a8d8fc","M13 5q6 6 2 11t2 9q6 4 1 10h12q7-10-1-13-6-3-3-7t-1-10ZM17 9q5 3 4 6m0 10q5 3 4 7"],
 "school-swim":["#a8d8fc","M9 14q5-4 8 0 3 5-2 7-6 2-7-3Zm9 8 8-10 7 5m-30 9q5-4 10 0t10 0 10 0m-30 8q5-4 10 0t10 0 10 0"],
 "school-feeder":["#f0d9af","M4 7q14 1 30-2M20 7v8m-9 9 9-9 10 9Zm2 0v7h14v-7m-21 8h22m-15-3h2m2 0h2"],
 "school-birds-feeder":["#cbbbfd","M21 7v7m-7 7 7-7 8 7Zm1 0v9h13v-9m-16 10h20M3 20l5 2q1-6 6-5l3 2-4 3q-2 6-9 4Zm31-7 4-2m-5 8 5-1"],
 "school-key-leaf":["#dafa74","M5 29Q0 6 24 6 23 25 7 30Zm-1 4 15-19M21 32a6 6 0 1 1 4-10 6 6 0 0 1-4 10Zm5-4 10-6 2 4-3 2-2-2-2 2 1 2-3 2"]
};
function e(tag,c,text){const a=d.createElement(tag);if(c)a.className=c;if(text)a.textContent=text;return a}
const p=(text,c)=>e('p',c,text);
function b(text,fn,klass='ghost',id){const a=e('button',klass,text);a.type='button';a.addEventListener('click',fn);if(id)a.dataset.key=id;return a}
function link(url,label,klass){const a=e('a',klass,label);a.href=url;return a}
function icon(n,cls){const g=d.createElementNS(sv,'svg');g.setAttribute('viewBox',n==='star'?'0 0 42 45':'0 0 40 40');g.setAttribute('aria-hidden','true');if(cls)g.setAttribute('class',cls);
 const [fill,coords]=motifs[n]??motifs.star, path=d.createElementNS(sv,'path');path.setAttribute('d',coords);if(n!=='star')path.setAttribute('fill',fill);g.append(path);return g}
function put(el,...nodes){el.append(...nodes);return el}
function heading(tag,text,cls){const h=e(tag,cls,text);h.tabIndex=-1;return h}
function focus(v){requestAnimationFrame(()=>{if(v?.isConnected)v.focus({preventScroll:true})})}
function send(action,lesson){if(embedded&&/^https?:$/.test(location.protocol))root.parent.postMessage(lesson?{type:'topouh-be:request',action,lesson}:{type:'topouh-be:request',action},origin)}
function cardColors(a){return tint[a%tint.length]}
function friendly(text,lang){const panel=e('div','bubble');const body=p(text);if(lang)body.lang=lang;return put(panel,e('b','','Ух кажа'),body)}
function art(){
 const figure=e('div','scene topouh-course-scenery');figure.setAttribute('aria-hidden','true');
 const uh=e('img','topouh-belarusian-scenery');
 uh.src='belarusian-assets/course-scenes-v4/be.svg?v=paired-eyes';uh.alt='';uh.width=640;uh.height=340;
 return put(figure,uh);
}
function reset(){selected=null;row=[];placed={};locked=false;correct=false;showHint=false;feedback='';celebrate=false}
function anchor(h){try{history.replaceState(null,'',location.pathname+location.search+h)}catch(_){}}
function go(state,focusTitle=true){view=state;paint(focusTitle);if(focusTitle)root.scrollTo(0,0)}
/* topouh-belarusian-dashboard-v1 */
function showHome(){
 if(embedded&&/^https?:$/.test(location.protocol)){send('catalogue');return}
 ix=-1;anchor('#');go('home');
}
function intro(i){if(!allowed(lessons,earned,i))return;ix=i;anchor('#'+lessons[ix].id);go('intro')}
function start(which){mode=which;n=0;score=0;reset();go('task')}
function routeFromURL(){const id=location.hash.slice(1)||new URL(location.href).searchParams.get('lesson');if(key.test(id??'')){const j=lessons.findIndex(x=>x.id===id);if(j>=0&&allowed(lessons,earned,j)){intro(j);return}}paint(false)}
function walletPaint(){wallet.hidden=!busReady}
function overlay(){const g=e('span','spark');g.setAttribute('aria-hidden','true');return put(g,icon('star'),icon('star'),icon('star'))}
function hero(){
 const first=lessons.findIndex((l,i)=>allowed(lessons,earned,i)&&!earned.has(l.id));
 const h=heading('h1','Беларуская');h.append(d.createTextNode(' '),e('em','','мова'));
 const hero=put(e('section','hero'),put(e('div','hero-copy'),e('span','eyebrow','АДКРЫЦЦІ З УХ / 2 КЛАС'),h,p('Рамантуй шыльды, збірай словы і разгадвай запіскі разам з Ух.'),b(first===-1?'Паўтарыць з Ух':'У падарожжа →',()=>intro(Math.max(0,first)),'primary')),art());
 const hd=put(e('div','module-head'),put(e('div'),e('h2','','Твае тэмы'),p('Пасля кожнай тэмы — два новыя заданні для праверкі.')),e('strong','award-pill','✦ '+earned.size+' / '+lessons.length+' пройдзена'));
 const grid=e('div','lesson-grid');
 lessons.forEach((l,i)=>{
  const module=l.module==='Закрепление'?'Замацаванне':l.module==='Применение'?'Прымяненне':'Асновы';
  if(i===0||l.module!==lessons[i-1].module)grid.append(e('h3','curriculum-group',module));
  const passed=earned.has(l.id),open=allowed(lessons,earned,i);
  const card=b('',()=>intro(i),'lesson-card card-'+cardColors(i)+(passed?' earned':''));card.disabled=!open;
  const emblem=icon('star','mini-star');if(!open)emblem.classList.add('locked-star');
  put(card,put(e('span','lesson-card-head'),e('span','',String(i+1).padStart(2,'0')+' / '+(passed?'ПРОЙДЗЕНА':open?'МОЖНА ПАЧАЦЬ':'ЗАКРЫТА')),emblem),e('strong','',l.title),e('small','',open?l.mission:'Адкрыецца пасля праверкі папярэдняй тэмы.'),put(e('span','card-end'),e('span','',passed?'Ужо ў скарбонцы':open?'Да 3 зорачак':'Спачатку папярэдняя тэма'),e('b','',open?'↗':'·')));
  grid.append(card);
 });
 app.append(hero,hd,grid);return h;
}
function layout(l,tag,scene,label,lang,storyRef){
 const nav=put(e('nav','lesson-nav'),b('← Усе тэмы',showHome),e('span','label','Тэма '+String(ix+1).padStart(2,'0')+' / '+lessons.length));
 const side=put(e('aside','sider'+(celebrate?' cheer':'')),storyRef?root.TopouhTaskStory.figure(storyRef):art(),friendly(tag,lang));
 if(celebrate)side.firstChild.append(overlay());
 const paper=e('section','paper'),wrap=put(e('div','workspace'+(view==='result'?' result':'')+(storyRef?' be-story-workspace':'')),paper,side);
 app.append(nav,wrap);return paper;
}
function introPanel(){
 const l=lessons[ix],paper=layout(l,l.intro,l.steps[0].scene??scenes[ix%5],ix===0?'І і':'✧');
 const h=heading('h1',l.title);
 put(paper,e('span','typepill',earned.has(l.id)?'✦ Ужо пройдзена':'✦ Новая тэма'),h,p(l.goal,'intro'),p(l.mission,'mission'),put(e('div','actions'),b('Да заданняў →',()=>start('practice'),'primary'),e('span','award-pill','4 заданні · праверка 2 з 2')),p(l.source,'source'));
 return h;
}
const labels={pick:'Выбар',build:'Збяры',sort:'Пасартуй',match:'Злучы пары'};
const texts={pick:'Выберы адзін варыянт.',build:'Націскай на карткі ў патрэбным парадку. Націсні картку ў радку, каб вярнуць яе.',sort:'Спачатку выберы картку, потым яе групу. Каб перакласці, выберы картку яшчэ раз.',match:'Выберы картку злева, потым пару справа. Пару можна змяніць.'};
function rerender(k){paint(false);if(k){const target=[...app.querySelectorAll('button[data-key]')].find(x=>x.dataset.key===k&&!x.disabled);focus(target??app.querySelector('button.check:not(:disabled)'))}}
function activeTile(t,fn,isOn,isDisabled,k){const token=b('',fn,'token',k);if(t.icon)token.append(icon(t.icon));token.append(e('span','',t.text));token.setAttribute('aria-pressed',String(isOn));token.disabled=isDisabled;return token}
function taskPanel(){
 const l=lessons[ix],list=mode==='exam'?l.exam:l.steps, s=list[n];
 const sideText=mode==='exam'?(locked&&!correct?s.hint:'У праверцы два новыя заданні. Адкажы без падказкі.'):showHint?s.hint:l.mission;
 const hintVisible=mode==='exam'?locked&&!correct:showHint;
 const storyRef=root.TopouhTaskStory?.find(l.id,(mode==='exam'?l.steps.length:0)+n);
 const paper=layout(l,sideText,s.scene??scenes[ix%5],ix===0?'І і':'✧',hintVisible?'ru':'',storyRef);
 const h=heading('h2',s.prompt);
 const meter=e('div','meter'+(mode==='exam'?' exam-meter':''));meter.setAttribute('role','img');meter.setAttribute('aria-label','Крок '+(n+1)+' з '+list.length);
 for(let j=0;j<list.length;j++)meter.append(e('i',j<n?'passed':j===n?'current':''));
 put(paper,e('span','label',l.title),e('p','title-small',(mode==='exam'?'Праверка':'Заданне')+' '+(n+1)+' / '+list.length),meter,e('span','typepill',labels[s.type]),h,p(texts[s.type],'caption'));
 if(storyRef)paper.append(root.TopouhTaskStory.figure(storyRef,true));
 const collection=e('div','board'+(s.options.length>5?' tight':''));
 if(s.type==='build'){
  const dest=e('div','arrangement');dest.setAttribute('aria-label','Твой парадак');
  if(!row.length)dest.append(p('Тут з’явіцца тваё слова або сказ.','empty-note'));
  for(const id of row){const x=s.options.find(y=>y.id===id);dest.append(activeTile(x,()=>{row=row.filter(j=>j!==id);rerender('opt-'+id)},false,locked,'placed-'+id))}
  paper.append(dest);
 }
 for(const t of s.options){
  const arranged=s.type==='build'&&row.includes(t.id);
  const preview=(s.type==='sort'||s.type==='match')&&own(placed,t.id)?' · '+s.groups.find(g=>g.id===placed[t.id]).text:'';
  const opt=activeTile({...t,text:t.text+preview},()=>{
   if(s.type==='build'){row.push(t.id);feedback='';rerender('placed-'+t.id)}
   else {selected=t.id;feedback='';rerender('opt-'+t.id)}
  },selected===t.id,locked||arranged,'opt-'+t.id);
  collection.append(opt);
 }
 paper.append(collection);
 if(s.type==='sort'||s.type==='match'){
  const bins=e('div','bins');
  for(const g of s.groups){
   const group=b('',()=>{if(!selected)return;
    if(s.type==='match')for(const a of Object.keys(placed))if(placed[a]===g.id)delete placed[a];
    placed[selected]=g.id;const i=s.options.find(x=>!own(placed,x.id))?.id;const old=selected;selected=null;feedback='';rerender('opt-'+(i??old));
   },'bin','group-'+g.id);
   group.disabled=locked||!selected;
   const tags=e('span','bin-tags');
   for(const t of s.options)if(placed[t.id]===g.id)tags.append(e('span','placed',t.text));
   put(group,e('strong','',g.text),tags);bins.append(group);
  }
  paper.append(bins);
 }
 const now=s.type==='pick'?selected:s.type==='build'?row:placed;
 const filled=s.type==='pick'?!!selected:s.type==='build'?row.length>=s.answer.length:Object.keys(placed).length===s.options.length;
 const answer=e('div','feedback'+(correct?' good':''));answer.setAttribute('role','status');answer.setAttribute('aria-live','polite');
 if(feedback){answer.append(e('b','',correct?'✦ Вось гэта так!':locked?'Зараз разбяром':'Паспрабуй яшчэ'),p(feedback));if(celebrate)answer.append(overlay())}
 paper.append(answer);
 const actions=e('div','actions');
 if(!locked){
  const submit=b('Праверыць',()=>{
    correct=check(s,now);locked=correct||mode==='exam';celebrate=correct;
    if(correct){score++;feedback=s.success}else if(locked){feedback=s.success}else {feedback='Паглядзі яшчэ раз. Падказка Ух дапаможа знайсці, з чаго пачаць.'}
    rerender(locked?'next':'hint');
  },'primary check','check');submit.disabled=!filled;actions.append(submit);
  if(mode==='practice')actions.append(b(showHint?'Схаваць падказку':'✧ Падказка Ух',()=>{showHint=!showHint;rerender('hint')},'ghost','hint'));
  if(s.type==='build'&&row.length)actions.append(b('Ачысціць',()=>{row=[];feedback='';rerender('opt-'+s.options[0].id)},'ghost','reset'));
 }else actions.append(b(n+1===list.length?(mode==='exam'?'Вынік праверкі →':'Да праверкі →'):'Далей →',()=>{
  if(n+1<list.length){n++;reset();go('task');return}if(mode==='practice'){go('exam');return}finish();
 },'primary','next'));
 paper.append(actions);
 if(showHint&&!locked){const q=p(s.hint,'hint-strip');q.lang='ru';q.setAttribute('role','status');paper.append(q)}
 return h;
}
function examIntro(){
 const l=lessons[ix],panel=layout(l,'Якая ты ўважлівая! Цяпер — два новыя заданні.','letters','✦'),h=heading('h1','Міні-экзамен');
 put(panel,e('span','typepill','Трэніроўка пройдзена'),h,p('Адкажы правільна на абодва заданні, каб адкрыць наступную тэму. Калі нешта не атрымаецца, можна паўтарыць.','intro'),put(e('div','actions'),b('Пачаць праверку →',()=>start('exam'),'primary'),b('Паўтарыць трэніроўку',()=>start('practice'))));
 return h;
}
function finish(){
 const l=lessons[ix],pass=score===l.exam.length;rewardText='';
 if(pass&&!embedded){earned.add(l.id);rewardText='Тэма адкрыта ў гэтым сеансе.'}
 else if(pass){pending=l.id;rewardText=earned.has(l.id)?'Зорачкі ўжо былі налічаны.':'Залічваем вынік…';send('complete',l.id)}
 go('result');
}
function resultPanel(){
 const l=lessons[ix],pass=score===l.exam.length, paper=layout(l,pass?'Супер! У цябе атрымалася.':'Памылкі — частка навучання. Патрэніруемся і паспрабуем яшчэ.','story','✦');
 const h=heading('h1',pass?'Тэма пройдзена!':'Яшчэ адна спроба?');
 const res=p(pass?rewardText:score+' з '+l.exam.length+' правільна','result-award');res.id='award-status';res.setAttribute('role','status');put(paper,e('span','typepill',pass?score+' / '+l.exam.length+' · Праверка пройдзена':'Праверка'),h,res,
 p(pass?'Зорачкі можна выдаткаваць на рэчы для Ух.':'Паглядзі, як працуюць заданні, і вярніся на праверку. Залічваецца 2 з 2.','result-note'));
 const actions=e('div','actions');
 if(pass&&ix+1<lessons.length&&allowed(lessons,earned,ix+1))actions.append(b('Наступная тэма →',()=>intro(ix+1),'primary','result-next'));
 if(pass&&busReady)actions.append(b('У краму Ух',()=>send('shop'),'soft','result-shop'));
 if(!pass)actions.append(b('Паўтарыць трэніроўку',()=>start('practice'),'primary','result-review'),b('Паўтарыць праверку',()=>start('exam'),'ghost','result-retry'));
 actions.append(b('Усе тэмы',showHome,'ghost','result-all'));paper.append(actions);return h;
}
function paint(focusTitle){
 app.replaceChildren();walletPaint();
 const h=view==='home'?hero():view==='intro'?introPanel():view==='task'?taskPanel():view==='exam'?examIntro():resultPanel();
 if(focusTitle)focus(h);
}
root.addEventListener('message',ev=>{
 const s=ev.data;if(!embedded||ev.source!==root.parent||ev.origin!==origin||!s||s.type!=='topouh-be:state'||!['snapshot','awarded'].includes(s.action)||!Number.isFinite(s.stars)||!Array.isArray(s.earned))return;
 const currentFocus=d.activeElement?.dataset?.key;
 busReady=true;d.getElementById('balance').textContent=String(s.stars);earned.clear();for(const id of s.earned)if(key.test(id))earned.add(id);
 if(s.action==='awarded'&&pending===s.lesson){
  pending=null;rewardText=s.delta===3?'+3 зорачкі ў скарбонку':earned.has(s.lesson)?'Зорачкі ўжо былі налічаны.':'Не ўдалося залічыць. Вярніся да папярэдняй тэмы.';celebrate=s.delta===3;
  rerender(currentFocus);return;
 }
 if(++seen===1&&view==='home'){routeFromURL();return}
 if(view==='home'||view==='result')rerender(currentFocus);else walletPaint();
});
// topouh-shared-brand-v1: logo link navigates site home natively; studio/back/shop handlers stay unchanged.
wallet.addEventListener('click',()=>send('shop'));
paint(false);if(embedded)send('ready');else routeFromURL();
})(typeof window==='undefined'?globalThis:window);
