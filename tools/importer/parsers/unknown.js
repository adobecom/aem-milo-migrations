
export function parseUnknown(el, document, section) {
  const cells =     [
    ['unknown'],
    [el.outerHTML],
  ];

  const img = document.createElement('img');
  img.setAttribute("width", "500");
  img.src = section.block.screenshot;

  cells.push([
    'Here is a screenshot of this unidentified element',
    img
  ]);

  const block = WebImporter.DOMUtils.createTable(
    cells,
    document,
  );

  return { block };
}
