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

import { setGlobals, getMetadataValue, isRelative, findPaths, createElementFromHTML, getRecommendedArticles } from '../utils.js';

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
  // video
  const videoIframe = document.querySelector('.video iframe, .modal iframe');
  if (videoIframe) {
    return videoIframe.getAttribute('data-video-src') || videoIframe.src;
  }
  const videoLink = document.querySelector('.dexter-Cta a[href*="tv.adobe.com"]');
  if (videoLink) {
    return videoLink.href;
  }

  // pdf link
  let pdfLink = document.querySelector('.dexter-Cta a[href*=".pdf"]');
  if (!pdfLink) {
    // try from jcrContent
    console.log('!pdfLink');
    console.log(window.jcrContent);
    const pdfTextElementPaths = findPaths(window.jcrContent, typeof searchValue === "string", '.pdf')
    if (pdfTextElementPaths && pdfTextElementPaths[0] && pdfTextElementPaths[0][1]) {
      const pdfTextElement = createElementFromHTML(pdfTextElementPaths[0][1]);
      pdfLink =  pdfTextElement.querySelector('a');
      // this method transforms the relative pdf link into a full url with helix-import-ui domain
    } else {
      // search for pdf link in the whole document
      pdfLink = document.querySelector('a[href*=".pdf"], a[href*="gartner.com/"], a[href*="forrester.com/"]');
    }
  }

  if (!pdfLink) {
    console.warn('No pdf link found.');
    return null;
  }

  if (isRelative(pdfLink.href)) {
    pdfLink.href = originalURL.origin + pdfLink.href;
  } else if (pdfLink.href.indexOf('//localhost') > -1) {
    const u = new URL(pdfLink.href);
    pdfLink.href = originalURL.origin + u.pathname;
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
  transform: async ({ document, params}) => {

    /*
     * init
     */

    await setGlobals(params.originalURL);


    /*
     * clean up
     */

    WebImporter.DOMUtils.remove(document, [
      '.globalnavheader',
      '.globalnavfooter',
      'header',
      'footer',
      '.xfreference',
    ]);



    /*
     * title + resource link
     */

    const main = document.querySelector('main');
    const u = new URL(params.originalURL);
    let eyebrow = u.pathname.split('/')[3];
    if (eyebrow.length > 12) {
      eyebrow = 'Guide';
    }

    const titleEl = document.querySelector('.dexter-FlexContainer') || document.querySelector('.dexter-Position');
    const titleTextEl = titleEl.querySelector('.cmp-title') || titleEl.querySelector('.cmp-text');
    const title = titleTextEl ? titleTextEl.textContent : '';
    main.append(WebImporter.DOMUtils.createTable([
      ['text (large)'],
      [`${eyebrow.toUpperCase()}<h1>${title}</h1>`],
    ], document));

    // Resource (pdf, video, etc.)
    const resource = getResource(main, document, u);
    if (resource) {
      main.append(resource);
    }

    titleEl?.remove();

    main.append(WebImporter.DOMUtils.createTable([
      ['Section Metadata'],
      ['style', 'container, L spacing'],
    ], document));
    main.append(document.createElement('hr'));
    document.querySelector('h3, h2')?.remove();



    /*
     * recommended articles
     */

    const defaultCaaSTitle = document.createElement('h3');
    defaultCaaSTitle.textContent = 'Recommended for you';

    main.append(document.querySelector('h2, h3, .aem-Grid > .title .cmp-title__text')?.textContent.trim() ?
      document.querySelector('h2, h3, .aem-Grid > .title .cmp-title__text') :
      defaultCaaSTitle);
    main.append(await getRecommendedArticles(main, document));
    main.append(WebImporter.DOMUtils.createTable([
      ['Section Metadata'],
      ['style', 'container, m spacing, center'],
    ], document));



    /*
     * metadata
     */

    main.append(createMetadata(main, document));



    /*
     * clean up
     */

    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
      if(!h.textContent.trim()) {
        h.remove();
      }
    });

    WebImporter.DOMUtils.remove(document, [
      '.dexter-FlexContainer',
      '.xreference',
      '.dexter-Position',
      'northstar-card-collection',
      'consonant-card-collection',
      'img',
      '.image',
      'a[target=_parent]',
      'p',
    ]);

    /*
     * return + custom report
     */

    return [{
      element: main,
      path: new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
      report: {
        'found resource': resource ? 'true' : 'false',
        'franklin url': 'https://main--bacom--adobecom.hlx.page/drafts/acapt/import-gatedoffer-ty' + new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
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
    let { pathname } = new URL(url);
    pathname = pathname.replace('.html', '');
    return WebImporter.FileUtils.sanitizePath(pathname);
  },
};
