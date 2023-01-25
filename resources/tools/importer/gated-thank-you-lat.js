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

import { setGlobals, getMetadataValue, isRelative, findPaths, createElementFromHTML, getRecommendedArticles } from './utils.js';

const createMetadata = (main, document) => {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.innerHTML.replace(/[\n\t]/gm, '');
  }
  meta.robots = getMetadataValue(document, 'robots');
  meta['serp-content-type'] = getMetadataValue(document, 'serp-content-type');
  meta.pageCreatedAt = getMetadataValue(document, 'pageCreatedAt');
  meta.translated = getMetadataValue(document, 'translated');
  meta.publishDate = getMetadataValue(document, 'publishDate');
  meta.productJcrID = getMetadataValue(document, 'productJcrID');
  meta.primaryProductName = getMetadataValue(document, 'primaryProductName');

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  return block;
};

const getResource = (main, document, originalURL) => {
  const videoIframe = document.querySelector('.video iframe, .modal iframe');
  if (videoIframe) {
    return videoIframe.getAttribute('data-video-src') || videoIframe.src;
  }
  
  let pdfLink = document.querySelector('.dexter-Cta a');
  if (!pdfLink) {
    console.log('!pdfLink');
    console.log(window.jcrContent);
    const pdfTextElementStr = findPaths(window.jcrContent, typeof searchValue === "string", '.pdf')[0][1];
    const pdfTextElement = createElementFromHTML(pdfTextElementStr);
    pdfLink =  pdfTextElement.querySelector('a');
  }
  
  if (isRelative(pdfLink.href)) {
    pdfLink.href = originalURL.origin + pdfLink.href;
  } else {
    const hrefURL = new URL(pdfLink.href);
    pdfLink.href = originalURL.origin + hrefURL.pathname;
  }
  
  pdfLink.textContent = decodeURI(pdfLink.href);
  
  // For cleanup (to avoid a weird bug from original a link.)
  const newPdfLink = document.createElement('a')
  newPdfLink.href = pdfLink.href;
  newPdfLink.textContent = pdfLink.textContent;
  pdfLink.remove();

  return newPdfLink;
}

export default {
  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @returns {HTMLElement} The root element
   */
  transformDOM: async ({ document, params}) => {
    await setGlobals(params.originalURL);
    
    WebImporter.DOMUtils.remove(document, [
      `h1`,
    ]);
    // console.log(document.querySelector('.title h3').textContent);
    console.log(window.fetchUrl);
    WebImporter.DOMUtils.remove(document, [
      `header, footer, xf`,
    ]);
    const main = document.querySelector('main');
    const u = new URL(params.originalURL);
    let eyebrow = u.pathname.split('/')[2];
    if (eyebrow.length > 12) {
      eyebrow = 'Guide';
    }
    const defaultCaaSTitle = document.createElement('h3');
    defaultCaaSTitle.textContent = 'Recommended for you';

    const title = document.querySelector('.cmp-text a, .cta a');
    main.append(WebImporter.DOMUtils.createTable([
      ['text (large)'],
      [`${eyebrow.toUpperCase()}<h1>${title.textContent}</h1>`],
    ], document));
    
    title?.remove();
    
    // Resources (pdf, video, etc.)
    main.append(getResource(main, document, u));
    main.append(WebImporter.DOMUtils.createTable([
      ['Section Metadata'],
      ['style', 'container, L spacing'],
    ], document));
    main.append('---');
    document.querySelector('h3, h2').remove();
    main.append(document.querySelector('h2, h3, .aem-Grid > .title .cmp-title__text')?.textContent.trim() ? 
      document.querySelector('h2, h3, .aem-Grid > .title .cmp-title__text') :
      defaultCaaSTitle);
    main.append(await getRecommendedArticles(main, document));
    main.append(WebImporter.DOMUtils.createTable([
      ['Section Metadata'],
      ['style', 'container, m spacing, center'],
    ], document));
    main.append(createMetadata(main, document));
    
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
      if(!h.textContent.trim()) {
        h.remove();
      }
    });
    WebImporter.DOMUtils.remove(document, [
      `img, .image, a[target=_parent], northstar-card-collection, consonant-card-collection, p, .xfreference`,
    ]);

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
    return pathname.replace('.html', '');
  },
};
