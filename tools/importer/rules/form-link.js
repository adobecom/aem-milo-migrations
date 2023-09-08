import { handleFaasForm } from '../rules/handleFaasForm.js';


export function parse_faasForm(el, document, section) {
    const titleElement = el.querySelector('.dexter-FlexContainer')?.querySelector('.cmp-text');
    const formLink = handleFaasForm(el, document, titleElement);

    const form = document.createElement('p');
    form.append(formLink);
    const block = WebImporter.DOMUtils.createTable([
        ['Columns (contained)'],
        [form]
    ], document);

    return { block };
}
