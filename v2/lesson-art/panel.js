(() => {
  'use strict';
  const titleMap = window.TopouhStoryTitles;
  const find = (lesson, index) => {
    const key = lesson + '-' + (index + 1);
    return Object.hasOwn(titleMap ?? {}, key) ? {key, title:titleMap[key]} : null;
  };
  const figure = (ref, inline = false) => {
    const element = document.createElement('figure');
    element.className = 'task-story' + (inline ? ' task-story-inline' : '');
    element.dataset.story = ref.key;
    const image = document.createElement('img');
    image.alt = ref.title;
    image.width=640;
    image.height=380;
    image.decoding='async';
    image.addEventListener('error', () => {element.hidden = true}, {once:true});
    image.src = 'lesson-art/scenes/' + ref.key + '.svg?v=paired-eyes';
    element.append(image);
    return element;
  };
  window.TopouhTaskStory = Object.freeze({find, figure});
})();
