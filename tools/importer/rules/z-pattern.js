import { getNSiblingsElements } from './utils.js';

export async function parseZPattern(el, document, sectionsEls) {
  let sections = sectionsEls;

  const cells = [
    ['z-pattern'],
  ];
  
  let titleEl = null;

  sections.forEach((s) => {
    s.querySelectorAll('style, .dexter-Spacer').forEach((style) => style.remove());
  });

  if (sections.length === 1) {
    sections = getNSiblingsElements(sections[0], (n) => n >= 2);
    
    if (!sections[0].querySelector('img')) {
      titleEl = sections.shift().querySelector('.title, .text');
    }
  } else {
    titleEl = sections[0].querySelector('.title, .text');
  }

  // remove potential horizontal rule sub sections
  sections = sections.filter((s) => {
    // remove style elements
    s.querySelectorAll('style, .dexter-Spacer').forEach((style) => style.remove());
    return s.textContent.replaceAll('\n', '').trim() !== '' ? true : s.querySelector('.horizontalRule') === null;
  });

  let rowEls = sections.map(section => {
    // remove horizontal rule elements
    section.querySelectorAll('.horizontalRule').forEach((hr) => hr.remove());

    const rowTitle = section.querySelector('.title, .text');
    if (titleEl && rowTitle && rowTitle.textContent === titleEl.textContent) {
      titleEl = null;
    }

    const rowEls = getNSiblingsElements(section, (c) => c >= 2);
    if(!rowEls) {
      return null
    }
    return rowEls[0].querySelector('img') ? rowEls : rowEls.reverse();
  }).filter(item => item)

  if (titleEl) {
    cells.push([titleEl]);
  }

  cells.push(...rowEls);

  return WebImporter.DOMUtils.createTable(cells, document);
}
