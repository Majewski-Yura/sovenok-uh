(() => {
'use strict';
const OWNED=new Set('cap bow glasses scarf bowtie pencil butterfly balloon book wreath shades phones medal wizard crown'.split(' '));
const COLORS=new Set(["t-topa","t-cap","t-balloon","t-crown","t-topa-book","t-car","t-train","t-repka","t-repka-mouse","t-kolobok","t-kolobok-hare","t-fox","t-bear","t-hen","t-dedbaba","t-mouse-egg","t-topa-ball","t-topa-bike","t-uh-topa","t-firetruck","t-bus","t-tractor","t-rocket","t-castle","t-kitten","t-puppy","t-frog","t-piglet","t-cow","t-dinos","a-uh-berries","a-uh-pie","a-uh-skates","a-uh-night","a-uh-ship","a-topa-flowers","a-topa-sand","a-winter-house","a-autumn-forest","a-kitten-basket","a-fox-flowers","a-squirrel","a-pony","a-butterflies","a-sea","a-castle","a-dollhouse","a-cake","a-vase","a-gingerbread","a-space"]);
const DONE=/^[0-5]-(?:exam|[0-3]-[0-3])$/;
const PAID=/^[1-5]$/;
const DAY=/^\d{4}-\d{2}-\d{2}$/;
const SAFE_ID=/^[A-Za-z0-9_-]{1,128}$/;
function check(v,reason){if(!v)throw Error(reason);}
const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
const integer=v=>Number.isSafeInteger(v)&&v>=0;
const union=(a,b)=>[...new Set([...a,...b])].sort();
function strictMap(o,key,val){
 check(object(o),'invalid map');
 for(const [k,v] of Object.entries(o))check(key.test(k)&&val(v),'invalid map value');
 return o;
}
function payload(o){
 check(object(o)&&['done,owned,paid,stars','done,owned,paid,paintsOwned,stars'].includes(Object.keys(o).sort().join()),'invalid sync payload');
 check(integer(o.stars),'balance must be a verified nonnegative integer');
 check(Array.isArray(o.owned)&&o.owned.every(x=>OWNED.has(x)),'invalid item ID');
 const colors=Object.hasOwn(o,'paintsOwned')?o.paintsOwned:[];
 check(Array.isArray(colors)&&colors.every(x=>COLORS.has(x)),'invalid coloring purchase ID');
 return {stars:o.stars,owned:union(o.owned,[]),paintsOwned:union(colors,[]),done:{...strictMap(o.done,DONE,v=>typeof v==='string'&&DAY.test(v))},paid:{...strictMap(o.paid,PAID,v=>v===1)}};
}
function makeAccount(snapshot){
 return {v:1,rev:0,...payload(snapshot)};
}
function validateAccount(a){
 check(object(a)&&a.v===1&&integer(a.rev)&&['done,owned,paid,rev,stars,v','done,owned,paid,paintsOwned,rev,stars,v'].includes(Object.keys(a).sort().join()),'invalid stored account');
 return {v:1,rev:a.rev,...payload({stars:a.stars,owned:a.owned,done:a.done,paid:a.paid,...(Object.hasOwn(a,'paintsOwned')?{paintsOwned:a.paintsOwned}:{})})};
}
function normalizeRestoration(r){
 check(object(r)&&Object.keys(r).sort().join()==='done,items,paid,receipt,stars','invalid receipt');
 check(SAFE_ID.test(r.receipt)&&integer(r.stars),'invalid receipt ID or credit');
 const p=payload({stars:r.stars,owned:r.items,done:r.done,paid:r.paid});
 const {paintsOwned,...grant}=p;
 return {receipt:r.receipt,...grant};
}
function restore(account,grant,{alreadyCredited=false}={}){
 const a=validateAccount(account), g=normalizeRestoration(grant);
 const stars=a.stars+(alreadyCredited?0:g.stars),rev=a.rev+1;
 check(integer(stars)&&integer(rev),'balance/revision overflow');
 return {v:1,rev,stars,owned:union(a.owned,g.owned),paintsOwned:a.paintsOwned,done:{...g.done,...a.done},paid:{...g.paid,...a.paid}};
}
function project(local,remote,uid){
 check(typeof uid==='string'&&SAFE_ID.test(uid),'verified account UID required');
 check(!local.accountSyncOwner||local.accountSyncOwner===uid,'different account on local profile');
 const r=validateAccount(remote);
 const prev=integer(local.accountSyncRevision)?local.accountSyncRevision:-1;
 if(r.rev<prev)return local;
 const trip=object(local.trip)?local.trip:{};
 const done={...r.done};
 for(const [key,day] of Object.entries(trip.done||{}))if(!Object.hasOwn(done,key)||(typeof day==='string'&&day>done[key]))done[key]=day;
 return {...local,accountSyncOwner:uid,accountSyncRevision:r.rev,stars:r.stars,
 owned:union(Array.isArray(local.owned)?local.owned:[],r.owned),
 paintsOwned:union(Array.isArray(local.paintsOwned)?local.paintsOwned:[],r.paintsOwned),
 trip:{...trip,done,paid:{...(trip.paid||{}),...r.paid}}};
}
globalThis.TopouhAccountCore={makeAccount,validateAccount,normalizeRestoration,restore,project};
})();
