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

import { findPaths, getMetadataValue, setGlobals } from '../utils.js';
import { parseCardMetadata } from '../rules/metadata.js';
import { parseMarquee } from '../rules/marquee.js';

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

const createMarquee = (el, document) => {
  let marqueeDoc = el.querySelector(':scope .dexter-FlexContainer') || el.querySelector(':scope .dexter-Position');
  if (!marqueeDoc.textContent.trim()) {
    marqueeDoc = document.querySelectorAll('.dexter-FlexContainer')[1];
  }
  const title = marqueeDoc.querySelector('h1')?.textContent.trim();
  const price = marqueeDoc.querySelectorAll('b')[0]?.parentElement?.outerHTML || '';
  const length = marqueeDoc.querySelectorAll('b')[1]?.parentElement?.outerHTML || '';
  const videoIframe = document.querySelector('iframe');
  const videoHeader = marqueeDoc.querySelectorAll('.position')[2]?.querySelector('p');
  const videoHeaderText = videoHeader?.textContent || '';
  videoHeader?.remove();
  const description = marqueeDoc.querySelectorAll('b')[marqueeDoc.querySelectorAll('b').length-1]?.closest('.text')?.nextElementSibling?.textContent || '';

  const background =  WebImporter.DOMUtils.getImgFromBackground(marqueeDoc, document) || '#f5f5f5';

  const cells = [
    ['marquee (small, light)'],
    [background],
    [`<h1>${title}</h1>
    ${price.indexOf(title) > -1 ? '' : price }
    ${length.indexOf(title) > -1 ? '' : length }
    ${description.indexOf(title) > -1 ? '' : description}`,
    videoIframe ? `${videoIframe.src || videoIframe.dataset.videoSrc}` : ''],
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  document.querySelector('h1')?.remove();
  marqueeDoc.remove();
  return [ table, videoIframe != null ];
};

const createBreadcrumbs = (document) => {
  // default breadcrumb
  let bcType = 'default';
  let bcContent = WebImporter.DOMUtils.createTable([['breadcrumbs'],['<ul><li><a href="/">Home</a></li><li>Adobe Resource Center</li></ul>']], document);

  // try building breadcrumb from DOM
  const domBreadcrumb = document.querySelector('.feds-breadcrumbs');
  if (domBreadcrumb) {
    const items = [];
    const domBreadcrumbItems = domBreadcrumb.querySelectorAll('li');
    if (domBreadcrumbItems.length > 0) {
      domBreadcrumbItems.forEach((item) => {
        const link = item.querySelector('a');
        if (link) {
          // make link relative if needed
          if (link.href.indexOf('http') === 0) {
            let { pathname } = new URL(link.href);
            pathname = pathname.replace('.html', '');
            link.href = pathname;
          }
        }
        items.push(item.outerHTML);
      });
  
      bcType = 'dom';
      bcContent = WebImporter.DOMUtils.createTable([['breadcrumbs'],[`<ul>${items.join('')}</ul>`]], document);
    }
  }
  
  // try building breadcrumb from jcrContent
  const breadcrumbsPath = findPaths(window.jcrContent, 'breadcrumbs');
  if (breadcrumbsPath?.length > 0) {
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

    bcType = 'jcrContent';
    bcContent = WebImporter.DOMUtils.createTable(cells, document);
}

  return [ bcType, bcContent ];
};



export default {

  // onLoad: async ({ document, url, params }) => {
  //   await new Promise(resolve => setTimeout(resolve, 500));
  // },

  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @returns {HTMLElement} The root element
   */

  transform: async ({ document, params }) => {

    await setGlobals(params.originalURL);

    const [breadcrumbType, breadcrumb] = createBreadcrumbs(document);

    /*
     * clean
     */

    WebImporter.DOMUtils.remove(document, [
      `.globalnavheader, header, footer, .faas-form-settings, .xf, style, northstar-card-collection, consonant-card-collection`,
    ]);



    /*
     * content
     */

    const main = document.createElement('div')

    main.append(breadcrumb);

    let sectionsRootElSelector = '.root main .content';

    if (document.querySelector(sectionsRootElSelector).textContent.trim() === '') {
      sectionsRootElSelector = '.root';
    }

    const sections = [...document.querySelectorAll(`${sectionsRootElSelector} > div > div`)];
    
    let foundVideo = false;

    if (sections.length > 0) {

      console.log(sections.length)
      console.log(sections)
      let marquee
      while(sections.length > 0) {
        // const [ marquee, found ] = createMarquee(marqueeEl, document);
        marquee = await parseMarquee(sections.shift(), document, null)
        let isEmpty = true
        let skip = true
        marquee.querySelectorAll("tr").forEach(item => {
          if (!skip) {
            item.querySelectorAll("td > div").forEach(td => {
              if (td.innerHTML.trim() !== "") {
                isEmpty = false
              }
            })
          }
          skip = false
        })
        if (!isEmpty) {
          break
        }
      }
      
      // foundVideo = found;
      main.append(marquee);

      sections.forEach((section, idx) => {
        section.querySelectorAll('.text, .flex').forEach((el) => {
          main.append(el);
        });
      });
    }

    /*
     * metadata
     */

    main.append(createMetadata(main, document));

    
    // if robots doesn't have noindex include Card Metadata;
    let tagsConvertedString = 'false'
    if (!getMetadataValue(document, 'robots')?.toLowerCase()?.includes('noindex')) {
      const { block, tagsConverted } = parseCardMetadata(document, params.originalURL);
      tagsConvertedString = tagsConverted.toString()
      main.append(block);
    }

    /*
     * return + custom report
     */

    return [{
      element: main,
      path: generateDocumentPath({ document, url: params.originalURL }),
      report: {
        'breadcrumb type': breadcrumbType,
        'tags converted?': tagsConvertedString,
        'found video': foundVideo ? 'true' : 'false',
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
    const path = new URL(url).pathname.replace(/\/$/, '').replace('.html', '').replace('-', '_');
    return WebImporter.FileUtils.sanitizePath(path);
  },

};

const generateDocumentPath = ({ document, url }) => {
  const path = new URL(url).pathname.replace(/\/$/, '').replace('.html', '').replace('-', '_');
  return WebImporter.FileUtils.sanitizePath(path);
};