import { handleFaasForm } from '../rules/handleFaasForm.js';
import { getNSiblingsElements, getBGColor } from './utils.js';
import { getXPathByElement } from '../utils.js';

export async function parseEventSpeakerAndProductWithoutFaas(el, document, section) {
  el.querySelectorAll('.horizontalRule').forEach(item => item.remove())

  // 2 divs: speaker + product
  let els = getNSiblingsElements(el, (n) => n === 2)
  if (!els || els.length == 0) {
    return ''
  }

  // handle speaker
  let container = handleSpeaker(els[0], document)
  if (container == '') {
    container = document.createElement('div')
    container.append(document.createElement('hr'))

    const texts = document.createElement('div')
    els[0].querySelectorAll('.cmp-text, .cmp-title').forEach(item => texts.append(item))
    container.append(
      WebImporter.DOMUtils.createTable([
        ['Text'],
        [texts]
      ], document)
    )
  }
  
  // handle products
  const product = parseRelatedProductsVertical(els[1], document)
  if(product) {
    container.append(product)
    container.append(
        WebImporter.DOMUtils.createTable([
            ['Section Metadata'],
            ['style', 'Two-up'],
        ], document)
    )
    container.append(document.createElement('hr'))
  }
  
  return container
}

export async function parseEventSpeakerAndProduct(el, document, section) {
  return parseEventSpeaker(el, document, section, true)
}

export async function parseEventSpeakerAndFaas(el, document, section) {
  return parseEventSpeaker(el, document, section, false)
}

export async function parseWebinarTime(el, document, section, backgroundColor = '#2FBBEC') {

  let text = el.querySelector(".cmp-text")
  if (!text) {
      return ''
  }
  const bgColor = getBGColor(el, document, false);
  if (bgColor) {
    backgroundColor = bgColor
  }

  const container = document.createElement('div')

  container.append(document.createElement('hr'))
  container.append(WebImporter.DOMUtils.createTable([
      ['Text (light, sm-spacing)'],
      [text]
  ], document))
  container.append(WebImporter.DOMUtils.createTable([
      ['Section Metadata'],
      ['background', backgroundColor],
      ['style', 'dark'],
  ], document))
  container.append(document.createElement('hr'))

  return container
}


function parseEventSpeaker(el, document, section, handleProduct) {
  el.querySelectorAll('.horizontalRule').forEach(item => item.remove())

  // 2 divs: speaker + product
  let els = getNSiblingsElements(el, (n) => n === 2)
  if (!els || els.length == 0) {
    return ''
  }

  // handle speaker
  let container = handleSpeaker(els[0], document)
  if (container == '') {
    container = document.createElement('div')
    container.append(document.createElement('hr'))

    const texts = document.createElement('div')
    els[0].querySelectorAll('.cmp-text, .cmp-title').forEach(item => texts.append(item))
    container.append(
      WebImporter.DOMUtils.createTable([
        ['Text (l-spacing)'],
        [texts]
      ], document)
    )
  }
  
  // remove webinar link
  container.querySelectorAll('a').forEach(item => {
    if(item.href.indexOf("resources/webinars.html") > 0) {
      item.remove()
    }
  })
  
  // handle form
  let titleElement = document.querySelector('.faasform')?.closest('.aem-Grid')?.querySelector('.cmp-text');
  titleElement = titleElement || document.querySelector('.faasform')?.closest('.aem-Grid')?.querySelector('.cmp-title')
  const formLink = handleFaasForm(document, document, titleElement);
  if (formLink) {
      const form = document.createElement('p');
      form.append(formLink);
      container.append(
        WebImporter.DOMUtils.createTable([
          ['Text'],
          [form],
        ], document)
      )

      container.append(
          WebImporter.DOMUtils.createTable([
              ['Section Metadata'],
              ['style', 'Two-up, resource-form'],
          ], document)
      )
      container.append(document.createElement('hr'))
  } else if(els[1].querySelector('.video') && els[1].querySelector('iframe')) {
    // handle video
    let video = els[1].querySelector('iframe');
    const resourceLink = document.createElement('a');
    resourceLink.href = video.src || video.videoSrc
    resourceLink.innerHTML = video.src || video.videoSrc
    container.append(resourceLink)

    container.append(
      WebImporter.DOMUtils.createTable([
          ['Section Metadata'],
          ['style', 'Two-up'],
      ], document)
  )
  container.append(document.createElement('hr'))
  }
  
  // handle products
  if (handleProduct && !(els[1].querySelector('.video') && els[1].querySelector('iframe'))) {
    container.append(parseRelatedProducts(els[1], document))
  }

  return container
}

const handleSpeaker = (el, document) => {
    const els = getNSiblingsElements(el, (n) => n >= 2)
    if (!els || els.length == 0) {
      return ''
    }
    // title + event description
    const texts = document.createElement('div')
    els.filter(item => !item.classList.contains('dexter-Spacer') && !item.querySelector('img'))
      .map(item => {
        const arr = []
        const tmptext = item.querySelectorAll('.cmp-text, .cmp-title')
        if (tmptext) {
          arr.push(...tmptext)
        }
        return arr
      })
      .filter(item => item)
      .flat()
      .forEach(item => {
        texts.append(item)
        texts.append(document.createElement('br'))
      })
    
      // speakers
    const speakers = els
      .filter(item => !item.classList.contains('dexter-Spacer') && item.querySelector('img') && item.querySelector('p'))
      .map(item => {
        let images = item.querySelectorAll('img')
        if(!images) {
          return null
        }
        const tmpSpeakers = []
        images.forEach((image) => {
          if (!image.src) {
            return
          }
          const speaker = [];
          console.log(image.classList)
          console.log(getXPathByElement(image))
          speaker.push(image);
          let nextEl = image.closest('.image')?.nextElementSibling
          while(nextEl) {
            // edge case, where multiple speaker img + texts are all in the same div
            if (speaker.length > 3 || nextEl.querySelector('img')) {
              break
            }
            const texts = nextEl.querySelectorAll('.cmp-text')
            if(texts && texts.length >= 2){
              speaker.push(`<p><strong>${texts[0].innerHTML}</strong></p><p>${texts[1]?.innerHTML}</p>`);
            } else if(texts && texts.length === 1) {
              speaker.push(texts[0].innerHTML)
            }
            nextEl = nextEl.nextElementSibling
          }
          if(speaker.length <= 2){
            speaker.push('')
          }
          tmpSpeakers.push(speaker)
        })
        return tmpSpeakers
      })
      .filter(item => item)
      .flat()
  
    const container = document.createElement('div')
    container.append(
        WebImporter.DOMUtils.createTable([
            ['Text (l-spacing)'],
            [texts]
        ], document)
    )
    if (!speakers || speakers.length === 0) {
      return container
    }
    container.append(document.createElement('hr'))
    container.append(
        WebImporter.DOMUtils.createTable([
            ['Event Speakers'],
            ...speakers,
        ], document)
    )
    return container
};

const parseRelatedProducts = (el, document) => {
  const title = el.querySelector('.cmp-title')
  const text = el.querySelector('.cmp-text')
  if (!title || !text) {
      return ''
  }
  const container = document.createElement('div')
  container.append(title)
  container.append(document.createElement('br'))
  container.append(text)

  return WebImporter.DOMUtils.createTable([
      ['Text (full-width)'],
      [container],
  ], document);
};

const parseRelatedProductsVertical = (el, document) => {
  const title = el.querySelector('.cmp-title')
  const text = el.querySelector('.cmp-text')
  if (!title || !text) {
      return ''
  }
  const container = document.createElement('div')
  container.append(title)
  container.append(document.createElement('br'))
  container.append(text)

  return WebImporter.DOMUtils.createTable([
    ['Text (vertical)'],
    ['#f5f5f5'],
    [container],
  ], document);
};
