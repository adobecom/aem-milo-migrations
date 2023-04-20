import { isLightColor } from '../utils.js';
import { extractBackground } from './bacom.js';
import { getBGColor, crawlColorFromCSS, getNSiblingsElements } from './utils.js';


const createImage = (document, url)  => {
  const img = document.createElement('img');
  img.src = url;
  return img;
};

export async function parseMarquee(el, document, section, backgroundColor = '') {

  let marqueeDoc = el
  let els = getNSiblingsElements(el, (c) => c >= 2)
  let videoElem = marqueeDoc

  let background

  const container = document.createElement('div')
  if (els && els.length >= 2) {
    // handle empty / hidden divs
    let emptyNodeIndx = -1
    // for (var i = 0; i < els.length; i++) {
    //   if (!els[i].hasChildNodes() && els.length <= 2) {
    //     emptyNodeIndx = i
    //     break
    //   }
    // }
    if (emptyNodeIndx >= 0) {
      const targetInd = emptyNodeIndx == 0 ? emptyNodeIndx + 1 : emptyNodeIndx - 1
      els = getNSiblingsElements(els[targetInd], (c) => c >= 2)
    }

    /*
    * texts
    */
    for (var i = 0; i < els.length; i++) {
      const tmpel = els[i];
      const img = tmpel.querySelector('img')
      const video = tmpel.querySelector('video.video-desktop') || tmpel.querySelector('iframe')
      background = background || extractBackground(tmpel, document)
      if (!img && !video) {
        let cta = tmpel.querySelector('.dexter-Cta a');
        if(cta && cta.href.includes("register-form")) {
          cta.remove()
        }
        container.append(tmpel)
      }
      if (video){
        videoElem = tmpel
      }
    }

    // sanitize links inside ul/li
    container.querySelectorAll('ol li a, ul li a').forEach((a) => {
      const t = a.textContent;
      a.querySelectorAll('*').forEach((n) => n.remove());
      a.textContent = t;
    });
  } else {
    // strategy 2
    const title = marqueeDoc.querySelector('.title');
    if (title) {
      container.append(title)
    }
  
    const text = marqueeDoc.querySelector('.text');
    if (text) {
      container.append(text)
    }
  
    const cta = marqueeDoc.querySelector('.cta');
    if (cta && !cta.href.includes("register-form")) {
      const link = cta.querySelector('a');
      if (link && link.href.indexOf('#watch-now') < 0) {
        const str = document.createElement('B');
        str.append(cta);
        container.append(str)
      }
    }
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

  let video = marqueeDoc.querySelector('video.video-desktop');
  if (video) {
    const source = video.querySelector('source');
    resource = document.createElement('a');
    resource.href = source.src
    resource.innerHTML = source.src
  }

  // iframe handling
  video = videoElem.querySelector('iframe');
  if (!resource && video) {
    resource = document.createElement('a');
    resource.href = video.src || video.videoSrc
    resource.innerHTML = video.src || video.videoSrc
  }

  
  /*
   * theme
   */

  let theme = 'light'; // default, dark color + light background
  const fontColor = crawlColorFromCSS(el, document);
  if (fontColor) {
    if (isLightColor(fontColor)) {
      theme = 'dark'; // default, light color + dark background
    }
  }

  /*
   * Handle modal videos 
   */

  const videoLinks = container.querySelectorAll('.cta a')
  videoLinks.forEach(videoLink => {
    if (videoLink && videoLink.href) {
      let href = videoLink.href
      href = href.split(videoLink.baseURI)
      href = href[href.length - 1]
      if(href.startsWith("#")){
        const modal = document.querySelector(href)
        const iframe = modal?.querySelector('iframe')
        // check if element is in a modal
        if (modal?.closest(".modal") && iframe && iframe.getAttribute('data-video-src')) {
          if(!resource) {
            console.log(iframe.getAttribute('data-video-src'))
            resource = document.createElement('a');
            resource.href = iframe.getAttribute('data-video-src')
            resource.innerHTML = iframe.getAttribute('data-video-src')
          }
          videoLink.remove()
        }
      }
    }
  })


  /*
   * create table
   */

  const cells = [
    [`marquee (medium, ${theme})`],
    [background || extractBackground(marqueeDoc, document)],
    [container, (resource || '')],
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  // document.querySelector('h1')?.remove();
  // marqueeDoc.remove();
  return table;
}
