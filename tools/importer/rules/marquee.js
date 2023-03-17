
const createImage = (document, url)  => {
  const img = document.createElement('img');
  img.src = url;
  return img;
};

export async function parseMarquee(el, document, section, backgroundColor = '#000000') {
  let marqueeDoc = el;

  /*
  * texts
  */

  const textElements = [];

  const title = marqueeDoc.querySelector('.title');
  if (title) {
    textElements.push(title.innerHTML);
  }

  const text = marqueeDoc.querySelector('.text');
  if (text) {
    textElements.push(text.innerHTML);
  }

  const cta = marqueeDoc.querySelector('.cta');
  if (cta) {
    const link = cta.querySelector('a');
    if (link.href.indexOf('#watch-now') < 0) {
      const str = document.createElement('B');
      str.append(cta);
      textElements.push(str.outerHTML); 
    }
  }

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
  }

  /*
  * create table
  */

  const cells = [
    ['marquee (medium, light)'],
    [background],
    [textElements.join(''), (resource || '')],
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  // document.querySelector('h1')?.remove();
  // marqueeDoc.remove();
  return table;
}