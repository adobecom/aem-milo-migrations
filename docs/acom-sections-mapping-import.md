adobe.com Sections Mapping Import
===

## Requirements

* Node.js >= 18.15.0 (check via `node -v`)
* [franklin-bulk](https://github.com/catalan-adobe/franklin-bulk-cli) CLI
* [acom-franklin-import-sections-mapping](https://github.com/catalan-adobe/franklin-importer-service/tree/main/apps/acom-sections-mapping) CLI



## Flow



### 1. Prepare Sections Mapping Data

> In order to classify in each section, we need to extract them first

For a list of URLs to migrate we need to generate:
* a screenshot for each section
* a json file with metadata for each section

```
acom-sections-mapping prepare -i
```

Starts the CLI in interactive mode. In the prompt, paste the list of URLs you want to prepare the sections mapping for and enter an empty line to start the process

The data will be generated in
* `./sections-mapping/data` - The sections screenshots for each page + the section metadata json file
* `./sections-mapping/blocks` - The blocks folder structure (where to copy the sections screenshots)

The `prepare` command will auto-generate blocks folder (`./sections-mapping/blocks/<BLOCK_NAME>`) for all known [Milo blocks](https://milo.adobe.com/docs/library/library.json).

You will have to create extra block folders for each type you plan to get imported (ex. `three-up`, `two-up`, `caas`, ...)


### 2. Classify the Sections

> For each section we want to know what type of block to use

This is a manual process, you need to move each section screenshot (from 1.) into the relevant `sections-mapping/blocks/<BLOCK_NAME>` folder



### 3. Start the Sections Mapping Server

> The import script will need to fetch the sections mapping for the pages to import

```
acom-sections-mapping serve -d ./sections-mapping/data -b ./sections-mapping/blocks
```

server startup console:

```
adobe.com Sections Mapping Server:
* Data:                           http://localhost:3000/data
* Blocks:                         http://localhost:3000/blocks
* Get Sections Mapping for a URL: http://localhost:3000/sections-data?url=<url>
* Milo Blocks Sample Pages List:  http://localhost:3000/blocks/milo_blocks_samples_pages.html
```

The most import endpoint is `http://localhost:3000/sections-data?url=<url>`, it returns the sections metadata with the extra information of the block type for each section

Example

```json
[
  {
    "url": "https://business.adobe.com/products/adobe-experience-cloud-products.html",
    "urlHash": "32703283e87d8db18027ed0bde7ebd3fdf31f533",
    "xpath": "/html[1]/body[1]/div[1]/div[1]/main[1]/div[1]/div[1]/div[2]",
    "xpathHash": "8a7fb9fb403ab5828ebeeb2d41658da5d19c2ffc",
    "block": {
      "type": "text",
      "screenshot": "http://localhost:3000/blocks/text/32703283e87d8db18027ed0bde7ebd3fdf31f533.section-0.8a7fb9fb403ab5828ebeeb2d41658da5d19c2ffc.adobe-experience-cloud-products.sections-screenshot.png.png"
    }
  },
  {
    "url": "https://business.adobe.com/products/adobe-experience-cloud-products.html",
    "urlHash": "32703283e87d8db18027ed0bde7ebd3fdf31f533",
    "xpath": "/html[1]/body[1]/div[1]/div[1]/main[1]/div[1]/div[1]/div[3]",
    "xpathHash": "08e0784cea4056551db49d53eb55b923e1f3f427",
    "block": {
      "type": "unknown",
      "screenshot": "http://localhost:3000/blocks/unknown/32703283e87d8db18027ed0bde7ebd3fdf31f533.section-1.08e0784cea4056551db49d53eb55b923e1f3f427.adobe-experience-cloud-products.sections-screenshot.png.png"
    }
  },
  {
    "url": "https://business.adobe.com/products/adobe-experience-cloud-products.html",
    "urlHash": "32703283e87d8db18027ed0bde7ebd3fdf31f533",
    "xpath": "/html[1]/body[1]/div[1]/div[1]/main[1]/div[1]/div[1]/div[4]",
    "xpathHash": "eaf2e81436f9482694e5ec046f394a27f4ab2d79",
    "block": {
      "type": "unknown",
      "screenshot": "http://localhost:3000/blocks/unknown/32703283e87d8db18027ed0bde7ebd3fdf31f533.section-2.eaf2e81436f9482694e5ec046f394a27f4ab2d79.adobe-experience-cloud-products.sections-screenshot.png.png"
    }
  },
  {
    "url": "https://business.adobe.com/products/adobe-experience-cloud-products.html",
    "urlHash": "32703283e87d8db18027ed0bde7ebd3fdf31f533",
    "xpath": "/html[1]/body[1]/div[1]/div[1]/main[1]/div[1]/div[1]/div[5]",
    "xpathHash": "cd9ba48b770579148dfb1a3dcf199685a102c489",
    "block": {
      "type": "unknown",
      "screenshot": "http://localhost:3000/blocks/unknown/32703283e87d8db18027ed0bde7ebd3fdf31f533.section-3.cd9ba48b770579148dfb1a3dcf199685a102c489.adobe-experience-cloud-products.sections-screenshot.png.png"
    }
  }
]
```


### 4. Import pages using the sections mapping data

In the [Helix Importer UI](https://github.com/adobe/helix-importer-ui),

use generic import script [/tools/importer/acom-section-mapping-import.js](https://github.com/adobecom/aem-milo-migrations/blob/bacom-products-pages/tools/importer/acom-section-mapping-import.js)

This scripts fetches the sections-mapping json metadata for the given page and, for each section, itg ets the section DOM element and passes it to the parsing function (rule) mapping the block type
