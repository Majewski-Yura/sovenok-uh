(() => {
 'use strict';
 if(window.parent!==window||!/^https?:$/.test(location.protocol))return;
 const current=new URL(location.href),dest=new URL('index.html',current);
 const page=current.pathname.split('/').pop();
 if(page==='lessons.html'){
  const c=current.searchParams.get('course'),m=current.searchParams.get('module');
  dest.searchParams.set('catalogue','1');
  if(['be','math','ru','reading','en','logic','money','story','world','safety','art','lab','code','team','invent','games','maps','garden'].includes(c)){
   dest.searchParams.set('course',c);
   if(/^(base|review|apply|tools|puzzles|projects|next-[1-6]|eng-[a-z0-9-]{1,47})$/.test(m||''))dest.searchParams.set('module',m);
  }
 }else if(page==='belarusian.html'){
  const l=current.hash.slice(1)||current.searchParams.get('lesson')||'';
  dest.searchParams.set('section','belarusian');
  if(/^be-(0[1-9]|[1-3]\d|4[0-2])$/.test(l))dest.searchParams.set('lesson',l);
 }else if(page!=='club.html')return;
 location.replace(dest.href);
})();
