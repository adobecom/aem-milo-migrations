import { getBGColor, getNSiblingsElements } from './utils.js';


const createImage = (document, url)  => {
  const img = document.createElement('img');
  img.src = url;
  return img;
};

export async function parseMarquee(el, document, section, backgroundColor = '') {
  let marqueeDoc = el
  let els = getNSiblingsElements(el, (c) => c == 2)
  
  // handle empty / hidden divs
  let emptyNodeIndx = -1
  for (var i = 0; i < els.length; i++) {
    if (!els[i].hasChildNodes()) {
      emptyNodeIndx = i
      break
    }
  }
  if (emptyNodeIndx >= 0) {
    const targetInd = emptyNodeIndx == 0 ? emptyNodeIndx + 1 : emptyNodeIndx - 1
    els = getNSiblingsElements(els[targetInd], (c) => c >= 2)
  }

  const container = document.createElement('div')

  /*
  * texts
  */
  for (var i = 0; i < els.length; i++) {
    const tmpel = els[i];
    const img = tmpel.querySelector('img')
    const video = tmpel.querySelector('video.video-desktop')
    if (!img && !video) {
      container.append(tmpel)
    }
  }

  // sanitize links inside ul/li
  container.querySelectorAll('ol li a, ul li a').forEach((a) => {
    const t = a.textContent;
    a.querySelectorAll('*').forEach((n) => n.remove());
    a.textContent = t;
  });

  /*
  * background
  */

  let background =  WebImporter.DOMUtils.getImgFromBackground(marqueeDoc, document)
  console.log('background', background);

  // strategy 2
  if (!background) {

    marqueeDoc.querySelectorAll('div').forEach(d => {
      const bg = document.defaultView.getComputedStyle(d).getPropertyValue('background-image');
      if (bg !== '') {
        background = WebImporter.DOMUtils.getImgFromBackground(d, document);
      }
      // console.log('bg', bg);
    });

    // const innerDivs = [...marqueeDoc.querySelectorAll('div')];
    // const found = innerDivs.find(d => document.defaultView.getComputedStyle(d).getPropertyValue('background-image') !== '');
    // console.log('found');
    // console.log(found);
    // console.log('found', document.defaultView.getComputedStyle(found).getPropertyValue('background-image'));
  }

  // strategy 3: get background color
  
  if (!background) {
    const bgColor = getBGColor(el, document);
    if (bgColor) {
      background = bgColor
    }
  }

  if (!background) {
    background = backgroundColor;
  }

  /*
  * image + resource
  */

  let resource = null;

  const image = marqueeDoc.querySelector('.image');

  if (image) {
    let img = image.querySelector('img');
    if (img) {
      resource = createImage(document, img.src);
    }
    
    const link = image.querySelector('a');
    if (link) {
      if (link.href.indexOf('#watch-now') > -1) {
        const watchNowEl = document.querySelector('#watch-now');
        if (watchNowEl) {
          const videoIframe = watchNowEl.querySelector('iframe');
          if (videoIframe) {
            resource = videoIframe.src || videoIframe.dataset.videoSrc;
          }
        }
      }
    }
  }

  const video = marqueeDoc.querySelector('video.video-desktop');
  if (video) {
    const source = video.querySelector('source');
    // const l = document.createElement('a');
    // l.textContent = source.src;
    // l.href = source.src;
    resource = source.src;
    console.log("Resource: " + JSON.stringify(resource))
  }

  /*
  * create table
  */

  const cells = [
    ['marquee (medium, light)'],
    [background],
    [container, (resource || '')],
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  // document.querySelector('h1')?.remove();
  // marqueeDoc.remove();
  return table;
}