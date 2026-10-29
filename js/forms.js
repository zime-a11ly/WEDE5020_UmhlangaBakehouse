(function () {
  'use strict';
  const form = document.querySelector('[data-form]');
  if (!form) return;
  const kind = form.dataset.form, rules = window.BAKEHOUSE_FORMS, bag = window.BAKEHOUSE_BAG;
  const field = name => form.elements.namedItem(name);
  const status = form.querySelector('[data-form-status]');
  const result = document.querySelector('[data-form-result]');
  const summaryNode = result.querySelector('[data-summary]');
  const resultStatus = result.querySelector('[data-result-status]');
  const sendButton = result.querySelector('[data-send]');
  const sendStatus = result.querySelector('[data-send-status]');
  const emailLink = result.querySelector('[data-email]');
  let prepared = null, deliveryReady = false, busy = false;
  form.noValidate = true;

  function setError(name, message = '') {
    const input = field(name);
    if (!input) return;
    input.setAttribute('aria-invalid', String(Boolean(message)));
    const node = document.getElementById(`${name}-error`);
    if (node) node.textContent = message;
  }
  function clearErrors() {
    [...form.elements].filter(input => input.name).forEach(input => setError(input.name));
  }
  function invalidate() {
    if (!prepared) return;
    prepared = null; result.hidden = true;
    status.textContent = 'Details changed. Prepare your summary again to include the latest information.';
  }
  function syncEnquiry() {
    if (kind !== 'enquiry') return;
    const isMenu = field('requestType').value === 'menu';
    document.querySelector('[data-menu-fields]').hidden = !isMenu;
    ['product', 'quantity'].forEach(name => { field(name).disabled = !isMenu; field(name).required = isMenu; });
    const isCustom = ['custom', 'catering'].includes(field('requestType').value);
    field('message').required = isCustom;
    field('message').minLength = isCustom ? 10 : 0;
    const node = document.querySelector('[data-enquiry-bag]');
    node.hidden = field('requestType').value !== 'bag';
    node.replaceChildren();
    if (!node.hidden) {
      const heading = document.createElement('strong'); heading.textContent = 'Your bag'; node.append(heading);
      bag.lines().forEach(line => {
        const p = document.createElement('p'); p.textContent = `${line.quantity} × ${bag.find(line.id).name}`; node.append(p);
      });
      const p = document.createElement('p'); p.textContent = bag.count() ? `Menu estimate: ${bag.money(bag.total())}` : 'Your bag is empty. Add a bake or choose another request type.'; node.append(p);
      const a = document.createElement('a'); a.href = 'cart.html'; a.textContent = 'Review your bag'; node.append(a);
    }
  }
  function rawData() {
    const data = Object.fromEntries(new FormData(form));
    data.consent = field('consent').checked;
    data.requestId = prepared?.requestId || crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    if (kind === 'enquiry') {
      data.items = data.requestType === 'bag' ? bag.lines() : data.requestType === 'menu' ? [{id: data.product, quantity: Number(data.quantity)}] : [];
    }
    return data;
  }
  function validate() {
    const validation = rules.validate(rawData(), kind);
    if (kind === 'enquiry' && field('requestType').value === 'menu') {
      if (!bag.find(field('product').value)) validation.errors.product = 'Choose one of our menu bakes.';
      const n = Number(field('quantity').value);
      if (!Number.isInteger(n) || n < 1 || n > 99) validation.errors.quantity = 'Enter a whole quantity from 1 to 99.';
    }
    if (validation.errors.items) validation.errors.requestType = validation.errors.items;
    return validation;
  }
  function displayErrors(errors) {
    let first;
    Object.entries(errors).forEach(([name, message]) => { setError(name, message); if (!first && field(name)) first = field(name); });
    status.classList.add('error');
    status.textContent = errors.form || 'Please check the highlighted fields, then try again.';
    first?.focus();
  }
  function configureDelivery() {
    sendButton.hidden = !deliveryReady;
    const email = window.BAKEHOUSE_CONFIG.business.email;
    const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    emailLink.hidden = !hasEmail;
    if (prepared && hasEmail) {
      const subject = kind === 'enquiry' ? 'Bakery enquiry — Umhlanga Bakehouse' : `${prepared.subject} — Umhlanga Bakehouse`;
      emailLink.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summaryNode.textContent)}`;
    }
    resultStatus.textContent = deliveryReady ? 'Review your details, then choose “Send to the bakery”. Nothing has been sent yet.' : hasEmail ? 'Your summary is ready. Open an email draft to review and send it in your email app.' : 'Your summary is ready and has not been sent. Email delivery is not available yet; download or copy your details to keep them.';
  }
  form.addEventListener('submit', event => {
    event.preventDefault(); if (busy) return;
    clearErrors();
    const {data, errors} = validate();
    if (Object.keys(errors).length) { displayErrors(errors); return; }
    prepared = data;
    summaryNode.textContent = rules.summary(data, kind);
    result.hidden = false; sendButton.disabled = false; sendButton.textContent = 'Send to the bakery'; sendStatus.textContent = '';
    configureDelivery();
    status.classList.remove('error'); status.textContent = 'Your summary is ready to review below.';
    result.focus({preventScroll: true});
    result.scrollIntoView({behavior: document.body.classList.contains('motion-paused') ? 'auto' : 'smooth', block: 'start'});
  });
  form.addEventListener('input', event => {
    setError(event.target.name); invalidate();
    if (event.target.name === 'message') document.querySelector('[data-character-count]').textContent = `${event.target.value.length} / 2000`;
  });
  form.addEventListener('change', event => { setError(event.target.name); invalidate(); syncEnquiry(); });
  form.addEventListener('focusout', event => {
    if (!event.target.name || event.target.name === 'website') return;
    const {errors} = validate();
    setError(event.target.name, errors[event.target.name] || '');
  });
  window.addEventListener('bagchange', () => { invalidate(); syncEnquiry(); });
  if (kind === 'enquiry') {
    field('requiredDate').min = rules.today();
    if (new URLSearchParams(location.search).get('from') === 'bag') field('requestType').value = 'bag';
    syncEnquiry();
  }

  async function request(url, options = {}, timeout = 12000) {
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), timeout);
    try { return await fetch(url, {...options, signal: controller.signal}); }
    finally { clearTimeout(timer); }
  }
  if (location.protocol.startsWith('http')) {
    request('api/health', {}, 3000).then(async response => {
      const data = await response.json();
      deliveryReady = response.ok && data.service === 'umhlanga-bakehouse' && data.emailReady === true;
      if (prepared) configureDelivery();
    }).catch(() => { deliveryReady = false; });
  }
  sendButton.addEventListener('click', async () => {
    if (!prepared || busy || !deliveryReady) return;
    busy = true; sendButton.disabled = true; sendButton.textContent = 'Sending…'; sendStatus.classList.remove('error'); sendStatus.textContent = 'Sending your message…';
    const controls = [...form.elements].filter(input => !input.disabled);
    controls.forEach(input => { input.disabled = true; });
    try {
      const response = await request(form.getAttribute('action'), {method: 'POST', headers: {'Content-Type': 'application/json', Accept: 'application/json'}, body: JSON.stringify(prepared)});
      const data = await response.json();
      if (!response.ok || data.ok !== true || !data.reference) throw new Error(data.message || 'Delivery could not be confirmed.');
      sendStatus.textContent = `Message accepted for email delivery. Reference: ${data.reference}. The bakery will still need to confirm your request.`;
      sendButton.textContent = 'Sent for delivery'; resultStatus.textContent = 'Your message has been accepted by the email service.';
    } catch {
      sendStatus.classList.add('error'); sendStatus.textContent = 'We could not confirm delivery. Your summary is still here: download it, open an email draft if available, or try again.';
      sendButton.disabled = false; sendButton.textContent = 'Try sending again';
    } finally { busy = false; controls.forEach(input => { input.disabled = false; }); }
  });
  result.querySelector('[data-copy]').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(summaryNode.textContent); window.BAKEHOUSE_UI.toast('Your summary has been copied.'); }
    catch {
      const range = document.createRange(); range.selectNodeContents(summaryNode); const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range); window.BAKEHOUSE_UI.toast('Summary selected. Use your device’s copy command.');
    }
  });
  result.querySelector('[data-download]').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([summaryNode.textContent], {type: 'text/plain;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = `umhlanga-bakehouse-${kind}.txt`; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
})();
