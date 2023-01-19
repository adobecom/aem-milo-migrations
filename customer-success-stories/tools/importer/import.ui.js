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
/* global CodeMirror, html_beautify, ExcelJS, WebImporter */
import { initOptionFields, attachOptionFieldsListeners } from '../shared/fields.js';
import { getDirectoryHandle, saveFile } from '../shared/filesystem.js';
import { asyncForEach } from '../shared/utils.js';
import PollImporter from '../shared/pollimporter.js';
import alert from '../shared/alert.js';

const PARENT_SELECTOR = '.import';
const CONFIG_PARENT_SELECTOR = `${PARENT_SELECTOR} form`;

const PREVIEW_CONTAINER = document.querySelector(`${PARENT_SELECTOR} .page-preview`);

const IMPORTFILEURL_FIELD = document.getElementById('import-file-url');
const IMPORT_BUTTON = document.getElementById('import-doimport-button');

// const SAVEASWORD_BUTTON = document.getElementById('saveAsWord');
const FOLDERNAME_SPAN = document.getElementById('folder-name');

const TRANSFORMED_HTML_TEXTAREA = document.getElementById('import-transformed-html');
const MD_SOURCE_TEXTAREA = document.getElementById('import-markdown-source');
const MD_PREVIEW_PANEL = document.getElementById('import-markdown-preview');

const SPTABS = document.querySelector(`${PARENT_SELECTOR} sp-tabs`);

const DOWNLOAD_IMPORT_REPORT_BUTTON = document.getElementById('import-downloadImportReport');

const IS_BULK = document.querySelector('.import-bulk') !== null;
const BULK_URLS_HEADING = document.querySelector('#import-result h2');
const BULK_URLS_LIST = document.querySelector('#import-result ul');

const IMPORT_FILE_PICKER_CONTAINER = document.getElementById('import-file-picker-container');

const DOWNLOAD_BINARY_TYPES = ['pdf'];

const ui = {};
const config = {};
const importStatus = {
  imported: 0,
  total: 0,
  rows: [],
};

let dirHandle = null;

const setupUI = () => {
  ui.transformedEditor = CodeMirror.fromTextArea(TRANSFORMED_HTML_TEXTAREA, {
    lineNumbers: true,
    mode: 'htmlmixed',
    theme: 'base16-dark',
  });
  ui.transformedEditor.setSize('100%', '100%');

  ui.markdownEditor = CodeMirror.fromTextArea(MD_SOURCE_TEXTAREA, {
    lineNumbers: true,
    mode: 'markdown',
    theme: 'base16-dark',
  });
  ui.markdownEditor.setSize('100%', '100%');

  ui.markdownPreview = MD_PREVIEW_PANEL;
  ui.markdownPreview.innerHTML = WebImporter.md2html('Run an import to see some markdown.');
};

const loadResult = ({ md, html: outputHTML }) => {
  ui.transformedEditor.setValue(html_beautify(outputHTML));
  ui.markdownEditor.setValue(md || '');

  const mdPreview = WebImporter.md2html(md);
  ui.markdownPreview.innerHTML = mdPreview;

  // remove existing classes and styles
  Array.from(ui.markdownPreview.querySelectorAll('[class], [style]')).forEach((t) => {
    t.removeAttribute('class');
    t.removeAttribute('style');
  });
};

const updateImporterUI = (results, originalURL) => {
  if (!IS_BULK) {
    IMPORT_FILE_PICKER_CONTAINER.innerHTML = '';
    const picker = document.createElement('sp-picker');
    picker.setAttribute('size', 'm');

    if (results.length < 2) {
      picker.setAttribute('quiet', true);
      picker.setAttribute('disabled', true);
    }

    results.forEach((result, index) => {
      const { path } = result;
      const item = document.createElement('sp-menu-item');
      item.innerHTML = path;
      if (index === 0) {
        item.setAttribute('selected', true);
        picker.setAttribute('label', path);
        picker.setAttribute('value', path);
      }
      picker.appendChild(item);
    });

    IMPORT_FILE_PICKER_CONTAINER.append(picker);

    picker.addEventListener('change', (e) => {
      const r = results.filter((i) => i.path === e.target.value)[0];
      loadResult(r);
    });

    loadResult(results[0]);
  } else {
    const li = document.createElement('li');
    const link = document.createElement('sp-link');
    link.setAttribute('size', 'm');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', originalURL);
    link.innerHTML = originalURL;
    li.append(link);

    console.log(`hey brad heres the originalURL: ${originalURL}`);

    BULK_URLS_LIST.append(li);
    BULK_URLS_HEADING.innerText = `Imported URLs (${importStatus.imported} / ${importStatus.total}):`;
  }
};

const clearResultPanel = () => {
  BULK_URLS_LIST.innerHTML = '';
  BULK_URLS_HEADING.innerText = 'Importing...';
};

const clearImportStatus = () => {
  importStatus.imported = 0;
  importStatus.total = 0;
  importStatus.rows = [];
};

const disableProcessButtons = () => {
  IMPORT_BUTTON.disabled = true;
};

const enableProcessButtons = () => {
  IMPORT_BUTTON.disabled = false;
};

const getProxyURLSetup = (url, origin) => {
  const u = new URL(url);
  if (!u.searchParams.get('host')) {
    u.searchParams.append('host', u.origin);
  }
  const src = `${origin}${u.pathname}${u.search}`;
  return {
    remote: {
      url,
      origin: u.origin,
    },
    proxy: {
      url: src,
      origin,
    },
  };
};

const postImportProcess = async (results, originalURL) => {
  await asyncForEach(results, async ({ docx, filename, path }) => {
    const data = {
      status: 'Success',
      url: originalURL,
      path,
      pageCreatedAt: window.jcrContent.pageCreatedAt,
      translated: window.jcrContent.translated,
      template: window.jcrContent.template,
    };
    
    const includeDocx = !!docx;
    if (includeDocx) {
      await saveFile(dirHandle, filename, docx);
      data.docx = filename;
    }
    importStatus.rows.push(data);
  });
};

const createImporter = () => {
  config.importer = new PollImporter({
    origin: config.origin,
    poll: !IS_BULK,
    importFileURL: config.fields['import-file-url'],
  });
};

const getContentFrame = () => document.querySelector(`${PARENT_SELECTOR} iframe`);

const attachListeners = () => {
  attachOptionFieldsListeners(config.fields, PARENT_SELECTOR);

  config.importer.addListener(async ({ results }) => {
    const frame = getContentFrame();
    const { originalURL } = frame.dataset;

    updateImporterUI(results, originalURL);
    postImportProcess(results, originalURL);

    alert.success(`Import of page ${originalURL} completed.`);
  });

  config.importer.addErrorListener(({ url, error: err, params }) => {
    // eslint-disable-next-line no-console
    console.error(`Error importing ${url}: ${err.message}`, err);
    alert.error(`Error importing ${url}: ${err.message}`);

    importStatus.rows.push({
      url: params.originalURL,
      status: `Error: ${err.message}`,
    });
  });

  IMPORT_BUTTON.addEventListener('click', (async () => {
    clearImportStatus();

    if (IS_BULK) {
      clearResultPanel();
      if (config.fields['import-show-preview']) {
        PREVIEW_CONTAINER.classList.remove('hidden');
      } else {
        PREVIEW_CONTAINER.classList.add('hidden');
      }
      DOWNLOAD_IMPORT_REPORT_BUTTON.classList.remove('hidden');
    } else {
      DOWNLOAD_IMPORT_REPORT_BUTTON.classList.add('hidden');
      PREVIEW_CONTAINER.classList.remove('hidden');
    }

    disableProcessButtons();
    if (config.fields['import-local-save'] && !dirHandle) {
      try {
        dirHandle = await getDirectoryHandle();
        await dirHandle.requestPermission({
          mode: 'readwrite',
        });
        FOLDERNAME_SPAN.innerText = `Saving file(s) to: ${dirHandle.name}`;
        FOLDERNAME_SPAN.classList.remove('hidden');
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('No directory selected');
      }
    }

    const field = IS_BULK ? 'import-urls' : 'import-url';
    const urlsArray = config.fields[field].split('\n').reverse().filter((u) => u.trim() !== '');
    importStatus.total = urlsArray.length;
    const processNext = async () => {
      if (urlsArray.length > 0) {
        const url = urlsArray.pop();
        const { remote, proxy } = getProxyURLSetup(url, config.origin);
        const src = proxy.url;

        console.log(`hey brad here is the original SRC URL: ${src}`);

        const getJSON = async (url) => {
          const response = await fetch(url, {
              headers: {
                  'Authorization': 'Basic ' + btoa('milo-dev:HQR2aUaKYmNNWfKzMjx8')
              }
          });
          const data = await response.json();
          return data;
        }


        let customerName = '';
        let locale = remote.url.split('/')[3];
        let lang = '';
        console.log(`THE ACTUAL RAW locale: ${locale}`);

        if (locale === 'customer-success-stories') {
          locale = 'en_us';
          customerName = remote.url.split('/')[4].split('.')[0];
        } else {
          customerName = remote.url.split('/')[5].split('.')[0];
          // locale = remote.url.split('/')[3].split('_')[0];
          // lang = remote.url.split('/')[3].split('_')[1];
          // console.log(`THE lang: ${lang}`);
          // console.log(`THE locale: ${locale}`);
        }
        console.log(`remote.url: ${remote.url}`);
        console.log(`customerName: ${customerName}`);
        let fetchUrl = '';

        const baseFetchUrl = 'https://www-author.corp.adobe.com/content/dx';
        const subPath = 'customer-success-stories';

        switch (locale) {
          case 'ae_ar':
            fetchUrl = `${baseFetchUrl}/ae/ar/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'ae_en':
            fetchUrl = `${baseFetchUrl}/ae/en/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'africa':
            fetchUrl = `${baseFetchUrl}/africa/en/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'ar':
            fetchUrl = `${baseFetchUrl}/ar/es/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'at':
            fetchUrl = `${baseFetchUrl}/at/de/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'au':
            fetchUrl = `${baseFetchUrl}/au/en/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'be_en':
            fetchUrl = `${baseFetchUrl}/be/en/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'be_fr':
            fetchUrl = `${baseFetchUrl}/be/fr/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'be_nl':
            fetchUrl = `${baseFetchUrl}/be/nl/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'bg':
            fetchUrl = `${baseFetchUrl}/bg/bg/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'br':
            fetchUrl = `${baseFetchUrl}/br/pt/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'ca':
            fetchUrl = `${baseFetchUrl}/ca/en/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'ca_fr':
            fetchUrl = `${baseFetchUrl}/ca/fr/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'ch_de':
            fetchUrl = `${baseFetchUrl}/ch/de/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'ch_fr':
            fetchUrl = `${baseFetchUrl}/ch/fr/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'ch_it':
            fetchUrl = `${baseFetchUrl}/ch/it/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'cl':
            fetchUrl = `${baseFetchUrl}/cl/es/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'cn':
            fetchUrl = `${baseFetchUrl}/cn/zh-Hans/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'co':
            fetchUrl = `${baseFetchUrl}/co/es/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'cy_en':
            fetchUrl = `${baseFetchUrl}/cy/en/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'cz':
            fetchUrl = `${baseFetchUrl}/cz/cs/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'de':
            fetchUrl = `${baseFetchUrl}/de/de/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'dk':
            fetchUrl = `${baseFetchUrl}/dk/da/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'ee':
            fetchUrl = `${baseFetchUrl}/ee/et/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'es':
            fetchUrl = `${baseFetchUrl}/es/es/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'fi':
            fetchUrl = `${baseFetchUrl}/fi/fi/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'fr':
            fetchUrl = `${baseFetchUrl}/fr/fr/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'gr_en':
            fetchUrl = `${baseFetchUrl}/gr/en/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'hk_en':
            fetchUrl = `${baseFetchUrl}/hk/en/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'hk_zh':
            fetchUrl = `${baseFetchUrl}/hk/zh-Hant/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'hu':
            fetchUrl = `${baseFetchUrl}/hu/hu/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'id_en':
            fetchUrl = `${baseFetchUrl}/id/en/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'id_id':
            fetchUrl = `${baseFetchUrl}/id/id/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'ie':
            fetchUrl = `${baseFetchUrl}/ie/en/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'il_en':
            fetchUrl = `${baseFetchUrl}/il/en/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'il_he':
            fetchUrl = `${baseFetchUrl}/il/he/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'in':
            fetchUrl = `${baseFetchUrl}/in/en/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'in_hi':
            fetchUrl = `${baseFetchUrl}/in/hi/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'it':
            fetchUrl = `${baseFetchUrl}/it/it/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'jp':
            fetchUrl = `${baseFetchUrl}/jp/ja/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'kr':
            fetchUrl = `${baseFetchUrl}/kr/ko/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'la':
            fetchUrl = `${baseFetchUrl}/la/es/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'lt':
            fetchUrl = `${baseFetchUrl}/lt/lt/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'lu_de':
            fetchUrl = `${baseFetchUrl}/lu/de/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'lu_en':
            fetchUrl = `${baseFetchUrl}/lu/en/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'lu_fr':
            fetchUrl = `${baseFetchUrl}/lu/fr/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'lv':
            fetchUrl = `${baseFetchUrl}/lv/lv/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'mena_ar':
            fetchUrl = `${baseFetchUrl}/mena/ar/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'mena_en':
            fetchUrl = `${baseFetchUrl}/mena/en/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'mt':
            fetchUrl = `${baseFetchUrl}/mt/en/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'mx':
            fetchUrl = `${baseFetchUrl}/mx/es/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'my_en':
            fetchUrl = `${baseFetchUrl}/my/en/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'my_ms':
            fetchUrl = `${baseFetchUrl}/my/ms/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'nl':
            fetchUrl = `${baseFetchUrl}/nl/nl/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'no':
            fetchUrl = `${baseFetchUrl}/no/no/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'nz':
            fetchUrl = `${baseFetchUrl}/nz/en/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'pe':
            fetchUrl = `${baseFetchUrl}/pe/es/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'ph_en':
            fetchUrl = `${baseFetchUrl}/ph/en/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'ph_fil':
            fetchUrl = `${baseFetchUrl}/ph/fil/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'pl':
            fetchUrl = `${baseFetchUrl}/pl/pl/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'pt':
            fetchUrl = `${baseFetchUrl}/pt/pt/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'ro':
            fetchUrl = `${baseFetchUrl}/ro/ro/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'ru':
            fetchUrl = `${baseFetchUrl}/ru/ru/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'sa_ar':
            fetchUrl = `${baseFetchUrl}/sa/ar/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'sa_en':
            fetchUrl = `${baseFetchUrl}/sa/en/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'se':
            fetchUrl = `${baseFetchUrl}/se/sv/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'sea':
            fetchUrl = `${baseFetchUrl}/sea/en/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'sg':
            fetchUrl = `${baseFetchUrl}/sg/en/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'si':
            fetchUrl = `${baseFetchUrl}/si/sl//${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'sk':
            fetchUrl = `${baseFetchUrl}/sk/sk/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'th_en':
            fetchUrl = `${baseFetchUrl}/th/en/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'th_th':
            fetchUrl = `${baseFetchUrl}/th/th/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'tr':
            fetchUrl = `${baseFetchUrl}/tr/tr/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'tw':
            fetchUrl = `${baseFetchUrl}/tw/zh-Hant/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'ua':
            fetchUrl = `${baseFetchUrl}/ua/uk/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'uk':
            fetchUrl = `${baseFetchUrl}/uk/uk/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'vn_en':
            fetchUrl = `${baseFetchUrl}/vn/en/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          case 'vn_vi': 
            fetchUrl = `${baseFetchUrl}/vn/vi/${subPath}/${customerName}/jcr:content.6.json`;
            break;
          default:
            fetchUrl = `${baseFetchUrl}/us/en/${subPath}/${customerName}/jcr:content.6.json`;
            break;
        }
            

        // if (locale === 'en_us') {
        //   fetchUrl = `https://www-author.corp.adobe.com/content/dx/us/en/${subPath}/${customerName}/jcr:content.6.json`;
        // } else if (locale === 'jp') {
        //   fetchUrl = `https://www-author.corp.adobe.com/content/dx/jp/ja/customer-success-stories/${customerName}/jcr:content.6.json`;
        // } else if (locale === 'de') {
        //   fetchUrl = `https://www-author.corp.adobe.com/content/dx/${locale}/${locale}/customer-success-stories/${customerName}/jcr:content.6.json`;
        // } else {
        //   fetchUrl = `https://www-author.corp.adobe.com/content/dx/${locale}/${lang}/customer-success-stories/${customerName}/jcr:content.6.json`;
        // }
        // if (locale === 'jp') {
        //   fetchUrl = `http://localhost:3001/tools/importer/local-json/jp/${customerName}.json`;
        // } else if (locale === 'de') {
        //   fetchUrl = `http://localhost:3001/tools/importer/local-json/de/${customerName}.json`;
        // }        
        console.log(`fetchUrl: ${fetchUrl}`);
        window.jcrContent = await getJSON(fetchUrl);
        window.currentImportItem = remote.url.split('/')[4].split('.')[0];
        console.log('window.jcrContent');

        window.jcrContent.locale = locale;


        importStatus.imported += 1;
        // eslint-disable-next-line no-console
        console.log(`Importing: ${importStatus.imported} => ${src}`);

        const res = await fetch(src);
        if (res.ok) {
          if (res.redirected) {
            // eslint-disable-next-line no-console
            console.warn(`Cannot transform ${src} - redirected to ${res.url}`);
            const u = new URL(res.url);
            let redirect = res.url;
            if (u.origin === window.location.origin) {
              redirect = `${remote.origin}${u.pathname}`;
            }
            importStatus.rows.push({
              url,
              status: 'Redirect',
              redirect,
            });
            processNext();
          } else {
            const contentType = res.headers.get('content-type');
            if (contentType.includes('html')) {
              const frame = document.createElement('iframe');
              frame.id = 'import-content-frame';

              if (config.fields['import-enable-js']) {
                frame.removeAttribute('sandbox');
              } else {
                frame.setAttribute('sandbox', 'allow-same-origin');
              }

              const onLoad = async () => {
                const includeDocx = !!dirHandle;

                if (config.fields['import-scroll-to-bottom']) {
                  frame.contentWindow.window.scrollTo({ left: 0, top: frame.contentDocument.body.scrollHeight, behavior: 'smooth' });
                }

                window.setTimeout(async () => {
                  const { originalURL, replacedURL } = frame.dataset;
                  console.log(`hey brad here is frame.dataset: ${JSON.stringify(frame.dataset)}`);
                  // const replacedURL = replacedURL.split('?')[0];
                  if (frame.contentDocument) {
                    config.importer.setTransformationInput({
                      url: replacedURL,
                      document: frame.contentDocument,
                      includeDocx,
                      params: { originalURL },
                    });
                    console.log(`hey brad heres the originalURL: ${originalURL}`);
                    console.log(`hey brad heres the replacedURL: ${replacedURL}`);
                    await config.importer.transform();
                  }

                  const event = new Event('transformation-complete');
                  frame.dispatchEvent(event);
                }, config.fields['import-pageload-timeout'] || 100);
              };

              frame.addEventListener('load', onLoad);
              frame.addEventListener('transformation-complete', processNext);
                  
              // const src = src.split('?')[0];
              frame.dataset.originalURL = url;
              frame.dataset.replacedURL = src;
              frame.src = src;

              const current = getContentFrame();
              current.removeEventListener('load', onLoad);
              current.removeEventListener('transformation-complete', processNext);

              current.replaceWith(frame);
            } else if (IS_BULK
              && DOWNLOAD_BINARY_TYPES.filter((t) => contentType.includes(t)).length > 0) {
              const blob = await res.blob();
              const u = new URL(src);
              const path = WebImporter.FileUtils.sanitizePath(u.pathname);

              await saveFile(dirHandle, path, blob);
              importStatus.rows.push({
                url,
                status: 'Success',
                path,
              });
              console.log(`LATEST - hey brad this is the url: ${url}`);
              console.log(`hey brad this is the path: ${path}`);
              updateImporterUI(null, url);
              processNext();
            }
          }
        } else {
          // eslint-disable-next-line no-console
          console.warn(`Cannot transform ${src} - page may not exist (status ${res.status})`);
          importStatus.rows.push({
            url,
            status: `Invalid: ${res.status}`,
          });
          processNext();
        }
        // ui.markdownPreview.innerHTML = md2html('Import in progress...');
        // ui.transformedEditor.setValue('');
        // ui.markdownEditor.setValue('');
      } else {
        const frame = getContentFrame();
        frame.removeEventListener('transformation-complete', processNext);
        DOWNLOAD_IMPORT_REPORT_BUTTON.classList.remove('hidden');
        enableProcessButtons();
      }
    };
    processNext();
  }));

  IMPORTFILEURL_FIELD.addEventListener('change', (event) => {
    if (config.importer) {
      config.importer.setImportFileURL(event.target.value);
    }
  });

  DOWNLOAD_IMPORT_REPORT_BUTTON.addEventListener('click', (async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    worksheet.autoFilter = {
      from: 'A1',
      to: 'E1',
    };
    worksheet.addRows([
      ['URL', 'path', 'docx', 'status', 'redirect', 'pageCreatedAt', 'translated', 'template'],
    ].concat(importStatus.rows.map(({
      url,
      path,
      docx,
      status,
      redirect,
      pageCreatedAt,
      translated,
      template,
    }) => [url, path, docx || '', status, redirect || '', pageCreatedAt, translated, template])));
    const buffer = await workbook.xlsx.writeBuffer();
    const a = document.createElement('a');
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    a.setAttribute('href', URL.createObjectURL(blob));
    a.setAttribute('download', 'import_report.xlsx');
    a.click();
  }));

  if (SPTABS) {
    SPTABS.addEventListener('change', () => {
      // required for code to load in editors
      setTimeout(() => {
        ui.transformedEditor.refresh();
        ui.markdownEditor.refresh();
      }, 1);
    });
  }
};

const init = () => {
  config.origin = window.location.origin;
  config.fields = initOptionFields(CONFIG_PARENT_SELECTOR);

  createImporter();

  if (!IS_BULK) setupUI();
  attachListeners();
};

init();
