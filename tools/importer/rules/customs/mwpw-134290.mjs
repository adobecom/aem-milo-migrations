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
  return parseTwoUpLayoutsSectionMetadata(el, document, section, { 
    elementType: 'card',
    bgStrategy: 'color',
  });
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
  const href = 'https://milo.adobe.com/tools/caas#eyJhZGRpdGlvbmFsUmVxdWVzdFBhcmFtcyI6W10sImFuYWx5dGljc0NvbGxlY3Rpb25OYW1lIjoiIiwiYW5hbHl0aWNzVHJhY2tJbXByZXNzaW9uIjpmYWxzZSwiYW5kTG9naWNUYWdzIjpbXSwiYXV0b0NvdW50cnlMYW5nIjp0cnVlLCJib29rbWFya0ljb25TZWxlY3QiOiIiLCJib29rbWFya0ljb25VbnNlbGVjdCI6IiIsImNhcmRTdHlsZSI6IjE6MiIsImNhcmRUaXRsZUFjY2Vzc2liaWxpdHlMZXZlbCI6NiwiY29sbGVjdGlvbkJ0blN0eWxlIjoicHJpbWFyeSIsImNvbGxlY3Rpb25OYW1lIjoiIiwiY29sbGVjdGlvblRpdGxlIjoiU2VlIHJlbGF0ZWQgZmVhdHVyZXMiLCJjb2xsZWN0aW9uU2l6ZSI6IiIsImNvbnRhaW5lciI6IjEyMDBNYXhXaWR0aCIsImNvbnRlbnRUeXBlVGFncyI6W10sImNvdW50cnkiOiJjYWFzOmNvdW50cnkvdXMiLCJjdXN0b21DYXJkIjoiIiwiY3RhQWN0aW9uIjoiX2JsYW5rIiwiZG9Ob3RMYXp5TG9hZCI6ZmFsc2UsImRpc2FibGVCYW5uZXJzIjpmYWxzZSwiZHJhZnREYiI6ZmFsc2UsImVuZHBvaW50Ijoid3d3LmFkb2JlLmNvbS9jaGltZXJhLWFwaS9jb2xsZWN0aW9uIiwiZW52aXJvbm1lbnQiOiIiLCJleGNsdWRlZENhcmRzIjpbXSwiZXhjbHVkZVRhZ3MiOltdLCJmYWxsYmFja0VuZHBvaW50IjoiIiwiZmVhdHVyZWRDYXJkcyI6W10sImZpbHRlckV2ZW50IjoiIiwiZmlsdGVyQnVpbGRQYW5lbCI6ImF1dG9tYXRpYyIsImZpbHRlckxvY2F0aW9uIjoibGVmdCIsImZpbHRlckxvZ2ljIjoib3IiLCJmaWx0ZXJzIjpbXSwiZmlsdGVyc0N1c3RvbSI6W10sImZpbHRlcnNTaG93RW1wdHkiOmZhbHNlLCJndXR0ZXIiOiI0eCIsImhlYWRlcnMiOltdLCJoaWRlQ3RhSWRzIjpbXSwiaGlkZUN0YVRhZ3MiOltdLCJpbmNsdWRlVGFncyI6W10sImxhbmd1YWdlIjoiY2FhczpsYW5ndWFnZS9lbiIsImxheW91dFR5cGUiOiIzdXAiLCJsb2FkTW9yZUJ0blN0eWxlIjoicHJpbWFyeSIsIm9ubHlTaG93Qm9va21hcmtlZENhcmRzIjpmYWxzZSwib3JMb2dpY1RhZ3MiOltdLCJwYWdpbmF0aW9uQW5pbWF0aW9uU3R5bGUiOiJwYWdlZCIsInBhZ2luYXRpb25FbmFibGVkIjpmYWxzZSwicGFnaW5hdGlvblF1YW50aXR5U2hvd24iOmZhbHNlLCJwYWdpbmF0aW9uVHlwZSI6InBhZ2luYXRvciIsInBhZ2luYXRpb25Vc2VUaGVtZTMiOmZhbHNlLCJwbGFjZWhvbGRlclVybCI6IiIsInJlc3VsdHNQZXJQYWdlIjoiMyIsInNlYXJjaEZpZWxkcyI6W10sInNldENhcmRCb3JkZXJzIjp0cnVlLCJzaG93Qm9va21hcmtzRmlsdGVyIjpmYWxzZSwic2hvd0Jvb2ttYXJrc09uQ2FyZHMiOmZhbHNlLCJzaG93RmlsdGVycyI6ZmFsc2UsInNob3dTZWFyY2giOmZhbHNlLCJzaG93VG90YWxSZXN1bHRzIjpmYWxzZSwic29ydERhdGVBc2MiOmZhbHNlLCJzb3J0RGF0ZURlc2MiOmZhbHNlLCJzb3J0RGF0ZU1vZGlmaWVkIjpmYWxzZSwic29ydERlZmF1bHQiOiJkYXRlRGVzYyIsInNvcnRFbmFibGVQb3B1cCI6ZmFsc2UsInNvcnRFbmFibGVSYW5kb21TYW1wbGluZyI6ZmFsc2UsInNvcnRFdmVudFNvcnQiOmZhbHNlLCJzb3J0RmVhdHVyZWQiOmZhbHNlLCJzb3J0TW9kaWZpZWRBc2MiOmZhbHNlLCJzb3J0TW9kaWZpZWREZXNjIjpmYWxzZSwic29ydFJhbmRvbSI6ZmFsc2UsInNvcnRSZXNlcnZvaXJQb29sIjoxMDAwLCJzb3J0UmVzZXJ2b2lyU2FtcGxlIjozLCJzb3J0VGl0bGVBc2MiOmZhbHNlLCJzb3J0VGl0bGVEZXNjIjpmYWxzZSwic291cmNlIjpbImJhY29tIl0sInRhZ3NVcmwiOiJ3d3cuYWRvYmUuY29tL2NoaW1lcmEtYXBpL3RhZ3MiLCJ0YXJnZXRBY3Rpdml0eSI6IiIsInRhcmdldEVuYWJsZWQiOmZhbHNlLCJ0aGVtZSI6ImxpZ2h0ZXN0IiwiZGV0YWlsc1RleHRPcHRpb24iOiJkZWZhdWx0IiwidGl0bGVIZWFkaW5nTGV2ZWwiOiJoMyIsInRvdGFsQ2FyZHNUb1Nob3ciOiIzIiwidXNlTGlnaHRUZXh0IjpmYWxzZSwidXNlT3ZlcmxheUxpbmtzIjpmYWxzZSwiY29sbGVjdGlvbkJ1dHRvblN0eWxlIjoicHJpbWFyeSIsInVzZXJJbmZvIjpbXSwic2hvd0lkcyI6ZmFsc2UsImFjY2Vzc2liaWxpdHlMZXZlbCI6IjIifQ==';
  const container = document.createElement('p');
  const link = document.createElement('a');
  link.href = href;
  link.textContent = 'CaaS Link';
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
