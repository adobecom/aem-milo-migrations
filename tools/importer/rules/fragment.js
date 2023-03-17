
export async function parseFragment(el, document, section) {
  const img = document.createElement('img');
  img.setAttribute("width", "500");
  img.style.border = "1px solid blue";
  img.src = section.block.screenshot;

  return WebImporter.DOMUtils.createTable(
    [
      ['fragment'],
      [ 'content', el.outerHTML ],
      [ 'original screenshot', img, ],
    ], 
    document,
  );
}
