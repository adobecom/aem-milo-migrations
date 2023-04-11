import { flattenDomStructure, getNSiblingsElements } from "./utils.js";

export function parseAccordion(el, document, section) {
  // strategy 1 - generic
  let items = getNSiblingsElements(el, (n) => n > 2);

  // strategy 2 - spectrum
  if (!items) {
    items = el.querySelectorAll('.spectrum-Accordion-item');
  }

  const cells = [['accordion']];
  items.forEach((item) => {
    const title = item.children[0]?.textContent || '';
    flattenDomStructure(item.children[1]);// || '';
    cells.push([title]);
    cells.push([item.children[1]]);
  });

  return WebImporter.DOMUtils.createTable(cells, document);
}
