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

const BACOM_PRODUCTS_FRAGMENT_URL_RELATED_CONTENT = 'https://main--bacom--adobecom.hlx.page/fragments/resources/recommended/template-a-recommended';
const BACOM_PRODUCTS_FRAGMENT_URL_REQUEST_DEMO = 'https://main--bacom--adobecom.hlx.page/fragments/products/request-demo';

export async function parseFragment_products_related_content_cards(el, document, section) {
  const fragment = document.createElement('div');
  const a = document.createElement('a');
  a.href = BACOM_PRODUCTS_FRAGMENT_URL_RELATED_CONTENT;
  a.innerHTML = BACOM_PRODUCTS_FRAGMENT_URL_RELATED_CONTENT;
  a.textContent = BACOM_PRODUCTS_FRAGMENT_URL_RELATED_CONTENT;
  fragment.append(a);

  return fragment;
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

