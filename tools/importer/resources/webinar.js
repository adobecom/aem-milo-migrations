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

import handleFaasForm from '../rules/handleFaasForm.js';
import { cleanupHeadings, setGlobals, findPaths, getMetadataValue, getRecommendedArticles } from '../utils.js';

const createMetadata = (main, document) => {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.innerHTML.replace(/[\n\t]/gm, '');
  }
  meta.robots = getMetadataValue(document, 'robots');
  meta.Description = getMetadataValue(document, 'og:description');
  meta.keywords = getMetadataValue(document, 'keywords');
  meta['serp-content-type'] = getMetadataValue(document, 'serp-content-type');
  meta.pageCreatedAt = getMetadataValue(document, 'pageCreatedAt');
  meta.translated = getMetadataValue(document, 'translated');
  meta.publishDate = getMetadataValue(document, 'publishDate');
  meta.productJcrID = getMetadataValue(document, 'productJcrID');
  meta.primaryProductName = getMetadataValue(document, 'primaryProductName');
  meta.image = `https://business.adobe.com${getMetadataValue(document, 'og:image')}`;
  meta['caas:content-type'] = getMetadataValue(document, 'caas:content-type') ?? 'webinar';

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  return block;
};

const createCardMetadata = (main, document) => {  
  const cells = [
    ['Card Metadata'],
    ['cardTitle', getMetadataValue(document, 'cardTitle')],
    ['cardImagePath', `https://business.adobe.com${getMetadataValue(document, 'cardImagePath')}`],
    ['CardDescription', getMetadataValue(document, 'cardDesc')],
    ['primaryTag', `caas:content-type/${getMetadataValue(document, 'caas:content-type')}`],
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  return table;
};

const createMarquee = (main, document, originalURL) => {
  let marqueeDoc = document.querySelector('.dexter-FlexContainer');
  if (!marqueeDoc.textContent.trim()) {
    marqueeDoc = document.querySelectorAll('.dexter-FlexContainer')[1];
  }
  const eyebrow = marqueeDoc.querySelector('p')?.textContent?.toUpperCase().trim() || 'REPORT';
  const title = marqueeDoc.querySelector('h1')?.textContent;
  const bgURL = marqueeDoc.style.backgroundImage?.slice(4, -1).replace(/"/g, "") || '';
  const priceElement = marqueeDoc.querySelectorAll('b')[0]?.parentElement;
  const price = priceElement ? priceElement.outerHTML : '<p><b>Price:</b> Free</p>';
  const lengthElement = marqueeDoc.querySelectorAll('b')[1]?.parentElement;
  const webinarDuration = getMetadataValue(document, 'webinarDuration');
  const length = lengthElement ? lengthElement.outerHTML : `<p><b>Length:</b> ${ webinarDuration ? `${webinarDuration} min` : 'Unkwown'}</p>`;
  const description = marqueeDoc.querySelectorAll('b')[marqueeDoc.querySelectorAll('b').length-1]?.closest('.text').nextElementSibling;
  let { pathname } = originalURL;
  let path = pathname.replace('.html', '');
  let cta = marqueeDoc.querySelector('.dexter-Cta a');
  if (cta) {
    cta.href = `/fragments/resources/modal/forms/${path.split('/').at(-1)}#faas-form`;
  }
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
    ${price}
    ${length}
    ${description ? description.textContent : ''}
    ${cta ? `<strong>${cta.outerHTML}</strong>` : ''}`,
    marqueeDoc.querySelector('img') || ''],
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  document.querySelector('h1')?.remove();
  marqueeDoc.remove();
  return table;
};

const createEventSpeakers = (main, document) => {
  const h2 = document.querySelector('.title h2');
  if (!h2) return '';
  const parent = h2.closest('.position');
  const speakers = [];
  parent.querySelectorAll('img').forEach((image) => {
    if (image.src) {
      const speaker = [];
      speaker.push(image);
      const texts = image.closest('.image').nextElementSibling.querySelectorAll('.cmp-text');
      speaker.push(`<p><strong>${texts[0].innerHTML}</strong></p><p>${texts[1]?.innerHTML}</p>`);
      const secoundTexts = [];
      for(let i = 2; i < texts.length; i++) {
        if (!texts[i].closest('.text').nextElementSibling?.classList.contains('cta')) {
          secoundTexts.push(`<p>${texts[i].innerHTML}</p`); 
        }
      };
      speaker.push(`${secoundTexts}`);
      speaker.push(`${image.closest('.image').nextElementSibling.querySelector('a')?.textContent || ''}`);
      speakers.push(speaker);
    }
  });
  if (!speakers.length) {
    return '';
  }
  const cells = [
    ['Event Speakers'],
    ...speakers,
  ];
  parent.remove();
  const table = WebImporter.DOMUtils.createTable(cells, document);
  return table;
};

const createRelatedProducts = (main, document) => {
  const relatedProducts = document.querySelector('.title h2').closest('.position');
  relatedProducts.nextElementSibling?.remove();
  const cells = [
    ['Text (vertical)'],
    ['#f5f5f5'],
    [relatedProducts],
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
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
    return '';
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
  transformDOM: async ({ document, params}) => {
    await setGlobals(params.originalURL);
    console.log(window.fetchUrl);
    const titleElement = document.querySelector('.faasform')?.closest('.aem-Grid')?.querySelector('.cmp-text');
    const formLink = handleFaasForm(document, document, titleElement);
    WebImporter.DOMUtils.remove(document, [
      `header, footer, .faas-form-settings, .xf, style, northstar-card-collection, consonant-card-collection`,
      '.globalnavheader', 
      '.globalNavHeader',
    ]);
    const main = document.querySelector('main');

    cleanupHeadings(document.body);

    // Top area
    const elementsToGo = [];
    elementsToGo.push(createBreadcrumbs(main, document));
    elementsToGo.push(createMarquee(main, document, new URL(params.originalURL)));
    elementsToGo.push(WebImporter.DOMUtils.createTable([
      ['Section Metadata'],
      ['style', 'L spacing'],
    ], document));
    elementsToGo.push(document.createElement('hr'));
    const h2 = document.querySelector('.title h2');
    if (h2) {
      elementsToGo.push(h2);
    }

    const eventSpeakers = createEventSpeakers(main, document);
    if (eventSpeakers) {
      if (formLink) {
        elementsToGo.push(document.createElement('hr'));
        const form = document.createElement('p');
        form.append(formLink);
        elementsToGo.push(form);
      }

      elementsToGo.push(document.createElement('hr'));
      elementsToGo.push(eventSpeakers);
      elementsToGo.push(createRelatedProducts(main, document));
      elementsToGo.push(WebImporter.DOMUtils.createTable([
        ['Section Metadata'],
        ['style', 'Two-up'],
      ], document));
      elementsToGo.push(document.createElement('hr'));
    } else {
      // try to find the content
      elementsToGo.push(document.createElement('hr'));
      let content;

      [...document.querySelectorAll('.dexter-FlexContainer .text p')].some((p) => {
        console.log('looking at',p.textContent.trim());
        const str = p.textContent.trim().toLowerCase();
        if (str && !str.match(/\|.*\|/)) {
          console.log('found',p.textContent);
          content = p.closest('.dexter-FlexContainer');
          return true;
        }
        return false;
      });

      if (content) {
        if (formLink) {
          const form = document.createElement('p');
          form.append(formLink);
        
          const cells = [['Columns (contained)']];
          cells.push([content, form])
          const table = WebImporter.DOMUtils.createTable(cells, document);
          elementsToGo.push(table);
        } else {
          elementsToGo.push(content);
        }
        elementsToGo.push(document.createElement('hr'));
      } else {
        if (formLink) {
          const form = document.createElement('p');
          form.append(formLink);
          elementsToGo.push(form);
          elementsToGo.push(document.createElement('hr'));
        }
      }
    }
    appendBackward(elementsToGo, main);
    
    // All other content from page should be automatically added here //
    const recommendedArticles = document.createElement('p');
    recommendedArticles.append(await getRecommendedArticles(main, document));
    main.append(recommendedArticles);

    document.querySelectorAll('.cta a').forEach(link => {link.href.includes('/resources/main') ? link.remove() : false});
    
    // Bottom area
    const cells = [
      ['Section Metadata'],
      ['style', 'L spacing, center'],
    ];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    main.append(table);
    elementsToGo.push(document.createElement('hr'));
    main.append(createMetadata(main, document));
    
    // if robots doesn't have noindex include Card Metadata;
    if (!getMetadataValue(document, 'robots')?.toLowerCase()?.includes('noindex')) {
      main.append(createCardMetadata(main, document));
    }
    
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
    return pathname;
  },
};
