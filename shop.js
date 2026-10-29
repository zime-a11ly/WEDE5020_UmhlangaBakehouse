(function () {
  'use strict';
  const data = window.BAKEHOUSE_CATALOGUE, bag = window.BAKEHOUSE_BAG;
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  const input = document.getElementById('product-search');
  const sort = document.getElementById('product-sort');
  let category = 'all';
  const initial = new URLSearchParams(location.search);
  if (['Cakes', 'Bread & loaves', 'Pastries'].includes(initial.get('category'))) category = initial.get('category');
  if (initial.has('search')) input.value = initial.get('search').slice(0, 80);

  function card(p) {
    return `<article class="product-card" id="${p.id}" data-product="${p.id}"><a class="product-photo" href="#${p.id}" data-details="${p.id}" aria-label="View details for ${p.name}"><span class="product-tag">${p.tag}</span><img src="${p.image}" alt="${p.alt}" width="640" height="640" loading="lazy"></a><div class="product-details"><p class="eyebrow">${p.category}</p><h3>${p.name}</h3><div class="product-bottom"><span class="price">${bag.money(p.price)}</span><button class="add-button" type="button" data-add="${p.id}" aria-label="Add ${p.name} to bag"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button></div></div></article>`;
  }
  function render() {
    const query = input.value.trim().toLocaleLowerCase();
    const list = data.filter(p => (category === 'all' || p.category === category) && `${p.name} ${p.category} ${p.description}`.toLocaleLowerCase().includes(query));
    if (sort.value === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sort.value === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sort.value === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    grid.innerHTML = list.map(card).join('');
    document.getElementById('empty-results').hidden = list.length > 0;
    document.getElementById('results-count').textContent = `${list.length} ${list.length === 1 ? 'lovely thing' : 'lovely things'} to choose from`;
    document.querySelectorAll('[data-filter]').forEach(button => {
      const active = button.dataset.filter === category;
      button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active));
    });
  }
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { category = button.dataset.filter; render(); }));
  input.addEventListener('input', render);
  sort.addEventListener('change', render);
  document.getElementById('reset-filters').addEventListener('click', () => { input.value = ''; category = 'all'; sort.value = 'featured'; render(); input.focus(); });

  const dialog = document.getElementById('product-dialog');
  function details(id) {
    const p = data.find(item => item.id === id);
    if (!p) return;
    dialog.querySelector('[data-product-detail]').innerHTML = `<div class="product-detail-grid"><img src="${p.image}" alt="${p.alt}" ${p.cutout ? 'class="is-cutout"' : ''}><div class="product-detail-copy"><p class="eyebrow">${p.category}</p><h2 id="product-dialog-title">${p.name}</h2><p>${p.description}</p><strong class="price">${bag.money(p.price)} / ${p.unit}</strong><button type="button" class="button" data-add="${p.id}">Add to my bag +</button><p class="small-note">${p.allergens}</p><p class="small-note">Illustrative image. Final appearance, size and availability are confirmed with your enquiry.</p></div></div>`;
    window.BAKEHOUSE_UI.openDialog(dialog);
  }
  grid.addEventListener('click', event => {
    const link = event.target.closest('[data-details]');
    if (link) { event.preventDefault(); details(link.dataset.details); }
  });
  render();
  if (location.hash) details(decodeURIComponent(location.hash.slice(1)));
})();
