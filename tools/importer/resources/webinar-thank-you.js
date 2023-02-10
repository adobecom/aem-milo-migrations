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

import { setGlobals, findPaths, getMetadataValue } from '../utils.js';

const createMetadata = (main, document) => {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.title = title.innerHTML.replace(/[\n\t]/gm, '');
  }
  meta.robots = getMetadataValue(document, 'robots');
  meta.description = getMetadataValue(document, 'og:description');
  meta.keywords = getMetadataValue(document, 'keywords');
  meta['serp-content-type'] = getMetadataValue(document, 'serp-content-type');
  meta.pageCreatedAt = getMetadataValue(document, 'pageCreatedAt');
  meta.translated = getMetadataValue(document, 'translated');
  meta.publishDate = getMetadataValue(document, 'publishDate');
  meta.productJcrID = getMetadataValue(document, 'productJcrID');
  meta.primaryProductName = getMetadataValue(document, 'primaryProductName');
  meta.image = getMetadataValue(document, 'og:image') ? `https://business.adobe.com${getMetadataValue(document, 'og:image')}` : '';
  meta['caas:content-type'] = getMetadataValue(document, 'caas:content-type') ?? 'webinar';

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  return block;
};

const createMarquee = (main, document) => {
  let marqueeDoc = document.querySelector('.dexter-FlexContainer');
  if (!marqueeDoc.textContent.trim()) {
    marqueeDoc = document.querySelectorAll('.dexter-FlexContainer')[1];
  }
  const eyebrow = marqueeDoc.querySelector('p')?.textContent?.toUpperCase().trim() || 'REPORT';
  const title = marqueeDoc.querySelector('h1')?.textContent;
  const price = marqueeDoc.querySelectorAll('b')[0]?.parentElement;
  const length = marqueeDoc.querySelectorAll('b')[1]?.parentElement;
  const videoIframe = document.querySelector('iframe');
  const videoHeader = marqueeDoc.querySelectorAll('.position')[2].querySelector('p');
  const videoHeaderText = videoHeader?.textContent || 'Thank you for registering. Click to play.';
  videoHeader?.remove();
  const description = marqueeDoc.querySelectorAll('b')[marqueeDoc.querySelectorAll('b').length-1]?.closest('.text').nextElementSibling;
  const bgURL = marqueeDoc.style.backgroundImage?.slice(4, -1).replace(/"/g, "") || '';
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
    ${description.textContent}`,
    `<strong>${videoHeaderText}</strong>${videoIframe.src || videoIframe.dataset.videoSrc}`],
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  document.querySelector('h1')?.remove();
  marqueeDoc.remove();
  return table;
};

const appendBackward = (elements, main) => {
  for (let i=elements.length-1; i>=0; i--) {
    main.prepend(elements[i]);
  }
}

const createBreadcrumbs = (main, document) => {
  const breadcrumbsPath = findPaths(window.jcrContent, 'breadcrumbs');
  if (!breadcrumbsPath?.length) {
    return WebImporter.DOMUtils.createTable([['breadcrumbs'],['<ul><li><a href="/">Home</a></li><li>Adobe Resource Center</li></ul>']], document);
  }
  let breadcrumbs = window.jcrContent;
  breadcrumbsPath[0][0]?.split('/').forEach((pathItem) => {
    breadcrumbs = breadcrumbs[pathItem];
  });
  breadcrumbs = breadcrumbs.links;
  breadcrumbs = Object.values(breadcrumbs);
  const breadcrumbsLastItem = breadcrumbs.pop();
  const breadcrumbsItems = document.createElement('ul');
  const firstItem = document.createElement('li');
  const firstItemLink = document.createElement('a');
  firstItemLink.href = '/';
  firstItemLink.innerHTML = 'Home';
  firstItem.append(firstItemLink);
  breadcrumbsItems.append(firstItem);
  breadcrumbs.forEach((item) => {
    if (item.title) {
      let breadcrumbsItem = document.createElement('li');
      if (item.url) {
        const breadcrumbLink = document.createElement('a');
        const url = item.url.split('resources')[1];
        breadcrumbLink.href = `${window.local ? window.local + '/' : '/'}resources${url}`;
        breadcrumbLink.innerHTML = item.title;
        breadcrumbsItem.append(breadcrumbLink);
      } else {
        breadcrumbsItem.innerHTML = item.title;
      }
      breadcrumbsItems.append(breadcrumbsItem);
    }
  });
  const lastItem = document.createElement('li');
  lastItem.innerHTML = breadcrumbsLastItem.title;
  breadcrumbsItems.append(lastItem);
  const cells = [
    ['breadcrumbs'],
    [breadcrumbsItems],
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  return table;
};


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
    WebImporter.DOMUtils.remove(document, [
      `header, footer, .faas-form-settings, .xf, style, northstar-card-collection, consonant-card-collection`,
    ]);
    const main = document.querySelector('main');

    // Top area
    const elementsToGo = [];
    elementsToGo.push(createBreadcrumbs(main, document));
    elementsToGo.push(createMarquee(main, document));
    elementsToGo.push(WebImporter.DOMUtils.createTable([
      ['Section Metadata'],
      ['style', 'L spacing, center'],
    ], document));
    appendBackward(elementsToGo, main);
    
    // All other content from page should be automatically added here //
    
    // Bottom area
    main.append('---');
    main.append(createMetadata(main, document));
    
    return main;
  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {String} url The url of the document being transformed.
   * @param {HTMLDocument} document The document
   */
  generateDocumentPath: ({ document, url }) => {
    let { pathname } = new URL(url);
    const localFromURL = pathname.split('/')[1];
    if (!localFromURL.startsWith('resource')) {
      pathname = pathname.replace(localFromURL, window.local);
    }
    pathname = pathname.replace('.html', '');
    return WebImporter.FileUtils.sanitizePath(pathname);
  },
};
