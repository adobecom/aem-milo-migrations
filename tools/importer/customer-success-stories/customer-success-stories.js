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
 * 
 * Script for Customer Success Stories - customer showcase cm
 * 
 * Example URL: https://business.adobe.com/customer-success-stories/princess-cruises-case-study.html
 * 
 */
/* eslint-disable no-console, class-methods-use-this */

import { 
    createMarquee, 
    createBreadCrumbs,
    createCardCollectionId,
    createImgElementsFromImgEls,
    reccomendedBlock,
    objectivesResultsBlock,
    createMp4AndGifConsoleLog,
    establishedStats,
    createQuoteBlocks,
    createContactReference,
    createMetadata,
    makeLinksAbsolute,
    createCaasMetadata,
    findKeyValue,
    processModal,
} from './templateCM.js';

import {
    t2t3createMarquee,
    t2t3EstablishedStats,
    t2t3ObjectivesResultsBlock,
    t2t3CreateQuoteBlocks,
    t2t3ReccomendedBlock,
    t2t3ProcessModal,
    t2g3CreateContactReference,
    t2t3CreateMetadata,
    t2g3MakeLinksAbsolute,
    t2g3CreateCaasMetadata,
    t2g3CreateBreadCrumbs,
    t2g3CreateImgElementsFromImgEls,
    t2t3CreateCardCollectionId,
    t2t3CreateMp4AndGifConsoleLog,
} from './tier-2-theme-3.js';

let modalName;
let cardCollection;
let modalContainer;
let cardCollectionId;

const customerShowcaseCM = (document, params) => {
    const main = document.querySelector('.page');
    const modal = document.querySelector('#featured-video');
    if (document.querySelector('#featured-video-modalTitle')) {
      modalName = document.querySelector('#featured-video-modalTitle').innerHTML;
    }
    const u = new URL(params.originalURL);
    const cardCollectionContainer = document.querySelector('northstar-card-collection');
    cardCollectionId = document.querySelector('northstar-card-collection')?.id?.split('-')[1];
    cardCollection = createCardCollectionId(cardCollectionId, cardCollectionContainer, document, main);

    createBreadCrumbs(document, main);
    WebImporter.DOMUtils.remove(document, [
      'header, footer'
     ]);

    createImgElementsFromImgEls(document);
    reccomendedBlock(document, main, cardCollectionId);

    objectivesResultsBlock(document, main);
    createMp4AndGifConsoleLog(document, main);
    createMarquee(document, main, modal);
    modalContainer = processModal(document, main, modal, modalName);
    establishedStats(document); 
    createQuoteBlocks(document, main);
    
    createContactReference(document, main);
    createMetadata(document, main);
    makeLinksAbsolute(document, main);
    createCaasMetadata(document, main);
    const style = document.querySelectorAll('style');
    style.forEach((tag) => {
      tag.remove();
    });


    WebImporter.DOMUtils.remove(document, [
      '.modalContainer, .globalnavheader'
     ]);
}

const tier2Theme3 = (document, params) => {
      
    t2g3CreateImgElementsFromImgEls(document);
    const main = document.querySelector('.page');
    t2g3CreateBreadCrumbs(document, main);

    const modal = document.querySelector('#featured-video');
    if (document.querySelector('#featured-video-modalTitle')) {
      modalName = document.querySelector('#featured-video-modalTitle').innerHTML;
    }

    const cardCollectionContainer = document.querySelector('northstar-card-collection');
    cardCollectionId = document.querySelector('northstar-card-collection')?.id?.split('-')[1];
    cardCollection = t2t3CreateCardCollectionId(cardCollectionId, cardCollectionContainer, document, main);
    
    const u = new URL(params.originalURL);
    t2t3CreateMetadata(document, main);
    t2t3CreateMp4AndGifConsoleLog(document, main);

    WebImporter.DOMUtils.remove(document, [
      'header, footer'
     ]);

  t2t3createMarquee(document, main, modal);
  const style = document.querySelectorAll('style');
  style.forEach((tag) => {
      tag.remove();
    });

      WebImporter.DOMUtils.remove(document, [
          '.modalContainer, .globalnavheader'
         ]);
  
    t2t3EstablishedStats(document); 
    t2t3ReccomendedBlock(document, main, cardCollectionId);
    t2t3ObjectivesResultsBlock(document, main);
    modalContainer = t2t3ProcessModal(document, main, modal, modalName);
    t2t3CreateQuoteBlocks(document, main);
    t2g3CreateContactReference(document, main);
    t2g3MakeLinksAbsolute(document, main);
    t2g3CreateCaasMetadata(document, main);
}

export default {
    transform: ({ document, params }) => {
        const template = findKeyValue(window.jcrContent, 'cq:template');
        console.log('template: ' + template);
        let currentTemplate = '';
        if (template === '/conf/northstar/settings/wcm/templates/customer-showcase-cm') {
            currentTemplate = 'customer-showcase-cm';
            customerShowcaseCM(document, params);            
        } else if (template === '/conf/northstar/settings/wcm/templates/customer-story-tier-2-theme-3') {
            tier2Theme3(document, params);
            currentTemplate = 'tier-2-theme-3';
        } else if (template === '/conf/northstar/settings/wcm/templates/customer-story-tier-1-theme-3') {
            currentTemplate = 'tier-1-theme-3';
        } else {
            currentTemplate = 'blank';
        }
        
        console.log(`currentTemplate: ${currentTemplate}`); 

        const main = document.querySelector('.page');
        const u = new URL(params.originalURL);
    
      if (currentTemplate === 'customer-showcase-cm') {  
        console.log('customer-showcase-cm return triggered');

        if (modalName && cardCollection) {
            console.log('modalName && cardCollection');
          return [{
              element: main,
              path: u.pathname.replace('.html', ''),
          }, {
              element: modalContainer,
              path: `fragments/modals/${modalName.toLowerCase().replace(/\s+/g, '-')}`,
          }, {
              element: cardCollection,
              path: `fragments/cards/${cardCollectionId.toLowerCase()}`,
          }];
        } else if (modalName && !cardCollection) {
            console.log('')
          return [{
              element: main,
              path: u.pathname.replace('.html', ''),
          }, {
              element: modalContainer,
              path: `fragments/modals/${modalName.toLowerCase().replace(/\s+/g, '-')}`,
          }];
        } else if (!modalName && cardCollection) {
            console.log('')
          return [{
              element: main,
              path: u.pathname.replace('.html', ''),
          }, {
              element: cardCollection,
              path: `fragments/cards/${cardCollectionId.toLowerCase()}`,
          }];
        } else if (!modalName && !cardCollection) {
            console.log('')
          return [{
              element: main,
              path: u.pathname.replace('.html', ''),
          }];
        }            

      } else if (currentTemplate === 'tier-2-theme-3') {
        console.log('tier-2-theme-3 return triggered');
        if (modalName && cardCollection) {
            return [{
                element: main,
                path: u.pathname.replace('.html', ''),
            }, {
                element: modalContainer,
                path: `fragments/modals/${modalName.toLowerCase().replace(/\s+/g, '-')}`,
            }, {
                element: cardCollection,
                path: `fragments/cards/${cardCollectionId.toLowerCase()}`,
            }];
          } else if (modalName && !cardCollection) {
            return [{
                element: main,
                path: u.pathname.replace('.html', ''),
            }, {
                element: modalContainer,
                path: `fragments/modals/${modalName.toLowerCase().replace(/\s+/g, '-')}`,
            }];
          } else if (!modalName && cardCollection) {
            return [{
                element: main,
                path: u.pathname.replace('.html', ''),
            }, {
                element: cardCollection,
                path: `fragments/cards/${cardCollectionId.toLowerCase()}`,
            }];
          } else if (!modalName && !cardCollection) {
            return [{
                element: main,
                path: u.pathname.replace('.html', ''),
            }];
          }
      }
    },

    /**
     * Return a path that describes the document being transformed (file name, nesting...).
     * The path is then used to create the corresponding Word document.
     * @param {String} url The url of the document being transformed.
     * @param {HTMLDocument} document The document
     */
    generateDocumentPath: ({ document, url }) => {
      return new URL(url).pathname.replace(/\/$/, '');
    },
    
  }