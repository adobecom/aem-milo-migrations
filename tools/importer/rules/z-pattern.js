
export async function parseZPattern(el, document, sections) {
  const cells = [
    ['z-pattern'],
  ];

  const titleEl = sections[0].querySelector('.title, .text');
  if (titleEl) {
    cells.push([titleEl]);
  }

  sections.forEach(section => {
    const textEls = section.querySelectorAll('.text');
    const textEl = textEls[textEls.length - 1];
    const imgEl = section.querySelector('.image img');
    cells.push([imgEl, textEl]);
  });

  return WebImporter.DOMUtils.createTable(cells, document);
}