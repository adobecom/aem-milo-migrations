
BACOM - Franklin Imports
===



## Good To Know

### Bacom

* Import Code (initiated by adobe.com team, taken over by AEM engineering early 2023)
  https://github.com/adobecom/aem-milo-migrations

* Bacom Sharepoint
  https://adobe.sharepoint.com/:f:/r/sites/adobecom/Shared%20Documents/bacom?csf=1&web=1&e=tmG9Kv

* Specific setup required to make bacom pages work in the importer:
  * CORS extension: https://wiki.corp.adobe.com/pages/viewpage.action?spaceKey=WP4&title=Import+Tool%3A+How-to
  * custom referer for FaaS forms (https://apps.enterprise.adobe.com => https://business.adobe.com)
  * parsing metadata requires access to this [AEM Author instance](https://www-author.corp.adobe.com/sites.html/content), check that you can access it from your machine
  > Tip: put these extensions and settings in a profile in Chrome to avoid having to disable/enable them

### Franklin Importer

* guidelines - reading these guidelines keeps the RTFM away! 😉  
  https://github.com/adobe/helix-importer-ui/blob/main/importer-guidelines.md

* In `tranform` / `transformDOM` importer functions you get a **JSDOM** version of the original document 
  (not an issue but some CSS value are not computed + objects are not explorable in the web console)!

* Only use existing Milo blocks (no code added to https://github.com/adobecom/bacom)

### Milo

* Blocks Samples
  * https://main--milo--adobecom.hlx.page/docs/library/blocks/marquee (`/blocks/<BLOCK_NAME>`)
  * https://main--milo--adobecom.hlx.page/docs/library/blocks/marquee?view-doc-source=true (Franklin standard feature: displays Word representation in a new window)

* Consonant Design System  
  https://consonant.adobe.com/1975e5ba1/v/32165/p/03e00a-aside/b/5192be  
  Can help taking decisions about best Milo block to use (ex. differences between a Marquee and a Media)


## BACOM Page Types we have to Import

### Gated Offer (also applies to Webinar)

#### Example

* original: https://business.adobe.com/uk/resources/ebooks/the-complete-guide-to-agile-marketing.html
* imported: https://main--bacom--adobecom.hlx.page/drafts/acapt/MWPW-127382-gated-offer/uk/resources/ebooks/the-complete-guide-to-agile-marketing

#### Pros / Cons for using Franklin Importer

    ++  Simple layout
    ++  Few content
    ++  Big set of "same" pages
    ++  Franklin Import => A Single simplified layout
    -   Dynamic Form loaded from external service (FaaS)
    --  High variance in original pages (many edge cases to implement in a single script)

#### Scripts

* [/tools/importer/bacom-scripts/gated-offer.js](https://github.com/adobecom/aem-milo-migrations/blob/main/tools/importer/bacom-scripts/gated-offer.js)
* [/tools/importer/bacom-scripts/webinarv2.js](https://github.com/adobecom/aem-milo-migrations/blob/main/tools/importer/bacom-scripts/webinarv2.js)
* [/tools/importer/bacom-scripts/webinarv2-modal.js](https://github.com/adobecom/aem-milo-migrations/blob/main/tools/importer/bacom-scripts/webinarv2-modal.js)

Uses the Franklin Importer [`onLoad`](https://github.com/adobe/helix-importer-ui/blob/main/importer-guidelines.md#onload) function to dynamically wait for FaaS form presence  
https://github.com/adobecom/aem-milo-migrations/blob/main/tools/importer/bacom-scripts/gated-offer.js#L272-L274



### Thank You (also applies to webinar thank you)

#### Example

* original: https://business.adobe.com/uk/resources/reports/marketing-automation-checklist/thank-you.html
* imported: https://main--bacom--adobecom.hlx.page/drafts/acapt/import-gatedoffer-ty/uk/resources/reports/marketing-automation-checklist/thank-you

#### Pros / Cons for using Franklin Importer

    ++  Simple layout
    ++  Few content
    ++  Big sets of "same" pages
    ++  Franklin Import => A Single simplified layout
    -   Mixed type of resource (PDF, video, slide deck) to extract and make it an embed in Franklin page
    --  High variance in original pages (many edge cases to implement in a single script)

#### Scripts

* [/tools/importer/bacom-scripts/gated-offer-thank-you.js](https://github.com/adobecom/aem-milo-migrations/blob/main/tools/importer/bacom-scripts/gated-offer-thank-you.js)
* [/tools/importer/bacom-scripts/webinar-thank-you.js](https://github.com/adobecom/aem-milo-migrations/blob/main/tools/importer/bacom-scripts/webinar-thank-you.js)



### Products

#### Examples

* original: https://business.adobe.com/products/product-analytics/adobe-product-analytics.html

#### Pros / Cons for using Franklin Importer

    +   Templates
    -   Complex pages
    --  Few instances for each template
    --- High variance of content and layout (even in a same template)
    --- Franklin Import => Layout and content should map 1:1 (using existing Milo blocks)

At first sight, this set does not qualify to spent effort developing import scripts.
On the other hand, importing 500+ complex pages manually is also a huge effort.

#### "Sections Mapping" Flow

In order to still automate as much as possible the import of these pages, we developed a specific flow that
enables mapping of page "sections" to Milo blocks
So rather than trying to build a single import script for each page template, we can use a generic import script that
knows how to import each type of Milo block

* Sections Mapping documentation: https://github.com/adobecom/aem-milo-migrations/blob/main/docs/acom-sections-mapping-import.md

#### Generic Import Script

* [/tools/importer/acom-section-mapping-import.js](https://github.com/adobecom/aem-milo-migrations/blob/main/tools/importer/acom-section-mapping-import.js)

#### Demo

Show complete flow:
1. Prepare sections mapping data
2. Serve data first for the test URL and show that it does not have block type data
3. Manually classify sections screenshots in "blocks" folders
4. Serve data again and show this time the additional block type data
5. Show generic import script `adobecom/aem-milo-migrations/tools/importer/acom-section-mapping-import.js` (mapping between block name and parser function)
6. Import the URL using the generic script

#### Bonus

* Usage of importer `onLoad()` to mark all divs with extra CSS information as there we have a real document object (not JSDOM)
  Data used then to determine block theme (light / dark)
* Custom parsers
* `unknown` block type: **last resort if you do not to what migrate a section** (ex. content too complex) you can classify a section in `unknown` block folder, in the Word document this will result into a block with the original raw content + a screenshot of how the content looks like on the original page. That could help the author decide what to do with the original content
* Custom Reporting (see [guidelines](https://github.com/adobe/helix-importer-ui/blob/main/importer-guidelines.md#reporting-back)) implemented by default in the generic import [script](https://github.com/adobecom/aem-milo-migrations/blob/main/tools/importer/acom-section-mapping-import.js#L428)
* Multiple importer outputs (ex. extract portion of a page into a fragment) supported by default in the [parsers](https://github.com/adobecom/aem-milo-migrations/blob/main/tools/importer/parsers/customs/mwpw-134290.mjs#L110-L116) and in the generic import [script](https://github.com/adobecom/aem-milo-migrations/blob/main/tools/importer/acom-section-mapping-import.js#L430) (see [guidelines](https://github.com/adobe/helix-importer-ui/blob/main/importer-guidelines.md#one-input--multiple-outputs))
