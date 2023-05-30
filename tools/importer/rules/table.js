
export async function parseTableGeneric(el, document, section) {
  const container = document.createElement('div');

  const titleEl = el.querySelector('.title');
  if (titleEl && !titleEl.closest('table')) {
    container.append(titleEl);
  }

  container.append(WebImporter.DOMUtils.createTable(
    [
      [el.querySelector('table')],
    ], 
    document,
  ));

  return container;
}
