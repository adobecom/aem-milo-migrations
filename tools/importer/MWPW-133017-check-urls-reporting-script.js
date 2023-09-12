import { parseMarquee } from "./parsers/marquee.js";
import { parseMetadata, parseCardMetadata } from "./parsers/metadata.js";
import { generateDocumentPath } from './utils.js';

export default {

  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @returns {HTMLElement} The root element
   */
  transform: async ({ document, params }) => {
 
    const faasFormLink = document.querySelector('a[href*=faas], div.faas, faas-form-settings');
    const hasFaasForm = faasFormLink ? true : false;
    const hasResourceFormStyle = [...document.querySelectorAll('.section-metadata')].some((el) => { return el.textContent.includes('resource-form') }) ? true : false;
    const isAFragment = params.originalURL.includes('/fragments/');
    let faasSectionDataOK = 'not relevant';
    if (!isAFragment && hasFaasForm) {
      if (!document.querySelector('.section-metadata')) {
        faasSectionDataOK = 'MISSING';
      } else {
        const sectionDiv = faasFormLink.closest('body > div');
        if (sectionDiv) {
          faasSectionDataOK = sectionDiv.querySelector('.section-metadata') ? 'ok' : 'NOT OK - MISPLACED';
        }
      }
    }

    const main = document.createElement('div');

    const REPORT = {
      hasFaasForm: hasFaasForm.toString(),
      hasResourceFormStyle: hasResourceFormStyle.toString(),
      isAFragment: isAFragment.toString(),
      faasSectionDataOK: faasSectionDataOK.toString(),
    };

    main.textContent = JSON.stringify(REPORT);

    console.log(REPORT);
    return [{
      element: main,
      path: generateDocumentPath({ document, url: params.originalURL }),
      report: REPORT,
    }];

  },

  generateDocumentPath: generateDocumentPath,
  
};
