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
 * Script for Customer Stories - Tier 2 theme 3.
 * 
 * Example URL: https://business.adobe.com/customer-success-stories/stanley-black-decker-workfront-case-study.html
 * 
 */

/* eslint-disable no-console, class-methods-use-this */
// import getJSON from './getJSON';

// console.log(document.getElementById('import-url').value);
// console.log(document.getElementById('import-urls').value);
// console.log('is there config?');
// console.log(document);


const DEFAULT_COLSPAN = 2;

let table = document.createElement('table');
let row = document.createElement('tr');
let th = document.createElement('th');
let td = document.createElement('td');
let tableHTML = table.outerHTML;

console.log('aye brad, this is the remote URL you want');
console.log(window.remoteURL);


// 



function findKeyValue(obj, keyName) {
    for (var key in obj) {
        if (key === keyName) {
            return obj[key];
        }
        if (obj[key] !== null && typeof obj[key] === "object") {
            var result = findKeyValue(obj[key], keyName);
            if (result) {
                return result;
            }
        }
    }
    return null;
}    

// const getJSON = async (url) => {
//     const response = await fetch(url, {
//         headers: {
//             'Authorization': 'Basic ' + btoa('milo-dev:HQR2aUaKYmNNWfKzMjx8')
//         }
//     });
//     const data = await response.json();
//     return data;
// }

// let data = await getJSON('https://www-author.corp.adobe.com/content/dx/us/en/customer-success-stories/abb-case-study/jcr:content.6.json');
// //             const pageUrl = window[variable].split('/')[4].split('.')[0];

// console.log(data); 

// listen for variable to change
// const  = async (variable) => {
//     const interval = await setInterval(() => {
//         console.log('im running');
//         if (window[variable] !== undefined) {
//             clearInterval(interval);
//             const pageUrl = window[variable].split('/')[4].split('.')[0];
//             const fetchUrl = `https://www-author.corp.adobe.com/content/dx/us/en/customer-success-stories/${pageUrl}/jcr:content.6.json`;
//             data = getJSON(fetchUrl);
//             console.log('IS THIS DIFFERENT?')
//             console.log(findKeyValue(data, 'fileReferenceMobile'));
//         }
//     }, 3000);
// }
// ('remoteURL');


const extractBackgroundImage = (document) => {
    let test = document.querySelector('#root_position');
    if (!test) {
        test = document.querySelector('#root_content_flex');
    }
    const theBg = String(test.style['_values']['background-image']);
    const rawBg = theBg.replace(/^url\(["']?/, '').replace(/["']?\)$/, ''); 
    const theImage = document.createElement('img');
    theImage.setAttribute('src', rawBg);

    return rawBg;
};

// var getJSON = function(url, callback) {
//     var xhr = new XMLHttpRequest();
//     xhr.open('GET', url, true);
//     xhr.responseType = 'json'; 
//     xhr.onload = function() {
//       var status = xhr.status;
//       if (status === 200) {
//         callback(null, xhr.response);
//         console.log('200' + xhr.response)
//       } else {
//         console.log('Not 200' + xhr.response)
//         callback(status, xhr.response);
//       }
//     };
//     xhr.send(); 
// };

// const createMarquee = (document, main, modal, mobile, tablet, desktop) => {
    const createMarquee = (document, main, modal) => {

        console.log('aye, does this change each time?');
        console.log(window.data);


        // console.log('Mobile');
        // console.log(findKeyValue(window.data, 'fileReferenceMobile'));
        let mobile = findKeyValue(window.data, 'fileReferenceMobile');
        // console.log('Tablet');
        let tablet = findKeyValue(window.data, 'fileReferenceTablet');
        // console.log(findKeyValue(window.data, 'fileReferenceTablet'));
        // console.log('Desktop'); 
        let desktop = findKeyValue(window.data, 'fileReference');
        // console.log(desktop);
        // console.log(typeof desktop);

        if (mobile.includes('logo')) {
            mobile = null;
        };
        if (tablet.includes('logo')) {
            tablet = null;
        };
        if (desktop.includes('logo')) {
            desktop = null;
        };

        console.log('A MARQUEE');
    
    
        const fullMobile = `https://business.adobe.com${mobile}`;
        const fullTablet = `https://business.adobe.com${tablet}`;
        const fullDesktop = `https://business.adobe.com${desktop}`;

        console.log('THE MOBILE TABLET DESKTOP BITS');
        console.log(`${fullMobile} ${fullTablet} ${fullDesktop}`);

    const styleTag = document.querySelector('.title.NoMargin.heading-XL h1.cmp-title__text').closest('.flex').parentNode.parentNode.parentNode.querySelector('style');
    let marquee = document.querySelector('.title.NoMargin.heading-XL h1.cmp-title__text').closest('.flex').parentNode.parentNode;
    // console.log('styleTag');
    // console.log(styleTag.innerHTML);



        // extract background urls from the css
        const extractBackgroundUrls = (css) => {
            const regex = /url\((.*?)\)/g;
            const matches = css.match(regex);
            // return matches;
            return matches.map(match => match.replace(/url\((.*?)\)/g, '$1'));
        }

        // console.log('extractBackgroundUrls(styleTag.innerHTML)');
        // console.log(extractBackgroundUrls(styleTag.innerHTML));

    // const backgroundUrls = extractBackgroundUrls(styleTag.innerHTML);
    // console.log('url fixed? ');
       


    // console.log('the basics222...?????? '); 

    
    // let testy = backgroundUrls[0];
    // testy = encodeURI(testy);
    // testy = testy.replace(/%5C2f/g, '/').replace(/%5C26/g, '&').replace(/%20/g, '');
    // console.log('DID I GET IT?');
    // console.log(testy);


    // const mobileURL = encodeURI(backgroundUrls[0]).replace(/%5C2f/g, '/').replace(/%5C26/g, '&').replace(/%20/g, '');
    // const tabletURL = encodeURI(backgroundUrls[1]).replace(/%5C2f/g, '/').replace(/%5C26/g, '&').replace(/%20/g, '');
    // const desktopURL = encodeURI(backgroundUrls[2]).replace(/%5C2f/g, '/').replace(/%5C26/g, '&').replace(/%20/g, '');

    // console.log('urlsTHE NEW');
    // console.log(mobileURL);
    // console.log(tabletURL);
    // console.log(desktopURL);


    const mobileImg = document.createElement('img');
    mobileImg.setAttribute('src', fullMobile);

    const tabletImg = document.createElement('img');
    tabletImg.setAttribute('src', fullTablet);

    const desktopImg = document.createElement('img');
    desktopImg.setAttribute('src', fullDesktop);
    
    // console.log(marquee.parentNode.outerHTML);
    // if (document.getElementById('root_content_flex')) {
    //     marquees = document.querySelectorAll('#root_content_flex');
    // }
    
    // marquees?.forEach((marquee) => {
    // if (document.getElementById('root_content_flex')) {
    //     marquee.querySelector('img').remove();
    // }
        // const bg = extractBackgroundImage(marquee);
        const heading = marquee.querySelector('h1');
        const bodyText = marquee.querySelector('.cmp-text ');
        const image = marquee.querySelector('img');
        const cta = marquee.querySelector('.dexter-Cta a');

        const table = document.createElement('table');
        let row = document.createElement('tr');
        table.append(row);
        const th = document.createElement('th');
        row.append(th) 
        
        if (styleTag.innerHTML.indexOf('color: #FFFFFF') > -1) {
            th.innerHTML = 'Marquee';
        } else {
            th.innerHTML = 'Marquee (light)';
        }
        th.setAttribute('colspan', 3);

        row = document.createElement('tr');
        table.append(row);

        // Background image.
        // const backgroundURL = extractBackgroundImage(document);

        // const theBg = String(marquee.style['background-image']);
        // const rawBg = theBg.replace(/^url\(["']?/, '').replace(/["']?\)$/, ''); 
        // const theImage = document.createElement('img');
        // theImage.setAttribute('src', rawBg);
        
        // console.log('THE OLD WAY BELOW');
        // console.log(marquee.style);
        // console.log(rawBg);
        // console.log(theImage);


        // const marqueeImage = document.createElement('img');
        // marqueeImage.setAttribute('src', backgroundURL);


        // const mobileImg = document.createElement('img');
        // mobileImg.setAttribute('src', fullMobile);

        // const tabletImg = document.createElement('img');
        // tabletImg.setAttribute('src', fullTablet);

        // const desktopImg = document.createElement('img');
        // desktopImg.setAttribute('src', fullDesktop);

        if (mobile !== null) {
            let td = document.createElement('td');
            td.innerHTML = mobileImg.outerHTML;
            row.append(td);
        }

        if (tablet !== null) {
            td = document.createElement('td');
            td.innerHTML = tabletImg.outerHTML;
            row.append(td);
        }

        if (desktop !== null) {
            td = document.createElement('td');
            td.innerHTML = desktopImg.outerHTML;
            row.append(td);
        }



        // td = document.createElement('td');
        // td.setAttribute('colspan', DEFAULT_COLSPAN);
        
        // row.append(td);
        row = document.createElement('tr');
        table.append(row);


        td = document.createElement('td');
        td.setAttribute('colspan', 3);
        row.append(td);

        if (image) {
            td.append(image);
        }

        if (heading) {
            td.append(heading);
        }
        if (bodyText) {
            td.append(bodyText);
        }        
        if (cta) {
            if (modal) {
                const newCta = document.createElement('a');
                let modalName;
                if (document.querySelector('#featured-video-modalTitle')) {
                    modalName = document.querySelector('#featured-video-modalTitle').innerHTML;
                  }
                newCta.setAttribute('href', `https://main--bacom--adobecom.hlx.page/fragments/customer-success-stories/modals/${modalName.toLowerCase().replace(/\s+/g, '-')}#watch-now`);
                newCta.append('Watch Now');
                const em = document.createElement('em');
                const strong = document.createElement('strong');
                em.append(strong);
                strong.append(newCta);
                td.append(em);                 
            } else {
                td.append(cta);                 
            }
        }
        const seperator = '--- <br />';
        marquee.insertAdjacentHTML('afterend', seperator) 
    
        // Insert after current marquee, remove marquee.
        const tableHTML = table.outerHTML;
        marquee.insertAdjacentHTML('afterend', tableHTML)

        marquee.remove();

    // });
};


const createIconBlock = (document, main) => {
    const icons = document.querySelectorAll('.aem-GridColumn:nth-child(3) .dexter-FlexContainer-Items > div > div:first-child img');
    if (!icons) {
        return; // actually I think I'll handle that below. 
    }
    const table = document.createElement('table');
    let row = document.createElement('tr');
    table.append(row);
    const th = document.createElement('th');
    row.append(th);
    th.innerHTML = 'Icon Block';
    th.setAttribute('colspan', DEFAULT_COLSPAN);

    row = document.createElement('tr');
    table.append(row);

    let td = document.createElement('td');
    row.append(td);

    icons?.forEach((icon) => {
        const newIcon = document.createElement('img');
        newIcon.setAttribute('src', icon.src);
        td.append(newIcon);
    });

    const mainBlock = document.querySelector('.aem-GridColumn:nth-child(3) .dexter-FlexContainer-Items > div:first-child');
    const tableHTML = table.outerHTML;
    mainBlock.insertAdjacentHTML('afterend', tableHTML)
    mainBlock.remove();

}
let ConvertStringToHTML = function (str) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(str, 'text/html');
    return doc.body;
 };
const establishedStats = (document) => {
    const columnItems = document.querySelectorAll('.flex:nth-child(3) .dexter-FlexContainer-Items > div > div > div');
    const mainContainer = document.querySelector('.flex:nth-child(3)');

    const table = document.createElement('table');
    let row = document.createElement('tr');
    table.append(row);
    const th = document.createElement('th');
    row.append(th);
    th.innerHTML = 'Stats';
    th.setAttribute('colspan', 1);

    row = document.createElement('tr');
    table.append(row);

    
    let td = document.createElement('td');
    const icon = document.querySelector('.dexter-Image.dexter-Image-center img');
    td.innerHTML = icon.outerHTML;
    row.append(td);

    icon.remove();

    row = document.createElement('tr');
    table.append(row);       

    let count = 0;
    columnItems?.forEach((columnItem) => {
            const brs = columnItem.querySelectorAll('br');
            const stringyCol = String(columnItem.innerHTML);


            brs.forEach((br) => {
                br.insertAdjacentHTML('afterend', '<h3>&nbsp;</h3>');

            });

            td = document.createElement('td');
            td.innerHTML = columnItem.innerHTML;
            row.append(td);
            if (count < 2) {
                row = document.createElement('tr');
                table.append(row);        
            }
        count++;
    });

    const seperator = '---';
    mainContainer.insertAdjacentHTML('afterend', seperator) 

    const tableHTML = table.outerHTML;
    mainContainer.insertAdjacentHTML('afterend', tableHTML)
    mainContainer.remove();
}   

const createStatsBlock = (document) => {

    const table = document.createElement('table');
    let row = document.createElement('tr');
    table.append(row);
    const th = document.createElement('th');
    row.append(th);
    th.innerHTML = 'Stats';
    th.setAttribute('colspan', DEFAULT_COLSPAN);    

    row = document.createElement('tr');
    table.append(row);

    let td = document.createElement('td');
    row.append(td);

}

const objectivesResultsBlock = (document, main) => {
    // .dexter-FlexContainer-Items.container.dexter-FlexContainer--mobileJustifyCenter.dexter-FlexContainer--mobileAlignAlignmentStretch.dexter-FlexContainer--mobileAlignContentCenter.dexter-FlexContainer--mobileAlignItemContentCenter
    const mainContainer = document.querySelector('.flex:nth-child(4) > div');
    const theBg = mainContainer.style['background-image'];
    const rawBg = theBg.replace(/^url\(["']?/, '').replace(/["']?\)$/, ''); 
    const theImage = document.createElement('img');
    theImage.setAttribute('src', rawBg);

    table = document.createElement('table');
    row = document.createElement('tr');
    table.append(row);
    th = document.createElement('th');
    row.append(th);
    th.innerHTML = 'Section Metadata';
    th.setAttribute('colspan', DEFAULT_COLSPAN);    

    row = document.createElement('tr');
    table.append(row);

    td = document.createElement('td');
    td.innerHTML = 'style';
    row.append(td);

    td = document.createElement('td');
    td.innerHTML = 'white-columns, icon-headings';
    row.append(td);

    row = document.createElement('tr');
    table.append(row);

    td = document.createElement('td');
    td.innerHTML = 'background';
    row.append(td);

    td = document.createElement('td');
    td.innerHTML = theImage.outerHTML;
    row.append(td);

    const seperator = '---';
    mainContainer.insertAdjacentHTML('afterend', seperator) 

    tableHTML = table.outerHTML;
    mainContainer.insertAdjacentHTML('afterend', tableHTML)

   
    // Create columns
    table = document.createElement('table');
    row = document.createElement('tr');
    table.append(row);
    th = document.createElement('th');
    row.append(th);
    th.innerHTML = 'Columns (contained)';
    th.setAttribute('colspan', DEFAULT_COLSPAN);    

    row = document.createElement('tr');
    table.append(row);

    const columnItems = document.querySelectorAll('.flex:nth-child(4) > div > div > div')
    let count = 0;
    columnItems?.forEach((columnItem) => {
        if (count < 2) {
            td = document.createElement('td');
            td.innerHTML = columnItem.innerHTML;
            row.append(td);        
        }
        count++;
    });

    tableHTML = table.outerHTML;
    mainContainer.insertAdjacentHTML('afterend', tableHTML) 
    mainContainer.remove();    

}

const createQuoteBlocks = (document, main) => {
    const h3s = document.querySelectorAll('h3');
    h3s.forEach((h3) => {
        if ((h3.innerHTML.indexOf('“') > -1) && (h3.closest('.dexter-FlexContainer-Items')?.querySelector('.horizontalRule'))) { 
            // console.log(h3.closest('.dexter-FlexContainer-Items').querySelector('.horizontalRule'));
            let theQuote = h3.closest('div');
            let theQuoteContainer = h3.parentNode.parentNode;

            let quoteImage = theQuoteContainer.parentNode.querySelector('img');
             
            table = document.createElement('table');
            row = document.createElement('tr'); 
            table.append(row);
            th = document.createElement('th');
            row.append(th);
            th.innerHTML = 'Quote (contained, center, borders)';


            if (quoteImage) {
                row = document.createElement('tr');
                table.append(row);
                td = document.createElement('td');
                td.innerHTML = quoteImage.outerHTML;
                row.append(td);        
                quoteImage.remove();
            } 

            row = document.createElement('tr');
            table.append(row);

            td = document.createElement('td');
            td.innerHTML = theQuote.outerHTML;
            row.append(td);

            tableHTML = table.outerHTML;
            theQuoteContainer.insertAdjacentHTML('afterend', tableHTML) 
            theQuote.remove();  
        }
    });
}

const reccomendedBlock = (document, main, cardCollectionId) => {

    if (document.querySelector('.cardcollection')) {
        const reccomededBlocks = document.querySelector('.cardcollection');

        const h3s = document.querySelectorAll('h3');
        h3s.forEach((h3) => {
            if (h3.innerHTML.indexOf('Recommended for you') > -1) { 
                const seperator = '---';
                h3.insertAdjacentHTML('beforebegin', seperator);
            }
        });


        const seeAllCustomerStories = document.querySelectorAll('a');
        seeAllCustomerStories.forEach((seeAllCustomerStory) => {
            if (seeAllCustomerStory.innerHTML.indexOf('See all customer stories') > -1 || seeAllCustomerStory.innerHTML.indexOf('View all customer stories') > -1) {
                seeAllCustomerStory.remove();
            }
        });


        // create link
        const link = document.createElement('a');
        link.setAttribute('href', 'https://business.adobe.com/customer-success-stories/index');
        link.innerHTML = 'See all customer stories';

        table = document.createElement('table');
        row = document.createElement('tr');
        table.append(row);
        th = document.createElement('th');
        row.append(th);
        th.innerHTML = 'Section Metadata';
        th.setAttribute('colspan', DEFAULT_COLSPAN);    
    
        row = document.createElement('tr');
        table.append(row);
    
        td = document.createElement('td');
        td.innerHTML = 'style';
        row.append(td);
    
        td = document.createElement('td');
        td.innerHTML = 'XXL Spacing, data-hidden, center';
        row.append(td);
    
        row = document.createElement('tr');
        table.append(row);
    
        td = document.createElement('td');
        td.innerHTML = 'background';
        row.append(td);
    
        td = document.createElement('td');
        td.innerHTML = '#F8F8F8';
        row.append(td);    

        const seperator = '--- <br />';
        reccomededBlocks.insertAdjacentHTML('afterend', seperator) 
    
        tableHTML = table.outerHTML;
        reccomededBlocks.insertAdjacentHTML('afterend', tableHTML) 
        
        reccomededBlocks.insertAdjacentHTML('afterend', link.outerHTML);

        const caasValues = document.createElement('ul');
        caasValues.classList.add('raw-caas-values');
        const dataAttribs = document.querySelector('northstar-card-collection').dataset;
        for( var d in dataAttribs) {
            const caasValuesItem = document.createElement('li');
            caasValuesItem.append(`${d}: ${dataAttribs[d]}`);
            caasValues.append(caasValuesItem);
        }
        // reccomededBlocks.insertAdjacentHTML('afterend', caasValues.outerHTML) 


        const fragmentLink = document.createElement('a');
        fragmentLink.href = `https://main--bacom--adobecom.hlx.page/fragments/customer-success-stories/cards/${cardCollectionId}`;
        fragmentLink.append(`https://main--bacom--adobecom.hlx.page/fragments/customer-success-stories/cards/${cardCollectionId}`);

        reccomededBlocks.closest('.xf').classList.remove('.xf');
        reccomededBlocks.insertAdjacentHTML('afterend', `${fragmentLink.outerHTML} <br /> <br />`);

        reccomededBlocks.remove();
        
    }

};

const processModal = (document, main, modal, modalName) => {
    if (modal) {
        // Extract youtube link and drop off in doc, remove all else? Yes. 
        const youtubeSrc = modal.querySelector('iframe').getAttribute('data-video-src');
        const videoDescription = modal.querySelector('#featured-video-modalDescription').innerHTML;
        const youtubeLink = document.createElement('a');
        youtubeLink.setAttribute('src', youtubeSrc);
        youtubeLink.append(`${videoDescription} ${youtubeSrc}`);
        modal.insertAdjacentHTML('afterend', youtubeLink.outerHTML);
        modal.remove(); 

        return youtubeLink;

    }
};

const createContactReference = (document, main) => {
    const contactXf = document.querySelector('.xfreference:last-of-type');
    let contactLink = document.createElement('a');
    
    if (contactXf.querySelector('svg')) {
        contactLink.href = 'https://main--bacom--adobecom.hlx.page/fragments/customer-success-stories/contact-footer-number';
        contactLink.append('https://main--bacom--adobecom.hlx.page/fragments/customer-success-stories/contact-footer-number');
    } else {
        contactLink.href = 'https://main--bacom--adobecom.hlx.page/fragments/customer-success-stories/contact-footer';
        contactLink.append('https://main--bacom--adobecom.hlx.page/fragments/customer-success-stories/contact-footer');
    }
    // table = document.createElement('table');
    // row = document.createElement('tr');
    // table.append(row);
    // th = document.createElement('th');
    // row.append(th);
    // th.innerHTML = 'Section Metadata';
    // th.setAttribute('colspan', DEFAULT_COLSPAN);    

    // row = document.createElement('tr');
    // table.append(row);

    // td = document.createElement('td');
    // td.innerHTML = 'style';
    // row.append(td);


    // const seperator = '--- <br />';
    // contactXf.insertAdjacentHTML('afterend', seperator) 


    // contactXf.insertAdjacentHTML('afterend', table.outerHTML);

    contactXf.insertAdjacentHTML('afterend', contactLink.outerHTML);
    contactXf.remove(); 
};



const createQuoteBlocks2 = (document, main) => {

    const mainContainer = document.querySelector('.responsivegrid:nth-child(1) > .aem-Grid'); // this holds all content under the clouds. 
    const hrs = mainContainer.querySelectorAll('.horizontalRule');

    function getEveryNth(arr, nth) {
        const result = [];
      
        for (let i = 0; i < arr.length; i += nth) {
          result.push(arr[i]);
        }
      
        return result;
      }
      
      const hrIdentifiers = getEveryNth(hrs, 2);

      hrIdentifiers?.forEach((hrIdentifier) => {
        let theQuoteContainer;
        let theQuote;
        let rawQuote;
        let quoteName;
        let quoteJobTitle;

        if (hrIdentifier.nextElementSibling == null) {
            theQuoteContainer = hrIdentifier.closest('.position');
            theQuote = hrIdentifier.closest('.position').nextElementSibling;
            quoteName = theQuote.querySelector('p b');
            quoteName.remove();
            quoteJobTitle = theQuote.querySelector('p');
            quoteJobTitle.remove();
            rawQuote = theQuote.querySelector('.cmp-text')
        } else {
            theQuoteContainer = hrIdentifier.nextElementSibling;
            theQuote = theQuoteContainer;
            quoteName = theQuote.querySelector('p b');
            quoteName.remove();
            quoteJobTitle = theQuote.querySelector('p');   
            quoteJobTitle.remove();
            rawQuote = theQuote.querySelector('.cmp-text')
        }


        table = document.createElement('table');
        row = document.createElement('tr');
        table.append(row);
        th = document.createElement('th');
        row.append(th);
        th.innerHTML = 'Blockquote (center)';
    
        row = document.createElement('tr');
        table.append(row);
    
        td = document.createElement('td');
        td.innerHTML = '';
        row.append(td);        
    
        row = document.createElement('tr');
        table.append(row);
    
        td = document.createElement('td');
        td.innerHTML = `${rawQuote.outerHTML} <br /> ${quoteName.outerHTML} <br /> ${quoteJobTitle.outerHTML}`;
        row.append(td);

        tableHTML = table.outerHTML;
        theQuoteContainer.insertAdjacentHTML('afterend', tableHTML) 
        theQuote.remove();            

      });
      
        
      
}

const createMetadata = (document, main) => {
    const robots = document.querySelector('meta[name="robots"]')?.content;
    const desc = document.querySelector('meta[name="description"]')?.content;
    const keywords = document.querySelector('meta[name="keywords"]')?.content;
    const serpContentCase = document.querySelector('meta[name="serp-content-type"]')?.content;
    const pageCreatedAt = document.querySelector('meta[name="pageCreatedAt"]')?.content;
    const translated = document.querySelector('meta[name="translated"]')?.content;
    const publishDate = document.querySelector('meta[name="publishDate"]')?.content;
    const productJcrID = document.querySelector('meta[name="productJcrID"]')?.content;
    const primaryProductName = document.querySelector('meta[name="primaryProductName"]')?.content;
    const ogImage = document.querySelector('meta[property="og:image"]')?.content;
    // use cardImagePath for ogImage 
    const pageTitle = document.querySelector('title').innerHTML;

    table = null;
    table = document.createElement('table');
    row = document.createElement('tr');
    table.append(row);
    th = document.createElement('th');
    row.append(th);
    th.innerHTML = 'metadata';
    th.setAttribute('colspan', 2);

    row = document.createElement('tr');
    table.append(row);

    if (robots) {
        td = document.createElement('td');
        td.innerHTML = 'robots';
        row.append(td);        
    
        td = document.createElement('td');
        td.innerHTML = robots;
        row.append(td);    
    }

    if (desc) {
        row = document.createElement('tr');
        table.append(row);
    
        td = document.createElement('td');
        td.innerHTML = 'description';
        row.append(td);        
    
        td = document.createElement('td');
        td.innerHTML = desc;
        row.append(td);           
    }

    if (keywords) {
        row = document.createElement('tr');
        table.append(row);
    
        td = document.createElement('td');
        td.innerHTML = 'keywords';
        row.append(td);        
    
        td = document.createElement('td');
        td.innerHTML = keywords;
        row.append(td);            
    }

    if (serpContentCase) {
        row = document.createElement('tr');
        table.append(row);
    
        td = document.createElement('td');
        td.innerHTML = 'serp-content-type';
        row.append(td);        
    
        td = document.createElement('td');
        td.innerHTML = serpContentCase;
        row.append(td);    
    }

    if (pageCreatedAt) {
        row = document.createElement('tr');
        table.append(row);
    
        td = document.createElement('td');
        td.innerHTML = 'pageCreatedAt';
        row.append(td);        
    
        td = document.createElement('td');
        td.innerHTML = pageCreatedAt;
        row.append(td);    
    }

    if (translated) {
        row = document.createElement('tr');
        table.append(row);
    
        td = document.createElement('td');
        td.innerHTML = 'translated';
        row.append(td);        
    
        td = document.createElement('td');
        td.innerHTML = translated;
        row.append(td);           
    }

    if (publishDate) {

        let date = publishDate.split('T');
        date = date[0].split('-'); // yyyy-MM-dd
        date = `${date[1]}-${date[2]}-${date[0]}`;

        row = document.createElement('tr');
        table.append(row);
    
        td = document.createElement('td');
        td.innerHTML = 'publishDate';
        row.append(td);        
    
        td = document.createElement('td');
        td.innerHTML = date;
        row.append(td);    
    }

    if (productJcrID) {
        row = document.createElement('tr');
        table.append(row);
    
        td = document.createElement('td');
        td.innerHTML = 'productJcrID';
        row.append(td);        
    
        td = document.createElement('td');
        td.innerHTML = productJcrID;
        row.append(td);            
    }

    if (primaryProductName) {
        row = document.createElement('tr');
        table.append(row);
    
        td = document.createElement('td');
        td.innerHTML = 'primaryProductName';
        row.append(td);        
    
        td = document.createElement('td');
        td.innerHTML = primaryProductName;
        row.append(td);            
    }
    if (ogImage) {
        // create image from ogImage
        let image = document.createElement('img');
        image.setAttribute('src', ogImage);

        row = document.createElement('tr');
        table.append(row);
    
        td = document.createElement('td');
        td.innerHTML = 'image';
        row.append(td);        
    
        td = document.createElement('td');
        td.innerHTML = image.outerHTML;
        row.append(td);  
    }

    if (pageTitle) {
        row = document.createElement('tr');
        table.append(row);
    
        td = document.createElement('td');
        td.innerHTML = 'title';
        row.append(td);        
    
        td = document.createElement('td');
        td.innerHTML = pageTitle;
        row.append(td); 


    }


    row = document.createElement('tr');
    table.append(row);

    td = document.createElement('td');
    td.innerHTML = 'caas:content-type';
    row.append(td);        

    td = document.createElement('td');
    td.innerHTML = 'customer-story';
    row.append(td);      

    main.append(table);
}

const makeLinksAbsolute = (document, main) => {
    const links = document.querySelectorAll('a');
    if (links.length > 0) {
        links.forEach(link => {
            if (link.href.startsWith('/')) {
                if (link.href.includes('/customer-success-stories')) {
                    link.href = link.href.replace('.html', '');
                    link.href = `https://business.adobe.com${link.href}`;
                } else {
                    link.href = `https://business.adobe.com${link.href}`;
                }
            }
        });
    }
}

const createCaasMetadata = (document, main) => {

    const cardTitle = findKeyValue(window.data, 'cardTitle');
    const cardDate = findKeyValue(window.data, 'cardDate');
    const altCardImageText = findKeyValue(window.data, 'altCardImageText');
    const cardImagePath = findKeyValue(window.data, 'cardImagePath');
    const entity_id = document.querySelector('meta[name="entity_id"]')?.content;

    const cqTags = findKeyValue(window.data, 'cq:tags');
    const logoImage = findKeyValue(window.data, 'logoImage');

    // create array of values from cqTags that contain 'caas:content-type'
    const caasTags = cqTags?.filter(tag => tag.includes('caas:'));
    const adobeEnterprise = cqTags?.filter(tag => tag.includes('adobe-com-enterprise:'));

    if (caasTags || cardTitle || cardDate || altCardImageText || cardImagePath) {
        table = document.createElement('table');
        row = document.createElement('tr');
        table.append(row);
        th = document.createElement('th');
        row.append(th);
        th.innerHTML = 'card metadata';
        th.setAttribute('colspan', 2);
    
    
        if (cardTitle) {
            row = document.createElement('tr');
            table.append(row);
        
            td = document.createElement('td');
            td.innerHTML = 'cardTitle';
            row.append(td);
        
            td = document.createElement('td');
            td.innerHTML = cardTitle;
            row.append(td);
        }

        if (cardDate) {
            row = document.createElement('tr');
            table.append(row);
        
            td = document.createElement('td');
            td.innerHTML = 'cardDate';
            row.append(td);
        
            td = document.createElement('td');
            td.innerHTML = cardDate;
            row.append(td);
        }
    
        if (altCardImageText) {
            row = document.createElement('tr');
            table.append(row);
        
            td = document.createElement('td');
            td.innerHTML = 'altCardImageText';
            row.append(td);
        
            td = document.createElement('td');
            td.innerHTML = altCardImageText;
            row.append(td);
        }

        if (cardImagePath) {
            // create image from cardImagePath
            const cardImage = document.createElement('img');
            cardImage.src = cardImagePath;

            row = document.createElement('tr');
            table.append(row);
        
            td = document.createElement('td');
            td.innerHTML = 'cardImagePath';
            row.append(td);
        
            td = document.createElement('td');
            td.innerHTML = cardImage.outerHTML;
            row.append(td);
        }

        if (logoImage) {
            // create image from logoImage
            const image = document.createElement('img');
            image.setAttribute('src', logoImage);

            row = document.createElement('tr');
            table.append(row);
        
            td = document.createElement('td');
            td.innerHTML = 'badgeImage';
            row.append(td);
        
            td = document.createElement('td');
            td.innerHTML = image.outerHTML;
            row.append(td);
        }
                    
    
        if (caasTags?.length > 0) {
            row = document.createElement('tr');
            table.append(row);

            let tags = '';
            caasTags.forEach(tag => {
                if (tags.length > 0) {
                    tags += tag + ', ';
                } else {
                    tags += tag + '';
                }
            });

            td = document.createElement('td');
            td.innerHTML = 'Tags';
            row.append(td);
        
            td = document.createElement('td');
            td.innerHTML = tags;
            row.append(td);
        }
        if (entity_id) {
            row = document.createElement('tr');
            table.append(row);
        
            td = document.createElement('td');
            td.innerHTML = 'original_entity_id';
            row.append(td);        
        
            td = document.createElement('td');
            td.innerHTML = entity_id;
            row.append(td); 
        }        
        main.append(table);
    }

}

const createBreadCrumbs = (document, main) => {
    console.log('aye ARE THE BREADCRUMBS RUNNING????????????????????');
    // grab outerHTML from .feds-breadcrumbs-items and insert in table
    const breadcrumbs = document.querySelector('.feds-breadcrumbs-items');
    if (breadcrumbs) {
    console.log('CAN HAS BREAD?');

        table = document.createElement('table');
        row = document.createElement('tr');
        table.append(row);
        th = document.createElement('th');
        
        row.append(th);
        th.innerHTML = 'breadcrumbs';
        th.setAttribute('colspan', 1);
    
        row = document.createElement('tr');
        table.append(row);
    
        td = document.createElement('td');
        td.innerHTML = breadcrumbs.outerHTML;
        row.append(td);
    
        main.prepend(table);
    }
}

const extractImgFromPictures = (document, main) => {
    // replace picture elements with one img element
    const pictures = document.querySelectorAll('picture');
    if (pictures.length > 0) {
        pictures.forEach(picture => {
            const img = picture.querySelector('img');
            console.log('hello????')
            console.log(picture.outerHTML);
            if (img) {
                const imgElement = document.createElement('img');
                imgElement.src = img.src;
                console.log('img.src');
                console.log(img.src);
                imgElement.alt = 'alt';
                imgElement.title = img.title;
                imgElement.className = img.className;
                picture.parentNode.replaceChild(imgElement, picture);

                // picture.parentNode.insertAdjacentHTML('afterend', imgElement.outerHTML);
                // picture.remove(); 
                console.log('imgElement.outerHTML');
                console.log(imgElement.outerHTML);
                console.log(imgElement.innerHTML);
                console.log(imgElement);

            }
        });
    }
}


const createImgElementsFromImgEls = (document, main) => {
    const imgEls = document.querySelectorAll('img');
    if (imgEls.length > 0) {
        imgEls.forEach(imgEl => {
            const imgElement = document.createElement('img');
            imgElement.src = '';
            if (imgEl.src.includes('ec-prod.scene7.com')) {
                const url = imgEl.src.replace('https://ec-prod.scene7.com/is/image/ECPROD/', `https://business.adobe.com/content/dam/dx/us/en/customer-success-stories/${window.currentImportItem}/`);
                const urlSplit = url.split('?');
                if (urlSplit[1].includes('$png$')) {
                    imgElement.src = urlSplit[0] + '.png';
                    console.log('its a PNG!!!');
                    console.log( imgElement.src = urlSplit[0] + '.png');
                }
                if (urlSplit[1].includes('$pjpeg')) {
                    imgElement.src = urlSplit[0] + '.jpg';
                    console.log('its a JPT!!!');
                    console.log(imgElement.src = urlSplit[0] + '.jpg');
                }
                imgElement.alt = imgEl.alt;
                imgElement.title = imgEl.title;
                imgElement.className = imgEl.className;
                imgEl.parentNode.replaceChild(imgElement, imgEl);                
            }
        }
        );
    }
}




const createCardCollectionId = (cardCollectionId, cardCollectionContainer, document, main) => {
    if (cardCollectionContainer) {
        cardCollectionContainer.innerHTML = cardCollectionId;
        return cardCollectionContainer;

    }
}

const createMp4AndGifConsoleLog = (document, main) => {
    const mp4Tags = document.querySelectorAll('video');
    let mp4TagsString = '';
    if (mp4Tags.length > 0) {
        console.log('MP4 TAGS FOUND:');
        mp4Tags.forEach(tag => {
            const source = tag.querySelector('source');
            if (source.src.includes('.mp4')) {
                mp4TagsString += `https://business.adobe.com${source.src}, `;
                tag.remove();
            }
        });
        window.mp4TagsString = mp4TagsString;
    }
    const gifTags = document.querySelectorAll('img');
    let gifTagsString = '';
    if (gifTags.length > 0) {
        console.log('GIFS FOUND:');
        gifTags.forEach(tag => {
            if (tag.src.includes('.gif')) {
                gifTagsString += `https://business.adobe.com${tag.src}, `;
                tag.remove();
            }
        });
        window.gifTagsString = gifTagsString;
    }
}

export default {
    transform: ({ document, params }) => {
      
      createImgElementsFromImgEls(document);
      const main = document.querySelector('.page');
      createBreadCrumbs(document, main);

      const modal = document.querySelector('#featured-video');
      let modalName;
      if (document.querySelector('#featured-video-modalTitle')) {
        modalName = document.querySelector('#featured-video-modalTitle').innerHTML;
      }

      const cardCollectionContainer = document.querySelector('northstar-card-collection');
      const cardCollectionId = document.querySelector('northstar-card-collection')?.id?.split('-')[1];
      const cardCollection = createCardCollectionId(cardCollectionId, cardCollectionContainer, document, main);
      
      const u = new URL(params.originalURL);
    //   extractImgFromPictures(document, main);
      createMetadata(document, main);
      createMp4AndGifConsoleLog(document, main);

      WebImporter.DOMUtils.remove(document, [
        'header, footer'
       ]);

    // const marqueeStyleTag = document.querySelector('.title.NoMargin.heading-XL h1.cmp-title__text').closest('.flex').parentNode.parentNode.parentNode.querySelector('style').innerHTML;

    createMarquee(document, main, modal);
    // });
    const style = document.querySelectorAll('style');
    style.forEach((tag) => {
        tag.remove();
      });



    // console.log('data made it.', data);


    // const postJSON = fetchJson('https://www-author.corp.adobe.com/content/dx/us/en/customer-success-stories/abb-case-study/jcr:content.6.json').then((data) => {
    

        // console.log(findKeyValue(data, 'fileReference'));

        // createMarquee(document, main, mobile, tablet, desktop);

        // const style = document.querySelectorAll('style');
        // style.forEach((tag) => {
        //   tag.remove();
        // });
  
        WebImporter.DOMUtils.remove(document, [
            '.modalContainer, .globalnavheader'
           ]);
    
    // });      
       
    // console.log('the show goes on without youee');


    // var myHeaders = new Headers();
    // myHeaders.append("Authorization", "Basic bWlsby1kZXY6SFFSMmFVYUtZbU5OV2ZLek1qeDg=");
    // myHeaders.append("Cookie", "cq-authoring-mode=TOUCH; srvname=uw2010250063185_author_4502");
    
    // var requestOptions = {
    //   method: 'GET',
    //   headers: myHeaders,
    //   redirect: 'follow'
    // };
    
    // fetch("https://www-author.corp.adobe.com/content/dx/us/en/customer-success-stories/abb-case-study/jcr:content.4.json", requestOptions)
    //   .then(response => response.text())
    //   .then(result => console.log(result))
    //   .catch(error => console.log('error', error));    


      establishedStats(document); 

      reccomendedBlock(document, main, cardCollectionId);

      objectivesResultsBlock(document, main);

    //   createMarquee(document, main, modal);
      const modalContainer = processModal(document, main, modal, modalName);
      createQuoteBlocks(document, main);
      
      
      createContactReference(document, main);
      makeLinksAbsolute(document, main);

      createCaasMetadata(document, main);

        //    console.log('this is the way'); 
        //    console.log(u.pathname); 
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
    },

    /**
     * Return a path that describes the document being transformed (file name, nesting...).
     * The path is then used to create the corresponding Word document.
     * @param {String} url The url of the document being transformed.
     * @param {HTMLDocument} document The document
     */
    generateDocumentPath: async ({ document, url }) => {
        console.log(url);
        console.log(document);
      return new URL(url).pathname.replace(/\/$/, '');
    },
    
  }