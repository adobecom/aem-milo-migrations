
import { isLightColor, rgbToHex } from "../utils.js";
import { extractBackground } from "./bacom.js";
import { crawlColorFromCSS } from "./utils.js";

/* global WebImporter */

export function parseAside(el, document, section) {
  return parseAsideGeneric(el, document, section);
}

export function parseAsideInline(el, document, section) {
  return parseAsideGeneric(el, document, section, 'inline');
}

export function parseAsideNotificationCenter(el, document, section) {
  return parseAsideGeneric(el, document, section, 'notification, medium, center');
}

export function parseAsideGeneric(el, document, section, type = 'medium') {
  /*
   * theme
   */

  let theme = 'light'; // default, dark color + light background
  const fontColor = crawlColorFromCSS(el, document);
  if (fontColor) {
    if (isLightColor(fontColor)) {
      theme = 'dark'; // default, light color + dark background
    }
  }

  const cells = [[`aside (${theme}, ${type}, xl spacing)`]];

  // background color or background image
  let bgImage = el.querySelector('div[style]')?.getAttribute('style').split('"')[1];
  if (bgImage) {
    const img = document.createElement('img');
    img.src = bgImage;
    bgImage = img;
  }
  const bg = extractBackground(el, document);
  if (bg !== '') {
    cells.push([bg]);
  }

  // content
  const imageContainer = el.querySelector('.image');
  if (imageContainer) {
    const image = imageContainer.querySelector('img') || '';
    const content = imageContainer.nextElementSibling || '';
    cells.push([image, content]);
  } else {
    cells.push([el.innerHTML]);
  }

  const table = WebImporter.DOMUtils.createTable(cells, document);

  return table;
}



