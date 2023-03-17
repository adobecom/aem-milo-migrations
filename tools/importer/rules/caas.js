
import { getRecommendedArticles } from '../utils.js';

export async function parseRecommendedArticlesCAAS(el, document, section) {
  return await parseCAASContent('Recommended for you', el, document, section);
}

export async function parseRelatedFeaturesCAAS(el, document, section) {
  return await parseCAASContent('See related features', el, document, section);
}

async function parseCAASContent(defaultTitle, el, document, section) {
  const defaultCaaSTitle = document.createElement('h3');
  defaultCaaSTitle.textContent = defaultTitle;

  const titleEl = el.querySelector('.title, .text');
  if (titleEl) {
    defaultCaaSTitle.textContent = titleEl.textContent;
  }

  const container = document.createElement('div');

  container.append(document.createElement('hr'));
  container.append(defaultCaaSTitle);

  const screenshotText = document.createElement('h3');
  screenshotText.textContent = 'Below is a screenshot of the CAAS content. >>> TODO It should be replaced by a CAAS link <<<'.toUpperCase();
  container.append(screenshotText);
  const img = document.createElement('img');
  img.src = section.block.screenshot;
  container.append(img);

  container.append(WebImporter.DOMUtils.createTable([
    ['Section Metadata'],
    ['style', 'container, m spacing, center'],
  ], document));
  container.append(document.createElement('hr'));

  return container;
}
