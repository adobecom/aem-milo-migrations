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

import { setGlobals, getMetadataValue, isRelative, findPaths, createElementFromHTML } from '../utils.js';
import { parseCardMetadata } from '../rules/metadata.js';
import { getBGColor, getNSiblingsElements } from '../rules/utils.js';
import { getXPathByElement } from '../utils.js';

const createMetadata = (main, document) => {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    // meta.Title = title.innerHTML.replace(/[\n\t]/gm, '');
    meta.Title = title.textContent
  }
  meta.robots = getMetadataValue(document, 'robots');
  meta['serp-content-type'] = getMetadataValue(document, 'serp-content-type');
  meta.pageCreatedAt = getMetadataValue(document, 'pageCreatedAt');
  meta.translated = getMetadataValue(document, 'translated');
  meta.publishDate = getMetadataValue(document, 'publishDate');
  meta.productJcrID = getMetadataValue(document, 'productJcrID');
  meta.primaryProductName = getMetadataValue(document, 'primaryProductName');

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  return block;
};

const createMarquee = (main, document) => {
  console.log("MARQUEE: " + getXPathByElement(main))
  let marqueeDoc = main
  let els = getNSiblingsElements(main, (c) => c == 2)

  const container = document.createElement('div')
  if (!els){
    return null
  }
  // handle empty / hidden divs
  let emptyNodeIndx = -1
  for (var i = 0; i < els.length; i++) {
    if (!els[i].hasChildNodes()) {
      emptyNodeIndx = i
      break
    }
  }
  if (emptyNodeIndx >= 0) {
    const targetInd = emptyNodeIndx == 0 ? emptyNodeIndx + 1 : emptyNodeIndx - 1
    els = getNSiblingsElements(els[targetInd], (c) => c >= 2)
  }

  /*
  * texts
  */
  for (var i = 0; i < els.length; i++) {
    const tmpel = els[i];
    const img = tmpel.querySelector('img')
    const video = tmpel.querySelector('video.video-desktop')
    console.log("CONTENT: " + getXPathByElement(els[i]))
    if (!img && !video) {
      const titleEls = els[i].querySelector('.cmp-title');
      if(titleEls) {
        let content = document.createElement("h2")
        content.append(titleEls.textContent)

        container.append(content)
        container.append(document.createElement("br"))
      }
      const textEls = els[i].querySelectorAll('.cmp-text');
      textEls?.forEach((item, ind) => {
        let content
        if (ind == 0 && !titleEls) {
          content = document.createElement("h2")
          content.append(item.textContent)
        } else {
          content = item.textContent
        }
        container.append(content)
        container.append(document.createElement("br"))
      })
      const cta = els[i].querySelector('.cta');
      if (cta) {
        const link = cta.querySelector('a');
        if (link.href.indexOf('#watch-now') < 0) {
          const str = document.createElement('B');
          str.append(cta);
          container.append(str)
        } else {
          container.append(link)
        }
      }
    }
  }

  /*
  * background
  */

  let background =  WebImporter.DOMUtils.getImgFromBackground(marqueeDoc, document)
  console.log('background', background);

  // strategy 2
  if (!background) {

    marqueeDoc.querySelectorAll('div').forEach(d => {
      const bg = document.defaultView.getComputedStyle(d).getPropertyValue('background-image');
      if (bg !== '') {
        background = WebImporter.DOMUtils.getImgFromBackground(d, document);
      }
    });
  }

  // strategy 3: get background color
  
  if (!background) {
    const bgColor = getBGColor(main, document);
    if (bgColor) {
      background = bgColor
    }
  }

  if (!background) {
    background = '';
  }

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
      if (link?.href.indexOf('#watch-now') > -1) {
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
    resource = document.createElement('a');
    resource.href = source.src
    resource.innerHTML = source.src
  }

  /*
  * create table
  */

  const cells = [
    ['marquee (medium, light)'],
    [''],
    [container, (resource || '')],
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  return table;
};

const getResource = (main, document, originalURL) => {
  // pdf link
  let pdfLink = document.querySelector('.dexter-Cta a[href*=".pdf"]');
  if (!pdfLink) {
    // try from jcrContent
    console.log('!pdfLink');
    console.log(window.jcrContent);
    const pdfTextElementPaths = findPaths(window.jcrContent, typeof searchValue === "string", '.pdf')
    if (pdfTextElementPaths && pdfTextElementPaths[0] && pdfTextElementPaths[0][1]) {
      const pdfTextElement = createElementFromHTML(pdfTextElementPaths[0][1]);
      pdfLink =  pdfTextElement.querySelector('a');
      // this method transforms the relative pdf link into a full url with helix-import-ui domain
    } else {
      // search for pdf link in the whole document
      pdfLink = document.querySelector('a[href*=".pdf"], a[href*="gartner.com/"], a[href*="forrester.com/"]');
    }
  }

  if (!pdfLink) {
    console.warn('No pdf link found.');
    return null;
  }

  if (isRelative(pdfLink.href)) {
    pdfLink.href = originalURL.origin + pdfLink.href;
  } else if (pdfLink.href.indexOf('//localhost') > -1) {
    const u = new URL(pdfLink.href);
    pdfLink.href = originalURL.origin + u.pathname;
  }

  pdfLink.textContent = decodeURI(pdfLink.href);
  
  // For cleanup (to avoid a weird bug from original a link.)
  const newPdfLink = document.createElement('a')
  newPdfLink.href = pdfLink.href;
  newPdfLink.textContent = pdfLink.textContent;
  pdfLink.remove();

  return newPdfLink;
}

export default {
  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @returns {HTMLElement} The root element
   */
  transform: async ({ document, params}) => {

    /*
     * init
     */

    await setGlobals(params.originalURL);


    /*
     * clean up
     */

    WebImporter.DOMUtils.remove(document, [
      '.globalnavheader',
      '.globalnavfooter',
      'header',
      'footer',
      '.xfreference',
    ]);



    /*
     * title + resource link
     */

    const main = document.querySelector('main');
    const u = new URL(params.originalURL);

    // get pdf + marquee sections
    let sections = getNSiblingsElements(main, (c) => c == 2)
    if(!sections || !sections.length) {
      sections = [main]
    }

    const titleSection = sections[0]
    const titleEl = titleSection.querySelector('.dexter-FlexContainer')
    const titleTextEl = titleEl.querySelector('.cmp-title')
    const title = titleTextEl ? titleTextEl.textContent : '';
    const textEl = titleEl.querySelector('.cmp-text');
    const text = textEl ? textEl.textContent : '';

    main.append(WebImporter.DOMUtils.createTable([
      ['text (large)'],
      [`${text}<h1>${title}</h1>`],
    ], document));

    // Resource (pdf, video, etc.)
    const resource = getResource(main, document, u);
    if (resource) {
      main.append(resource);
    }

    main.append(WebImporter.DOMUtils.createTable([
      ['Section Metadata'],
      ['style', 'container, L spacing'],
    ], document));
    main.append(document.createElement('hr'));

    if(sections.length >= 2) {
      // add marquee
      const marquee = createMarquee(sections[1], document);
      if(marquee){
        main.append(marquee)
      }
    }
    document.querySelector('h3, h2')?.remove();


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
     * clean up
     */

    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
      if(!h.textContent.trim()) {
        h.remove();
      }
    });

    WebImporter.DOMUtils.remove(document, [
      '.dexter-FlexContainer',
      '.xreference',
      '.dexter-Position',
      'northstar-card-collection',
      'consonant-card-collection',
      'img',
      '.image',
      'a[target=_parent]',
      'p',
    ]);

    /*
     * return + custom report
     */

    return [{
      element: main,
      path: new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
      report: {
        'found resource': resource ? 'true' : 'false',
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
  generateDocumentPath: ({ document, url }) => {
    let { pathname } = new URL(url);
    pathname = pathname.replace('.html', '');
    return WebImporter.FileUtils.sanitizePath(pathname);
  },
};
