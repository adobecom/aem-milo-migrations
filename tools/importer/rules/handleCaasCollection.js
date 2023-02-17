/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/**
 * Detect CAAS collection and replace with a link
 * @param {*} root The root element to search for the CAAS collection
 * @param {*} document Document
 * @returns The link to the CAAS collection or null if no collection found
 */
const handleCaasCollection = async (root, document) => {
  const consonantCaaS = root.querySelector('consonant-card-collection');
  if (!consonantCaaS) return;
  const caasLink = document.createElement('a');
  const { getCaasConfigHash } = await import('https://c3-parsecaas--milo--adobecom.hlx.page/tools/caas-import/parseCaasConfig.js');
  const config = JSON.parse(consonantCaaS.dataset.config);
  if (config?.collection?.endpoint?.startsWith('/')) {
    config.collection.endpoint = `https://business.adobe.com${config.collection.endpoint}`;
  }
  caasLink.href = getCaasConfigHash(config);
  caasLink.textContent = 'Content as a Service';
  consonantCaaS.replaceWith(caasLink);
  return caasLink;
}

export default handleCaasCollection;