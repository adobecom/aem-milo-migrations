
export async function parseTableGeneric(el, document, section) {
  const block = document.createElement('div');

  const titleEl = el.querySelector('.title');
  if (titleEl && !titleEl.closest('table')) {
    block.append(titleEl);
  }

  block.append(WebImporter.DOMUtils.createTable(
    [
      [el.querySelector('table')],
    ], 
    document,
  ));

  return { block };
}
