(global=>{
'use strict';
const DAY=86400000;
const categories=['draw','find','memory','adventure'];
function rng(seed) {
 let x=(seed>>>0)||0xd765b88f;
 return ()=>{x=(x+0x6D2B79F5)|0;let t=Math.imul(x^x>>>15,x|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
}
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0}
function shuffle(arr,random){const list=arr.slice();for(let i=list.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[list[j],list[i]]=[list[i],list[j]];}return list}
function basic(games,cycle){
 const random=rng(hash('Клуб v1 '+cycle));
 const omitted=shuffle(categories,random);
 const pools=Object.fromEntries(categories.map(c=>[c,shuffle(games.filter(g=>g.category===c),random)]));
 return omitted.map(x=>shuffle(categories.filter(c=>c!==x).map(c=>pools[c].pop()),random));
}
function deck(games,cycle){
 const d=basic(games,cycle), prevLast=new Set(basic(games,cycle-1)[3].map(g=>g.id));
 d[0].forEach((g,i)=>{
  if(!prevLast.has(g.id))return;
  for(let day=1;day<=2;day++){
   const pos=d[day].findIndex(next=>next.category===g.category);
   if(pos<0)continue;
   [d[0][i],d[day][pos]]=[d[day][pos],d[0][i]];break;
  }
 });
 return d;
}
function pickToday(games,date=new Date()){
 const localDay=Math.floor(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())/DAY);
 const cycle=Math.floor(localDay/4), day=localDay-cycle*4;
 return {localDay, picks:deck(games,cycle)[day]};
}
global.TopouhGameRotation={deck,pickToday,hash,rng,categories};
if(typeof module!=='undefined')module.exports=global.TopouhGameRotation;
})(typeof window==='undefined'?globalThis:window);
