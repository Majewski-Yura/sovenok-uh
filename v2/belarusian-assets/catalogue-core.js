'use strict';
const courses=JSON.parse(document.getElementById('course-data').textContent), app=document.getElementById('app');
const completed=new Map();
// Hidden from the catalogue only; existing lessons, completion keys and direct links stay intact.
const catalogueHiddenCourses=new Set(['logic']);
let active=null,current=null,index=0,mistake=false,correctFirst=0,locked=false;
const el=(tag,text,klass)=>{const v=document.createElement(tag);if(text)v.textContent=text;if(klass)v.className=klass;return v};
function bn(text,cls,action){const b=el('button',text,cls);b.type='button';b.addEventListener('click',action);return b}
function heading(target,text,tag='h1'){const h=el(tag,text);h.tabIndex=-1;target.append(h);requestAnimationFrame(()=>h.focus({preventScroll:true}));return h}
function clear(){window.TopouhEnglish?.stop();delete app.dataset.mathDashboard;delete app.dataset.courseDash;app.replaceChildren();window.scrollTo(0,0)}
function crumb(items){const t=el('nav','', 'crumbs');t.setAttribute('aria-label','Навигация');for(const [txt,fn] of items)t.append(bn(txt,'routeB',fn));if(items.length>1)t.lastChild.setAttribute('aria-current','page');app.append(t)}
function card(title,note,action,cls){const b=bn('',cls,action);b.append(el('strong',title),el('span',note,'cardNote'));return b}
function home(mode){changeCatalogueRoute(null,typeof mode==='string'?mode:'push');active=null;current=null;clear();const hero=el('section','','hero');app.append(hero);heading(hero,'Выбери, чем заняться');hero.append(el('p','Выбери предмет, потренируйся с Ух и открой следующую тему. Прогресс сохраняется только в этом браузере и не отправляется на сервер.'));const g=el('div','','grid');for(const c of courses){
 if(c.id==='logic'){
  const label=el('div','','workshop-catalogue-head');
  label.append(el('h2','Вне школы'),el('p','Мастерские: выбор, открытия и творчество. Без таймера и оценок.'));
  g.append(label);
 }
 if(catalogueHiddenCourses.has(c.id))continue;
 if(c.id==='code'){g.append(workshopEntrance('maker','Сделай свою игру','6 шагов · игра меняется на глазах','game-maker/index.html'));continue}
 g.append(card(c.title,c.id==='be'?c.lessons.length+' уроков · звёзды за прохождение':c.id==='en'?c.lessons.length+' уроков · тренажёр':(workshopIds.has(c.id)?c.lessons.length+(c.lessons.length===24?' урока':' уроков'):c.lessons.length+' уроков'),()=>list(c),'courseCard'))}
 g.append(workshopEntrance('geography','География с Ух','63 урока · 195 стран, флаги и карты','geography/index.html'));app.append(g)}
function workshopEntrance(id,title,note,href){const a=el('a','','courseCard workshop-entrance');a.href=href;a.target='_top';a.dataset.workshop=id;a.append(el('strong',title),el('span',note,'cardNote'));return a}
function list(c,mode){
 const keep=typeof mode==='string'?mode:'push';
 const m=courseIsDashboard(c.id)?mathModuleFrom(new URL(location.href)):'';
 changeCatalogueRoute(c.id,keep,m);active=c;current=null;clear();
 if(courseIsDashboard(c.id)){renderMath(c,m);return}
 crumb([['Все предметы',home]]);const h=el('section','','hero');app.append(h);heading(h,c.title);h.append(el('p',c.id==='en'?'Слушай, читай и собирай фразы с Топой. Выбери тему, чтобы начать.':'Потренируйся с Ух. После каждого мини-экзамена откроется следующая тема.'));const g=el('div','','grid');for(const [j,l] of c.lessons.entries()){
  /* Topouh 273 lesson curriculum */
  const section=l.module||'Основы';
  if(j===0||section!==(c.lessons[j-1].module||'Основы'))g.append(el('h2',section,'curriculum-group'));
  const done=completed.has(l.id);g.append(card((j+1)+'. '+l.title,done?'Пройдено в этом сеансе · '+l.goal:l.goal,()=>start(c,l),'lessonCard'))}app.append(g)}
/* Topouh shared studio lesson flow */
const studioSubjects=Object.freeze({...{"lab":["✧","#e6f3c5","forest"],"code":["↳","#d9eaff","workshop"],"team":["♥","#f8deee","story"],"invent":["✦","#ffe4c4","workshop"],"games":["◆","#ece1ff","story"],"maps":["⌖","#caece8","forest"],"garden":["❋","#daefc9","forest"]},
 logic:['◆','#e4edb2','forest'],money:['★','#f6e2a3','workshop'],story:['«…»','#f7cfdf','story'],
 math:['+ −','#e7f8af'],ru:['Аа','#fbd1c1'],reading:['«…»','#dcecff'],
 world:['✺','#e7f8af'],safety:['!','#f9e5a9'],art:['✧','#fbd1c1'],en:['Aa','#cbbbfd']
});
const studioHints=JSON.parse(document.getElementById('studio-hints').textContent);
const labPilotLessons=Object.freeze({
 'lab-12':{renderer:'TopouhLabJournal',label:'Запись наблюдения',prompt:'Сверь число кругов на полоске с записью Ух. Что сделать первым, если они не совпадают?',again:'Отметь все круги. Если запись не совпадает с наблюдением, сначала перепроверь подсчёт.'},
 'lab-19':{renderer:'TopouhLabClouds',label:'Сортировка по признаку'},
 'lab-26':{renderer:'TopouhLabRuler',label:'Измерение',prompt:'Отметь на шкале оба края полоски и определи её длину.',again:'Сверь оба края полоски. Длина — это число равных промежутков между отметками, а не число рисок.'}
});
const themedScenery=new Set(['math', 'ru', 'reading', 'be', 'safety', 'art', 'en', 'logic', 'money', 'story', 'lab', 'code', 'team', 'invent', 'games', 'maps', 'garden', 'world']);
function sceneSource(id){if(id==='en')return 'english-trainer/coach.svg';return themedScenery.has(id)?'belarusian-assets/course-scenes-v4/'+id+'.svg?v=paired-eyes':null}
function subjectOwl(id){return ['math','ru','reading','be','world','safety','art','en'].includes(id)?'belarusian-assets/subject-owls-v2/'+id+'.svg':'belarusian-assets/ukh.svg';}
const studioSVG='http://www.w3.org/2000/svg';
function studioSpark(){
 const burst=el('span','','ls-spark');burst.setAttribute('aria-hidden','true');
 for(let i=0;i<3;i++){
  const svg=document.createElementNS(studioSVG,'svg'),path=document.createElementNS(studioSVG,'path');
  svg.setAttribute('viewBox','0 0 42 45');path.setAttribute('d','M18 1l8 13 14 4-10 10 2 14-13-7-13 5 3-14L1 16l14-3 3-12z');
  svg.append(path);burst.append(svg);
 }
 return burst;
}
function studioLayout(c,l,message,done=false,labTool=null,labRef=null,storyRef=null){
 clear();
 const outer=el('article','','lesson-studio');
 const nav=el('nav','','ls-lesson-nav');nav.setAttribute('aria-label','Навигация по уроку');
 const n=c.lessons.indexOf(l)+1;
 nav.append(bn('Все предметы','ls-ghost',home),bn('Все темы','ls-ghost',()=>workshopIds.has(c.id)||c.id==='en'?showWorkshopModule(c,l):list(c)),el('span',c.title+' · тема '+n+' / '+c.lessons.length,'ls-label ls-navlabel'));
 const work=el('div','','ls-workspace'+(done?' ls-result':''));
 const paper=el('section','','ls-paper');
 const side=el('aside','','ls-sider');
 const scene=el('div','','ls-scene');
 scene.setAttribute('aria-hidden','true');
 if(c.id==='lab'){
  if(labRef||labTool)work.classList.add('ls-lab-reference');
  if(labTool)work.classList.add('ls-lab-workspace');
  if(!labTool&&!labRef){work.classList.add('ls-lab-single');side.hidden=true}
  else{
   scene.removeAttribute('aria-hidden');scene.className='ls-lab-task-scene';scene.setAttribute('aria-label',labTool?'Рабочее поле лаборатории':'Иллюстрация к заданию');scene.setAttribute('role','region');
   if(!labTool&&labRef)scene.append(window.TopouhLabReference.story(l.id,index,labRef,el));
  }
 }
 const [glyph,tint,vignette]=studioSubjects[c.id];scene.style.setProperty('--scene',tint);
 const vector=document.createElementNS(studioSVG,'svg'),use=document.createElementNS(studioSVG,'use');
 vector.setAttribute('viewBox','0 0 520 310');vector.setAttribute('class','ls-sc-sprite');
 use.setAttribute('href',vignette?'belarusian-assets/scenes.svg#scene-'+vignette:'belarusian-assets/subject-scenes.svg#scene-'+c.id);vector.append(use);
 const mascot=el('img','','ls-mascot');mascot.src=subjectOwl(c.id);mascot.alt='';mascot.width=240;mascot.height=220;
 const landscape=sceneSource(c.id);
 if(storyRef){
  work.classList.add('ls-story-workspace');scene.className='ls-story-slot';scene.removeAttribute('aria-hidden');scene.append(window.TopouhTaskStory.figure(storyRef));
 }else if(c.id!=='lab'&&landscape){
  scene.classList.add('topouh-course-scenery');const art=el('img','','topouh-lesson-scenery');art.src=landscape;art.alt='';scene.append(art);
 }else if(c.id!=='lab')scene.append(vector,el('span',glyph,'ls-scene-word'),mascot);
 const bubble=el('div','','ls-bubble'),speech=el('p',message);
 bubble.append(el('b','Ух говорит'),speech);
 side.append(scene,bubble);work.append(paper,side);outer.append(nav,work);app.append(outer);
 return {paper,side,scene,speech};
}
function studioActions(paper,...buttons){const row=el('div','','ls-actions');row.append(...buttons);paper.append(row);return row;}
function start(c,l){
 if(!window.topouhCourseCanStart?.(c.id,l.id))return list(c);
 active=c;current=l;index=0;correctFirst=0;mistake=false;locked=false;
 const {paper}=studioLayout(c,l,l.intro);
 paper.append(el('span','✦ '+(window.topouhCourseHasPassed?.(l.id)?'Уже пройдена':'Новая тема'),'ls-typepill'));
 heading(paper,l.title);
 paper.append(el('p',l.goal,'ls-intro'),el('p','Сначала потренируйся. Потом реши два новых задания без подсказок.','ls-mission'));
 if(c.id==='en'&&Array.isArray(l.vocab)&&window.TopouhEnglish)paper.append(window.TopouhEnglish.vocab(l.vocab));
 const labTheory=c.id==='lab'?window.TopouhLabCourseTheory?.[l.id]:null;
 if(labTheory){
  const lecture=el('section','','lab-try-card');
  lecture.append(el('h2',labTheory.title),el('p',labTheory.definition),el('h3','Пример'),el('p',labTheory.example),el('h3','Что делать'),el('p',labTheory.direction));
  paper.append(lecture);
 }
 studioActions(paper,bn(labTheory?'Продолжить':'Начать занятие','ls-primary',step),el('span','Тренировка · мини-экзамен','ls-award-pill'));
 paper.append(el('p',l.source,'ls-source'));
}
const examStartAt=()=>Math.max(0,current.steps.length-2);
function examIntro(){
 if(!active||!current)return home();
 const {paper}=studioLayout(active,current,'Два новых задания. У каждого только одна попытка, но экзамен можно повторить.');
 paper.append(el('span','Тренировка завершена','ls-typepill'));
 heading(paper,'Мини-экзамен');
 paper.append(el('p',current.title,'ls-intro'),el('p','Ответь верно на оба задания, чтобы открыть следующую тему.','ls-mission'));
 studioActions(paper,bn('Начать мини-экзамен','ls-primary',()=>{index=examStartAt();correctFirst=0;mistake=false;locked=false;step()}));
}
function addLabStepTheory(paper,theory){
 const box=el('details','','ls-lab-theory'),summary=el('summary'),flag=el('span','i');
 flag.setAttribute('aria-hidden','true');summary.append(flag,document.createTextNode('Теория'));
 const copy=el('div','','ls-lab-theory-note');
 copy.append(el('p',theory.definition),el('p','Пример: '+theory.example));box.append(summary,copy);paper.append(box);
}
function step(){
 if(!active||!current)return home();if(index>=current.steps.length)return end();
 const exam=examStartAt(),inExam=index>=exam,number=inExam?index-exam+1:index+1;
 const count=inExam?current.steps.length-exam:exam;
 const line=inExam?'У каждого задания одна попытка. Объяснение появится после проверки.':'Выбери карточку и нажми «Проверить». Если трудно, попроси подсказку.';
 const labTool=active.id==='lab'&&!inExam&&index===0?labPilotLessons[current.id]:null;
 const labRenderer=labTool&&typeof window[labTool.renderer]==='function'?window[labTool.renderer]:null;
 const labRef=active.id==='lab'&&window.TopouhLabReference?window.TopouhLabScenes?.[current.id]?.[index]:null;
 const storyRef=active.id!=='lab'?window.TopouhTaskStory?.find(current.id,index):null;
 const {paper,side,scene,speech}=studioLayout(active,current,line,false,labRenderer,labRef,storyRef);
 paper.append(el('p',current.title,'ls-label'),el('p',(inExam?'Проверка':'Задание')+' '+number+' / '+count,'ls-title-small'));
 const meter=el('div','','ls-meter');meter.style.setProperty('--segments',String(count));meter.setAttribute('role','img');
 meter.setAttribute('aria-label',(inExam?'Мини-экзамен':'Тренировка')+' · '+number+' из '+count);
 for(let i=1;i<=count;i++)meter.append(el('i','',i<number?'ls-passed':i===number?'ls-current':''));
 paper.append(meter,el('span',workshopModes[current.steps[index].mode]||'Выбор','ls-typepill'));
 const s=current.steps[index];
 const baseVisual=s.visual||(!inExam&&legacyVisualTasks[current.id]?.[index]);
 const visual=baseVisual&&labRenderer?{...baseVisual,...(labTool.prompt?{prompt:labTool.prompt}:{}),...(labTool.again?{again:labTool.again}:{}),trainerLabel:labTool.label}:baseVisual;
 if(!inExam&&['logic','money','story'].includes(active.id)&&!visual)addWorkshopBench(active.id,side);
 heading(paper,visual?.prompt||s.prompt,'h2');
 if(active.id==='en'&&visual&&window.TopouhEnglish){const cue=window.TopouhEnglish.prompt(visual);if(cue)paper.append(cue)}
 if(!inExam){
  const labTheory=active.id==='lab'?window.TopouhLabStepTheory?.[current.id]?.[index]:null;
  if(labTheory)addLabStepTheory(paper,labTheory);
  const context=el('details','','ls-context');context.open=!labTheory&&(index===0||['ru-14','reading-03'].includes(current.id));
  context.append(el('summary','Вспомнить пример'),el('p',current.intro));
  paper.append(context);
 }
 if(storyRef)paper.append(window.TopouhTaskStory.figure(storyRef,true));
 if(labRef&&!labRenderer)paper.append(window.TopouhLabReference.story(current.id,index,labRef,el,true));
 if(labRef&&labRenderer)side.prepend(window.TopouhLabReference.story(current.id,index,labRef,el,false,true));
 if(visual&&window.topouhVisualBoard){showVisualStep(visual,{paper,side,scene,speech,exam,inExam,labRenderer});return;}
 const board=el('div','','ls-board');board.setAttribute('role','group');board.setAttribute('aria-label','Варианты ответа');
 const feedback=el('div','','ls-feedback');feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
 const hint=el('p',studioHints[current.id],'ls-hint-strip');hint.hidden=true;hint.setAttribute('role','status');hint.setAttribute('aria-live','polite');hint.id='studio-hint';
 let selected=-1;
 const next=bn(index===current.steps.length-1?'Посмотреть результат':!inExam&&index+1===exam?'К мини-экзамену':'Дальше','ls-primary',()=>{
  if(!locked)return;
  index++;mistake=false;locked=false;
  if(!inExam&&index===exam)examIntro();else step();
 });
 next.hidden=true;
 const check=bn('Проверить','ls-primary',()=>{
  if(locked||selected<0)return;
  const i=selected,yes=i===s.answer;
  feedback.replaceChildren(el('b',yes?'✦ Вот это да!':inExam?'Разберём ответ':'Попробуй ещё'),el('p',s.feedback[i]));
  if(yes){
   feedback.classList.add('ls-good');feedback.append(studioSpark());
   scene.append(studioSpark());side.classList.add('ls-cheer');speech.textContent='Отличная работа! Можно идти дальше.';
  }
  if(!yes&&!inExam){
   mistake=true;buttons[i].classList.add('ls-wrong');buttons[i].disabled=true;
   buttons[i].setAttribute('aria-pressed','false');selected=-1;check.disabled=true;
   const target=buttons.find(b=>!b.disabled);target?.focus({preventScroll:true});return;
  }
  if(yes&&inExam)correctFirst++;
  locked=true;
  for(const [j,b] of buttons.entries()){
   b.disabled=true;if(j===s.answer)b.classList.add('ls-right');else if(j===i)b.classList.add('ls-wrong');
  }
  check.hidden=true;hintToggle.hidden=true;hint.hidden=true;next.hidden=false;
  next.focus({preventScroll:true});
 });
 check.disabled=true;
 const hintToggle=bn('✧ Подсказка Ух','ls-ghost',()=>{
  hint.hidden=!hint.hidden;
  hintToggle.textContent=hint.hidden?'✧ Подсказка Ух':'Скрыть подсказку';
  hintToggle.setAttribute('aria-expanded',String(!hint.hidden));
 });
 hintToggle.setAttribute('aria-controls','studio-hint');hintToggle.setAttribute('aria-expanded','false');
 const buttons=s.choices.map((t,i)=>{
  const b=bn(t,'ls-token choice',()=>{
   if(locked)return;
   selected=i;check.disabled=false;
   for(const [j,target] of buttons.entries())target.setAttribute('aria-pressed',String(j===i));
  });
  b.setAttribute('aria-pressed','false');return b;
 });
 board.append(...buttons);paper.append(board,feedback);
 if(inExam)studioActions(paper,check,next);
 else{studioActions(paper,check,hintToggle,next);paper.append(hint)}
}
const legacyVisualTasks={"math-01":{"0":{"prompt":"В рамке пять синих фишек, а всего фишек девять. Какую группу жёлтых добавить?","kind":"pick","items":[["4","school-counters-4"],["3","school-counters-3"],["5","school-counters-5"]],"answer":0,"good":"Пять и четыре дают девять.","again":"Сверь карточки с условием и попробуй снова."},"1":{"prompt":"Перед тобой шесть фишек. Какую группу добавить, чтобы заполнить десять мест?","kind":"pick","items":[["3","school-counters-3"],["4","school-counters-4"],["5","school-counters-5"]],"answer":1,"good":"Шести недостаёт четырёх до десяти.","again":"Сверь карточки с условием и попробуй снова."}},"math-02":{"0":{"prompt":"В рамке заняты восемь из десяти мест. Какую часть пяти фишек передвинуть в рамку сразу?","kind":"pick","items":[["1","school-counters-1"],["3","school-counters-3"],["2","school-counters-2"]],"answer":2,"good":"Два свободных места заполняют десяток.","again":"Сверь карточки с условием и попробуй снова."},"1":{"prompt":"Из группы в пять фишек две переехали в рамку. Какая группа осталась снаружи?","kind":"pick","items":[["3","school-counters-3"],["2","school-counters-2"],["4","school-counters-4"]],"answer":0,"good":"От пяти осталось три, значит 8 + 5 = 10 + 3.","again":"Сверь карточки с условием и попробуй снова."}},"ru-01":{"0":{"prompt":"Ух сказала «Доброе утро!». К какой карточке отнести её слова?","kind":"pick","items":[["Написано на листе","paper"],["Сказано вслух","speech"],["Напечатано в книге","book"]],"answer":1,"good":"Произнесённые слова относятся к устной речи.","again":"Сверь карточки с условием и попробуй снова."},"1":{"prompt":"Топа написал «Я в саду». Как передано сообщение?","kind":"pick","items":[["Устная реплика","speech"],["Условная стрелка","arrow-right"],["Письменная записка","paper"]],"answer":2,"good":"Написанная записка относится к письменной речи.","again":"Сверь карточки с условием и попробуй снова."}},"ru-02":{"0":{"prompt":"Что изображает М на бумажной карточке?","kind":"pick","items":[["Букву М","school-letter-m"],["Звук [м]","speech"],["Слово «мост»","bridge"]],"answer":0,"good":"На карточке видна буква; звук произносят.","again":"Сверь карточки с условием и попробуй снова."},"1":{"prompt":"Выбери карточку с гласной буквой.","kind":"pick","items":[["М","school-letter-m"],["О","school-letter-o"],["Т","school-letter-t"]],"answer":1,"good":"О обозначает гласный звук.","again":"Сверь карточки с условием и попробуй снова."}},"world-01":{"0":{"prompt":"Разложи объекты из истории: что живёт и растёт, а что нет?","kind":"sort","items":[["Дерево","tree"],["Улитка","snail"],["Камень","stone"],["Облако","cloud"]],"answer":[0,0,1,1],"good":"Дерево и улитка — живые; камень и облако — нет.","again":"Сверь карточки с условием и попробуй снова.","bins":["Живое","Неживое"]},"1":{"prompt":"Улитка замерла. Какая карточка объясняет, почему она живая?","kind":"pick","items":[["На неё падает тень","school-cast-shadow"],["Она лежит у камня","stone"],["Она питается и растёт","snail"]],"answer":2,"good":"Улитка питается и растёт даже если в этот момент неподвижна.","again":"Сверь карточки с условием и попробуй снова."}},"world-02":{"0":{"prompt":"Сравни два кадра. По какому видно действие ветра?","kind":"pick","items":[["Кадр 1: лента свисает","ribbon-down"],["Кадр 2: ветер отклонил ленту","ribbon-side"],["Ни по одному","school-no-frame"]],"answer":1,"good":"Отклонённая лента во втором кадре показывает движение воздуха.","again":"Сверь карточки с условием и попробуй снова."},"1":{"prompt":"Что в истории двигало ленту?","kind":"pick","items":[["Воздух","wind"],["Вода","water"],["Флагшток","school-flagpole"]],"answer":0,"good":"Ленту отклоняет движущийся воздух.","again":"Сверь карточки с условием и попробуй снова."}},"safety-01":{"0":{"prompt":"На вымышленной схеме в каком месте герою остановиться?","kind":"pick","items":[["Перед ограждением ремонтных работ","barrier"],["У обычной площадки","playground"],["У открытой скамейки","bench"]],"answer":0,"good":"Перед знаком ремонта герой останавливается.","again":"Сверь карточки с условием и попробуй снова."},"1":{"prompt":"Герой видит закрытую дорожку. Как узнать причину безопасно?","kind":"pick","items":[["Попросить другого ребёнка проверить","chick"],["Спросить воспитательницу перед ограждением","speech"],["Считать ограждение украшением","barrier"]],"answer":1,"good":"Доверенный взрослый поможет, не заходя в закрытую зону.","again":"Сверь карточки с условием и попробуй снова."}},"safety-02":{"0":{"prompt":"У двух путей на вымышленной карте разная длина. Какой выбрать со взрослым?","kind":"pick","items":[["Короткий, без перехода","road"],["Через ограждение","barrier"],["Длинный, с тротуаром и переходом","crosswalk"]],"answer":2,"good":"На схеме безопасный маршрут включает тротуар и обозначенный переход.","again":"Сверь карточки с условием и попробуй снова."},"1":{"prompt":"Как узнать на схеме место для движения пешком вдоль дороги?","kind":"pick","items":[["Найти подпись «тротуар»","sidewalk"],["Найти подпись «парковка»","parking"],["Найти самую короткую линию","path"]],"answer":0,"good":"Подпись «тротуар» обозначает место для пешеходов.","again":"Сверь карточки с условием и попробуй снова."}},"art-01":{"0":{"prompt":"В каком эскизе две детали подсказывают весну?","kind":"pick","items":[["Талая вода и первые почки","school-spring-thaw"],["Сугроб и сосульки","school-winter-icicles"],["Жёлтые листья и каштаны","school-leaf-chestnut"]],"answer":0,"good":"Талая вода и первые почки передают весну.","again":"Сверь карточки с условием и попробуй снова."},"1":{"prompt":"Какой набор деталей подойдёт для осени без надписи?","kind":"pick","items":[["Зелёные почки на ветке","spring-buds"],["Бурые и жёлтые листья под деревом","autumn-leaf"],["Снег на дорожке","school-snowy-path"]],"answer":1,"good":"Опавшие жёлтые и бурые листья помогают узнать осень.","again":"Сверь карточки с условием и попробуй снова."}},"art-02":{"0":{"prompt":"Какую краску добавить к синей гуаши, чтобы получить светлее синий?","kind":"pick","items":[["Белую","swatch-white"],["Чёрную","swatch-black"],["Тёмно-синюю","school-dark-blue"]],"answer":0,"good":"Немного белой гуаши осветляет синий.","again":"Сверь карточки с условием и попробуй снова."},"1":{"prompt":"Выбери карточку тёплой гаммы.","kind":"pick","items":[["Голубой и синий","school-blue-pair"],["Оранжевый и золотисто-жёлтый","school-warm-pair"],["Синий и сиреневый","school-violet-pair"]],"answer":1,"good":"Оранжевый и золотисто-жёлтый здесь образуют тёплую пару.","again":"Сверь карточки с условием и попробуй снова."}},"en-01":{"0":{"prompt":"Топа появился на причале: «Hello!» Выбери ответ в его комиксе.","kind":"pick","items":[["Hi!","speech"],["Goodbye!","speech"],["Good night!","speech"]],"answer":0,"good":"Hi! — короткий ответ на приветствие при встрече.","again":"Сверь карточки с условием и попробуй снова."},"1":{"prompt":"На причале пять кубиков. Как подписать их количество?","kind":"pick","items":[["Four","dice-four"],["Five","dice-five"],["Six","dice-six"]],"answer":1,"good":"Five означает «пять».","again":"Сверь карточки с условием и попробуй снова."}},"en-02":{"0":{"prompt":"Топа ищет обувь для снега. Какую подписанную вещь выбрать?","kind":"pick","items":[["Scarf","scarf"],["Hat","hat"],["Boots","boots"]],"answer":2,"good":"Boots — сапоги; их надевают на ноги.","again":"Сверь карточки с условием и попробуй снова."},"1":{"prompt":"Топа написал «I have got a scarf». Какую вещь он показывает?","kind":"pick","items":[["Шарф","scarf"],["Шапку","hat"],["Сапоги","boots"]],"answer":0,"good":"A scarf — шарф.","again":"Сверь карточки с условием и попробуй снова."}},"logic-01":{"0":{"prompt":"Выложено: лист, капля, лист, капля, лист. Чем продолжить?","kind":"pick","items":[["Лист","leaf"],["Капля","water"],["Звезда","star"]],"answer":1,"good":"Лист и капля чередуются.","again":"Сверь карточки с условием и попробуй снова."},"1":{"prompt":"Группы гирлянды: звезда, звезда, круг. В третьей группе уже есть первая звезда. Выбери две оставшиеся фигуры.","kind":"pick","items":[["Круг, звезда","pilot-dot-star"],["Звезда, звезда","pilot-two-stars"],["Звезда, круг","pilot-star-dot"]],"answer":2,"good":"Повторяется группа «звезда, звезда, круг».","again":"Сверь карточки с условием и попробуй снова."}},"logic-02":{"0":{"prompt":"Собери три кадра с шариком: Ух надула его до завязывания ленты, а затем повесила.","kind":"order","items":[["Повесила шарик","pilot-balloon-hung"],["Завязала ленту","pilot-balloon-tied"],["Надула шарик","pilot-balloon-air"]],"answer":[2,1,0],"good":"Между надуванием и подвешиванием Ух завязала ленту.","again":"Сверь карточки с условием и попробуй снова."},"1":{"prompt":"Собери три кадра: Топа убрал клей после приклеивания звезды, но до показа открытки.","kind":"order","items":[["Показал открытку","pilot-postcard-shown"],["Приклеил звезду","pilot-postcard-glued"],["Убрал клей","pilot-glue-stowed"]],"answer":[1,2,0],"good":"Сначала звезда, затем убранный клей, потом показ открытки.","again":"Сверь карточки с условием и попробуй снова."}},"money-01":{"0":{"prompt":"Топе нужно подписать поделку. Что взять?","kind":"pick","items":[["Карандаш","pencil"],["Блёстки","pilot-glitter-pot"],["Бумажную звезду","pilot-paper-star"]],"answer":0,"good":"Карандашом можно сделать надпись.","again":"Сверь карточки с условием и попробуй снова."},"1":{"prompt":"После игры Ух хочет пить. Что взять из доступного прямо сейчас?","kind":"pick","items":[["Игрушку","pilot-toy-bear"],["Свою воду","pilot-water-bottle"],["Афишу","pilot-poster"]],"answer":1,"good":"Вода отвечает на потребность, которая появилась сейчас.","again":"Сверь карточки с условием и попробуй снова."}},"money-02":{"0":{"prompt":"Сложи достоинства фишек: 2, 2 и 5. На какой карточке их сумма?","kind":"pick","items":[["8","pilot-coins-8"],["7","pilot-coins-7"],["9","pilot-coins-9"]],"answer":2,"good":"Две двойки дают четыре, плюс пять — девять.","again":"Сверь карточки с условием и попробуй снова."},"1":{"prompt":"В игре макет стоит восемь жетонов. Топа отдаёт десять. Какой набор жетонов вернуть?","kind":"pick","items":[["2 жетона","pilot-coins-2"],["3 жетона","pilot-coins-3"],["1 жетон","pilot-coins-1"]],"answer":0,"good":"Сдача — разница: 10 − 8 = 2.","again":"Сверь карточки с условием и попробуй снова."}},"story-01":{"0":{"prompt":"Ух увидела бумажный кораблик у окна. Какой следующий кадр даёт ей повод для приключения?","kind":"pick","items":[["Кораблик с её именем: Ух идёт искать автора","pilot-boat-named"],["Ух рассматривает окно и возвращается к делам","pilot-owl-window"],["Кораблик лежит на прежнем месте","pilot-boat-still"]],"answer":0,"good":"Имя на кораблике вызывает вопрос, и Ух решает действовать.","again":"Сверь карточки с условием и попробуй снова."},"1":{"prompt":"Какой первый кадр показывает и героя, и место?","kind":"pick","items":[["Афиша крупным планом","pilot-poster"],["Топа крепит афишу у двери клуба","pilot-dragon-posting"],["Пустой зал клуба","pilot-empty-hall"]],"answer":1,"good":"Кадр с Топой и входом показывает одновременно героя и место.","again":"Сверь карточки с условием и попробуй снова."}},"story-02":{"0":{"prompt":"Собери кадры об Ух и потерянном мелке.","kind":"order","items":[["Положила мелок в ящик","pilot-chalk-stowed"],["Увидела мелок под столом","pilot-chalk-under"],["Открыла пустой ящик","pilot-drawer-empty"]],"answer":[2,1,0],"good":"Ух сначала обнаружила пропажу, затем нашла мелок и вернула его.","again":"Сверь карточки с условием и попробуй снова."},"1":{"prompt":"Какой кадр вставить между упавшей коробкой и кадром, где все пуговицы снова внутри?","kind":"pick","items":[["Собирают пуговицы с пола","pilot-buttons-gather"],["Показывают закрытую дверь","door"],["Снова роняют полную коробку","pilot-box-falling"]],"answer":0,"good":"Сбор пуговиц объясняет, почему они снова оказались в коробке.","again":"Сверь карточки с условием и попробуй снова."}},"reading-01":{"0":{"prompt":"Кто идёт рядом в загадке и исчезает в темноте?","kind":"pick","items":[["Тень","shadow"],["Рюкзак","school-backpack"],["Кот","cat"]],"answer":0,"good":"Свет даёт тень, в темноте этой тени нет.","again":"Сверь карточки с условием и попробуй снова."},"1":{"prompt":"Какая строка помогает отличить тень от рюкзака?","kind":"pick","items":[["«Рядом шагаю»","footsteps"],["«Уйду в темноте»","lantern-off"],["«На дорожке встречусь»","path"]],"answer":1,"good":"В темноте тень исчезает, а рюкзак остаётся.","again":"Сверь карточки с условием и попробуй снова."}},"reading-02":{"0":{"prompt":"«Ручки вверх, ручки вниз». Что взрослый делает этими словами?","kind":"pick","items":[["Сопровождает движения","arms-up-down"],["Объявляет обед","spoon"],["Укладывает спать","moon"]],"answer":0,"good":"Слова подсказывают движения и сопровождают зарядку.","again":"Сверь карточки с условием и попробуй снова."},"1":{"prompt":"Палец «в гости постучал» и спрятался за ладонью. Зачем здесь слова?","kind":"pick","items":[["Чтобы измерить ладонь","ruler"],["Чтобы сделать движения пальцев игрой","hand"],["Чтобы описать настоящий дом","house"]],"answer":1,"good":"Слова превращают движение пальцев в воображаемый сюжет.","again":"Сверь карточки с условием и попробуй снова."}},"be-01":{"0":{"prompt":"Раскладзі тры канверты з вялікімі літарамі па адпаведных малых.","kind":"sort","items":[["І","school-letter-i"],["А","school-letter-a"],["М","school-letter-m"]],"answer":[1,2,0],"good":"Правільныя пары: І — і, А — а, М — м.","again":"Посмотри на карточки ещё раз и сверь буквы с условием.","bins":["м","і","а"]},"1":{"prompt":"Раскладзі словы паводле месца літары і.","kind":"sort","items":[["іголка","needle"],["ліст","leaf"],["іскра","school-spark"],["вікно","window"]],"answer":[0,1,0,1],"good":"У словах «іголка» і «іскра» і першая, а ў словах «ліст» і «вікно» яна ўнутры.","again":"Посмотри на карточки ещё раз и сверь буквы с условием.","bins":["У пачатку","У сярэдзіне"]}},"be-02":{"0":{"prompt":"Паглядзі на слова «сям’я». Які знак паміж м і я?","kind":"pick","items":[["Кропка","dot"],["Апостраф","apostrophe"],["Коска","comma"]],"answer":1,"good":"Паміж м і я напісаны апостраф.","again":"Посмотри на карточки ещё раз и сверь буквы с условием."},"1":{"prompt":"Раскладзі карткі па першых дзвюх літарах.","kind":"sort","items":[["гара","hill"],["гітара","guitar"],["гарбата","tea"],["гімн","music"]],"answer":[0,1,0,1],"good":"«Гара» і «гарбата» пачынаюцца з га, а «гітара» і «гімн» — з гі.","again":"Посмотри на карточки ещё раз и сверь буквы с условием.","bins":["га","гі"]}}};
function showVisualStep(task,{paper,side,scene,speech,exam,inExam,labRenderer}){
 const label=paper.querySelector('.ls-typepill');
 if(label)label.textContent=task.trainerLabel||{pick:'Карточки',sort:'Сортировка',order:'Порядок',route:'Маршрут'}[task.kind];
 if(!inExam)speech.textContent=labRenderer?'Сначала выполни пробу на рабочем поле. Затем нажми «Проверить».':'Поработай с карточками. Их можно перетащить или выбрать нажатием.';
 const feedback=el('div','','ls-feedback');feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
 const next=bn(index===current.steps.length-1?'Посмотреть результат':!inExam&&index+1===exam?'К мини-экзамену':'Дальше','ls-primary',()=>{
  if(!locked)return;
  index++;mistake=false;locked=false;
  if(!inExam&&index===exam)examIntro();else step();
 });next.hidden=true;
 const hint=el('p',studioHints[current.id],'ls-hint-strip');hint.hidden=true;hint.id='studio-visual-hint';
 const help=bn('✧ Подсказка Ух','ls-ghost',()=>{
  hint.hidden=!hint.hidden;help.setAttribute('aria-expanded',String(!hint.hidden));help.textContent=hint.hidden?'✧ Подсказка Ух':'Скрыть подсказку';
 });help.setAttribute('aria-controls',hint.id);help.setAttribute('aria-expanded','false');
 let board,check;
 board=(labRenderer||(active.id==='lab'&&window.topouhLabVisualBoard)||window.topouhVisualBoard)(task,{onChange:()=>{if(check)check.disabled=locked||!board.ready()}});
 check=bn('Проверить','ls-primary',()=>{
  if(locked||!board.ready())return;
  const yes=board.verify();
  feedback.replaceChildren(el('b',yes?'✦ Вот это да!':inExam?'Разберём ответ':'Попробуй ещё'),el('p',yes?task.good:task.again));
  if(!yes&&!inExam){mistake=true;board.reset();return;}
  locked=true;
  if(yes){
   board.lock();
   if(inExam){
    correctFirst++;
    if(active.id==='lab'&&index===current.steps.length-1&&correctFirst===current.steps.length-exam){
     window.topouhCourseRecord?.(current.id,correctFirst,current.steps.length-exam);
    }
   }
   feedback.classList.add('ls-good');feedback.append(studioSpark());scene.append(studioSpark());
   side.classList.add('ls-cheer');speech.textContent='Отличная работа! Можно идти дальше.';
  }else board.reveal();
  check.hidden=true;help.hidden=true;hint.hidden=true;next.hidden=false;next.focus({preventScroll:true});
 });check.disabled=true;
 if(labRenderer)scene.append(board.element);else paper.append(board.element);
 paper.append(feedback);
 studioActions(paper,check,...(inExam?[]:[help]),next);
 if(!inExam)paper.append(hint);
}
function end(){
 const c=active,l=current,count=current.steps.length-examStartAt(),pass=correctFirst===count;
 if(pass){completed.set(l.id,{correctFirst,count});window.topouhCourseRecord?.(l.id,correctFirst,count);}
 const {paper}=studioLayout(c,l,pass?'Получилось! Можно начать следующий урок или повторить эту тему.':'Теперь ты знаешь, что было трудным. Потренируйся и попробуй ещё раз.',pass);
 const other=c.lessons[c.lessons.indexOf(l)+1];
 paper.append(el('span',pass?'✦ Проверка пройдена':'Мини-экзамен','ls-typepill'));
 heading(paper,pass?'Тема пройдена!':'Ещё немного практики');
 paper.append(el('p',correctFirst+' из '+count+' верно','ls-result-award result-pill'),
  el('p',pass?(other?'Следующая тема открыта.':'Все темы предмета пройдены.'):'Чтобы открыть новую тему, нужны два верных ответа.','ls-result-note'));
 if(l.practical)paper.append(el('p','Попробуй на бумаге: '+l.practical,'ls-mission'));
 const actions=studioActions(paper);
 if(pass&&other)actions.append(bn(c.id==='lab'?'Дальше: '+other.title:'Следующая тема','ls-primary',()=>start(c,other)));
 if(!pass)actions.append(bn('Повторить мини-экзамен','ls-primary',examIntro));
 actions.append(bn('Попробовать ещё раз','ls-ghost',()=>start(c,l)),bn('К списку уроков','ls-ghost',()=>workshopIds.has(c.id)||c.id==='en'?showWorkshopModule(c,l):list(c)));
}
app.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 const t=b.textContent.trim();
 if(b.classList.contains('routeB')||t==='К списку уроков')window.TopouhAudio?.tone('back');
 else if(t==='Посмотреть результат')window.TopouhAudio?.tone('finish');
 else if(b.matches('.courseCard,.lessonCard,.math-cta,.math-topic,.ls-next')||['Начать занятие','Дальше','Попробовать ещё раз'].includes(t))window.TopouhAudio?.tone('forward');
},{capture:true});
/* Topouh math dashboard and module navigator */
/* Topouh dashboards for all courses */
/* Topouh workshops in the course studio */
const workshopIds=new Set(['logic','money','story']);
const courseNames={logic:'Логика',money:'Финансовая грамотность',story:'Истории и комиксы',math:'Математика',ru:'Русский язык',reading:'Литературное чтение',be:'Беларуская мова',
 world:'Человек и мир',safety:'Основы безопасности',art:'Изобразительное искусство',en:'Английский с Топой'};
const extendedWorkshopModules={"lab":[{"id":"part-1","title":"Вопрос и догадка","note":"Учимся задавать проверяемые вопросы и отличать догадку от записи.","after":""},{"id":"part-2","title":"Честная проба","note":"Меняем одну вещь, держим остальные условия и повторяем наблюдения.","after":"После раздела «Вопрос и догадка»"},{"id":"part-3","title":"Замечаем закономерности","note":"Разбираем условные таблицы, ищем исключения и делаем аккуратные выводы.","after":"После раздела «Честная проба»"},{"id":"part-4","title":"Мой отчёт об открытии","note":"Придумываем безопасную проверку, сохраняем данные и делимся результатом.","after":"После раздела «Замечаем закономерности»"}],"code":[{"id":"part-1","title":"Команда за командой","note":"Робот исполняет только записанные действия и выполняет их по порядку.","after":""},{"id":"part-2","title":"Отладка","note":"Замечаем ошибку, воспроизводим её и пробуем одно точное исправление.","after":"После раздела «Команда за командой»"},{"id":"part-3","title":"Повторы и условия","note":"Робот учится замечать повторяющуюся группу и выбирать действие по признаку.","after":"После раздела «Отладка»"},{"id":"part-4","title":"Мастерская миссий","note":"Соединяем маршрут, повторы и проверки; рисуем свою короткую программу.","after":"После раздела «Повторы и условия»"}],"team":[{"id":"part-1","title":"Слышать друг друга","note":"Слово по очереди, проверка услышанного, уточнение и роли.","after":""},{"id":"part-2","title":"Честно договориться","note":"Общая цель, равная очередь, правила и посильная помощь.","after":"После раздела «Слышать друг друга»"},{"id":"part-3","title":"Выполнять вместе","note":"Право отказаться, сравнение предложений, распределение и передача дел.","after":"После раздела «Честно договориться»"},{"id":"part-4","title":"Своя миссия","note":"Отзыв без оценивания, запасной план, разбор результата и свой проект.","after":"После раздела «Выполнять вместе»"}],"invent":[{"id":"part-1","title":"От проблемы к чертежу","note":"Прежде чем мастерить, узнаём, кому и чем поможет вещь.","after":""},{"id":"part-2","title":"Материал и форма","note":"Смотрим, как простые изменения делают модель удобнее.","after":"После раздела «От проблемы к чертежу»"},{"id":"part-3","title":"Испытываем и улучшаем","note":"Берём замечания всерьёз и меняем одну деталь за раз.","after":"После раздела «Материал и форма»"},{"id":"part-4","title":"Собственная мастерская","note":"Выбираем задачу, проверяем модель и показываем работающий результат.","after":"После раздела «Испытываем и улучшаем»"}],"games":[{"id":"part-1","title":"Из чего состоит игра","note":"Цель, направление, ход и разные карточки.","after":""},{"id":"part-2","title":"Первые правила и черновик","note":"Случай и выбор, точные правила, бумажный вариант и памятка.","after":"После раздела «Из чего состоит игра»"},{"id":"part-3","title":"Тестируем и улучшаем","note":"Наблюдение, повторная проба, кооперация и выбор маршрута.","after":"После раздела «Первые правила и черновик»"},{"id":"part-4","title":"Собственная игра","note":"Значки, комплект, показ новичку и итоговый игровой набор.","after":"После раздела «Тестируем и улучшаем»"}],"maps":[{"id":"part-1","title":"Как карта говорит","note":"Учимся читать вид сверху, значки и подписи, ориентируясь на легенду.","after":""},{"id":"part-2","title":"Смотрим по сторонам","note":"Находим место по соседям, стрелкам, клеткам и нужному повороту схемы.","after":"После раздела «Как карта говорит»"},{"id":"part-3","title":"Как туда пройти","note":"Следим за связями, отмечаем нужные остановки и сравниваем направления маршрутов.","after":"После раздела «Смотрим по сторонам»"},{"id":"part-4","title":"Карта для другого","note":"Делаем карту, которую другой человек может понять без устных подсказок.","after":"После раздела «Как туда пройти»"}],"garden":[{"id":"part-1","title":"Знакомство с садом","note":"Ух учится замечать то, что можно увидеть, и следить за изменениями.","after":""},{"id":"part-2","title":"Готовим место","note":"Планируем маленький опыт вместе со взрослым или работаем с учебными карточками.","after":"После раздела «Знакомство с садом»"},{"id":"part-3","title":"Опыты на картинках","note":"Сравниваем учебные записи и не делаем выводов из одного взгляда.","after":"После раздела «Готовим место»"},{"id":"part-4","title":"Мой садовый дневник","note":"Создаём три записи и короткий рассказ: о растении со взрослым или по учебным рисункам.","after":"После раздела «Опыты на картинках»"}]};
Object.assign(courseNames,{"lab":"Лаборатория открытий","code":"Первые программы","team":"Командные миссии","invent":"Бюро изобретений","games":"Ателье настольных игр","maps":"Картографы","garden":"Сад на подоконнике"});
for(const id of Object.keys(extendedWorkshopModules))workshopIds.add(id);
const courseModuleNotes={
 logic:['Узоры, правила и группы','Подсказки, порядок и маршруты','Проверяем выводы и решаем задачу'],
 money:['Нужное, жетоны и сдача','Сравниваем варианты и планируем','Тренируем осторожность и выбор'],
 story:['Начало, герои и порядок событий','Диалоги, чувства и исправления','Придумываем финал и комикс'],
 math:['Числа, счёт и первые задачи','Новые примеры на знакомые темы','Задачи из жизни и мини-проекты'],
 ru:['Речь, слова и предложения','Проверяем написание и смысл','Пишем и редактируем'],
 reading:['Истории, загадки и стихи','Читаем внимательно и ищем подсказки','Объясняем, сравниваем и пересказываем'],
 be:['Літары, словы і сказы','Новыя прыклады на знаёмыя тэмы','Чытаем, складаем і рэдагуем'],
 world:['Природа и мир вокруг нас','Наблюдаем и сравниваем','Решаем задачи из жизни'],
 safety:['Безопасность дома, в школе и на улице','Замечаем риски в новых ситуациях','Выбираем безопасные действия'],
 art:['Цвет, форма и композиция','Пробуем новое в знакомых техниках','Придумываем свои работы'],
 en:['Первые слова и простые фразы','Тренируем английский в новых ситуациях','Составляем фразы и диалоги']
};
const beCourseLabels=new Map(Object.entries({
 'Все предметы':'Усе прадметы','Разделы':'Раздзелы','Программа':'Праграма','Твой прогресс':'Твой прагрэс',
 'тем пройдено':'тэм пройдзена','Следующий урок':'Наступны ўрок','Пока закрыто':'Пакуль закрыта',
 'Пройдено':'Пройдзена','Все темы пройдены!':'Усе тэмы пройдзены!','Начать урок':'Пачаць урок',
 'Продолжить урок':'Працягнуць урок','Повторить урок':'Паўтарыць урок',
 'Что внутри':'Што ўнутры','Пройденные темы можно повторить':'Пройдзеныя тэмы можна паўтарыць',
 'Темы открываются после мини-экзаменов':'Тэмы адкрываюцца пасля міні-экзаменаў',
 'Все три раздела пройдены':'Усе тры раздзелы пройдзены',
 'Выбрать тему для повторения':'Выбраць тэму для паўтарэння',
 'Свернуть список':'Згарнуць спіс','Мини-экзамен · 2 задания':'Міні-экзамен · 2 заданні',
 'Можно вернуться к любимой теме и повторить задания.':'Можна вярнуцца да любімай тэмы і паўтарыць заданні.'
}));
const beModuleNames={base:['Асновы',''],review:['Замацаванне','Пасля «Асноў»'],apply:['Прымяненне','Пасля «Замацавання»']};
function courseIsDashboard(id){return Object.hasOwn(courseNames,id)}
function launchCourseLesson(c,l){
 if(c.id!=='be'){start(c,l);return}
 if(!/^be-(0[1-9]|[1-3]\d|4[0-2])$/.test(l.id)||!c.lessons.some(a=>a.id===l.id))return;
 const done=window.topouhCoursePassedIds?.()||new Set();
 if(done.has(l.id)||c.lessons.find(a=>!done.has(a.id))?.id===l.id)
   {if(window.TopouhAudioNav)window.TopouhAudioNav.belarusian(l.id);else location.assign('index.html?section=belarusian&lesson='+l.id);}
}
const mathModules=[
 {id:'base',title:'Основы',note:'Числа, счёт и первые задачи',after:''},
 {id:'review',title:'Закрепление',note:'Новые примеры на знакомые темы',after:'После «Основ»'},
 {id:'apply',title:'Применение',note:'Задачи из жизни и мини-проекты',after:'После «Закрепления»'}
];
const workshopExtraModules=[
 {id:'tools',title:'Новые приёмы',after:'После «Применения»'},
 {id:'puzzles',title:'Задачи с секретом',after:'После «Новых приёмов»'},
 {id:'projects',title:'Большая мастерская',after:'После «Задач с секретом»'}
];
const workshopExtraNotes={
 logic:['Меняем правила и замечаем признаки','Собираем доказательства из подсказок','Проверяем хитрые выводы и планы'],
 money:['Разбираемся, зачем и как тратить жетоны','Смотрим на общую цену и проверяем выбор','Планируем покупки, копим и проверяем бюджет'],
 story:['Пробуем новые способы рассказать историю','Редактируем кадры и раскрываем героев','Собираем и проверяем короткие комиксы']
};
const workshopContinuationV11=Object.freeze({"code":[{"id":"next-1","title":"Состояние робота","note":"Что исполнитель помнит после шага.","after":"После раздела «Мастерская миссий»"},{"id":"next-2","title":"Запускаем по сигналу","note":"Разные события вызывают разные программы.","after":"После раздела «Состояние робота»"},{"id":"next-3","title":"Рисуем правила для клеток","note":"Управляем целыми узорами и читаем чужой код.","after":"После раздела «Запускаем по сигналу»"},{"id":"next-4","title":"Напарники и испытания","note":"Собираем код из блоков и передаём товарищу.","after":"После раздела «Рисуем правила для клеток»"}],"invent":[{"id":"next-1","title":"Что должна уметь вещь","note":"Выбираем форму по задаче и различаем важное и желаемое.","after":"После раздела «Собственная мастерская»"},{"id":"next-2","title":"Детали, которые двигаются","note":"Испытываем шарнир, ползунок, упор и ограничитель.","after":"После раздела «Что должна уметь вещь»"},{"id":"next-3","title":"Проверяем до поломки","note":"Находим слабое место и выбираем маленькую поправку.","after":"После раздела «Детали, которые двигаются»"},{"id":"next-4","title":"Изобретение для другого","note":"Делаем понятный набор и показываем, как он работает.","after":"После раздела «Проверяем до поломки»"}],"lab":[{"id":"next-1","title":"Наблюдаем внимательнее","note":"От первых заметок к аккуратным сравнениям.","after":"После раздела «Мой отчёт об открытии»"},{"id":"next-2","title":"Проверяем один признак","note":"Меняем только то, что хотим изучить.","after":"После раздела «Наблюдаем внимательнее»"},{"id":"next-3","title":"Собираем доказательства","note":"Осторожно говорим о том, что показала проверка.","after":"После раздела «Проверяем один признак»"},{"id":"next-4","title":"Своя маленькая проверка","note":"Планируем, проводим и показываем результат простого бумажного исследования.","after":"После раздела «Собираем доказательства»"}],"team":[{"id":"next-1","title":"Все могут участвовать","note":"Выбираем способы участия, не решая за других.","after":"После раздела «Своя миссия»"},{"id":"next-2","title":"Общее дело из частей","note":"Обозначаем стыки и не теряем работу друг друга.","after":"После раздела «Все могут участвовать»"},{"id":"next-3","title":"Решения без победителей","note":"Смотрим на разные интересы и проверяем договор.","after":"После раздела «Общее дело из частей»"},{"id":"next-4","title":"Показ нашей работы","note":"Передаём контекст, замечаем вклад, планируем следующий шаг.","after":"После раздела «Решения без победителей»"}],"games":[{"id":"next-1","title":"Правила, которые работают","note":"Перепроверяем игровые правила на конкретных ходах.","after":"После раздела «Собственная игра»"},{"id":"next-2","title":"Пробная партия","note":"Собираем маленькие проверки и улучшаем правила без штрафов.","after":"После раздела «Правила, которые работают»"},{"id":"next-3","title":"Игра для разных игроков","note":"Делаем игровые действия ясными и доступными.","after":"После раздела «Пробная партия»"},{"id":"next-4","title":"Своя настольная премьера","note":"Проверяем и представляем собственную настольную игру.","after":"После раздела «Игра для разных игроков»"}],"garden":[{"id":"next-1","title":"Листья под внимательным взглядом","note":"Сравниваем расположение и форму на учебных схемах.","after":"После раздела «Мой садовый дневник»"},{"id":"next-2","title":"Микромир на картинке","note":"Рассматриваем безопасные модели маленьких садовых сцен.","after":"После раздела «Листья под внимательным взглядом»"},{"id":"next-3","title":"Сравниваем садовые истории","note":"Объясняем, какие сведения нашли, а какие ещё нужны.","after":"После раздела «Микромир на картинке»"},{"id":"next-4","title":"Садовый путеводитель","note":"Создаём приватный альбом наблюдателя без полива и опытов без взрослого.","after":"После раздела «Сравниваем садовые истории»"}],"maps":[{"id":"next-1","title":"Карта для другого человека","note":"Проверяем, может ли другой читатель воспользоваться схемой.","after":"После раздела «Карта для другого»"},{"id":"next-2","title":"Маршруты с условиями","note":"Учимся менять путь и сохранять обязательные остановки.","after":"После раздела «Карта для другого человека»"},{"id":"next-3","title":"Пространственные загадки","note":"Проверяем направления, масштаб и чтение карты.","after":"После раздела «Маршруты с условиями»"},{"id":"next-4","title":"Своя понятная карта","note":"Рисуем и проверяем приватную вымышленную карту.","after":"После раздела «Пространственные загадки»"}],"logic":[{"id":"next-1","title":"Точные условия","note":"Читаем несколько признаков, ограничения и шаги.","after":"После раздела «Большая мастерская»"},{"id":"next-2","title":"Вывод по подсказкам","note":"Проверяем связь и вывод, не подменяя их догадкой.","after":"После раздела «Точные условия»"},{"id":"next-3","title":"Отражения и команды","note":"Отслеживаем изменения в схеме и коде.","after":"После раздела «Вывод по подсказкам»"},{"id":"next-4","title":"Изобретатели правил","note":"Собираем пары, чиним задачи и предлагаем свою загадку.","after":"После раздела «Отражения и команды»"}],"money":[{"id":"next-1","title":"Учебные монеты и ценники","note":"Считаем учебные жетоны и выясняем, что входит в цену.","after":"После раздела «Большая мастерская»"},{"id":"next-2","title":"Набор под задачу","note":"Сверяем цену, количество, свойства и запас.","after":"После раздела «Учебные монеты и ценники»"},{"id":"next-3","title":"Тетрадь планов","note":"Считаем остаток, ведём записи и проверяем условия.","after":"После раздела «Набор под задачу»"},{"id":"next-4","title":"Маленькая ярмарка","note":"Сверяем кассу и изобретаем безопасный покупочный сценарий.","after":"После раздела «Тетрадь планов»"}],"story":[{"id":"next-1","title":"Читабельный кадр","note":"Время, взгляд, силуэт, повтор и рамка.","after":"После раздела «Большая мастерская»"},{"id":"next-2","title":"Куда свернёт история","note":"Мысли, воспоминания, развилки и первый неудачный план.","after":"После раздела «Читабельный кадр»"},{"id":"next-3","title":"Видимые решения","note":"Слова в мире истории, акцент, движение и фантазия.","after":"После раздела «Куда свернёт история»"},{"id":"next-4","title":"Серия и редактура","note":"Карта, речевые пузыри, проба читателя и два варианта своего выпуска.","after":"После раздела «Видимые решения»"}]});
function dashboardModules(id){
 if(id==='en')return [...mathModules,...(window.topouhEnglishSections||[])];
 const original=Object.hasOwn(extendedWorkshopModules,id)?extendedWorkshopModules[id]:workshopIds.has(id)?[...mathModules,...workshopExtraModules]:mathModules;
 return Object.hasOwn(workshopContinuationV11,id)?[...original,...workshopContinuationV11[id]]:original;
}
function showWorkshopModule(c,l){
 const id=dashboardModules(c.id).find(m=>m.title===l.module)?.id||'';
 changeCatalogueRoute(c.id,'push',id);
 list(c,'none');
}
let mathExpanded=false,mathSection='',mathSelection='';
function mathModuleFrom(u){
 const v=u.searchParams.getAll('module');
 return v.length===1&&dashboardModules(u.searchParams.get('course')).some(m=>m.id===v[0])?v[0]:'';
}
function mathAppend(parent,...children){parent.append(...children);return parent;}
function mathOwl(id){
 const a=el('div','','math-feature-art');a.setAttribute('aria-hidden','true');
 const img=el('img');const landscape=sceneSource(id);if(landscape)a.classList.add('topouh-course-scenery');img.src=landscape||subjectOwl(id);img.alt='';
 return mathAppend(a,img,el('i','','math-star math-star-one'),el('i','','math-star math-star-two'));
}
function renderMath(c,moduleId){
 const bel=c.id==='be',workshop=workshopIds.has(c.id);
 const tr=x=>bel?(beCourseLabels.get(x)||x):x;
 const name=courseNames[c.id]||c.title;
 const launch=l=>launchCourseLesson(c,l);
 const passed=window.topouhCoursePassedIds?.()||new Set();
 const allDone=c.lessons.filter(l=>passed.has(l.id)).length;
 const upcoming=c.lessons.find(l=>!passed.has(l.id));
 const groups=dashboardModules(c.id).map((m,i)=>{
  const lessons=c.lessons.filter(l=>(l.module||'Основы')===m.title);
  const done=lessons.filter(l=>passed.has(l.id)).length;
  const labels=bel?beModuleNames[m.id]:[m.title,m.after];
  return {...m,title:labels[0],after:labels[1],note:m.note&&(extendedWorkshopModules[c.id]||m.id.startsWith('next-')||m.id.startsWith('eng-'))?m.note:courseModuleNotes[c.id]?.[i]??workshopExtraNotes[c.id]?.[i-3],lessons,done,open:(c.id==='en'&&m.id.startsWith('eng-'))||i===0||passed.has(lessons[0]?.id)||upcoming?.id===lessons[0]?.id||lessons.some(l=>l.id===upcoming?.id)};
 });
 const requested=groups.find(g=>g.id===moduleId),group=requested?.open?requested:null;
 if(requested&&!group)changeCatalogueRoute(c.id,'replace','');
 const section=c.id+'-'+(group?.id||'');
 if(section!==mathSection){mathSection=section;mathExpanded=false;mathSelection=''}
 const openGroup=(id)=>{changeCatalogueRoute(c.id,'push',id);list(c,'none')};
 const getStatus=l=>passed.has(l.id)?'Пройдено':(c.id==='en'?window.topouhCourseCanStart(c.id,l.id):upcoming?.id===l.id)?'Следующий урок':'Пока закрыто';
 app.dataset.mathDashboard='true';
 app.dataset.courseDash=c.id;
 const root=el('div','','math-dashboard');if(bel)root.lang='be';app.append(root);
 const nav=el('nav','','math-nav');nav.setAttribute('aria-label',bel?'Навігацыя па прадмеце':'Навигация по предмету');
 nav.append(bn(tr('Все предметы'),'math-back routeB',home));
 if(group)nav.append(bn(name,'math-back routeB',()=>openGroup('')));
 root.append(nav);
 const mast=el('div','','math-heading');root.append(mast);heading(mast,group?group.title:name);
 mast.append(el('p',workshop?(group?name+' · Вне школы':'Вне школы · мастерская'):(group?name+(bel?' · 2 клас':' · 2 класс'):(bel?'2 клас · твой вучэбны маршрут':c.id==='en'?'2 класс · тренажёр: слова, фразы и игры':'2 класс · твой учебный маршрут'))));
 function feature(lesson,kicker,label){
  const panel=el('section','','math-feature'+(sceneSource(c.id)?' math-feature-with-scene':'')),copy=el('div','','math-feature-copy');
  const goal=lesson?.goal;
  copy.append(el('span',tr(kicker),'math-kicker'),el('h2',lesson?.title||tr('Все темы пройдены!'),'math-lesson-title'),
              el('p',goal||tr('Можно вернуться к любимой теме и повторить задания.'),'math-lesson-note'));
  if(lesson){
   if(label)copy.append(bn(tr(label),'math-cta',()=>launch(lesson)));
  }else copy.append(bn(tr('Выбрать тему для повторения'),'math-cta',()=>openGroup('base')));
  return mathAppend(panel,copy,mathOwl(c.id));
 }
 if(!group){
  const next=groups.find(g=>g.lessons.some(l=>l.id===upcoming?.id));
  const top=el('div','','math-top'),progress=el('aside','','math-progress');
  const meter=el('progress','','math-meter');meter.max=c.lessons.length;meter.value=allDone;
  meter.setAttribute('aria-label',(bel?'Пройдзена тэм: ':'Пройдено тем: ')+allDone+(bel?' з ':' из ')+c.lessons.length);
  progress.append(el('h2',tr('Твой прогресс')),el('strong',allDone+(bel?' з ':' из ')+c.lessons.length,'math-fraction'),el('p',tr('тем пройдено')),meter,
                  el('p',next?(bel?'Цяпер: ':'Сейчас: ')+next.title:(workshop?'Все разделы пройдены':tr('Все три раздела пройдены')),'math-current-module'),
                  el('p',tr(allDone?'Пройденные темы можно повторить':'Темы открываются после мини-экзаменов')));
  top.append(feature(upcoming,upcoming?'Следующий урок':(bel?'Прадмет пройдзены':'Предмет пройден'),allDone?'Продолжить урок':'Начать урок'),progress);
  const modules=el('div','','math-modules');
  const continuation=workshop&&!extendedWorkshopModules[c.id]?el('div','','math-modules'):null;
  const bands=c.id==='en'?['Общение и дом','Мир вокруг и город','Распорядок, люди и истории'].map((name,i)=>{
   const details=el('details','','eng-stage'),list=el('div','','math-modules');details.open=i===0;details.append(el('summary',name+' · 80 занятий'),list);return {details,list};
  }):[];
  for(const [i,g] of groups.entries()){
   const b=bn('','math-module',()=>openGroup(g.id));b.dataset.kind=g.id;b.disabled=!g.open;
   b.append(el('strong',g.title,'math-module-title'),el('span',g.note,'math-module-note'),
    el('span',g.open?g.done+(bel?' з ':' из ')+g.lessons.length+(bel?' пройдзена':' пройдено'):g.after,'math-module-status'));
   if(c.id==='en'&&g.art&&window.TopouhEnglish){const icon=window.TopouhEnglish.art(g.art);if(icon){icon.classList.add('eng-module-icon');b.prepend(icon);}}
   (c.id==='en'&&Number.isInteger(g.band)?bands[g.band].list:continuation&&i>=3?continuation:modules).append(b);
  }
  root.append(top,el('h2',tr('Разделы'),'math-sections-title'),modules);
  if(continuation)root.append(el('h2','Продолжение','math-sections-title'),continuation);
  if(bands.length)root.append(el('h2','Выбери тему для тренировки','math-sections-title'),el('p','Начинай с любой темы. Чтобы открыть следующий урок внутри темы, пройди мини-экзамен.'),...bands.map(b=>b.details));
  return;
 }
 const navigator=el('div','','math-navigator'),sidebar=el('aside','','math-sidebar'),detail=el('section','','math-detail');
 const tabs=el('div','','math-module-tabs');
 tabs.setAttribute('role','group');tabs.setAttribute('aria-label',bel?'Раздзелы прадмета':'Разделы предмета');
 const tabGroups=c.id==='en'?groups.filter(g=>g.band===group.band):groups;
 for(const g of tabGroups){
  const b=bn(g.title,'math-tab',()=>{if(g.id!==group.id)openGroup(g.id)});
  b.disabled=!g.open;b.setAttribute('aria-pressed',String(g.id===group.id));
  if(!g.open)b.setAttribute('title',g.after);tabs.append(b);
 }
 const listBox=el('div','','math-topic-list'),expand=bn('','math-show-topics',()=>{mathExpanded=!mathExpanded;paintTopics();expand.focus()});
 const pinned=group.lessons.find(l=>l.id===upcoming?.id)||group.lessons[0];
 const initial=pinned;
 let picked=group.lessons.find(l=>l.id===mathSelection&&getStatus(l)!=='Пока закрыто')||initial;
 const headingBar=el('div','','math-sidebar-head');
 headingBar.append(el('h2',tr('Программа')),el('strong',group.done+' / '+group.lessons.length,'math-fraction'));
 sidebar.append(headingBar,tabs,listBox,expand,el('p',tr('Пройденные темы можно повторить'),'math-sidebar-note'));
 function paintDetail(){
  const j=group.lessons.indexOf(picked)+1;
  const available=getStatus(picked)!=='Пока закрыто';
  const info=el('div','','math-detail-info');
  const activities=el('div','','math-detail-pills');
  const n=Math.max(0,picked.steps.length-2);
  activities.append(el('span',bel?'4 трэніровачныя заданні':n+' тренировочных задания'),el('span',tr('Мини-экзамен · 2 задания')));
  info.append(el('h3',tr('Что внутри')),activities);
  const main=feature(picked,(bel?'Тэма ':'Тема ')+j+(bel?' з ':' из ')+group.lessons.length,available?(passed.has(picked.id)?'Повторить урок':'Начать урок'):'');

  detail.replaceChildren(main,info);
 }
 function paintTopics(){
  let lo=0,hi=group.lessons.length;
  if(!mathExpanded&&hi>6){lo=Math.max(0,Math.min(hi-6,group.lessons.indexOf(picked)-4));hi=lo+6}
  listBox.replaceChildren();
  for(let i=lo;i<hi;i++){
   const l=group.lessons[i],status=getStatus(l);
   const b=bn('','math-topic',()=>{
    picked=l;mathSelection=l.id;paintDetail();
    for(const q of listBox.querySelectorAll('.math-topic'))q.setAttribute('aria-pressed',String(q===b));
   });
   b.disabled=status==='Пока закрыто';b.setAttribute('aria-pressed',String(l===picked));
   const state=passed.has(l.id)?'done':b.disabled?'locked':'current';b.dataset.status=state;
   b.append(el('span',state==='done'?'✓':String(i+1),'math-topic-number'),mathAppend(el('span','','math-topic-copy'),
       el('strong',l.title,'math-topic-title'),el('small',tr(status),'math-topic-status')));
   listBox.append(b);
  }
  expand.hidden=group.lessons.length<=6;
  expand.textContent=mathExpanded?tr('Свернуть список'):(bel?'Паказаць усе ':'Показать все ')+group.lessons.length+(bel?' тэм':' тем');
  expand.setAttribute('aria-expanded',String(mathExpanded));
 }
 paintTopics();paintDetail();
 navigator.append(sidebar,detail);root.append(navigator);
}

const workshopModes={sequence:'Порядок',classify:'Сортировка',case:'Разбор ситуации',compare:'Сравнение'};
function addWorkshopBench(course,side){
 const details=el('details','','workbench');
 details.append(el('summary',course==='logic'?'Черновик узора':course==='money'?'Посчитать жетоны':'Потренировать порядок кадров'));
 if(course==='logic'){
  const board=el('div','','workbench-pattern');board.setAttribute('role','group');board.setAttribute('aria-label','Карточки узора');
  const shapes=['Пусто','Круг','Треугольник','Звезда'],icons=['·','●','▲','★'],cells=[];
  for(let i=0;i<6;i++){
   const tile=bn(icons[0],'workbench-tile',()=>{cells[i].n=(cells[i].n+1)%4;paint(i)});
   cells.push({tile,n:0});board.append(tile);
  }
  function paint(i){const {tile,n}=cells[i];tile.textContent=icons[n];tile.dataset.shape=String(n);tile.setAttribute('aria-label','Карточка '+(i+1)+': '+shapes[n]);}
  cells.forEach((_,i)=>paint(i));
  details.append(el('p','Нажимай на карточку, чтобы менять фигуру. Можно собрать свой узор.'),board,bn('Очистить','ls-ghost',()=>cells.forEach((v,i)=>{v.n=0;paint(i)})));
 }else if(course==='money'){
  const board=el('div','','workbench-tokens'),value=el('output');value.setAttribute('aria-live','polite');
  let n=0;const cells=Array.from({length:20},()=>el('i','','workbench-token'));
  board.setAttribute('aria-hidden','true');board.append(...cells);
  const minus=bn('Убрать 1','ls-ghost',()=>{if(n>0)n--;paint()});
  const plus=bn('Добавить 1','ls-ghost',()=>{if(n<20)n++;paint()});
  function paint(){value.textContent='Жетонов: '+n;cells.forEach((c,i)=>{c.dataset.on=String(i<n)});minus.disabled=n===0;plus.disabled=n===20;}
  paint();
  const row=el('div','','workbench-buttons');row.append(minus,plus);
  details.append(el('p','Считай вымышленные жетоны. Можно положить до двадцати.'),board,value,row);
 }else{
  const order=['Из домика выглянул кот.','Ух нарисовала домик.','Кот приглашает Ух в гости.'];
  const list=el('ol','','workbench-story');list.setAttribute('aria-label','Порядок кадров');
  function paint(focus){
   list.replaceChildren();
   order.forEach((caption,i)=>{
    const item=el('li');item.append(el('span',caption));
    const b=bn('Выше','ls-ghost',()=>{if(i>0){[order[i-1],order[i]]=[order[i],order[i-1]];paint(i-1)}});
    b.disabled=i===0;b.setAttribute('aria-label','Поднять кадр: '+caption);item.append(b);list.append(item);
   });
   if(focus!==undefined)list.children[focus]?.querySelector('button:not(:disabled)')?.focus();
  }
  paint();details.append(el('p','Расположи кадры так, чтобы получилась короткая история. Это черновик, а не проверка.'),list);
 }
 side.append(details);
}

/* Topouh catalogue route v1 */
const catalogueRoutes=new Set(Object.keys(courseNames));
function changeCatalogueRoute(id,mode='push',module=''){
  if(mode==='none')return;
  const u=new URL(location.href),before=u.href,old=u.searchParams.getAll('course');
  const target=catalogueRoutes.has(id)?id:'';

  if(target)u.searchParams.set('course',target);
  else u.searchParams.delete('course');
  if(catalogueRoutes.has(target)&&module)u.searchParams.set('module',module);else u.searchParams.delete('module');
  if(u.href===before)return;
  if(mode==='replace')history.replaceState(history.state,'',u);
  else history.pushState(history.state,'',u);
}
function showRequestedCatalogue(){
  const values=new URL(location.href).searchParams.getAll('course');
  const id=values.length===1&&catalogueRoutes.has(values[0])?values[0]:'';
  const subject=id?courses.find(c=>c.id===id):null;
  const u=new URL(location.href);
  if(u.searchParams.has('module')&&(!courseIsDashboard(id)||!mathModuleFrom(u)))changeCatalogueRoute(id,'replace','');
  if(subject) list(subject,'none');
  else{if(values.length)changeCatalogueRoute(null,'replace');home('none')}
}
window.addEventListener('popstate',showRequestedCatalogue);
