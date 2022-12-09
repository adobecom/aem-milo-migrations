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

import { getJSONValues, getMetadataValue } from './utils.js';

const createMarquee = (main, document) => {
  const marqueeDoc = document.querySelector('.dexter-FlexContainer')
  const eyebrow = marqueeDoc.querySelector('p')?.textContent?.toUpperCase().trim() || 'REPORT';
  const title = marqueeDoc.querySelector('h1')?.textContent;
  const bgURL = marqueeDoc.style.backgroundImage?.slice(4, -1).replace(/"/g, "") || '';
  const price = marqueeDoc.querySelectorAll('b')[0]?.parentElement;
  const length = marqueeDoc.querySelectorAll('b')[1]?.parentElement;
  const description = marqueeDoc.querySelectorAll('b')[marqueeDoc.querySelectorAll('b').length-1]?.closest('.text').nextElementSibling;
  let cta = marqueeDoc.querySelector('.dexter-Cta a');
  if (!cta) {
    cta = document.createElement('a');
    cta.innerHTML = 'Watch now';
  }
  let { pathname } = window.importUrl;
  let path = pathname.replace('.html', '');
  path = `/fragments/resources/modal/forms/${path.split('/').at(-1)}`;
  cta.href = `/fragments/resources/modal/forms/${path.split('/').at(-1)}#faas-form`;
  console.log(cta.outerHTML);
  let bg = '#f5f5f5'
  if (bgURL) {
    bg = document.createElement('img');
    bg.src = bgURL;
  }
  const cells = [
    ['marquee (small, light)'],
    [bg],
    [`<p><strong>${eyebrow}</strong></p>
    <h1>${title}</h1>
    ${price.outerHTML}
    ${length.outerHTML}
    ${description.textContent}
    <strong>${cta.outerHTML}</strong>`,
    marqueeDoc.querySelector('img') || ''],
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  document.querySelector('h1')?.remove();
  marqueeDoc.remove();
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
  meta.image = `https://business.adobe.com${getMetadataValue(document, 'og:image')}`;
  meta['caas:content-type'] = getMetadataValue(document, 'caas:content-type');

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  return block;
};

const createCardMetadata = (main, document) => {  
  const cells = [
    ['Card Metadata'],
    ['cardTitle', getMetadataValue(document, 'cardTitle')],
    ['cardImagePath', `https://business.adobe.com${getMetadataValue(document, 'cardImagePath')}`],
    ['CardDescription', getMetadataValue(document, 'cardDescription')],
    ['primaryTag', `caas:content-type/${getMetadataValue(document, 'caas:content-type')}`],
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  return table;
};

const appendBackward = (elements, main) => {
  for (let i=elements.length-1; i>=0; i--) {
    main.prepend(elements[i]);
  }
}

export default {
  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @returns {HTMLElement} The root element
   */
  transformDOM: async ({ document, html}) => {
    console.log(window.fetchUrl);
    WebImporter.DOMUtils.remove(document, [
      `header, footer, .faas-form-settings, .xf, style`,
    ]);
    const main = document.querySelector('main');

    // Top area
    const elementsToGo = [];
    elementsToGo.push(WebImporter.DOMUtils.createTable([
      ['breadcrumbs'],
      ['<ul><li><a href="/">Home</a></li><li>Adobe Resource Center</li></ul>'],
    ], document));
    elementsToGo.push(createMarquee(main, document));
    elementsToGo.push(WebImporter.DOMUtils.createTable([
      ['Section Metadata'],
      ['style', 'L spacing'],
    ], document));
    elementsToGo.push('---');
    // createColumns(main, document, formLink).forEach((c) => {elementsToGo.push(c)});
    elementsToGo.push('---');
    appendBackward(elementsToGo, main);

    // All other content from page should be automatically added here //

    // Bottom area
    // const cells = [
    //   ['Section Metadata'],
    //   ['style', 'm spacing'],
    // ];
    // const table = WebImporter.DOMUtils.createTable(cells, document);
    // main.append(table);
    // main.append('---');
    // main.append(createMetadata(main, document));
    
    // // if robots doesn't have noindex include Card Metadata;
    // if (!getMetadataValue(document, 'robots').toLowerCase().includes('noindex')) {
    //   main.append(createCardMetadata(main, document));
    // }
    
    return main;
  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {String} url The url of the document being transformed.
   * @param {HTMLDocument} document The document
   */
  generateDocumentPath: ({ document, url }) => {
    const path = new URL(url).pathname.replace(/\/$/, '');
    path.replace('.html', '');
    return path;
  },
};
