/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { setGlobals, cleanupParagraphs, getJSONValues, getMetadataValue } from '../utils.js';
import { tagMap } from './tagMap.js'
const createMetadata = (main, document) => {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.innerHTML.replace(/[\n\t]/gm, '');
  }
  meta.publishdate = getMetadataValue(document, 'cq:lastRolledout');

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  return block;
};

const createCardMetadata = (main, document) => {
  const cardImg = document.createElement('img');
  cardImg.src = getMetadataValue(document, 'cardImagePath');
  console.log(window.jcrContent)
  const logoImg = document.createElement('img');
  logoImg.src = getMetadataValue(document, 'logoImage')

  const cqTags = getJSONValues(window.jcrContent, 'cq:tags');
  const videoContainer = document.querySelector('.videoContainer');

  let updatedTags = cqTags
    .filter(Boolean)
    .map(tag => {
      const lcTag = tag.toLowerCase().trim();
      if (lcTag.startsWith('caas:')) {
        return lcTag;
      }
      if (tagMap[lcTag]) {
        return tagMap[lcTag];
      }
      return lcTag;
    });
  console.log('updatedTags', cqTags, updatedTags)

  const cells = [
    ['Card Metadata'],
    ['title', getMetadataValue(document, 'jcr:title')],
    ['cardImage', cardImg],
    ['cta1url', videoContainer.firstElementChild.src],
    ['cta1text', 'Watch the video'],
    ['description', getMetadataValue(document, 'description')],
    ['playurl', videoContainer.firstElementChild.src],
    ['tags', updatedTags.length ? updatedTags.join(', ') : ''],
    ['primaryTag', 'customer-story'],
    ['badgeImage', logoImg],

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

    const main = document.querySelector('body>div');

    // Top area
    main.append(createMetadata(main, document));
    main.append(createCardMetadata(main, document));

    cleanupParagraphs(main);

    WebImporter.DOMUtils.remove(main, ['style']);

    return main;
  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {String} url The url of the document being transformed.
   * @param {HTMLDocument} document The document
   */
  generateDocumentPath: ({ document, url }) => {
    let path = new URL(url).pathname.replace(/\/$/, '')
    path = path.replace('/content/experience-fragments', '');
    path = path.replace('/experience_cloud/featured-videos', '/fragments/customer-success-stories/featured-videos');
    path = path.replace('/master.html', '');
    return WebImporter.FileUtils.sanitizePath(path);
  },
};
