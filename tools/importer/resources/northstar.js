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
 
import { setGlobals, getMetadataValue, isRelative, findPaths, createElementFromHTML, getRecommendedArticles } from '../utils.js';


class DefaultTransformer {

   /**
    * Let the transformer evaluate the document for closeness of a match
    * and return that score for evaluation. For the default 1 is returned.
    * For more specific transformers a higher value is returned.
    */ 
   getScore(document) {
      // inspect the dom to find classes that indicate what this is, highest number
      // gets chosen.
      return 1;
   }

   /**
    * Get the main DOMElement for this transformer.
    * Some transformers may want to operate on body, but some may want main.
    * Default prefers main.
    */ 
   getMain(document) {
      return document.querySelector('main') || document.querySelector('body');
   }

   /**
    * Remove unwanted elements from the main before its output.
    */
   removeElements(main, document) {
      //    WebImporter.DOMUtils.remove(document, [
//      `header, footer, .faas-form-settings, .xf, style, northstar-card-collection, consonant-card-collection`,
//    ]);
      WebImporter.DOMUtils.remove(document, [ '.socialmediashare'] );
   }


   /**
    * Create the metadata block and inset it as the first element of the dom so it appears at the
    * top of the markdown or at the top of the docx
    */ 
   createMetadataBlock(main, document) {
      const meta = {};
      // find the <title> element
      meta.Title = document.querySelector('head meta[property="og:title"]')?.content || 
            document.querySelector('title')?.innerHTML.replace(/[\n\t]/gm, '') ||
            "tbd";
      // find the <meta property="og:description"> element
      meta.Description = document.querySelector('head meta[property="og:description"]')?.content || 
         "no description";

      meta.Language = document.querySelector('head meta[http-eqiv="Content-Language"]')?.lang ||
         document.querySelector('head meta[property="og:locale"]')?.content ||
         "en-us";


     // find the <meta property="og:image"> element
      const img = document.querySelector('head meta[property="og:image"]');
      if (img) {
        // create an <img> element
        const el = document.createElement('img');
        el.src = img.content;
        meta.Image = el;
      }


      // the classes in the body often indicate the page type so this can be usefull for
      // determining what typof of transformer is used, however in this case 
      // we are adding it to the metadata so it can be inspected later.
      const body = document.querySelector('body');
      meta.pageClass = document.querySelector('body')?.className?.split(' ').slice(0,2).join('/') ||
         "unknown page class";

      console.log("Meta is ",meta);
      // helper to create the metadata block
      const block = WebImporter.Blocks.getMetadataBlock(document, meta);

      // append the block to the main element
      main.append(block);

      // returning the meta object might be usefull to other rules
      return meta;
   }


   createResources(main, document, originalURL)  {
      // find all videos and add them as links
     const videoIframes = document.querySelectorAll('.video iframe, .modal iframe');
     for(let videoIframe of videoIframes) {
       const res = videoIframe.getAttribute('data-video-src') || videoIframe.src;
       const holder = document.createElement('span');
       holder.innerHTML = res;
       videoIframe.parentNode.insertBefore(holder, videoIframe);
       videoIframe.remove();
     }

     // the hero in this case is a background image applied to a section with id=root_content_section
     let rootContentSection = document.querySelector("#root_content_section");
     if (rootContentSection) {
         const backgroundImage = rootContentSection.style.backgroundImage?.slice(4, -1).replace(/"/g, "");
         if ( backgroundImage ) {
            // replace the hero with an image tag.
            const bgImageUrl = new URL(backgroundImage);
            const imgTag = document.createElement('img');
            imgTag.src = bgImageUrl.pathname+bgImageUrl.search;
            rootContentSection.parentNode.insertBefore(imgTag, rootContentSection);
            // rootContentSection in place in case it contains other content.
         }


     }
     
     // find all pdfs
     let pdfLinks = document.querySelectorAll('.dexter-Cta a');
     for (let pdfLink of pdfLinks ) {
        if (isRelative(pdfLink.href)) {
          pdfLink.href = originalURL.origin + pdfLink.href;
        } else {
          const hrefURL = new URL(pdfLink.href);
          pdfLink.href = originalURL.origin + hrefURL.pathname;
        }
        
        pdfLink.textContent = decodeURI(pdfLink.href);
        
        // For cleanup (to avoid a weird bug from original a link.)
        const newPdfLink = document.createElement('a')
        newPdfLink.href = pdfLink.href;
        newPdfLink.textContent = pdfLink.textContent;
        pdfLink.parentNode.insertBefore(newPdfLink, pdfLink);
        pdfLink.remove();
     }     
   }
   /**
    * Create all the blocks for this type of document.
    * The default only creates a Marquee
    * This is called before other methods, and 
    * It can decide where the block is inserted into the output dom.
    */ 
   createBlocks(main, document) {
     // Marquee

     // This is really not very precise, the assumption here is that the 
     // the first .dexter-FlexContainer is the marquee Doc. Being the marquee 
     // really depends on the css wrapping this element, but its horribly complex
     // and more focused on layout than meaning.
     let marqueeDoc = document.querySelector('.dexter-FlexContainer');
     if (marqueeDoc && marqueeDoc.textContent.trim()) {
       marqueeDoc = document.querySelectorAll('.dexter-FlexContainer')[1];
     }
     if ( marqueeDoc ) {

        const eyebrow = marqueeDoc.querySelector('p')?.textContent?.toUpperCase().trim() || 'REPORT';
        const title = marqueeDoc.querySelector('div.title h1')?.textContent;
        const price = marqueeDoc.querySelectorAll('b')[0]?.parentElement;
        const length = marqueeDoc.querySelectorAll('b')[1]?.parentElement;
        const videoIframe = document.querySelector('iframe');
        const videoSrc = videoIframe?.src || videoIframe?.dataset?.videoSrc;
        const videoHeader = marqueeDoc.querySelectorAll('.position')[2]?.querySelector('p');
        const videoHeaderText = videoHeader?.textContent;
        videoHeader?.remove();
        const description = marqueeDoc.querySelectorAll('b')[marqueeDoc.querySelectorAll('b').length-1]?.closest('.text').nextElementSibling;
        const bgURL = marqueeDoc.style.backgroundImage?.slice(4, -1).replace(/"/g, "") || '';
        let bg = '#f5f5f5'
        if (bgURL) {
          bg = document.createElement('img');
          bg.src = bgURL;
        }
        const cells = [];
        cells.push(['marquee (small, light)']);
        cells.push([bg]);
        let row = [];
        row.push(`<p><strong>${eyebrow}</strong></p>
          <h1>${title}</h1>
          ${price?.outerHTML || ""}
          ${length?.outerHTML || ""}
          ${description?.textContent || ""}`);
        if ( videoHeaderText ) {
            row.push(`<strong>${videoHeaderText}</strong>${videoIframe?.src || videoIframe?.dataset?.videoSrc || ""}`);
        }
        cells.push(row);
        const table = WebImporter.DOMUtils.createTable(cells, document);
        document.querySelector('h1')?.remove();
        marqueeDoc.remove();

        main.insertBefore(table, main.firstChild);
     }

     // For the moment just save as text, but
     // could be saved as something better when a block is available.
      let authorData = document.querySelector('.dexter-articleAuthor');
      let nextUpPod = document.querySelector('.nextUpPod');
      console.log("Author Data Found ", authorData, nextUpPod);
      if ( authorData || nextUpPod ) {
         const parent = authorData?.parentNode || nextUpPod?.parentNode;
         const cells = [];
         cells.push(['Text']);
         let textContent = ""; 
         if ( authorData ) {
            textContent = textContent + authorData.innerHTML;
         } 
         if (nextUpPod ) {
            textContent = textContent + nextUpPod.innerHTML;
         }
         cells.push([ textContent ]);
         console.log("Cells ",cells);
         const table = WebImporter.DOMUtils.createTable(cells, document);
         console.log("Adding table",table.innerHTML," to ",parent.parentNode);
         const seperator = document.createElement("div");
         seperator.innerHTML="---";
         parent.parentNode.insertBefore(seperator, parent);
         parent.parentNode.insertBefore(table, parent);
         console.log("Removing parent",parent);
         authorData.remove();
         nextUpPod.remove();
      }

      // cause the section to layour
      const cells = [];
      cells.push(['Section Metadata']);
      cells.push(['style','XL spacing, two up, grid-template-columns-1-2, grid width 50']);
      const table = WebImporter.DOMUtils.createTable(cells, document);
      main.append(table);



/*
<div class="articleAuthor aem-GridColumn aem-GridColumn--default--3">
  <section class="dexter-ArticleAuthor" itemscope="" itemtype="http://schema.org/Person">
    <img itemprop="image" alt="Photo of Giselle Abramovich" src="/content/dam/dexter/articleAuthors/abramovich.jpg">
    <div class="authorData">
      <span class="p6">by
          
            <span itemprop="givenName">Giselle</span>
            <span itemprop="familyName">Abramovich</span>
          
          
      </span>
      <span class="p6" itemprop="jobTitle">Senior &amp; Strategic Editor, CMO.com</span>
    </div>
  </section>

</div>

<div class="nextUpPod aem-GridColumn aem-GridColumn--default--3">
    <div class="nextUpPod_wr">
        <section class="nextUpPod_current">
            <div class="nextUpPod_sectionTitle p6">now reading</div>
            <ul>
                <li class="p5" data-article-author="Giselle Abramovich" data-article-category="Innovation">
                    <span class="nextUpPod_index">1</span>
                    <span class="nextUpPod_listText">Explore Innovative AR Examples | Adobe for Business | United Kingdom</span>
                </li>
            </ul>
            <div class="progressBar">
                <div class="progressBar_bar" style="height: 1%;"></div>
            </div>
        </section>
        <section class="nextUpPod_next">
            <div class="nextUpPod_sectionTitle p6">next up</div>
            <ul>
                
            </ul>
        </section>
    </div>
</div>
*/

     }

     // div.aem-Grid div.articleAuthor
     // div.aem-Grid div.nextUpPod



}

// list of available transformers
const transformers = [
  new DefaultTransformer()
];


const detectTransformer= (document) => {
   const matches = [];
   for (var transformer of transformers ) {
      matches.push({ t: transformer, score: transformer.getScore(document)});
   }
   matches.sort((a, b) => { return b.score - a.score});
   console.log("Transformer detection returned ",matches[0]);
   return matches[0].t;
}


export default {

   /**
    * Apply DOM operations to the provided document and return
    * the root element to be then transformed to Markdown.
    * @param {HTMLDocument} document The document
    * @returns {HTMLElement} The root element
    */
   transformDOM: async ({ document, url, html, params  }) => {

      const transformer = detectTransformer(document);
      const main = transformer.getMain(document);
      transformer.createBlocks(main, document);
      transformer.createResources(main, document, url);
      transformer.createMetadataBlock(main, document);
      transformer.removeElements(main, document);
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
    console.log("Path Is ",pathname, url);
    return pathname.replace('.html', '');
   },
   /*
   generateDocumentPath: ({ document, url, html, params }) => {
     let { pathname } = new URL(url);
     const localFromURL = pathname.split('/')[1];
     if (!localFromURL.startsWith('resource')) {
       pathname = pathname.replace(localFromURL, window.local);
     }
     pathname.replace('.html', '');
     return pathname;
   },*/
}
