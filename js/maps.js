/* Click-to-load Google Maps Embed API, with a keyless Google area-map fallback.
   The query is resolved by Google; no guessed storefront coordinates are used. */
(function () {
  'use strict';
  const root = document.getElementById('google-map');
  if (!root) return;
  const config = window.BAKEHOUSE_CONFIG;
  const load = document.querySelector('[data-load-map]');
  const unload = document.querySelector('[data-unload-map]');
  const placeholder = document.querySelector('[data-map-placeholder]');
  const status = document.querySelector('[data-map-status]');
  const verified = config.business.addressConfirmed && config.business.streetAddress.trim();
  const query = verified ? config.business.streetAddress : config.maps.areaQuery;
  const direct = new URL('https://www.google.com/maps/search/');
  direct.searchParams.set('api', '1'); direct.searchParams.set('query', query);
  document.querySelector('[data-maps-link]').href = direct.href;
  let timer;
  function loadMap() {
    const iframe = document.createElement('iframe');
    iframe.title = verified ? 'Google Maps location for Umhlanga Bakehouse' : 'Google Maps area view of Umhlanga Rocks, Durban, South Africa';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;
    const key = config.maps.apiKey.trim();
    const url = new URL(key ? 'https://www.google.com/maps/embed/v1/place' : 'https://www.google.com/maps');
    if (key) url.searchParams.set('key', key);
    else url.searchParams.set('output', 'embed');
    url.searchParams.set('q', query);
    url.searchParams.set(key ? 'zoom' : 'z', String(config.maps.zoom));
    if (key) url.searchParams.set('language', 'en');
    iframe.src = url.href;
    root.replaceChildren(iframe); root.hidden = false; placeholder.hidden = true; unload.hidden = false;
    status.textContent = verified ? 'Loading the confirmed location…' : 'Loading the Umhlanga area map…';
    iframe.addEventListener('load', () => {
      clearTimeout(timer);
      status.textContent = `${verified ? 'Confirm collection arrangements before travelling.' : 'Umhlanga area view. This is not a confirmed bakery storefront pin.'} If the map is unavailable, use “Open Google Maps”.`;
    });
    timer = setTimeout(() => { status.textContent = 'The map is taking longer to load. You can open Google Maps directly using the link above.'; }, 12000);
  }
  load.addEventListener('click', loadMap);
  unload.addEventListener('click', () => {
    clearTimeout(timer); root.replaceChildren(); root.hidden = true; placeholder.hidden = false; unload.hidden = true;
    status.textContent = 'Map unloaded. You can reload it or open Google Maps directly.'; load.focus();
  });
})();
