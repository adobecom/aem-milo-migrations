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

import { setGlobals, getMetadataValue, isRelative, findPaths, createElementFromHTML, getRecommendedArticles, generateDocumentPath } from '../utils.js';
import { parseCardMetadata } from '../rules/metadata.js';

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

const createImage = (document, url)  => {
  const img = document.createElement('img');
  img.src = url;
  return img;
};

const getResource = (document, originalURL) => {
  // video
  const videoIframe = document.querySelector('.video iframe, .modal iframe');
  if (videoIframe) {
    const link = videoIframe.getAttribute('data-video-src') || videoIframe.src;

    if (link.includes('nam04.safelinks.protection.outlook.com')) {
      const u = new URL(link);
      const params = new URLSearchParams(u.search);
      const url = params.get('url');
      if (url) {
        link = decodeURIComponent(url);
      }
    }

    return {
      el: link,
      text: link,
    };
  }
  const videoLink = document.querySelector('.dexter-Cta a[href*="tv.adobe.com"]');
  if (videoLink) {
    return {
      el: videoLink.href,
      text: videoLink.href,
    };
  }

  // slides deck link

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
      pdfLink = document.querySelector('a[href*=".pdf"]');
    }
  }

  if (!pdfLink) {
    console.warn('No pdf link found, fallback to whatever link we find');
    const link = document.querySelector('.dexter-Cta a[href]');
    if (link) {
      return {
        el: link,
        text: link.textContent,
      };
    }
    return null;
  }

  if (isRelative(pdfLink.href)) {
    pdfLink.href = originalURL.origin + pdfLink.href;
  } else if (pdfLink.href.indexOf('//localhost') > -1) {
    const u = new URL(pdfLink.href);
    pdfLink.href = originalURL.origin + u.pathname;
  }

  const pdfLinkTextBkp = pdfLink.textContent;
  pdfLink.textContent = decodeURI(pdfLink.href);
  
  // For cleanup (to avoid a weird bug from original a link.)
  const newPdfLink = document.createElement('a')
  newPdfLink.href = pdfLink.href;
  newPdfLink.textContent = pdfLink.textContent;
  pdfLink.remove();

  return {
    el: newPdfLink,
    text: pdfLinkTextBkp,
  };
}

export default {

  REQUIRED_STYLES: ['background-image', 'background-color'],
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
      // '.xfreference',
    ]);



    const u = new URL(params.originalURL);
    // Resource (pdf, video, etc.)
    const resource = null; // getResource(document, u);
    /*
     * title + resource link
     */

    const main = document.createElement('div');
    const flexContainers = document.querySelectorAll('.dexter-FlexContainer');
    let title = null;
    for (const item of flexContainers) {
      if(item.querySelector('.cmp-title, .cmp-text, a')) {
        const texts = document.createElement('div')
        item.querySelectorAll('.cmp-title, .cmp-text').forEach(elem => texts.append(elem))
        // if (!resource.el) {
        //   const button = document.querySelector('a[href*="gartner.com/"], a[href*="forrester.com/"]');
        //   if (button) {
        //     const str = document.createElement('B');
        //     str.append(button);
        //     texts.append(str);
        //   }
        // }
        if (texts.textContent.length > 0 && !texts.textContent.toLowerCase().includes('materials are ready')) {
          title = texts.textContent;
          break;
        }
      }
    }
    if (!title && resource.text) {
      title = resource.text;
    }

    if (title) {
      const content = document.createElement('div');
      const h1TitleEl = document.createElement('h1');
      h1TitleEl.textContent = title;
      content.append(h1TitleEl);
      // Add Resource (pdf, video, etc.) to output
      const button = document.querySelector('a[href*="gartner.com/"], a[href*="forrester.com/"]');
      if (button) {
        const str = document.createElement('B');
        str.append(button);
        content.append(str);
      }
      main.append(WebImporter.DOMUtils.createTable([
        ['text (large)'],
        [content],
      ], document));
    }


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

    const { block, tagsConverted } = parseCardMetadata(document, params.originalURL);
    main.append(block);
    


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
    const onedrive_subfolder = 'drafts/acapt/import-MWPW-129315/gated-offer-thank-you';
    const path = generateDocumentPath({ document, url: params.originalURL });
    const resourceFound = resource ? 'true' : 'false';

    return [{
      element: main,
      path: path,
      report: {
        'found resource': resourceFound,
        'franklin url': '=HYPERLINK("https://main--bacom--adobecom.hlx.page/' + onedrive_subfolder + path + '")'
      },
    }];
  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {String} url The url of the document being transformed.
   * @param {HTMLDocument} document The document
   */
  generateDocumentPath: generateDocumentPath,
};
