import { getBGColor, getNSiblingsElements } from './utils.js';
import { buildSectionMetadata, buildSectionMetadataLayoutGeneric, parseSectionMetadataGenericCentered, parseThreeUpLayoutsSectionMetadataGeneric } from './section-metadata.js';
import { parseAccordion } from './accordion.js';
import { parseTreeView } from './tree-view.js';
import { parseTableGeneric } from './table.js';

export function parse_seeWhatMakesItWork_Section(el, document, section) {
  let title = 'See what makes it work';
  // Get existing title if exists
  const existingTitle = el.querySelector('h3');
  if (existingTitle) {
    title = existingTitle.textContent;
  }

  // // remove first title (should be the main "See what makes it work" title)
  // el.querySelector('.title').remove();

  let blocks = [];
  
  // get image first
  blocks.push(el.querySelector('img'));

  // return document.createElement('div');
  let els = getNSiblingsElements(el, (n) => n >= 3);

  if (!els) {
    els = getNSiblingsElements(el, (n) => n >= 2);
  }

  // blocks.push(...els.filter((el) => {
  //   return !el.querySelector('img') && !el.classList.contains('title');
  // }));

  // els = els.filter((el) => {
  //   return !el.querySelector('img') && !el.classList.contains('title');
  // });

  const textsCol1 = document.createElement('div');
  const textsCol2 = document.createElement('div');
  for (var i = 0; i < els.length; i += 2) {
    textsCol1.append(els[i]);
    if (els[i + 1]) {
      textsCol2.append(els[i + 1]);
    }
  }

  blocks.push(textsCol1);
  blocks.push(textsCol2);
  
  blocks.forEach((el, idx) => {
    if (!el.querySelector('img')) {
      el.querySelectorAll('.cmp-title, br, hr, style, script').forEach((e) => e.remove());
      el.querySelectorAll('span').forEach((e) => {
        const p = document.createElement('p');
        p.innerHTML = e.innerHTML;
        e.replaceWith(p);
      });
      
      blocks[idx] = WebImporter.DOMUtils.createTable([
        ['text'],
        [el],
      ], document);
    }
  });

  
  const container = document.createElement('div');

  // const title = document.createElement('h3');
  // title.textContent = title;
  // container.append(title);

  const smOptions = {
    style: 'XL spacing, three up, grid-width-12',
  }
  
  const bgColor = getBGColor(el, document);
  if (bgColor) {
    smOptions.background = bgColor;
  }
  
  // title element
  const titleEl = document.createElement('div');
  titleEl.append(document.createElement('hr'));
  titleEl.append(WebImporter.DOMUtils.createTable([
    ['text (center, xl-spacing-top)'],
    ['<h1>' + title + '</h1>'],
  ], document));
  titleEl.append(WebImporter.DOMUtils.createTable([
    ['section metadata'],
    ['background', bgColor],
  ], document));
  // titleEl.append(document.createElement('hr'));

  container.append(titleEl);

  container.append(buildSectionMetadataLayoutGeneric(blocks, smOptions, document));

  return { block: container };
}

const BACOM_PRODUCTS_FRAGMENT_URL_RELATED_CONTENT = 'https://main--bacom--adobecom.hlx.page/fragments/resources/recommended/template-a-recommended';
const BACOM_PRODUCTS_FRAGMENT_URL_REQUEST_DEMO = 'https://main--bacom--adobecom.hlx.page/fragments/products/request-demo';

export async function parseFragment_products_related_content_cards(el, document, section) {
  const container = document.createElement('div');
  container.append(document.createElement('hr'));

  const title = document.createElement('h3');
  title.textContent = 'Recommended for you';
  container.append(title);

  const a = document.createElement('a');
  a.href = BACOM_PRODUCTS_FRAGMENT_URL_RELATED_CONTENT;
  a.innerHTML = BACOM_PRODUCTS_FRAGMENT_URL_RELATED_CONTENT;
  a.textContent = BACOM_PRODUCTS_FRAGMENT_URL_RELATED_CONTENT;
  container.append(a);

  container.append(buildSectionMetadata({
    style: 'center',
  }, document));

  container.append(document.createElement('hr'));

  return { block: container };
}

export async function parseFragment_fragment_products_request_demo_marquee(el, document, section) {
  const fragment = document.createElement('div');
  const a = document.createElement('a');
  a.href = BACOM_PRODUCTS_FRAGMENT_URL_REQUEST_DEMO;
  a.innerHTML = BACOM_PRODUCTS_FRAGMENT_URL_REQUEST_DEMO;
  a.textContent = BACOM_PRODUCTS_FRAGMENT_URL_REQUEST_DEMO;
  fragment.append(a);

  return { block: fragment };
}


export function parseTwoUpSectionMetadataWithTreeview(el, document, section, options = { bgStrategy: 'default' }) {
  let els = getNSiblingsElements(el, (n) => n >= 2);
  const block = document.createElement('div');

  // remove all empty elements from els
  els = els.filter((el) => {
    return el.textContent.replaceAll(/\s+/gm, '').trim() !== '';
  });

  // there is an extra element in the list, consider it a title to add before the section
  if (els.length > 2) {
    block.append(els.shift());
  }

  const blocks = [];
  for (var i = 0; i < els.length; i += 1) {
    let el = els[i];

    let blockType = 'text';

    if (el.querySelector('.treeview, .treeView')) {
      const treeview = parseTreeView(el, document);
      blocks.push(treeview);
      continue;
    } else if (el.querySelector('.accordion')) {
      const accordion = parseAccordion(el, document);
      blocks.push(accordion);
      continue;
    }

    blocks.push(WebImporter.DOMUtils.createTable([
      [blockType],
      [el],
    ], document));
  }

  const smOptions = {
    style: 'XXL spacing, two up, grid-width-12, xxxl-gap',
    layout: '1 | 3',
  };

  if (options.bgStrategy != 'none') {
    smOptions.background = extractBackground(el, document);
  }

  block.append(buildSectionMetadataLayoutGeneric(blocks, smOptions, document));

  return { block };
}


export async function parse_marquee_with_treeview(el, document, section) {
  const container = document.createElement('div');
  container.append(document.createElement('hr'));

  /*
  * background
  */

  let background =  WebImporter.DOMUtils.getImgFromBackground(el, document)

  // strategy 2
  if (!background) {
    el.querySelectorAll('div').forEach(d => {
      const bg = document.defaultView.getComputedStyle(d).getPropertyValue('background-image');
      if (bg !== '') {
        background = WebImporter.DOMUtils.getImgFromBackground(d, document);
      }
    });
  }

  /*
  * tree-view
  */

  container.append(parseTreeView(el, document));

  /*
  * texts
  */

  const textElements = document.createElement('div');

  const title = el.querySelector('.title');
  if (title) {
    textElements.append(title);
  }

  const text = el.querySelector('.text');
  if (text) {
    textElements.append(text);
  }

  const cta = el.querySelector('.cta');
  if (cta) {
    const link = cta.querySelector('a');
    if (link.href.indexOf('#watch-now') < 0) {
      const str = document.createElement('B');
      str.append(cta);
      textElements.append(str); 
    }
  }
  container.append(textElements);

  /*
   * section metadata block with background image
   */

  const smOptions = {
    style: 'two up, grid-width-12, no-spacing',
    layout: '1 | 3',
  };

  if (background) {
    smOptions.background = background;
  }
  const sm = buildSectionMetadata(smOptions, document);
  container.append(sm);

  container.append(document.createElement('hr'));

  return { block: container };
}

const BACOM_ICONS_CSS_PATTERNS = [
  {
    selector: '.text-greenCheckmark',
    token: 'checkmark_green',
  }
];
const BACOM_ICONS_URL_MAPPING = [
  {
    pattern: /.*Smock_Checkmark_18_N_green\.svg$/i,
    token: 'checkmark-green',
  },
  {
    pattern: /.*icon-checkmark.*png/i,
    token: 'checkmark-blue',
  },
  {
    pattern: /.*icon-notincluded.*/i,
    token: 'not-included',
  },
  {
    pattern: /.*icon-dollarsign.*png/i,
    token: 'dollarsign',
  },
  {
    pattern: /.*icon-allfeatures\.svg$/i,
    token: 'all-features',
  },
  {
    pattern: /.*icon-somefeatures\.svg$/i,
    token: 'some-features',
  },  
  {
    pattern: /.*icon-contactsales\.svg$/i,
    token: 'contact-sales',
  },  
];

export function parseIcons(document) {
  let foundIcons = false;

  // check for url patterns
  BACOM_ICONS_URL_MAPPING.forEach((mapping) => {
    document.querySelectorAll('img').forEach((img) => {
      if (mapping.pattern.test(img.src)) {
        const tokenEl = document.createElement('span');
        tokenEl.textContent = `:${mapping.token}:`;
        img.replaceWith(tokenEl);
        foundIcons = true;
      }
    });
  });

  // check for css patterns
  BACOM_ICONS_CSS_PATTERNS.forEach((mapping) => {
    document.querySelectorAll(mapping.selector).forEach((el) => {
      const tokenEl = document.createElement('span');
      tokenEl.textContent = `:${mapping.token}:`;
      el.replaceWith(tokenEl);
      foundIcons = true;
    });
  });

  return foundIcons;
}

export async function parseMultipleComparisonTable(el, document, section) {
  const container = document.createElement('div');

  const elements = el.querySelectorAll('.title, table');

  let prevElType = '';

  for (var i = 0; i < elements.length; i += 1) {
    const el = elements[i];
    console.log(el.outerHTML);
    if (!el.parentElement.closest('table') && !el.closest('[data-hlx-imp-hidden-div]')) {
      if (el.classList.contains('title')) {
        container.append(el);
        prevElType = 'title';
      } else if (el.tagName === 'TABLE') {
        if (prevElType === 'table') {
          const table = await parseTableGeneric(el.parentElement, document);
          container.append(table);
        } else {
          const colspan = el.querySelector('tr').children.length;
          const blockHeaderEl = document.createElement('tr');
          blockHeaderEl.innerHTML = `<th colspan=${colspan}>comparison</th>`;
          el.querySelector('tr').before(blockHeaderEl);
          container.append(el);
        }
        prevElType = 'table';
      }

    }
  }

  return { block: container };
}


export async function parseSingleComparisonTable(el, document, section) {
  const block = document.createElement('div');

  // extract tables
  const table = el.querySelector('table');

  const colspan = table.querySelector('tr').children.length;
  const blockHeaderEl = document.createElement('tr');
  blockHeaderEl.innerHTML = `<th colspan=${colspan}>comparison</th>`;
  table.querySelector('tr').before(blockHeaderEl);
  block.append(table);

  // extract title
  const titleEl = el.querySelector('.title');
  if (titleEl && !titleEl.closest('table')) {
    block.prepend(titleEl);
  }

  // extract remaining content
  const sanitizedEl = el.cloneNode(true);
  sanitizedEl.querySelectorAll('style, script').forEach((e) => e.remove());
  if (sanitizedEl.textContent.replaceAll(/\s+/gm, '').trim() !== '') {
    block.append(sanitizedEl);
  }

  return { block };
}

// bacom-digital-trends-three-up-charts
export async function parseBacomDigitalTrendsThreeUpCharts(el, document, section) {
  const container = document.createElement('div');
  
  // clean-up
  el.querySelectorAll('[data-hlx-imp-hidden-div]').forEach((e) => e.remove());

  const rows = getNSiblingsElements(el, 3);

  // row 1 - three up charts
  const threeUpCharts = parseThreeUpLayoutsSectionMetadataGeneric(rows[0], document);

  // row 2 + 3 - centered texts
  rows[0].remove();
  const centeredTexts = parseSectionMetadataGenericCentered(el, document);

  container.append(threeUpCharts);
  container.append(centeredTexts);

  return { block: container };
}

const BG_EXTRACTION_STRATEGIES = {
  default: 'default',
  image: 'image',
  color: 'color',
};

/**
 * 
 * @param {HTMLElement} el original element
 * @param {Document} document original page document
 * @param {Object} options extra options for the function
 * @returns {string}
 */
export function extractBackground(el, document, options = {}) {

  const opts = {
    ...{ strategy: 'default', defaultBackground: '' },
    ...options,
  };

  console.log('extractBackground options:', opts);

  let background = null;
  
  // strategy 1
  if (options.strategy === BG_EXTRACTION_STRATEGIES.image || options.strategy === BG_EXTRACTION_STRATEGIES.default) {
    background = WebImporter.DOMUtils.getImgFromBackground(el, document);
    if (options.strategy === BG_EXTRACTION_STRATEGIES.image && background) {
      return background;
    }
  }

  
  // strategy 2
  if (!background) {
    if (options.strategy === BG_EXTRACTION_STRATEGIES.image || options.strategy === BG_EXTRACTION_STRATEGIES.default) {
      el.querySelectorAll('div').forEach(d => {
        // do not extract background image of a video
        if (!d.querySelector('video')) {
          const bg = document.defaultView.getComputedStyle(d).getPropertyValue('background-image');
          if (bg !== '' && !bg.includes('none')) {
            background = WebImporter.DOMUtils.getImgFromBackground(d, document);
          }
        }
      });
      if (options.strategy === BG_EXTRACTION_STRATEGIES.image && background) {
        return background;
      }
    }
  }
  
  // strategy 3 - use Helix Importer onLoad data marker 'data-hlx-background-image'
  if (!background) {
    const bgImage = el.querySelector('[data-hlx-background-image]')?.dataset?.hlxBackgroundImage;
    if (bgImage) {
      if (bgImage.trim().startsWith('url')) {
        const img = WebImporter.DOMUtils.getImgFromBackground(el.querySelector('[data-hlx-background-image]'), document);
        if (img) {
          background = img;
          if (options.strategy === BG_EXTRACTION_STRATEGIES.image && background) {
            return background;
          }
        }
      } else if (bgImage.trim().startsWith('linear-gradient')) {
        background = bgImage.trim();
        if (options.strategy === BG_EXTRACTION_STRATEGIES.color && background) {
          return background;
        }
          // let m;
        // if ((m = /(rgb\(\d+,\s*\d+,\s*\d+\))/.exec(bgImage)) !== null) {
        //   console.log('linear-gradient', m);
        //   background = rgbToHex(m[1]);
        // }
      }
    }
  }

  // strategy 4: get background color
  if (!background || (options.strategy === BG_EXTRACTION_STRATEGIES.color || options.strategy === BG_EXTRACTION_STRATEGIES.default)) {
    const bgColor = getBGColor(el, document);
    if (bgColor) {
      background = bgColor
      if (options.strategy === BG_EXTRACTION_STRATEGIES.color && background) {
        return background;
      }
    }
  }  

  // fallback: use default
  if (!background) {
    background = opts.defaultBackground;
  }

  return background;
}
