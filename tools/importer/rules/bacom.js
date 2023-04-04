import { getBGColor, getNSiblingsElements } from './utils.js';
import { buildSectionMetadata, buildSectionMetadataLayoutGeneric } from './section-metadata.js';
import { parseAccordion } from './accordion.js';
import { parseTreeView } from './tree-view.js';
import { parseTableGeneric } from './table.js';



export function parse_seeWhatMakesItWork_Section(el, document, section) {
  const defaultTitle = 'See what makes it work';

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

  els = els.filter((el) => {
    return !el.querySelector('img') && !el.classList.contains('title');
  });

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
      blocks[idx] = WebImporter.DOMUtils.createTable([
        ['text'],
        [el],
      ], document);
    }
  });
    

  const title = document.createElement('h3');
  title.textContent = defaultTitle;

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

  return container;
}

export async function parseFragment_fragment_products_request_demo_marquee(el, document, section) {
  const fragment = document.createElement('div');
  const a = document.createElement('a');
  a.href = BACOM_PRODUCTS_FRAGMENT_URL_REQUEST_DEMO;
  a.innerHTML = BACOM_PRODUCTS_FRAGMENT_URL_REQUEST_DEMO;
  a.textContent = BACOM_PRODUCTS_FRAGMENT_URL_REQUEST_DEMO;
  fragment.append(a);

  return fragment;
}


export function parseTwoUpSectionMetadataWithTreeview(el, document, section) {
  let els = getNSiblingsElements(el, (n) => n >= 2);
  const container = document.createElement('div');

  // remove all empty elements from els
  els = els.filter((el) => {
    return el.textContent.replaceAll(/\s+/gm, '').trim() !== '';
  });

  // there is an extra element in the list, consider it a title to add before the section
  if (els.length > 2) {
    container.append(els.shift());
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

  container.append(buildSectionMetadataLayoutGeneric(blocks, {
    style: 'XXL spacing, two up, grid-width-12, xxxl-gap',
    background: '#f5f5f5',
    layout: '1 | 3',
  }, document));

  return container;
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

  return container;
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
    token: 'checkmark_green',
  },
  {
    pattern: /.*icon-notincluded.*/i,
    token: 'not_included',
  },
  {
    pattern: /.*icon-allfeatures\.svg$/i,
    token: 'all_features',
  },
  {
    pattern: /.*icon-somefeatures\.svg$/i,
    token: 'some_features',
  },  
  {
    pattern: /.*icon-contactsales\.svg$/i,
    token: 'contact_sales',
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
    if (!el.parentElement.closest('table')) {
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
          blockHeaderEl.innerHTML = `<th colspan=${colspan}>Comparison Table</th>`;
          el.querySelector('tr').before(blockHeaderEl);
          container.append(el);
        }
        prevElType = 'table';
      }

    }
  }

  return container;
}


export async function parseSingleComparisonTable(el, document, section) {
  const container = document.createElement('div');

  // extract tables
  const table = el.querySelector('table');

  const colspan = table.querySelector('tr').children.length;
  const blockHeaderEl = document.createElement('tr');
  blockHeaderEl.innerHTML = `<th colspan=${colspan}>Comparison Table</th>`;
  table.querySelector('tr').before(blockHeaderEl);
  container.append(table);

  // extract title
  const titleEl = el.querySelector('.title');
  if (titleEl && !titleEl.closest('table')) {
    container.prepend(titleEl);
  }

  // extract remaining content
  const sanitizedEl = el.cloneNode(true);
  sanitizedEl.querySelectorAll('style, script').forEach((e) => e.remove());
  if (sanitizedEl.textContent.replaceAll(/\s+/gm, '').trim() !== '') {
    container.append(sanitizedEl);
  }

  return container;
}
