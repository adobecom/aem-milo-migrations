# aem-milo-migrations
A central point for storing and reviewing our migrations from AEM into Milo. 

## Installation 

Inside of the project folder you're working on, run `npm install` to download the latest helix web importer. 

Example: `cd customer-success-stories && npm install` 

To start the application, run `hlx import`. 

The `import.ui.js` inside of `customer-success-stories/tools/importer/` contains modifications that need to be made to the file at `tools/importer/helix-importer-ui/js/import/import.ui.js` in order to fetch JSON on that project. 

