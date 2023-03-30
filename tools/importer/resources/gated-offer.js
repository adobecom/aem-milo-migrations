/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-disable no-console, class-methods-use-this */

import { handleFaasForm, waitForFaasForm } from '../rules/handleFaasForm.js';
import { setGlobals, cleanupParagraphs, getJSONValues, getMetadataValue } from '../utils.js';
import { parseCardMetadata } from '../rules/metadata.js';
import { getBGColor, getNSiblingsElements } from '../rules/utils.js';

async function delay(t, v) {
  return new Promise(resolve => setTimeout(resolve, t, v));
}

const createMarquee = (main, document) => {
  const el = document.querySelector('.dexter-FlexContainer') || document.querySelector('.dexter-Position');
  let marqueeDoc = el
  let els = getNSiblingsElements(el, (c) => c == 2)

  const container = document.createElement('div')
  if (els) {
    // handle empty / hidden divs
    let emptyNodeIndx = -1
    for (var i = 0; i < els.length; i++) {
      if (!els[i].hasChildNodes()) {
        emptyNodeIndx = i
        break
      }
    }
    if (emptyNodeIndx >= 0) {
      const targetInd = emptyNodeIndx == 0 ? emptyNodeIndx + 1 : emptyNodeIndx - 1
      els = getNSiblingsElements(els[targetInd], (c) => c >= 2)
    }

    /*
    * texts
    */
    for (var i = 0; i < els.length; i++) {
      const tmpel = els[i];
      const img = tmpel.querySelector('img')
      const video = tmpel.querySelector('video.video-desktop')
      if (!img && !video) {
        container.append(tmpel)
      }
    }

    // sanitize links inside ul/li
    container.querySelectorAll('ol li a, ul li a').forEach((a) => {
      const t = a.textContent;
      a.querySelectorAll('*').forEach((n) => n.remove());
      a.textContent = t;
    });
  } else {
    // strategy 2
    const title = marqueeDoc.querySelector('.title');
    if (title) {
      container.append(title)
    }
  
    const text = marqueeDoc.querySelector('.text');
    if (text) {
      container.append(text)
    }
  
    const cta = marqueeDoc.querySelector('.cta');
    if (cta) {
      const link = cta.querySelector('a');
      if (link.href.indexOf('#watch-now') < 0) {
        const str = document.createElement('B');
        str.append(cta);
        container.append(str)
      }
    }
  }

  /*
  * background
  */

  let background =  WebImporter.DOMUtils.getImgFromBackground(marqueeDoc, document)
  console.log('background', background);

  // strategy 2
  if (!background) {

    marqueeDoc.querySelectorAll('div').forEach(d => {
      const bg = document.defaultView.getComputedStyle(d).getPropertyValue('background-image');
      if (bg !== '') {
        background = WebImporter.DOMUtils.getImgFromBackground(d, document);
      }
      // console.log('bg', bg);
    });

    // const innerDivs = [...marqueeDoc.querySelectorAll('div')];
    // const found = innerDivs.find(d => document.defaultView.getComputedStyle(d).getPropertyValue('background-image') !== '');
    // console.log('found');
    // console.log(found);
    // console.log('found', document.defaultView.getComputedStyle(found).getPropertyValue('background-image'));
  }

  // strategy 3: get background color
  
  if (!background) {
    const bgColor = getBGColor(el, document);
    if (bgColor) {
      background = bgColor
    }
  }

  if (!background) {
    background = backgroundColor;
  }

  /*
  * image + resource
  */

  let resource = null;

  const image = marqueeDoc.querySelector('.image');

  if (image) {
    let img = image.querySelector('img');
    if (img) {
      resource = createImage(document, img.src);
    }
    
    const link = image.querySelector('a');
    if (link) {
      if (link.href.indexOf('#watch-now') > -1) {
        const watchNowEl = document.querySelector('#watch-now');
        if (watchNowEl) {
          const videoIframe = watchNowEl.querySelector('iframe');
          if (videoIframe) {
            resource = videoIframe.src || videoIframe.dataset.videoSrc;
          }
        }
      }
    }
  }

  const video = marqueeDoc.querySelector('video.video-desktop');
  if (video) {
    const source = video.querySelector('source');
    // const l = document.createElement('a');
    // l.textContent = source.src;
    // l.href = source.src;
    resource = source.src;
    console.log("Resource: " + JSON.stringify(resource))
  }

  /*
  * create table
  */

  const cells = [
    ['marquee (medium, light)'],
    [background],
    [container, (resource || '')],
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  // document.querySelector('h1')?.remove();
  // marqueeDoc.remove();
  return table;
};

const createColumns = (main, document, formLink) => {
  const firstBodyImage = document.querySelector('img');
  const contentBody = document.querySelectorAll('.flex')[1];
  if (document.querySelector('img')?.parentElement.nodeName === 'DIV') {
    firstBodyImage.remove();
  }
  if (formLink[0].nodeName === 'A') {
    const cells = [
      ['Columns (contained)'],
      [contentBody, formLink[0] || ''],
    ];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    return [table, formLink[1]];
  } else {
    return [contentBody, ...formLink || ''];
  }
  
};

const createMetadata = (main, document) => {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.innerHTML.replace(/[\n\t]/gm, '');
  }
  meta.robots = getMetadataValue(document, 'robots');
  meta.Description = getMetadataValue(document, 'og:description');
  meta.keywords = getMetadataValue(document, 'keywords');
  meta['serp-content-type'] = getMetadataValue(document, 'serp-content-type');
  meta.pageCreatedAt = getMetadataValue(document, 'pageCreatedAt');
  meta.translated = getMetadataValue(document, 'translated');
  meta.publishDate = getMetadataValue(document, 'publishDate');
  meta.productJcrID = getMetadataValue(document, 'productJcrID');
  meta.primaryProductName = getMetadataValue(document, 'primaryProductName');
  const img = document.createElement('img');
  img.src = `https://business.adobe.com${getMetadataValue(document, 'og:image')}`
  meta.image = img;
  const cqTags = getJSONValues(window.jcrContent, 'cq:tags');
  meta.tags = cqTags.length ? cqTags.join(', ') : '';
  meta['caas:content-type'] = getMetadataValue(document, 'caas:content-type');

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  return block;
};

const getFormLink = async (document, faasTitleSelector, originalURL) => {
  const formContainer = document.querySelector('.marketoForm');
  if (formContainer) {
    const marketoForm = document.querySelector('.marketo-form');
    const mktoCells = [
      ['Marketo'],
      ['Title', formContainer.querySelector('p')?.textContent || ''],
      ['Form ID', getJSONValues(window.jcrContent, 'formId')[0] || marketoForm.getAttribute('data-marketo-form-id')],
      ['Base URL', getJSONValues(window.jcrContent, 'baseURL')[0] || marketoForm.getAttribute('data-marketo-baseurl')],
      ['Munchkin ID', getJSONValues(window.jcrContent, 'munchkinId')[0] || marketoForm.getAttribute('data-marketo-munchkin-id')],
      ['Destination URL', originalURL.pathname.replace('.html', '/thank-you')],
    ];
    const mktoTable = WebImporter.DOMUtils.createTable(mktoCells, document);
    formContainer.remove();
    const cells = [
      ['Section Metadata'],
      ['style', 'container, xxl spacing, divider, two-up'],
    ];
    return [mktoTable, WebImporter.DOMUtils.createTable(cells, document)];
  }

  const cells = [
    ['Section Metadata'],
    ['style', 'container, xxl spacing, divider'],
  ];

  const formLink = handleFaasForm(document, document, faasTitleSelector);
  return [formLink, WebImporter.DOMUtils.createTable(cells, document)];
};

const appendBackward = (elements, main) => {
  for (let i=elements.length-1; i>=0; i--) {
    main.prepend(elements[i]);
  }
}

export default {
  onLoad: async ({ document }) => {
    await waitForFaasForm(document);
  },

  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @returns {HTMLElement} The root element
   */
  transform: async ({ document, params }) => {
    await setGlobals(params.originalURL);
    
    const faasTitleSelector = '.cmp-text.mobile-padding-top-48.mobile-padding-right-48.mobile-padding-left-48';
    const formLink = await getFormLink(document, faasTitleSelector, new URL(params.originalURL));
    WebImporter.DOMUtils.remove(document, [
      `header, footer, .faas-form-settings, ${faasTitleSelector}, .xf`,
    ]);
    const main = document.querySelector('main');

    // Top area
    const elementsToGo = [];
    elementsToGo.push(createMarquee(main, document));
    elementsToGo.push('---');
    createColumns(main, document, formLink).forEach((c) => {elementsToGo.push(c)});
    elementsToGo.push('---');
    appendBackward(elementsToGo, main);

    // All other content from page should be automatically added here //

    // Bottom area
    const cells = [
      ['Section Metadata'],
      ['style', 'm spacing'],
    ];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    main.append(table);
    main.append('---');
    main.append(createMetadata(main, document));
    
    // if robots doesn't have noindex include Card Metadata;
    let tagsConvertedString = 'false'
    if (!getMetadataValue(document, 'robots')?.toLowerCase()?.includes('noindex')) {
      const { block, tagsConverted } = parseCardMetadata(document, params.originalURL);
      tagsConvertedString = tagsConverted.toString()
      main.append(block);
    }

    cleanupParagraphs(main);

    WebImporter.DOMUtils.remove(main, [
    '.faasform',
    'style',
    ]);
    
    return [{
      element: main,
      path: generateDocumentPath({ document, url: params.originalURL }),
      report: {
        'tags converted?': tagsConvertedString,
      },
    }];

  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {String} url The url of the document being transformed.
   * @param {HTMLDocument} document The document
   */
  generateDocumentPath: ({ document, url }) => {
    const path = new URL(url).pathname.replace(/\/$/, '').replace('.html', '');
    return WebImporter.FileUtils.sanitizePath(path);
  },
};

const generateDocumentPath = ({ document, url }) => {
  const path = new URL(url).pathname.replace(/\/$/, '').replace('.html', '');
  return WebImporter.FileUtils.sanitizePath(path);
}