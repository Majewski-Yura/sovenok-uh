(() => {
 'use strict';
 // Presentation only: selections, answers, drag and focus have one owner.
 window.TopouhLabClouds=(task,{onChange=()=>{}}={})=>{
  if(task?.kind!=='sort'||task.items?.length!==4||task.bins?.length!==2)throw new TypeError('Expected the four-cloud sorting task');
  const icons=new Set(['audit-topa-cloud-round-plain','audit-topa-cloud-long-plain','audit-topa-cloud-round-tail','audit-topa-cloud-long-tail']);
  if(!task.items.every(i=>Array.isArray(i)&&typeof i[0]==='string'&&icons.delete(i[1])))throw new TypeError('Expected distinct cloud illustrations');
  const makeBoard=window.topouhLabVisualBoard||window.topouhVisualBoard;
  if(typeof makeBoard!=='function')throw new TypeError('The visual board must load before cloud sorting');
  const board=makeBoard(task,{onChange});
  board.element.classList.add('topouh-lab-clouds');
  const help=board.element.querySelector('.tvb-instruction');
  if(help)help.textContent='Нажми на облако, затем на нужную полку. Мышью облака можно перетащить.';
  return board;
 };
})();
