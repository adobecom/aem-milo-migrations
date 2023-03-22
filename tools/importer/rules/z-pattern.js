import { getNSiblingsElements } from './utils.js';

export async function parseZPattern(el, document, sectionsEls) {
  let sections = sectionsEls;

  const cells = [
    ['z-pattern'],
  ];

  if (sections.length === 1) {
    sections = getNSiblingsElements(sections[0], (n) => n >= 2);

    if (!sections[0].querySelector('img')) {
      const titleEl = sections.shift().querySelector('.title, .text');
      if (titleEl) {
        cells.push([titleEl]);
      }
    }
  } else {
    const titleEl = sections[0].querySelector('.title, .text');
    if (titleEl) {
      cells.push([titleEl]);
    }
  }

  sections.forEach(section => {
    const textEls = section.querySelectorAll('.text');
    const textEl = textEls[textEls.length - 1];
    const imgEl = section.querySelector('.image img');
    cells.push([imgEl, textEl]);
  });

  return WebImporter.DOMUtils.createTable(cells, document);
}
