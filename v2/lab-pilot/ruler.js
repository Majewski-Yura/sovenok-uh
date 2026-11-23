/* One calibrated measurement trial for the Lab pilot. No score or network side effects. */
(function(root){
 'use strict';
 const marks=Object.freeze([1,2,3,4,5,6,7,8]);
 const endpoints=Object.freeze([2,6]);
 const x=n=>35+(n-1)*70;
 const fresh=()=>({ends:[],choice:null,locked:false,revealed:false});
 const valid=n=>marks.includes(n);
 function select(s,n){
  if(s.locked||!valid(n)||(s.ends.length===1&&s.ends[0]===n))return s;
  const ends=s.ends.length===1?[s.ends[0],n].sort((a,b)=>a-b):[n];
  return {...s,ends,choice:null};
 }
 function dragTo(s,a,b){
  return s.locked||!valid(a)||!valid(b)||a===b?s:{...s,ends:[a,b].sort((x,y)=>x-y),choice:null};
 }
 const choose=(s,i,count)=>s.locked||!Number.isInteger(i)||i<0||i>=count?s:{...s,choice:i};
 const ready=s=>s.ends.length===2&&s.choice!==null;
 const verify=(s,i)=>ready(s)&&s.ends.every((n,k)=>n===endpoints[k])&&s.choice===i;
 const contract={marks,endpoints,x,fresh,select,dragTo,choose,ready,verify};
 if(typeof module!=='undefined'&&module.exports)module.exports=contract;
 if(!root||!root.document)return;
 const ns='http://www.w3.org/2000/svg';let seq=0;
 function labRuler(task,{onChange=()=>{}}={}){
  if(!task||task.kind!=='pick'||!Array.isArray(task.items)||task.items.length!==3||
     task.items.some(it=>!Array.isArray(it)||typeof it[0]!=='string')||
     !Number.isInteger(task.answer)||task.answer<0||task.answer>=task.items.length)throw TypeError('Invalid lab ruler task');
  const doc=root.document,id='topouh-ruler-'+(++seq);
  const e=(tag,c,t)=>{const n=doc.createElement(tag);if(c)n.className=c;if(t!==undefined)n.textContent=t;return n};
  const b=(c,t)=>{const n=e('button',c,t);n.type='button';return n};
  const svg=(tag,attrs)=>{const n=doc.createElementNS(ns,tag);for(const [key,value] of Object.entries(attrs))n.setAttribute(key,String(value));return n};
  const outer=e('div','tlr-board');outer.tabIndex=-1;
  const help=e('p','tlr-hint','Отметь оба края полоски. Можно нажать на две риски или протянуть от одной до другой. Затем выбери длину.');help.id=id+'-help';
  const status=e('p','tlr-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const surface=e('div','tlr-surface');
  const picture=svg('svg',{viewBox:'0 0 560 190',preserveAspectRatio:'none','aria-hidden':'true',focusable:'false'});
  const span=svg('rect',{x:0,y:90,width:0,height:45,rx:5,fill:'#aad48e',visibility:'hidden'});
  const guides=svg('path',{d:`M${x(2)} 67v20M${x(6)} 67v20`,stroke:'#526c63','stroke-width':2.6,'stroke-dasharray':'4 4'});
  const strip=svg('rect',{x:x(2),y:35,width:x(6)-x(2),height:31,rx:10,fill:'#eba574',stroke:'#8e543c','stroke-width':3});
  const ticks=svg('path',{d:marks.map(n=>`M${x(n)} 89v33`).join(' '),stroke:'#605139','stroke-width':3.2,'stroke-linecap':'round'});
  const dots=svg('g',{fill:'#265846'});
  picture.append(svg('rect',{x:10,y:85,width:540,height:55,rx:13,fill:'#f6dd9d',stroke:'#6a5a3f','stroke-width':3}),span,guides,strip,ticks,dots);
  const controls=e('div','tlr-marks');controls.setAttribute('role','group');controls.setAttribute('aria-label','Отметки линейки от 1 до 8');controls.setAttribute('aria-describedby',help.id);
  const choice=e('div','tlr-choices');choice.setAttribute('role','group');choice.setAttribute('aria-label','Длина полоски в делениях');
  const equivalent=e('p','tlr-equivalent','Левый край полоски совпадает с отметкой 2, правый — с отметкой 6.');equivalent.id=id+'-description';controls.setAttribute('aria-describedby',help.id+' '+equivalent.id);
  surface.append(picture,equivalent,controls);
  outer.append(help,surface,status,choice);
  let state=fresh(),held=null,skip=0;
  const markButtons=marks.map((n,j)=>{
   const button=b('tlr-mark',String(n));button.dataset.mark=n;
   button.style.setProperty('--tlr-at',(x(n)*100/560)+'%');
   button.setAttribute('aria-label','Отметка '+n);
   button.onclick=ev=>{if(!ev.detail||root.performance.now()>=skip)commit(select(state,n))};
   button.onkeydown=ev=>{
    const next=ev.key==='ArrowLeft'?j-1:ev.key==='ArrowRight'?j+1:ev.key==='Home'?0:ev.key==='End'?7:null;
    if(next===null)return;ev.preventDefault();markButtons[Math.max(0,Math.min(7,next))].focus();
   };
   controls.append(button);return button;
  });
  const answerButtons=task.items.map(([label],i)=>{
   const button=b('tlr-answer',label);
   button.onclick=()=>commit(choose(state,i,task.items.length));choice.append(button);return button;
  });
  function paint(preview){
   const ends=state.revealed?endpoints:preview??state.ends;
   const exact=ends.length===2;
   span.setAttribute('visibility',exact?'visible':'hidden');
   if(exact){span.setAttribute('x',x(ends[0]));span.setAttribute('width',x(ends[1])-x(ends[0]))}
   dots.replaceChildren(...ends.map(n=>svg('circle',{cx:x(n),cy:129,r:5.5})));
   markButtons.forEach((button,i)=>{
    button.disabled=state.locked;button.setAttribute('aria-pressed',String(state.ends.includes(marks[i])));
    button.classList.toggle('tlr-solution',state.revealed&&endpoints.includes(marks[i]));
   });
   answerButtons.forEach((button,i)=>{
    button.disabled=state.locked;button.setAttribute('aria-pressed',String(state.choice===i));
    button.classList.toggle('tlr-solution',state.revealed&&task.answer===i);
   });
   const msg=state.revealed?'Правильные края: 2 и 6. Между ними 4 деления.':exact?'Отмечены '+ends[0]+' и '+ends[1]+'.':ends.length?'Отмечена '+ends[0]+'. Выбери второй край.':'Отметки ещё не выбраны.';
   if(status.textContent!==msg)status.textContent=msg;
  }
  function commit(next,moveFocus=false){
   if(next===state)return false;state=next;paint();onChange();
   if(moveFocus)focus();
   return true;
  }
  function markerAt(ev){
   const node=doc.elementFromPoint(ev.clientX,ev.clientY)?.closest('[data-mark]');
   if(node&&controls.contains(node))return +node.dataset.mark;
   const r=surface.getBoundingClientRect();
   if(!r.width||!r.height)return null;
   const xx=(ev.clientX-r.left)*560/r.width,yy=(ev.clientY-r.top)*190/r.height;
   if(yy<81||yy>151)return null;
   const n=Math.round((xx-35)/70)+1;
   return valid(n)&&Math.abs(x(n)-xx)<=34?n:null;
  }
  function cancel(repaint=true){
   if(!held)return;
   const {ac}=held;held=null;ac.abort();if(repaint)paint();
  }
  surface.addEventListener('pointerdown',ev=>{
   if(held||state.locked||ev.button!==0||ev.isPrimary===false)return;
   const first=markerAt(ev);if(first===null)return;
   const ac=new AbortController(),opt={capture:true,signal:ac.signal};
   const id=ev.pointerId,sx=ev.clientX,sy=ev.clientY;
   held={id,ac,moved:false};
   const belongs=e=>held?.id===e.pointerId;
   const move=e=>{
    if(!belongs(e))return;
    if(!outer.isConnected){cancel();return}
    if(Math.hypot(e.clientX-sx,e.clientY-sy)>8)held.moved=true;
    if(held.moved){const last=markerAt(e);paint(last===null||last===first?[first]:[first,last].sort((a,b)=>a-b))}
   };
   const up=e=>{
    if(!belongs(e))return;
    const moved=held.moved||Math.hypot(e.clientX-sx,e.clientY-sy)>8,last=moved&&markerAt(e);
    cancel();
    if(!moved)return;skip=root.performance.now()+250;
    if(last!==null&&last!==false&&outer.isConnected)commit(dragTo(state,first,last));
   };
   root.addEventListener('pointermove',move,opt);root.addEventListener('pointerup',up,opt);
   root.addEventListener('pointercancel',e=>{if(belongs(e))cancel()},opt);
   root.addEventListener('blur',()=>cancel(),opt);
   doc.addEventListener('visibilitychange',()=>{if(doc.hidden)cancel()},opt);
  });
  function focus(){
   if(state.locked){outer.focus({preventScroll:true});return}
   const selected=state.ends[0];
   const btn=state.ends.length===2?answerButtons[state.choice??0]:state.ends.length===1?markButtons[marks.indexOf(selected)]:markButtons[0];
   btn.focus({preventScroll:true});
  }
  paint();
  return {element:outer,ready:()=>ready(state),verify:()=>verify(state,task.answer),focus,
   reset(){if(!state.locked){cancel(false);commit(fresh(),true)}},
   lock(){cancel(false);commit({...state,locked:true})},
   reveal(){cancel(false);commit({...state,locked:true,revealed:true})}};
 }
 root.TopouhLabRuler=labRuler;
})(typeof window==='undefined'?null:window);
