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
Used on Urls of the form in sheet below, rows 7:42
https://business.adobe.com/hk_zh/resources/business-continuity/communication-agility.html

https://adobe-my.sharepoint.com/:x:/r/personal/mariott_adobe_com/Documents/Sept-1_URLS_DOTCOM-70831-all%20geos.xlsx

On these pages there was structure defined by flex items.
The type of block could be detected by the sequence of classes on the sub blocks.
Although about half the blocks had no milo equivalent.

*/
import { handleFaasForm, waitForFaasForm } from '../rules/handleFaasForm.js';
import { cleanupHeadings, setGlobals,  getMetadataValue } from '../utils.js';

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
  const mdImage = getMetadataValue(document, 'og:image');
  if ( mdImage ) {
    meta.image = createImage(document, `https://business.adobe.com${mdImage}`);
  }
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
    ['CardDescription', getMetadataValue(document, 'cardDesc')],
    ['primaryTag', `caas:content-type/${getMetadataValue(document, 'caas:content-type')}`],
    ['tags', `${getMetadataValue(document, 'cq:tags')}`],
  ];
  const mdImage = getMetadataValue(document, 'cardImagePath');
  if ( mdImage ) {
    cells.push(['cardImagePath', createImage(document,`https://business.adobe.com${mdImage}`)]);
  }

  const table = WebImporter.DOMUtils.createTable(cells, document);
  return table;
};






const appendBackward = (elements, main) => {
  for (let i=elements.length-1; i>=0; i--) {
    main.prepend(elements[i]);
  }
}

const createBreadcrumbs = (main, document) => {
  const breadcrumbs = document.querySelector(".feds-breadcrumbs-content");
    const cells = [
      ['breadcrumbs'],
      [breadcrumbs?.innerHTML]
    ];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    breadcrumbs?.remove();
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

    const main = document.querySelector('main');
    console.log(window.fetchUrl);
    const elementsToGo = [];
    elementsToGo.push(createBreadcrumbs(main, document));
    
    WebImporter.DOMUtils.remove(document, [
      `header, footer, .faas-form-settings, style, northstar-card-collection, consonant-card-collection`,
      '.globalnavheader', 
      '.globalNavHeader',
    ]);
    

    // make each flex container a section.
    const contentBody = main.querySelectorAll(".content > .aem-Grid > .aem-GridColumn");
    //console.log("Content Body list ", contentBody);

    const contentItems = contentBody[1].querySelectorAll(".container > .flex");
    // 2 is the black part
    // 3 explore other something online
    // 4 block of lessons
    // 5 spacer
    // experience fragment 



    let togetLinks = true;
    for (const ci of contentBody ) {
      const contentItems = ci.querySelectorAll(".container > .flex");
      const hero = ci.querySelector(".Hero");
      const cta = ci.querySelector(".cta");
      const imageCenter = ci.querySelector(".dexter-Image-center img");
      const picture = ci.querySelector("picture");

      if ( hero ) {
        const videoSource = hero.querySelector("video source");
        if ( videoSource ) {
          const videoLink = document.createElement("a");
          videoLink.href = videoSource.src;
          videoLink.innerHTML = videoSource.src;
          hero.innerHTML = "";
          hero.append(videoLink)
        }
        const cells = [
            ['Section Metadata'],
            ['style', 'XL Spacing, center, grid width 6'],
            ['background','#f5f5f5'],
          ];

        ci.append(WebImporter.DOMUtils.createTable(cells, document));
        ci.append(document.createElement('hr'));
      } else if ( cta && picture) {
        // 6 cards in contentItems, each one is a card
        console.log("6 cards");

        // add a section for the title.
        ci.append(WebImporter.DOMUtils.createTable([
            ['Section Metadata'],
            ['style', 'L Spacing']
          ], document));
        ci.append(document.createElement('hr'));

        // output the cards
        for (let n = 0; n < contentItems.length; n++ ) {
          const cardImage = contentItems[n].querySelector(".container > .image");
          const cardText = contentItems[n].querySelector(".container > .position");
          ci.append(WebImporter.DOMUtils.createTable([
            ['media (small) '],
            [cardText.innerHTML,cardImage.innerHTML]
          ], document));
          contentItems[n].innerHTML = "";
        }

        ci.append(WebImporter.DOMUtils.createTable([
            ['Section Metadata'],
            ['style', 'L Spacing, three up']
          ], document));
        ci.append(document.createElement('hr'));

      } else if ( cta && imageCenter) {
        // ebook CTA
        console.log("ebook cta");
        const cardImage = ci.querySelector(".dexter-FlexContainer  .image");
        const cardText = ci.querySelector(".container > .flex > .dexter-FlexContainer .flex");
        const cells = [
            ['media'],
            [cardImage.innerHTML, cardText.innerHTML]
          ];
        ci.innerHTML = "";
        ci.append(WebImporter.DOMUtils.createTable(cells, document));
        ci.append(document.createElement('hr'));

      } else if ( cta ) {
        // dark section
        console.log("dark cta");
        const darkItems = ci.querySelectorAll(".container > .flex > .dexter-FlexContainer > .dexter-FlexContainer-Items > .flex > .dexter-FlexContainer > .dexter-FlexContainer-Items > div");

        // sections are seperated by a hr,


        //console.log("DarkItems ", darkItems);
        let elements = [];
        const appendElements = () => {

            if (elements.length > 2 ) {
              // text cta
              ci.append(WebImporter.DOMUtils.createTable([
                ["Text (vertical)"],
                [""],
                [""]], document));
              for (const el of elements) {
                ci.append(el);
              }
              ci.append(WebImporter.DOMUtils.createTable([
                ["Section Metadata"],
                ["style","L spacing, four up, dark"],
                ["layout","1 | 3" ],
                ["color","dark"]
              ], document));
              ci.append(document.createElement('hr'));                            
            } else if (elements.length > 0){
              // card cta
              const cardBody = document.createElement("div");
              for (const el of elements) {
                cardBody.append(el);
              }
              ci.append(WebImporter.DOMUtils.createTable([
                ["Text (vertical)"],
                [""],
                [""]], document));
              ci.append(WebImporter.DOMUtils.createTable([
                ["aside (notification, small)"],
                ["#ffffff"],
                [cardBody]], document));
              ci.append(WebImporter.DOMUtils.createTable([
                ["Section Metadata"],
                ["style","L spacing, four up, dark"],
                ["layout","1 | 3" ],
                ["color","dark"]
              ], document));
              ci.append(document.createElement('hr'));                            
            }
        };
        for ( let m = 0; m < darkItems.length; m++) {
          if (  darkItems[m].className == "horizontalRule") {
            appendElements();
            elements = [];
          } else {
            elements.push(darkItems[m]);
          }
          //console.log("DarkItems are ",m, darkItems[m].className);
          darkItems[m].remove();
        }
        appendElements();        
      } else if ( contentItems ) {
        let quoteLeft = true;
        for (let n = 0; n < contentItems.length; n++ ) {
          const hr = contentItems[n].querySelector("div.dexter-FlexContainer-Items div.horizontalRule");
          const quoteBlock = contentItems[n].querySelector("div.dexter-FlexContainer-Items div.dexter-FlexContainer-Items div.position div.mobile-place-left div.dexter-Image-Left");
          const blocks = contentItems[n].querySelectorAll(".dexter-FlexContainer-Items > .flex > .dexter-FlexContainer > .dexter-FlexContainer-Items > .flex  > .dexter-FlexContainer > .dexter-FlexContainer-Items > div");
          const sectionBlocks = contentItems[n].querySelectorAll(".dexter-FlexContainer-Items > .flex > .dexter-FlexContainer > .dexter-FlexContainer-Items  > div");
          const imageLeft = contentItems[n].querySelector(".dexter-Image-center picture");
          const imageRight = contentItems[n].querySelector(".dexter-Image-left picture");

          //console.log("Checks", n, hr, quoteBlock, blocks, sectionBlocks, hero );
          //for ( let m = 0; m < blocks.length; m++) {
            //console.log("BLocks are ",m, blocks[m].className);
          //}
          const sbc = [];
          for ( let m = 0; m < sectionBlocks.length; m++) {
            sbc.push(sectionBlocks[m].className);
          }
          const sectionBlocksClasses = sbc.join("::");

          // The section block classes are a strong indicator of the type of block
          // 
          console.log("Section BLocks classes ", sectionBlocksClasses);



          // the first block always contains links.
          if ( togetLinks ) {
            togetLinks = false;
            const linksBlock = contentItems[n].querySelector("div.dexter-FlexContainer-Items div.dexter-FlexContainer-Items div.text");
            console.log("Links block ");
            let cells = [
              ['Text (vertical) '],
              ['#f5f5f5'],
              [linksBlock.innerHTML],
              [' '], 
            ]; 
            linksBlock.innerHTML = "";
            linksBlock.append(WebImporter.DOMUtils.createTable(cells, document));
            cells = [
              ['Section Metadata'],
              ['style', 'XL spacing, four up '],
              ['layout','1 | 3'],
            ];
            contentItems[n].append(WebImporter.DOMUtils.createTable(cells, document));
            contentItems[n].append(document.createElement('hr'));

          } else if ( sectionBlocksClasses == "horizontalRule" ) {
            console.log("Horizontal Rule, skipping ");
            hr.remove();
          } else if ( sectionBlocksClasses == "dexter-Spacer::flex::text NoMargin::position::dexter-Spacer" ) { 
            // text no margin, position
            console.log(n, "Image And Quote ");   


            // extract the headshot and get it in the right place.
            const quoteImages = contentItems[n].querySelectorAll("img");
            // overlay images have no alt so remove them.
            // keep the headshots
            //console.log("Quote images ",quoteImages);
            for (const img of quoteImages) {
              //console.log("Quote image ",img.alt);
              img.remove();
              if ( img.alt && img.alt.length > 0) {
                if ( quoteLeft ) {
                  contentItems[n].append(img); 
                } else {
                  contentItems[n].prepend(img);
                }
              } 
            }
            quoteLeft = !quoteLeft;



             
            const cells = [
              ['quote (inline, contained)'],
              [ contentItems[n].innerHTML ]
            ];
            contentItems[n].innerHTML = "";
            contentItems[n].append(WebImporter.DOMUtils.createTable(cells, document));
            contentItems[n].append(document.createElement('hr'));
          } else if (imageLeft) {
            // there is only 1 type of class here
            console.log(n, "Image Left Block ");        
            const card = contentItems[n].querySelector(".dexter-FlexContainer-Items > .flex > .dexter-FlexContainer > .dexter-FlexContainer-Items  > div.position");

            const emptyText = [
              ['card (half-card, border) '],
              [card.innerHTML]
              ]; 
            card.remove();
            contentItems[n].prepend(WebImporter.DOMUtils.createTable(emptyText, document));

            
            const cells = [ 
              ['Section Metadata'],
              ['style', 'xl spacing, four up, sidebar-on-left'],
              ['layout','1 | 3'],
            ];
            contentItems[n].append(WebImporter.DOMUtils.createTable(cells, document));
            contentItems[n].append(document.createElement('hr'));

          } else if (imageRight
              && sectionBlocksClasses == "dexter-Spacer::flex::text NoMargin::text NoMargin::dexter-Spacer::position"  ) {
            console.log(n, "Image Right Block ");        
            const card = contentItems[n].querySelector(".dexter-FlexContainer-Items > .flex > .dexter-FlexContainer > .dexter-FlexContainer-Items  > div.position");

            const emptyText = [
              ['card (half-card, border) '],
              [card.innerHTML]
              ];
            card.remove(); 
            contentItems[n].prepend(WebImporter.DOMUtils.createTable(emptyText, document));


            const cells = [
              ['Section Metadata'],
              ['style', 'xl spacing, four up, sidebar-on-right'],
              ['layout','1 | 3'],
            ];
            contentItems[n].append(WebImporter.DOMUtils.createTable(cells, document));
            contentItems[n].append(document.createElement('hr'));

          } else {
            console.log(n, "Content Block ");        

            const emptyText = [
              ['Text (vertical)'],
              [' '],
              [' ']
              ];
            contentItems[n].prepend(WebImporter.DOMUtils.createTable(emptyText, document));


            const cells = [
              ['Section Metadata'],
              ['style', 'xl spacing, four up'],
              ['layout','1 | 3'],
            ];
            contentItems[n].append(WebImporter.DOMUtils.createTable(cells, document));
            contentItems[n].append(document.createElement('hr'));
          }
        }
      } else {
          console.log("Has no contentBody", ci.className);
      }
    }






    main.append(createMetadata(main, document));

    main.append(document.createElement("div"));
    
    // if robots doesn't have noindex include Card Metadata;
    if (!getMetadataValue(document, 'robots')?.toLowerCase()?.includes('noindex')) {
      main.append(createCardMetadata(main, document));
    }
      

    main.append(document.createElement("span"));


    // top elements, must be inserted last to avoid making a complete
    // mess of the dom as served. If you insert this before its
    // almost impossible to predict what the dom structure will be and 
    // how query selectors will end up working.
    appendBackward(elementsToGo, main);

    
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


/*
.aem-GridColumn:nth-child(3) > .dexter-FlexContainer > .dexter-FlexContainer-Items
*/


