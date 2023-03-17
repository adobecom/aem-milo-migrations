import { getJSONValues, getMetadataValue } from '../utils.js';

const createImage = (document, url)  => {
  const img = document.createElement('img');
  img.src = url;
  return img;
};

export function parseMetadata(document) {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.innerHTML.replace(/[\n\t]/gm, '');
  }
  meta.robots = getMetadataValue(document, 'robots');
  meta.Description = getMetadataValue(document, 'og:description');
  meta.keywords = getMetadataValue(document, 'keywords');
  meta['serp-content-type'] = getMetadataValue(document, 'serp-content-type');
  meta.pageCreatedAt = getMetadataValue(document, 'pageCreatedAt');
  meta.translated = getMetadataValue(document, 'translated');
  meta.publishDate = getMetadataValue(document, 'publishDate');
  meta.productJcrID = getMetadataValue(document, 'productJcrID');
  meta.primaryProductName = getMetadataValue(document, 'primaryProductName');
  const imageMeta = getMetadataValue(document, 'og:image');
  meta.image = imageMeta === '' ? '' : createImage(document, `https://business.adobe.com${imageMeta}`);
  const cqTags = getJSONValues(window.jcrContent, 'cq:tags');
  meta.tags = cqTags.length ? cqTags.join(', ') : '';
  meta['caas:content-type'] = getMetadataValue(document, 'caas:content-type');

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  return block;
}

export function parseCardMetadata(document) {
  const cqTags = getJSONValues(window.jcrContent, 'cq:tags');

  const cells = [
    ['Card Metadata'],
    ['cardTitle', getMetadataValue(document, 'cardTitle')],
    ['cardImagePath', getMetadataValue(document, 'cardImagePath') === '' ? '' : createImage(document,`https://business.adobe.com${getMetadataValue(document, 'cardImagePath')}`)],
    ['CardDescription', getMetadataValue(document, 'cardDescription')],
    ['primaryTag', `caas:content-type/${getMetadataValue(document, 'caas:content-type')}`],
    ['Tags', cqTags.length ? cqTags.join(', ') : ''],
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  return table;
}
