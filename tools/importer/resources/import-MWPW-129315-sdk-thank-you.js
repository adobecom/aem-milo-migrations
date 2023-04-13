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

import { parseFragment_fragment_products_request_demo_marquee, parseFragment_products_related_content_cards } from '../rules/bacom.js';
import { parseBreadcrumb } from '../rules/breadcrumb.js';
import { parseCardMetadata, parseMetadata } from '../rules/metadata.js';
import { getNSiblingsElements } from '../rules/utils.js';
import { isRelative, setGlobals } from '../utils.js';

export default {
  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @returns {HTMLElement} The root element
   */
  transformDOM: async ({ document, params }) => {
    await setGlobals(params.originalURL);

    WebImporter.DOMUtils.remove(document, [
      `header, footer, xf`,
    ]);

    
    const main = document.createElement('div');
    const content = document.querySelector('.content');


    // top content
    const [ __, bcBlock ] = parseBreadcrumb(document);
    main.append(bcBlock);



    // main content
    const els = getNSiblingsElements(content, (n) => n >= 3);

    const eyebrow = els[0].parentElement.querySelector('.text') || '';
    const title = els[0].parentElement.querySelector('.title') || '';
    const pdfLink = els[0].parentElement.querySelector('.cta a[href*=".pdf"]') || '';

    const originalURL = new URL(params.originalURL);
    if (isRelative(pdfLink.href)) {
      pdfLink.href = originalURL.origin + pdfLink.href;
    } else if (pdfLink.href.indexOf('//localhost') > -1) {
      const u = new URL(pdfLink.href);
      pdfLink.href = originalURL.origin + u.pathname;
    }

    main.append(eyebrow);
    main.append(title);

    // build PDF link
    const l = document.createElement('a');
    l.href = pdfLink.href;
    l.textContent = pdfLink.href;
    main.append(l);

  

    // bottom fragments
    main.append(await parseFragment_products_related_content_cards(null, document));
    main.append(await parseFragment_fragment_products_request_demo_marquee(null, document));

    

    // metadata
    main.append(parseMetadata(document));
    const { block, _ } = parseCardMetadata(document, params.originalURL);
    main.append(block);



    // return
    return main;
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
