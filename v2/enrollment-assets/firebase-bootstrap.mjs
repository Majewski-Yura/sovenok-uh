import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {initializeAuth,inMemoryPersistence,browserPopupRedirectResolver,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {exactPage,verifiedUid} from './identity.mjs';

if (exactPage(location,window)) {
 const config={apiKey:"AIzaSyDLZHhRwXYQU8fAOOlp4LzCODahdQuQ_mA",authDomain:"sovenok-uh.firebaseapp.com",projectId:"sovenok-uh",storageBucket:"sovenok-uh.firebasestorage.app",messagingSenderId:"495272253062",appId:"1:495272253062:web:18300d5cae9bae89756307"}; // the existing public Firebase web config, not an Admin credential
 const app=initializeApp(config,'topouh-v2-owner-enrollment');
 const auth=initializeAuth(app,{persistence:inMemoryPersistence,popupRedirectResolver:browserPopupRedirectResolver});
 const $=id=>document.getElementById(id);
 const login=$('google'), feedback=$('status'), output=$('account'), field=$('uid'), logout=$('clear');
 let epoch=0, selected=null;
 const hide=()=>{selected=null;output.hidden=true;field.textContent='';};
 onAuthStateChanged(auth,u=>{
  if(selected && u!==selected){epoch++;hide();feedback.textContent='Аккаунт изменился. Подтвердите вход снова.';}
 });
 login.disabled=false;
 feedback.textContent='Выберите Google-аккаунт родителя.';
 login.onclick=async()=>{
  const g=++epoch;hide();login.disabled=true;feedback.textContent='Ожидаем подтверждение Google…';
  try {
   const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});
   const {user}=await signInWithPopup(auth,provider);
   const uid=await verifiedUid(auth,user);
   if(g!==epoch)return;
   selected=user;field.textContent=uid;output.hidden=false;
   feedback.textContent='Аккаунт подтверждён. Прогресс не читался и не отправлялся.';
  } catch(e){
   if(g===epoch){await signOut(auth).catch(()=>{});feedback.textContent=e?.code==='auth/popup-blocked'?'Браузер заблокировал окно Google. Разрешите всплывающие окна и повторите.':'Вход не подтверждён. Попробуйте ещё раз.';}
  } finally{if(g===epoch)login.disabled=false;}
 };
 logout.onclick=async()=>{
  const g=++epoch;hide();login.disabled=true;
  try{await signOut(auth);if(g===epoch)feedback.textContent='Вы вышли на этой странице.';}
  catch{if(g===epoch)feedback.textContent='Не удалось выйти. Закройте эту вкладку.';}
  finally{if(g===epoch)login.disabled=false;}
 };
 $('copy').onclick=async()=>{
  if(!selected||auth.currentUser!==selected)return;
  try{await navigator.clipboard.writeText(field.textContent);feedback.textContent='UID скопирован. Передавайте его только лично.';}
  catch{feedback.textContent='Можно выделить и скопировать UID вручную.';}
 };
}
