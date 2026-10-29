(function () {
  'use strict';
  const tiles = [...document.querySelectorAll('[data-lightbox]')];
  const dialog = document.getElementById('lightbox');
  if (!tiles.length || !dialog) return;
  let index = 0;
  function show(next) {
    index = (next + tiles.length) % tiles.length;
    const source = tiles[index].querySelector('img');
    const image = document.getElementById('lightbox-image');
    image.src = source.src; image.alt = source.alt;
    document.getElementById('lightbox-caption').textContent = source.alt;
    document.getElementById('lightbox-count').textContent = `${index + 1} / ${tiles.length}`;
  }
  tiles.forEach((tile, number) => tile.addEventListener('click', () => { show(number); window.BAKEHOUSE_UI.openDialog(dialog); }));
  document.querySelector('[data-gallery-prev]').addEventListener('click', () => show(index - 1));
  document.querySelector('[data-gallery-next]').addEventListener('click', () => show(index + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
  });
})();
