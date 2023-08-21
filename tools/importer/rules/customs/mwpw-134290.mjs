import { parseAsideGeneric, parseAsideNotificationCenter } from '../aside.js';
import { extractBackground, parseTwoUpSectionMetadataWithTreeview } from '../bacom.js';
import { parseMarquee } from '../marquee.js';
import { parseTwoUpLayoutsSectionMetadata } from '../section-metadata.js';

/**
 * data-analytics-video 
 */

function parseDataAnalyticsSection0(el, document, section) {
  return parseMarquee(el, document, section, {
    imageFirst: true,
    theme: 'dark'
  });
}

function parseDataAnalyticsSection2(el, document, section) {
  const image = extractBackground(el, document, { strategy: 'image' });

  return WebImporter.DOMUtils.createTable([
    ['aside (split, half, small, light)'],
    ['#f7e6ff '],
    [image || '', el.outerHTML],
  ], document);
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

  return container;
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
  return container;
}

function parseMediaLibrarySection5(el, document, section) {
  const container = document.createElement('p');
  const href = 'https://main--bacom--adobecom.hlx.page/fragments/footer-promos/products/aem-sites';
  const link = document.createElement('a');
  link.href = href;
  link.textContent = href;
  container.append(link);
  return container;
}

export const parsers = {
  "data-analytics-section-0": parseDataAnalyticsSection0,
  "data-analytics-section-2": parseDataAnalyticsSection2,
  "data-analytics-section-4": parseDataAnalyticsSection4,
  "data-analytics-section-5": parseDataAnalyticsSection5,
  "media-library-section-0": parseMediaLibrarySection0,
  "media-library-section-4": parseMediaLibrarySection4,
  "media-library-section-5": parseMediaLibrarySection5,
};
