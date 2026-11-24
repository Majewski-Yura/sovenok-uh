import adapter from './transfer-adapter.mjs';
import flow from './transfer-flow.mjs';
import core from './transfer-core.mjs';

export function installTransfer({sdk,auth,db}) {
 const deps=adapter.create({sdk,auth,db,location,win:window});
 const transfer=flow.create({...deps,core,store:{getItem:k=>window.localStorage.getItem(k)}});
 const $=id=>document.getElementById(id), box=$('transfer'), report=$('transfer-status'), preview=$('transfer-preview'),
  review=$('transfer-review'), send=$('transfer-send');
 let chosen=null, valid=[], view=0;
 const reset=()=>{view++;transfer.clear();box.hidden=true;preview.replaceChildren();send.hidden=true;review.hidden=false;review.disabled=false;send.disabled=false;chosen=null;valid=[];};
 function start(){reset();box.hidden=false;report.textContent='Сводка останется на устройстве. Ничего не отправится без вашего подтверждения.';}
 review.onclick=async()=>{
  const id=++view;
  chosen=null;valid=[];preview.replaceChildren();send.hidden=true;review.disabled=true;
  report.textContent='Проверяем доступ…';
  try {
   const result=await transfer.inspect();
   if(view!==id)return;
   if(result.kind!=='review'){report.textContent='В этом аккаунте перенос недоступен или время для него истекло.';return;}
   chosen=result.chosen;
   valid=result.entries.filter(e=>e.kind==='ready').map(e=>e.source);
   const field=document.createElement('fieldset'), legend=document.createElement('legend');
   legend.textContent=result.needsExplicitSource?'Выберите сохранение':'Сохранения на этом устройстве';field.append(legend);
   const val=n=>n??'—';
   for(const e of result.entries){
    const article=document.createElement('article'), title=document.createElement('h3'), p=document.createElement('p');
    title.textContent=e.source==='v1'?'Версия v1':'Версия /v2/';
    const x=e.summary;
    p.textContent=x?'Звёзды: '+val(x.stars)+' · Вещи: '+val(x.wardrobe)+' · Купленные раскраски: '+val(x.coloring)+' · Штампы: '+val(x.stamps)+' · Флаги: '+val(x.flags)+' · Метка +57: '+(e.marker==='present'?'есть':'не подтверждена')+'.':'Сохранение не найдено или не читается.';
    if(e.kind==='review')p.textContent+=e.reason==='undated-restoration'?' Восстановленные отметки без дат требуют отдельной сверки.':' Эти данные требуют отдельной сверки.';
    article.append(title,p);
    if(e.kind==='ready'&&result.needsExplicitSource){
     const label=document.createElement('label'), radio=document.createElement('input');
     radio.type='radio';radio.name='transfer-source';label.append(radio,' Выбрать этот источник');article.append(label);
     radio.onchange=()=>{chosen=e.source;send.hidden=false;};
    }
    field.append(article);
   }
   preview.append(field);
   send.hidden=!chosen;send.disabled=false;
   report.textContent=chosen?'Выбран '+(chosen==='v1'?'v1':'/v2/')+'. Проверьте цифры перед отправкой.':
    valid.length?'Выберите источник. Остальные сохранения останутся на устройстве.':'Нужна отдельная сверка. Ничего не отправлено.';
  }catch{if(view===id)report.textContent='Не удалось проверить доступ. Попробуйте ещё раз.';}
  finally{if(view===id)review.disabled=false;}
 };
 send.onclick=async()=>{
  if(!chosen||!valid.includes(chosen)||!confirm('Отправить для сверки баланс звёзд, купленные вещи и раскраски и отметки кругосветки? Фото, рисунки и дневник останутся на устройстве.'))return;
  const id=view;send.disabled=review.disabled=true;
  try {
   const result=await transfer.submit({source:chosen,confirmed:true});
   if(view!==id)return;
   if(result.kind==='submitted'){
    send.hidden=true;review.hidden=true;preview.replaceChildren();
    report.textContent='Сохранение отправлено для сверки. Локальные данные не менялись, облачный аккаунт ещё не подключён.';
   }else{
    send.hidden=true;
    report.textContent=result.kind==='local-changed'?'После просмотра сохранение изменилось. Проверьте его снова.':'Сохранение не отправлено. Проверьте его снова.';
   }
  }catch{if(view===id){send.hidden=true;report.textContent='Отправка не подтверждена. Не повторяйте её до сверки с оператором.';}}
  finally{if(view===id)review.disabled=false;}
 };
 return {reset,start};
}
