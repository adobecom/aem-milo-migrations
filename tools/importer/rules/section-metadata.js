import { getNSiblingsElements } from './utils.js';



export function parseThreeUpLayoutsSectionMetadataGeneric(el, document, section) {
  const els = getNSiblingsElements(el, (n) => n >= 3);

  const blocks = els.map(element => {
    return WebImporter.DOMUtils.createTable([
      ['text'],
      [element],
    ], document);
  });

  const sectionMetadataEl = buildSectionMetadataLayoutGeneric(blocks, {
    style: 'XL spacing, three up, grid-width-12',
  }, document);

  // look for possible title and text before the "columns" elements
  const beforeLayoutText = el.querySelector('.title, .text');
  if (beforeLayoutText) {
    sectionMetadataEl.prepend(WebImporter.DOMUtils.createTable([
      ['text (center, xs spacing)'],
      [beforeLayoutText.parentElement],
    ], document));
  }

  return sectionMetadataEl;
}

export function parseTwoUpLayoutsSectionMetadata(el, document, section) {
  let els = getNSiblingsElements(el, (n) => n >= 2);

  if (els.length === 2 && els[1].textContent.replaceAll('\n','').trim().length < 100) {
    els = getNSiblingsElements(els[0], (n) => n >= 2);
  }

  const blocks = els.map(element => {
    return WebImporter.DOMUtils.createTable([
      ['text'],
      [element],
    ], document);
  });

  return buildSectionMetadataLayoutGeneric(blocks, {
    style: 'XL spacing, two up, grid-width-12',
  }, document);
}



export function parseTwoUpSectionMetadataWithTreeview(el, document, section) {
  const els = getNSiblingsElements(el, 2);
  
  const blocks = els.map((el) => {
    let block = 'text';
    const treeview = el.querySelector('.treeview');
    if (treeview) {
      block = 'tree-view';
      console.log(el.outerHTML);
      treeview.querySelectorAll('input').forEach((input) => {
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
    style: 'two-up, grid-template-columns-1-3, l spacing',
  }, document);
}



export function buildSectionMetadataLayoutGeneric(els, options, document) {
  const container = document.createElement('div');

  container.append(document.createElement('hr'));

  // add the elements
  els.forEach((e) => container.append(e));

  const cells = [
    ['Section Metadata'],
  ];

  if (options) {
    Object.keys(options).forEach((key) => {
      cells.push([key, options[key]]);
    });
  }

  container.append(WebImporter.DOMUtils.createTable(cells, document));

  container.append(document.createElement('hr'));

  return container;
}
