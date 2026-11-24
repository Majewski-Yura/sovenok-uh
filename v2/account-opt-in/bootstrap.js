(() => {
 'use strict';
 if(location.origin!=='https://majewski-yura.github.io'||!['/sovenok-uh/v2/','/sovenok-uh/v2/index.html'].includes(location.pathname)||window.top!==window)return;
 const config={apiKey:"AIzaSyDLZHhRwXYQU8fAOOlp4LzCODahdQuQ_mA",authDomain:"sovenok-uh.firebaseapp.com",projectId:"sovenok-uh",storageBucket:"sovenok-uh.firebasestorage.app",messagingSenderId:"495272253062",appId:"1:495272253062:web:18300d5cae9bae89756307"};
 let inner, init, listener, onError, unsubscribe;
 async function load(){
  if(inner)return inner;
  if(!init)init=(async()=>{
   const [appSDK,authSDK,firestore]=await Promise.all([
    import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js')
   ]);
   const app=appSDK.initializeApp(config,'topouh-v2-parent-sync');
   const auth=authSDK.initializeAuth(app,{persistence:authSDK.inMemoryPersistence,popupRedirectResolver:authSDK.browserPopupRedirectResolver});
   const db=firestore.getFirestore(app);
   inner=createTopouhFirebaseAdapter({sdk:{...authSDK,...firestore},auth,db,gate:{ready:true,revisionWritesReviewed:true},
      validateAccount:TopouhAccountCore.validateAccount,makeAccount:TopouhAccountCore.makeAccount});
   if(listener)unsubscribe=inner.subscribe(listener,onError);
   return inner;
  })().catch(e=>{init=null;throw e;});
  return init;
 }
 const provider={
  subscribe(next,error){listener=next;onError=error;next(null);return ()=>{unsubscribe?.();listener=null;onError=null;}},
  async signIn(){if(inner)return inner.signIn();await load();return {prepared:true};},
  async signOut(){if(inner)await inner.signOut();},
  readAccount(uid){if(!inner)throw Error('signed-out');return inner.readAccount(uid);},
  commit(uid,rev,data,active){if(!inner)throw Error('signed-out');return inner.commit(uid,rev,data,active);}
 };
 window.TopouhAccountIntegration={reviewed:true,provider,allowWrites:true};
})();
