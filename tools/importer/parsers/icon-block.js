
export async function parseText(el, document, section) {
  return WebImporter.DOMUtils.createTable(
    [
      ['icon-block (vertical, center, medium, xl spacing)'],
      [el.outerHTML],
    ], 
    document,
  );
}
