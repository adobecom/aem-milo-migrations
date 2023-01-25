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

import { setGlobals, getMetadataValue, createMetadata, createForm } from './utils.js';

const createMarquee = (main, document) => {
  const marqueeDoc = document.querySelector('.dexter-FlexContainer')
  const eyebrow = marqueeDoc.querySelector('p')?.textContent?.toUpperCase().trim() || 'REPORT';
  const title = marqueeDoc.querySelector('h1')?.textContent;
  const cells = [
    ['marquee (small, light)'],
    ['#f5f5f5'],
    [`<h6>${eyebrow}</h6><h6>${title}</h6>`, marqueeDoc.querySelector('img') || ''],
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
  transformDOM: async ({ document, params }) => {
    await setGlobals(params.originalURL);
    console.log(window.fetchUrl);
    const main = document.querySelector('main');
    const faasTitleSelector = '.cmp-text.mobile-padding-top-48.mobile-padding-right-48.mobile-padding-left-48';
    const formLink = await createForm(document, faasTitleSelector, new URL(params.originalURL));
    WebImporter.DOMUtils.remove(document, [
      `header, footer, .faas-form-settings, ${faasTitleSelector}, .xf`,
    ]);

    // Top area
    const elementsToGo = [];
    elementsToGo.push(createMarquee(main, document));
    elementsToGo.push('---');
    createColumns(main, document, formLink).forEach((c) => {elementsToGo.push(c)});
    elementsToGo.push('---');
    appendBackward(elementsToGo, main);

    // All other content from page should be automatically added here //

    // Bottom area
    main.append(WebImporter.DOMUtils.createTable([
      ['Section Metadata'],
      ['style', 'm spacing'],
    ], document));
    main.append('---');

    const metadataKeyValues = {
      title: 'title',
      robots: 'robots',
      Description: 'og:description',
      keywords: 'keywords',
      'serp-content-type': 'serp-content-type',
      pageCreatedAt: 'pageCreatedAt',
      translated: 'translated',
      publishDate: 'publishDate',
      productJcrID: 'productJcrID',
      primaryProductName: 'primaryProductName',
      image: 'og:image',
      'caas:content-type': 'caas:content-type',
    };
    main.append(createMetadata(document, metadataKeyValues));
    
    // if robots doesn't have noindex include Card Metadata;
    if (!getMetadataValue(document, 'robots').toLowerCase().includes('noindex')) {
      const CardMetadataCells = [
        ['Card Metadata'],
        ['cardTitle', getMetadataValue(document, 'cardTitle')],
        ['cardImagePath', `https://business.adobe.com${getMetadataValue(document, 'cardImagePath')}`],
        ['CardDescription', getMetadataValue(document, 'cardDescription')],
        ['primaryTag', `caas:content-type/${getMetadataValue(document, 'caas:content-type')}`],
      ];
      main.append(WebImporter.DOMUtils.createTable(CardMetadataCells, document));
    }
    
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
