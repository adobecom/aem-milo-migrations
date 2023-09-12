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

import { cleanupHeadings, setGlobals, findPaths, getMetadataValue, getRecommendedArticles } from '../../utils.js';

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

const createMarquee = (main, document, backgroundColor) => {
  let marqueeDoc = main; //, document.querySelector('.dexter-FlexContainer');

  /*
   * texts
   */

  const textElements = [];

  const title = marqueeDoc.querySelector('.title');
  if (title) {
    textElements.push(title.innerHTML);
  }

  const text = marqueeDoc.querySelector('.text');
  if (text) {
    textElements.push(text.innerHTML);
  }

  const cta = marqueeDoc.querySelector('.cta');
  if (cta) {
    const link = cta.querySelector('a');
    if (link.href.indexOf('#watch-now') < 0) {
      const str = document.createElement('B');
      str.append(cta);
      textElements.push(str.outerHTML); 
    }
  }

  /*
   * background
   */

  const background =  WebImporter.DOMUtils.getImgFromBackground(marqueeDoc, document) || backgroundColor || '#000000';

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
  onLoad: async ({ document }) => {
    await waitForFaasForm(document);
  },

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
      `header, footer, .xf, style, northstar-card-collection, consonant-card-collection`,
      '.globalnavheader', 
      '.globalNavHeader',
    ]);
    
    cleanupHeadings(document.body);
    
    const elementsToPush = [breadcrumb];
    // content.prepend(breadcrumb);


    
    /*
     * collect all sections
     */

    const sections = [];

    const content = document.querySelector('.content');
    content.querySelectorAll(`:scope > div > div`).forEach((section) => {
      console.log(section.textContent.trim().replaceAll(/\s+/gm, ' '));
      if (!section.classList.contains('ghost') && !section.classList.contains('dexter-Spacer') && !section.classList.contains('aem-GridColumn--phone--none') && !section.classList.contains('aem-GridColumn--default--hide') && section.innerText !== '' && section.querySelector(':scope .horizontalRule') === null && section.textContent.trim().replaceAll(/\s+/gm, '') !== '') {
        sections.push(section);
      }
    });

    // section 1 - marquee #1
    const marqueeEl = sections.shift();
    elementsToPush.push(createMarquee(marqueeEl, document, '#000000'));
    elementsToPush.push(document.createElement('hr'));



    // section 2
    const section2 = sections.shift();
    const s2Title = section2.querySelector('.title');
    const s2Text = section2.querySelector('.text');
    elementsToPush.push(WebImporter.DOMUtils.createTable([
      ['text (full-width)'],
      [s2Title.outerHTML + s2Text.outerHTML],
    ], document));
    elementsToPush.push(WebImporter.DOMUtils.createTable([
      ['section metadata'],
      ['style', 'blue section']
    ], document));
    elementsToPush.push(document.createElement('hr'));



    // section 3
    const section3 = sections.shift();

    // columns
    const cols = section3.querySelector('.container .dexter-FlexContainer-Items').querySelectorAll(':scope > div');

    for (var i = 0; i < 3; i++) {
      const columnEl = cols[i];
      const el = WebImporter.DOMUtils.createTable([
        ['text (vertical, center)'],
        [columnEl.outerHTML],
      ], document);
      elementsToPush.push(el);
    }

    elementsToPush.push(WebImporter.DOMUtils.createTable([
      ['section metadata'],
      ['style', 'three-up, s-spacing']
    ], document));
    elementsToPush.push(document.createElement('hr'));

    // get the report button
    const link = section3.querySelector('.cta a');
    if (link) {
      elementsToPush.push(WebImporter.DOMUtils.createTable([
        ['text (full-width, no spacing)'],
        [link],
      ], document));
      elementsToPush.push(document.createElement('hr'));
    }

    elementsToPush.push(WebImporter.DOMUtils.createTable([
      ['section metadata'],
      ['style', 'get the report button']
    ], document));
    elementsToPush.push(document.createElement('hr'));



    // section 4
    const section4 = sections.shift();
    const title = section4.querySelector('.title');
    const text = section4.querySelector('.text');
    elementsToPush.push(WebImporter.DOMUtils.createTable([
      ['text (full-width)'],
      [title.outerHTML+text.outerHTML],
    ], document));



    // section 5
    const section5 = sections.shift();

    const chartsCols = [];
    const chartsEls = section5.querySelectorAll('.container .position');
    for (var i = 1; i < chartsEls.length; i++) {
      const chartEl = chartsEls[i];
      const imgEl = chartEl.querySelector('video source');
      const imgSrc = imgEl.src;
      const img = document.createElement('a');
      img.textContent = imgSrc;
      img.href = imgSrc;
      const text = chartEl.querySelector('h3');
      chartsCols.push(img.outerHTML+text.outerHTML);
    }
    elementsToPush.push(WebImporter.DOMUtils.createTable([
      ['columns'],
      chartsCols,
    ], document));

    // title
    const s5Title = section5.querySelectorAll('.container > div > div.title h1');
    elementsToPush.push(WebImporter.DOMUtils.createTable([
      ['text (full-width)'],
      [s5Title[0]],
    ], document));

    // legend
    const s5Legends = section5.querySelectorAll('.container > div > div.flex .text');
    elementsToPush.push(WebImporter.DOMUtils.createTable([
      ['columns (contained)'],
      [s5Legends[1].outerHTML, s5Legends[2].outerHTML],
    ], document));



    // section 6
    const section6 = sections.shift();
    elementsToPush.push(createMarquee(section6, document, '#E54A94'));
    elementsToPush.push(document.createElement('hr'));


    // section 7
    const section7 = sections.shift();

    // form
    const titleElement = section7.querySelector('h2');
    const formLink = handleFaasForm(section7, document, titleElement);

    elementsToPush.push(WebImporter.DOMUtils.createTable([
      ['text (full-width, xl spacing)'],
      [titleElement.outerHTML + formLink.outerHTML],
    ], document));



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
