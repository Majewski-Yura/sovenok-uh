(() => {
 'use strict';
 let bridge=null;
 try{if(window.parent!==window&&['previewClub','beFrame','catalogueFrame'].includes(window.frameElement?.id))bridge=window.parent.TopouhAudioNav;}catch(_){}
 if(!bridge)return;
 document.addEventListener('click',e=>{
  const b=e.target.closest('button');
  if(e.isTrusted&&b&&!b.disabled&&(b.matches('[data-game-slot]')||(window.frameElement?.id==='beFrame'&&b.matches('.token,.lesson-card,.actions button'))))window.TopouhAudio?.tone('tap');
 },true);
 window.TopouhAudioNav=bridge;
 document.addEventListener('click',e=>{
  if(e.defaultPrevented||e.button!==0||e.altKey||e.shiftKey||e.metaKey||e.ctrlKey)return;
  const a=e.target.closest('a[href]');if(!a||a.hasAttribute('download'))return;
  const u=new URL(a.href);
  if(u.origin!==location.origin)return;
  const index=new URL('index.html',location.href);
  if(u.pathname!==index.pathname)return;
  if(!u.search&&a.matches('.topouh-ident,[data-topouh-tab="today"],[data-route="today"],.topouh-tool[aria-label="В клуб"]')){
   e.preventDefault();e.stopPropagation();bridge.home();return;
  }
  const view=u.searchParams.get('view');
  if(['reading','paintings','diary'].includes(view)&&[...u.searchParams].length===1){e.preventDefault();e.stopPropagation();bridge.view(view);}
 },true);
})();
