/* Reflect the existing same-origin wallet; display only, never writes. */
(() => {
  'use strict';
  const key='topouh-v2-github-local-v1';
  const star=document.querySelector('[data-topouh-star-count]');
  if(!star)return;
  function draw(n) {
    const text=Number.isSafeInteger(n)&&n>=0?String(n):'0';
    if(star.textContent!==text)star.textContent=text;
  }
  function sync() {
    try { draw(JSON.parse(localStorage.getItem(key)||'null')?.stars); }
    catch { /* Preserve the last known value if browser storage is unavailable. */ }
  }
  addEventListener('storage',event=>{if(event.key===key||event.key===null)sync()});
  addEventListener('pageshow',sync);
  addEventListener('topouh:star-balance',event=>draw(event.detail));
  sync();
})();
