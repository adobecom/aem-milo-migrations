// import { rgbToHex } from "../utils.js";
import { getBGColor, getNSiblingsElements } from './utils.js';
// import { parseText } from './text.js';

export function parseMedia(el, document, section) {
  const container = document.createElement('div');
  container.append(document.createElement('hr'));

  let els = getNSiblingsElements(el, (c) => c >= 2);

  console.log(els);

  // get image
  let imgIdx = -1;
  let imgEl = null;
  for (var i = 0; i < els.length; i++) {
    const el = els[i];
    const img = el.querySelector('img');
    if (img) {
      imgEl = img;
      imgIdx = i;
    }
  }

  // detect title text before media section
  if (imgIdx > 0 && imgIdx < els.length - 1) {
    for (var i = 0; i < imgIdx; i++) {
      container.append(els[i]);
    }
  }

  // get text
  const textEls = document.createElement('div');
  const minTextIdx = imgIdx === els.length - 1 ? 0 : imgIdx + 1;
  const maxTextIdx = imgIdx === els.length - 1 ? els.length - 2 : els.length - 1;
  for (var i = minTextIdx; i <= maxTextIdx; i++) {
    textEls.append(els[i]);
  }

  const mediaEls = [imgEl, textEls];

  // if (els) {
  //   const header = els.shift();
  //   container.append(parseText(header, document, section));
  // } else {
  //   els = getNSiblingsElements(el, 2);
  // }

  const cells = [ ['media (large, light)'] ];

  const bgColor = getBGColor(el, document);
  if (bgColor) {
    cells.push([bgColor]);
  }
  cells.push(imgIdx === els.length - 1 ? mediaEls.reverse() : mediaEls);

  container.append(WebImporter.DOMUtils.createTable(cells, document));

  container.append(WebImporter.DOMUtils.createTable([
    ['Section Metadata'],
    ['style', 'l spacing'],
  ], document));

  container.append(document.createElement('hr'));

  return container;
}
