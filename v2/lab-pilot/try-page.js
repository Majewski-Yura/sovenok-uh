(() => {
 'use strict';
 const root=document.getElementById('lab-try'),all=window.TopouhLabTry,ids=Object.keys(all);
 const href=id=>'lab-try.html?trial='+encodeURIComponent(id);
 const e=(tag,txt='',cls='')=>{const n=document.createElement(tag);if(txt)n.textContent=txt;if(cls)n.className=cls;return n};
 const b=(txt,fn,cls='lab-try-primary')=>{const n=e('button',txt,cls);n.type='button';n.onclick=fn;return n};
 const fact=(title,text)=>{const q=e('div','','lab-try-fact');q.append(e('h2',title),e('p',text));return q};
 const h=(meta)=>{const n=e('h1',meta?.title||'Попробовать задания');n.tabIndex=-1;return n};
 const chooser=selected=>{
  const list=e('nav','','lab-try-links');list.setAttribute('aria-label','Три пробных задания');
  for(const id of ids){const a=e('a',all[id].title);a.href=href(id);if(id===selected)a.setAttribute('aria-current','page');list.append(a)}
  return list;
 };
 const query=new URL(location.href).searchParams.getAll('trial');
 const id=query.length===1&&Object.hasOwn(all,query[0])?query[0]:'';
 const meta=all[id], data=window.__topouhCourseData.find(c=>c.id==='lab');
 const step=data.lessons.find(l=>l.id===id)?.steps[0]?.visual;
 const renderer=meta&&window[meta.renderer];
 const banner=e('p','ЛАБОРАТОРИЯ ОТКРЫТИЙ · ПРОБА','lab-try-kicker');
 if(!step||typeof renderer!=='function'){
  const empty=e('section','','lab-try-paper');empty.append(banner,h(),e('p','Выбери одну из трёх проб. Они не меняют прогресс.'),chooser(''));
  root.replaceChildren(empty);return;
 }
 function intro(focus=false){
  const paper=e('section','','lab-try-paper lab-try-intro'),heading=h(meta);
  paper.append(banner,heading,fact('Что нужно знать',meta.theory),fact('Пример',meta.example),e('p',meta.action),
    b('Продолжить',task),e('small','Пробное задание не меняет прогресс.'),chooser(id));
  root.replaceChildren(paper);
  if(focus)heading.focus({preventScroll:true});
 }
 function task(){
  const layout=e('div','','lab-try-layout'),paper=e('section','','lab-try-paper'),heading=h(meta);
  const after=e('p','','lab-try-feedback');after.setAttribute('role','status');
  const scene=e('section','','lab-try-scene');scene.setAttribute('aria-label','Рабочее поле лаборатории');
  let check;
  const board=renderer({...step,prompt:meta.prompt},{onChange:()=>{if(check)check.disabled=!board.ready()}});
  check=b('Проверить',()=>{
   if(!board.ready())return;
   if(!board.verify()){after.textContent=meta.again;after.dataset.state='retry';board.reset();return}
   board.lock();after.textContent='Верно! '+step.good;after.dataset.state='correct';
   check.hidden=true;reset.textContent='Попробовать ещё раз';reset.focus({preventScroll:true});
  });check.disabled=true;
  const reset=b('Начать заново',task,'lab-try-secondary');
  const help=b('Вспомнить теорию',()=>intro(true),'lab-try-secondary');
  const row=e('div','','lab-try-actions');row.append(check,reset,help);
  paper.append(banner,heading,e('p',meta.prompt,'lab-try-instruction'),row,after,e('small','Пробное задание не меняет прогресс.'),chooser(id));
  if(window.TopouhLabReference?.story)scene.append(window.TopouhLabReference.story(id,0,null,e,false,true));
  scene.append(board.element);layout.append(paper,scene);root.replaceChildren(layout);heading.focus({preventScroll:true});
 }
 intro();
})();
