/* One product source for the browser and the optional enquiry server.
   Prices are stored as integer cents to avoid rounding errors. */
(function (root, factory) {
  const catalogue = factory();
  if (typeof module === 'object' && module.exports) module.exports = catalogue;
  else root.BAKEHOUSE_CATALOGUE = catalogue;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  return Object.freeze([
    Object.freeze({
      id: 'chocolate-dream-cake', name: 'Chocolate Dream Cake', category: 'Cakes',
      price: 25000, image: 'assets/images/chocolate-dream-cake.webp',
      alt: 'Chocolate layer cake with glossy ganache and chocolate curls',
      tag: 'For the celebrations', unit: 'cake',
      description: 'A rich chocolate centrepiece for the moments worth celebrating. Enquire to confirm size, decoration and your preferred date.',
      allergens: 'May contain wheat, gluten, milk, eggs, soy and nuts.'
    }),
    Object.freeze({
      id: 'vanilla-bean-loaf', name: 'Vanilla Bean Loaf', category: 'Bread & loaves',
      price: 8500, image: 'assets/images/vanilla-bean-loaf.webp',
      alt: 'Golden vanilla bean loaf with two cut slices',
      tag: 'Your afternoon slice', unit: 'loaf',
      description: 'A simple vanilla loaf made for an afternoon cup of tea, a shared table and one more slice. Confirm availability with your enquiry.',
      allergens: 'May contain wheat, gluten, milk, eggs and nuts.'
    }),
    Object.freeze({
      id: 'butter-croissant-box', name: 'Butter Croissant Box', category: 'Pastries',
      price: 12000, image: 'assets/images/butter-croissants.webp',
      alt: 'Two golden butter croissants with crisp flaky layers',
      tag: 'A little buttery joy', unit: 'box',
      description: 'Golden, buttery layers for a lovely start to the day. The number of croissants per box and collection time are confirmed by the bakery.',
      allergens: 'May contain wheat, gluten, milk, eggs and nuts.', cutout: true
    })
  ]);
});
