
import { rgbToHex } from "../utils.js";

/* global WebImporter */
export function parseAside(el, document, section) {
  const cells = [['aside (inline, xl spacing)']];

  // background color or background image
  const bgImage = el.querySelector('div[style]')?.getAttribute('style').split('"')[1];
  let bgcolor = el.querySelector('div[data-bgcolor]')?.getAttribute('data-bgcolor');

  // strategy 2
  if (!bgImage && !bgcolor) {
    el.querySelectorAll('div').forEach(d => {
      console.log(document.defaultView.getComputedStyle(d).getPropertyValue('background-color'));
      const bg = document.defaultView.getComputedStyle(d).getPropertyValue('background-color');
      if (bg != '') {
        bgcolor = rgbToHex(bg);
      }
    });
  }

  const c = [bgImage || bgcolor || ' '];
  console.log(c);
  cells.push(c);

  // content
  const imageContainer = el.querySelector('.image');
  const image = imageContainer.querySelector('img') || '';
  const content = imageContainer.nextElementSibling || '';
  cells.push([image, content]);

  const table = WebImporter.DOMUtils.createTable(cells, document);
  return table;
  // table.classList.add('import-table');
  // el.before(document.createElement('hr'));
  // el.replaceWith(table);
}
