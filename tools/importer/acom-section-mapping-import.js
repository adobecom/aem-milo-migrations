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
import { getSectionsData } from './rules/sections-data.js';
import { parseMarquee } from './rules/marquee.js';
import { parseText } from './rules/text.js';
import { parseFragment } from './rules/fragment.js';
import { parseCardMetadata, parseMetadata } from './rules/metadata.js';
import { parseCAASContent } from './rules/caas.js';
import { parseZPattern } from './rules/z-pattern.js';
import { parseAside } from './rules/aside.js';
import { setGlobals } from './utils.js';
import { parseBreadcrumb } from './rules/breadcrumb.js';
import {
  parseTwoUpLayoutsSectionMetadata,
  parseThreeUpLayoutsSectionMetadataGeneric,
  parseTwoUpLayoutsSectionMetadataWithCardHor,
} from './rules/section-metadata.js';
import { parseUnknown } from './rules/unknown.js';
import { getElementByXpath } from './utils.js';
import { parseMedia } from './rules/media.js';
import { parseTableOfContents } from './rules/table-of-contents.js';
import {
  parse_seeWhatMakesItWork_Section,
  parseFragment_products_related_content_cards,
  parseFragment_fragment_products_request_demo_marquee,
  parseTwoUpSectionMetadataWithTreeview,
} from './rules/bacom.js';


/*
 * mapping between the section type and the parsing function
 */

const sectionsRulesMap = {
  'unknown': parseUnknown,
  'marquee': parseMarquee,
  'text': parseText,
  'fragment': parseFragment,
  'z-pattern': parseZPattern,
  'aside': parseAside,
  'tree-view-two-up-section': parseTwoUpSectionMetadataWithTreeview,
  'media': parseMedia,
  'two-up': parseTwoUpLayoutsSectionMetadata,
  'three-up': parseThreeUpLayoutsSectionMetadataGeneric,
  'see-what-makes-it-work': parse_seeWhatMakesItWork_Section,
  'caas': parseCAASContent,
  'table-of-contents': parseTableOfContents,
  'card-hor-two-up-section': parseTwoUpLayoutsSectionMetadataWithCardHor,
  'fragment-products-related-content-cards': parseFragment_products_related_content_cards,
  'fragment-products-request-demo-marquee': parseFragment_fragment_products_request_demo_marquee,
};

const sectionsToReport = [
  'unknown',
  'caas',
];

export default {
  onLoad: async ({ document, url, params }) => {
    // send 'esc' keydown event to close the dialog
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        altKey: false,
        code: "Escape",
        ctrlKey: false,
        isComposing: false,
        key: "Escape",
        location: 0,
        metaKey: false,
        repeat: false,
        shiftKey: false,
        which: 27,
        charCode: 0,
        keyCode: 27,
      })
    );
  },

  transform: async ({ document, params }) => {

    /*
     * init globals and constants
     */

    await setGlobals(params.originalURL);

    const main = document.querySelector('main');
    const elsToPush = [];
    const elsToRemove = [];

    // init sections report
    const sectionsReport = {};
    sectionsToReport.forEach((section) => { sectionsReport[section + '-blocks'] = 0; });

    // get sections data
    const sectionsData = await getSectionsData(params.originalURL);



    /*
     * global top content
     */

    const [breadcrumbType, breadcrumb] = parseBreadcrumb(document);
    elsToPush.push(breadcrumb);



    /*
     * create blocks from sections data
     */

    for (var i = 0; i < sectionsData.length; i++) {
      var section = sectionsData[i];
      if (section.block.type !== 'na') {
        const el = getElementByXpath(document, '/' + section.xpath);
        WebImporter.DOMUtils.remove(el, [
          '.dexter-Spacer',
        ]);

        // report special sections
        if (sectionsToReport.includes(section.block.type)) {
          sectionsReport[section.block.type + '-blocks']++;
        }

        if (sectionsRulesMap[section.block.type]) {
          // z-pattern special case (multiple elements)
          if (section.block.type === 'z-pattern') {
            const zpatternElements = [ el ];
            while (sectionsData[i+1].block.type === 'z-pattern') {
              i++;
              zpatternElements.push(getElementByXpath(document, '/' + sectionsData[i].xpath));
            }
            const block = await sectionsRulesMap[section.block.type](el, document, zpatternElements);
            elsToPush.push(block);
            elsToRemove.push(el);
            continue;
          }

          const block = await sectionsRulesMap[section.block.type](el, document, section);
          elsToPush.push(block);
          elsToRemove.push(el);
        } else {
          const cells = [
            [section.block.type],
            [el.outerHTML], 
          ];
  
          elsToPush.push(WebImporter.DOMUtils.createTable(cells, document));  
          elsToRemove.push(el);
        }
      }
    }

    for (var i = 0; i < elsToRemove.length; i++) {
      elsToRemove[i].remove();
    }

    for (var i = 0; i < elsToPush.length; i++) {
      main.append(elsToPush[i]);
    }

    
    /*
     * global changes
     */

    // decorate links
    document.querySelectorAll('.cta a').forEach((a) => {
      let wrapper = 'B';
      if (a.classList.toString().match(/-primary|-outline/)) {
        wrapper = 'I';
      }
      const w = document.createElement(wrapper);
      a.before(w);
      w.append(a);
    });



    /*
     * bottom elements (metadata)
     */
    
    main.append(parseMetadata(document));
    main.append(parseCardMetadata(document));






    /*
     * return + custom report
     */

    return [{
      element: main,
      path: generateDocumentPath({ document, url: params.originalURL }),
      report: sectionsReport,
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
  pathname = pathname.replace('.html', '');
  return WebImporter.FileUtils.sanitizePath(pathname);
}
