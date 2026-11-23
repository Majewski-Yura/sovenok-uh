(function(root){
 'use strict';
 const width=7,height=5,total=width*height,start=14,goal=20;
 const themes=['forest','sunset','night'],heroes=['owl','dragon'],limits=[0,25,40,60];
 const defaults=()=>({theme:'forest',hero:'owl',stars:[3,16,31],walls:[10,17,24],limit:0});
 const moves=Object.freeze({ArrowUp:[0,-1],ArrowLeft:[-1,0],ArrowDown:[0,1],ArrowRight:[1,0],w:[0,-1],a:[-1,0],s:[0,1],d:[1,0]});
 const coord=(i,d)=>{
  if(!d)return null;const x=i%width+d[0],y=Math.floor(i/width)+d[1];
  return x>=0&&y>=0&&x<width&&y<height?y*width+x:null;
 };
 const cell=i=>Number.isInteger(i)&&i>=0&&i<total&&i!==start&&i!==goal;
 const clean=a=>Array.isArray(a)?[...new Set(a.filter(cell))]:[];
 function normalize(x){
  if(!x||typeof x!=='object')return defaults();
  const base=defaults(), stars=Array.isArray(x.stars)?clean(x.stars):base.stars, walls=Array.isArray(x.walls)?clean(x.walls):base.walls;
  return {theme:themes.includes(x.theme)?x.theme:base.theme,hero:heroes.includes(x.hero)?x.hero:base.hero,
    stars,walls:walls.filter(i=>!stars.includes(i)),limit:limits.includes(x.limit)?x.limit:base.limit};
 }
 function edit(cfg,i,tool){
  if(!cell(i)||!['stars','walls'].includes(tool))return cfg;
  const other=tool==='stars'?'walls':'stars', removing=cfg[tool].includes(i);
  return {...cfg,[tool]:removing?cfg[tool].filter(x=>x!==i):[...cfg[tool],i],
    [other]:removing?cfg[other]:cfg[other].filter(x=>x!==i)};
 }
 function enter(cfg,now){return {pos:start,remaining:[...cfg.stars],result:'playing',endsAt:cfg.limit?now+cfg.limit*1000:null,status:'Ты на старте. Собери звёзды и доберись до флажка.'}}
 function tick(state,now){
  return state.result==='playing'&&state.endsAt!==null&&now>=state.endsAt?{...state,result:'time',status:'Время вышло. Можно сыграть ещё раз или убрать таймер.'}:state;
 }
 function step(cfg,state,key,now){
  state=tick(state,now);if(state.result!=='playing'||!moves[key])return state;
  const next=coord(state.pos,moves[key]);
  if(next===null)return {...state,status:'Здесь край поля. Попробуй другое направление.'};
  if(cfg.walls.includes(next))return {...state,status:'На пути камень. Попробуй его обойти.'};
  const remaining=state.remaining.filter(i=>i!==next);
  if(next===goal&&!remaining.length)return {...state,pos:next,remaining,result:'win',status:'Ура! Все звёзды собраны. Твоя игра работает!'};
  if(next===goal)return {...state,status:'Флажок откроется, когда соберёшь все звёзды.'};
  return {...state,pos:next,remaining,status:remaining.length<state.remaining.length?'Звезда собрана! Осталось: '+remaining.length+'.':
   'Ряд '+(Math.floor(next/width)+1)+', клетка '+(next%width+1)+'.'};
 }
 function problem(cfg){
  if(!cfg.stars.length)return 'Добавь хотя бы одну звезду.';
  // The finish acts as a locked cell until all stars are collected.
  const seen=new Set([start]),queue=[start];let exit=false;
  while(queue.length){
   const i=queue.shift();
   for(const d of Object.values(moves)){
    const j=coord(i,d); if(j===null||cfg.walls.includes(j))continue;
    if(j===goal){exit=true;continue}
    if(!seen.has(j)){seen.add(j);queue.push(j)}
   }
  }
  if(cfg.stars.some(i=>!seen.has(i)))return 'До одной из звёзд нельзя дойти. Убери камень или перенеси звезду.';
  if(!exit)return 'Путь к флажку перекрыт. Убери камень рядом с ним или оставь другой проход.';
  return '';
 }
 const api={width,height,total,start,goal,themes,heroes,limits,defaults,normalize,edit,enter,step,tick,problem,moves};
 if(typeof module!=='undefined')module.exports=api;if(root)root.TopoMaker=api;
})(typeof window==='undefined'?null:window);
