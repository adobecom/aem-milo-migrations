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
import { getXPathByElement, rgbToHex } from '../utils.js';

export const utf8ToB64 = (str) => window.btoa(unescape(encodeURIComponent(str)));
export const b64ToUtf8 = (str) => decodeURIComponent(escape(window.atob(str)));

export function getNSiblingsElements(el, n) {
  let cmpFn = n;

  if (!isNaN(n)) {
    cmpFn = (c) => c === n;
  }

  let selectedXpathPattern = '';
  const xpathGrouping = [];

  el.querySelectorAll('div').forEach(d => {
    const xpath = getXPathByElement(d);
    const xp = xpath.substring(0, xpath.lastIndexOf('['));
    if (!xpathGrouping[xp]) {
      xpathGrouping[xp] = [d];
    } else {
      xpathGrouping[xp].push(d);
    }
  });

  // find the xpath pattern that has n elements
  for (let key in xpathGrouping) {
    if (cmpFn(xpathGrouping[key].length)) {
      selectedXpathPattern = key;
      break;
    }
  }

  return xpathGrouping[selectedXpathPattern];
}

export function getBGColor(el, document) {
  let bgcolor = el.querySelector('div[data-bgcolor]')?.getAttribute('data-bgcolor');

  // strategy 2
  if (!bgcolor) {
    el.querySelectorAll('div').forEach(d => {
      const bg = document.defaultView.getComputedStyle(d).getPropertyValue('background-color');
      if (bg != '') {
        bgcolor = rgbToHex(bg);
      }
    });
  }

  // strategy 3
  if (!bgcolor) {
    const bgImage = el.querySelector('[data-hlx-background-image]')?.dataset?.hlxBackgroundImage;
    if (bgImage && bgImage.trim().startsWith('linear-gradient')) {
      let m;
      if ((m = /(rgb\(\d+,\s*\d+,\s*\d+\))/.exec(bgImage)) !== null) {
        console.log('linear-gradient', m);
        bgcolor = rgbToHex(m[1]);
      }
    }
  }

  // strategy 4: access parent's style property
  // WARNING: this might end up looping into parent's search and pick up the wrong background
  // WARNING: debug this function if you find unexpected results in background color's detection
  if (!bgcolor) {
    const parentEl = el.parentElement;
    const parentBGColor = getBGColor(parentEl, document);
    if (parentBGColor) {
      bgcolor = parentBGColor;
    }
  }


  return bgcolor;
}

export function crawlColorFromCSS(el, document) {
  let bgcolor = el.querySelector('div[data-color]')?.getAttribute('data-color');

  // strategy 2
  if (!bgcolor) {
    const color = el.querySelector('[data-hlx-imp-color]')?.dataset?.hlxImpColor;
    console.log('color', '>>>', color, '<<<');
    if (color) {
      bgcolor = rgbToHex(color);
    }
  }  

  // strategy 3
  if (!bgcolor) {
    el.querySelectorAll('div').forEach(d => {
      const bg = document.defaultView.getComputedStyle(d).getPropertyValue('color');
      if (bg) {
        bgcolor = rgbToHex(bg.trim());
      }
    });
  }

  // console.log('bgcolor', bgcolor);
  return bgcolor;
}

export function findImageFromCSS(el, document) {
  let url = null;
  [...el.querySelectorAll('div')].some(d => {
    const bg = document.defaultView.getComputedStyle(d).getPropertyValue('background-image');
    if (bg != '') {
      console.log('getImageFromCSS', bg);
      url = bg;
      return true;
    }
  });

  let img = null;
  if (url && url.toLowerCase() !== 'none') {
    const src = url.replace(/url\(/gm, '').replace(/'/gm, '').replace(/\)/gm, '');
    img = document.createElement('img');
    img.src = src;
  }

  return img;
}

export function flattenDomStructure(el) {
  const container = document.createElement('div');

  // Get all container div elements
  const containers = el.querySelectorAll('div');

  // Loop through each container div
  containers.forEach(container => {
    // Get the container's parent element
    const parent = container.parentNode;

    // Move all child nodes of the container into the parent
    while (container.firstChild) {
      parent.insertBefore(container.firstChild, container);
    }

    // Remove the container from the DOM
    parent.removeChild(container);
  });

  el.getAttributeNames().filter(name => name.startsWith('data-')).forEach(attribute => {
    el.removeAttribute(attribute);
  });

}

// >>> CSS Display not properly supported by JSDOM <<<
// // determine if the element is visible (via CSS)
// export function isVisible(el, document) {
//   console.log(el);
//   const d = document.defaultView.getComputedStyle(el).getPropertyValue('display');
//   const r = d.match(/.*none.*/i) === null;
//   console.log(d, r);
//   return r;
// }