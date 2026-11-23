(function () {
 'use strict';
 const figures = [
  ['circle', 'Круг'], ['triangle', 'Треугольник'], ['circle', 'Круг'],
  ['square', 'Квадрат'], ['circle', 'Круг'], ['triangle', 'Треугольник'],
  ['circle', 'Круг']
 ];
 const svgNS = 'http://www.w3.org/2000/svg';
 const make = (tag, cls, text) => {
  const element = document.createElement(tag);
  if (cls) element.className = cls;
  if (text) element.textContent = text;
  return element;
 };
 function mark(shape) {
  const pictogram = document.createElementNS(svgNS, 'svg');
  pictogram.setAttribute('viewBox', '0 0 32 32');
  pictogram.setAttribute('aria-hidden', 'true');
  pictogram.setAttribute('focusable', 'false');
  const node = document.createElementNS(svgNS, shape === 'circle' ? 'circle' : 'path');
  if (shape === 'circle') {
   node.setAttribute('cx', '16'); node.setAttribute('cy', '16'); node.setAttribute('r', '10');
  } else node.setAttribute('d', shape === 'triangle' ? 'M16 5 28 26H4z' : 'M6 6h20v20H6z');
  node.setAttribute('fill', {circle:'#90c7e5', triangle:'#f3bd76', square:'#baaaec'}[shape]);
  node.setAttribute('stroke', '#273952');
  node.setAttribute('stroke-width', '2');
  node.setAttribute('stroke-linejoin', 'round');
  pictogram.append(node);
  return pictogram;
 }
 window.TopouhLabJournal = function TopouhLabJournal(task, {onChange} = {}) {
  const chosen = new Set();
  let selected = -1;
  let disabled = false;
  let revealed = false;
  const element = make('section', 'lab-journal');
  element.setAttribute('aria-label', 'Журнал и полоска фигур');
  const entry = make('div', 'lab-journal__entry');
  entry.append(make('span', 'lab-journal__stamp', 'Журнал'), make('b', 'lab-journal__record', 'Записано: пять кругов'));
  const instruction = make('p', 'lab-journal__caption', 'Отмечай круги по одному слева направо. Затем выбери действие.');
  const strip = make('div', 'lab-journal__strip');
  strip.setAttribute('role', 'group');
  strip.setAttribute('aria-label', 'Полоска фигур слева направо');
  const status = make('p', 'lab-journal__status');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-atomic', 'true');
  const buttons = figures.map(([shape, name], index) => {
   const btn = make('button', 'lab-journal__chip');
   btn.setAttribute('type', 'button');
   btn.setAttribute('aria-label', name + ', позиция ' + (index + 1) + ' слева');
   btn.append(mark(shape), make('span', 'lab-journal__chip-number', String(index + 1)), make('span', 'lab-journal__selection', '✓'));
   btn.lastElementChild.setAttribute('aria-hidden', 'true');
   btn.addEventListener('click', () => {
    if (disabled) return;
    if (chosen.has(index)) chosen.delete(index);
    else chosen.add(index);
    paint();
    if (typeof onChange === 'function') onChange();
   });
   btn.addEventListener('keydown', event => {
    const x = event.key === 'ArrowLeft' ? index - 1 :
     event.key === 'ArrowRight' ? index + 1 : event.key === 'Home' ? 0 :
     event.key === 'End' ? figures.length - 1 : -1;
    if (!disabled && x >= 0 && x < figures.length) { event.preventDefault(); buttons[x].focus(); }
   });
   return btn;
  });
  const answers = make('div', 'lab-journal__answers');
  answers.setAttribute('role', 'group');
  answers.setAttribute('aria-label', 'Что сделать сначала?');
  const options = (task.items || task.visual.items).map(([label], index) => {
   const button = make('button', 'lab-journal__answer', label);
   button.type = 'button';
   button.addEventListener('click', () => {
    if (disabled) return;
    selected = index;
    paint();
    if (typeof onChange === 'function') onChange();
   });
   answers.append(button);
   return button;
  });
  const answer = Number.isInteger(task.answer) ? task.answer : task.visual.answer;
  function paint() {
   options.forEach((opt, index) => {
    opt.disabled = disabled;
    opt.setAttribute('aria-pressed', String(index === selected));
    opt.classList.toggle('lab-journal__answer--shown', revealed && index === answer);
   });
   buttons.forEach((btn, i) => {
    btn.setAttribute('aria-pressed', String(chosen.has(i)));
    btn.disabled = disabled;
    btn.classList.toggle('lab-journal__chip--shown', revealed && figures[i][0] === 'circle');
   });
   status.textContent = revealed ? 'Круги на полоске: позиции 1, 3, 5 и 7.' : chosen.size ? 'Отмечено фигур: ' + chosen.size + '.' : 'Пока ничего не отмечено.';
  }
  strip.append(...buttons);
  element.append(entry, instruction, strip, status, answers);
  paint();
  return {
   element,
   ready: () => chosen.size > 0 && selected >= 0,
   verify: () => selected === answer && figures.every(([shape], index) => chosen.has(index) === (shape === 'circle')),
   reset() { chosen.clear(); selected = -1; disabled = false; revealed = false; paint(); },
   lock() { disabled = true; paint(); },
   reveal() { disabled = true; revealed = true; paint(); },
   focus() { if (!disabled) buttons[0].focus({preventScroll: true}); }
  };
 };
}());
