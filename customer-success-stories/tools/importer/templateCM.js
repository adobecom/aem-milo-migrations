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

import convertTags from './convertTags.js';

const DEFAULT_COLSPAN = 2;
let table = document.createElement('table');
let row = document.createElement('tr');
let th = document.createElement('th');
let td = document.createElement('td');
let tableHTML = table.outerHTML;

let fragmentBaseUrl = '';

const setFragmentBaseUrl = () => {
    if (window.data.locale !== 'en_us') {
        fragmentBaseUrl = `https://main--bacom--adobecom.hlx.page/${window.data.locale}/fragments/customer-success-stories/`;
    } else {
        fragmentBaseUrl = 'https://main--bacom--adobecom.hlx.page/fragments/customer-success-stories/';
    }
}

const findKeyValue = (obj, keyName) => {
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

const createMarquee = (document, main, modal) => {
    let mobile = findKeyValue(window.data, 'fileReferenceMobile');
    let tablet = findKeyValue(window.data, 'fileReferenceTablet');
    let desktop = findKeyValue(window.data, 'fileReference');
    if (mobile === tablet && tablet === desktop) {
        desktop = null;
        tablet = null;
    }

    const fullMobile = `https://business.adobe.com${mobile}`;
    const fullTablet = `https://business.adobe.com${tablet}`;
    const fullDesktop = `https://business.adobe.com${desktop}`;

    const mobileImg = document.createElement('img');
    mobileImg.setAttribute('src', fullMobile);

    const tabletImg = document.createElement('img');
    tabletImg.setAttribute('src', fullTablet);

    const desktopImg = document.createElement('img');
    desktopImg.setAttribute('src', fullDesktop);


    const styleTag = document.querySelector('.position').querySelector('style');
    let marquees = document.querySelectorAll('#root_position');
    if (document.getElementById('root_content_flex')) {
        marquees = document.querySelectorAll('#root_content_flex');
    }

    marquees?.forEach((marquee) => {
        if (document.getElementById('root_content_flex')) {
            marquee.querySelector('img')?.remove();
        }
        const heading = marquee.querySelector('h1');
        const bodyText = marquee.querySelector('h3');
        const image = marquee.querySelector('img');
        const cta = marquee.querySelector('.dexter-Cta a');
        const table = document.createElement('table');
        let row = document.createElement('tr');
        table.append(row);
        const th = document.createElement('th');
        row.append(th);
        if (styleTag.innerHTML.indexOf('color: #FFFFFF') > -1) {
            th.innerHTML = 'Marquee';
        } else {
            th.innerHTML = 'Marquee (light)';
        }
        th.setAttribute('colspan', 3);

        row = document.createElement('tr');
        table.append(row);

        let tdColSpan = 1;
        if (mobile == null && tablet == null && desktop == null) {
            tdColSpan = 3;
        } else if (mobile == null && tablet == null) {
            tdColSpan = 3;
        } else if (mobile == null && desktop == null) {
            tdColSpan = 3;
        } else if (tablet == null && desktop == null) {
            tdColSpan = 3;
        } else if (mobile == null) {
            tdColSpan = 2;
        } else if (tablet == null) {
            tdColSpan = 2;
        } else if (desktop == null) {
            tdColSpan = 2;
        }

        if (mobile !== null) {
            td = document.createElement('td');
            td.innerHTML = mobileImg.outerHTML;
            td.setAttribute('colspan', tdColSpan);
            row.append(td);
        }

        if (tablet !== null) {
            td = document.createElement('td');
            td.innerHTML = tabletImg.outerHTML;
            td.setAttribute('colspan', tdColSpan);
            row.append(td);
        }

        if (desktop !== null) {
            td = document.createElement('td');
            td.innerHTML = desktopImg.outerHTML;
            td.setAttribute('colspan', tdColSpan);
            row.append(td);
        }

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
            const bodyTextP = document.createElement('p');
            bodyTextP.innerHTML = bodyText.innerHTML;
            td.append(bodyTextP);
        }
        if (cta) {
            let iconText = null;
            let icon = '';

            if (modal) {
                const newCta = document.createElement('a');
                let modalName;
                if (document.querySelector('#featured-video-modalTitle')) {
                    modalName = document.querySelector('#featured-video-modalTitle').innerHTML;
                }
                if (cta.querySelector('svg')) {
                    icon = cta.querySelector('svg').querySelector('use').getAttribute('xlink:href');
                }
                if (icon === '#spectrum-icon-18-Play') {
                    iconText = ':milo-play:';
                    newCta.append(`:milo-play: ${cta.textContent}`);
                } else {
                    newCta.append(cta.textContent);
                }
                newCta.setAttribute('href', `${fragmentBaseUrl}modals/${modalName.toLowerCase().replace(/\s+/g, '-')}#modal`);

                if (cta.classList.contains('button_cta-outlineWhite')) {
                    const em = document.createElement('em');
                    em.append(newCta);
                    td.append(em);
                } else if (cta.classList.contains('spectrum-Button--cta') && !cta.classList.contains('button_cta-outlineWhite')) {
                    const strong = document.createElement('strong');
                    strong.append(newCta);
                    td.append(strong);
                } else {
                    td.append(newCta);
                }
            } else {
                td.append(cta);
            }
        }
        const seperator = '--- <br />';
        marquee.insertAdjacentHTML('afterend', seperator)

        const tableHTML = table.outerHTML;
        marquee.insertAdjacentHTML('afterend', tableHTML)
        marquee.remove();

    });
};


const createIconBlock = (document, main) => {
    const icons = document.querySelectorAll('.aem-GridColumn:nth-child(3) .dexter-FlexContainer-Items > div > div:first-child img');
    if (!icons) {
        return; 
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

const establishedStats = (document) => {
    const columnItems = document.querySelectorAll('.aem-GridColumn:nth-child(3) .dexter-FlexContainer-Items > div:nth-child(2) > div > div > div > div');
    const mainContainer = document.querySelector('.aem-GridColumn:nth-child(3) .dexter-FlexContainer-Items > div:nth-child(2) > div > div > div > div')?.closest('.aem-Grid');

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
    const icon = document.querySelector('.aem-GridColumn:nth-child(3) .dexter-FlexContainer-Items img');

    td.innerHTML = icon.outerHTML;
    row.append(td);

    icon.remove();

    row = document.createElement('tr');
    table.append(row);

    let count = 0;
    columnItems?.forEach((columnItem) => {
        
        const brs = columnItem.querySelectorAll('br');
        const stringyCol = String(columnItem.innerHTML);
        const stringyColSplit = stringyCol.split('<br>');
        const h1 = columnItem.querySelector('h1');

        if (h1) {
            const h2 = document.createElement('h2');
            h2.append(h1.textContent);
            h1.insertAdjacentHTML('afterend', h2.outerHTML);
            h1.remove();
        }
        
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
    mainContainer?.insertAdjacentHTML('afterend', seperator)

    const tableHTML = table.outerHTML;
    mainContainer?.insertAdjacentHTML('afterend', tableHTML)
    mainContainer?.remove();
}

const objectivesResultsBlock = (document, main) => {

    const mainContainer = document.querySelector('.position.aem-GridColumn ~ .aem-GridColumn:nth-child(4)');
    const theBg = String(mainContainer.querySelector('.dexter-Position').style['_values']['background-image']);
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


    table = document.createElement('table');
    row = document.createElement('tr');
    table.append(row);
    th = document.createElement('th');
    row.append(th);
    th.innerHTML = 'Columns (contained)';
    th.setAttribute('colspan', DEFAULT_COLSPAN);

    row = document.createElement('tr');
    table.append(row);

    const columnItems = document.querySelectorAll('.position.aem-GridColumn ~ .aem-GridColumn:nth-child(4) .dexter-FlexContainer-Items > div >div >div ')

    let count = 0;
    columnItems?.forEach((columnItem) => {
        if (count > 0) {
            td = document.createElement('td');
            td.innerHTML = columnItem.innerHTML;
            row.append(td);
        }
        count++
    });

    tableHTML = table.outerHTML;
    mainContainer.insertAdjacentHTML('afterend', tableHTML)
    mainContainer.remove();

}

const createQuoteBlocks = (document, main) => {
    const h3s = document.querySelectorAll('h3');
    h3s.forEach((h3) => {
        if (h3.innerHTML.indexOf('“') > -1) {
            let theQuote = h3.closest('div');
            let theQuoteContainer = h3.parentNode.parentNode;

            const b = theQuote.querySelector('b');
            const p = document.createElement('p');
            p.append(b.textContent);
            const b2 = document.createElement('b');
            b2.append(p.textContent);
            p.innerHTML = b2.outerHTML;

            b.insertAdjacentHTML('afterend', p.outerHTML);
            b.remove();

            table = document.createElement('table');
            row = document.createElement('tr');
            table.append(row);
            th = document.createElement('th');
            row.append(th);
            th.innerHTML = 'Quote (contained, center, borders)';

            row = document.createElement('tr');
            table.append(row);

            td = document.createElement('td');
            td.innerHTML = theQuote.outerHTML;
            row.append(td);

            tableHTML = table.outerHTML;
            theQuoteContainer.insertAdjacentHTML('afterend', tableHTML);
            theQuote.remove();
        }
    });
}

const reccomendedBlock = (document, main, cardCollectionId) => {

    if (document.querySelector('.cardcollection')) {
        const reccomededBlocks = document.querySelector('.cardcollection');

        const h3s = document.querySelectorAll('h3');
        h3s.forEach((h3) => {
            if (h3.innerHTML.indexOf('Recommended for you') > -1 ||
            h3.innerHTML.indexOf('Weitere Kundenreferenzen.') > -1 ||
            h3.innerHTML.indexOf('関連トピックス') > -1 ||
            h3.innerHTML.indexOf('関連するユーザー事例') > -1) {
                const seperator = '---';
                h3.insertAdjacentHTML('beforebegin', seperator);
            }
        });

        const h2s = document.querySelectorAll('h2');
        h2s.forEach((h2) => {
            if (h2.innerHTML.indexOf('Recommended for you') > -1 ||
            h2.innerHTML.indexOf('Weitere Kundenreferenzen.') > -1 ||
            h2.innerHTML.indexOf('関連トピックス') > -1 ||
            h2.innerHTML.indexOf('関連するユーザー事例') > -1) {
                const seperator = '---';
                h2.insertAdjacentHTML('beforebegin', seperator);
            }
        });

        const seeAllCustomerStories = document.querySelectorAll('a');
        seeAllCustomerStories.forEach((seeAllCustomerStory) => {
            if (seeAllCustomerStory.innerHTML.indexOf('See all customer stories') > -1 ||
                seeAllCustomerStory.innerHTML.indexOf('View all customer stories') > -1 ||
                seeAllCustomerStory.innerHTML.indexOf('その他の関連トピックスを見る') > -1 ||
                seeAllCustomerStory.innerHTML.indexOf('Alle Kundenreferenzen anzeigen') > -1) {
                seeAllCustomerStory.remove();
            }
        });

        const link = document.createElement('a');

        if (window.data.locale === 'jp') {
            link.innerHTML = 'その他の関連トピックスを見る';
            link.setAttribute('href', 'https://business.adobe.com/jp/customer-success-stories/index');
        } else if (window.data.locale === 'de') {
            link.innerHTML = 'Alle Kundenreferenzen anzeigen';
            link.setAttribute('href', 'https://business.adobe.com/de/customer-success-stories/index');
        } else {
            link.innerHTML = 'See all customer stories';
            link.setAttribute('href', 'https://business.adobe.com/customer-success-stories/index');
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
        td.innerHTML = 'XXL Spacing, center';
        row.append(td);

        row = document.createElement('tr');
        table.append(row);

        td = document.createElement('td');
        td.innerHTML = 'background';
        row.append(td);

        td = document.createElement('td');
        td.innerHTML = '#F8F8F8';
        row.append(td);

        tableHTML = table.outerHTML;
        reccomededBlocks.insertAdjacentHTML('afterend', tableHTML)

        reccomededBlocks.insertAdjacentHTML('afterend', link.outerHTML);


        const caasValues = document.createElement('ul');
        caasValues.classList.add('raw-caas-values');
        const dataAttribs = document.querySelector('northstar-card-collection').dataset;
        for (var d in dataAttribs) {
            const caasValuesItem = document.createElement('li');
            caasValuesItem.append(`${d}: ${dataAttribs[d]}`);
            caasValues.append(caasValuesItem);
        }

        const fragmentLink = document.createElement('a');
        fragmentLink.href = `${fragmentBaseUrl}cards/${cardCollectionId}`;
        fragmentLink.append(`${fragmentBaseUrl}cards/${cardCollectionId}`);

        reccomededBlocks.closest('.xf').classList.remove('.xf');
        reccomededBlocks.insertAdjacentHTML('afterend', `${fragmentLink.outerHTML} <br /> <br />`);

        reccomededBlocks.remove();

    }

};

const processModal = (document, main, modal, modalName) => {
    if (modal) {
        const videoSrc = modal.querySelector('iframe').getAttribute('data-video-src');
        const videoLink = document.createElement('a');
        videoLink.setAttribute('src', videoSrc);
        videoLink.append(`${String(videoSrc)}`);
        modal.insertAdjacentHTML('afterend', videoLink);
        modal.remove();
        return videoLink;
    }
};

const encodeURI = (uri) => {
    return encodeURIComponent(uri);
}
const createContactReference = (document, main) => {
    const contactXf = document.querySelector('.xfreference:last-of-type');
    let contactLink = document.createElement('a');

    if (contactXf?.querySelector('svg')) {
        contactLink.href = `${fragmentBaseUrl}contact-footer-number`;
        contactLink.append(`${fragmentBaseUrl}contact-footer-number`);
    } else {
        contactLink.href = `${fragmentBaseUrl}contact-footer`;
        contactLink.append(`${fragmentBaseUrl}contact-footer`);
    }
    contactXf?.insertAdjacentHTML('afterend', contactLink.outerHTML);
    contactXf?.remove();
};

const createMetadata = (document, main) => {
    const robots = document.querySelector('meta[name="robots"]')?.content;
    const desc = document.querySelector('meta[name="description"]')?.content;
    let keywords = document.querySelector('meta[name="keywords"]')?.content;
    const serpContentCase = document.querySelector('meta[name="serp-content-type"]')?.content;
    const pageCreatedAt = document.querySelector('meta[name="pageCreatedAt"]')?.content;
    const translated = document.querySelector('meta[name="translated"]')?.content;
    const publishDate = document.querySelector('meta[name="publishDate"]')?.content;
    const productJcrID = document.querySelector('meta[name="productJcrID"]')?.content;
    const primaryProductName = document.querySelector('meta[name="primaryProductName"]')?.content;
    const ogImage = document.querySelector('meta[property="og:image"]')?.content;
    const pageTitle = document.querySelector('meta[property="og:title"]')?.content;

    table = null;
    table = document.createElement('table');
    row = document.createElement('tr');
    table.append(row);
    th = document.createElement('th');
    row.append(th);
    th.innerHTML = 'metadata';
    th.setAttribute('colspan', DEFAULT_COLSPAN);

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
        keywords = keywords.replaceAll(',', ', ');

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
        date = date[0].split('-');
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
    const cqTags = findKeyValue(window.data, 'cq:tags');
    const logoImage = findKeyValue(window.data, 'logoImage');
    const entity_id = document.querySelector('meta[name="entity_id"]')?.content;

    const caasTags = cqTags?.filter(tag => tag.includes('caas:'));
    const adobeEnterprise = cqTags?.filter(tag => tag.includes('adobe-com-enterprise:'));

    const newTags = convertTags(JSON.stringify(cqTags).replace('[', '').replace(']', '').replace(/"/g, '')).split(',');

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
            td.innerHTML = 'title';
            row.append(td);

            td = document.createElement('td');
            td.innerHTML = cardTitle;
            row.append(td);
        }

        if (cardDate) {
            row = document.createElement('tr');
            table.append(row);

            td = document.createElement('td');
            td.innerHTML = 'created';
            row.append(td);

            td = document.createElement('td');
            td.innerHTML = cardDate;
            row.append(td);
        }

        if (altCardImageText) {
            row = document.createElement('tr');
            table.append(row);

            td = document.createElement('td');
            td.innerHTML = 'cardImageAltText';
            row.append(td);

            td = document.createElement('td');
            td.innerHTML = altCardImageText;
            row.append(td);
        }

        if (cardImagePath) {
            let image = document.createElement('img');
            image.setAttribute('src', cardImagePath);

            row = document.createElement('tr');
            table.append(row);

            td = document.createElement('td');
            td.innerHTML = 'cardImage';
            row.append(td);

            td = document.createElement('td');
            td.innerHTML = image.outerHTML;
            row.append(td);
        }

        if (logoImage) {
            let image = document.createElement('img');
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

        if (newTags?.length > 0) {
            row = document.createElement('tr');
            table.append(row);

            let tags = '';
            newTags.forEach(tag => {
                tags += tag + ', ';
            });
            tags = tags.slice(0, -2);

            td = document.createElement('td');
            td.innerHTML = 'Tags';
            row.append(td);

            td = document.createElement('td');
            td.innerHTML = tags;
            row.append(td);
        }

        row = document.createElement('tr');
        table.append(row);

        td = document.createElement('td');
        td.innerHTML = 'primaryTag';
        row.append(td);

        td = document.createElement('td');
        td.innerHTML = 'caas:content-type/customer-story';
        row.append(td);

        main.append(table);
    }
}

const createImgElementsFromImgEls = (document) => {
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
                }
                if (urlSplit[1].includes('$pjpeg')) {
                    imgElement.src = urlSplit[0] + '.jpg';
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


const createBreadCrumbs = (document, main) => {
    const breadcrumbs = document.querySelector('.feds-breadcrumbs-items');
    let fullBreadcrumbs = false;
    if (breadcrumbs) {
        const breadcrumbsItems = breadcrumbs.querySelectorAll('li');
        if (breadcrumbsItems.length > 0) {
            breadcrumbsItems.forEach(breadcrumbItem => {
                if (breadcrumbItem.innerText === 'Customer Success Stories') {
                    fullBreadcrumbs = true;
                }
            });
        }
        if (breadcrumbsItems.length === 3) {
            fullBreadcrumbs = true;
        }        
    }

    if (breadcrumbs && fullBreadcrumbs) {
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
    } else {
        let breadcrumbsHTML = '';
        const pageTitle = findKeyValue(window.data, 'jcr:title');

        if (window.data.locale !== 'en_us') {
            breadcrumbsHTML = `
            <ul>
                <li>
                    <a href="https://www.adobe.com/${window.data.locale}/">Home</a>
                </li>
                <li>
                    <a href="https://business.adobe.com/${window.data.locale}/customer-success-stories/">Customer Success Stories</a>
                </li>
                <li>
                    <span>${pageTitle}</span>
                </li>
            </ul>`;
        } else {
            breadcrumbsHTML = `
            <ul>
                <li>
                    <a href="https://www.adobe.com/jp/">Home</a>
                </li>
                <li>
                    <a href="https://business.adobe.com/jp/customer-success-stories/">Customer Success Stories</a>
                </li>
                <li>
                    <span>${pageTitle}</span>
                </li>
            </ul>`;
        }
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
        td.innerHTML = breadcrumbsHTML;
        row.append(td);

        main.prepend(table);   
    }     
}


const createMp4AndGifConsoleLog = (document, main) => {
    const mp4Tags = document.querySelectorAll('video');
    let mp4TagsString = '';
    if (mp4Tags.length > 0) {
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
        gifTags.forEach(tag => {
            if (tag.src.includes('.gif')) {
                gifTagsString += `https://business.adobe.com${tag.src}, `;
                tag.remove();
            }
        });
        window.gifTagsString = gifTagsString;
    }
}

export {
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
    setFragmentBaseUrl,
}
