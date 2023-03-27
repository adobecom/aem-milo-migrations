import { getNSiblingsElements } from './utils.js';

const createImage = (document, url)  => {
  const img = document.createElement('img');
  img.src = url;
  return img;
};

export async function parseTableOfContents(el, document, section) {
  
  // structure of divs: marquee, seperator, toc
  const els = getNSiblingsElements(el, (n) => n >= 3);
  if (els.length < 3) {
    return ""
  }

  // marquee
  const marquee = els[0];

  const textElements = [];
  const text = marquee.querySelector('.cmp-text');
  if (text) {
    textElements.push(text.innerHTML);
  }

  const title = marquee.querySelector('.cmp-title');
  if (title) {
    textElements.push(title.innerHTML);
  }

  let resource = null;
  const image = marquee.querySelector('.image');
  if (image) {
    let img = image.querySelector('img');
    if (img) {
      resource = createImage(document, img.src);
    }
  }

  const cells = [
    ['marquee (medium, light)'],
    [''],
    [textElements.join(''), (resource || '')],
  ];
  const marqueeTable = WebImporter.DOMUtils.createTable(cells, document)
  
  // toc
  // structure of divs: title, seperator, contents
  const toc = getNSiblingsElements(els[2], (n) => n >= 3);
  if (toc.length < 3) {
    return ""
  }

  const tocCells = [
    ['table-of-contents']
  ]
  
  const tocTitle = toc[0].querySelector('.cmp-text').innerHTML;
  tocCells.push([tocTitle])

  const tocContents = getNSiblingsElements(toc[2], (n) => n >= 2);
  tocContents.forEach(item => {
    const itemContents = []
    item.querySelectorAll(".cmp-text").forEach(text => {
      itemContents.push(text.innerHTML)
    })
    tocCells.push([itemContents.join('\n')])
  });

  const tocTable = WebImporter.DOMUtils.createTable(tocCells, document);

  // construct output
  const container = document.createElement('div');
  const sectionTable = WebImporter.DOMUtils.createTable([
    ['Section Metadata'],
    ['style', 'toc'],
    ['background', '']
  ], document);

  container.append(document.createElement('hr'));
  container.append(sectionTable)
  container.append(marqueeTable)
  container.append(tocTable)
  container.append(document.createElement('hr'));

  return container;
}