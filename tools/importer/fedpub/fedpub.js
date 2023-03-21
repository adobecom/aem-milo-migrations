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
/* global WebImporter */
/* eslint-disable no-console, class-methods-use-this */

const sectionMetaData = (main, document) => {
    const table = document.createElement('table');
    let row = document.createElement('tr');
    table.append(row);
    const th = document.createElement('th');
    row.append(th);
    th.innerHTML = 'section-metadata';
    th.setAttribute('colspan', 2);

    row = document.createElement('tr');
    table.append(row);

    let td = document.createElement('td');
    td.innerHTML = 'style';
    row.append(td);

    td = document.createElement('td');
    td.innerHTML = 'reading width';
    row.append(td);
    
    main.append(table);

};

const createMetadata = (main, document) => {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.innerHTML.replace(/[\n\t]/gm, '');
  }

  const desc = document.querySelector('meta[name="description"]')
  if (desc) {
    meta.Description = desc.content;
  }

  const img = document.querySelector('[property="og:image"]');
  console.log(`OG img: ${img.content}`);
  if (img && img.content) {
    if (img.content.startsWith('http')) {
        const el = document.createElement('img');
        el.src = img.content;
        console.log(`starts with http img - el.src: ${el.src}`);
        meta.Image = el;
    } else if (img.content.includes('default-meta-image.png')) {
        const el = document.createElement('img');
        console.log(`appending localhost img - el.src: ${el.src}`);
        el.src = `http://localhost:3001/tools/importer/default-meta-image.png`;
        meta.Image = el;
    } else {
        const el = document.createElement('img');
        console.log(`appending adobe.com img - el.src: ${el.src}`);
        el.src = `https://www.adobe.com${img.content}`;
        meta.Image = el;
    }
  }

  const topics = document.querySelector('meta[name="topics"]');
  if (topics && topics.content) {
    meta.Topics = topics.content;
  }
  
  const products = document.querySelector('meta[name="products"]');
  if (products && products.content) {
    meta.Products = products.content;
  }

  const seo = document.querySelector('meta[name="seo-targets"]');
  if (seo && seo.content) {
    meta.Seo = seo.content;
  }

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);

  return meta;
};


const createCaasMetadata = (main, document) => {

    const cardTitle = main.querySelector('h1').textContent;
    // const cardDate = 'Card Date';
    let altCardImageText = null;
    const cardImagePath = main.querySelector('img');
    const cardImagePathAlt = 'https://www.adobe.com/default-meta-image.png?width=1200&amp;format=pjpg&amp;optimize=medium';
    const caasPrimary = 'CaaS Primary Tag';
    const caasTags = 'CaaS Tags'
    const logoImage = 'https://www.adobe.com/content/dam/cc/icons/Adobe_Corporate_Horizontal_Red_HEX.svg';

    const table = document.createElement('table');
    let row = document.createElement('tr');
    table.append(row);
    let th = document.createElement('th');
    row.append(th);
    th.innerHTML = 'card metadata';
    th.setAttribute('colspan', 2);

    let td = document.createElement('td');

    if (cardTitle) {
        row = document.createElement('tr');
        table.append(row);

        td = document.createElement('td');
        td.innerHTML = 'title';
        row.append(td);

        td = document.createElement('td');
        td.innerHTML = cardTitle;
        row.append(td);
    }

    row = document.createElement('tr');
    table.append(row);

    td = document.createElement('td');
    td.innerHTML = 'cardImageAltText';
    row.append(td);

    td = document.createElement('td');
    if (cardImagePath.alt) {
        altCardImageText = cardImagePath.alt;
    } else {
        altCardImageText = 'Adobe Document Cloud';
    }
    td.innerHTML = altCardImageText;
    row.append(td);

    if (cardImagePath) {
        let image = document.createElement('img');
        image.setAttribute('src', cardImagePath.src);

        row = document.createElement('tr');
        table.append(row);

        td = document.createElement('td');
        td.innerHTML = 'cardImage';
        row.append(td);

        td = document.createElement('td');
        td.innerHTML = image.outerHTML;
        row.append(td);
    } else {
        let image = document.createElement('img');
        image.setAttribute('src', cardImagePathAlt);

        row = document.createElement('tr');
        table.append(row);

        td = document.createElement('td');
        td.innerHTML = 'cardImage';
        row.append(td);

        td = document.createElement('td');
        td.innerHTML = image.outerHTML;
        row.append(td);
    }

    let image = document.createElement('img');
    image.setAttribute('src', logoImage);
    image.setAttribute('width', '100');

    row = document.createElement('tr');
    table.append(row);

    td = document.createElement('td');
    td.innerHTML = 'badgeImage';
    row.append(td);

    td = document.createElement('td');
    td.innerHTML = image.outerHTML;
    row.append(td);

    row = document.createElement('tr');
    table.append(row);

    td = document.createElement('td');
    td.innerHTML = 'primaryTag';
    row.append(td);

    td = document.createElement('td');
    td.innerHTML = caasPrimary;
    row.append(td);


    row = document.createElement('tr');
    table.append(row);

    td = document.createElement('td');
    td.innerHTML = 'Tags';
    row.append(td);

    td = document.createElement('td');
    td.innerHTML = caasTags;
    row.append(td);

    main.append(table);
}

const convertRelativeImageUrls = (url, main, document) => {
    const newUrl = url.replace('http://localhost:3001', '').split('?')[0];
    const images = main.querySelectorAll('img');
    images.forEach((image) => {
        const src = image.getAttribute('src');
        if ((src && src.startsWith('/')) || src.startsWith('./')) {
            image.setAttribute('src', `${newUrl}${src}`);
        }
    });
};

const convertRelativeLinkUrls = (url, main, document) => {
    const links = main.querySelectorAll('a');
    links.forEach((link) => {
        const href = link.getAttribute('href');
        if ((href && href.startsWith('/')) || href.startsWith('./')) {
            link.setAttribute('href', `https://www.adobe.com${href}`);
        }
    });
};


export default {
  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @returns {HTMLElement} The root element to be transformed
   */
  transformDOM: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    // define the main element: the one that will be transformed to Markdown
    const main = document.body;

    // use helper method to remove header, footer, etc.
    WebImporter.DOMUtils.remove(main, [
      'header',
      'footer',
      '.promotion',
    ]);

    sectionMetaData(main, document);
    createMetadata(main, document);
    convertRelativeLinkUrls(url, main, document);
    createCaasMetadata(main, document);
    convertRelativeImageUrls(url, main, document);

    return main;
  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @return {string} The path
   */
  generateDocumentPath: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => WebImporter.FileUtils.sanitizePath(new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, '')),
};