export const localMap = {
  ae_ar: 'ae/ar',
  ae_en: 'ae/en',
  africa: 'africa/en',
  ar: 'ar/es',
  at: 'at/de',
  au: 'au/en',
  be_en: 'be/en',
  be_fr: 'be/fr',
  be_nl: 'be/nl',
  bg: 'bg/bg',
  br: 'br/pt',
  ca: 'ca/en',
  ca_fr: 'ca/fr',
  ch_de: 'ch/de',
  ch_fr: 'ch/fr',
  ch_it: 'ch/it',
  cl: 'cl/es',
  cn: 'cn/zh',
  co: 'co/es',
  cy_en: 'cy/en',
  cz: 'cz/cs',
  de: 'de/de',
  dk: 'dk/da',
  ee: 'ee/et',
  es: 'es/es',
  fi: 'fi/fi',
  fr: 'fr/fr',
  gr_en: 'gr/en',
  hk_en: 'hk/en',
  hk_zh: 'hk/zh',
  hu: 'hu/hu',
  id_en: 'id/en',
  id_id: 'id/id',
  ie: 'ie/en',
  il_en: 'il/en',
  il_he: 'il/he',
  in: 'in/en',
  in_hi: 'in/hi',
  it: 'it/it',
  jp: 'jp/ja',
  kr: 'kr/ko',
  la: 'la/es',
  lt: 'lt/lt',
  lu_de: 'lu/de',
  lu_en: 'lu/en',
  lu_fr: 'lu/fr',
  lv: 'lv/lv',
  mena_ar: 'mena/ar',
  mena_en: 'mena/en',
  mt: 'mt/en',
  mx: 'mx/es',
  my_en: 'my/en',
  my_ms: 'my/ms',
  nl: 'nl/nl',
  no: 'no/no',
  nz: 'nz/en',
  pe: 'pe/es',
  ph_en: 'ph/en',
  ph_fil: 'ph/fil',
  pl: 'pl/pl',
  pt: 'pt/pt',
  ro: 'ro/ro',
  ru: 'ru/ru',
  sa_ar: 'sa/ar',
  sa_en: 'sa/en',
  se: 'se/sv',
  sea: 'sea/en',
  sg: 'sg/en',
  si: 'si/sl',
  sk: 'sk/sk',
  th_en: 'th/en',
  th_th: 'th/th',
  tr: 'tr/tr',
  tw: 'tw/zh',
  ua: 'ua/uk',
  uk: 'uk/uk',
  vn_en: 'vn/en',
  vn_vi: 'vn/vi',
};

export const getJSON = async (url) => {
  const response = await fetch(url, {
      headers: {
          'Authorization': 'Basic ' + btoa('milo-dev:HQR2aUaKYmNNWfKzMjx8')
      }
  });
  const data = await response.json();
  return data;
}

/* Search key from complicated JSON
* @return array values
*/
export const getJSONValues = (obj, key) => {
  if (!obj) {
    return false;
  }
  if (obj[key]) {
    return obj[key];
  }
  var objects = [];
  for (var i in obj) {
      if (!obj.hasOwnProperty(i)) continue;
      if (typeof obj[i] == 'object') {
          objects = objects.concat(getJSONValues(obj[i], key));
      } else if (i == key) {
          objects.push(obj[i]);
      }
  }
  return objects;
};

export const getMetadataValue = (document, key) => {
  const cqTags = getJSONValues(window.data, 'cq:tags');
  let cqTagMetaValue = '';
  cqTags.forEach((tag) => {
    if(tag.startsWith(key)) {
      cqTagMetaValue = tag.split('/')[1];
      console.log(tag.split('/'));
      return;
    }
  });

  return cqTagMetaValue ||
    document.head.querySelector(`meta[property="${key}"`)?.content ||
    document.head.querySelector(`meta[name="${key}"`)?.content ||
    getJSONValues(window.data, key) || '';
}

export const isRelative = url => !url.startsWith('http');