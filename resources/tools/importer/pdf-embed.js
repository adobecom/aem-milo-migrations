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

const DEFAULT_COLSPAN = 2;

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

  meta.Tags = ``;

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);

  return meta;
};

const isRelative = url => !url.startsWith('http');

const recommendedArticles = (main, document) => {
  // const cells = [
  //   ['Columns (contained)'],
  //   [document.querySelector('.dexter-Position.mobile-place-relative.mobile-place-left.mobile-place-top.mobile-padding-top-0.mobile-padding-right-0.mobile-padding-bottom-0.mobile-padding-left-0.desktop-padding-right-32'), faasLink || ''],
  // ];
  // const recommendedArticlesBlock = WebImporter.DOMUtils.createTable(cells, document);
  // main.append(document.querySelector('.title.heading-M.aem-GridColumn'));
  // main.append(recommendedArticlesBlock);
}

export default {
  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @returns {HTMLElement} The root element
   */
  transformDOM: async ({ document, html}) => {
    const pdfLink = document.querySelector('.dexter-Cta a');
    if (isRelative(pdfLink.href)) {
      pdfLink.href = window.importUrl.origin + pdfLink.href;
    }
    pdfLink.textContent = pdfLink.href;
    WebImporter.DOMUtils.remove(document, [
      `header, footer, .xf`,
    ]);

    const main = document.querySelector('main');
    main.append(pdfLink);
    recommendedArticles(main, document);
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
