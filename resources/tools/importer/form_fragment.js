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

export default {
  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @returns {HTMLElement} The root element
   */
  transformDOM: async ({ document, html}) => {
    // class="faas_form theme-dark theme-2cols theme-amc"

    const main = document.createElement('main');
    const faasTitle = document.querySelector('.modal h1, .modal h2, .modal h3, .modal h4, .modal h5, .modal h6')?.textContent.trim();
    const faasLink = document.createElement('a');
    const formSetting = document.querySelector('.faasform .formwr > div');
    const faasConfig = {
      id: formSetting.dataset.faas,
      l: formSetting.dataset.faasLang,
      d: formSetting.dataset.faasDestinationurl || window.importUrl.pathname.replace('.html', '/thank-you'),
      as: false,
      ar: true,
      pc: {
        1: 'js',
        2: 'faas_submission',
        3: 'sfdc',
        4: 'demandbase',
        5: '',
      },
      q: {},
      p: {
        js: {
          36: formSetting.dataset.faasCampid,
          39: "",
          77: 1,
          78: 1,
          79: 1,
          90: 'FAAS',
          92: formSetting.dataset.faasType,
          93: formSetting.dataset.faasSubtype,
          94: formSetting.dataset.faasProdinterest,
          149: '',
        },
      },
    };
    faasConfig.style_layout = 'column2';
    faasConfig.style_backgroundTheme = 'dark';
    faasConfig.title_size = 'h4';
    faasConfig.title_align = 'left';
    faasConfig.title = faasTitle;
    faasConfig.complete = true;
    
    console.log(faasConfig);
    const { utf8ToB64 } = await import('https://milo.adobe.com/libs/utils/utils.js');
    const formLinkURL = `https://milo.adobe.com/tools/faas#${utf8ToB64(JSON.stringify(faasConfig))}`;
    faasLink.href = formLinkURL;
    faasLink.innerHTML = `FaaS Link - FormID: ${faasConfig.id}`;
    main.append(faasLink);
    return main;
  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {String} url The url of the document being transformed.
   * @param {HTMLDocument} document The document
   */
  generateDocumentPath: ({ document, url, html, params }) => {
    let path = new URL(url).pathname.replace(/\/$/, '');
    path = path.replace('.html', '');
    path = `/fragments/resources/modal/forms/${path.split('/').at(-1)}`;
    return path;
  },
};
