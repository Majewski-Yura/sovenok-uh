(() => {
 'use strict';
 const app = document.getElementById('app');
 const data = document.getElementById('course-data');
 if (!app || !data) return;
 const courseInfo = JSON.parse(data.textContent);
 const progressKey='topouh-v2-github-learn-progress-v1', beKey='topouh-v2-github-local-v1';
 const all=new Map(courseInfo.flatMap(c=>c.lessons.map(l=>[l.id,{course:c,id:l.id,count:Math.min(2,l.steps.length)}])));
 function readObject(key){
   try{const v=JSON.parse(localStorage.getItem(key)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}catch{return {};}
 }
 function genericSaved(){
   return new Map(Object.entries(readObject(progressKey)).filter(([id,v])=>{
     const l=all.get(id);
     return l && l.course.id!=='be' && v && Number.isInteger(v.correctFirst) && v.count===l.count && v.correctFirst===l.count;
   }));
 }
 function rewards(){
   const v=readObject(beKey).beRewards;
   return v&&typeof v==='object'&&!Array.isArray(v)?v:{};
 }
 const sessionMet=new Map();
 function known(){
   const m=genericSaved();
   for(const [id,v] of sessionMet)m.set(id,v);
   const earned=rewards();
   for(const [id,l] of all) if(l.course.id==='be'&&Object.hasOwn(earned,id)&&earned[id]===true) m.set(id,null);
   return m;
 }
 window.topouhCourseRecord=(id,correctFirst,count)=>{
   const l=all.get(id);
   if(!l||l.course.id==='be'||!Number.isInteger(correctFirst)||count!==l.count||correctFirst!==count)return;
   const old=genericSaved();
   const value={correctFirst:Math.max(old.get(id)?.correctFirst||0,sessionMet.get(id)?.correctFirst||0,correctFirst),count};
   old.set(id,value);sessionMet.set(id,value);
   try{localStorage.setItem(progressKey,JSON.stringify(Object.fromEntries(old)));}catch{}
 };
 function available(c,id,status=known()){
   const l=c.lessons.find(x=>x.id===id);
   const path=c.id==='en'&&l?.id.startsWith('en-trainer-')?c.lessons.filter(x=>x.module===l.module):c.lessons;
   return status.has(id)||path.find(x=>!status.has(x.id))?.id===id;
 }
 window.topouhCourseHasPassed=id=>known().has(id);
 window.topouhCoursePassedIds=()=>new Set(known().keys());
 window.topouhCourseCanStart=(courseId,id)=>{
   const c=courseInfo.find(x=>x.id===courseId);
   return Boolean(c&&c.lessons.some(l=>l.id===id)&&c.id!=='be'&&available(c,id));
 };
 const meta = {...{"lab":["✧","#e6f3c5","forest"],"code":["↳","#d9eaff","workshop"],"team":["♥","#f8deee","story"],"invent":["✦","#ffe4c4","workshop"],"games":["◆","#ece1ff","story"],"maps":["⌖","#caece8","forest"],"garden":["❋","#daefc9","forest"]},
   logic:['◆','#e4edb2'],money:['★','#f6e2a3'],story:['«…»','#f7cfdf'],
   be:['І','#f6dfab'],math:['+ −','#eaf4b8'],ru:['Аа','#fbd1c1'],reading:['«…»','#cbbbfd'],
   world:['✺','#c6edca'],safety:['+','#f9d2c9'],art:['✧','#fbd1c1'],en:['Aa','#dbe5ff']
 };
 const node=(tag, cls, text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e};
 function art(parent, subject) {
   const e=node('span','club-art');e.setAttribute('aria-hidden','true');
   const im=node('img');im.src=subjectOwl(subject);im.alt='';im.decoding='async';im.onerror=()=>{im.onerror=null;im.src='games/ukh.svg'};
   e.append(im,...['a','b','c'].map(i=>node('i','club-spark club-spark-'+i)));parent.append(e);
 }
 function badge(parent,cls,text){
   let n=parent.querySelector(':scope > .'+cls);
   if(!n){n=node('span',cls);parent.append(n);}
   n.textContent=text;return n;
 }
 function plural(n,one,few,many){
   if(n%100>=11&&n%100<=14)return many;
   if(n%10===1)return one;
   return n%10>=2&&n%10<=4?few:many;
 }
 const newWorkshops=Object.freeze({
   geography:{total:63,marks:'⌖',tint:'#caece8',read:()=>{try{const x=JSON.parse(localStorage.getItem('topouh-v2-github-geography-v1')||'[]');return Array.isArray(x)?new Set(x.filter(v=>typeof v==='string'&&/^[A-Z]{2}(?:-[A-Z]{2}){2,3}$/.test(v))).size:0}catch{return 0;}}},
   maker:{total:1,marks:'✦',tint:'#d9eaff',read:()=>readObject('topouh-v2-github-maker-v1').complete===true?1:0}
 });
 function workshopStats(id){const w=newWorkshops[id];return {done:Math.min(w.total,w.read()),total:w.total};}
 function stats(course,status){const total=course.lessons.length, done=course.lessons.filter(l=>status.has(l.id)).length;return {done,total};}
 function overview(root,text){
   let label=root.querySelector(':scope > .club-progress-label');
   if(!label){label=node('p','club-progress-label');root.append(label);}
   label.textContent=text;
 }
 function decorate(){
   const hero=app.querySelector(':scope > .hero'), grid=app.querySelector(':scope > .grid'), p=app.querySelector(':scope > .lessonPage');
   delete app.dataset.clubView;app.style.removeProperty('--club-theme');
   if(hero&&grid){
     const status=known();
     const cards=[...grid.querySelectorAll('.courseCard')], cat=cards.length>0;
     app.dataset.clubView=cat?'catalogue':'list';
     const headline=hero.querySelector('h1');
     const course=courseInfo.find(c=>c.title===headline?.textContent);
     if(course) app.style.setProperty('--club-theme',(meta[course.id]||[])[1]||'#cbbbfd');
     if(!hero.querySelector('.club-kicker')){
       hero.prepend(node('div','club-kicker',cat?'Учебный клуб · 2 класс':'Учебный клуб · программа'));
       art(hero,course?.id);
     }
     if(cat){
       const record=courseInfo.filter(c=>c.id!=='code'&&!catalogueHiddenCourses.has(c.id)).map(c=>stats(c,status)).concat(Object.keys(newWorkshops).map(workshopStats));const done=record.reduce((v,r)=>v+r.done,0);const total=record.reduce((v,r)=>v+r.total,0);
       overview(hero,done+' из '+total+' пройдено · осталось '+(total-done)+' · '+cards.length+' '+plural(cards.length,'предмет','предмета','предметов'));
     }else if(course){
       const {done,total}=stats(course,status);
       overview(hero,done+' из '+total+' пройдено · осталось '+(total-done));
       const lessonButtons=[...grid.querySelectorAll('.lessonCard')];
       course.lessons.forEach((l,i)=>{
         const card=lessonButtons[i]; if(!card)return;
         const done=status.has(l.id),can=available(course,l.id,status);
         const stage=done?'done':can?'current':'locked';
         const mark=badge(card,'club-lesson-status',done?'Пройден':can?'Доступен сейчас':'Откроется после предыдущего');
         mark.dataset.complete=String(done);card.dataset.clubStage=stage;card.disabled=!can;
         card.style.setProperty('--lesson-tint',['#e7f8af','#fbd1c1','#dcecff','#e8dcfc'][i%4]);
         if(!card.querySelector('.ls-card-star')){
           const star=document.createElementNS('http://www.w3.org/2000/svg','svg');
           const path=document.createElementNS('http://www.w3.org/2000/svg','path');
           star.setAttribute('class','ls-card-star');star.setAttribute('viewBox','0 0 42 45');star.setAttribute('aria-hidden','true');
           path.setAttribute('d','M18 1l8 13 14 4-10 10 2 14-13-7-13 5 3-14L1 16l14-3 3-12z');
           star.append(path);card.append(star);
         }
         const old=card.querySelector('.cardNote');
         if(old)old.textContent=l.goal;
       });
       let rec=hero.querySelector(':scope > .club-recommended');
       const lessonIndex=course.lessons.findIndex(l=>!status.has(l.id));
       if(lessonIndex<0){if(rec)rec.remove();}
       else if(lessonButtons[lessonIndex]){
         if(!rec){rec=node('button','club-recommended');rec.type='button';hero.append(rec);}
         rec.textContent=(done?'Продолжить: ':'Начать: ')+course.lessons[lessonIndex].title;
         rec.onclick=()=>lessonButtons[lessonIndex].click();
       }
     }
     if(!grid.previousElementSibling?.classList.contains('club-plaque')){
       const l=node('div','club-plaque');l.append(node('span','',cat?'Предметы':'Занятия'),node('span','',String(cat?cards.length:grid.querySelectorAll('.lessonCard').length)));
       grid.before(l);
     }
     if(cat) for(const card of cards){
       const c=courseInfo.find(c=>c.title===card.querySelector('strong')?.textContent);
       const wid=card.dataset.workshop,w=Object.hasOwn(newWorkshops,wid)?newWorkshops[wid]:null;
       if(c||w){
         const {done,total}=w?workshopStats(wid):stats(c,status);
         const badgeText=wid==='maker'?(done?'1 / 1 · игра готова':'0 / 1 · игра в работе'):done+' / '+total+' пройдено';
         const cardStatus=badge(card,'club-card-status',badgeText);
         cardStatus.setAttribute('aria-label',badgeText+'; осталось '+(total-done));
         cardStatus.style.setProperty('--club-fill',((total?done/total:0)*100)+'%');
       }
       if(card.querySelector('.club-card-glyph'))continue;
       const [glyph,tint]=w?[w.marks,w.tint]:meta[c?.id]||['✦','#eadfff'];
       card.style.setProperty('--club-tint',tint);
       const sym=node('span','club-card-glyph',glyph), arr=node('span','club-card-go','↗');
       sym.setAttribute('aria-hidden','true');arr.setAttribute('aria-hidden','true');card.prepend(sym,arr);
     }
   }
   if(p){
     const bar=p.querySelector(':scope>.bar'), result=p.querySelector('.result-pill');
     app.dataset.clubView=bar?'task':result?'result':'intro';
     if(!p.querySelector('.club-kicker')){
       const k=node('div','club-kicker'+(bar?' club-step-kicker':''),bar?bar.getAttribute('aria-label'):result?'Результат мини-экзамена':p.dataset.examIntro?'Два новых задания · без подсказок':'Учебный клуб · новый урок');
       p.prepend(k);
       if(!bar)art(p,false);
     }
   }
 }
 let scheduled=false;
 const ob=new MutationObserver(()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;decorate()})});
 ob.observe(app,{childList:true});
 window.addEventListener('pageshow',decorate);
 window.addEventListener('storage',e=>{if(e.key===progressKey||e.key===beKey||e.key===null)decorate()});
 showRequestedCatalogue();
 decorate();
})();
