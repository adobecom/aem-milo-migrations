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

import { parseMarquee } from '../parsers/marquee.js';
import { parseCardMetadata, parseMetadata } from '../parsers/metadata.js';
import { parseCAASContent } from '../parsers/caas.js';
import { setGlobals, generateDocumentPath } from '../utils.js';
import { parseBreadcrumb } from '../parsers/breadcrumb.js';
import { waitForFaasForm } from '../parsers/handleFaasForm.js';
import { parseEventSpeakerAndProduct, parseEventSpeakerAndFaas, parseWebinarTime } from '../parsers/event-speaker-product.js';

async function layout1(sections, document, container) {
  container.append(await parseMarquee(sections.shift(), document, null))
  if(sections.length > 3) {
    container.append(await parseWebinarTime(sections.shift(), document, null))
  }
  container.append(await parseEventSpeakerAndProduct(sections.shift(), document, null))
  container.append(await parseCAASContent(sections.shift(), document, null))
  container.append(await parseMarquee(sections.shift(), document, null))

  return container
}

async function layout2(sections, document, container) {
  container.append(await parseMarquee(sections.shift(), document, null))
  container.append(await parseWebinarTime(sections.shift(), document, null))
  container.append(await parseEventSpeakerAndFaas(sections.shift(), document, null))

  return container
}

async function layout3(sections, document, container) {
  container.append(await parseMarquee(sections.shift(), document, null))
  container.append(await parseEventSpeakerAndFaas(sections.shift(), document, null))
  return container
}

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


  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @returns {HTMLElement} The root element
   */

  transform: async ({ document, params }) => {

    await setGlobals(params.originalURL);

    const [breadcrumbType, breadcrumb] = parseBreadcrumb(document);

    let main = document.createElement('div')
    main.append(breadcrumb);

    WebImporter.DOMUtils.remove(document, [
      '.globalnavheader',
      '.globalnavfooter',
      '.dexter-Spacer'
    ]);

    const layouts = [
      {
        section: '.content > div > div',
        minSections: 4,
        process: layout1
      },
      {
        section: '.root > div > div',
        minSections: 3,
        process: layout2
      },
      {
        section: '.content > div > div',
        minSections: 3,
        process: layout2
      },
      {
        section: '.content > div > div',
        minSections: 2,
        process: layout3
      },
      {
        section: '.root > div > div',
        minSections: 2,
        process: layout3
      }
    ]

    let layoutContainer
    for (let i = 0; i < layouts.length; i++) {
      let item = layouts[i]
      let sections = [...document.querySelectorAll(item.section)];
      console.log("L: " + sections.length)
      if (sections.length >= item.minSections) {
        layoutContainer = await item.process(sections, document, main)
        if (layoutContainer) {
          break;
        }
      }
    }

    main = layoutContainer
    if(!main) {
      throw new Error('Layout not supported');
    }

    /*
     * metadata
     */

    main.append(parseMetadata(document));
    const { block, tagsConverted } = parseCardMetadata(document);
    main.append(block);

    return [{
      element: main,
      path: generateDocumentPath({ document, url: params.originalURL }),
      report: {
        'breadcrumb type': breadcrumbType,
        'tags converted?': tagsConverted.toString(),
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
