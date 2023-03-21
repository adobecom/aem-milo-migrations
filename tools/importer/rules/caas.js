
export async function parseCAASContent(el, document, section) {
  const container = document.createElement('div');

  const screenshotText = document.createElement('h3');
  screenshotText.textContent = 'CAAS Section';

  const img = document.createElement('img');
  img.src = section.block.screenshot;

  container.append(WebImporter.DOMUtils.createTable([
    [ 'text (center)'],
    [ '#FFFFCC'],
    [ screenshotText ],
    [ 'Below is a screenshot of the CAAS content. >>> TODO It should be replaced by a CAAS link <<<'.toUpperCase() ],
    [ img ],
  ], document));

  return container;
}
