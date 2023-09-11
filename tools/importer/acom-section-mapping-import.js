//'use strict'

/**
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
import { generateDocumentPath, getElementByXpath, setGlobals, smartScroll } from './utils.js';

/**
 * parsers
 */

import { getSectionsData } from './rules/sections-data.js';
import { parseMarquee, parseMarqueeSimple } from './rules/marquee.js';
import { parseText } from './rules/text.js';
import { parseFragment } from './rules/fragment.js';
import { parseCardMetadata, parseMetadata } from './rules/metadata.js';
import { parseCAASContent } from './rules/caas.js';
import { parseZPattern } from './rules/z-pattern.js';
import { parseAside, parseAsideInline, parseAsideNotificationCenter } from './rules/aside.js';
import { parseBreadcrumb } from './rules/breadcrumb.js';
import {
  parseTwoUpLayoutsSectionMetadata,
  parseThreeUpLayoutsSectionMetadataGeneric,
  parseFourUpLayoutsSectionMetadataGeneric,
  parseTwoUpLayoutsSectionMetadataWithCardHor,
  parseFiveUpLayoutsSectionMetadataGeneric,
  parseSectionMetadataGenericCentered,
  parseSectionMetadataGenericRaw,
  parseMultipleSectionMetadataTwoUpGeneric,
  parseTwoUpLayoutGrid_1_2_SectionMetadata,
} from './rules/section-metadata.js';
import { parseUnknown } from './rules/unknown.js';
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
  parseBacomDigitalTrendsThreeUpCharts,
} from './rules/bacom.js';
import { parse_faasForm } from './rules/form-link.js';
import { waitForFaasForm } from './rules/handleFaasForm.js';
import { parseTableGeneric } from './rules/table.js';
import { parseCarousel } from './rules/carousel.js';
// custom parsers
import * as customParsers from './rules/customs/customs.mjs';

// parser wrapper
function nUpElementTypeVariantParserLayoutSectionMetadata(elementType = 'text', parserFn) {
  return function parser(el, document, section) {
    return parserFn(el, document, section, {elementType});
  };
}

/**
 * mapping between the section type and the parsing function
 */

const sectionsRulesMap = {
  'aside': parseAside,
  'aside-inline': parseAsideInline,
  'aside-notification-center': parseAsideNotificationCenter,
  'bacom-digital-trends-three-up-charts': parseBacomDigitalTrendsThreeUpCharts,
  'caas': parseCAASContent,
  'card-hor-two-up-section': parseTwoUpLayoutsSectionMetadataWithCardHor,
  'carousel': parseCarousel,
  'carousel-two-up': nUpElementTypeVariantParserLayoutSectionMetadata('two-up', parseCarousel),
  'faas-form': parse_faasForm,
  'five-up': parseFiveUpLayoutsSectionMetadataGeneric,
  'four-up': parseFourUpLayoutsSectionMetadataGeneric,
  'four-up-cards': nUpElementTypeVariantParserLayoutSectionMetadata('card', parseFourUpLayoutsSectionMetadataGeneric),
  'fragment-products-related-content-cards': parseFragment_products_related_content_cards,
  'fragment-products-request-demo-marquee': parseFragment_fragment_products_request_demo_marquee,
  'fragment': parseFragment,
  'marquee-with-treeview': parse_marquee_with_treeview,
  'marquee': parseMarquee,
  'marquee-simple': parseMarqueeSimple,
  'media': parseMedia,
  'multiple-comparison-table': parseMultipleComparisonTable,
  'multiple-section-metadata': parseMultipleSectionMetadataTwoUpGeneric,
  // 'products-pages-template-k-multi-block-section': parseBacomProductsPageTemplateKMultiBlocksSection,
  'section-raw': parseSectionMetadataGenericRaw,
  'section-center': parseSectionMetadataGenericCentered,
  'see-what-makes-it-work': parse_seeWhatMakesItWork_Section,
  'single-comparison-table': parseSingleComparisonTable,
  'table-of-contents': parseTableOfContents,
  'table': parseTableGeneric,
  'text': parseText,
  'three-up': parseThreeUpLayoutsSectionMetadataGeneric,
  'three-up-cards': nUpElementTypeVariantParserLayoutSectionMetadata('card', parseThreeUpLayoutsSectionMetadataGeneric),
  'tree-view-two-up-section': parseTwoUpSectionMetadataWithTreeview,
  'two-up': parseTwoUpLayoutsSectionMetadata,
  'two-up-cards': nUpElementTypeVariantParserLayoutSectionMetadata('card', parseTwoUpLayoutsSectionMetadata),
  'two-up-grid-template-columns-1-2': parseTwoUpLayoutGrid_1_2_SectionMetadata,
  'unknown': parseUnknown,
  'z-pattern-single': parseZPattern,
  'z-pattern': parseZPattern,
};

/**
 * load custom parsers
 */

Object.keys(customParsers).forEach((key) => {
  Object.keys(customParsers[key].parsers).forEach((parserKey) => {
    sectionsRulesMap[parserKey] = customParsers[key].parsers[parserKey];
  });
});

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

    // force close locale modal which is blocking scrolling on some pages
    const localeModalEl = document.querySelector('locale-modal a.dexter-CloseButton');
    if (localeModalEl) {
      localeModalEl.click();
    }
    await smartScroll(document);

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
        }
        const bgColor = window.getComputedStyle(div).getPropertyValue('background-color');
        if (bgColor && bgColor !== 'rgb(0, 0, 0)' && bgColor !== 'rgba(0, 0, 0, 0)') {
          div.setAttribute('data-hlx-imp-bgcolor', bgColor);
        }
        const color = window.getComputedStyle(div).getPropertyValue('color');
        if (color && color !== 'rgb(0, 0, 0)') {
          div.setAttribute('data-hlx-imp-color', color);
        }
      }
    });
    
  },

  transform: async ({ document, params }) => {

    /**
     * init globals and constants
     */

    await setGlobals(params.originalURL);

    const main = document.querySelector('main');
    const elsToPush = [];
    const elsToRemove = [];
    const extraElements = [];

    // init sections report
    const IMPORT_REPORT = {};
    sectionsToReport.forEach((section) => { IMPORT_REPORT[section + '-blocks'] = 0; });

    // get sections data
    const sectionsData = await getSectionsData(params.originalURL);



    // /**
    //  * global top content
    //  */

    const [breadcrumbType, breadcrumb] = parseBreadcrumb(document);
    elsToPush.push(breadcrumb);



    /**
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

        if (el) {
          WebImporter.DOMUtils.remove(el, [
            '.dexter-Spacer',
          ]);
        }

        // report special sections
        if (sectionsToReport.includes(section.block.type)) {
          IMPORT_REPORT[section.block.type + '-blocks']++;
        }

        if (sectionsRulesMap[section.block.type]) {
          console.log('parsing section of type', section.block.type);
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
            const { block, extraDocs } = await sectionsRulesMap[section.block.type](el, document, zpatternElements);
            elsToPush.push(block);
            extraElements.push(...extraDocs || []);
            elsToRemove.push(el);
            continue;
          }
          else if (section.block.type === 'z-pattern-single') {
            const zpatternElements = [ el ];
            const { block, extraDocs } = await sectionsRulesMap[section.block.type](el, document, zpatternElements);
            elsToPush.push(block);
            extraElements.push(...extraDocs || []);
            elsToRemove.push(el);
            continue;
          }

          const { block, extraDocs } = await sectionsRulesMap[section.block.type](el, document, section);
          elsToPush.push(block);
          extraElements.push(...extraDocs || []);
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
      if (elsToRemove[i]) {
        elsToRemove[i].remove();
      }
    }

    for (var i = 0; i < elsToPush.length; i++) {
      main.append(elsToPush[i]);
    }

    
    
    /**
     * global changes
     */

    document.querySelectorAll('video').forEach((s) => {
      // console.log('video source', s);
      const source = s.querySelector('source');
      const resource = document.createElement('a');
      resource.href = source.src
      resource.innerHTML = source.src
      s.replaceWith(resource);
    });

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

      // make all links absolute
      if (a.href) {
        a.href = new URL(a.href, params.originalURL).href;
      }
    });

    // parse icons
    const foundIcons = parseIcons(document);

    // remove hidden divs
    document.querySelectorAll('[data-hlx-imp-hidden-div]').forEach((el) => {
      el.remove();
    });

    // // MWPW-135976 ONLY!
    // TODO - implement extension mechanism to add custom global rules to the script
    // // fix all #form links to make them point to the <form> element id
    // const formEl = document.querySelector('[data-faas-form-id]');
    // if (formEl) {
    //   const faasFormTitle = document.querySelector('[data-hlx-imp-label="faas-form-title"]');
    //   if (faasFormTitle) {
    //     const anchorId = faasFormTitle.textContent.toLowerCase().replace(/[!\"#\$%&\'\(\)\*\+,-\./:;<=>\?@\[\\\]\^_`{\|}~]/g, '').replace(/\s+/g, '-').replace(/(^-|-$)/g, '');
    //     document.querySelectorAll('a[href$="#form"]').forEach((a) => {
    //       a.href = '#' + anchorId;
    //     });
    //   }
    // }



    /**
     * bottom elements (metadata)
     */
    
    main.append(parseMetadata(document));
    const { block, tagsConverted } = parseCardMetadata(document);
    main.append(block);
    


    /**
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
    
    
    /**
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

    const elements = [{
      element: main,
      path: generateDocumentPath({ document, url: params.originalURL }),
      report: IMPORT_REPORT,
    }];
    elements.push(...extraElements);

    return elements;

  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {String} url The url of the document being transformed.
   * @param {HTMLDocument} document The document
   */
  generateDocumentPath: generateDocumentPath,

};
