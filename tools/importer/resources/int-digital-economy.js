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

  const background =  WebImporter.DOMUtils.getImgFromBackground(marqueeDoc, document) || backgroundColor || '';

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

    
    cleanupHeadings(document.body);
    
    const elementsToPush = [breadcrumb];
    // content.prepend(breadcrumb);


    
    /*
     * collect all sections
     */

    const sections = [];

    const content = document.querySelector('.content');
    const divs = content.querySelectorAll(`:scope > div > div`);
    console.log('divs length: ', divs.length);
    divs.forEach((section) => {
      if (!section.classList.contains('ghost') && !section.classList.contains('dexter-Spacer') && !section.classList.contains('aem-GridColumn--phone--none') && !section.classList.contains('aem-GridColumn--default--hide') && section.innerText !== '' /*&& section.querySelector(':scope .horizontalRule') === null*/ && (section.textContent.trim().replaceAll(/\s+/gm, '') !== '' || section.querySelector('.dxf') !== null)) {
        sections.push(section);
      } else {
        console.log('skipping section');
        console.log(section.textContent.trim().replaceAll(/\s+/gm, ' '));
        console.log(section.querySelector('.dxf'));
        console.log(section.clientHeight);
        console.log(section.outerHTML);
      }
    });

    console.log(sections);
    console.log(sections.length);


    /*
     * section 1 - marquee
     */

    const marqueeEl = sections.shift();
    elementsToPush.push(createMarquee(marqueeEl, document, '#FBFBFB'));
    elementsToPush.push(document.createElement('hr'));


    /*
     * section 2
     */

    const section2 = sections.shift();
    const s2Content = section2.querySelector(':scope .container');
    elementsToPush.push(s2Content);
    elementsToPush.push(WebImporter.DOMUtils.createTable([
      ['section metadata'],
      ['style', 'xl spacing, center']
    ], document));

    elementsToPush.push(document.createElement('hr'));


    /*
     * section 3
     */

    const section3 = sections.shift();
    elementsToPush.push(section3);


    /*
     * section 4
     */

    const section4 = sections.shift();

    const s4Texts = section4.querySelector('.dexter-FlexContainer-Items > .flex');
    const s4Image = section4.querySelector('.dexter-FlexContainer-Items > .image');
    elementsToPush.push(WebImporter.DOMUtils.createTable([
      ['aside (inline)'],
      ['#FFFFFF'],
      [s4Texts, s4Image],
    ], document));

    elementsToPush.push(WebImporter.DOMUtils.createTable([
      ['section metadata'],
      ['style', 'xl spacing, center']
    ], document));
    elementsToPush.push(document.createElement('hr'));


    /*
     * section 5
     */

    const aside1 = sections.shift();

    const aside1Items = aside1.querySelectorAll('.dexter-FlexContainer-Items > div');

    // make links italic to trigger button decoration
    aside1Items[0].querySelectorAll('a').forEach((el) => {
      const str = document.createElement('i');
      el.before(str);
      str.append(el);
    });

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


    /*
     * section 6
     */

    const section6 = sections.shift();
    const s6Content = section6.querySelector(':scope h1');
    elementsToPush.push(WebImporter.DOMUtils.createTable([
      ['text (full-width)'],
      [s6Content],
    ], document));


    /*
     * section 7
     */

    const section7 = sections.shift();

    elementsToPush.push(await getRecommendedArticles(section7, document));
    elementsToPush.push(document.createElement('hr'));


    /*
     * section 8
     */

    const section8 = sections.shift();

    const subSections8 = section8.querySelector(':scope .position').querySelectorAll(':scope > div > div > div')
    elementsToPush.push(WebImporter.DOMUtils.createTable([
      ['text (full-width)'],
      [subSections8[0]],
    ], document));

    elementsToPush.push(WebImporter.DOMUtils.createTable([
      ['section metadata'],
      ['background', '#F5F5F5']
    ], document));
    elementsToPush.push(document.createElement('hr'));

    // make links italic to trigger button decoration
    subSections8[1].querySelectorAll('a').forEach((el) => {
      const str = document.createElement('i');
      el.before(str);
      str.append(el);
    });

    // columns
    const cols = subSections8[1].querySelector('.dexter-FlexContainer-Items').querySelectorAll(':scope .flex');
    for (var i = 0; i < 3; i++) {
      const columnEl = cols[i];
      const el = WebImporter.DOMUtils.createTable([
        ['card'],
        [columnEl.outerHTML],
      ], document);
      elementsToPush.push(el);
    }

    elementsToPush.push(WebImporter.DOMUtils.createTable([
      ['section metadata'],
      ['style', '3-up'],
      ['background', '#F5F5F5']
    ], document));
    elementsToPush.push(document.createElement('hr'));




    // // section 9
    // const section9 = sections.shift();
    // if (section9) {
    //   elementsToPush.push(createMarquee(section9, document, '#EB1000'));
    //   elementsToPush.push(document.createElement('hr'));
    // }



    /*
     * final page
     */

    content.innerHTML = '';
    elementsToPush.forEach((el) => {
      content.append(el);
    });


    // cleaning
    WebImporter.DOMUtils.remove(document, [
      `header, footer, .xf, style, northstar-card-collection, consonant-card-collection`,
      '.globalnavheader', 
      '.globalNavHeader',
    ]);



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
