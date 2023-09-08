import { parseAsideGeneric, parseAsideNotificationCenter } from '../aside.js';
import { extractBackground, parseTwoUpSectionMetadataWithTreeview } from '../bacom.js';
import { handleFaasForm } from '../handleFaasForm.js';
import { parseMarquee } from '../marquee.js';
import { parseTwoUpLayoutsSectionMetadata } from '../section-metadata.js';
import { getNSiblingsElements } from '../utils.js';

/**
 * data-analytics-video 
 */

function parseDataAnalyticsSection0(el, document, section) {
  return parseMarquee(el, document, section, {
    imageFirst: true,
    theme: 'dark'
  });
}

/**
 * Builds 2 elements:
 * 
 * 1. A 2-columns block with the following structure:
 *  - fragment link
 *  - image
 * 2. A fragment document containing a list of icon-blocks
 */
function parseDataAnalyticsSection1(el, document, section) {
  console.log('section', section);

  const [fragmentEl, imageEl] = el.querySelectorAll('.container > div > .position');

  /**
   * fragment
   */

  // build fragment url
  const u = new URL(section.url);
  const locale = u.pathname.split('/').slice(1, 2);
  const fragmentPath = `/${locale}/fragments/products/analytics/data-analytics-video`;
  const fragmentUrl = `https://main--bacom--adobecom.hlx.page${fragmentPath}`;

  // fragment link
  const fragmentLink = document.createElement('a');
  fragmentLink.href = fragmentUrl;
  fragmentLink.textContent = fragmentUrl;

  // fragment content
  const fragmentContent = document.createElement('div');
  const fragmentEls = getNSiblingsElements(fragmentEl, 6);

  const topEl = fragmentEls.shift();
  const bottomEl = fragmentEls.pop();

  const iconsMapping = [
    'https://main--bacom--adobecom.hlx.page/drafts/mkhare/fragments/media_18d76013cbd6bdd255dd05f0bf1d91685bb00743e.png?width=750&format=png&optimize=medium',
    'https://main--bacom--adobecom.hlx.page/drafts/mkhare/fragments/media_18e55450587372b30d06e6ecb504fbcca41866d30.png?width=2000&format=webply&optimize=medium',
    'https://main--bacom--adobecom.hlx.page/drafts/mkhare/fragments/media_168870d05dc425fddeb1cd73ee4a1a73160c39d6b.png?width=2000&format=webply&optimize=medium',
    'https://main--bacom--adobecom.hlx.page/drafts/mkhare/fragments/media_12de48335708e09bba07bc7b3b560776ef1219c7f.png?width=2000&format=webply&optimize=medium',
  ]
  const iconBlocks = fragmentEls.map((el, idx) => {
    el.querySelectorAll('img').forEach(img => {
      img.src = iconsMapping[idx];
    });

    return WebImporter.DOMUtils.createTable([
      ['icon-block (inline, small, xs-spacing)'],
      [el],
    ], document);
  });
  fragmentContent.append(topEl, ...iconBlocks, bottomEl);

  fragmentContent.querySelectorAll('b').forEach(bEl => {
    bEl.querySelectorAll('a').forEach(aEl => {
      aEl.querySelectorAll('*').forEach(brEl => bEl.after(brEl));
      bEl.after(aEl);
      bEl.remove();
    });

  });

  console.log('fragmentContent', fragmentContent.outerHTML);


  /**
   * column block
   */

  const img = imageEl.querySelector('img');

  const block = document.createElement('div');

  const colBlock = WebImporter.DOMUtils.createTable([
    ['columns (split, half, small, light)'],
    [fragmentLink, img],
  ], document);
  
  const smBlk = WebImporter.DOMUtils.createTable([
    ['section metadata'],
    ['style', 'light, XL spacing, grid-width-10'],
    ['background', '#f2f8fa'],
  ], document);

  block.append(
    document.createElement('hr'),
    colBlock,
    smBlk,
    document.createElement('hr'),
  );

  return { 
    block,
    extraDocs: [{
      element: fragmentContent,
      path: fragmentPath,
    }],
  };
}

function parseDataAnalyticsSection2(el, document, section) {
  const image = extractBackground(el, document, { strategy: 'image' });

  const block = WebImporter.DOMUtils.createTable([
    ['aside (split, half, small, light)'],
    ['#f7e6ff '],
    [image || '', el.outerHTML],
  ], document);

  return { block };
}

function parseDataAnalyticsSection4(el, document, section) {
  const href = 'https://milo.adobe.com/tools/caas#eyJhZGRpdGlvbmFsUmVxdWVzdFBhcmFtcyI6W10sImFuYWx5dGljc0NvbGxlY3Rpb25OYW1lIjoiIiwiYW5hbHl0aWNzVHJhY2tJbXByZXNzaW9uIjpmYWxzZSwiYW5kTG9naWNUYWdzIjpbXSwiYXV0b0NvdW50cnlMYW5nIjp0cnVlLCJib29rbWFya0ljb25TZWxlY3QiOiIiLCJib29rbWFya0ljb25VbnNlbGVjdCI6IiIsImNhcmRTdHlsZSI6IjE6MiIsImNhcmRUaXRsZUFjY2Vzc2liaWxpdHlMZXZlbCI6NiwiY29sbGVjdGlvbkJ0blN0eWxlIjoicHJpbWFyeSIsImNvbGxlY3Rpb25OYW1lIjoiIiwiY29sbGVjdGlvblRpdGxlIjoiIiwiY29sbGVjdGlvblNpemUiOiIiLCJjb250YWluZXIiOiIxMjAwTWF4V2lkdGgiLCJjb250ZW50VHlwZVRhZ3MiOlsiY2Fhczpjb250ZW50LXR5cGUvY3VzdG9tZXItc3RvcnkiXSwiY291bnRyeSI6ImNhYXM6Y291bnRyeS91cyIsImN1c3RvbUNhcmQiOiIiLCJjdGFBY3Rpb24iOiJfYmxhbmsiLCJkb05vdExhenlMb2FkIjp0cnVlLCJkaXNhYmxlQmFubmVycyI6ZmFsc2UsImRyYWZ0RGIiOmZhbHNlLCJlbmRwb2ludCI6Ind3dy5hZG9iZS5jb20vY2hpbWVyYS1hcGkvY29sbGVjdGlvbiIsImVudmlyb25tZW50IjoiIiwiZXhjbHVkZWRDYXJkcyI6W10sImV4Y2x1ZGVUYWdzIjpbXSwiZmFsbGJhY2tFbmRwb2ludCI6IiIsImZlYXR1cmVkQ2FyZHMiOltdLCJmaWx0ZXJFdmVudCI6IiIsImZpbHRlckJ1aWxkUGFuZWwiOiJhdXRvbWF0aWMiLCJmaWx0ZXJMb2NhdGlvbiI6ImxlZnQiLCJmaWx0ZXJMb2dpYyI6Im9yIiwiZmlsdGVycyI6W10sImZpbHRlcnNDdXN0b20iOltdLCJmaWx0ZXJzU2hvd0VtcHR5IjpmYWxzZSwiZ3V0dGVyIjoiNHgiLCJoZWFkZXJzIjpbXSwiaGlkZUN0YUlkcyI6W10sImhpZGVDdGFUYWdzIjpbXSwiaW5jbHVkZVRhZ3MiOlsiY2Fhczpwcm9kdWN0cy9hZG9iZS1hbmFseXRpY3MiXSwibGFuZ3VhZ2UiOiJjYWFzOmxhbmd1YWdlL2VuIiwibGF5b3V0VHlwZSI6IjN1cCIsImxvYWRNb3JlQnRuU3R5bGUiOiJwcmltYXJ5Iiwib25seVNob3dCb29rbWFya2VkQ2FyZHMiOmZhbHNlLCJvckxvZ2ljVGFncyI6W10sInBhZ2luYXRpb25BbmltYXRpb25TdHlsZSI6InBhZ2VkIiwicGFnaW5hdGlvbkVuYWJsZWQiOmZhbHNlLCJwYWdpbmF0aW9uUXVhbnRpdHlTaG93biI6ZmFsc2UsInBhZ2luYXRpb25UeXBlIjoicGFnaW5hdG9yIiwicGFnaW5hdGlvblVzZVRoZW1lMyI6ZmFsc2UsInBsYWNlaG9sZGVyVXJsIjoiIiwicmVzdWx0c1BlclBhZ2UiOiIzIiwic2VhcmNoRmllbGRzIjpbXSwic2V0Q2FyZEJvcmRlcnMiOnRydWUsInNob3dCb29rbWFya3NGaWx0ZXIiOmZhbHNlLCJzaG93Qm9va21hcmtzT25DYXJkcyI6ZmFsc2UsInNob3dGaWx0ZXJzIjpmYWxzZSwic2hvd1NlYXJjaCI6ZmFsc2UsInNob3dUb3RhbFJlc3VsdHMiOmZhbHNlLCJzb3J0RGF0ZUFzYyI6ZmFsc2UsInNvcnREYXRlRGVzYyI6ZmFsc2UsInNvcnREYXRlTW9kaWZpZWQiOmZhbHNlLCJzb3J0RGVmYXVsdCI6ImRhdGVEZXNjIiwic29ydEVuYWJsZVBvcHVwIjpmYWxzZSwic29ydEVuYWJsZVJhbmRvbVNhbXBsaW5nIjpmYWxzZSwic29ydEV2ZW50U29ydCI6ZmFsc2UsInNvcnRGZWF0dXJlZCI6ZmFsc2UsInNvcnRNb2RpZmllZEFzYyI6ZmFsc2UsInNvcnRNb2RpZmllZERlc2MiOmZhbHNlLCJzb3J0UmFuZG9tIjpmYWxzZSwic29ydFJlc2Vydm9pclBvb2wiOjEwMDAsInNvcnRSZXNlcnZvaXJTYW1wbGUiOjMsInNvcnRUaXRsZUFzYyI6ZmFsc2UsInNvcnRUaXRsZURlc2MiOmZhbHNlLCJzb3VyY2UiOlsiYmFjb20iXSwidGFnc1VybCI6Ind3dy5hZG9iZS5jb20vY2hpbWVyYS1hcGkvdGFncyIsInRhcmdldEFjdGl2aXR5IjoiIiwidGFyZ2V0RW5hYmxlZCI6ZmFsc2UsInRoZW1lIjoibGlnaHRlc3QiLCJkZXRhaWxzVGV4dE9wdGlvbiI6ImRlZmF1bHQiLCJ0aXRsZUhlYWRpbmdMZXZlbCI6ImgzIiwidG90YWxDYXJkc1RvU2hvdyI6IjQwIiwidXNlTGlnaHRUZXh0IjpmYWxzZSwidXNlT3ZlcmxheUxpbmtzIjpmYWxzZSwiY29sbGVjdGlvbkJ1dHRvblN0eWxlIjoicHJpbWFyeSIsInVzZXJJbmZvIjpbXSwiYWNjZXNzaWJpbGl0eUxldmVsIjoiMiJ9';

  const container = document.createElement('div');

  container.append(document.createElement('hr'));

  const title = WebImporter.DOMUtils.createTable([
    ['text (center)'],
    [`<I>${el.querySelector('.cmp-text')?.textContent || 'Success stories'}</I>`],
  ], document);
  container.append(title);

  const p = document.createElement('p');
  const link = document.createElement('a');
  link.href = href;
  link.textContent = 'Content as a Service - Friday, August 18, 2023 at 19:44 (no-lazy)';
  p.append(link);
  container.append(p);

  return { block: container };
}

function parseDataAnalyticsSection5(el, document, section) {
  return parseAsideNotificationCenter(el, document, section, { theme: 'dark' });
}



/**
 * media-library
 */

// parseTwoUpSectionMetadataWithTreeview

function parseMediaLibrarySection0(el, document, section) {
  return parseTwoUpSectionMetadataWithTreeview(el, document, section, { bgStrategy: 'none' });
}

function parseMediaLibrarySection4(el, document, section) {
  const container = document.createElement('p');
  const href = 'https://main--bacom--adobecom.hlx.page/fragments/products/cards/experience-manager';
  const link = document.createElement('a');
  link.href = href;
  link.textContent = href;
  container.append(link);
  return { block: container };
}

function parseMediaLibrarySection5(el, document, section) {
  const container = document.createElement('p');
  const href = 'https://main--bacom--adobecom.hlx.page/fragments/footer-promos/products/aem-sites';
  const link = document.createElement('a');
  link.href = href;
  link.textContent = href;
  container.append(link);
  return { block: container};
}



/**
 * thank-you
 */

function parseThankYouSection0(el, document, section) {
  const img = el.querySelector('img');
  const content = el.querySelector('.position');

  // cleanup empty spans
  content.querySelectorAll('a').forEach(a => {
    const spaceEl = document.createElement('span');
    spaceEl.innerHTML = '&nbsp;';
    content.append(a);
    content.append(spaceEl);
  });

  // make "watch video" link point to the right video
  const videoLink = content.querySelector('a');
  if (videoLink) {
    videoLink.href = 'https://main--bacom--adobecom.hlx.page/fragments/products/modal/videos/real-time-customer-data-platform/RTCDP/rtcdp-definitive-hub#watch-now';
  }

  const bgColor = '#EB1000';

  const block = WebImporter.DOMUtils.createTable([
    ['marquee (medium)'],
    [bgColor],
    [content, img],
  ], document);

  return { block };
}



/**
 * cdp-definitive-hub
 */

function parseCDPDefHubFaasForm(el, document, section) {
  // original faas form
  const formEl = handleFaasForm(el, document);

  const titleEl = el.querySelector('h2') || ((root) => {
    const el = root.querySelector('h2');
    el.textContent = 'Access Now';
    return el;
  })(el);
  titleEl.dataset.hlxImpLabel = 'faas-form-title';

  const titleBlock = WebImporter.DOMUtils.createTable([
    ["text (center)"],
    [titleEl],
  ], document);

  // let title = 'Access Now';
  // // check if existing title
  // const existingTitleEl = el.querySelector('h2');
  // if (existingTitleEl) {
  //   title = existingTitleEl.textContent;
  // }

  // block
  const block = document.createElement('div');

  // const formTitleEl = document.createElement('h5');
  // formTitleEl.id = 'form'
  // formTitleEl.textContent = 'Access Now';

  block.append(titleBlock, formEl);

  return { block };
}

export const parsers = {
  "data-analytics-section-0": parseDataAnalyticsSection0,
  "data-analytics-section-1": parseDataAnalyticsSection1,
  "data-analytics-section-2": parseDataAnalyticsSection2,
  "data-analytics-section-4": parseDataAnalyticsSection4,
  "data-analytics-section-5": parseDataAnalyticsSection5,
  "media-library-section-0": parseMediaLibrarySection0,
  "media-library-section-4": parseMediaLibrarySection4,
  "media-library-section-5": parseMediaLibrarySection5,
  "thank-you-section-0": parseThankYouSection0,
  "cdp-def-hub-section-0": parseThankYouSection0,
  "cdp-def-hub-faas-form": parseCDPDefHubFaasForm,
};
