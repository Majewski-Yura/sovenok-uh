(function(root){
  'use strict';
  function createModel(task){
    const kind=task?.kind, items=task?.items;
    if(!Array.isArray(items)||!['pick','order','route','sort'].includes(kind))throw new TypeError('Недопустимый тип задания');
    const n=items.length, sort=kind==='sort', pick=kind==='pick', positional=!sort&&!pick;
    const bins=sort?(Array.isArray(task.bins)?task.bins.length:0):pick?1:n;
    if((pick&&n!==3)||(sort&&(n<3||n>6||bins<2||bins>3))||(positional&&(n<3||n>5)))throw new RangeError('Недопустимое количество карточек или мест');
    for(const item of items)if(!Array.isArray(item)||typeof item[0]!=='string'||!item[0].trim())throw new TypeError('Карточка без подписи');
    if(sort&&task.bins.some(bin=>typeof bin!=='string'||!bin.trim()))throw new TypeError('Группа без подписи');
    const isInt=(v,end)=>Number.isInteger(v)&&v>=0&&v<end;
    const answer=pick?(Array.isArray(task.answer)&&task.answer.length===1?task.answer[0]:task.answer):task.answer;
    if(pick?!isInt(answer,n):!Array.isArray(answer)||answer.length!==n||Array.from(answer).some(a=>!isInt(a,sort?bins:n))||(!sort&&new Set(answer).size!==n))throw new TypeError('Недопустимый ключ ответа');
    const initialBank=()=>Array.from({length:n},(_,i)=>i);
    let loc=Array(n).fill(-1),bank=initialBank(),selected=-1,locked=false,revealed=false;
    function choose(i){
      if(locked||!isInt(i,n))return false;
      if(pick)return place(i,0);
      else selected=selected===i?-1:i;
      return true;
    }
    function place(i,j){
      if(locked||!isInt(i,n)||!isInt(j,bins))return false;
      const old=loc[i];
      if(old===j){const had=selected!==-1;selected=-1;return had}
      if(!sort){
        const other=loc.indexOf(j);
        if(other!==-1){
          if(old===-1){
            const from=bank.indexOf(i),to=bank.indexOf(other);
            [bank[from],bank[to]]=[bank[to],bank[from]];
          }
          loc[other]=positional?old:-1;
        }
      }
      loc[i]=j;selected=-1;return true;
    }
    function remove(i){
      if(locked||!isInt(i,n)||loc[i]===-1)return false;
      loc[i]=-1;selected=-1;return true;
    }
    return {
      choice:n,slots:bins,sort,pick,positional,answer,
      get selected(){return selected},get locked(){return locked},get revealed(){return revealed},
      values:()=>loc.slice(),bankItems:()=>bank.filter(i=>loc[i]===-1),choose,place,remove,
      cancel(){if(locked||selected===-1)return false;selected=-1;return true},
      ready(){return pick?loc.includes(0):loc.every(v=>v!==-1)},
      verify(){return this.ready()&&(pick?loc.indexOf(0)===answer:sort?loc.every((v,i)=>v===answer[i]):answer.every((id,i)=>loc[id]===i))},
      reset(){if(locked)return false;loc.fill(-1);bank=initialBank();selected=-1;return true},
      lock(){if(locked)return false;locked=true;selected=-1;return true},
      reveal(){locked=true;selected=-1;if(revealed)return false;revealed=true;return true}
    };
  }

  let nextId=0;
  function topouhVisualBoard(task,{onChange=()=>{}}={}){
    const m=createModel(task), doc=root.document, id='tvb'+(++nextId), svgNS='http://www.w3.org/2000/svg';
    const labels=task.items.map(x=>x[0]);
    const names=m.sort?task.bins:m.pick?['Мой ответ']:Array.from({length:m.slots},(_,j)=>m.positional&&task.kind==='route'?'Шаг '+(j+1):'Место '+(j+1));
    const make=(tag,cls,value)=>{const x=doc.createElement(tag);if(cls)x.className=cls;if(value!==undefined)x.textContent=value;return x};
    const but=(cls,key,text)=>{const a=make('button',cls,text);a.type='button';a.dataset.tvbKey=key;return a};
    const el=make('section','tvb tvb-lab'),help=make('p','tvb-instruction'),status=make('p','tvb-live'),body=make('div','tvb-body');
    const title=make('h3','tvb-sr',String(task.prompt||'Карточки задания'));title.id=id+'-title';
    help.id=id+'-help';status.setAttribute('role','status');status.setAttribute('aria-atomic','true');
    el.setAttribute('aria-labelledby',title.id);el.setAttribute('aria-describedby',help.id);
    help.textContent=m.pick?'Нажми на карточку или перетащи её в поле ответа.':m.sort?'Выбери карточку, затем её группу. Можно перетаскивать.':'Выбери карточку, затем её место. Чтобы поменять две карточки местами, выбери одну и нажми на место другой.';
    el.append(title,help,body,status);
    const region=(name,cls)=>{const node=make('section',cls), h=make('h4','tvb-label',name);node.append(h);node.setAttribute('aria-label',name);return node};
    function picture(icon){
      if(typeof icon!=='string'||!/^[-a-z0-9]+$/i.test(icon))return null;
      const pic=doc.createElementNS(svgNS,'svg'),use=doc.createElementNS(svgNS,'use');
      pic.classList.add('tvb-icon');pic.setAttribute('aria-hidden','true');pic.setAttribute('focusable','false');
      use.setAttribute('href','belarusian-assets/workshop-icons.svg#vis-'+icon.replace(/^vis-/,''));
      pic.append(use);return pic;
    }
    let pointerCard=null,ghost=null,suppressClickUntil=0;
    const focusKey=(key)=>{if(!key)return false;const next=Array.from(el.querySelectorAll('button[data-tvb-key]')).find(a=>a.dataset.tvbKey===key&&!a.disabled);if(!next)return false;next.focus({preventScroll:true});return true};
    const focus=()=>{if(m.locked){title.tabIndex=-1;title.focus();return}const first=el.querySelector('.tvb-card:not(:disabled),button[data-tvb-key]:not(:disabled)');if(first)first.focus({preventScroll:true});else{title.tabIndex=-1;title.focus()}};
    function changed(ok,key,text){
      if(!ok)return;
      const hold=key||((el.contains(doc.activeElement)&&doc.activeElement.dataset.tvbKey)||'');
      render();
      if(hold&&!focusKey(hold))focus();
      if(text)status.textContent=text;
      onChange();
    }
    const itemNode=i=>el.querySelector('[data-tvb-key="item-'+i+'"]');
    function put(i,j){
      const other=m.sort?-1:m.values().indexOf(j);
      const swap=other!==-1&&other!==i;
      const first=swap?itemNode(other)?.getBoundingClientRect():null;
      changed(m.place(i,j),'item-'+i,swap?labels[i]+' и '+labels[other]+' поменялись местами.':labels[i]+' → '+names[j]+'.');
      if(!first||root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)return;
      const node=itemNode(other),last=node?.getBoundingClientRect();
      if(!last||(first.left===last.left&&first.top===last.top))return;
      node.animate?.([
        {transform:'translate('+(first.left-last.left)+'px,'+(first.top-last.top)+'px)',zIndex:3},
        {transform:'translate(0,0)',zIndex:3}
      ],{duration:240,easing:'cubic-bezier(.2,.75,.22,1)'});
    }
    let dropZones=[];
    const clearHighlights=()=>dropZones.forEach(t=>t.classList.remove('tvb-drop-highlight'));
    function guidesFor(held){
      dropZones.forEach(t=>t.classList.remove('tvb-drop-ready','tvb-drop-highlight'));
      dropZones=Array.from(el.querySelectorAll('[data-tvb-slot],[data-tvb-return]'))
        .filter(t=>t.hasAttribute('data-tvb-slot')||held.fromSlot);
      for(const zone of dropZones)zone.classList.add('tvb-drop-ready');
    }
    function clearDrag(){
      const held=pointerCard;pointerCard=null;
      if(edgeFrame){root.cancelAnimationFrame(edgeFrame);edgeFrame=0}
      if(held){
        held.card.classList.remove('tvb-is-dragging');
        doc.removeEventListener('pointermove',move,true);
        doc.removeEventListener('pointerup',drop,true);
        doc.removeEventListener('pointercancel',cancel,true);
        doc.removeEventListener('visibilitychange',hideDrag);
        root.removeEventListener('blur',clearDrag);
        root.removeEventListener('scroll',rehit,true);
        try{if(held.card.hasPointerCapture?.(held.id))held.card.releasePointerCapture(held.id)}catch(_){}
      }
      if(ghost){ghost.remove();ghost=null}
      for(const zone of dropZones)zone.classList.remove('tvb-drop-ready','tvb-drop-highlight');
      dropZones=[];
    }
    function showGhost(held){
      const proxy=held.card.cloneNode(true);
      proxy.removeAttribute('id');proxy.removeAttribute('aria-label');
      proxy.removeAttribute('aria-pressed');proxy.tabIndex=-1;proxy.disabled=true;
      ghost=make('div','tvb tvb-lab tvb-drag-ghost'+(held.fromSlot?' tvb-slot':''));
      ghost.setAttribute('aria-hidden','true');ghost.inert=true;
      ghost.style.width=held.width+'px';ghost.style.height=held.height+'px';
      ghost.append(proxy);doc.body.append(ghost);
      held.card.classList.add('tvb-is-dragging');
    }
    const validZone=t=>t&&dropZones.includes(t);
    const within=(x,y)=>x>=0&&y>=0&&x<root.innerWidth&&y<root.innerHeight;
    function targetAt(e,held){
      const {clientX:x,clientY:y}=e;
      if(!within(x,y))return null;
      const find=(px,py)=>doc.elementFromPoint(px,py)?.closest('[data-tvb-slot],[data-tvb-return]');
      const exact=find(x,y);if(validZone(exact))return exact;
      // Near an edge, accept at most one visible slot. Never guess between two.
      const hits=dropZones.filter(z=>{
        if(!z.hasAttribute('data-tvb-slot'))return false;
        const r=z.getBoundingClientRect(),cx=Math.max(r.left+2,Math.min(r.right-2,x)),cy=Math.max(r.top+2,Math.min(r.bottom-2,y));
        return within(cx,cy)&&Math.hypot(cx-x,cy-y)<=13&&find(cx,cy)===z;
      });
      return hits.length===1?hits[0]:null;
    }
    let edgeFrame=0;
    function edgeScroll(){
      edgeFrame=0;
      const held=pointerCard;
      if(!held||!ghost)return;
      const near=held.py,delta=near<60?-Math.ceil((60-near)/5):near>root.innerHeight-60?Math.ceil((near-root.innerHeight+60)/5):0;
      if(!delta)return;
      const scroller=doc.scrollingElement,old=scroller.scrollTop;
      scroller.scrollTop+=delta;
      if(scroller.scrollTop===old)return;
      hoverTarget({clientX:held.px,clientY:held.py});
      edgeFrame=root.requestAnimationFrame(edgeScroll);
    }
    function hoverTarget(e){
      clearHighlights();
      const over=targetAt(e,pointerCard);if(over)over.classList.add('tvb-drop-highlight');
    }
    function hideDrag(){if(doc.hidden)clearDrag()}
    function rehit(){if(pointerCard&&ghost)hoverTarget({clientX:pointerCard.px,clientY:pointerCard.py})}
    function card(i){
      const a=but('tvb-card','item-'+i),pic=picture(task.items[i][1]),current=m.values()[i];
      if(pic)a.append(pic);
      const caption=make('span','tvb-card-label',labels[i]);
      if(task.itemLang==='en-GB')caption.lang=task.itemLang;
      a.append(caption);
      a.disabled=m.locked;a.draggable=false;
      a.setAttribute('aria-pressed',String(m.pick?current===0:m.selected===i));
      if(current!==-1)a.setAttribute('aria-label',labels[i]+', '+names[current]+(m.pick?'. Нажми, чтобы вернуть.':''));
      a.addEventListener('click',e=>{
        if(e.detail!==0&&root.performance.now()<=suppressClickUntil){suppressClickUntil=0;e.preventDefault();return}
        if(m.pick&&current!==-1){changed(m.remove(i),'item-'+i,labels[i]+' возвращено в карточки.');return}
        if(m.pick){put(i,0);return}
        changed(m.choose(i),'item-'+i,m.pick?'Выбран ответ: '+labels[i]+'.':m.selected===i?'Выбрано: '+labels[i]+'. Теперь выбери место.':'Выбор отменён.');
      });
      a.addEventListener('pointerdown',e=>{
        if(m.locked||e.button!==0||e.isPrimary===false||pointerCard)return;
        suppressClickUntil=0;
        const rect=a.getBoundingClientRect();
        pointerCard={id:e.pointerId,index:i,card:a,fromSlot:current!==-1,
          x:e.clientX,y:e.clientY,dx:e.clientX-rect.left,dy:e.clientY-rect.top,width:rect.width,height:rect.height};
        doc.addEventListener('pointermove',move,true);
        doc.addEventListener('pointerup',drop,true);
        doc.addEventListener('pointercancel',cancel,true);
        doc.addEventListener('visibilitychange',hideDrag);
        root.addEventListener('blur',clearDrag);
        root.addEventListener('scroll',rehit,true);
        guidesFor(pointerCard);
        try{a.setPointerCapture?.(e.pointerId)}catch(_){}
      });
      a.addEventListener('dragstart',e=>e.preventDefault());
      a.addEventListener('lostpointercapture',e=>{
        if(pointerCard?.id===e.pointerId)clearDrag();
      });
      return a;
    }
    function render(){
      clearDrag();body.replaceChildren();
      const loc=m.values();
      const bank=region(m.pick?'Варианты ответа':'Карточки','tvb-bank'), cards=make('div','tvb-bank-cards');
      if(loc.every(x=>x>=0)&&!m.pick)cards.append(make('p','tvb-empty','Все карточки разложены.'));
      m.bankItems().forEach(i=>cards.append(card(i)));
      bank.append(cards);body.append(bank);bank.dataset.tvbReturn='1';
      if(!m.pick){
        const back=but('tvb-return','bank','Вернуть выбранную карточку');
        back.disabled=m.locked||m.selected===-1||loc[m.selected]===-1;
        const remove=i=>changed(m.remove(i),'item-'+i,labels[i]+' возвращено в карточки.');
        back.addEventListener('click',()=>remove(m.selected));bank.append(back);
      }
      const target=region(m.pick?'Поле ответа':m.sort?'Группы':'Порядок действий','tvb-target');
      if(m.pick){target.dataset.tvbSlot='0';target.classList.add('tvb-pick-target');}
      const grid=make('div','tvb-slots'+(m.sort?' tvb-bins':m.pick?' tvb-one':' tvb-order'));
      names.forEach((name,j)=>{
        const slot=make('div','tvb-slot');if(!m.pick)slot.dataset.tvbSlot=String(j);
        const content=loc.flatMap((x,i)=>x===j?[i]:[]);
        const putButton=but('tvb-slot-button','slot-'+j,name);
        if(task.binLang==='en-GB')putButton.lang=task.binLang;
        putButton.setAttribute('aria-label',name+(content.length?', '+content.map(i=>labels[i]).join(', '):', пусто'));
        putButton.disabled=m.locked||(m.selected===-1&&!m.positional);
        putButton.addEventListener('click',()=>{if(m.selected!==-1)put(m.selected,j);else if(content.length)focusKey('item-'+content[0]);else status.textContent='Сначала выбери карточку.'});
        slot.append(putButton);
        if(content.length)content.forEach(i=>slot.append(card(i)));
        else slot.append(make('span','tvb-slot-detail',m.pick?'Перетащи карточку сюда':'Пока пусто'));
        grid.append(slot);
      });
      target.append(grid);body.append(target);
      if(!m.pick&&!m.locked&&m.selected!==-1)guidesFor({fromSlot:loc[m.selected]!==-1});
      if(m.revealed){
        const solution=region(m.verify()?'Всё верно':'Как правильно','tvb-solution');
        const list=make(m.positional?'ol':'ul','');
        if(m.pick)list.append(make('li','',labels[m.answer]));
        else if(m.sort)names.forEach((a,j)=>list.append(make('li','',a+': '+labels.filter((_,i)=>m.answer[i]===j).join(', '))));
        else m.answer.forEach(i=>list.append(make('li','',labels[i])));
        solution.append(list);body.append(solution);
      }
    }
    function cancel(e){if(pointerCard?.id===e.pointerId){suppressClickUntil=root.performance.now()+300;clearDrag()}}
    function move(e){
      const held=pointerCard;
      if(!held||held.id!==e.pointerId||m.locked)return;
      if(!ghost){
        if(Math.hypot(e.clientX-held.x,e.clientY-held.y)<9)return;
        showGhost(held);
      }
      ghost.style.transform='translate3d('+(e.clientX-held.dx)+'px,'+(e.clientY-held.dy)+'px,0)';
      held.px=e.clientX;held.py=e.clientY;
      hoverTarget(e);
      if(!edgeFrame)edgeFrame=root.requestAnimationFrame(edgeScroll);
    }
    function drop(e){
      const held=pointerCard;
      if(!held||held.id!==e.pointerId)return;
      const moved=Boolean(ghost)||Math.hypot(e.clientX-held.x,e.clientY-held.y)>=9;
      const over=moved?targetAt(e,held):null;
      clearDrag();
      if(!moved||m.locked){if(!m.locked&&!m.pick&&m.selected!==-1)guidesFor({fromSlot:m.values()[m.selected]!==-1});return;}
      suppressClickUntil=root.performance.now()+300;e.preventDefault();
      if(over&&el.contains(over)){
        if(over.hasAttribute('data-tvb-slot'))put(held.index,Number(over.dataset.tvbSlot));
        else changed(m.remove(held.index),'item-'+held.index,labels[held.index]+' возвращено в карточки.');
      }
    }
    el.addEventListener('keydown',e=>{
      if(e.key!=='Escape')return;
      if(pointerCard){cancel({pointerId:pointerCard.id});e.preventDefault();return}
      if(m.cancel()){e.preventDefault();const key=doc.activeElement?.dataset?.tvbKey;changed(true,key,'Выбор отменён.')}
    });
    render();
    return {element:el,ready:()=>m.ready(),verify:()=>m.verify(),reset:()=>changed(m.reset(),'item-0','Можно начать заново.'),
      reveal:()=>changed(m.reveal(),null,'Показан правильный ответ.'),lock:()=>changed(m.lock(),null),focus};
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={createModel};
  if(root)root.topouhLabVisualBoard=topouhVisualBoard;
})(typeof window==='undefined'?null:window);
