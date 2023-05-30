
import { findPaths } from '../utils.js';

export function parseBreadcrumb(document) {
  // default breadcrumb
  const defaultLink = window.local?.split('/')[0] || '';
  let bcType = 'default';
  let bcContent = WebImporter.DOMUtils.createTable([['breadcrumbs'],[`<ul><li><a href="/${defaultLink}">Home</a></li><li>Adobe Resource Center</li></ul>`]], document);

  // try building breadcrumb from DOM
  const domBreadcrumb = document.querySelector('.feds-breadcrumbs');
  if (domBreadcrumb) {
    const items = [];
    const domBreadcrumbItems = domBreadcrumb.querySelectorAll('li');
    if (domBreadcrumbItems.length > 0) {
      domBreadcrumbItems.forEach((item) => {
        const link = item.querySelector('a');
        if (link) {
          // make link relative if needed
          if (link.href.indexOf('http') === 0) {
            let { pathname } = new URL(link.href);
            pathname = pathname.replace('.html', '');
            link.href = pathname;
          }
        }
        items.push(item.outerHTML);
      });
  
      bcType = 'dom';
      bcContent = WebImporter.DOMUtils.createTable([['breadcrumbs'],[`<ul>${items.join('')}</ul>`]], document);
    }
  }
  
  // try building breadcrumb from jcrContent
  const breadcrumbsPath = findPaths(window.jcrContent, 'breadcrumbs');
  if (breadcrumbsPath?.length > 0) {
    let breadcrumbs = window.jcrContent;
    breadcrumbsPath[0][0]?.split('/').forEach((pathItem) => {
      breadcrumbs = breadcrumbs[pathItem];
    });
    breadcrumbs = breadcrumbs.links;
    breadcrumbs = Object.values(breadcrumbs);
    const breadcrumbsLastItem = breadcrumbs.pop();
    const breadcrumbsItems = document.createElement('ul');
    const firstItem = document.createElement('li');
    const firstItemLink = document.createElement('a');
    firstItemLink.href = '/';
    firstItemLink.innerHTML = 'Home';
    firstItem.append(firstItemLink);
    breadcrumbsItems.append(firstItem);
    breadcrumbs.forEach((item) => {
      if (item.title) {
        let breadcrumbsItem = document.createElement('li');
        if (item.url) {
          const breadcrumbLink = document.createElement('a');
          const url = item.url.split('resources')[1];
          breadcrumbLink.href = `${window.local ? window.local + '/' : '/'}resources${url}`;
          breadcrumbLink.innerHTML = item.title;
          breadcrumbsItem.append(breadcrumbLink);
        } else {
          breadcrumbsItem.innerHTML = item.title;
        }
        breadcrumbsItems.append(breadcrumbsItem);
      }
    });
    const lastItem = document.createElement('li');
    lastItem.innerHTML = breadcrumbsLastItem.title;
    breadcrumbsItems.append(lastItem);
    const cells = [
      ['breadcrumbs'],
      [breadcrumbsItems],
    ];

    bcType = 'jcrContent';
    bcContent = WebImporter.DOMUtils.createTable(cells, document);
  }

  return [ bcType, bcContent ];
};
