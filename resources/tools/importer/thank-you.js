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

import { getMetadataValue, isRelative, findPaths, createElementFromHTML } from './utils.js';

const createMetadata = (main, document) => {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.innerHTML.replace(/[\n\t]/gm, '');
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

const getRecommendedArticles = async (main, document) => {
  const caasLink = document.createElement('a');
  const consonantCaaS = document.querySelector('consonant-card-collection');
  if (consonantCaaS) {
    const { getCaasConfigHash } = await import('https://c3-parsecaas--milo--adobecom.hlx.page/tools/caas-import/parseCaasConfig.js');   
    caasLink.href = getCaasConfigHash(JSON.parse(consonantCaaS.dataset.config));
    caasLink.textContent = 'Content as a Service';
    return caasLink;
  }
  caasLink.href = 'https://milo.adobe.com/tools/caas#eyJhbmFseXRpY3NUcmFja0ltcHJlc3Npb24iOmZhbHNlLCJhbmFseXRpY3NDb2xsZWN0aW9uTmFtZSI6IiIsImFuZExvZ2ljVGFncyI6W10sImJvb2ttYXJrSWNvblNlbGVjdCI6IiIsImJvb2ttYXJrSWNvblVuc2VsZWN0IjoiIiwiY2FyZFN0eWxlIjoiMToyIiwiY29sbGVjdGlvbkJ0blN0eWxlIjoicHJpbWFyeSIsImNvbnRhaW5lciI6IjEyMDBNYXhXaWR0aCIsImNvdW50cnkiOiJjYWFzOmNvdW50cnkvdXMiLCJjb250ZW50VHlwZVRhZ3MiOlsiY2Fhczpjb250ZW50LXR5cGUvZWJvb2siLCJjYWFzOmNvbnRlbnQtdHlwZS9ndWlkZSIsImNhYXM6Y29udGVudC10eXBlL3JlcG9ydCIsImNhYXM6Y29udGVudC10eXBlL3dlYmluYXIiLCJjYWFzOmNvbnRlbnQtdHlwZS93aGl0ZS1wYXBlciJdLCJkaXNhYmxlQmFubmVycyI6ZmFsc2UsImRyYWZ0RGIiOmZhbHNlLCJlbnZpcm9ubWVudCI6IiIsImVuZHBvaW50Ijoid3d3LmFkb2JlLmNvbS9jaGltZXJhLWFwaS9jb2xsZWN0aW9uIiwiZXhjbHVkZVRhZ3MiOlsiY2Fhczpjb250ZW50LXR5cGUvY3VzdG9tZXItc3RvcnkiXSwiZXhjbHVkZWRDYXJkcyI6W3siY29udGVudElkIjoiIn1dLCJmYWxsYmFja0VuZHBvaW50IjoiIiwiZmVhdHVyZWRDYXJkcyI6W10sImZpbHRlckV2ZW50IjoiIiwiZmlsdGVyTG9jYXRpb24iOiJ0b3AiLCJmaWx0ZXJMb2dpYyI6Im9yIiwiZmlsdGVycyI6W3siZmlsdGVyVGFnIjpbImNhYXM6cHJvZHVjdHMiXSwib3BlbmVkT25Mb2FkIjoiIiwiaWNvbiI6IiIsImV4Y2x1ZGVUYWdzIjpbXX0seyJmaWx0ZXJUYWciOlsiY2FhczppbmR1c3RyeSJdLCJvcGVuZWRPbkxvYWQiOiIiLCJpY29uIjoiIiwiZXhjbHVkZVRhZ3MiOltdfSx7ImZpbHRlclRhZyI6WyJjYWFzOnRvcGljIl0sIm9wZW5lZE9uTG9hZCI6IiIsImljb24iOiIiLCJleGNsdWRlVGFncyI6W119XSwiZmlsdGVyc1Nob3dFbXB0eSI6ZmFsc2UsImd1dHRlciI6IjR4IiwiaW5jbHVkZVRhZ3MiOltdLCJsYW5ndWFnZSI6ImNhYXM6bGFuZ3VhZ2UvZW4iLCJsYXlvdXRUeXBlIjoiM3VwIiwibG9hZE1vcmVCdG5TdHlsZSI6InByaW1hcnkiLCJvbmx5U2hvd0Jvb2ttYXJrZWRDYXJkcyI6ZmFsc2UsIm9yTG9naWNUYWdzIjpbXSwicGFnaW5hdGlvbkFuaW1hdGlvblN0eWxlIjoicGFnZWQiLCJwYWdpbmF0aW9uRW5hYmxlZCI6ZmFsc2UsInBhZ2luYXRpb25RdWFudGl0eVNob3duIjpmYWxzZSwicGFnaW5hdGlvblVzZVRoZW1lMyI6ZmFsc2UsInBhZ2luYXRpb25UeXBlIjoicGFnaW5hdG9yIiwicGxhY2Vob2xkZXJVcmwiOiIiLCJyZXN1bHRzUGVyUGFnZSI6IjMiLCJzZWFyY2hGaWVsZHMiOlsiY29udGVudEFyZWEuZGVzY3JpcHRpb24iXSwic2V0Q2FyZEJvcmRlcnMiOnRydWUsInNob3dCb29rbWFya3NGaWx0ZXIiOmZhbHNlLCJzaG93Qm9va21hcmtzT25DYXJkcyI6ZmFsc2UsInNob3dGaWx0ZXJzIjpmYWxzZSwic2hvd1NlYXJjaCI6ZmFsc2UsInNob3dUb3RhbFJlc3VsdHMiOmZhbHNlLCJzb3J0RGVmYXVsdCI6InJhbmRvbSIsInNvcnRFbmFibGVQb3B1cCI6ZmFsc2UsInNvcnRFbmFibGVSYW5kb21TYW1wbGluZyI6ZmFsc2UsInNvcnRSZXNlcnZvaXJTYW1wbGUiOjMsInNvcnRSZXNlcnZvaXJQb29sIjoxMDAwLCJzb3VyY2UiOlsibm9ydGhzdGFyIl0sInRhZ3NVcmwiOiJ3d3cuYWRvYmUuY29tL2NoaW1lcmEtYXBpL3RhZ3MiLCJ0YXJnZXRBY3Rpdml0eSI6ImR4bmV4dF91YiIsInRhcmdldEVuYWJsZWQiOnRydWUsInRoZW1lIjoibGlnaHRlc3QiLCJ0b3RhbENhcmRzVG9TaG93IjoiMyIsInVzZUxpZ2h0VGV4dCI6ZmFsc2UsInVzZU92ZXJsYXlMaW5rcyI6ZmFsc2UsInVzZXJJbmZvIjpbXSwic2hvd0lkcyI6dHJ1ZSwiY29sbGVjdGlvblNpemUiOiIiLCJjb2xsZWN0aW9uTmFtZSI6IiIsImRvTm90TGF6eUxvYWQiOmZhbHNlfQ==';
  caasLink.textContent = 'Content as a Service - Friday, November 4, 2022 at 09:34';
  return caasLink;
}

const getResource = (main, document) => {
  const video = document.querySelector('.video');
  if (video) {
    return video.querySelector('iframe').src;
  }
  let pdfLink = document.querySelector('.dexter-Cta a');
  
  if (!pdfLink) {
    const pdfTextElementStr = findPaths(window.data, '.pdf')[0][1];
    const pdfTextElement = createElementFromHTML(pdfTextElementStr);
    pdfLink =  pdfTextElement.querySelector('a');
  }
  
  if (isRelative(pdfLink.href)) {
    pdfLink.href = window.importUrl.origin + pdfLink.href;
  } else {
    const hrefURL = new URL(pdfLink.href);
    pdfLink.href = window.importUrl.origin + hrefURL.pathname;
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
  transformDOM: async ({ document, html}) => {
    // console.log(window.fetchUrl);
    const main = document.querySelector('main');
    const eyebrow = document.querySelector('p') || '';
    const defaultCaaSTitle = document.createElement('h3');
    defaultCaaSTitle.textContent = 'Recommended for you';

    // Text block
    if (eyebrow.querySelector('a')) {
      eyebrow.querySelector('a').remove();
    }
    if (eyebrow.textContent.length < 20) {
      const title = document.querySelector('.title, h1, h2, h3');
      main.append(WebImporter.DOMUtils.createTable([
        ['text (large)'],
        [''],
        [`${eyebrow?.textContent.toUpperCase()}${title?.outerHTML}`],
      ], document));
      eyebrow?.remove();
      title?.remove();
    } else {
      document.querySelector('#root_content_flex_1141994466_copy > .dexter-FlexContainer-Items > *:nth-child(3)').remove();
      document.querySelector('.dexter-FlexContainer').remove();
      document.querySelector('h3 a').parentElement.remove();
      main.append(WebImporter.DOMUtils.createTable([
        ['text (large)'],
        [''],
        [`<h1>${document.querySelector('h3').textContent}</h1>`],
      ], document));
      document.querySelector('h3').remove();
    }
    
    // Resources (pdf, video, etc.)
    main.append(getResource(main, document));
    main.append(WebImporter.DOMUtils.createTable([
      ['Section Metadata'],
      ['style', 'container'],
    ], document));
    main.append('---');
    main.append(document.querySelector('h2, h3, .aem-Grid > .title .cmp-title__text').textContent.trim() ? 
      document.querySelector('h2, h3, .aem-Grid > .title .cmp-title__text') :
      defaultCaaSTitle);
    main.append(await getRecommendedArticles(main, document));
    main.append(WebImporter.DOMUtils.createTable([
      ['Section Metadata'],
      ['style', 'container, m spacing, center'],
    ], document));
    main.append(createMetadata(main, document));
    
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
      if(!h.textContent.trim()) {
        h.remove();
      }
    });
    WebImporter.DOMUtils.remove(document, [
      `header, footer, xf, img, northstar-card-collection, consonant-card-collection, p`,
    ]);

    return main;
  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {String} url The url of the document being transformed.
   * @param {HTMLDocument} document The document
   */
  generateDocumentPath: ({ document, url }) => {
    const path = new URL(url).pathname.replace(/\/$/, '');
    path.replace('.html', '');
    return path;
  },
};
