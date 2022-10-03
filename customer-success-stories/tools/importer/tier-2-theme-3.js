
const DEFAULT_COLSPAN = 2;

let table = document.createElement('table');
let row = document.createElement('tr');
let th = document.createElement('th');
let td = document.createElement('td');
let tableHTML = table.outerHTML;

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
const t2t3createMarquee = (document, main, modal) => {



    let mobile = findKeyValue(window.data, 'fileReferenceMobile');
    let tablet = findKeyValue(window.data, 'fileReferenceTablet');
    let desktop = findKeyValue(window.data, 'fileReference');

    if (mobile.includes('logo')) {
        mobile = null;
    };
    if (tablet.includes('logo')) {
        tablet = null;
    };
    if (desktop.includes('logo')) {
        desktop = null;
    };



    const fullMobile = `https://business.adobe.com${mobile}`;
    const fullTablet = `https://business.adobe.com${tablet}`;
    const fullDesktop = `https://business.adobe.com${desktop}`;


    const styleTag = document.querySelector('.title.NoMargin.heading-XL h1.cmp-title__text').closest('.flex').parentNode.parentNode.parentNode.querySelector('style');
    let marquee = document.querySelector('.title.NoMargin.heading-XL h1.cmp-title__text').closest('.flex').parentNode.parentNode;
    const extractBackgroundUrls = (css) => {
        const regex = /url\((.*?)\)/g;
        const matches = css.match(regex);
        // return matches;
        return matches.map(match => match.replace(/url\((.*?)\)/g, '$1'));
    }

    const mobileImg = document.createElement('img');
    mobileImg.setAttribute('src', fullMobile);

    const tabletImg = document.createElement('img');
    tabletImg.setAttribute('src', fullTablet);

    const desktopImg = document.createElement('img');
    desktopImg.setAttribute('src', fullDesktop);

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

    const tableHTML = table.outerHTML;
    marquee.insertAdjacentHTML('afterend', tableHTML)

    marquee.remove();
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
let ConvertStringToHTML = function (str) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(str, 'text/html');
    return doc.body;
};
const t2t3EstablishedStats = (document) => {
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

const t2t3ObjectivesResultsBlock = (document, main) => {
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

const t2t3CreateQuoteBlocks = (document, main) => {
    const h3s = document.querySelectorAll('h3');
    h3s.forEach((h3) => {
        if ((h3.innerHTML.indexOf('“') > -1) && (h3.closest('.dexter-FlexContainer-Items')?.querySelector('.horizontalRule'))) {
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

const t2t3ReccomendedBlock = (document, main, cardCollectionId) => {

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
        for (var d in dataAttribs) {
            const caasValuesItem = document.createElement('li');
            caasValuesItem.append(`${d}: ${dataAttribs[d]}`);
            caasValues.append(caasValuesItem);
        }
        const fragmentLink = document.createElement('a');
        fragmentLink.href = `https://main--bacom--adobecom.hlx.page/fragments/customer-success-stories/cards/${cardCollectionId}`;
        fragmentLink.append(`https://main--bacom--adobecom.hlx.page/fragments/customer-success-stories/cards/${cardCollectionId}`);

        reccomededBlocks.closest('.xf').classList.remove('.xf');
        reccomededBlocks.insertAdjacentHTML('afterend', `${fragmentLink.outerHTML} <br /> <br />`);

        reccomededBlocks.remove();

    }

};

const t2t3ProcessModal = (document, main, modal, modalName) => {
    if (modal) {
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

const t2g3CreateContactReference = (document, main) => {
    const contactXf = document.querySelector('.xfreference:last-of-type');
    let contactLink = document.createElement('a');

    if (contactXf.querySelector('svg')) {
        contactLink.href = 'https://main--bacom--adobecom.hlx.page/fragments/customer-success-stories/contact-footer-number';
        contactLink.append('https://main--bacom--adobecom.hlx.page/fragments/customer-success-stories/contact-footer-number');
    } else {
        contactLink.href = 'https://main--bacom--adobecom.hlx.page/fragments/customer-success-stories/contact-footer';
        contactLink.append('https://main--bacom--adobecom.hlx.page/fragments/customer-success-stories/contact-footer');
    }
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

const t2t3CreateMetadata = (document, main) => {
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

const t2g3MakeLinksAbsolute = (document, main) => {
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

const t2g3CreateCaasMetadata = (document, main) => {

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

const t2g3CreateBreadCrumbs = (document, main) => {
    const breadcrumbs = document.querySelector('.feds-breadcrumbs-items');
    if (breadcrumbs) {
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
    const pictures = document.querySelectorAll('picture');
    if (pictures.length > 0) {
        pictures.forEach(picture => {
            const img = picture.querySelector('img');
            if (img) {
                const imgElement = document.createElement('img');
                imgElement.src = img.src;
                imgElement.alt = 'alt';
                imgElement.title = img.title;
                imgElement.className = img.className;
                picture.parentNode.replaceChild(imgElement, picture);

            }
        });
    }
}


const t2g3CreateImgElementsFromImgEls = (document, main) => {
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

const t2t3CreateCardCollectionId = (cardCollectionId, cardCollectionContainer, document, main) => {
    if (cardCollectionContainer) {
        cardCollectionContainer.innerHTML = cardCollectionId;
        return cardCollectionContainer;

    }
}

const t2t3CreateMp4AndGifConsoleLog = (document, main) => {
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
    extractBackgroundImage,
    t2t3createMarquee,
    createIconBlock,
    ConvertStringToHTML,
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
    extractImgFromPictures,
    t2g3CreateImgElementsFromImgEls,
    t2t3CreateCardCollectionId,
    t2t3CreateMp4AndGifConsoleLog,
};