
/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-disable no-console, class-methods-use-this */

/*


Template A https://main--bacom--adobecom.hlx.page/layouts/resources/template-a

*/


import { handleFaasForm, waitForFaasForm } from '../rules/handleFaasForm.js';
import { cleanupHeadings, setGlobals, findPaths, getMetadataValue, getRecommendedArticles } from '../utils.js';

const createMetadata = (main, document) => {
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
  meta.image = createImage(document, `https://business.adobe.com${getMetadataValue(document, 'og:image')}`);
  meta['caas:content-type'] = getMetadataValue(document, 'caas:content-type') ?? 'webinar';

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  return block;
};

const createImage = (document, url)  => {
  const img = document.createElement('img');
  img.src = url;
  return img;
};

const createCardMetadata = (main, document) => {  
  const cells = [
    ['Card Metadata'],
    ['cardTitle', getMetadataValue(document, 'cardTitle')],
    ['cardImagePath', createImage(document,`https://business.adobe.com${getMetadataValue(document, 'cardImagePath')}`)],
    ['CardDescription', getMetadataValue(document, 'cardDesc')],
    ['primaryTag', `caas:content-type/${getMetadataValue(document, 'caas:content-type')}`],
    ['tags', `${getMetadataValue(document, 'cq:tags')}`],
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  return table;
};

const createFragment = (main, document, fragmentUrl ) => {
	// add the experience fragment in

	const link = document.createElement("a");
	link.href = fragmentUrl;
	const cells = [
		['Fragment'],
		[link]
	];
	return WebImporter.DOMUtils.createTable(cells, document);
};

const createSectionMetadata = (main, document, properties ) => {

	const cells = [
		['Section Metadata'],
	];
	for (let k in properties) {
		cells.push([k,properties[k]]);
	}
	return WebImporter.DOMUtils.createTable(cells, document);
};

const createColumnOne = (main, document) => {
	const content = document.querySelectorAll('#root_content_flex_copy .flex')
	const d1 = document.createElement("div");
	d1.innerHTML = content[0].innerHTML;
	const d2 = document.createElement("div");
	d2.innerHTML = content[2].innerHTML;


	const cells = [
		['Text (Vertical)'],
		[ d1.outerHTML + d2.outerHTML ]
	];
	return WebImporter.DOMUtils.createTable(cells, document);
};
const createColumnTwo = (main, document) => {
	const content = document.querySelectorAll('#root_content_flex_copy .flex')
	const d1 = document.createElement("div");
	d1.innerHTML = content[1].innerHTML;

	const cells = [
		['Text (Vertical)'],
		[d1]
	];
	return WebImporter.DOMUtils.createTable(cells, document);

};


const createRelatedProducts = (main, document) => {
  const relatedProducts = document.querySelector('.title h2').closest('.position');
  relatedProducts.nextElementSibling?.remove();
  const cells = [
    ['Text (vertical)'],
    ['#f5f5f5'],
    [relatedProducts],
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  return table;
};

const appendBackward = (elements, main) => {
  for (let i=elements.length-1; i>=0; i--) {
    main.prepend(elements[i]);
  }
};

const createBreadcrumbs = (main, document) => {
  const breadcrumbsPath = findPaths(window.jcrContent, 'breadcrumbs');
  if (!breadcrumbsPath?.length) {
    return '';
  }
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
  const table = WebImporter.DOMUtils.createTable(cells, document);
  return table;
};


export default {
  onLoad: async ({ document }) => {
    await waitForFaasForm(document);
  },

  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @returns {HTMLElement} The root element
   */
  transformDOM: async ({ document, params}) => {
    await setGlobals(params.originalURL);
    console.log(window.fetchUrl);
    const titleElement = document.querySelector('.faasform')?.closest('.aem-Grid')?.querySelector('.cmp-text');
    const formLink = handleFaasForm(document, document, titleElement);
    WebImporter.DOMUtils.remove(document, [
      `header, footer, .faas-form-settings, .xf, style, northstar-card-collection, consonant-card-collection`,
      '.globalnavheader', 
	  ".xfreference",".experiencefragment",
      '.globalNavHeader',
    ]);
    const main = document.querySelector('main');

    cleanupHeadings(document.body);

    // Top area
    const elementsToGo = [];
    elementsToGo.push(createBreadcrumbs(main, document));

    appendBackward(elementsToGo, main);

    main.append(createColumnOne(main, document));
    main.append(createColumnTwo(main, document));

	document.querySelector('#root_content_flex_copy')?.remove();


    main.append(createSectionMetadata(main,document, {
		  style: "two-up, xl-spacing"
    }));
    main.append(document.createElement("hr"));

    const recommendedForYou = document.querySelector(".title h2.cmp-title__text");
    main.append(recommendedForYou);
    recommendedForYou.parentNode.remove();



	main.append(createFragment(main,document, "https://main--bacom--adobecom.hlx.page/fragments/resources/recommended/template-a-recommended"));
    main.append(createSectionMetadata(main,document, {
		  style: "XXL Spacing, center",
		  background: "	#f8f8f8"
    }));
    main.append(document.createElement("hr"));
	main.append(createFragment(main,document, "https://main--bacom--adobecom.hlx.page/fragments/resources/request-demo")); 
    main.append(createCardMetadata(main, document));
    main.append(createMetadata(main, document));



    return main;
  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {String} url The url of the document being transformed.
   * @param {HTMLDocument} document The document
   */
  generateDocumentPath: ({ document, url }) => {
    let { pathname } = new URL(url);
    const localFromURL = pathname.split('/')[1];
    if (!localFromURL.startsWith('resource')) {
      pathname = pathname.replace(localFromURL, window.local);
    }
    pathname = pathname.replace('.html', '');
    return WebImporter.FileUtils.sanitizePath(pathname);
  },
};



