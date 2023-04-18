import { parseAccordion } from './accordion.js';
import { parseTreeView } from './tree-view.js';
import { findImageFromCSS, getNSiblingsElements } from './utils.js';


export function parseThreeUpLayoutsSectionMetadataGeneric(el, document, section) {
  const els = getNSiblingsElements(el, (n) => n >= 3);

  const blocks = els.map(e => {
    if(!(e.querySelector('img') || findImageFromCSS(e, document))) {
      return null
    }
    const innerEl = getNSiblingsElements(e, (n) => n >= 2);
    if (innerEl && innerEl.length >= 2) {
      return innerEl.map(item => {
        const img = findImageFromCSS(item, document);
        if (img) {
          item.prepend(img);
        }
    
        return WebImporter.DOMUtils.createTable([
          ['text'],
          [item],
        ], document);
      })
    }
    const img = findImageFromCSS(e, document);
    if (img) {
      e.prepend(img);
    }

    return WebImporter.DOMUtils.createTable([
      ['text'],
      [e],
    ], document);
  }).filter(item => item).flat();

  const sectionMetadataEl = buildSectionMetadataLayoutGeneric(blocks, {
    style: 'XL spacing, three up, grid-width-12',
  }, document);

  // look for possible title and text before the "columns" elements
  let beforeLayoutText = el.querySelector('.title, .text');
  beforeLayoutText = beforeLayoutText || el.querySelector('.cmp-title');
  if (beforeLayoutText) {
    sectionMetadataEl.prepend(WebImporter.DOMUtils.createTable([
      ['text (center, xs spacing)'],
      [beforeLayoutText],
    ], document));
  }

  return sectionMetadataEl;
}

export function parseFourUpLayoutsSectionMetadataGeneric(el, document, section) {
  const els = getNSiblingsElements(el, (n) => n >= 4);

  const blocks = els.map(e => {
    const img = findImageFromCSS(e, document);
    if (img) {
      e.prepend(img);
    }

    return WebImporter.DOMUtils.createTable([
      ['text'],
      [e],
    ], document);
  });

  const sectionMetadataEl = buildSectionMetadataLayoutGeneric(blocks, {
    style: 'XL spacing, four up, grid-width-12',
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

  let titleLayoutEl = null;
  let isPost = false
  if (els.length === 2 && els[1].textContent.replaceAll('\n','').trim().length < 100) {
    titleLayoutEl = els[1];
    els = getNSiblingsElements(els[0], (n) => n >= 2);
    isPost = true
  } else if(els.length === 2 && els[0].textContent.replaceAll('\n','').trim().length < 100) {
    titleLayoutEl = els[0];
    els = getNSiblingsElements(els[1], (n) => n >= 2);
  }

  const blocks = els.map(e => {
    const img = findImageFromCSS(e, document);
    if (img) {
      e.prepend(img);
    }

    return WebImporter.DOMUtils.createTable([
      ['text'],
      [e],
    ], document);
  });

  const layoutEl = buildSectionMetadataLayoutGeneric(blocks, {
    style: 'XL spacing, two up, grid-width-12',
  }, document);

  if (titleLayoutEl) {
    const titleTable = WebImporter.DOMUtils.createTable([
      ['text (center, xs spacing)'],
      [titleLayoutEl],
    ], document)

    if(isPost){
      layoutEl.append(titleTable)
    } else {
      layoutEl.prepend(titleTable)
    }
  }

  return layoutEl;
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


export function parseTwoUpLayoutsSectionMetadataWithCardHor(el, document, section) {
  let els = getNSiblingsElements(el, (n) => n >= 2);

  let titleLayoutEl = null;
  let isPost = false
  if (els.length === 2 && els[1].textContent.replaceAll('\n','').trim().length < 100) {
    titleLayoutEl = els[1];
    els = getNSiblingsElements(els[0], (n) => n >= 2);
    isPost = true
  } else if(els.length === 2 && els[0].textContent.replaceAll('\n','').trim().length < 100) {
    titleLayoutEl = els[0];
    els = getNSiblingsElements(els[1], (n) => n >= 2);
  }

  const blocks = els.map(e => {
    const imageContainer = e.querySelector('.image');
    const image = imageContainer.querySelector('img') || '';
    const content = imageContainer.nextElementSibling || '';
    const title = content.querySelector('p')
    const link = content.querySelector('a')
    const h2 = document.createElement('h2')
    h2.append(link)

    const item = document.createElement('div')
    item.append(image)
    item.append(document.createElement('br'))
    item.append(title)
    item.append(document.createElement('br'))
    item.append(h2)

    return WebImporter.DOMUtils.createTable([
      ['card-horizontal'],
      [item]
    ], document);
  });

  const layoutEl = buildSectionMetadataLayoutGeneric(blocks, {
    style: 'XL spacing, two up, grid-width-12',
  }, document);

  if (titleLayoutEl) {
    const titleTable = WebImporter.DOMUtils.createTable([
      ['text (center, xs spacing)'],
      [titleLayoutEl],
    ], document)

    if(isPost){
      layoutEl.append(titleTable)
    } else {
      layoutEl.prepend(titleTable)
    }
  }

  return layoutEl;
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

export function buildSectionMetadata(options, document) {
  const cells = [
    ['Section Metadata'],
  ];

  if (options) {
    Object.keys(options).forEach((key) => {
      cells.push([key, options[key]]);
    });
  }
  return WebImporter.DOMUtils.createTable(cells, document);
}

export function parseSectionMetadataGenericCentered(el, document, section) {
  el.querySelectorAll('hr, style').forEach((e) => e.remove());
  const container = document.createElement('div');
  container.innerHTML = el.outerHTML;
  return buildSectionMetadataLayoutGeneric([container], {
    style: 'XL spacing, center',
  }, document);
}

export function parseMultipleSectionMetadataTwoUpGeneric(el, document, section) {
  let subSections = getNSiblingsElements(el, (n) => n > 2);
  const sectionMetadata = document.createElement('div');

  // remove empty sections
  subSections = subSections.filter((e) => e.textContent.replace('\n', '').trim().length > 0);

  for (var i = 0; i < subSections.length; i++) {
    const subSection = subSections[i];

    const els = getNSiblingsElements(subSection, (n) => n >= 2);
    const blocks = els.map((s) => {
      if (s.querySelector('.treeview, .treeView')) {
        return parseTreeView(s, document);
      } else if (s.querySelector('.accordion, .Accordion')) {
        return parseAccordion(s, document);
      } else {
        return WebImporter.DOMUtils.createTable([
          ['text'],
          [s],
        ], document);
      }
    });
    sectionMetadata.append(buildSectionMetadataLayoutGeneric(blocks, {
      style: 'XL spacing, two up',
    }, document));
  }

  return sectionMetadata;
}
