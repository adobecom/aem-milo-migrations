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

import { handleFaasForm, waitForFaasForm } from '../rules/handleFaasForm.js';
import { setGlobals, cleanupParagraphs, getJSONValues, getMetadataValue, isLightColor } from '../utils.js';
import { parseCardMetadata, parseMetadata } from '../rules/metadata.js';
import { extractBackground } from '../rules/bacom.js';
import { getNSiblingsElements, textColorFromRecursiveCSS } from '../rules/utils.js';

const createImage = (document, url)  => {
  const img = document.createElement('img');
  img.src = url;
  return img;
};

const createMarquee = (main, document) => {
  const el = document.querySelector('.dexter-FlexContainer') || document.querySelector('.dexter-Position');
  let marqueeDoc = el
  let els = getNSiblingsElements(el, (c) => c === 2)

  /*
   * theme
   */

  const container = document.createElement('div')
  if (els) {
    // handle empty / hidden divs
    let emptyNodeIndx = -1
    for (var i = 0; i < els.length; i++) {
      if (!els[i].hasChildNodes()) {
        emptyNodeIndx = i
        break
      }
    }
    if (emptyNodeIndx >= 0) {
      const targetInd = emptyNodeIndx === 0 ? emptyNodeIndx + 1 : emptyNodeIndx - 1
      els = getNSiblingsElements(els[targetInd], (c) => c >= 2)
    }

    /*
    * texts
    */

    // The right marquee heading should follow the same template:
    // detail + title + optional long text
    // Unfortunately, both the detail and the text use the same class "text" so order matters

    let detail = null;
    let title = '';
    let longtext = null;

    for (var i = 0; i < els.length; i++) {
      const tmpel = els[i];
      const img = tmpel.querySelector('img')
      const video = tmpel.querySelector('video.video-desktop')

      // don't add images and videos
      // add only text and titles (there might ctas, those are links to forms that are handled by the faas-form logic)
      if (!img && !video) {
        const titles = tmpel.querySelectorAll('.title');
        titles.forEach ( hTitle => { 
          title += hTitle.textContent;
        })

        const texts = tmpel.querySelectorAll('.text');
        // we expect one or two texts
        if (texts.length > 2) {
          console.error(`Found a case with more than two texts in marquee (${texts.length})`);
        } else if (texts.length === 2) {
          detail = texts[0];
          longtext = texts[1];
        } else {
          detail = texts[0];
        }
      }
    }

    container.append(detail);
    
    if (title) {
      const hTitle = document.createElement('H1')
      hTitle.innerHTML = title;
      container.append(hTitle);
    }

    if (longtext)
      container.append(longtext);

    // sanitize links inside ul/li
    container.querySelectorAll('ol li a, ul li a').forEach((a) => {
      const t = a.textContent;
      a.querySelectorAll('*').forEach((n) => n.remove());
      a.textContent = t;
    });
  } else {
    let title = '';

    // strategy 2
    // I found multiple titles in some example
    const titles = marqueeDoc.querySelectorAll('.title');
    titles.forEach ( tTitle => { 
      title += tTitle.textContent;
    })

    if (title) {
      const hTitle = document.createElement('H1')
      hTitle.innerHTML = title;
      container.append(hTitle);
    }
  
    const text = marqueeDoc.querySelector('.text');
    if (text) {
      container.append(text)
    }
  
    const cta = marqueeDoc.querySelector('.cta');
    if (cta) {
      const link = cta.querySelector('a');
      if (link.href.indexOf('#watch-now') < 0) {
        const str = document.createElement('B');
        str.append(cta);
        container.append(str)
      }
    }
  }

  /*
  * theme and background
  */

  // The theme is forced on light and background to f5f5f5 as per BACOM's instructions
  let background = '#f5f5f5'
  let theme = 'light';

  /*
  * image + resource
  */

  let resource = null;

  const image = marqueeDoc.querySelector('.image');

  if (image) {
    let img = image.querySelector('img');
    if (img) {
      resource = createImage(document, img.src);  
    }
    
    const link = image.querySelector('a');
    if (link) {
      if (link.href.indexOf('#watch-now') > -1) {
        const watchNowEl = document.querySelector('#watch-now');
        if (watchNowEl) {
          const videoIframe = watchNowEl.querySelector('iframe');
          if (videoIframe) {
            resource = videoIframe.src || videoIframe.dataset.videoSrc;
          }
        }
      }
    }
  }

  const video = marqueeDoc.querySelector('video.video-desktop');
  if (video) {
    const source = video.querySelector('source');
    // const l = document.createElement('a');
    // l.textContent = source.src;
    // l.href = source.src;
    resource = source.src;
    console.log("Resource: " + JSON.stringify(resource))
  }


  /*
  * create table
  */

  const cells = [
    [`marquee (small, ${theme})`],
    [background],
    [container, (resource || '')],
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  // document.querySelector('h1')?.remove();
  // marqueeDoc.remove();
  return table;
};

const createColumns = (main, document, formLink) => {
  const el = document
  if (el.querySelector('.dexter-FlexContainer')) {
    el.querySelector('.dexter-FlexContainer').remove()
  }
  const contentBody = el.querySelectorAll('.flex')[1];

  // Remove Adobe logo from content
  const adobelogo = contentBody.querySelector("img[src$='AdobeLogo.svg']");
  if (adobelogo) {
    adobelogo.remove();
  }

  if (formLink[0].nodeName === 'A') {
    const cells = [
      ['Columns (contained)'],
      [contentBody, formLink[0] || ''],
    ];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    return [table, formLink[1]];
  } else {
    return [contentBody, ...formLink || ''];
  }
  
};

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
  const img = document.createElement('img');
  img.src = `https://business.adobe.com${getMetadataValue(document, 'og:image')}`
  meta.image = img;
  const cqTags = getJSONValues(window.jcrContent, 'cq:tags');
  meta.tags = cqTags.length ? cqTags.join(', ') : '';
  meta['caas:content-type'] = getMetadataValue(document, 'caas:content-type');

  return WebImporter.Blocks.getMetadataBlock(document, meta);;
};

const getFormLink = async (document, faasTitleSelector, originalURL) => {
  const formContainer = document.querySelector('.marketoForm');
  if (formContainer) {
    const marketoForm = document.querySelector('.marketo-form');
    const mktoCells = [
      ['Marketo'],
      ['Title', formContainer.querySelector('p')?.textContent || ''],
      ['Form ID', getJSONValues(window.jcrContent, 'formId')[0] || marketoForm.getAttribute('data-marketo-form-id')],
      ['Base URL', getJSONValues(window.jcrContent, 'baseURL')[0] || marketoForm.getAttribute('data-marketo-baseurl')],
      ['Munchkin ID', getJSONValues(window.jcrContent, 'munchkinId')[0] || marketoForm.getAttribute('data-marketo-munchkin-id')],
      ['Destination URL', originalURL.pathname.replace('.html', '/thank-you')],
    ];
    const mktoTable = WebImporter.DOMUtils.createTable(mktoCells, document);
    formContainer.remove();
    const cells = [
      ['Section Metadata'],
      ['style', 'container, xxl spacing, divider, two-up'],
    ];
    return [mktoTable, WebImporter.DOMUtils.createTable(cells, document)];
  }

  const cells = [
    ['Section Metadata'],
    ['style', 'container, xxl spacing'],
  ];

  const formLink = handleFaasForm(document, document, faasTitleSelector);
  return [formLink, WebImporter.DOMUtils.createTable(cells, document)];
};

const appendBackward = (elements, main) => {
  for (let i=elements.length-1; i>=0; i--) {
    main.prepend(elements[i]);
  }
}



export default {
  onLoad: async ({ document }) => {
    await waitForFaasForm(document);
  },

  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @returns {HTMLElement} The root element
   */
  transform: async ({ document, params }) => {
    await setGlobals(params.originalURL);

    // get the form title from either the text or the title in the faas-form structure
    // let titleElement = document.querySelector('.faasform')?.closest('.aem-Grid')?.querySelector('.cmp-text');
    // titleElement = titleElement || document.querySelector('.faasform')?.closest('.aem-Grid')?.querySelector('.cmp-title')
    const titleElement = getFormTitleGatedOffers(document);
    console.log(`title element: ${titleElement.textContent}`);

    const formLink = await getFormLink(document, titleElement, new URL(params.originalURL));

    WebImporter.DOMUtils.remove(document, [
      `header, footer, .faas-form-settings, .xf`,
    ]);
    const main = document.querySelector('main');

    // Top area
    const elementsToGo = [];
    elementsToGo.push(createMarquee(main, document));
    elementsToGo.push('---');
    createColumns(main, document, formLink).forEach((c) => {elementsToGo.push(c)});
    elementsToGo.push('---');
    appendBackward(elementsToGo, main);

    // All other content from page should be automatically added here //

    // BACOM doesn't want recommended articles for Gated Offers
    // main.append(await getRecommendedArticles(document, document));

    // Bottom area
    const cells = [
      ['Section Metadata'],
      ['style', 'm spacing'],
    ];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    main.append(table);
    main.append('---');
    main.append(parseMetadata(document));
    const { block, tagsConverted } = parseCardMetadata(document);
    
    // if robots doesn't have noindex include Card Metadata;
    // let tagsConvertedString = 'false'
    // if (!getMetadataValue(document, 'robots')?.toLowerCase()?.includes('noindex')) {
      // const { block, tagsConverted } = parseCardMetadata(document, params.originalURL);
    let tagsConvertedString = tagsConverted.toString()
    main.append(block);
    // }

    cleanupParagraphs(main);

    WebImporter.DOMUtils.remove(main, [
    '.faasform',
    'style',
    ]);
    
    /** 
     * 
     * Returns report plus target link to final Franklin URL
     */

    const onedrive_subfolder = 'drafts/acapt/import-MWPW-129315/gated-offer-fabiano'
    const path = generateDocumentPath({ document, url: params.originalURL })

    return [{
      element: main,
      path: path,
      report: {
        'tags converted?': tagsConvertedString,
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

function generateDocumentPath({ document, url }) {
  let { pathname } = new URL(url);
  pathname = pathname.replace('.html', '')
  const sanitized =  WebImporter.FileUtils.sanitizePath(pathname);
  const localeFromURL = sanitized.split('/')[1];
  return sanitized.replace(localeFromURL, localeFromURL.replace('-', '_'));
}

/**
 * Get the form title for gated offers based on some heuristic
 * First tries to find the sibling element, if exists
 * If it doesn't goes to the parent and runs the same logic
 *
 * Logic being looking for a '.cmp-text' div and then the last of the paragraphs.
 * If the last paragraph is empty, take the second-to-last
 * @param document
 */
function getFormTitleGatedOffers(document) {
  let element;
  const previous = document.querySelector('.faasform').previousElementSibling;

  if (previous) {
    element = previous;
  } else {
    element = document.querySelector('.faasform').parentElement;
  }

  let innerElement = element.querySelector('.cmp-text');
  if (!innerElement){
    innerElement = document.querySelector('.faasform').closest('.aem-Grid').querySelector('.cmp-text');
  }

  const pars = innerElement.querySelectorAll('p');
  return pars[pars.length - 1];
}
