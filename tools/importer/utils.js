export const localMap = {
  ae_ar: 'ae/ar',
  ae_en: 'ae/en',
  africa: 'africa/en',
  ar: 'ar/es',
  at: 'at/de',
  au: 'au/en',
  be_en: 'be/en',
  be_fr: 'be/fr',
  be_nl: 'be/nl',
  bg: 'bg/bg',
  br: 'br/pt',
  ca: 'ca/en',
  ca_fr: 'ca/fr',
  ch_de: 'ch/de',
  ch_fr: 'ch/fr',
  ch_it: 'ch/it',
  cl: 'cl/es',
  cn: 'cn/zh',
  co: 'co/es',
  cy_en: 'cy/en',
  cz: 'cz/cs',
  de: 'de/de',
  dk: 'dk/da',
  ee: 'ee/et',
  es: 'es/es',
  fi: 'fi/fi',
  fr: 'fr/fr',
  gr_en: 'gr/en',
  hk_en: 'hk/en',
  hk_zh: 'hk/zh',
  hu: 'hu/hu',
  id_en: 'id/en',
  id_id: 'id/id',
  ie: 'ie/en',
  il_en: 'il/en',
  il_he: 'il/he',
  in: 'in/en',
  in_hi: 'in/hi',
  it: 'it/it',
  jp: 'jp/ja',
  kr: 'kr/ko',
  la: 'la/es',
  lt: 'lt/lt',
  lu_de: 'lu/de',
  lu_en: 'lu/en',
  lu_fr: 'lu/fr',
  lv: 'lv/lv',
  mena_ar: 'mena/ar',
  mena_en: 'mena/en',
  mt: 'mt/en',
  mx: 'mx/es',
  my_en: 'my/en',
  my_ms: 'my/ms',
  nl: 'nl/nl',
  no: 'no/no',
  nz: 'nz/en',
  pe: 'pe/es',
  ph_en: 'ph/en',
  ph_fil: 'ph/fil',
  pl: 'pl/pl',
  pt: 'pt/pt',
  ro: 'ro/ro',
  ru: 'ru/ru',
  sa_ar: 'sa/ar',
  sa_en: 'sa/en',
  se: 'se/sv',
  sea: 'sea/en',
  sg: 'sg/en',
  si: 'si/sl',
  sk: 'sk/sk',
  th_en: 'th/en',
  th_th: 'th/th',
  tr: 'tr/tr',
  tw: 'tw/zh',
  ua: 'ua/uk',
  uk: 'uk/uk',
  vn_en: 'vn/en',
  vn_vi: 'vn/vi',
};

export const getJSON = async (url) => {
  const response = await fetch(url, {
      headers: {
          'Authorization': 'Basic ' + btoa('milo-dev:HQR2aUaKYmNNWfKzMjx8')
      }
  });
  const data = await response.json();
  return data;
}

/* Search key from complicated JSON
* @return array values
*/
export const getJSONValues = (obj, key) => {
  if (!obj) {
    console.log(`Failed to load obj for ${key}`);
    return [];
  }
  if (obj[key]) {
    return obj[key];
  }
  var objects = [];
  for (var i in obj) {
      if (!obj.hasOwnProperty(i)) continue;
      if (typeof obj[i] === 'object') {
          const childObjects = getJSONValues(obj[i], key);
          if (childObjects.length) {
            objects = objects.concat(childObjects);
          }
      } else if (i === key) {
          objects.push(obj[i]);
      }
      // debugging
      // if (key === 'og:image') {
      //   console.log('i', i, 'key', key, 'objects', objects);
      // }
  }
  if (objects.length) {
    return objects;
  }
  else {
    return '';
  }
};

/**
 * searches deep into an object recursively...
 * @param {Object} obj object to be searched
 * @param {any} searchValue the value/key to search for
 * @param {boolean} [searchKeys] whether to search object keys as well as values. Defaults to `true` if `serchValue` is a string, `false` otherwise.
 * @returns {string[]} Paths on the object to the matching results
 */
 export const findPaths = (
  obj,
  searchKeys = typeof searchValue === "string",
  searchValue,
) => {
  const paths = []
  const visited = new Set()
  const notObject = typeof searchValue !== "object"
  const gvpio = (obj, prefix) => {
    for (const [curr, currElem] of Object.entries(obj)) {
      if (searchKeys && curr.includes(searchValue)) {
        const path = prefix + curr;
        paths.push([path, curr]);
      }

      if (typeof currElem === "object") {
        if (visited.has(currElem)) continue
        visited.add(currElem)
        gvpio(currElem, prefix + curr + "/")
        if (notObject) continue
      }
      if (typeof currElem === 'string' && currElem.includes(searchValue)) {
        const path = prefix + curr;
        paths.push([path, currElem]);
      }
    }
  }
  gvpio(obj, "")
  return paths
}

const getMetadataValueFromCqTags = (obj, key) => {
  const cqTags = getJSONValues(obj, 'cq:tags');
  let cqTagMetaValue = '';
  if (cqTags && cqTags.length) {
    cqTags.forEach((tag) => {
      if(tag.startsWith(key)) {
        cqTagMetaValue = tag.split('/')[1];
        return;
      }
    });
  }
  return cqTagMetaValue;
};

export const getMetadataValue = (document, key) => {
  if (key === 'title') {
    return document.head.querySelector('title')?.textContent || '';
  }

  return document.head.querySelector(`meta[property="${key}"`)?.content ||
    document.head.querySelector(`meta[name="${key}"`)?.content ||
    getMetadataValueFromCqTags(window.data, key) || 
    getJSONValues(window.data, key) || '';
}

export const createElementFromHTML = (htmlString) => {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes.
  return div;
};

export const getRecommendedArticles = async (main, document) => {
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

export const isRelative = url => !url.startsWith('http');

export const createMetadata = (document, kv = {}) => {
  const meta = {};
  Object.keys(kv).forEach((key) => {
    let metaValue = getMetadataValue(document, kv[key]);
    if (!metaValue.length) {
      metaValue = '';
    }
    else if (metaValue.startsWith('/content/dam/')) {
      metaValue = `https://business.adobe.com${metaValue}`;
    }
    meta[key] = metaValue;
  });
  
  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  return block;
};

export const createForm = async (document, faasTitleSelector) => {
  const formContainer = document.querySelector('.marketoForm');
  if (formContainer) {
    const marketoForm = document.querySelector('.marketo-form');
    const mktoCells = [
      ['Marketo'],
      ['Title', formContainer.querySelector('p')?.textContent || ''],
      ['Form ID', getJSONValues(window.data, 'formId')[0] || marketoForm.getAttribute('data-marketo-form-id')],
      ['Base URL', getJSONValues(window.data, 'baseURL')[0] || marketoForm.getAttribute('data-marketo-baseurl')],
      ['Munchkin ID', getJSONValues(window.data, 'munchkinId')[0] || marketoForm.getAttribute('data-marketo-munchkin-id')],
      ['Destination URL', window.importUrl.pathname.replace('.html', '/thank-you')],
    ];
    const mktoTable = WebImporter.DOMUtils.createTable(mktoCells, document);
    formContainer.remove();
    const cells = [
      ['Section Metadata'],
      ['style', 'container, xxl spacing, divider, two-up'],
    ];
    return [mktoTable, WebImporter.DOMUtils.createTable(cells, document)];
  }

  const jcrContent = JSON.stringify(window.data);
  const formLink = document.createElement('a');
  let faasConfig = document.querySelector('.faas-form-settings')?.innerHTML;
  const { utf8ToB64 } = await import('https://milo.adobe.com/libs/utils/utils.js');
  faasConfig = JSON.parse(faasConfig);
  faasConfig.complete = true;
  const destinationUrl = `/resources${getJSONValues(window.data, 'destinationUrl')[0].split('resources')[1]}`;
  faasConfig.d = destinationUrl;
  faasConfig.title = document.querySelector(faasTitleSelector)?.textContent.trim();
  if (jcrContent?.includes('theme-2cols')) {
    faasConfig.style_layout = 'column2';
  }
  faasConfig.cleabitStyle = '';
  if (getJSONValues(window.data, 'clearbit')[0] && getJSONValues(window.data, 'formSubType')[0] === '2847') {
    faasConfig.title_size = 'p';
    faasConfig.title_align = 'left';
    faasConfig.cleabitStyle = 'Cleabit Style'
  }
  console.log('faasConfig:', faasConfig);
  const formLinkURL = `https://milo.adobe.com/tools/faas#${utf8ToB64(JSON.stringify(faasConfig))}`;
  formLink.href = formLinkURL;
  formLink.innerHTML = `FaaS Link - FormID: ${faasConfig.id} ${faasConfig.cleabitStyle}`;
  const cells = [
    ['Section Metadata'],
    ['style', 'container, xxl spacing, divider'],
  ];
  return [formLink, WebImporter.DOMUtils.createTable(cells, document)];
};