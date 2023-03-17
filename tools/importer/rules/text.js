
import { rgbToHex } from "../utils.js";

export async function parseText(el, document, section) {

  let bgColor = '';
  el.querySelectorAll('div').forEach(d => {
    console.log(document.defaultView.getComputedStyle(d).getPropertyValue('background-color'));
    const bg = document.defaultView.getComputedStyle(d).getPropertyValue('background-color');
    if (bg != '') {
      bgColor = rgbToHex(bg);
    }
  });

  return WebImporter.DOMUtils.createTable(
    [
      ['text (center, xs spacing)'],
      [bgColor],
      [el.outerHTML],
    ], 
    document,
  );
}
