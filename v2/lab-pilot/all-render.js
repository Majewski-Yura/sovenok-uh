(function(root){
 'use strict';
 const C='currentColor',I='#31475b';
 const path=(d,f=C)=>'<path d="'+d+'" fill="'+f+'"/>';
 const line=d=>path(d,'none');
 const circ=(cx,cy,r,f=C)=>'<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+f+'"/>';
 const rect=(x,y,w,h,r=4,f=C)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+f+'"/>';
 const A={
 dot:circ(24,24,8),circle:circ(24,24,15),square:rect(10,10,28,28,3),rectangle:rect(5,14,38,20,3),triangle:path('M24 7 43 39H5Z'),diamond:path('M24 5 43 24 24 43 5 24Z'),
 star:path('M24 4 30 17 44 19 34 29 36 43 24 36 11 43 14 29 4 19 18 17Z'),
 leaf:path('M10 38C3 15 18 6 39 7c2 20-9 35-27 31Z')+line('M10 40Q21 26 34 14'),
 strip:rect(4,13,40,22)+line('M12 18v12m8-12v12m8-12v12m8-12v12'),
 card:rect(8,7,32,34,5)+line('M15 16h18m-18 8h17m-17 8h10'),
 eye:path('M4 24Q24 1 44 24Q24 47 4 24Z','#fff')+circ(24,24,8)+circ(24,24,3,I),
 note:path('M11 5h19l9 10v27H11Z')+line('M30 5v11h9M17 23h15m-15 7h15m-15 7h10'),
 book:path('M4 9q11-5 20 3 9-8 20-3v27q-11-5-20 3-9-8-20-3Z')+line('M24 12v27M9 16q6-2 10 1m-10 7q6-2 10 1m10-7q4-3 10-1m-10 8q4-3 10-1'),
 ruler:rect(4,13,40,21,3)+line('M10 13v9m7-9v12m7-12v9m7-9v12m7-12v9'),
 line:line('M8 24h32')+circ(8,24,3)+circ(40,24,3),
 pencil:path('M7 34 32 9l7 7-25 25-9 2Z')+line('m8 33 7 7m12-27 7 7'),
 flag:line('M10 42V7')+path('M10 9q10-6 27 1v18q-17-7-27-1Z'),
 sign:line('M20 25v17')+path('M5 8h28l9 9-9 9H5Z'),
 magnifier:circ(19,19,13)+circ(19,19,8,'#fff')+line('m28 28 13 13'),
 question:path('M15 18a9 9 0 1 1 13 8q-4 2-4 6','none')+circ(24,39,2.5,I),
 arrow:path('M5 20h25v-8l13 12-13 12v-8H5Z'),
 door:rect(11,4,27,37)+line('M9 42h31')+circ(32,24,2.4,'#fff'),
 steps:line('M5 38h12V26h12V14h13')+circ(11,33,3)+circ(23,21,3)+circ(36,9,3),
 table:rect(6,8,36,33)+line('M6 18h36m-36 10h36M18 8v33m12-33v33'),
 cloud:path('M10 35c-10 0-10-14 0-16 0-9 13-13 19-5 9-3 16 2 16 11 0 6-4 10-10 10Z'),
 tailcloud:path('M10 34c-10 0-10-14 0-16 0-9 13-13 19-5 9-3 16 2 16 11 0 7-5 10-12 10l-8 7 2-7Z'),
 wheel:circ(24,24,17)+circ(24,24,4,'#fff')+line('M24 9v10m0 10v10M9 24h10m10 0h10'),
 wind:line('M4 16h27q7 0 7-5t-7-4M4 24h36q6 0 6 5t-6 5M4 32h23q5 0 5 5t-5 5'),
 ramp:path('M6 12 42 39H6Z')+line('M6 41h36'),
 screen:rect(5,6,38,29)+line('M13 35v7m22-7v7'),
 stone:path('M6 29 14 15 33 12 42 25 36 36H12Z')+line('m14 15 7 12 21-2'),
 footprint:path('M11 33c1-10 8-16 12-11 4 4 0 11-1 16-3 9-12 4-11-5Z')+circ(29,17,4)+circ(35,10,3)+circ(24,12,3),
 birdtrack:line('M23 38V23M23 23 10 11m13 12V7m0 16 14-13'),
 lamp:path('M13 13h22l8 21H5Z')+line('M24 34v8m-10 0h20'),
 shadow:path('M6 32c8-12 28-17 36-8 6 9-10 14-23 14-8 0-12-1-13-6Z','#aab7ca'),
 shape:path('M11 9h26v9l7 12-10 12H14L4 30l7-12Z'),
 person:circ(24,11,6)+path('M14 24q10-12 20 0v11H14Z')+line('M19 35v7m10-7v7'),
 tree:path('M21 31h6v12h-6Z','#bd906a')+path('M4 29 12 16 19 17 24 7 30 17 38 17 44 31H4Z'),
 clock:circ(24,24,17,'#fff')+line('M24 13v12l7 5'),
 box:rect(7,12,34,29)+line('M7 20h34m-17 0v21'),
 folder:path('M4 10h17l4 6h19v24H4Z'),
 frame:rect(5,6,38,35)+rect(13,13,22,21,2,'#fff'),
 grid:rect(7,7,34,34)+line('M7 18h34m-34 11h34M18 7v34m11-34v34'),
 number:path('M8 17h32M8 31h32m-22 10L25 7m2 34L34 7','none'),
 check:line('m10 24 9 9 19-21'),
 speech:path('M4 9h40v24H26l-10 8v-8H4Z')+line('M13 17h22m-22 7h16'),
 pin:path('M24 42C8 27 7 23 9 15a16 16 0 0 1 30 0c2 8 1 12-15 27Z')+circ(24,21,5,'#fff'),
 cone:path('M24 7 41 40H7Z')+line('M14 28h20'),
 record:rect(8,7,32,34)+circ(17,17,2)+circ(17,26,2)+circ(17,34,2)+line('M23 17h10m-10 9h10m-10 8h10'),
 roof:path('M5 23 24 6 43 23H37v16H11V23Z')+line('M18 39V27h12v12'),
 flask:path('M18 5h12v13l12 17v7H6v-7l12-17Z')+line('M11 33h26'),
 cards:rect(12,6,30,32)+rect(5,12,30,31,'4','#fff')+line('M12 23h16m-16 8h12')
 };
 Object.assign(A,{
  angularstone:path('M5 32 14 9 31 13 43 28 31 41 10 38Z')+line('M14 9l7 19 22 0m-22 0-11 10'),
  sun:circ(24,24,11)+line('M24 4v6m0 28v6M4 24h6m28 0h6M9 9l5 5m20 20 5 5m0-30-5 5M14 34l-5 5'),
  moon:path('M30 5C16 24 24 38 41 33A20 20 0 1 1 30 5Z'),
  fence:rect(7,17,34,5)+rect(7,28,34,5)+path('M10 40V12l4-6 4 6v28ZM22 40V12l4-6 4 6v28ZM34 40V12l4-6 4 6v28Z'),
  path:path('M5 39c17-4 14-19 34-28l5 6c-13 7-15 21-33 25Z')+line('M9 40c17-5 17-17 32-26'),
  fan:path('M23 39 5 13Q24 1 43 13L25 39Z')+line('M24 39 13 10m11 29V7m0 32 10-29'),
  shoe:path('M8 8h19v15l13 6 4 5v6H7Z')+line('M7 34h36M20 15h8m-8 7h8'),
  narrow:rect(6,20,36,8,2),wide:rect(6,12,36,24,2),
  roundcloud:path('M9 35c-9 0-9-14 0-17 2-9 14-14 22-6 9-2 15 5 15 12 0 7-5 11-12 11Z'),
  longcloud:path('M3 29q0-9 11-9 4-7 11-4 7-2 10 4 10 0 10 9 0 6-9 6H12Q3 35 3 29Z'),
  roundtail:path('M9 35c-9 0-9-14 0-17 2-9 14-14 22-6 9-2 15 5 15 12 0 6-4 10-10 11l-11 7 2-7Z'),
  longtail:path('M3 29q0-9 11-9 4-7 11-4 7-2 10 4 10 0 10 9 0 5-7 6l-12 8 2-8H12Q3 35 3 29Z'),
  squaretail:path('M8 8h32v26H30l-9 9 2-9H8Z'),
  smallwheel:circ(24,24,11)+circ(24,24,3,'#fff'),
  bigwheel:circ(24,24,19)+circ(24,24,3,'#fff'),
  edgeframe:rect(4,8,40,32)+circ(13,24,6,'#fff'),
  midframe:rect(4,8,40,32)+circ(24,24,6,'#fff')
 });
 const aliases={paper:'note',journal:'book',sheet:'note',board:'screen',surface:'screen',tray:'box',container:'box',tape:'strip',row:'strip',track:'ramp',ball:'circle',point:'dot',marker:'pin',gauge:'ruler',result:'record',log:'record',list:'record',caption:'speech',idea:'question',experiment:'flask',observer:'person',camera:'eye',sample:'card',stack:'cards',branch:'tree'};
 const names={"angularstone":"угловатый камешек","arrow":"стрелка","bigwheel":"большое колесо","birdtrack":"птичий след","book":"журнал","card":"карточка","circle":"круг","door":"дверь","dot":"точка","edgeframe":"окошко у края","eye":"глаз","fan":"веер","fence":"забор","flag":"флажок","grid":"сетка","lamp":"лампа","leaf":"лист","line":"линия","longcloud":"длинное облако","longtail":"длинное облако с хвостиком","magnifier":"лупа","midframe":"окошко посередине","moon":"луна","narrow":"узкая полоска","note":"запись","path":"дорожка","pencil":"карандаш","question":"вопрос","roundcloud":"круглое облако","roundtail":"круглое облако с хвостиком","ruler":"линейка","screen":"ширма","shadow":"тень","shoe":"подошва","sign":"указатель","smallwheel":"маленькое колесо","square":"квадрат","squaretail":"квадратное облако с хвостиком","star":"звезда","stone":"камень","strip":"полоска","sun":"солнце","tree":"дерево","triangle":"треугольник","wheel":"колесо","wide":"широкая полоска","wind":"ветер"};
 const palette={mint:'#a9ddc6',blue:'#a9d7f1',violet:'#d7c6f5',coral:'#ffc0b1',yellow:'#f8d880',ink:'#aebbd0'};
 function objectHTML(el,o){
  const card=el('div','','ls-lab-object'),row=el('div','','ls-lab-symbols'),n=o.n||1;
  if(n>1)row.dataset.repeat='';
  row.style.setProperty('--lab-paint',palette[o.color]||palette.mint);
  const kind=Object.hasOwn(A,o.icon)?o.icon:aliases[o.icon]||o.icon;
  for(let i=0;i<n;i++){
   const icon=root.document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 48 48');icon.setAttribute('aria-hidden','true');
   const body=A[kind]||A.card;
   icon.innerHTML='<g stroke="'+I+'" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">'+body+'</g>';
   row.append(icon);
  }
  card.append(row);
  if(o.label)card.append(el('span',o.label));
  if(!o.label){row.setAttribute('role','img');row.setAttribute('aria-label',(n>1?(o.alt||names[o.icon]||o.icon)+', количество: '+n:(o.alt||names[o.icon]||o.icon)));}
  return card;
 }
 function figure(data,el,mobile=false){
  const fig=el('figure','','ls-lab-figure'+(mobile?' ls-lab-mobile-art':''));
  const field=el('div','','ls-lab-field'),panels=el('div','','ls-lab-panels');
  field.append(el('div',data.title,'ls-lab-field-title'),panels);
  for(const p of data.panels){
   const panel=el('section','','ls-lab-panel'),items=el('div','','ls-lab-objects');
   panel.append(el('h4',p.label),items);for(const o of p.items)items.append(objectHTML(el,o));panels.append(panel);
  }
  fig.append(field);if(data.caption)fig.append(el('figcaption',data.caption,'ls-lab-caption'));return fig;
 }
 function story(id,index,data,el,mobile=false,tool=false){
  const caption=root.TopouhLabStoryTitles?.[id]?.[index];
  if(!caption||!/^lab-(0[1-9]|[12][0-9]|3[0-2])$/.test(id)||!Number.isInteger(index)||index<0||index>3){
   return data?figure(data,el,mobile):el('span');
  }
  const fig=el('figure','','ls-lab-figure ls-lab-story'+(mobile?' ls-lab-mobile-art':'')+(tool?' ls-lab-story-tool':''));
  const pic=el('img');pic.src='lab-pilot/stories/'+id+'-'+(index+1)+'.svg?v=paired-eyes';pic.alt=caption;pic.width=640;pic.height=380;pic.decoding='async';
  if(data&&!tool)pic.addEventListener('error',()=>fig.replaceWith(figure(data,el,mobile)),{once:true});
  fig.append(pic);return fig;
 }
 root.TopouhLabReference=Object.freeze({figure,story,icons:Object.freeze([...Object.keys(A),...Object.keys(aliases)])});
})(typeof window==='undefined'?globalThis:window);
