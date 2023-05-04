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

import { parseMarquee } from '../rules/marquee.js';
import { parseCardMetadata, parseMetadata } from '../rules/metadata.js';
import { parseCAASContent } from '../rules/caas.js';
import { setGlobals, generateDocumentPath } from '../utils.js';
import { parseBreadcrumb } from '../rules/breadcrumb.js';
import { waitForFaasForm } from '../rules/handleFaasForm.js';
import { parseEventSpeakerAndProductWithoutFaas } from '../rules/event-speaker-product.js';
import { handleFaasForm } from '../rules/handleFaasForm.js';

async function layout1(sections, document, container, modalPath) {
  const marqueeDoc = sections.shift()
  // set register form link to modal fragment
  const cta = marqueeDoc.querySelector('.cta');
  if (cta) {
    const link = marqueeDoc.querySelector('a');
    if (link.href.indexOf('#register-form') >= 0) {
      link.href = "https://main--bacom--adobecom.hlx.page" + modalPath + "#faas-form"
    }
  }
  container.append(await parseMarquee(marqueeDoc, document, null))
  container.append(await parseEventSpeakerAndProductWithoutFaas(sections.shift(), document, null))
  container.append(await parseCAASContent(sections.shift(), document, null))
  // bottom marquee fragment
  const resource = document.createElement('a')
  resource.href = "https://main--bacom--adobecom.hlx.page/fragments/customer-success-stories/contact-footer"
  resource.innerHTML = "https://main--bacom--adobecom.hlx.page/fragments/customer-success-stories/contact-footer"
  container.append(resource)

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

    // FAAS modal
    let titleElement = document.querySelector('.faasform')?.closest('.aem-Grid')?.querySelector('.cmp-text');
    titleElement = titleElement || document.querySelector('.faasform')?.closest('.aem-Grid')?.querySelector('.cmp-title')
    const formLink = handleFaasForm(document, document, titleElement);
    const form = document.createElement('p');
    form.append(formLink);
    const modalContainer = document.createElement('div')
    modalContainer.append(form)

    const faasModalPath = "/fragments/resources/modal/forms/webinars" + generateDocumentPath({ document, url: params.originalURL })

    // webinar page
    
    const [breadcrumbType, breadcrumb] = parseBreadcrumb(document);

    let main = document.createElement('div')
    main.append(breadcrumb);

    WebImporter.DOMUtils.remove(document, [
      '.globalnavheader',
      '.globalnavfooter'
    ]);

    const layouts = [
      {
        section: '.content > div > div',
        minSections: 4,
        process: layout1
      },
    ]

    let layoutContainer
    for (let i = 0; i < layouts.length; i++) {
      let item = layouts[i]
      let sections = [...document.querySelectorAll(item.section)];
      console.log("L: " + sections.length)
      if (sections.length >= item.minSections) {
        layoutContainer = await item.process(sections, document, main, faasModalPath)
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

    return [
      {
        element: main,
        path: generateDocumentPath({ document, url: params.originalURL }),
        report: {
          'breadcrumb type': breadcrumbType,
          'tags converted?': tagsConverted.toString(),
        },
      },
      {
        element: modalContainer,
        path: faasModalPath,
      },
    ]

  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {String} url The url of the document being transformed.
   * @param {HTMLDocument} document The document
   */
  generateDocumentPath: generateDocumentPath,

};
