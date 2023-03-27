import { getBGColor, getNSiblingsElements } from './utils.js';
import { buildSectionMetadata, buildSectionMetadataLayoutGeneric } from './section-metadata.js';



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
  const els = getNSiblingsElements(el, 2);
  
  const blocks = els.map((el) => {
    let block = 'text';
    const treeview = el.querySelector('.treeview');
    if (treeview) {
      block = 'tree-view';
      console.log(el.outerHTML);
      treeview.querySelectorAll('input, label.on').forEach((input) => {
        input.remove();
      });
      el = treeview;
    }
    return WebImporter.DOMUtils.createTable([
      [block],
      [el],
    ], document);
  });
  
  return buildSectionMetadataLayoutGeneric(blocks, {
    style: 'XXL spacing, two up, grid-width-12, xxxl-gap',
    background: '#f5f5f5',
    layout: '1 | 3',
  }, document);
}
