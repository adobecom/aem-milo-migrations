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
import { isLightColor } from '../utils.js';
import { extractBackground } from '../rules/bacom.js';
import { crawlColorFromCSS, getNSiblingsElements } from '../rules/utils.js';

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

const createImage = (document, url)  => {
  const img = document.createElement('img');
  img.src = url;
  return img;
};

function parseMarquee(el, document, section, backgroundColor = '') {

  let marqueeDoc = el
  let els = getNSiblingsElements(el, (c) => c >= 2)
  let videoElem = marqueeDoc

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
      const targetInd = emptyNodeIndx == 0 ? emptyNodeIndx + 1 : emptyNodeIndx - 1
      els = getNSiblingsElements(els[targetInd], (c) => c >= 2)
    }

    /*
    * texts
    */
    for (var i = 0; i < els.length; i++) {
      const tmpel = els[i];
      const img = tmpel.querySelector('img')
      const video = tmpel.querySelector('video.video-desktop') || tmpel.querySelector('iframe')
      if (!img && !video) {
        let cta = tmpel.querySelector('.cta');
        if (cta) {
          const link = cta.querySelector('a');
          if (link.href.indexOf('#watch-now') < 0) {
            const str = document.createElement('B');
            str.append(cta);
            tmpel.append(str)
          }
        }
        container.append(tmpel)
      }
      if (video){
        videoElem = tmpel
      }
    }

    // sanitize links inside ul/li
    container.querySelectorAll('ol li a, ul li a').forEach((a) => {
      const t = a.textContent;
      a.querySelectorAll('*').forEach((n) => n.remove());
      a.textContent = t;
    });
  } else {
    // strategy 2
    const title = marqueeDoc.querySelector('.title');
    if (title) {
      container.append(title)
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
  * image + resource
  */

  let resource = document.createElement('div');
  const videoText = videoElem.querySelector('.cmp-text')
  if(videoText) {
    const videoTextH3 = document.createElement('h3')
    videoTextH3.append(videoText.textContent)
    resource.append(videoTextH3)
  }

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
            resource.append(videoIframe.src || videoIframe.dataset.videoSrc)
          }
        }
      }
    }
  }

  let video = marqueeDoc.querySelector('video.video-desktop');
  if (video) {
    const source = video.querySelector('source');
    const resourceLink = document.createElement('a');
    resourceLink.href = source.src
    resourceLink.innerHTML = source.src
    resource.append(resourceLink)
  }


  // iframe handling
  video = videoElem.querySelector('iframe');
  if (video) {
    const resourceLink = document.createElement('a');
    resourceLink.href = video.src || video.videoSrc
    resourceLink.innerHTML = video.src || video.videoSrc
    resource.append(resourceLink)
  }

  /*
   * theme
   */

  let theme = 'light'; // default, dark color + light background
  const fontColor = crawlColorFromCSS(el, document);
  if (fontColor) {
    if (isLightColor(fontColor)) {
      theme = 'dark'; // default, light color + dark background
    }
  }

  /*
   * Handle modal videos 
   */

  const videoLinks = container.querySelectorAll('.cta a')
  videoLinks.forEach(videoLink => {
    if (videoLink && videoLink.href) {
      let href = videoLink.href
      href = href.split(videoLink.baseURI)
      href = href[href.length - 1]
      if(href.startsWith("#")){
        const modal = document.querySelector(href)
        const iframe = modal?.querySelector('iframe')
        // check if element is in a modal
        if (modal?.closest(".modal") && iframe && iframe.getAttribute('data-video-src')) {
          if(!resource) {
            console.log(iframe.getAttribute('data-video-src'))
            resource = document.createElement('a');
            resource.href = iframe.getAttribute('data-video-src')
            resource.innerHTML = iframe.getAttribute('data-video-src')
          }
          videoLink.remove()
        }
      }
    }
  })


  /*
   * create table
   */
  
  const result = document.createElement('div')
  result.append(document.createElement('hr'))
  result.append(WebImporter.DOMUtils.createTable([
    [`marquee (small, ${theme})`],
    [extractBackground(marqueeDoc, document)],
    [container, (resource || '')],
  ], document))
  result.append(WebImporter.DOMUtils.createTable([
    ['Section Metadata'],
    ['style', 'L spacing, center'],
  ], document))
  result.append(document.createElement('hr'))

  
  return result;
}

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
        marquee = parseMarquee(sections.shift(), document, null)
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