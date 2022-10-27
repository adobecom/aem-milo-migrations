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

import { getJSONValues } from './utils.js';

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
  main.prepend(table);
  marqueeDoc.remove();
};

const createColumns = (main, document, formLink) => {
  const firstBodyImage = document.querySelector('img');
  if (document.querySelector('img')?.parentElement.nodeName === 'DIV') {
    firstBodyImage.remove();
  }
  const cells = [
    ['Columns (contained)'],
    [document.querySelector('.content'), formLink || ''],
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  main.append(table);
};

const createSectionMetadata = (main, document) => {
  const cells = [
    ['Section Metadata'],
    ['style', 'container, xxl spacing, divider'],
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  main.append(table);
}

const createMetadata = (main, document) => {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.innerHTML.replace(/[\n\t]/gm, '');
  }

  const desc = document.querySelector('[property="og:description"]');
  if (desc) {
    meta.Description = desc.content;
  }

  // meta.Category = document.querySelector('.text.NoMargin').textContent.toLowerCase();
  meta.Author = 'DX Adobe';

  const date = document.querySelector('meta[name="publishDate"]');
  if (date) {
    meta['Publication Date'] = date.content.substring(0, date.content.indexOf('T'));
  }

  meta.Tags = `${window.data['cq:tags']}`;

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);

  return meta;
};

const getFormLink = async (document, faasTitleSelector) => {
  const jcrContent = JSON.stringify(window.data);
  const formContainer = document.querySelector('.marketoForm');
  const formLink = document.createElement('a');
  if (formContainer) {
    formLink.href = 'https://main--milo--adobecom.hlx.page/drafts/bmarshal/authoring/fragments/marketo-form-fragment';
    formLink.innerHTML = `Marketo From data:<br>
    Form ID - ${getJSONValues(window.data, 'formId')[0]}<br>
    munchkin ID - ${getJSONValues(window.data, 'munchkinId')[0]}<br>
    baseURL - ${getJSONValues(window.data, 'baseURL')[0]}`;
    formContainer.remove();
  } else {
    let faasConfig = document.querySelector('.faas-form-settings')?.innerHTML;
    const { utf8ToB64 } = await import('https://milo.adobe.com/libs/utils/utils.js');
    faasConfig = JSON.parse(faasConfig);
    faasConfig.complete = true;
    faasConfig.title = document.querySelector(faasTitleSelector)?.textContent.trim();
    if (jcrContent?.includes('theme-2cols')) {
      faasConfig.style_layout = 'column2';
    }
    console.log(faasConfig);
    const formLinkURL = `https://milo.adobe.com/tools/faas#${utf8ToB64(JSON.stringify(faasConfig))}`;
    formLink.href = formLinkURL;
    formLink.innerHTML = 'FaaS Link';
  }
  
  return formLink;
};

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
    const otherContent = document.querySelector('.horizontalRule:not(.aem-GridColumn)')?.parentElement;
    otherContent?.querySelectorAll('style').forEach(s => s.remove());
    WebImporter.DOMUtils.remove(document, [
      `header, footer, .faas-form-settings, ${faasTitleSelector}, .xf`,
    ]);

    const main = document.querySelector('main');
    createMarquee(main, document);
    main.append('---');
    createColumns(main, document, formLink);
    createSectionMetadata(main, document);
    main.append('---');
    if (otherContent?.textContent.trim()) {
      main.append(otherContent);
    } else {
      const cells = [
        ['Section Metadata'],
        ['style', 'm spacing'],
      ];
      const table = WebImporter.DOMUtils.createTable(cells, document);
      main.append(table);
    }
    createMetadata(main, document);

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
