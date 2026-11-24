((root,factory)=>{if(typeof module!=='undefined')module.exports=factory;else root.createTopouhSync=factory})(globalThis, function({provider,local,core,getUser,onView=()=>{}}){
 // Store the base in the same local save as projection, not in Firebase.
 let generation=0, tail=Promise.resolve(), blocked=false;
 const canonical=p=>JSON.stringify([p.stars,[...p.owned].sort(),Object.entries(p.done).sort(),Object.entries(p.paid).sort(),...(p.paintsOwned?.length?[[...p.paintsOwned].sort()]:[])]);
 const payload=s=>{const p=core.makeAccount({stars:s.stars,owned:s.owned||[],done:s.trip?.done||{},paid:s.trip?.paid||{},...(Object.hasOwn(s,'paintsOwned')?{paintsOwned:s.paintsOwned}:{})});return {stars:p.stars,owned:p.owned,done:p.done,paid:p.paid,paintsOwned:p.paintsOwned}};
 const compare=(here,cloud)=>{
  if(!here||!cloud)return undefined;
  const describe=p=>({stars:p.stars,purchases:p.owned.length+(p.paintsOwned?.length||0),stamps:Object.keys(p.done).filter(k=>/-3$/.test(k)).length});
  return {local:describe(here),cloud:describe(cloud)};
 };
 const result=(kind,details)=>{if(['conflict','stale','approvalRequired','ownerMismatch','multipleIslands' ,'invalidLocalScope'].includes(kind))blocked=true;onView(kind,details);return kind};
 const blank={stars:0,owned:[],done:{},paid:{}};
 async function operation(kind,g,user){
  const uid=user?.uid;
  const active=()=>g===generation&&getUser()?.uid===uid;
  if(g!==generation)return 'cancelled';
  if(!uid||user.emailVerified!==true||user.isGoogle!==true)return result('signedOut');

  try {
   const s=local.read();
   if(!s||s.accountSyncOwner&&s.accountSyncOwner!==uid)return result('ownerMismatch');
   if(kind==='push'&&blocked)return result('conflict');
   let pending;try{pending=payload(s)}catch{return result('invalidLocalScope');}
   const sent=canonical(pending);
   const base=s.accountSyncBaseline;
   const stage=(account,advanced=false)=>{
    if(!active())return 'cancelled';
    const now=local.read();
    if(advanced){
     if(now.accountSyncOwner!==uid||now.accountSyncBaseline!==base||now.accountSyncRevision!==s.accountSyncRevision)return result('conflict');
     return local.compareAndSet(now,{...now,accountSyncRevision:account.rev,accountSyncBaseline:canonical(account)})?result('synced'):result('conflict');
    }
    if(canonical(payload(now))!==sent)return result('conflict');
    if(now.accountSyncOwner&&now.accountSyncOwner!==uid)return result('ownerMismatch');
    const next=core.project(now,account,uid);
    if(next===now)return result('stale');
    const p={...next,accountSyncBaseline:canonical(account)};
    return local.compareAndSet(now,p)?result('synced'):result('conflict');
   };
   if(kind==='push'){
    if(!base||s.accountSyncOwner!==uid)return result('approvalRequired');
    if(base===sent)return result('unchanged');
    let r;
    try{r=await provider.commit(uid,s.accountSyncRevision,pending,active);}
    catch(e){
     if(!active()||e.message==='write-disabled')throw e;
     const check=await provider.readAccount(uid);
     if(check&&check.rev===s.accountSyncRevision+1&&canonical(check)===sent)r={kind:'committed',account:check};
     else throw e;
    }
    if(!active())return 'cancelled';
    if(r.kind!=='committed')return result(r.kind,compare(pending,r.account));
    return stage(r.account,true);
   }
   const account=await provider.readAccount(uid);
   if(!active())return 'cancelled';
   if(account===null)return result('notProvisioned');
   const r=core.validateAccount(account), target=canonical(r);
   const prior=s.accountSyncRevision??-1;
   if(r.rev<prior)return result('stale');
   if(r.rev===prior&&base&&target!==base)return result('conflict',compare(pending,r));
   if(base?sent!==base&&sent!==target:sent!==target&&sent!==canonical(blank))return result('approvalRequired',compare(pending,r));
   const applied=stage(r);
   if(applied==='synced')blocked=false;
   return applied;
  } catch(e){return active()?result(e.message==='write-disabled'?'writeDisabled':'error'):'cancelled'}
 }
 const enqueue=kind=>{const g=generation,u=getUser();const p=tail.then(()=>operation(kind,g,u));tail=p.catch(()=>{});return p;};
 return {pull:()=>enqueue('pull'),push:()=>enqueue('push'),invalidate(){generation++;blocked=false}};
});
