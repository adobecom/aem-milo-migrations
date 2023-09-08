
import { isLightColor, rgbToHex } from "../utils.js";
import { extractBackground } from "./bacom.js";
import { crawlColorFromCSS } from "./utils.js";

/* global WebImporter */

const DEFAULT_ASIDE_PARSER_OPTIONS = {
  style: 'medium',
};

export function parseAside(el, document, section, options = {}) {
  const block = parseAsideGeneric(el, document, section, options);
  return { block };
}

export function parseAsideInline(el, document, section, options = {}) {
  const opts = {
    ...DEFAULT_ASIDE_PARSER_OPTIONS,
    ...options,
    ...{ style: 'inline' },
  };
  const block = parseAsideGeneric(el, document, section, opts);
  return { block };
}

export function parseAsideNotificationCenter(el, document, section, options = {}) {
  const opts = {
    ...DEFAULT_ASIDE_PARSER_OPTIONS,
    ...options,
    ...{ style: 'notification, medium, center' },
  };
  const block = parseAsideGeneric(el, document, section, opts);
  return { block };
}

/**
 * 
 * @param {HTMLElement} el original dom element
 * @param {Document} document original page document
 * @param {Object} section section-mapping json object
 * @param {Object} options extra options for the parser 
 * @returns {HTMLElement}
 * 
 * options: {
 *  style: string representing extra styles added to the block header // default: medium
 *  theme: light | dark,
 * }
 */
export function parseAsideGeneric(el, document, section, options = {}) {

  const opts = {
    ...DEFAULT_ASIDE_PARSER_OPTIONS,
    ...options,
  };

  /**
   * theme
   */

  let theme = 'light'; // default, dark color + light background
  if (opts.theme) {
    theme = opts.theme;
  } else {
    const fontColor = crawlColorFromCSS(el, document);
    if (fontColor) {
      if (isLightColor(fontColor)) {
        theme = 'dark'; // default, light color + dark background
      }
    }
  }

  const cells = [[`aside (${theme}, ${opts.style}, xl spacing)`]];

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



