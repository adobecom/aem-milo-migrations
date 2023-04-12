/*
 * Copyright 2023 Adobe. All rights reserved.
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
import { utf8ToB64 } from './utils.js';

const waitForFaasForm = async (document) => { 
  if (document.querySelector('.faas_form')) {
    try {
      document.querySelectorAll('a.spectrum-Button')
        .forEach(item => {
          if(item.href.includes('register-form')){
            item.click()
          }
        })
      await WebImporter.Loader.waitForElement('.faas-form-settings', document, 10000);
    } catch (error) {
      console.error('faas form not added to the DOM after 10s.');
    }
  }
};

/**
 * Replace a form with a faas link
 * @param {*} root The root element in which to search for the form
 * @param {*} document Document
 * @param {String || Element} faasTitle  (optional) CSS selector to find the title of the form
 * @returns The link element or null if no form was found
 */
const handleFaasForm = (root, document, faasTitle) => {
  const faasFormElement = root.querySelector('.faas_form')
  if (!faasFormElement) return;

  const faasSettingElement = faasFormElement.parentElement.querySelector('.faas-form-settings');
  if (!faasSettingElement) {
    throw new Error('faas_form detected but no faas-form-settings element found - invalid form ?');
  }

  const data = faasFormElement.dataset;

  let faasConfig = JSON.parse(faasSettingElement.innerHTML);
  faasConfig.complete = true;

  const destinationUrl = `/resources${data.faasDestinationurl.split('resources')[1]}`;
  faasConfig.d = destinationUrl;

  faasConfig.title = '';
  if (faasTitle) {
    let el = faasTitle;
    if (typeof faasTitle === 'string') {
      el = root.querySelector(faasTitle);
    }
    if (el) {
      faasConfig.title = el.textContent.trim();
    }
  }
  console.log(`faasform title: ${faasConfig.title}`);

  if (faasFormElement.className.includes('theme-2cols')) {
    faasConfig.style_layout = 'column2';
  }
  faasConfig.cleabitStyle = '';
  if (data.faasPrepopulated.includes('clearbit') && data.faasType === '2847') {
    faasConfig.title_size = 'p';
    faasConfig.title_align = 'left';
    faasConfig.cleabitStyle = 'Cleabit Style'
  }

  const formLinkURL = `https://milo.adobe.com/tools/faas#${utf8ToB64(JSON.stringify(faasConfig))}`;

  const formLink = document.createElement('a');
  formLink.href = formLinkURL;
  formLink.innerHTML = `FaaS Link - FormID: ${faasConfig.id} ${faasConfig.cleabitStyle}`;
  faasFormElement.replaceWith(formLink);
  return formLink;
}

export { handleFaasForm, waitForFaasForm };
