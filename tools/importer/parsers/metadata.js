import { getJSONValues, getMetadataValue } from '../utils.js';

const createImage = (document, url)  => {
  const img = document.createElement('img');
  img.src = url;
  return img;
};

export function parseMetadata(document) {
  const meta = {};

  const title = document.head.querySelector(`meta[property="title"], meta[property="og:title"]`)?.content ||
  document.head.querySelector(`meta[name="title"], meta[name="og:title"]`)?.content
      || getMetadataValue(document, 'jcr:title') || '';

  meta.Title = title;
  meta.robots = getMetadataValue(document, 'robots');
  meta.Description = getMetadataValue(document, 'og:description');
  meta.keywords = getMetadataValue(document, 'keywords');
  meta['serp-content-type'] = getMetadataValue(document, 'serp-content-type');
  meta.pageCreatedAt = getMetadataValue(document, 'pageCreatedAt');
  meta.translated = getMetadataValue(document, 'translated');
  meta.publishDate = getMetadataValue(document, 'publishDate');
  meta.productJcrID = getMetadataValue(document, 'productJcrID');
  meta.primaryProductName = getMetadataValue(document, 'primaryProductName');
  const imageMeta = getMetadataValue(document, 'og:image');
  meta.image = imageMeta === '' ? '' : createImage(document, `https://business.adobe.com${imageMeta}`);
  meta['caas:content-type'] = getMetadataValue(document, 'caas:content-type');

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  return block;
}

export function parseCardMetadata(document, originalURL) {
  const title = getMetadataValue(document, 'cardTitle') || 
    document.head.querySelector(`meta[property="title"], meta[property="og:title"]`)?.content ||
    document.head.querySelector(`meta[name="title"], meta[name="og:title"]`)?.content || 
    getMetadataValue(document, 'jcr:title') || 
    '';

  const cqTags = getJSONValues(window.jcrContent, 'cq:tags');
  const convertedTags = cqTags === '' ? '' : convertEnterpriseTags(cqTags, originalURL);
  let caasTags = '';
  if (cqTags !== '') {
    caasTags = convertedTags.tags;
  }

  let caasContentType = getMetadataValue(document, 'caas:content-type');
  let convertedCaasPrimaryTag = caasContentType === '' ? '' : convertEnterpriseTags([caasContentType], originalURL);
  let caasPrimaryTag = 'caas:content-type/';
  if (caasContentType !== '') {
    caasPrimaryTag += convertedCaasPrimaryTag.tags[0];
  }
  let date = getMetadataValue(document, 'cardDate')
  let dateStr = ''
  if (date && date !== '') {
    date = new Date(Date.parse(date))
    dateStr = date.toISOString().slice(0, 10);
  }

  console.log('caas:content-type/' + caasContentType, " /// ", caasPrimaryTag);

  const cells = [
    ['Card Metadata'],
    ['title', title],
    ['CardDescription', getMetadataValue(document, 'cardDescription')],
    ['cardDate', dateStr],
    ['altCardImageText', getMetadataValue(document, 'altCardImageText')],
    ['cardImage', getMetadataValue(document, 'cardImagePath') === '' ? '' : createImage(document,`https://business.adobe.com${getMetadataValue(document, 'cardImagePath')}`)],
    ['original_entity_id', getMetadataValue(document, 'entity_id')],
    ['primaryTag', caasPrimaryTag],
    ['Tags', caasTags.length ? caasTags.join(', ') : ''],
  ];
  const block = WebImporter.DOMUtils.createTable(cells, document);

  return { 
    block, 
    tagsConverted: convertedTags.updated || false,
    hasPrimaryTag: caasPrimaryTag !== 'caas:content-type/',
  };
}

function convertEnterpriseTags(tags, originalURL) {
  let updated = false;
  // convert tags to caas if available
  let updatedTags = tags //.split(/,|(\s+)|(\\n)/g)
    .filter(Boolean)
    .map(tag => {
      const lcTag = tag.toLowerCase().trim();
      if (lcTag.startsWith('caas:')) {
        return lcTag;
      }
      if (tagMap[lcTag]) {
        updated = true;
        return tagMap[lcTag];
      }
      return lcTag;
    });
  if (updated) {
    console.log('Tags Updated', originalURL || '', tags, updatedTags);
  }
  return {
    tags: updatedTags,
    updated
  }
}

// Mapping used for enterprise tags swapping
// From https://jira.corp.adobe.com/browse/MWPW-128596
const tagMap = {
  'adobe-com-enterprise:availability': 'caas:availability',
  'adobe-com-enterprise:availability/on-demand': 'caas:availability/on-demand',
  'adobe-com-enterprise:availability/upcoming': 'caas:availability/upcoming',
  'adobe-com-enterprise:business-size/enterprise': 'caas:business-size/enterprise',
  'adobe-com-enterprise:business-size/smb': 'caas:business-size/smb',
  'adobe-com-enterprise:card-style': 'caas:card-style',
  'adobe-com-enterprise:card-style/single-image': 'caas:card-style/single-image',
  'adobe-com-enterprise:card-style/single-tall-image': 'caas:card-style/single-tall-image',
  'adobe-com-enterprise:collection': 'caas:collection/collection',
  'adobe-com-enterprise:collection/dxresources': 'caas:collection/dxresources',
  'adobe-com-enterprise:content-type': 'caas:content-type',
  'adobe-com-enterprise:content-type/article': 'caas:content-type/article',
  'adobe-com-enterprise:content-type/blog': 'caas:content-type/blog',
  'adobe-com-enterprise:content-type/customer-story': 'caas:content-type/customer-story',
  'adobe-com-enterprise:content-type/documentation': 'caas:content-type/documentation',
  'adobe-com-enterprise:content-type/ebook': 'caas:content-type/ebook',
  'adobe-com-enterprise:content-type/event-session': 'caas:content-type/event-session',
  'adobe-com-enterprise:content-type/event-speaker': 'caas:content-type/event-speaker',
  'adobe-com-enterprise:content-type/event': 'caas:content-type/event',
  'adobe-com-enterprise:content-type/financial_services': 'caas:content-type/financial-services',
  'adobe-com-enterprise:content-type/guide': 'caas:content-type/guide',
  'adobe-com-enterprise:content-type/partner-story': 'caas:content-type/partner-story',
  'adobe-com-enterprise:content-type/podcast': 'caas:content-type/podcast',
  'adobe-com-enterprise:content-type/product-page': 'caas:content-type/product-page',
  'adobe-com-enterprise:content-type/quiz': 'caas:content-type/quiz',
  'adobe-com-enterprise:content-type/report': 'caas:content-type/report',
  'adobe-com-enterprise:content-type/video': 'caas:content-type/video',
  'adobe-com-enterprise:content-type/webinar': 'caas:content-type/webinar',
  'adobe-com-enterprise:content-type/white-paper': 'caas:content-type/white-paper',
  'adobe-com-enterprise:cta': 'caas:cta',
  'adobe-com-enterprise:cta/download-guide': 'caas:cta/download-guide',
  'adobe-com-enterprise:cta/learn-more': 'caas:cta/learn-more',
  'adobe-com-enterprise:cta/read-article': 'caas:cta/read-article',
  'adobe-com-enterprise:cta/read-report': 'caas:cta/read-report',
  'adobe-com-enterprise:cta/take-quiz': 'caas:cta/take-quiz',
  'adobe-com-enterprise:customer-story-type': 'caas:customer-story-type',
  'adobe-com-enterprise:customer-story-type/experience-makers': 'caas:customer-story-type/experience-makers',
  'adobe-com-enterprise:events': 'caas:events',
  'adobe-com-enterprise:events/day': 'caas:events/day',
  'adobe-com-enterprise:events/day/day-1': 'caas:events/day/day-1',
  'adobe-com-enterprise:events/day/day-2': 'caas:events/day/day-2',
  'adobe-com-enterprise:events/day/day-3': 'caas:events/day/day-3',
  'adobe-com-enterprise:events/event-session-type': 'caas:events/event-session-type',
  'adobe-com-enterprise:events/event-session-type/live-expired': 'caas:events/event-session-type/live-expired',
  'adobe-com-enterprise:events/event-session-type/on-demand-scheduled': 'caas:events/event-session-type/on-demand-scheduled',
  'adobe-com-enterprise:events/max': 'caas:events/max',
  'adobe-com-enterprise:events/max/big-tent': 'caas:events/max/big-tent',
  'adobe-com-enterprise:events/max/big-tent/live': 'caas:events/max/big-tent/live',
  'adobe-com-enterprise:events/max/big-tent/on-demand': 'caas:events/max/big-tent/on-demand',
  'adobe-com-enterprise:events/max/career-center': 'caas:events/max/career-center',
  'adobe-com-enterprise:events/max/career-center/skills': 'caas:events/max/career-center/skills',
  'adobe-com-enterprise:events/max/career-center/skills/creative-careers': 'caas:events/max/career-center/skills/creative-careers',
  'adobe-com-enterprise:events/max/career-center/skills/creative-inspirationcreative-inspiration,': 'caas:events/max/career-center/skills/creative-inspiration',
  'adobe-com-enterprise:events/max/career-center/skills/creative-skill-guidecreative-skill-guide,': 'caas:events/max/career-center/skills/creative-skill-guide',
  'adobe-com-enterprise:events/max/career-center/skills/photography-pro-tipsphotography-pro-tips,': 'caas:events/max/career-center/skills/photography-pro-tips',
  'adobe-com-enterprise:events/max/career-center/tips': 'caas:events/max/career-center/tips',
  'adobe-com-enterprise:events/max/career-center/tips/career-growth': 'caas:events/max/career-center/tips/career-growth',
  'adobe-com-enterprise:events/max/career-center/tips/creative-careers': 'caas:events/max/career-center/tips/creative-careers',
  'adobe-com-enterprise:events/max/career-center/tips/freelancing-tips': 'caas:events/max/career-center/tips/freelancing-tips',
  'adobe-com-enterprise:events/max/career-center/tips/management-advice': 'caas:events/max/career-center/tips/management-advice',
  'adobe-com-enterprise:events/max/career-center/tips/resume-templates': 'caas:events/max/career-center/tips/resume-templates',
  'adobe-com-enterprise:events/max/career-center/tips/self-branding': 'caas:events/max/career-center/tips/self-branding',
  'adobe-com-enterprise:events/max/career-center/tips/virtual-interviews': 'caas:events/max/career-center/tips/virtual-interviews',
  'adobe-com-enterprise:events/max/category': 'caas:events/max/category',
  'adobe-com-enterprise:events/max/category/creativity-in-the-classroom': 'caas:events/max/category/creativity-in-the-classroom',
  'adobe-com-enterprise:events/max/category/distance-learning': 'caas:events/max/category/distance-learning',
  'adobe-com-enterprise:events/max/category/how-to': 'caas:events/max/category/how-to',
  'adobe-com-enterprise:events/max/category/industry-best-practices': 'caas:events/max/category/industry-best-practices',
  'adobe-com-enterprise:events/max/category/inspiration': 'caas:events/max/category/inspiration',
  'adobe-com-enterprise:events/max/category/mobile': 'caas:events/max/category/mobile',
  'adobe-com-enterprise:events/max/category/remote-work': 'caas:events/max/category/remote-work',
  'adobe-com-enterprise:events/max/category/running-your-business': 'caas:events/max/category/running-your-business',
  'adobe-com-enterprise:events/max/category/thought-leadership': 'caas:events/max/category/thought-leadership',
  'adobe-com-enterprise:events/max/primary-poi': 'caas:events/max/primary-poi',
  'adobe-com-enterprise:events/max/primary-poi/access': 'caas:events/max/primary-poi/access',
  'adobe-com-enterprise:events/max/primary-poi/acrobat-professional': 'caas:events/max/primary-poi/acrobat-professional',
  'adobe-com-enterprise:events/max/primary-poi/acrobat': 'caas:events/max/primary-poi/acrobat',
  'adobe-com-enterprise:events/max/primary-poi/adobe-media-server': 'caas:events/max/primary-poi/adobe-media-server',
  'adobe-com-enterprise:events/max/primary-poi/adobe-stock': 'caas:events/max/primary-poi/adobe-stock',
  'adobe-com-enterprise:events/max/primary-poi/after-effects-pro': 'caas:events/max/primary-poi/after-effects-pro',
  'adobe-com-enterprise:events/max/primary-poi/after-effects-standard': 'caas:events/max/primary-poi/after-effects-standard',
  'adobe-com-enterprise:events/max/primary-poi/audition': 'caas:events/max/primary-poi/audition',
  'adobe-com-enterprise:events/max/primary-poi/auditude': 'caas:events/max/primary-poi/auditude',
  'adobe-com-enterprise:events/max/primary-poi/creative-cloud': 'caas:events/max/primary-poi/creative-cloud',
  'adobe-com-enterprise:events/max/primary-poi/creative-suite': 'caas:events/max/primary-poi/creative-suite',
  'adobe-com-enterprise:events/max/primary-poi/design-premium': 'caas:events/max/primary-poi/design-premium',
  'adobe-com-enterprise:events/max/primary-poi/design-standard': 'caas:events/max/primary-poi/design-standard',
  'adobe-com-enterprise:events/max/primary-poi/director': 'caas:events/max/primary-poi/director',
  'adobe-com-enterprise:events/max/primary-poi/dreamweaver': 'caas:events/max/primary-poi/dreamweaver',
  'adobe-com-enterprise:events/max/primary-poi/encore': 'caas:events/max/primary-poi/encore',
  'adobe-com-enterprise:events/max/primary-poi/flash': 'caas:events/max/primary-poi/flash',
  'adobe-com-enterprise:events/max/primary-poi/flex-builder': 'caas:events/max/primary-poi/flex-builder',
  'adobe-com-enterprise:events/max/primary-poi/freehand': 'caas:events/max/primary-poi/freehand',
  'adobe-com-enterprise:events/max/primary-poi/illustrator': 'caas:events/max/primary-poi/illustrator',
  'adobe-com-enterprise:events/max/primary-poi/indesign-server': 'caas:events/max/primary-poi/indesign-server',
  'adobe-com-enterprise:events/max/primary-poi/indesign': 'caas:events/max/primary-poi/indesign',
  'adobe-com-enterprise:events/max/primary-poi/insight': 'caas:events/max/primary-poi/insight',
  'adobe-com-enterprise:events/max/primary-poi/master-collection': 'caas:events/max/primary-poi/master-collection',
  'adobe-com-enterprise:events/max/primary-poi/photoshop-elements': 'caas:events/max/primary-poi/photoshop-elements',
  'adobe-com-enterprise:events/max/primary-poi/photoshop-extended': 'caas:events/max/primary-poi/photoshop-extended',
  'adobe-com-enterprise:events/max/primary-poi/photoshop-lightroom': 'caas:events/max/primary-poi/photoshop-lightroom',
  'adobe-com-enterprise:events/max/primary-poi/photoshop': 'caas:events/max/primary-poi/photoshop',
  'adobe-com-enterprise:events/max/primary-poi/premiere-elements': 'caas:events/max/primary-poi/premiere-elements',
  'adobe-com-enterprise:events/max/primary-poi/premiere-pro': 'caas:events/max/primary-poi/premiere-pro',
  'adobe-com-enterprise:events/max/primary-poi/production-premium': 'caas:events/max/primary-poi/production-premium',
  'adobe-com-enterprise:events/max/primary-poi/web-premium': 'caas:events/max/primary-poi/web-premium',
  'adobe-com-enterprise:events/max/shop': 'caas:events/max/shop',
  'adobe-com-enterprise:events/max/shop/apparel': 'caas:events/max/shop/apparel',
  'adobe-com-enterprise:events/max/shop/books-journals': 'caas:events/max/shop/books-journals',
  'adobe-com-enterprise:events/max/shop/cards-stationery': 'caas:events/max/shop/cards-stationery',
  'adobe-com-enterprise:events/max/shop/home-decor': 'caas:events/max/shop/home-decor',
  'adobe-com-enterprise:events/max/shop/miscellaneous': 'caas:events/max/shop/miscellaneous',
  'adobe-com-enterprise:events/max/shop/online-courses-tutorials': 'caas:events/max/shop/online-courses-tutorials',
  'adobe-com-enterprise:events/max/shop/patches-pins-stickers': 'caas:events/max/shop/patches-pins-stickers',
  'adobe-com-enterprise:events/max/shop/prints': 'caas:events/max/shop/prints',
  'adobe-com-enterprise:events/max/shop/puzzles': 'caas:events/max/shop/puzzles',
  'adobe-com-enterprise:events/max/shop/speaker': 'caas:events/max/shop/speaker',
  'adobe-com-enterprise:events/max/shop/totes': 'caas:events/max/shop/totes',
  'adobe-com-enterprise:events/max/speaker-craft': 'caas:events/max/speaker-craft',
  'adobe-com-enterprise:events/max/speaker-craft/3d-and-immersive': 'caas:events/max/speaker-craft/3d-and-immersive',
  'adobe-com-enterprise:events/max/speaker-craft/animation': 'caas:events/max/speaker-craft/animation',
  'adobe-com-enterprise:events/max/speaker-craft/audio': 'caas:events/max/speaker-craft/audio',
  'adobe-com-enterprise:events/max/speaker-craft/creative-imaging': 'caas:events/max/speaker-craft/creative-imaging',
  'adobe-com-enterprise:events/max/speaker-craft/graphic-design': 'caas:events/max/speaker-craft/graphic-design',
  'adobe-com-enterprise:events/max/speaker-craft/illustration': 'caas:events/max/speaker-craft/illustration',
  'adobe-com-enterprise:events/max/speaker-craft/layout': 'caas:events/max/speaker-craft/layout',
  'adobe-com-enterprise:events/max/speaker-craft/motion-graphics': 'caas:events/max/speaker-craft/motion-graphics',
  'adobe-com-enterprise:events/max/speaker-craft/photography': 'caas:events/max/speaker-craft/photography',
  'adobe-com-enterprise:events/max/speaker-craft/print-design': 'caas:events/max/speaker-craft/print-design',
  'adobe-com-enterprise:events/max/speaker-craft/thought-leadership': 'caas:events/max/speaker-craft/thought-leadership',
  'adobe-com-enterprise:events/max/speaker-craft/ui-and-ux-design': 'caas:events/max/speaker-craft/ui-and-ux-design',
  'adobe-com-enterprise:events/max/speaker-craft/video-editing': 'caas:events/max/speaker-craft/video-editing',
  'adobe-com-enterprise:events/max/speaker-craft/visual-effects': 'caas:events/max/speaker-craft/visual-effects',
  'adobe-com-enterprise:events/max/speaker-craft/web-design': 'caas:events/max/speaker-craft/web-design',
  'adobe-com-enterprise:events/max/technical-level': 'caas:events/max/technical-level',
  'adobe-com-enterprise:events/max/technical-level/advanced': 'caas:events/max/technical-level/advanced',
  'adobe-com-enterprise:events/max/technical-level/beginner': 'caas:events/max/technical-level/beginner',
  'adobe-com-enterprise:events/max/technical-level/general-audience': 'caas:events/max/technical-level/general-audience',
  'adobe-com-enterprise:events/max/technical-level/intermediate': 'caas:events/max/technical-level/intermediate',
  'adobe-com-enterprise:events/max/track': 'caas:events/max/track',
  'adobe-com-enterprise:events/max/track/3d-and-ar': 'caas:events/max/track/3d-and-ar',
  'adobe-com-enterprise:events/max/track/business-productivity': 'caas:events/max/track/business-productivity',
  'adobe-com-enterprise:events/max/track/creativity-and-design-in-business': 'caas:events/max/track/creativity-and-design-in-business',
  'adobe-com-enterprise:events/max/track/education': 'caas:events/max/track/education',
  'adobe-com-enterprise:events/max/track/graphic-design': 'caas:events/max/track/graphic-design',
  'adobe-com-enterprise:events/max/track/illustration-and-digital-painting': 'caas:events/max/track/illustration-and-digital-painting',
  'adobe-com-enterprise:events/max/track/photography': 'caas:events/max/track/photography',
  'adobe-com-enterprise:events/max/track/social-media': 'caas:events/max/track/social-media',
  'adobe-com-enterprise:events/max/track/ui-and-ux': 'caas:events/max/track/ui-and-ux',
  'adobe-com-enterprise:events/max/track/video': 'caas:events/max/track/video',
  'adobe-com-enterprise:events/podcast-type': 'caas:events/podcast-type',
  'adobe-com-enterprise:events/podcast-type/clever-podcast': 'caas:events/podcast-type/clever-podcast',
  'adobe-com-enterprise:events/podcast-type/deeply-graphic-designcast': 'caas:events/podcast-type/deeply-graphic-designcast',
  'adobe-com-enterprise:events/podcast-type/design-matters': 'caas:events/podcast-type/design-matters',
  'adobe-com-enterprise:events/podcast-type/futur-podcast': 'caas:events/podcast-type/futur-podcast',
  'adobe-com-enterprise:events/podcast-type/wireframe': 'caas:events/podcast-type/wireframe',
  'adobe-com-enterprise:events/session-type': 'caas:events/session-type',
  'adobe-com-enterprise:events/session-type/adobe-live': 'caas:events/session-type/adobe-live',
  'adobe-com-enterprise:events/session-type/art-walks': 'caas:events/session-type/art-walks',
  'adobe-com-enterprise:events/session-type/birds-of-a-feather': 'caas:events/session-type/birds-of-a-feather',
  'adobe-com-enterprise:events/session-type/chill-out': 'caas:events/session-type/chill-out',
  'adobe-com-enterprise:events/session-type/creative-challenges': 'caas:events/session-type/creative-challenges',
  'adobe-com-enterprise:events/session-type/creativity-workshop': 'caas:events/session-type/creativity-workshop',
  'adobe-com-enterprise:events/session-type/creature-features': 'caas:events/session-type/creature-features',
  'adobe-com-enterprise:events/session-type/evangelist': 'caas:events/session-type/evangelist',
  'adobe-com-enterprise:events/session-type/keynote': 'caas:events/session-type/keynote',
  'adobe-com-enterprise:events/session-type/lab': 'caas:events/session-type/lab',
  'adobe-com-enterprise:events/session-type/live-broadcast': 'caas:events/session-type/live-broadcast',
  'adobe-com-enterprise:events/session-type/luminary': 'caas:events/session-type/luminary',
  'adobe-com-enterprise:events/session-type/max-chats': 'caas:events/session-type/max-chats',
  'adobe-com-enterprise:events/session-type/meet-the-teams': 'caas:events/session-type/meet-the-teams',
  'adobe-com-enterprise:events/session-type/networking': 'caas:events/session-type/networking',
  'adobe-com-enterprise:events/session-type/session': 'caas:events/session-type/session',
  'adobe-com-enterprise:events/session-type/skills': 'caas:events/session-type/skills',
  'adobe-com-enterprise:events/session-type/special-guest': 'caas:events/session-type/special-guest',
  'adobe-com-enterprise:events/session-type/tips': 'caas:events/session-type/tips',
  'adobe-com-enterprise:events/session-type/try-this-at-home': 'caas:events/session-type/try-this-at-home',
  'adobe-com-enterprise:events/speaker-type': 'caas:events/speaker-type',
  'adobe-com-enterprise:events/speaker-type/celebrity': 'caas:events/speaker-type/celebrity',
  'adobe-com-enterprise:events/speaker-type/evangelist': 'caas:events/speaker-type/evangelist',
  'adobe-com-enterprise:events/speaker-type/headliner': 'caas:events/speaker-type/headliner',
  'adobe-com-enterprise:events/speaker-type/keynote': 'caas:events/speaker-type/keynote',
  'adobe-com-enterprise:events/speaker-type/luminary': 'caas:events/speaker-type/luminary',
  'adobe-com-enterprise:events/speaker-type/max-master': 'caas:events/speaker-type/max-master',
  'adobe-com-enterprise:events/speaker-type/sneaks': 'caas:events/speaker-type/sneaks',
  'adobe-com-enterprise:events/speaker': 'caas:events/speaker',
  'adobe-com-enterprise:events/speaker/max-speaker': 'caas:events/speaker/max-speaker',
  'adobe-com-enterprise:events/sponsor-level': 'caas:events/sponsor-level',
  'adobe-com-enterprise:events/sponsor-level/bronze': 'caas:events/sponsor-level/bronze',
  'adobe-com-enterprise:events/sponsor-level/diamond': 'caas:events/sponsor-level/diamond',
  'adobe-com-enterprise:events/sponsor-level/exhibitor': 'caas:events/sponsor-level/exhibitor',
  'adobe-com-enterprise:events/sponsor-level/gold': 'caas:events/sponsor-level/gold',
  'adobe-com-enterprise:events/sponsor-level/platinum': 'caas:events/sponsor-level/platinum',
  'adobe-com-enterprise:events/sponsor-level/silver': 'caas:events/sponsor-level/silver',
  'adobe-com-enterprise:events/summit': 'caas:events/summit',
  'adobe-com-enterprise:events/year': 'caas:events/year',
  'adobe-com-enterprise:events/year/2020': 'caas:events/year/2020',
  'adobe-com-enterprise:events/year/2021': 'caas:events/year/2021',
  'adobe-com-enterprise:form': 'caas:form',
  'adobe-com-enterprise:form/3rd-party': 'caas:form/3rd-party',
  'adobe-com-enterprise:form/faas-79': 'caas:form/faas-79',
  'adobe-com-enterprise:form/faas-rfi': 'caas:form/faas-rfi',
  'adobe-com-enterprise:industry': 'caas:industry',
  'adobe-com-enterprise:industry/education': 'caas:industry/education',
  'adobe-com-enterprise:industry/financial-services': 'caas:industry/financial-services',
  'adobe-com-enterprise:industry/government': 'caas:industry/government',
  'adobe-com-enterprise:industry/healthcare': 'caas:industry/healthcare',
  'adobe-com-enterprise:industry/high-tech': 'caas:industry/high-tech',
  'adobe-com-enterprise:industry/manufacturing': 'caas:industry/manufacturing',
  'adobe-com-enterprise:industry/media-and-entertainment': 'caas:industry/media-and-entertainment',
  'adobe-com-enterprise:industry/non-profit': 'caas:industry/non-profit',
  'adobe-com-enterprise:industry/other': 'caas:industry/other',
  'adobe-com-enterprise:industry/retail': 'caas:industry/retail',
  'adobe-com-enterprise:industry/telecom': 'caas:industry/telecommunications',
  'adobe-com-enterprise:industry/travel-and-hospitality': 'caas:industry/travel-and-hospitality',
  'adobe-com-enterprise:journey-phase': 'caas:journey-phase',
  'adobe-com-enterprise:journey-phase/acceleration': 'caas:journey-phase/acceleration',
  'adobe-com-enterprise:journey-phase/acquisition': 'caas:journey-phase/acquisition',
  'adobe-com-enterprise:journey-phase/discover': 'caas:journey-phase/discover',
  'adobe-com-enterprise:journey-phase/evaluate': 'caas:journey-phase/evaluate',
  'adobe-com-enterprise:journey-phase/expansion': 'caas:journey-phase/expansion',
  'adobe-com-enterprise:journey-phase/explore': 'caas:journey-phase/explore',
  'adobe-com-enterprise:journey-phase/retention': 'caas:journey-phase/retention',
  'adobe-com-enterprise:journey-phase/use-re-invest': 'caas:journey-phase/use-re-invest',
  'adobe-com-enterprise:product': 'caas:products',
  'adobe-com-enterprise:product/acrobat-dc': 'caas:products/acrobat',
  'adobe-com-enterprise:product/adobe-customer-solutions': 'caas:products/adobe-customer-solutions',
  'adobe-com-enterprise:product/advertising-cloud': 'caas:products/adobe-advertising-cloud',
  'adobe-com-enterprise:product/analytics': 'caas:products/adobe-analytics',
  'adobe-com-enterprise:product/audience-manager': 'caas:products/adobe-audience-manager',
  'adobe-com-enterprise:product/campaign': 'caas:products/adobe-campaign',
  'adobe-com-enterprise:product/captivate': 'caas:products/captivate',
  'adobe-com-enterprise:product/commerce-cloud': 'caas:products/adobe-commerce-cloud',
  'adobe-com-enterprise:product/connect': 'caas:products/connect',
  'adobe-com-enterprise:product/creative-cloud': 'caas:products/creative-cloud',
  'adobe-com-enterprise:product/customer-journey-analytics': 'caas:products/customer-journey-analytics',
  'adobe-com-enterprise:product/document_cloud': 'caas:products/adobe-document-cloud',
  'adobe-com-enterprise:product/experience-cloud': 'caas:products/adobe-experience-cloud',
  'adobe-com-enterprise:product/experience-manager-assets': 'caas:products/adobe-experience-manager-assets',
  'adobe-com-enterprise:product/experience-manager-forms': 'caas:products/adobe-experience-manager-forms',
  'adobe-com-enterprise:product/experience-manager-guides': 'caas:products/experience-manager-guides',
  'adobe-com-enterprise:product/experience-manager-sites': 'caas:products/adobe-experience-manager-sites',
  'adobe-com-enterprise:product/experience-manager': 'caas:products/adobe-experience-manager',
  'adobe-com-enterprise:product/experience-platform': 'caas:products/adobe-experience-platform',
  'adobe-com-enterprise:product/journey-optimizer': 'caas:products/adobe-journey-optimizer',
  'adobe-com-enterprise:product/journey-orchestration': 'caas:products/journey-orchestration',
  'adobe-com-enterprise:product/learning-manager': 'caas:products/learning-manager',
  'adobe-com-enterprise:product/magento-commerce': 'caas:products/magento-commerce',
  'adobe-com-enterprise:product/marketo-engage': 'caas:products/marketo-engage-bizible',
  'adobe-com-enterprise:product/marketo-measure': 'caas:products/marketo-measure',
  'adobe-com-enterprise:product/primetime': 'caas:products/adobe-primetime',
  'adobe-com-enterprise:product/real-time-customer-data-platform': 'caas:products/adobe-real-time-cdp',
  'adobe-com-enterprise:product/sensei': 'caas:products/adobe-sensei',
  'adobe-com-enterprise:product/services': 'caas:products/services',
  'adobe-com-enterprise:product/sign': 'caas:products/adobe-sign',
  'adobe-com-enterprise:product/stock': 'caas:products/stock',
  'adobe-com-enterprise:product/target': 'caas:products/adobe-target',
  'adobe-com-enterprise:product/workfront': 'caas:products/workfront',
  'adobe-com-enterprise:region': 'caas:region',
  'adobe-com-enterprise:region/apac': 'caas:region/apac',
  'adobe-com-enterprise:region/australia-and-new-zealand': 'caas:region/australia-and-new-zealand',
  'adobe-com-enterprise:region/china': 'caas:region/china',
  'adobe-com-enterprise:region/emea': 'caas:region/emea',
  'adobe-com-enterprise:region/hong-kong': 'caas:region/hong-kong',
  'adobe-com-enterprise:region/india': 'caas:region/india',
  'adobe-com-enterprise:region/japan': 'caas:region/japan',
  'adobe-com-enterprise:region/korea': 'caas:region/korea',
  'adobe-com-enterprise:region/north-america': 'caas:region/north-america',
  'adobe-com-enterprise:region/south-east-asia': 'caas:region/south-east-asia',
  'adobe-com-enterprise:region/uk': 'caas:region/uk',
  'adobe-com-enterprise:related-product/adobe-customer-solutions': 'caas:related-product/adobe-customer-solutions',
  'adobe-com-enterprise:related-product/analytics': 'caas:related-product/analytics',
  'adobe-com-enterprise:related-product/campaign': 'caas:related-product/campaign',
  'adobe-com-enterprise:related-product/creative-cloud': 'caas:related-product/creative-cloud',
  'adobe-com-enterprise:related-product/experience-manager-assets': 'caas:related-product/experience-manager-assets',
  'adobe-com-enterprise:related-product/experience-manager-sites': 'caas:related-product/experience-manager-sites',
  'adobe-com-enterprise:related-product/experience-manager': 'caas:related-product/experience-manager',
  'adobe-com-enterprise:related-product/experience-platform': 'caas:related-product/experience-platform',
  'adobe-com-enterprise:related-product/magento-commerce': 'caas:related-product/magento-commerce',
  'adobe-com-enterprise:related-product/marketo-engage': 'caas:related-product/marketo-engage',
  'adobe-com-enterprise:related-product/stock': 'caas:related-product/stock',
  'adobe-com-enterprise:related-product/target': 'caas:related-product/target',
  'adobe-com-enterprise:role': 'caas:role',
  'adobe-com-enterprise:role/advertising': 'caas:role/advertising',
  'adobe-com-enterprise:role/commerce': 'caas:role/commerce',
  'adobe-com-enterprise:role/compliance-evaluator': 'caas:role/compliance-evaluator',
  'adobe-com-enterprise:role/decision-maker': 'caas:role/decision-maker',
  'adobe-com-enterprise:role/digital': 'caas:role/digital',
  'adobe-com-enterprise:role/feature-evaluator': 'caas:role/feature-evaluator',
  'adobe-com-enterprise:role/it': 'caas:role/it',
  'adobe-com-enterprise:role/marketing': 'caas:role/marketing',
  'adobe-com-enterprise:role/sales': 'caas:role/sales',
  'adobe-com-enterprise:role/vision-leader': 'caas:role/vision-leader',
  'adobe-com-enterprise:summit': 'caas:summit',
  'adobe-com-enterprise:topic': 'caas:topic',
  'adobe-com-enterprise:topic/advertising': 'caas:topic/advertising',
  'adobe-com-enterprise:topic/analytics': 'caas:topic/analytics',
  'adobe-com-enterprise:topic/b2b-marketing': 'caas:topic/b2b-marketing',
  'adobe-com-enterprise:topic/business-continuity': 'caas:topic/business-continuity',
  'adobe-com-enterprise:topic/campaign-orchestration': 'caas:topic/campaign-orchestration',
  'adobe-com-enterprise:topic/commerce': 'caas:topic/commerce',
  'adobe-com-enterprise:topic/content-management': 'caas:topic/content-management',
  'adobe-com-enterprise:topic/cookieless': 'caas:topic/cookieless',
  'adobe-com-enterprise:topic/creativity-design': 'caas:topic/creativity-design',
  'adobe-com-enterprise:topic/customer-data-platform': 'caas:topic/customer-data-platform',
  'adobe-com-enterprise:topic/customer-intelligence': 'caas:topic/customer-intelligence',
  'adobe-com-enterprise:topic/customer-journey-management': 'caas:topic/customer-journey-management',
  'adobe-com-enterprise:topic/data-&-insights': 'caas:topic/data-&-insights',
  'adobe-com-enterprise:topic/data-foundation': 'caas:topic/data-foundation',
  'adobe-com-enterprise:topic/data-management-platform': 'caas:topic/data-management-platform',
  'adobe-com-enterprise:topic/data-management': 'caas:topic/data-management',
  'adobe-com-enterprise:topic/demand-marketing': 'caas:topic/demand-marketing',
  'adobe-com-enterprise:topic/digital-asset-management': 'caas:topic/digital-asset-management',
  'adobe-com-enterprise:topic/digital-economy': 'caas:topic/digital-economy',
  'adobe-com-enterprise:topic/digital-foundation': 'caas:topic/digital-foundation',
  'adobe-com-enterprise:topic/digital-trends': 'caas:topic/digital-trends',
  'adobe-com-enterprise:topic/digital-workflows-and-enrollment': 'caas:topic/digital-workflows-and-enrollment',
  'adobe-com-enterprise:topic/digital': 'caas:topic/digital',
  'adobe-com-enterprise:topic/document-management': 'caas:topic/document-management',
  'adobe-com-enterprise:topic/documents-and-e-signatures': 'caas:topic/electronic-signature',
  'adobe-com-enterprise:topic/email-marketing': 'caas:topic/email-marketing',
  'adobe-com-enterprise:topic/enterprise-work-management': 'caas:topic/enterprise-work-management',
  'adobe-com-enterprise:topic/experience_manager': 'caas:topic/experience_manager',
  'adobe-com-enterprise:topic/Experience-Masters-Series': 'caas:topic/experience-masters-series',
  'adobe-com-enterprise:topic/marketing-automation': 'caas:topic/marketing-automation',
  'adobe-com-enterprise:topic/personalization': 'caas:topic/personalization',
  'adobe-com-enterprise:topic/privacy': 'caas:topic/privacy',
  'adobe-com-enterprise:topic/security': 'caas:topic/security',
  'adobe-com-enterprise:topic/Stock': 'caas:topic/stock',
  'adobe-com-enterprise:topic/tech-for-good': 'caas:topic/tech-for-good',
};