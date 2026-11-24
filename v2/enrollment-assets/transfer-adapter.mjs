'use strict';
// Draft only. Deliver under the exact existing onboarding origin/path AFTER reviewed gate/rules.
// The caller passes SDK plus Auth/Firestore instances initialized on the SAME named Firebase app.
function create({sdk,auth,db,location,win}){
 const path='/sovenok-uh/v2/enroll-parent.html';
 if(location.origin!=='https://majewski-yura.github.io'||location.pathname!==path||location.search||location.hash||win.top!==win||
    auth.app.options.projectId!=='sovenok-uh'||db.app!==auth.app)throw Error('unexpected-enrollment-origin');
 async function currentVerifiedGoogleUid(){
  const u=auth.currentUser;
  if(!u||!(/^[A-Za-z0-9_-]{1,128}$/).test(u.uid))return null;
  const {claims,signInProvider}=await u.getIdTokenResult();
  return auth.currentUser===u&&signInProvider==='google.com'&&claims.email_verified===true?u.uid:null;
 }
 const same=async uid=>{if(await currentVerifiedGoogleUid()!==uid)throw Error('account-changed');};
 return {auth:{currentVerifiedGoogleUid},broker:{
  async getGate(uid) {
   await same(uid);
   try {
    const s=await sdk.getDocFromServer(sdk.doc(db,'topouhV2TransferGates',uid));
    await same(uid);
    if(!s.exists())return null;
    const x=s.data();
    return {v:x.v,expiryMs:x.expiresAt?.toMillis()};
   } catch(e){if(e.code==='permission-denied')return null;throw e;}
  },
  async createSubmission(uid,data){
   await same(uid);
   // Rules only permit create with a matching live gate. Retrying an existing write is denied.
   // No account doc or private receipt mutation. Never activate without matching create-only batch rules.
   const {done,...envelope}=data;
   const groups=Array.from({length:6},()=>({done:{}}));
   for(const [k,v] of Object.entries(done)){
    if(!/^[0-5]-(?:exam|[0-3]-[0-3])$/.test(k)||typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v))throw Error('invalid-voyage');
    groups[Number(k[0])].done[k]=v;
   }
   const batch=sdk.writeBatch(db);
   batch.set(sdk.doc(db,'topouhV2TransferSubmissions',uid),envelope);
   for(let i=0;i<groups.length;i++)batch.set(sdk.doc(db,'topouhV2TransferSubmissions',uid,'voyage',String(i)),groups[i]);
   await batch.commit();
  }
 }};
}
export default {create};
