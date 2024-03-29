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

import { handleFaasForm, waitForFaasForm } from '../../parsers/handleFaasForm.js';
import { parseCardMetadata } from '../../parsers/metadata.js';
import { cleanupHeadings, setGlobals, findPaths, getMetadataValue, getRecommendedArticles, generateDocumentPath } from '../../utils.js';
import { getNSiblingsElements } from '../../parsers/utils.js';
import { getXPathByElement } from '../../utils.js';

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
  meta.image = createImage(document, `https://business.adobe.com${getMetadataValue(document, 'og:image')}`);
  meta['caas:content-type'] = getMetadataValue(document, 'caas:content-type') ?? 'webinar';

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  return block;
};

const createImage = (document, url)  => {
  const img = document.createElement('img');
  img.src = url;
  return img;
};

const createMarquee = (marqueeDoc, document, originalURL) => {
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
  if(cta && cta.href.includes("register-form")) {
    cta = null
  }
  else if (cta) {
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
    [`<h1>${title}</h1>
    ${price}
    ${length}
    ${description ? description.textContent : ''}
    ${cta ? `<strong>${cta.outerHTML}</strong>` : ''}`,
    marqueeDoc.querySelector('img') || ''],
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  marqueeDoc.querySelector('h1')?.remove();
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

const createEventSpeakersAltVersion = (main, document) => {
  document.querySelectorAll('.horizontalRule').forEach(item => item.remove())
  let els = getNSiblingsElements(document, (n) => n === 2)
  if (!els || els.length == 0) {
    return ''
  }
  // speaker div
  els = getNSiblingsElements(els[0], (n) => n >= 2)
  if (!els || els.length == 0) {
    return ''
  }
  // title + event description
  const texts = document.createElement('div')
  els
    .filter(item => !item.classList.contains('dexter-Spacer') && !item.querySelector('img'))
    .map(item => {
      return item.querySelector('.cmp-text') || item.querySelector('.cmp-title')
    })
    .filter(item => item)
    .forEach(item => {
      texts.append(item)
      texts.append(document.createElement('br'))
    })
  
    // speakers
  const speakers = els
    .filter(item => !item.classList.contains('dexter-Spacer'))
    .map(item => {
      let images = item.querySelectorAll('img')
      if(!images) {
        return null
      }
      const tmpSpeakers = []
      images.forEach((image) => {
        if (!image.src) {
          return
        }
        const speaker = [];
        console.log(image.classList)
        console.log(getXPathByElement(image))
        speaker.push(image);
        let nextEl = image.closest('.image')
        while(nextEl) {
          const texts = nextEl.querySelectorAll('.cmp-text')
          if(texts && texts.length === 2){
            speaker.push(`<p><strong>${texts[0].innerHTML}</strong></p><p>${texts[1]?.innerHTML}</p>`);
          } else if(texts && texts.length === 1) {
            speaker.push(texts[0].innerHTML)
            // speaker.push('Read more')
          }
          nextEl = nextEl.nextElementSibling
        }
        if(speaker.length <= 2){
          speaker.push('')
        }
        tmpSpeakers.push(speaker)
      })
      return tmpSpeakers
    })
    .filter(item => item)
    .flat()

    if (!speakers || speakers.length === 0) {
      return '';
    }
    els.forEach(item => item.remove())

    const container = document.createElement('div')
    container.append(
      WebImporter.DOMUtils.createTable([
        ['Text (full width)'],
        [texts]
      ], document)
    )
    container.append(document.createElement('hr'))
    container.append(
      WebImporter.DOMUtils.createTable([
        ['Event Speakers'],
        ...speakers,
      ], document)
    )
    return container
};

const createRelatedProducts = (main, document) => {
  const relatedProducts = document.querySelector('.title h2')?.closest('.position');
  if (relatedProducts) {
    relatedProducts.nextElementSibling?.remove();
    const cells = [
      ['Text (vertical)'],
      ['#f5f5f5'],
      [relatedProducts],
    ];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    return table;
  }
  return '';
};

const appendBackward = (elements, main) => {
  for (let i=elements.length-1; i>=0; i--) {
    main.prepend(elements[i]);
  }
}

const createBreadcrumbs = (document) => {
  // default breadcrumb
  const defaultLink = window.local.split('/')[0] || '';
  let bcType = 'default';
  let bcContent = WebImporter.DOMUtils.createTable([['breadcrumbs'],[`<ul><li><a href="/${defaultLink}">Home</a></li><li>Adobe Resource Center</li></ul>`]], document);

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
  onLoad: async ({ document, url }) => {
    await waitForFaasForm(document);
  },

  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @returns {HTMLElement} The root element
   */
  transform: async ({ document, params}) => {
    await setGlobals(params.originalURL);
    // console.log(window.fetchUrl);
    let titleElement = document.querySelector('.faasform')?.closest('.aem-Grid')?.querySelector('.cmp-text');
    titleElement = titleElement || document.querySelector('.faasform')?.closest('.aem-Grid')?.querySelector('.cmp-title')
    const formLink = handleFaasForm(document, document, titleElement);
    
    const [breadcrumbType, breadcrumb] = createBreadcrumbs(document);

    // console.log(breadcrumbType, breadcrumb.innerHTML, params.originalURL);

    const rec = await getRecommendedArticles(document, document)

    WebImporter.DOMUtils.remove(document, [
      `header, footer, .faas-form-settings, .xf, style, northstar-card-collection, consonant-card-collection`,
      '.globalnavheader', 
      '.globalNavHeader',
    ]);
    const main = document.querySelector('main');

    cleanupHeadings(document.body);

    // Top area
    const elementsToGo = [];
    elementsToGo.push(breadcrumb);
    elementsToGo.push(createMarquee(document.querySelector('.dexter-FlexContainer'), document, new URL(params.originalURL)));
    // const h2 = document.querySelector('.title h2');
    // if (h2) {
    //   elementsToGo.push(
    //     WebImporter.DOMUtils.createTable([
    //       ['Text (full width)'],
    //       [h2]
    //     ], document)
    //   );
    // }

    // const eventSpeakers = createEventSpeakers(main, document);
    const eventSpeakers = createEventSpeakersAltVersion(main, document);
    if (eventSpeakers) {
      // elementsToGo.push(document.createElement('hr'));
      elementsToGo.push(eventSpeakers);
      // elementsToGo.push(createRelatedProducts(main, document));
      if (formLink) {
        const form = document.createElement('p');
        form.append(formLink);
        elementsToGo.push(form);
      }
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
        // console.log('looking at',p.textContent.trim());
        const str = p.textContent.trim().toLowerCase();
        if (str && !str.match(/\|.*\|/) && !str.match(/\/.*\//)) {
          // console.log('found',p.textContent);
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
    
    // main.append(createRelatedProducts(main, document))
    // All other content from page should be automatically added here //
    const recommendedArticles = document.createElement('p');
    recommendedArticles.append(rec);
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
