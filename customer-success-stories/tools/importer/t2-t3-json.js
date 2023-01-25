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



// console.log('gimmie');
// for(var b in window) { 
//     if(window.hasOwnProperty(b)) console.log(b); 
//   }

// let data;
// data = await getJSON('https://www-author.corp.adobe.com/content/dx/us/en/customer-success-stories/abb-case-study/jcr:content.6.json');

// console.log( 'Mobile'); 
// console.log(findKeyValue(data, 'fileReferenceMobile'));
// const mobile = findKeyValue(data, 'fileReferenceMobile');
// console.log('Tablet');
// const tablet = findKeyValue(data, 'fileReferenceTablet');
// console.log(findKeyValue(data, 'fileReferenceTablet'));
// console.log('Desktop');
// const desktop = findKeyValue(data, 'fileReference');
// console.log(desktop); 
// console.log(typeof desktop);

import { setGlobals } from "../../../tools/importer/utils.js";

const DEFAULT_COLSPAN = 2;

let table = document.createElement('table');
let row = document.createElement('tr');
let th = document.createElement('th');
let td = document.createElement('td');
let tableHTML = table.outerHTML;

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

const createMarquee = async (document, main, modal) => {

    let data;
    data = await getJSON('https://www-author.corp.adobe.com/content/dx/us/en/customer-success-stories/abb-case-study/jcr:content.6.json');

    console.log('Mobile');
    console.log(findKeyValue(data, 'fileReferenceMobile'));
    const mobile = findKeyValue(data, 'fileReferenceMobile');
    console.log('Tablet');
    const tablet = findKeyValue(data, 'fileReferenceTablet');
    console.log(findKeyValue(data, 'fileReferenceTablet'));
    console.log('Desktop');
    const desktop = findKeyValue(data, 'fileReference');
    console.log(desktop);
    console.log(typeof desktop);


    const fullMobile = `https://business.adobe.com${mobile}`;
    const fullTablet = `https://business.adobe.com${tablet}`;
    const fullDesktop = `https://business.adobe.com${desktop}`;

    // console.log(`createMarquee hello: ${fullMobile} ${fullTablet} ${fullDesktop}`);

    // const styleTag = document.querySelector('.title.NoMargin.heading-XL h1.cmp-title__text').closest('.flex').parentNode.parentNode.parentNode.querySelector('style');
    let marquee = document.querySelector('.title.NoMargin.heading-XL h1.cmp-title__text').closest('.flex').parentNode.parentNode;

    // extract background urls from the css
    const extractBackgroundUrls = (css) => {
        const regex = /url\((.*?)\)/g;
        const matches = css.match(regex);
        // return matches;
        return matches.map(match => match.replace(/url\((.*?)\)/g, '$1'));
    }

    // const backgroundUrls = extractBackgroundUrls(styleTag.innerHTML);

    // let testy = backgroundUrls[0];
    // testy = encodeURI(testy);
    // testy = testy.replace(/%5C2f/g, '/').replace(/%5C26/g, '&').replace(/%20/g, '');

    // const mobileURL = encodeURI(backgroundUrls[0]).replace(/%5C2f/g, '/').replace(/%5C26/g, '&').replace(/%20/g, '');
    // const tabletURL = encodeURI(backgroundUrls[1]).replace(/%5C2f/g, '/').replace(/%5C26/g, '&').replace(/%20/g, '');
    // const desktopURL = encodeURI(backgroundUrls[2]).replace(/%5C2f/g, '/').replace(/%5C26/g, '&').replace(/%20/g, '');

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

    // if (styleTag.innerHTML.indexOf('color: #FFFFFF') > -1) {
    th.innerHTML = 'Marquee';
    // } else {
    //     th.innerHTML = 'Marquee (light)';
    // }
    th.setAttribute('colspan', 3);

    row = document.createElement('tr');
    table.append(row);

    // Background image.
    let td = document.createElement('td');
    // const backgroundURL = extractBackgroundImage(document);

    const theBg = String(marquee.style['background-image']);
    const rawBg = theBg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    const theImage = document.createElement('img');
    theImage.setAttribute('src', rawBg);

    // const marqueeImage = document.createElement('img');
    // marqueeImage.setAttribute('src', backgroundURL);


    // const mobileImg = document.createElement('img');
    // mobileImg.setAttribute('src', fullMobile);

    // const tabletImg = document.createElement('img');
    // tabletImg.setAttribute('src', fullTablet);

    // const desktopImg = document.createElement('img');
    // desktopImg.setAttribute('src', fullDesktop);


    td.innerHTML = mobileImg.outerHTML;
    row.append(td);

    // row = document.createElement('tr');
    // table.append(row);





    td = document.createElement('td');
    td.innerHTML = tabletImg.outerHTML;
    row.append(td);


    td = document.createElement('td');
    td.innerHTML = desktopImg.outerHTML;
    row.append(td);




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
                newCta.setAttribute('href', `https://business.adobe.com/customer-success-stories/fragments/CSSModals/${modalName.toLowerCase().replace(/\s+/g, '-')}#watch-now`);
                newCta.append('Watch Now');
                const em = document.createElement('em');
                const strong = document.createElement('strong');
                em.append(strong);
                strong.append(newCta);
                td.append(em);
            }
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

    columnItems?.forEach((columnItem) => {
        td = document.createElement('td');
        td.innerHTML = columnItem.innerHTML;
        row.append(td);
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
            th.innerHTML = 'Blockquote (center, borders)';


            if (quoteImage) {
                row = document.createElement('tr');
                table.append(row);
                td = document.createElement('td');
                td.innerHTML = quoteImage.outerHTML;
                row.append(td);
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

const reccomendedBlock = (document, main) => {

    if (document.querySelector('.cardcollection')) {
        const reccomededBlocks = document.querySelector('.cardcollection');

        const h3s = document.querySelectorAll('h3');
        h3s.forEach((h3) => {
            if (h3.innerHTML.indexOf('Recommended for you') > -1) {
                const seperator = '---';
                h3.insertAdjacentHTML('beforebegin', seperator);
            }
        });

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
        td.innerHTML = 'XXL Spacing, data-hidden, heading-center';
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


        const caasValues = document.createElement('ul');
        caasValues.classList.add('raw-caas-values');
        const dataAttribs = document.querySelector('northstar-card-collection').dataset;
        for (var d in dataAttribs) {
            const caasValuesItem = document.createElement('li');
            caasValuesItem.append(`${d}: ${dataAttribs[d]}`);
            caasValues.append(caasValuesItem);
        }
        reccomededBlocks.insertAdjacentHTML('afterend', caasValues.outerHTML)


        const fragmentLink = document.createElement('a');
        fragmentLink.href = 'https://main--bacom--adobe.hlx.page/customer-success-stories/fragments/recommended-for-you';
        fragmentLink.append('https://main--bacom--adobe.hlx.page/customer-success-stories/fragments/recommended-for-you');

        reccomededBlocks.closest('.xf').classList.remove('.xf');
        reccomededBlocks.insertAdjacentHTML('afterend', fragmentLink.outerHTML)

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
        contactLink.href = 'https://main--bacom--adobe.hlx.page/customer-success-stories/fragments/contact-footer-number';
        contactLink.append('https://main--bacom--adobe.hlx.page/customer-success-stories/fragments/contact-footer-number');
    } else {
        contactLink.href = 'https://main--bacom--adobe.hlx.page/customer-success-stories/fragments/contact-footer';
        contactLink.append('https://main--bacom--adobe.hlx.page/customer-success-stories/fragments/contact-footer');
    }
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
    td.innerHTML = 'heading-center';
    row.append(td);

    const seperator = '--- <br />';
    contactXf.insertAdjacentHTML('afterend', seperator)


    contactXf.insertAdjacentHTML('afterend', table.outerHTML);

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
    const swan = document.querySelector('meta[name="data-event-swan-sessions-endpoint"]')?.content;
    const jarvis = document.querySelector('meta[name="data-jarvis-demandbase-enabled"]')?.content;
    const ogImage = document.querySelector('meta[property="og:image"]')?.content;

    table = null;
    table = document.createElement('table');
    row = document.createElement('tr');
    table.append(row);
    th = document.createElement('th');
    row.append(th);
    th.innerHTML = 'metadata';

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

    if (swan) {
        row = document.createElement('tr');
        table.append(row);

        td = document.createElement('td');
        td.innerHTML = 'data-event-swan-sessions-endpoint';
        row.append(td);

        td = document.createElement('td');
        td.innerHTML = swan;
        row.append(td);
    }
    if (jarvis) {
        row = document.createElement('tr');
        table.append(row);

        td = document.createElement('td');
        td.innerHTML = 'data-jarvis-demandbase-enabled';
        row.append(td);

        td = document.createElement('td');
        td.innerHTML = jarvis;
        row.append(td);
    }
    if (ogImage) {
        row = document.createElement('tr');
        table.append(row);

        td = document.createElement('td');
        td.innerHTML = 'og:image';
        row.append(td);

        td = document.createElement('td');
        td.innerHTML = ogImage;
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
                link.href = link.href.replace('.html', '');
                link.href = `https://business.adobe.com/customer-success-stories${link.href}`;
            }
        });
    }
}
// somefunction();

const getJSON = async (url) => {
    const response = await fetch(url, {
        headers: {
            'Authorization': 'Basic ' + btoa('milo-dev:HQR2aUaKYmNNWfKzMjx8')
        }
    });
    const data = await response.json();
    return data;
}

export default {

     transformDOM: async ({ document, params, test }) => {
        await setGlobals(params.originalURL);
        
 
        getJSON('https://www-author.corp.adobe.com/content/dx/us/en/customer-success-stories/abb-case-study/jcr:content.6.json').then(data => {
            console.log('the baaaaaaaaby');
        });


       setTimeout(() => {
        console.log('5 seconds has went by...');



        console.log(test);
        const main = document.querySelector('.page');
        const modal = document.querySelector('#featured-video');
        let modalName;
        if (document.querySelector('#featured-video-modalTitle')) {
            modalName = document.querySelector('#featured-video-modalTitle').innerHTML;
        }

        function somefunction() {
            console.log('woo this is the thing....');
        }
        const u = new URL(params.originalURL);


        // const getJSON = async (url) => {
        //     const response = await fetch(url, {
        //         headers: {
        //             'Authorization': 'Basic ' + btoa('milo-dev:HQR2aUaKYmNNWfKzMjx8')
        //         }
        //     });
        //     const data = await response.json();
        //     return data;
        // }
        // const data = await getJSON('https://www-author.corp.adobe.com/content/dx/us/en/customer-success-stories/abb-case-study/jcr:content.6.json')
        
            //   createMetadata(document, main);

            //   WebImporter.DOMUtils.remove(document, [
            //     'header, footer'
            //    ]);

            // const fetchJson = async (url) => {
            //     const response = await fetch(url, {
            //         headers: {
            //             'Authorization': 'Basic ' + btoa('milo-dev:HQR2aUaKYmNNWfKzMjx8')  
            //         }
            //     });
            //     const data = await response.json();
            //     return data;
            // } 
            console.log('the baby');


    const marqueeStyleTag = document.querySelector('.title.NoMargin.heading-XL h1.cmp-title__text').closest('.flex').parentNode.parentNode.parentNode.querySelector('style').innerHTML;
    // const marqueeStyleTag = 'test'params;
    // console.log(`marqueeStyleTag: ${marqueeStyleTag.innerHTML}`);
    // console.log('data' + data)

    // console.log('im on the inside of the function');
    // console.log(marqueeStyleTag);
    // createMarquee(document, main, modal, mobile, tablet, desktop);
    // createMarquee(document, main, modal);

    console.log('the new BATHWATsssER - wait, are we here???');


    // });
    // const style = document.querySelectorAll('style');
    // style.forEach((tag) => {
    //     tag.remove();
    //   });
    // console.log('data made it.', data);


    // const postJSON = fetchJson('https://www-author.corp.adobe.com/content/dx/us/en/customer-success-stories/abb-case-study/jcr:content.6.json').then((data) => {


    // console.log(findKeyValue(data, 'fileReference'));


    WebImporter.DOMUtils.remove(document, [
        '.modalContainer, .globalnavheader'
    ]);

    // });      


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


    //    establishedStats(document); 

    //   reccomendedBlock(document, main);

    //   objectivesResultsBlock(document, main);

    const modalContainer = processModal(document, main, modal, modalName);
    //   createQuoteBlocks(document, main);


    //   createContactReference(document, main);
    //   makeLinksAbsolute(document, main);
    return {
        element: main,
        path: u.pathname.replace('.html', ''),
    };
    // if(modalName) {
    //     return [{
    //         element: main,
    //         path: u.pathname.replace('.html', ''),
    //     }, {
    //         element: modalContainer,
    //         path: `fragments/CSSModals/${modalName.toLowerCase().replace(/\s+/g, '-')}`,
    //     }];
    // } else {
    //     return [{
    //         element: main,
    //         path: u.pathname.replace('.html', ''),
    //     }];
    // }











       }, 2000);

},

// /**
//  * Return a path that describes the document being transformed (file name, nesting...).
//  * The path is then used to create the corresponding Word document.
//  * @param {String} url The url of the document being transformed.
//  * @param {HTMLDocument} document The document
//  */
// generateDocumentPath: ({ document, url }) => {
//     console.log(url);
//     console.log(document);
//     return new URL(url).pathname.replace(/\/$/, ''); 
// },
    
  }