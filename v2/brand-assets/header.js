/* Decorative route state only. Does not read or write profile data or saved progress. */
(()=>{
 const mark=document.querySelector('[data-topouh-header] .topouh-star use');
 if(!mark)return;
 const svg=mark.parentElement, head=mark.closest('[data-topouh-header]'), type=head.dataset.topouhHeader;
 const fixed={club:['club','#7760bf'],belarusian:['speech','#187878']};
 const subjects={math:['study','#7251b0'],ru:['speech','#c34e69'],be:['speech','#187878'],en:['journey','#416bb3'],reading:['story','#b0567f'],world:['journey','#407859'],art:['craft','#ba5066'],tech:['craft','#ae5d24'],safety:['care','#be5838'],money:['care','#8d6a28'],fin:['care','#8d6a28'],logic:['study','#5156aa']};
 Object.assign(subjects,{"lab":["lab","#3f817c"],"code":["code","#385da3"],"team":["team","#a8486e"],"invent":["invent","#a35826"],"games":["games","#7946ac"],"maps":["maps","#327385"],"garden":["garden","#48783f"],"story":["story-course","#aa5d91"]});
 const screens={read:subjects.reading,eng:subjects.en,math:subjects.math,game:subjects.ru,lessons:subjects.ru,
  trip:subjects.en,tripL:subjects.en,paint:subjects.art,pbook:subjects.art,shop:subjects.tech,help:subjects.safety,talk:subjects.reading,dnev:subjects.world,smart:subjects.math};
 function sync(){
  let chosen;
  if(type==='lessons'){
   const course=document.querySelector('#app')?.dataset?.courseDash||new URLSearchParams(location.search).get('course');
   chosen=course&&Object.hasOwn(subjects,course)?subjects[course]:null;
  }else if(type==='main'){
   const screen=document.querySelector('.screen.on')?.id;
   chosen=screen&&Object.hasOwn(screens,screen)?screens[screen]:null;
  }
  const [shape,color]=chosen||fixed[type]||['original','#6542b0'];
  const next='brand-assets/stars.svg#'+shape;
  if(mark.getAttribute('href')!==next)mark.setAttribute('href',next);
  if(svg.style.getPropertyValue('--topouh-star-color')!==color)svg.style.setProperty('--topouh-star-color',color);
 }
 sync();
 if(type==='main')for(const s of document.querySelectorAll('.screen'))new MutationObserver(sync).observe(s,{attributes:true,attributeFilter:['class']});
 if(type==='lessons'){
  const a=document.querySelector('#app');
  if(a)new MutationObserver(sync).observe(a,{attributes:true,attributeFilter:['data-course-dash'],childList:true});
  addEventListener('popstate',sync);
 }
})();
