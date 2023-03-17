import { getBGColor, getNSiblingsElements } from './utils.js';
import { buildSectionMetadataLayoutGeneric } from './section-metadata.js';



export function parse_seeWhatMakesItWork_Section(el, document, section) {
  // return document.createElement('div');
  const els = getNSiblingsElements(el, 4);

  const blocks = els.filter((el) => {
    return !el.querySelector('.title');
  });

  blocks.forEach((el, idx) => {
    if (!el.querySelector('img')) {
      blocks[idx] = WebImporter.DOMUtils.createTable([
        ['text'],
        [el],
      ], document);
    }
  });

  const title = document.createElement('h3');
  title.textContent = 'See what makes it work';

  const container = document.createElement('div');

  container.append(title);

  const smOptions = {
    style: 'XL spacing, three up, grid-width-12',
  }

  const bgColor = getBGColor(el, document);
  if (bgColor) {
    smOptions.background = bgColor;
  }

  container.append(buildSectionMetadataLayoutGeneric(blocks, smOptions, document));

  return container;
}
