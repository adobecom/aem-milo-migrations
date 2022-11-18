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

const getFormLink = async (document, faasTitleSelector) => {
  const formContainer = document.querySelector('.marketoForm');
  if (formContainer) {
    const marketoForm = document.querySelector('.marketo-form');
    const mktoCells = [
      ['Marketo'],
      ['Title', formContainer.querySelector('p')?.textContent || ''],
      ['Form ID', getJSONValues(window.data, 'formId')[0] || marketoForm.getAttribute('data-marketo-form-id')],
      ['Base URL', getJSONValues(window.data, 'baseURL')[0] || marketoForm.getAttribute('data-marketo-baseurl')],
      ['Munchkin ID', getJSONValues(window.data, 'munchkinId')[0] || marketoForm.getAttribute('data-marketo-munchkin-id')],
      ['Destination URL', window.importUrl.pathname.replace('.html', '/thank-you')],
    ];
    const mktoTable = WebImporter.DOMUtils.createTable(mktoCells, document);
    formContainer.remove();
    const cells = [
      ['Section Metadata'],
      ['style', 'container, xxl spacing, divider, two-up'],
    ];
    return [mktoTable, WebImporter.DOMUtils.createTable(cells, document)];
  }

  const jcrContent = JSON.stringify(window.data);
  const formLink = document.createElement('a');
  let faasConfig = document.querySelector('.faas-form-settings')?.innerHTML;
  const { utf8ToB64 } = await import('https://milo.adobe.com/libs/utils/utils.js');
  faasConfig = JSON.parse(faasConfig);
  faasConfig.complete = true;
  const destinationUrl = `/resources${getJSONValues(window.data, 'destinationUrl')[0].split('resources')[1]}`;
  faasConfig.d = destinationUrl;
  faasConfig.title = document.querySelector(faasTitleSelector)?.textContent.trim();
  if (jcrContent?.includes('theme-2cols')) {
    faasConfig.style_layout = 'column2';
  }
  faasConfig.cleabitStyle = '';
  if (getJSONValues(window.data, 'clearbit')[0] && getJSONValues(window.data, 'formSubType')[0] === '2847') {
    faasConfig.title_size = 'p';
    faasConfig.title_align = 'left';
    faasConfig.cleabitStyle = 'Cleabit Style'
  }
  console.log(faasConfig);
  const formLinkURL = `https://milo.adobe.com/tools/faas#${utf8ToB64(JSON.stringify(faasConfig))}`;
  formLink.href = formLinkURL;
  formLink.innerHTML = `FaaS Link - FormID: ${faasConfig.id} ${faasConfig.cleabitStyle}`;
  const cells = [
    ['Section Metadata'],
    ['style', 'container, xxl spacing, divider'],
  ];
  return [formLink, WebImporter.DOMUtils.createTable(cells, document)];
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
    const faasTitleSelector = '.cmp-text.mobile-padding-top-48.mobile-padding-right-48.mobile-padding-left-48';
    const formLink = await getFormLink(document, faasTitleSelector);
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
    if (!getMetadataValue(document, 'robots').toLowerCase().includes('noindex')) {
      main.append(createCardMetadata(main, document));
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
