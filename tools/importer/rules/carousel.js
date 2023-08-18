// import { flattenDomStructure, getNSiblingsElements } from "./utils.js";
import { extractBackground } from './bacom.js';
import { parseNUpLayoutsSectionMetadata } from './section-metadata.js';

export function parseCarousel(el, document, section, itemType = 'text') {
  const carouselId = 'carousel-' + crypto.randomUUID();
  const elClone = el.cloneNode(true);

  // main container
  const container = document.createElement('div');
  
  // init carousel container
  container.append(WebImporter.DOMUtils.createTable([
    ['carousel (container)'],
    [carouselId],
  ], document));

  // carousel container section metadata
  const smCells = [
    ['section metadata'],
    ['style', 'xxl spacing'],
  ];
  const smBG = extractBackground(elClone, document);
  if (smBG !== '') {
    smCells.push([smBG]);
  }
  container.append(WebImporter.DOMUtils.createTable(smCells, document));
  container.append(document.createElement('hr'));

  // extract .dexter-Carousel item from el dom element
  const carouselEl = document.createElement('div');
  carouselEl.append(elClone.querySelector('.dexter-Carousel'));

  const titleEl = document.createElement('h2');
  const textEl = document.createElement('I');
  textEl.textContent = elClone.textContent;
  titleEl.append(textEl);

  container.prepend(WebImporter.DOMUtils.createTable([
    ['text (center)'],
    [titleEl],
  ], document));

  container.prepend(document.createElement('hr'));

  // prepare carousel items
  // const items = carouselEl.querySelectorAll('.dexter-Carousel-item').map(item => {
  //   return container.append(WebImporter.DOMUtils.createTable([
  //     ['text (large, xl spacing)'],
  //     [item.outerHTML],
  //   ], document));
  // });

  carouselEl.querySelectorAll('.dexter-Carousel-item').forEach(item => {
    if (itemType === 'text') {
      container.append(WebImporter.DOMUtils.createTable([
        ['text (large, xl spacing)'],
        [item.outerHTML],
      ], document));
      container.append(WebImporter.DOMUtils.createTable([
        ['section metadata'],
        ['carousel', carouselId],
      ], document));
      container.append(document.createElement('hr'));
    } else if (itemType === 'two-up') {
      container.append(parseNUpLayoutsSectionMetadata(item, document, null, {
        elNum: 2,
        elementType: 'text',
        smOptions: { carousel: carouselId },
      }));
    }
  });

  return container;
}
