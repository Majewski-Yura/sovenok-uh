(() => {
 'use strict';
 // No injected adapter / no verified config -> public v2 unchanged.
 function install() {
  const cfg=globalThis.TopouhAccountIntegration;
  if(cfg?.reviewed!==true||!cfg.provider||!globalThis.TopouhAccountCore||!globalThis.createTopouhSync)return;
  const anchor=document.querySelector('#parent .parent-hero');
  if(!anchor||document.querySelector('[data-topouh-parent-account]'))return;
  const parent=anchor.closest('#parent');
  let user=null, active=false, auto=false, blocked=false, timer, observedRaw=null, observedMemory=null;
  let tabChanged=false;
  addEventListener('storage',e=>{if(e.key===KEY||e.key===null)tabChanged=true;});
  const local={
   read(){
    observedRaw=localStorage.getItem(KEY);
    observedMemory=JSON.stringify(S);
    if(tabChanged)throw Error('local changed; reload required');
    if(observedRaw!==null){
     const stored=JSON.parse(observedRaw);
     if(!stored||typeof stored!=='object'||Array.isArray(stored))throw Error('invalid local save');
     for(const [key,value] of Object.entries(stored)){
      const normalized=key==='mode'&&['school','holiday'].includes(value)?'auto':value;
      if(JSON.stringify(S[key])!==JSON.stringify(normalized))throw Error('local changed; reload required');
     }
    }
    return S;
   },
   compareAndSet(old,value){
    if((!parent.classList.contains('on')&&!auto)||!active||S!==old||JSON.stringify(S)!==observedMemory||localStorage.getItem(KEY)!==observedRaw)return false;
    const next=JSON.stringify(value);
    localStorage.setItem(KEY,next);
    if(localStorage.getItem(KEY)!==next)return false;
    S=value;
    setStars();
    return true;
   }
  };
  const el=document.createElement('section');el.dataset.topouhParentAccount='';
  const head=document.createElement('h2');head.textContent='Аккаунт и прогресс';
  const about=document.createElement('p');about.textContent='Вещи, купленные раскраски, звёзды и кругосветка. Рисунки, фото и дневник не передаются. Выход не удаляет сохранение в этом профиле браузера.';
  const status=document.createElement('p');status.setAttribute('role','status');
  const controls=document.createElement('div');controls.className='topouh-account-actions';
  const b=(s,fn)=>{const node=document.createElement('button');node.type='button';node.textContent=s;node.onclick=fn;controls.append(node);return node;};
  const eligible=u=>u?.emailVerified===true&&u?.isGoogle===true;
  const show=n=>{status.textContent=n;};
  const messages={invalidLocalScope:'В местном сохранении есть неизвестная покупка или отметка без даты. Ничего не отправлено; нужна сверка.',multipleIslands:'Несохранённые отметки есть на нескольких островах. Они остались на устройстве; нужна сверка.',synced:'Прогресс обновлён.',stale:'Получена устаревшая версия. Сохранение не изменено.',conflict:'Прогресс изменился на другом устройстве. Ничего не объединено. Нужна сверка.',approvalRequired:'Этот браузер уже содержит другой игровой прогресс. Он не заменён; нужна сверка.',notProvisioned:'Облачная копия ещё не подготовлена. Ничего не изменено.',ownerMismatch:'Этот профиль браузера связан с другим аккаунтом. Ничего не изменено.',writeDisabled:'Запись в облако пока выключена.',unchanged:'Новых изменений для отправки нет.',error:'Не удалось проверить прогресс. Попробуйте снова.'};
  const sync=createTopouhSync({provider:cfg.provider,local,core:TopouhAccountCore,getUser:()=>active&&(auto||parent.classList.contains('on'))?user:null,onView:(k,details)=>{
    if(['stale','conflict','approvalRequired','ownerMismatch','multipleIslands','invalidLocalScope','error'].includes(k)){blocked=true;clearTimeout(timer)}
    const row=p=>p.stars+' звёзд, '+p.purchases+' предметов, '+p.stamps+' штампов';
    show((messages[k]||'Войдите через Google.')+(details?' На устройстве: '+row(details.local)+'. В аккаунте: '+row(details.cloud)+'.':''));
  }});
  const login=b('Войти через Google',async()=>{login.disabled=true;show('Открываем вход Google…');try{const x=await cfg.provider.signIn();if(x?.prepared){login.textContent='Открыть окно Google';show('Вход готов. Нажмите ещё раз, чтобы открыть окно Google.');}}catch{show('Не удалось открыть вход Google. Проверьте разрешение всплывающих окон и попробуйте ещё раз.')}finally{login.disabled=false;}});
  const pull=b('Получить прогресс',async()=>{if(!confirm('Проверить облачную копию покупок, звёзд и кругосветки? Имеющийся отдельный прогресс не будет заменён.'))return;const k=await sync.pull();if(k==='synced')blocked=false;});
  const push=b('Сохранить прогресс в аккаунте',()=>{if(confirm('Сохранить покупки, баланс звёзд и кругосветку в аккаунте?'))sync.push();});
  const label=document.createElement('label'), toggle=document.createElement('input');
  toggle.type='checkbox';label.append(toggle,' Синхронизировать изменения в этой вкладке');
  toggle.onchange=()=>{
    if(toggle.checked&&(!user||S.accountSyncOwner!==user.uid||!S.accountSyncBaseline||blocked)){
      toggle.checked=false;show('Сначала проверьте и подключите облачную копию.');return;
    }
    auto=toggle.checked;clearTimeout(timer);
    if(auto)sync.push();
  };
  addEventListener('topouh:v2-local-saved',()=>{
    if(!auto||!active||blocked)return;
    clearTimeout(timer);timer=setTimeout(()=>{if(auto&&active&&!blocked)sync.push();},400);
  });
  const logout=b('Выйти',async()=>{active=false;auto=false;toggle.checked=false;clearTimeout(timer);sync.invalidate();try{await cfg.provider.signOut()}catch{active=eligible(user);show('Не удалось выйти. Попробуйте ещё раз.')}});
  function render(n){clearTimeout(timer);sync.invalidate();user=n;active=eligible(n);auto=false;blocked=false;toggle.checked=false;label.hidden=!active||cfg.allowWrites!==true;login.hidden=!!n;logout.hidden=!n;pull.hidden=!active;push.hidden=!active||cfg.allowWrites!==true;show(active?'Аккаунт подключён. Выберите действие.':n?'Нужен подтверждённый аккаунт Google.':'Войдите, чтобы получить прогресс другого устройства.');}
  render(null);
  el.append(head,about,status,controls,label);anchor.after(el);
  cfg.provider.subscribe(render,()=>{render(null);show('Не удалось проверить вход. Попробуйте ещё раз.');});
  new MutationObserver(()=>{if(!parent.classList.contains('on')&&!auto)sync.invalidate();}).observe(parent,{attributeFilter:['class']});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded', install,{once:true});
 else install();
})();
