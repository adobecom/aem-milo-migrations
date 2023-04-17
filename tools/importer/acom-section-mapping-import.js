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
  parseFourUpLayoutsSectionMetadataGeneric,
  parseTwoUpLayoutsSectionMetadataWithCardHor,
  parseSectionMetadataGenericCentered,
  parseMultipleSectionMetadataTwoUpGeneric,
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
  parse_marquee_with_treeview,
  parseIcons,
  parseSingleComparisonTable,
  parseMultipleComparisonTable,
} from './rules/bacom.js';
import { parse_faasForm } from './rules/form-link.js';
import { waitForFaasForm } from './rules/handleFaasForm.js';
import { parseTableGeneric } from './rules/table.js';
import { parseBacomProductsPageTemplateKMultiBlocksSection } from './rules/bacom-products-template-k.js';



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
  'marquee-with-treeview': parse_marquee_with_treeview,
  'faas-form': parse_faasForm,
  'four-up': parseFourUpLayoutsSectionMetadataGeneric,
  'table': parseTableGeneric,
  'single-comparison-table': parseSingleComparisonTable,
  'multiple-comparison-table': parseMultipleComparisonTable,
  'section-center': parseSectionMetadataGenericCentered,
  'multiple-section-metadata': parseMultipleSectionMetadataTwoUpGeneric,
  'products-pages-template-k-multi-block-section': parseBacomProductsPageTemplateKMultiBlocksSection,
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

    // handle faas form
    await waitForFaasForm(document);

    // mark hidden divs + add bounding client rect data to all "visible" divs
    document.querySelectorAll('div').forEach((div) => {
      if (div && /none/i.test(window.getComputedStyle(div).display.trim())) {
        div.setAttribute('data-hlx-imp-hidden-div', '');
      } else {
        var domRect = div.getBoundingClientRect().toJSON()
        Object.keys(domRect).forEach(p => domRect[p] = Math.round(domRect[p]));
        if (domRect.width > 0 && domRect.height > 0) {
          div.setAttribute('data-hlx-imp-rect', JSON.stringify(domRect));
        }
        const bgImage = window.getComputedStyle(div).getPropertyValue('background-image');
        if (bgImage && bgImage !== 'none') {
          div.setAttribute('data-hlx-background-image', bgImage);
          console.log('bgImage', bgImage);
        }
      }
    });
    
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
    const IMPORT_REPORT = {};
    sectionsToReport.forEach((section) => { IMPORT_REPORT[section + '-blocks'] = 0; });

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

        // remove elements
        if (section.block.type === 'to-remove') {
          elsToRemove.push(el);
          continue;
        }

        WebImporter.DOMUtils.remove(el, [
          '.dexter-Spacer',
        ]);

        // report special sections
        if (sectionsToReport.includes(section.block.type)) {
          IMPORT_REPORT[section.block.type + '-blocks']++;
        }

        if (sectionsRulesMap[section.block.type]) {
          // z-pattern special case (multiple elements)
          if (section.block.type === 'z-pattern') {
            const zpatternElements = [ el ];
            while (sectionsData[i+1] && (sectionsData[i+1].block.type === 'z-pattern' || sectionsData[i+1].block.type === 'to-remove')) {
              i++;
              if(sectionsData[i].block.type === 'to-remove') {
                elsToRemove.push(el);
                continue;
              }
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

    // sanitize links
    const getClosestLinkFormattingTagsToRemove = function(el) {
      return el.closest('B, I, U, strong, em');
    };
    document.querySelectorAll('a').forEach((a) => {
      // is a CTA => wrap it in a B or I to get it rendered as a button
      if (a.closest('.cta') || a.classList.toString().match(/spectrum-link|spectrum-button/i)) {
        // CTA rendered as a normal link
        if (!a.classList.toString().match(/spectrum-link/i)) {
          let wrapper = 'B';
          if (a.classList.toString().match(/-primary|-outline/)) {
            wrapper = 'I';
          }
          const w = document.createElement(wrapper);
          a.before(w);
          w.append(a);
        }
      // is a normal link, formated => remove the formatting!
      } else if (getClosestLinkFormattingTagsToRemove(a)) {
        let wrapper = getClosestLinkFormattingTagsToRemove(a);
        while (wrapper) {
          wrapper.replaceWith(a);
          wrapper = getClosestLinkFormattingTagsToRemove(a);
        }
      }

      // extract images from links. No real support for image+link in Milo
      a.querySelectorAll('img').forEach((i) => {
        a.before(i);
        a.innerHTML = i.alt || i.title || a.src;
      });

      // and in any case, remove any formatting done downstream the link
      const t = a.textContent;
      a.querySelectorAll('*').forEach((n) => n.remove());
      a.textContent = t;
    });

    // parse icons
    const foundIcons = parseIcons(document);

    // remove hidden divs
    document.querySelectorAll('[data-hlx-imp-hidden-div]').forEach((el) => {
      el.remove();
    });



    /*
     * bottom elements (metadata)
     */
    
    main.append(parseMetadata(document));
    const { block, tagsConverted } = parseCardMetadata(document);
    main.append(block);
    


    /*
     * cleanup to remove unwanted elements
     */

    WebImporter.DOMUtils.remove(main, [
      'style',
      'source',
      'script',
    ]);

    main.querySelectorAll('div').forEach((el) => {
      Object.keys(el.dataset).forEach((key) => delete el.dataset[key]);
      for (let i = 0; i < el.attributes.length; i++) {
          el.removeAttribute(el.attributes[i].name);
      }
    });
    
    
    /*
     * return + custom report
     */

    // report icons
    IMPORT_REPORT['icons'] = foundIcons.toString();

    // MWPW-128596 - Enterprise tags swapping
    IMPORT_REPORT['tags converted?'] = tagsConverted.toString();

    // report raw content import
    // meaning that no section was found in the page
    // and the content got imported as is
    IMPORT_REPORT['raw import?'] = sectionsData.length === 0 ? 'true' : false;

    // make every report value a string
    Object.keys(IMPORT_REPORT).map(k => (IMPORT_REPORT[k] = '' + IMPORT_REPORT[k]));

    return [{
      element: main,
      path: generateDocumentPath({ document, url: params.originalURL }),
      report: IMPORT_REPORT,
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
