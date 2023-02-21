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

import { cleanupHeadings, setGlobals, findPaths, getMetadataValue, getRecommendedArticles } from '../utils.js';

const createMetadata = (document) => {
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

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  return block;
};

const createImage = (document, url)  => {
  const img = document.createElement('img');
  img.src = url;
  return img;
};

const createMarquee = (main, document, originalURL) => {
  let marqueeDoc = document.querySelector('.dexter-FlexContainer');


  /*
   * texts
   */

  const textElements = [];

  ['text', 'title', 'cta'].forEach((className) => {
    marqueeDoc.querySelectorAll(`.${className}`).forEach((element) => {
      if (className === 'cta') {
        const link = element.querySelector('a');
        if (link.href.indexOf('#watch-now') > -1) {
          return;
        }
      }
      textElements.push(element.innerHTML);
    });
  });

  /*
   * background
   */

  const background =  WebImporter.DOMUtils.getImgFromBackground(marqueeDoc, document) || '#F8F8F8';

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

  /*
   * create table
   */

  const cells = [
    ['marquee (medium, light)'],
    [background],
    [textElements.join(''), (resource || '')],
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  document.querySelector('h1')?.remove();
  marqueeDoc.remove();
  return table;
};

const createCardMetadata = (document) => {  
  const cells = [
    ['Card Metadata'],
    ['title', getMetadataValue(document, 'cardTitle')],
    ['cardImagePath', createImage(document,`https://business.adobe.com${getMetadataValue(document, 'cardImagePath')}`)],
    ['CardDescription', getMetadataValue(document, 'cardDesc')],
    ['primaryTag', `caas:content-type/${getMetadataValue(document, 'caas:content-type')}`],
    ['tags', `${getMetadataValue(document, 'cq:tags')}`],
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  return table;
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
  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @returns {HTMLElement} The root element
   */
  transformDOM: async ({ document, params}) => {
    await setGlobals(params.originalURL);
    console.log(window.fetchUrl);
    
    const [breadcrumbType, breadcrumb] = createBreadcrumbs(document);

    WebImporter.DOMUtils.remove(document, [
      `header, footer, .faas-form-settings, .xf, style, northstar-card-collection, consonant-card-collection`,
      '.globalnavheader', 
      '.globalNavHeader',
    ]);
    
    cleanupHeadings(document.body);
    
    const elementsToPush = [breadcrumb];
    // content.prepend(breadcrumb);
    
    const content = document.querySelector('.content');
    const sections = [];
    content.querySelectorAll(`:scope > div > div`).forEach((section) => {
      console.log(section.textContent.trim().replaceAll(/\s+/gm, ' '));
      if (!section.classList.contains('ghost') && !section.classList.contains('dexter-Spacer') && !section.classList.contains('aem-GridColumn--phone--none') && section.innerText !== '' && section.querySelector(':scope .horizontalRule') === null && section.textContent.trim().replaceAll(/\s+/gm, '') !== '') {
        sections.push(section);
      }
    });
    console.log(sections.length);

    sections.forEach((section) => {
      console.log('>>>', section.textContent.trim().replaceAll(/\s+/gm, ' '), '<<<');
    });

    // marquee
    const marqueeEl = sections.shift();
    elementsToPush.push(createMarquee(marqueeEl, document, new URL(params.originalURL)));
    elementsToPush.push(document.createElement('hr'));



    // potential aside #0
    // console.log('=======================');
    // console.log(sections[0].innerHTML.trim());
    // console.log('=======================');
    if (sections[0].querySelector(':scope img[src*="DX-banner-DT23"]')) {
      console.log('remove extra aside!')
      sections.shift();
    }



    // aside #1
    const aside1 = sections.shift();

    const aside1Items = aside1.querySelectorAll('.dexter-FlexContainer-Items > div');
    elementsToPush.push(WebImporter.DOMUtils.createTable([
      ['aside (inline)'],
      ['#F5F5F5'],
      [aside1Items[1], aside1Items[0]],
    ], document));
    elementsToPush.push(WebImporter.DOMUtils.createTable([
      ['section metadata'],
      ['style', 'xl spacing, center']
    ], document));
    elementsToPush.push(document.createElement('hr'));



    // z pattern
    const zPatternCells = [
      ['z-pattern (medium)'],
    ];

    if (!sections[0].querySelector('img')) {
      const zPFirstEl = sections.shift();
      const zPFirstElTitle = zPFirstEl.querySelector('h2') || '';
      const zPFirstElText = zPFirstEl.querySelector('p') || '';
      zPatternCells.push([
        `${zPFirstElTitle.outerHTML}${zPFirstElText.outerHTML}`,
      ])
    }

    for (var i = 0; i < 3; i++) {
      const zPRow1El = sections.shift();
      // console.log(zPRow1El.innerHTML);
      const zPRow1Img = zPRow1El.querySelector('img');
      const zPRow1Content = zPRow1El.querySelector('.position');
      zPatternCells.push([
        zPRow1Img, zPRow1Content
      ])
    }
    elementsToPush.push(WebImporter.DOMUtils.createTable(zPatternCells, document));



    // link/button - Learn more about experience personalisation
    // skip this one
    sections.shift();

    // aside #2
    const aside2 = sections.shift();

    const aside2Items = aside2.querySelectorAll('.dexter-FlexContainer-Items > div');
    elementsToPush.push(WebImporter.DOMUtils.createTable([
      ['aside (inline)'],
      ['#F5F5F5'],
      [aside2Items[1], aside2Items[0]],
    ], document));



    // skip this one
    sections.shift();



    // bottom elements
    const bottom = sections.shift();

    const bottomTitle = bottom.querySelector('h2') || '';
    const bottomText = bottom.querySelector('p') || '';
    elementsToPush.push(WebImporter.DOMUtils.createTable([
      ['text (intro, medium, center)'],
      [`${bottomTitle.outerHTML}${bottomText.outerHTML}`],
    ], document));
    elementsToPush.push(document.createElement('hr'));

    const bottomEls = bottom.querySelectorAll(':scope .container > div > div');
    const columns = bottomEls[1];

    const columnsEls = columns.querySelectorAll(':scope .position');

    // const infoGraphicEls = [];

    for (var i = 0; i < 3; i++) {
      const columnEl = columnsEls[i];
      const img = columnEl.querySelector('img');
      const text = columnEl.querySelector('p');

      const el = WebImporter.DOMUtils.createTable([
        ['text (vertical, center)'],
        [`${img.outerHTML}${text.outerHTML}`],
      ], document);
      elementsToPush.push(el);
    }

    elementsToPush.push(WebImporter.DOMUtils.createTable([
      ['section metadata'],
      ['style', 'three-up, s-spacing']
    ], document));
    elementsToPush.push(document.createElement('hr'));



    // read the study
    const link = columnsEls[3];
    elementsToPush.push(WebImporter.DOMUtils.createTable([
      ['text (full-width, no spacing)'],
      [link],
    ], document));
    elementsToPush.push(document.createElement('hr'));


    // https://main--bacom--adobecom.hlx.page/fragments/resources/request-demo
    const demoLink = document.createElement('a');
    demoLink.href = 'https://main--bacom--adobecom.hlx.page/fragments/resources/request-demo';
    demoLink.textContent = 'https://main--bacom--adobecom.hlx.page/fragments/resources/request-demo';
    elementsToPush.push(demoLink);
    elementsToPush.push(WebImporter.DOMUtils.createTable([
      ['section metadata'],
      ['style', 'XXL Spacing, center'],
      ['background', '#ffffff'],
    ], document));

    elementsToPush.push(createMetadata(document));
    elementsToPush.push(createCardMetadata(document));



    /*
     * final page
     */

    content.innerHTML = '';
    elementsToPush.forEach((el) => {
      content.append(el);
    });



    /*
     * return
     */

    return content;
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
    return WebImporter.FileUtils.sanitizePath(pathname);
  },
};
