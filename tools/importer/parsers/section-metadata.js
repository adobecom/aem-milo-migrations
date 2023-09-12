import { isLightColor } from '../utils.js';
import { parseAccordion } from './accordion.js';
import { extractBackground } from './bacom.js';
import { parseTreeView } from './tree-view.js';
import { crawlColorFromCSS, findImageFromCSS, getNSiblingsElements } from './utils.js';



const DEFAULT_SM_PARSER_OPTIONS = {
  elNum: 2,
  elementType: 'text',
  bgStrategy: 'default',
  smOptions: {},
};

export function parseTwoUpLayoutsSectionMetadata(el, document, section, options = {}) {
  const opts = {
    ...DEFAULT_SM_PARSER_OPTIONS,
    ...options,
  };
  const block = parseNUpLayoutsSectionMetadata(el, document, section, opts);
  return { block };
}

export function parseThreeUpLayoutsSectionMetadataGeneric(el, document, section, options = {}) {
  const opts = {
    ...DEFAULT_SM_PARSER_OPTIONS,
    ...options,
    ...{ elNum: 3 },
  };
  const block = parseNUpLayoutsSectionMetadata(el, document, section, opts);
  return { block };
}

export function parseFourUpLayoutsSectionMetadataGeneric(el, document, section, options = {}) {
  const opts = {
    ...DEFAULT_SM_PARSER_OPTIONS,
    ...options,
    ...{ elNum: 4 },
  };
  const block = parseNUpLayoutsSectionMetadata(el, document, section, opts);
  return { block };
}

export function parseFiveUpLayoutsSectionMetadataGeneric(el, document, section, options = {}) {
  const opts = {
    ...DEFAULT_SM_PARSER_OPTIONS,
    ...options,
    ...{ elNum: 5 },
  };
  const block = parseNUpLayoutsSectionMetadata(el, document, section, opts);
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
 *   elNum: number of elements in the section-metadata block // default: 2
 *   elementType: string representing the type of the element in the section-metadata block // default: 'text'
 *   smStyle: string representing extra styles added to the section-metadata block header // default: ''
 *   smOptions: object
 *   theme: light | dark
 *   bgStrategy: enum - default | color | image - representing the background extraction strategy // default: 'default'
 * }
 */
export function parseNUpLayoutsSectionMetadata(el, document, section, options = {}) {

  console.log('parseNUpLayoutsSectionMetadata options: ', options);

  el.querySelectorAll('.horizontalRule').forEach((e) => e.remove());

  let els = getNSiblingsElements(el, (n) => n >= options.elNum);

  console.log('els', els.length);
  let topEls = [els[0]];
  els.reduce((acc, block) => {
    console.log('acc', acc);
    if (block.dataset.hlxImpRect && acc.dataset.hlxImpRect) {
      const blockRect = JSON.parse(block.dataset.hlxImpRect);
      const accRect = JSON.parse(acc.dataset.hlxImpRect);

      if (blockRect.y < accRect.y) {
        topEls = [block];
        return block;
      } else if (blockRect.y === accRect.y) {
        topEls.push(block);
        return acc;
      } else {
        topEls = [acc];
        return acc;
      }
    }
    return acc;
  });
  console.log('topEls', topEls);
  topEls.forEach((e) => {
    console.log('e rect', e.dataset.hlxImpRect);
  });
  
  let titleLayoutEl = null;

  if (topEls.length === 1) {
    els = els.filter((e) => e !== topEls[0]);
    if (els.length < options.elNum) {
      els = getNSiblingsElements(els[0], (n) => n >= options.elNum);
    }
    titleLayoutEl = topEls[0];
  }

  let isPost = false

  // if (els.length === elNum && els[1].textContent.replaceAll('\n','').trim().length < 100) {
  //   titleLayoutEl = els[1];
  //   els = getNSiblingsElements(els[0], (n) => n >= elNum);
  //   isPost = true
  // } else if(els.length === elNum && els[0].textContent.replaceAll('\n','').trim().length < 100) {
  //   titleLayoutEl = els[0];
  //   els = getNSiblingsElements(els[1], (n) => n >= elNum);
  // }

  const cloneEls = els.map(e => e.cloneNode(true));
  const blocks = cloneEls.map(e => {
    const img = findImageFromCSS(e, document);
    if (img) {
      e.prepend(img);
    }

    return WebImporter.DOMUtils.createTable([
      [options.elementType],
      [e],
    ], document);
  });


  // theme
  let theme = 'light'; // default, dark color + light background
  if (options.theme) {
    theme = options.theme;
  } else {
    const fontColor = crawlColorFromCSS(el, document);
    if (fontColor) {
      if (isLightColor(fontColor)) {
        theme = 'dark'; // default, light color + dark background
      }
    }
  }

  const nUpStylesMap = {
    2: 'two up',
    3: 'three up',
    4: 'four up',
    5: 'five up',
  };

  const smOptions = {
    ...options.smOptions,
    ...{style: `${theme}, XL spacing, ${nUpStylesMap[options.elNum]}, grid-width-12`},
  }

  const bg = extractBackground(el, document, { strategy: options.bgStrategy });
  if (bg !== '') {
    smOptions.background = bg;
  }

  const layoutEl = buildSectionMetadataLayoutGeneric(blocks, smOptions, document);

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
  } else {
    els.forEach(e => { e.remove() });
    el.querySelectorAll('script, style').forEach((e) => e.remove() );
    if (el.textContent.replaceAll('\n','').trim().length > 0) {
      layoutEl.prepend(el.cloneNode(true));
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
  
  // theme
  let theme = 'light'; // default, dark color + light background
  const fontColor = crawlColorFromCSS(el, document);
  if (fontColor) {
    if (isLightColor(fontColor)) {
      theme = 'dark'; // default, light color + dark background
    }
  }

  const options = {
    style: `${theme}, two-up, grid-template-columns-1-3, l spacing`,
  }

  const bg = extractBackground(el, document);
  if (bg !== '') {
    options.background = bg;
  }

  const block = buildSectionMetadataLayoutGeneric(blocks, options, document);
  return { block };
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

  // theme
  let theme = 'light'; // default, dark color + light background
  const fontColor = crawlColorFromCSS(el, document);
  if (fontColor) {
    if (isLightColor(fontColor)) {
      theme = 'dark'; // default, light color + dark background
    }
  }
  
  const options = {
    style: `${theme}, XL spacing, two up, grid-width-12`,
  }

  const bg = extractBackground(el, document);
  if (bg !== '') {
    options.background = bg;
  }

  const block = buildSectionMetadataLayoutGeneric(blocks, options, document);

  if (titleLayoutEl) {
    const titleTable = WebImporter.DOMUtils.createTable([
      ['text (center, xs spacing)'],
      [titleLayoutEl],
    ], document)

    if(isPost){
      block.append(titleTable)
    } else {
      block.prepend(titleTable)
    }
  }

  return { block };
}

export function parseTwoUpLayoutGrid_1_2_SectionMetadata(el, document, section, elementType = 'text') {
  let els = getNSiblingsElements(el, (n) => n >= 2);

  let titleLayoutEl = null;
  let isPost = false

  if (els.length === 2) {
    els.forEach(e => {
      e.querySelectorAll('style').forEach(s => s.remove());
    });
    const els0Textcontent = els[0].textContent.replaceAll('\n','').trim();
    const els1Textcontent = els[1].textContent.replaceAll('\n','').trim();
    if (els0Textcontent.length > 0 && els0Textcontent.length < 100) {
      titleLayoutEl = els[0];
      els = getNSiblingsElements(els[1], (n) => n >= 2);
    } else if (els1Textcontent.length > 0 && els1Textcontent.length < 100) {
      titleLayoutEl = els[1];
      els = getNSiblingsElements(els[0], (n) => n >= 2);
      isPost = true
      }
  }

  // if (els.length === 2 && els[1].textContent.replaceAll('\n','').trim().length < 100) {
  //   titleLayoutEl = els[1];
  //   els = getNSiblingsElements(els[0], (n) => n >= 2);
  //   isPost = true
  // } else if(els.length === 2 && els[0].textContent.replaceAll('\n','').trim().length < 100) {
  //   titleLayoutEl = els[0];
  //   els = getNSiblingsElements(els[1], (n) => n >= 2);
  // }

  const blocks = els.map(e => {
    const img = findImageFromCSS(e, document);
    if (img) {
      e.prepend(img);
    }

    return WebImporter.DOMUtils.createTable([
      [elementType],
      [e],
    ], document);
  });

  // theme
  let theme = 'light'; // default, dark color + light background
  const fontColor = crawlColorFromCSS(el, document);
  if (fontColor) {
    if (isLightColor(fontColor)) {
      theme = 'dark'; // default, light color + dark background
    }
  }

  const options = {
    style: `${theme}, XL spacing, two up, grid-template-columns-1-2`,
  }

  const bg = extractBackground(el, document);
  if (bg !== '') {
    options.background = bg;
  }

  const block = buildSectionMetadataLayoutGeneric(blocks, options, document);

  if (titleLayoutEl) {
    const titleTable = WebImporter.DOMUtils.createTable([
      ['text (center, xs spacing)'],
      [titleLayoutEl],
    ], document)

    if(isPost){
      block.append(titleTable)
    } else {
      block.prepend(titleTable)
    }
  }

  return { block };
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

  // theme
  let theme = 'light'; // default, dark color + light background
  const fontColor = crawlColorFromCSS(el, document);
  if (fontColor) {
    if (isLightColor(fontColor)) {
      theme = 'dark'; // default, light color + dark background
    }
  }

  const options = {
    style: `${theme}, XL spacing, center`,
  }

  const bg = extractBackground(el, document);
  if (bg !== '') {
    options.background = bg;
  }

  const block = buildSectionMetadataLayoutGeneric([container], options, document);
  return { block };
}

export function parseSectionMetadataGenericRaw(el, document, section) {
  el.querySelectorAll('hr, style, script').forEach((e) => e.remove());
  const container = document.createElement('div');
  container.innerHTML = el.outerHTML;

  // theme
  let theme = 'light'; // default, dark color + light background
  const fontColor = crawlColorFromCSS(el, document);
  if (fontColor) {
    if (isLightColor(fontColor)) {
      theme = 'dark'; // default, light color + dark background
    }
  }

  const options = {
    style: theme,
  }

  const bg = extractBackground(el, document);
  if (bg !== '') {
    options.background = bg;
  }

  const block = buildSectionMetadataLayoutGeneric([container], options, document);
  return { block };
}

export function parseMultipleSectionMetadataTwoUpGeneric(el, document, section) {
  let subSections = getNSiblingsElements(el, (n) => n > 2);
  const block = document.createElement('div');

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

    // theme
    let theme = 'light'; // default, dark color + light background
    const fontColor = crawlColorFromCSS(el, document);
    if (fontColor) {
      if (isLightColor(fontColor)) {
        theme = 'dark'; // default, light color + dark background
      }
    }

    const options = {
      style: `${theme}, XL spacing, two up`,
    }

    const bg = extractBackground(el, document);
    if (bg !== '') {
      options.background = bg;
    }

    const smEl = buildSectionMetadataLayoutGeneric(blocks, options, document);

    block.append(smEl);
  }

  return { block };
}
