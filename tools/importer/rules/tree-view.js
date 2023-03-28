export function parseTreeView(el, document, section) {
  const treeview = el.querySelector('.treeview');

  treeview.querySelectorAll('input, label.on').forEach((input) => {
    input.remove();
  });

  return WebImporter.DOMUtils.createTable([
    ['tree-view'],
    [treeview],
  ], document);
}
