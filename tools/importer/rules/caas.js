import { getRecommendedArticles } from '../utils.js';

export async function parseCAASContent(el, document, section) {

  const recommendedArticles = document.createElement('p');
  recommendedArticles.append(await getRecommendedArticles(document, document));

  const title = document.createElement('h2')
  title.append("Recommended for you")

  const container = document.createElement('div')
  container.append(title);
  container.append(recommendedArticles);

  return container;
}
