'use strict';
const KEYS={v1:'uh-v1',v2:'topouh-v2-github-local-v1'};
const SAFE=/^[A-Za-z0-9_-]{1,128}$/;
const obj=x=>x&&typeof x==='object'&&!Array.isArray(x);
const get=(x,k,d)=>Object.hasOwn(x,k)?x[k]:d;
const day=x=>{if(typeof x!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(x))return false;const d=new Date(x+'T00:00:00Z');return !Number.isNaN(+d)&&d.toISOString().slice(0,10)===x;};
const ordered=x=>Object.fromEntries(Object.entries(x).sort(([a],[b])=>a.localeCompare(b)));
function projection(core,store,source) {
 const raw=store.getItem(KEYS[source]);
 if(raw===null)return {source,kind:'missing'};
 let s;try{s=JSON.parse(raw);}catch{return {source,kind:'review'};}
 if(!obj(s)||!obj(get(s,'trip',{})))return {source,kind:'review'};
 const t=s.trip||{}, done=get(t,'done',{});
 const marker=s.topouhRecovery20261124===1?'present':'unconfirmed';
 const summary={stars:Number.isSafeInteger(s.stars)&&s.stars>=0?s.stars:null,
  wardrobe:Array.isArray(s.owned)?new Set(s.owned.filter(x=>typeof x==='string')).size:null,
  coloring:Array.isArray(s.paintsOwned)?new Set(s.paintsOwned.filter(x=>typeof x==='string')).size:0,
  stamps:obj(done)?Object.keys(done).filter(k=>/^[0-5]-[0-3]-3$/.test(k)&&done[k]).length:null,
  flags:obj(done)?Object.keys(done).filter(k=>/^[0-5]-exam$/.test(k)&&done[k]).length:null};
 try{
  if(!Object.hasOwn(s,'stars')||!obj(done)||Object.values(done).some(x=>!day(x)))throw Error('invalid-source');
  const p=core.makeAccount({stars:s.stars,owned:get(s,'owned',[]),paintsOwned:get(s,'paintsOwned',[]),done,paid:get(t,'paid',{})});
  const scope={stars:p.stars,owned:p.owned,paintsOwned:p.paintsOwned,done:ordered(p.done),paid:ordered(p.paid)};
  return {source,kind:'ready',marker,summary,scope,fingerprint:JSON.stringify([scope,marker])};
 }catch{return {source,kind:'review',marker,summary,reason:obj(done)&&Object.values(done).includes('restored')?'undated-restoration':'invalid-scope'};}
}
function create({auth,broker,core,store,now=Date.now}) {
 let generation=0, scope=null, sending=false;
 const current=()=>auth.currentVerifiedGoogleUid();
 const active=async(g,uid)=>generation===g&&(await current())===uid;
 const clear=()=>{generation++;scope=null;};
 return {clear,
  async inspect(){
   if(sending)return {kind:'busy'};
   clear();const g=generation,uid=await current();
   if(typeof uid!=='string'||!SAFE.test(uid))return {kind:'unauthorized'};
   const gate=await broker.getGate(uid);
   if(!await active(g,uid))return {kind:'cancelled'};
   if(!gate||gate.v!==1||!Number.isSafeInteger(gate.expiryMs)||gate.expiryMs<=now())return {kind:'closed'};
   const entries=Object.keys(KEYS).map(k=>projection(core,store,k));
   const valid=entries.filter(e=>e.kind==='ready'), needsReview=entries.some(e=>e.kind==='review');
   // Presence vs absence of the receipt evidence is meaningful even if all values match.
   const required=needsReview||new Set(valid.map(x=>x.fingerprint)).size>1;
   const chosen=!required&&valid.length?(valid.find(e=>e.source==='v2')||valid[0]).source:null;
   scope={g,uid,gate,entries,chosen};
   return {kind:'review',needsExplicitSource:required,chosen,
     entries:entries.map(({scope,fingerprint,...display})=>display)};
  },
  async submit({source,confirmed}={}){
   if(!scope||sending||confirmed!==true)return {kind:'not-confirmed'};
   const {g,uid,gate,entries,chosen}=scope;
   const picked=source||chosen, e=entries.find(x=>x.source===picked);
   if(!e||e.kind!=='ready')return {kind:'source-not-ready'};
   if(!await active(g,uid))return {kind:'cancelled'};
   if(gate.expiryMs<=now())return {kind:'closed'};
   // Recheck both relevant snapshots so the user does not confirm behind a newly changed save.
   const check=Object.keys(KEYS).map(k=>projection(core,store,k));
   if(check.some((x,i)=>x.kind!==entries[i].kind||x.fingerprint!==entries[i].fingerprint||
      JSON.stringify(x.summary)!==JSON.stringify(entries[i].summary)||x.marker!==entries[i].marker))return {kind:'local-changed'};
   if(sending||generation!==g)return {kind:'cancelled'};
   sending=true;
   try{
    await broker.createSubmission(uid,{v:1,source:picked,receiptMarker:e.marker,...e.scope});
    clear();return {kind:'submitted'};
   }finally{sending=false;}
  }
 };
}
export default {create,projection};
