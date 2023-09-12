import { parseAside } from './aside.js';
import { buildSectionMetadataLayoutGeneric } from './section-metadata.js';
import { getNSiblingsElements } from './utils.js';

export async function parseBacomProductsPageTemplateKMultiBlocksSection(el, document, section) {
  const container = document.createElement('div');

  // get section "rows"
  let els = getNSiblingsElements(el, (n) => n > 4);

  // remove spacer elements
  els = els.filter((e) => !e.classList.contains('dexter-Spacer'));

  els.forEach(e => {
    // simple title text
    if (e.classList.contains('title')) {
      container.append(WebImporter.DOMUtils.createTable([
        ['text (center)'],
        [e.innerHTML],
      ], document));
    // aside block
    } else if (e.querySelectorAll('img').length === 1) {
      container.append(parseAside(e, document));
    // 2 or 3 up cards blocks
    } else {
      const sectionType = e.querySelectorAll('img').length === 2 ? '2-up' : '3-up';
      const cardsEls = getNSiblingsElements(e, (n) => n >= 2);
      const cardsBlocks = cardsEls.map(card => {
        const cells = [
          ['card (border)'],
        ];
        card.querySelector('.text').remove();
        cells.push([card.innerHTML]);
        return WebImporter.DOMUtils.createTable(cells, document);
      });

      const layoutEl = buildSectionMetadataLayoutGeneric(cardsBlocks, {
        style: `xxl-spacing, ${sectionType}`,
      }, document);

      container.append(layoutEl);
    }
  });

  return container;
}