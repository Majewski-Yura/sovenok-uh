((root,factory)=>{if(typeof module!=='undefined')module.exports=factory;else root.createTopouhFirebaseAdapter=factory})(globalThis, function(opts){
 'use strict';
 const {sdk,auth,db,gate={},validateAccount,makeAccount}=opts;
 if(!gate.ready)throw Error('firebase integration disabled');
 const eligible=u=>u&&u.emailVerified===true&&u.providerData.some(p=>p.providerId==='google.com');
 async function authorize(u){
  if(!eligible(u)||!(/^[A-Za-z0-9_-]{1,128}$/).test(u.uid))return false;
  const {claims,signInProvider}=await u.getIdTokenResult();
  return signInProvider==='google.com'&&claims.email_verified===true;
 }
 return {
  subscribe(onAuth,onError){
   let epoch=0;
   const off=sdk.onAuthStateChanged(auth,async u=>{
    const e=++epoch;
    if(!u){onAuth(null);return;}
    try {
     const approved=await authorize(u);
     if(e===epoch&&auth.currentUser===u)onAuth({uid:u.uid,isGoogle:approved,emailVerified:u.emailVerified});
    }catch(err){if(e===epoch)onError(err);}
   },err=>{epoch++;onError(err);});
   return ()=>{epoch++;off();};
  },
  signIn(){const g=new sdk.GoogleAuthProvider();g.setCustomParameters({prompt:'select_account'});return sdk.signInWithPopup(auth,g)},
  signOut(){return sdk.signOut(auth)},
  async readAccount(uid){
   const u=auth.currentUser;
   if(u?.uid!==uid||!await authorize(u)||auth.currentUser!==u)throw Error('account-changed');
   let s;
   try{s=await sdk.getDocFromServer(sdk.doc(db,'topouhV2Accounts',uid));}
   catch(e){if(e.code==='permission-denied'&&auth.currentUser===u)return null;throw e;}
   if(auth.currentUser!==u)throw Error('account-changed');
   return s.exists()?validateAccount(s.data()):null;
  },
  async commit(uid,expected,data,isActive){
   if(gate.revisionWritesReviewed!==true)throw Error('write-disabled');
   const u=auth.currentUser, active=()=>isActive()&&auth.currentUser===u;
   if(u?.uid!==uid||!await authorize(u)||!active())throw Error('account-changed');
   if(!Number.isSafeInteger(expected)||expected<0||expected>=Number.MAX_SAFE_INTEGER)throw Error('invalid-revision');
   const clean=makeAccount(data), ref=sdk.doc(db,'topouhV2Accounts',uid);
   if(clean.stars>1e9)throw Error('invalid-balance');
   try{return await sdk.runTransaction(db,async tx=>{
    if(!active())throw Error('account-changed');
    const snap=await tx.get(ref);
    if(!active())throw Error('account-changed');
    if(!snap.exists())return {kind:'notProvisioned'};
    const prior=validateAccount(snap.data());
    if(prior.rev!==expected)return {kind:'conflict',account:prior};
    if(prior.owned.some(k=>!clean.owned.includes(k))||prior.paintsOwned.some(k=>!clean.paintsOwned.includes(k))||
       Object.entries(prior.done).some(([k,v])=>clean.done[k]!==v)||
       Object.entries(prior.paid).some(([k,v])=>clean.paid[k]!==v))return {kind:'conflict',account:prior};
    const islands=new Set(Object.keys(clean.done).filter(k=>!Object.hasOwn(prior.done,k)).map(k=>k[0]));
    if(islands.size>1)return {kind:'multipleIslands',account:prior};
    const account={...clean,rev:expected+1};
    tx.update(ref,account);
    return {kind:'committed',account};
   })}catch(e){if(e.code==='permission-denied'&&active())return {kind:'notProvisioned'};throw e;}
  }
 };
});
