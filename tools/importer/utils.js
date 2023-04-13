import handleCaasCollection from './rules/handleCaasCollection.js';

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
  cn: 'cn/zh-Hans',
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
  uk: 'uk/en',
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
  return document.head.querySelector(`meta[property="${key}"`)?.content ||
    document.head.querySelector(`meta[name="${key}"`)?.content ||
    getMetadataValueFromCqTags(window.jcrContent, key) || 
    getJSONValues(window.jcrContent, key) || '';
}

export const getCaasTags = (document) => {
  const tags = [];
  if (window.jcrContent) {
    const cqTags = getJSONValues(window.jcrContent, 'cq:tags');
    if (cqTags && cqTags.length) {
      cqTags.forEach((tag) => {
        if(tag.startsWith('caas:')) {
          tags.push(tag);
        }
      });
    }
  }
  return tags;
};

export const createElementFromHTML = (htmlString) => {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes.
  return div;
};

export const getRecommendedArticles = async (main, document) => {
  let caasLink = await handleCaasCollection(document, document);
  if (!caasLink) {
    caasLink = document.createElement('a');
    caasLink.href = 'https://milo.adobe.com/tools/caas#eyJhbmFseXRpY3NUcmFja0ltcHJlc3Npb24iOmZhbHNlLCJhbmFseXRpY3NDb2xsZWN0aW9uTmFtZSI6IiIsImFuZExvZ2ljVGFncyI6W10sImJvb2ttYXJrSWNvblNlbGVjdCI6IiIsImJvb2ttYXJrSWNvblVuc2VsZWN0IjoiIiwiY2FyZFN0eWxlIjoiMToyIiwiY29sbGVjdGlvbkJ0blN0eWxlIjoicHJpbWFyeSIsImNvbnRhaW5lciI6IjEyMDBNYXhXaWR0aCIsImNvdW50cnkiOiJjYWFzOmNvdW50cnkvdXMiLCJjb250ZW50VHlwZVRhZ3MiOlsiY2Fhczpjb250ZW50LXR5cGUvZWJvb2siLCJjYWFzOmNvbnRlbnQtdHlwZS9ndWlkZSIsImNhYXM6Y29udGVudC10eXBlL3JlcG9ydCIsImNhYXM6Y29udGVudC10eXBlL3dlYmluYXIiLCJjYWFzOmNvbnRlbnQtdHlwZS93aGl0ZS1wYXBlciJdLCJkaXNhYmxlQmFubmVycyI6ZmFsc2UsImRyYWZ0RGIiOmZhbHNlLCJlbnZpcm9ubWVudCI6IiIsImVuZHBvaW50Ijoid3d3LmFkb2JlLmNvbS9jaGltZXJhLWFwaS9jb2xsZWN0aW9uIiwiZXhjbHVkZVRhZ3MiOlsiY2Fhczpjb250ZW50LXR5cGUvY3VzdG9tZXItc3RvcnkiXSwiZXhjbHVkZWRDYXJkcyI6W3siY29udGVudElkIjoiIn1dLCJmYWxsYmFja0VuZHBvaW50IjoiIiwiZmVhdHVyZWRDYXJkcyI6W10sImZpbHRlckV2ZW50IjoiIiwiZmlsdGVyTG9jYXRpb24iOiJ0b3AiLCJmaWx0ZXJMb2dpYyI6Im9yIiwiZmlsdGVycyI6W3siZmlsdGVyVGFnIjpbImNhYXM6cHJvZHVjdHMiXSwib3BlbmVkT25Mb2FkIjoiIiwiaWNvbiI6IiIsImV4Y2x1ZGVUYWdzIjpbXX0seyJmaWx0ZXJUYWciOlsiY2FhczppbmR1c3RyeSJdLCJvcGVuZWRPbkxvYWQiOiIiLCJpY29uIjoiIiwiZXhjbHVkZVRhZ3MiOltdfSx7ImZpbHRlclRhZyI6WyJjYWFzOnRvcGljIl0sIm9wZW5lZE9uTG9hZCI6IiIsImljb24iOiIiLCJleGNsdWRlVGFncyI6W119XSwiZmlsdGVyc1Nob3dFbXB0eSI6ZmFsc2UsImd1dHRlciI6IjR4IiwiaW5jbHVkZVRhZ3MiOltdLCJsYW5ndWFnZSI6ImNhYXM6bGFuZ3VhZ2UvZW4iLCJsYXlvdXRUeXBlIjoiM3VwIiwibG9hZE1vcmVCdG5TdHlsZSI6InByaW1hcnkiLCJvbmx5U2hvd0Jvb2ttYXJrZWRDYXJkcyI6ZmFsc2UsIm9yTG9naWNUYWdzIjpbXSwicGFnaW5hdGlvbkFuaW1hdGlvblN0eWxlIjoicGFnZWQiLCJwYWdpbmF0aW9uRW5hYmxlZCI6ZmFsc2UsInBhZ2luYXRpb25RdWFudGl0eVNob3duIjpmYWxzZSwicGFnaW5hdGlvblVzZVRoZW1lMyI6ZmFsc2UsInBhZ2luYXRpb25UeXBlIjoicGFnaW5hdG9yIiwicGxhY2Vob2xkZXJVcmwiOiIiLCJyZXN1bHRzUGVyUGFnZSI6IjMiLCJzZWFyY2hGaWVsZHMiOlsiY29udGVudEFyZWEuZGVzY3JpcHRpb24iXSwic2V0Q2FyZEJvcmRlcnMiOnRydWUsInNob3dCb29rbWFya3NGaWx0ZXIiOmZhbHNlLCJzaG93Qm9va21hcmtzT25DYXJkcyI6ZmFsc2UsInNob3dGaWx0ZXJzIjpmYWxzZSwic2hvd1NlYXJjaCI6ZmFsc2UsInNob3dUb3RhbFJlc3VsdHMiOmZhbHNlLCJzb3J0RGVmYXVsdCI6InJhbmRvbSIsInNvcnRFbmFibGVQb3B1cCI6ZmFsc2UsInNvcnRFbmFibGVSYW5kb21TYW1wbGluZyI6ZmFsc2UsInNvcnRSZXNlcnZvaXJTYW1wbGUiOjMsInNvcnRSZXNlcnZvaXJQb29sIjoxMDAwLCJzb3VyY2UiOlsibm9ydGhzdGFyIl0sInRhZ3NVcmwiOiJ3d3cuYWRvYmUuY29tL2NoaW1lcmEtYXBpL3RhZ3MiLCJ0YXJnZXRBY3Rpdml0eSI6ImR4bmV4dF91YiIsInRhcmdldEVuYWJsZWQiOnRydWUsInRoZW1lIjoibGlnaHRlc3QiLCJ0b3RhbENhcmRzVG9TaG93IjoiMyIsInVzZUxpZ2h0VGV4dCI6ZmFsc2UsInVzZU92ZXJsYXlMaW5rcyI6ZmFsc2UsInVzZXJJbmZvIjpbXSwic2hvd0lkcyI6dHJ1ZSwiY29sbGVjdGlvblNpemUiOiIiLCJjb2xsZWN0aW9uTmFtZSI6IiIsImRvTm90TGF6eUxvYWQiOmZhbHNlfQ==';
    caasLink.textContent = 'Content as a Service - Friday, November 4, 2022 at 09:34';
  }
  return caasLink;
}

export const cleanupHeadings = (main) => {
  const headings = main.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach((h) => {
    h.innerHTML = h.textContent.trim();
  });
}

export const cleanupParagraphs = (main) => {
  const ps = main.querySelectorAll('p');
  ps.forEach((p) => {
    // invalid HTML but is fixed by parser and fixes the \ problem on manually handled lists 
    p.innerHTML = p.innerHTML.replace(/\-\&nbsp;/gm,'<li>');
  });
}

export const isRelative = url => !url.startsWith('http');

export async function setGlobals(originalURL) {
  window.local = '';
  const importURL = new URL(originalURL);
  let { pathname } = importURL;
  const localFromURL = pathname.split('/')[1];
  if (localFromURL.startsWith('resource') || localFromURL.startsWith('products') || localFromURL.startsWith('solutions')) {
    pathname = `/us/en${pathname.replace('.html', '')}`;
  } else {
    pathname = pathname.replace(localFromURL, localMap[localFromURL]);
    pathname = pathname.replace('.html', '');
    window.local = localMap[localFromURL];
  }
  const fetchUrl = `https://www-author.corp.adobe.com/content/dx${pathname}/jcr:content.infinity.json`;
  window.fetchUrl = fetchUrl;
  try {
    window.jcrContent = await getJSON(fetchUrl);
  } catch (e) {
    console.warn(`Could not fetch ${fetchUrl}`, e);
    window.jcrContent = {};
  }
}

export function getElementByXpath(doc, path) {
  return doc.evaluate(path, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

export function rgbToHex(rgbString) {
  let c = rgbString;
  if (c.startsWith('rgb')) {
    var arr=[]; c.replace(/[\d+\.]+/g, function(v) { arr.push(parseFloat(v)); });
    c = "#" + arr.slice(0, 3).map(toHex).join("");
  }

  return c;
}

function toHex(int) {
  var hex = int.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

export function getXPathByElement(elm, addClass = false) {
  // var allNodes = document.getElementsByTagName('*');
  for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) {
    /*if (elm.hasAttribute('id')) {
        var uniqueIdCount = 0;
        for (var n=0;n < allNodes.length;n++) {
            if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++;
            if (uniqueIdCount > 1) break;
        };
        if ( uniqueIdCount == 1) {
            segs.unshift('id("' + elm.getAttribute('id') + '")');
            return segs.join('/');
        } else {
            segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]');
        }
    } else if (elm.hasAttribute('class')) {
        segs.unshift(elm.localName.toLowerCase() + '[@class="' + [...elm.classList].join(" ").trim() + '"]');
    } else {*/
    if (addClass && elm.hasAttribute('class')) {
      segs.unshift(elm.localName.toLowerCase() + '[@class="' + [...elm.classList].join(" ").trim() + '"]');
    } else {

        for (var i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) {
            if (sib.localName == elm.localName) { i++; }
        }
        segs.unshift(elm.localName.toLowerCase() + '[' + i + ']');
    }
  }
  return segs.length ? '/' + segs.join('/') : null;
};

// borrowed from https://codepen.io/andreaswik/pen/YjJqpK
export function isLightColor(color) {
  let r, g, b;

  // Check the format of the color, HEX or RGB?
  if (color.match(/^rgb/)) {

    // If HEX --> store the red, green, blue values in separate variables
    color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);

    r = color[1];
    g = color[2];
    b = color[3];
  } 
  else {

    // If RGB --> Convert it to HEX: http://gist.github.com/983661
    color = +("0x" + color.slice(1).replace( 
      color.length < 5 && /./g, '$&$&'
    )
             );

    r = color >> 16;
    g = color >> 8 & 255;
    b = color & 255;
  }

  // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
  const hsp = Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
  );

  return hsp > 127.5;
}

// Not working with jsDOM
// // export a function that checks the css display property is not none on an element and all its parents
// export function isVisible(el, document) {
//   while (el.parentElement) {
//     // console.log(document.defaultView.getComputedStyle(el.parentElement).getPropertyValue('display'));
//     console.log(el.parentElement.style.display);
//     if (/.*none.*/i.test(document.defaultView.getComputedStyle(el.parentElement).getPropertyValue('display'))) {
//       return false;
//     }
//     el = el.parentElement;
//   }
//   return true;
// }
