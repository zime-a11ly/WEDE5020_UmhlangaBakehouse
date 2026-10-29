(function () {
  'use strict';
  const KEY = 'umhlanga-bakehouse-bag-v1';
  const products = window.BAKEHOUSE_CATALOGUE;
  let memory = [];
  let storageAvailable = true;
  const money = cents => `R${(cents / 100).toFixed(2)}`;
  const find = id => products.find(product => product.id === id);

  function normalise(value) {
    if (!Array.isArray(value)) return [];
    const seen = new Set();
    return value.filter(line => {
      if (!line || !find(line.id) || seen.has(line.id) || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 99) return false;
      seen.add(line.id);
      return true;
    }).map(({id, quantity}) => ({id, quantity}));
  }
  function read() {
    try {
      memory = normalise(JSON.parse(localStorage.getItem(KEY) || '[]'));
    } catch (error) {
      if (!(error instanceof SyntaxError)) storageAvailable = false;
    }
    return memory.map(line => ({...line}));
  }
  function lines() { return storageAvailable ? read() : memory.map(line => ({...line})); }
  function write(next) {
    memory = normalise(next);
    try { localStorage.setItem(KEY, JSON.stringify(memory)); }
    catch { storageAvailable = false; }
    window.dispatchEvent(new CustomEvent('bagchange'));
  }
  function add(id) {
    if (!find(id)) return;
    const next = lines(), existing = next.find(line => line.id === id);
    if (existing?.quantity === 99) { window.BAKEHOUSE_UI?.toast('A maximum of 99 of each bake can be added.'); return; }
    if (existing) existing.quantity += 1;
    else next.push({id, quantity: 1});
    write(next);
    window.BAKEHOUSE_UI?.toast(`${find(id).name} added to your bag.`);
  }
  function setQuantity(id, quantity) {
    if (!find(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) return false;
    write(lines().map(line => line.id === id ? {...line, quantity} : line));
    return true;
  }
  function total(items = lines()) { return items.reduce((sum, line) => sum + find(line.id).price * line.quantity, 0); }
  function count() { return lines().reduce((sum, line) => sum + line.quantity, 0); }
  function remove(id) {
    write(lines().filter(line => line.id !== id));
    window.BAKEHOUSE_UI?.toast(`${find(id)?.name || 'Item'} removed from your bag.`);
  }
  function render() {
    const current = lines();
    const quantity = current.reduce((sum, line) => sum + line.quantity, 0);
    document.querySelectorAll('[data-cart-count]').forEach(node => { node.textContent = String(quantity); });
    document.querySelectorAll('.bag-link').forEach(link => link.setAttribute('aria-label', `View your bag, ${quantity} ${quantity === 1 ? 'item' : 'items'}`));
    document.querySelectorAll('[data-storage-warning]').forEach(node => { node.hidden = storageAvailable; });
    const root = document.querySelector('[data-cart-items]');
    if (!root) return;
    document.querySelector('[data-cart-empty]').hidden = current.length > 0;
    document.querySelector('[data-cart-filled]').hidden = current.length === 0;
    root.innerHTML = current.map(line => {
      const p = find(line.id);
      return `<article class="cart-item" data-line="${p.id}">
        <img src="${p.image}" alt="${p.alt}" width="100" height="110" ${p.cutout ? 'class="is-cutout"' : ''}>
        <div><h3>${p.name}</h3><p>${money(p.price)} / ${p.unit}</p>
        <div class="quantity-row"><div class="quantity-control">
          <button type="button" data-decrease="${p.id}" aria-label="Decrease ${p.name} quantity" ${line.quantity === 1 ? 'disabled' : ''}>−</button>
          <label class="sr-only" for="qty-${p.id}">${p.name} quantity</label><input type="number" id="qty-${p.id}" data-quantity="${p.id}" value="${line.quantity}" min="1" max="99" step="1" inputmode="numeric">
          <button type="button" data-increase="${p.id}" aria-label="Increase ${p.name} quantity" ${line.quantity === 99 ? 'disabled' : ''}>+</button>
        </div><button type="button" class="remove-item" data-remove="${p.id}" aria-label="Remove ${p.name}">Remove</button></div></div>
        <strong class="cart-item-total">${money(p.price * line.quantity)}</strong></article>`;
    }).join('');
    document.querySelector('[data-summary-count]').textContent = String(quantity);
    document.querySelector('[data-cart-total]').textContent = money(total(current));
  }

  document.addEventListener('click', event => {
    const target = event.target.closest('button');
    if (!target) return;
    if (target.dataset.add) add(target.dataset.add);
    if (target.dataset.remove) {
      const id = target.dataset.remove;
      const oldIndex = lines().findIndex(line => line.id === id);
      remove(id);
      const nextButtons = document.querySelectorAll('[data-remove]');
      (nextButtons[Math.min(oldIndex, nextButtons.length - 1)] || document.querySelector('[data-cart-empty] .button'))?.focus();
    }
    for (const [key, delta] of [['increase', 1], ['decrease', -1]]) {
      if (!target.dataset[key]) continue;
      const id = target.dataset[key];
      const line = lines().find(item => item.id === id);
      if (!line || !setQuantity(id, line.quantity + delta)) continue;
      const control = document.querySelector(`[data-${key}="${id}"]`);
      (control?.disabled ? document.getElementById(`qty-${id}`) : control)?.focus();
      window.BAKEHOUSE_UI?.toast(`Bag updated. Subtotal ${money(total())}.`);
    }
    if (target.matches('[data-clear-cart]')) window.BAKEHOUSE_UI.openDialog(document.getElementById('clear-dialog'));
    if (target.matches('[data-confirm-clear]')) {
      write([]);
      document.getElementById('clear-dialog').close();
      document.querySelector('[data-cart-empty] .button')?.focus();
      window.BAKEHOUSE_UI?.toast('Your bag is now empty.');
    }
  });
  document.addEventListener('change', event => {
    if (!event.target.matches('[data-quantity]')) return;
    const input = event.target, id = input.dataset.quantity;
    if (!setQuantity(id, Number(input.value))) {
      input.value = String(lines().find(line => line.id === id)?.quantity || 1);
      window.BAKEHOUSE_UI?.toast('Please enter a whole quantity from 1 to 99.');
    } else window.BAKEHOUSE_UI?.toast(`Bag updated. Subtotal ${money(total())}.`);
    document.getElementById(`qty-${id}`)?.focus();
  });
  window.addEventListener('bagchange', render);
  window.addEventListener('storage', event => {
    if (event.key === KEY || event.key === null) { read(); window.dispatchEvent(new CustomEvent('bagchange')); }
  });
  window.BAKEHOUSE_BAG = Object.freeze({lines, add, setQuantity, remove, total, count, money, find, clear: () => write([])});
  read();
  render();
})();
