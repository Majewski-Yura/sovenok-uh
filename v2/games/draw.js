(() => {
'use strict';
const root=window.TopouhGames ||= [];
const NS='http://www.w3.org/2000/svg';
const glyphs={
 leaf:'<path fill="#60a878" d="M8 35C6 19 17 10 35 8c.6 18-11 30-24 29Z"/><path d="M8 38 29 15M17 27v-7m3 4 7-.5" fill="none" stroke="#2f7055" stroke-width="2" stroke-linecap="round"/>',
 moon:'<path fill="#705bb8" d="M31 8A16 16 0 1 0 38 32 16.8 16.8 0 0 1 31 8Z"/><path fill="#eeb76b" d="M36 6l1.2 4.2 4 .8-3.2 2.4.5 4.3-3.5-2.5-3.7 2.1.7-4.1-3-2.8 4.2-.6Z"/>',
 cloud:'<path fill="#80b7d1" d="M11 31a6 6 0 0 1 0-12 9 9 0 0 1 16-3 7 7 0 1 1 5 15Z"/><path d="M14 25h13" fill="none" stroke="#e9f6fd" stroke-width="2" stroke-linecap="round"/>',
 flower:'<g fill="#e68ca1"><ellipse cx="22" cy="14" rx="5" ry="7"/><ellipse cx="22" cy="29" rx="5" ry="7"/><ellipse cx="15" cy="22" rx="7" ry="5"/><ellipse cx="29" cy="22" rx="7" ry="5"/></g><circle cx="22" cy="22" r="4.3" fill="#f5c169"/>',
 star:'<path fill="#e59349" d="m22 5 4.6 11.2 12.2 1-9.3 7.7 2.8 11.9L22 30.2l-10.4 6.6 2.8-11.9-9.3-7.7 12.2-1z"/><path d="m20 21 2 2 3-4" fill="none" stroke="#fff2d7" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>',
 berry:'<path fill="#ce6881" d="M22 13c-17-7-18 8-13 15 4 6 11 13 13 13s9-7 13-13c5-7 4-22-13-15Z"/><path fill="#619f71" d="M22 17c-1-4-5-7-10-8 4-3 8-3 11 2 4-5 8-3 11 0-5 0-8 3-12 6Z"/><path d="M14 21l1 1m7 5 1 1m6-7 1 1m-9 10 1 1" stroke="#ffe0a5" stroke-width="2.2" stroke-linecap="round"/>'
};
const names={leaf:'Листик',moon:'Месяц',cloud:'Облако',flower:'Цветок',star:'Звезда',berry:'Ягода'};
const ink=[['#fbf1d9','Светлый'],['#55917d','Мятный'],['#cb7b94','Ягодный'],['#7b76b1','Сиреневый']];
function element(tag,cls,content){const e=document.createElement(tag);if(cls)e.className=cls;if(content)e.textContent=content;return e}
function icon(k){const e=document.createElementNS(NS,'svg');e.setAttribute('viewBox','0 0 44 44');e.setAttribute('aria-hidden','true');e.innerHTML=glyphs[k];return e}
function setup(p,title,intro) {
 const panel=element('div','tg-draw');
 const styles=element('style');styles.textContent='.tg-draw{--dg-ink:#243447;--dg-soft:#48605c;--dg-cell:clamp(33px,8vw,46px);color:var(--dg-ink);font:inherit;display:grid;gap:12px;padding:12px;border-radius:15px;background:#f5f7ef}.tg-draw h3,.tg-draw p{margin:0}.tg-draw p{color:var(--dg-soft)}.tg-draw .dg-tools,.tg-draw .dg-actions,.tg-draw .dg-row,.tg-draw .dg-split{display:flex;flex-wrap:wrap;gap:7px;align-items:center}.tg-draw button{box-sizing:border-box;min-height:44px;min-width:44px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1px solid #b8c8b4;border-radius:8px;background:#fff;color:var(--dg-ink);font:inherit;font-weight:700;cursor:pointer;padding:6px 10px}.tg-draw button:focus-visible{outline:3px solid #584587;outline-offset:2px;z-index:1}.tg-draw button[aria-pressed=true]{outline:2px solid #5a4783;outline-offset:1px;background:#f0e9fb}.tg-draw button:disabled{opacity:.65;cursor:default}.tg-draw button.dg-primary{color:#fff;background:#49695c;border-color:#49695c}.tg-draw .dg-status{min-height:1.55em;font-weight:700}.tg-draw .dg-board{display:grid;gap:4px;width:max-content;max-width:100%;background:#e8e9d8;border:1px solid #ccd6c2;border-radius:11px;padding:6px}.tg-draw .dg-cell{height:46px;width:var(--dg-cell);min-width:0;min-height:0;display:grid;place-items:center;padding:0;border-radius:6px;border:1px solid #aab7ac}.tg-draw .dg-lock{display:grid;place-items:center;border-radius:4px;border:1px solid #9ca99e}.tg-draw .dg-mid{border-left:2px dashed #7a8c83}.tg-draw .dg-dot{background:var(--color);width:14px;height:14px;display:inline-block;border:1px solid #667970;border-radius:50%}.tg-draw svg{display:block;width:31px;height:31px}.tg-draw .dg-slot{display:grid;place-items:center;width:55px;height:55px;border:2px dashed #acbda9;border-radius:11px;background:#fffaf0}.tg-draw .dg-pattern{border-radius:11px;background:#e5ebda;border:1px solid #d0dbc6;padding:8px;display:flex;flex-wrap:wrap;gap:7px;align-items:center}.tg-draw .dg-garden .dg-cell{height:49px;width:53px;background:#e0ecd8}.tg-draw .dg-garden .dg-cell:nth-child(2n){background:#edf0d9}.tg-draw .dg-garden .dg-cell svg{width:35px;height:35px}.tg-draw .dg-garden{background:#d6e4cc}.tg-draw .dg-split{gap:16px;align-items:flex-start}.tg-draw .dg-small{font-size:.89em}';
 panel.append(styles,element('h3','',title),element('p','',intro));p.append(panel);
 const feedback=element('p','dg-status');feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
 return {panel,feedback};
}
function button(text,action,cls){const b=element('button',cls,text);b.type='button';b.addEventListener('click',action);return b}
function selectMark(group,i){[...group.children].forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)))}
function safeR(ctx){return typeof ctx.rng==='function'?ctx.rng():.25}
function gameMirror(p,ctx) {
 const {panel,feedback}=setup(p,'Дорисуй отражение','Слева узор Ух. Выбери цвет и дорисуй правую половинку как в зеркале.');
 const variations=[[2,1,0,1,3,2,2,0,3],[1,2,0,2,3,1,3,1,2],[3,2,1,1,0,3,2,3,0]];
 const pattern=variations[Math.floor(safeR(ctx)*variations.length)];
 const target=[pattern[2],pattern[1],pattern[0],pattern[5],pattern[4],pattern[3],pattern[8],pattern[7],pattern[6]];
 let cur=1,done=false;const state=Array(9).fill(null),cells=[];const tools=element('div','dg-tools'),board=element('div','dg-board'),check=element('div','dg-actions');
 board.style.gridTemplateColumns='repeat(3,var(--dg-cell)) 10px repeat(3,var(--dg-cell))';
 board.setAttribute('aria-label','Узор слева, клетки для отражения справа');
 ink.forEach(([color,label],i)=>{const b=button(label,()=>{cur=i;selectMark(tools,i)});const sw=element('i','dg-dot');sw.style.setProperty('--color',color);sw.setAttribute('aria-hidden','true');b.prepend(sw);tools.append(b)});
 selectMark(tools,cur);
 for(let y=0;y<3;y++){for(let x=0;x<3;x++){let shade=pattern[y*3+x];const e=element('div','dg-lock');e.style.background=ink[shade][0];e.setAttribute('role','img');e.setAttribute('aria-label',`Образец, ряд ${y+1}, клетка ${x+1}: ${ink[shade][1]}`);board.append(e)}
 let divider=element('span','dg-mid');divider.setAttribute('aria-hidden','true');board.append(divider);
 for(let x=0;x<3;x++){let pos=y*3+x;const b=button('·',()=>{if(done)return;state[pos]=cur;paint(pos);say('');},'dg-cell');cells.push(b);board.append(b);paint(pos)}}
 function paint(i){const v=state[i],b=cells[i];b.style.background=v===null?'#ffffff':ink[v][0];b.textContent=v===null?'·':'';b.setAttribute('aria-label',`Отражение, ряд ${Math.floor(i/3)+1}, клетка ${i%3+1}: ${v===null?'пусто':ink[v][1]}`)}
 function say(s){feedback.textContent=s}
 const reset=button('Очистить',()=>{state.fill(null);cells.forEach((_,i)=>paint(i));say('Клетки снова пустые.')});
 const submit=button('Сравнить',()=>{if(done)return;if(state.includes(null)){say('Ещё остались пустые клетки.');return}const bad=state.findIndex((x,i)=>x!==target[i]);if(bad!==-1){say('Посмотри на ряд '+(Math.floor(bad/3)+1)+': цвет рядом с линией должен остаться рядом с ней.');cells[bad].focus();return}done=true;reset.disabled=true;submit.disabled=true;for(const b of [...tools.children,...cells])b.disabled=true;say('Теперь половинки отражают друг друга!');ctx.finish('Ух увидела узор в зеркале!')},'dg-primary');
 check.append(submit,reset);panel.append(tools,board,feedback,check);
}
function gameGarden(p,ctx) {
 const {panel,feedback}=setup(p,'Сад из штампов','Выбери штамп и поставь его на любую клетку. Собери открытку из трёх разных штампов.');
 const picks=['flower','leaf','berry','cloud','star'];
 const shift=Math.floor(safeR(ctx)*picks.length);picks.push(...picks.splice(0,shift));
 const states=Array(12).fill('');const tools=element('div','dg-tools'),board=element('div','dg-board dg-garden'),check=element('div','dg-actions');
 board.style.gridTemplateColumns='repeat(4,53px)';const cells=[];let cur=picks[0],done=false;
 picks.forEach((k,i)=>{const b=button(names[k],()=>{cur=k;selectMark(tools,i)});b.prepend(icon(k));tools.append(b)});
 tools.append(button('Ластик',()=>{cur='';selectMark(tools,picks.length)}));selectMark(tools,0);
 for(let i=0;i<states.length;i++){
  const b=button('·',()=>{if(done)return;const n=states[i];states[i]=cur;if(n!==cur)paint(i);const varieties=new Set(states.filter(Boolean)).size;feedback.textContent=varieties>=3?'Есть три разных штампа. Можно закончить или украсить ещё!':'Разных штампов на открытке: '+varieties+' из 3.'},'dg-cell');
  cells.push(b);board.append(b);paint(i);
 }
 function paint(i){const v=states[i],b=cells[i];b.replaceChildren(...(v?[icon(v)]:[document.createTextNode('·')]));b.setAttribute('aria-label',`Ряд ${Math.floor(i/4)+1}, клетка ${i%4+1}: ${v?names[v]:'пусто'}`)}
 const submit=button('Готово',()=>{if(done)return;if(new Set(states.filter(Boolean)).size<3){feedback.textContent='Поставь ещё один штамп, которого нет на открытке.';return}done=true;submit.disabled=true;for(const b of [...tools.children,...cells])b.disabled=true;feedback.textContent='Открытка готова.';ctx.finish('Ух забрала открытку в свой сад!')},'dg-primary');
 check.append(submit);panel.append(tools,board,feedback,check);
}
function gamePatch(p,ctx) {
 const {panel,feedback}=setup(p,'Нашивка для Ух','Посмотри на порядок трёх значков. Выбери значок, а потом пустое место на нашивке.');
 const frames=[['moon','cloud','star'],['berry','flower','leaf'],['star','leaf','moon'],['cloud','berry','flower']];
 const target=frames[Math.floor(safeR(ctx)*frames.length)];const choices=['leaf','moon','cloud','flower','star','berry'];
 const tools=element('div','dg-tools'),split=element('div','dg-split'),check=element('div','dg-actions');
 const model=element('div','dg-pattern'),strip=element('div','dg-pattern');
 model.setAttribute('aria-label','Образец слева направо: '+target.map(k=>names[k]).join(', '));
 strip.setAttribute('aria-label','Нашивка, три места слева направо');
 const m=element('div'),s=element('div');m.append(element('p','dg-small','Образец'),model);s.append(element('p','dg-small','Нашивка'),strip);split.append(m,s);
 let cur=choices[0],done=false;const slots=['','',''];
 target.forEach(k=>{const h=element('div','dg-slot');h.append(icon(k));model.append(h)});
 choices.forEach((k,i)=>{const b=button(names[k],()=>{cur=k;selectMark(tools,i)});b.prepend(icon(k));tools.append(b)});selectMark(tools,0);
 const place=slots.map((_,i)=>{const b=button(String(i+1),()=>{if(done)return;slots[i]=cur;b.replaceChildren(icon(cur));b.setAttribute('aria-label','Место '+(i+1)+': '+names[cur]);feedback.textContent=''},'dg-slot');b.setAttribute('aria-label','Место '+(i+1)+': пусто');strip.append(b);return b});
 const submit=button('Сравнить',()=>{if(done)return;const i=target.findIndex((k,j)=>k!==slots[j]);if(i!==-1){feedback.textContent='Проверь место '+(i+1)+'. В образце там: '+names[target[i]].toLowerCase()+'.';place[i].focus();return}done=true;submit.disabled=true;for(const b of [...tools.children,...place])b.disabled=true;feedback.textContent='Порядок совпал!';ctx.finish('Ух примерила новую нашивку!')},'dg-primary');
 check.append(submit);panel.append(split,tools,feedback,check);
}
root.push(...[
 {id:'mirror-mosaic',title:'Дорисуй отражение',category:'draw',accent:'#d9e8db',description:'Узор по ту сторону зеркала.',mount:gameMirror},
 {id:'stamp-garden',title:'Сад из штампов',category:'draw',accent:'#dfeacd',description:'Своя открытка из листьев и цветов.',mount:gameGarden},
 {id:'owl-patch',title:'Нашивка для Ух',category:'draw',accent:'#eadff1',description:'Три значка в нужном порядке.',mount:gamePatch}
]);
})();
