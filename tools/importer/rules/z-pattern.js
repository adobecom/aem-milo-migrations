import { getNSiblingsElements } from './utils.js';

export async function parseZPattern(el, document, sectionsEls) {
  let sections = sectionsEls;

  const cells = [
    ['z-pattern'],
  ];
  
  let titleEl = null;

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
    return s.textContent.replaceAll('\n', '').trim() !== '' ? true : s.querySelector('.horizontalRule') === null;
  });

  const rowEls = sections.map(section => {
    // remove horizontal rule elements
    section.querySelectorAll('.horizontalRule').forEach((hr) => hr.remove());

    const rowTitle = section.querySelector('.title, .text');
    if (titleEl && rowTitle && rowTitle.textContent === titleEl.textContent) {
      titleEl = null;
    }

    const rowEls = getNSiblingsElements(section, (c) => c >= 2);
    return rowEls[0].querySelector('img') ? rowEls : rowEls.reverse();
  });

  if (titleEl) {
    cells.push([titleEl]);
  }

  cells.push(...rowEls);

  return WebImporter.DOMUtils.createTable(cells, document);
}
