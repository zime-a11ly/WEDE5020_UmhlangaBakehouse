(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./catalogue.js'));
  else root.BAKEHOUSE_FORMS = factory(root.BAKEHOUSE_CATALOGUE);
})(typeof window !== 'undefined' ? window : globalThis, function (catalogue) {
  'use strict';
  const money = cents => `R${(cents / 100).toFixed(2)}`;
  function today() {
    const parts = new Intl.DateTimeFormat('en-CA', {timeZone: 'Africa/Johannesburg', year: 'numeric', month: '2-digit', day: '2-digit'}).formatToParts(new Date());
    const get = type => parts.find(part => part.type === type).value;
    return `${get('year')}-${get('month')}-${get('day')}`;
  }
  function validate(input, kind) {
    const errors = {};
    if (!input || typeof input !== 'object' || Array.isArray(input)) return {data: {}, errors: {form: 'Please provide a valid form.'}};
    const text = (key, max = 2000) => typeof input[key] === 'string' ? input[key].trim().slice(0, max + 1) : '';
    const data = {name: text('name', 100), email: text('email', 254), phone: text('phone', 25), message: text('message'), consent: input.consent === true, requestId: text('requestId', 80)};
    if (data.name.length < 2 || data.name.length > 100 || /[\r\n]/.test(data.name)) errors.name = 'Enter your name using 2–100 characters.';
    if (data.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Enter a valid email, such as name@example.com.';
    if (data.phone && (!/^\+?[\d ()-]{7,25}$/.test(data.phone) || data.phone.replace(/\D/g, '').length < 7 || data.phone.replace(/\D/g, '').length > 15)) errors.phone = 'Enter a phone number with 7–15 digits; a leading + is welcome.';
    if (data.message.length > 2000) errors.message = 'Keep your message under 2,000 characters.';
    if (!data.consent) errors.consent = 'Please agree so we can respond to your request.';
    if (text('website')) errors.form = 'We could not accept this request.';
    if (!/^[a-zA-Z0-9-]{8,80}$/.test(data.requestId)) errors.form = 'Please prepare a new summary and try again.';
    if (kind === 'contact') {
      data.subject = text('subject', 80);
      if (!['General question', 'Order question', 'Feedback', 'Other'].includes(data.subject)) errors.subject = 'Choose a message topic.';
      if (data.message.length < 10) errors.message = 'Write at least 10 characters so we can help.';
    } else if (kind === 'enquiry') {
      data.requestType = text('requestType', 20);
      data.requiredDate = text('requiredDate', 10);
      data.occasion = text('occasion', 40);
      if (!['bag', 'menu', 'custom', 'catering'].includes(data.requestType)) errors.requestType = 'Choose what you are planning.';
      const parsed = new Date(`${data.requiredDate}T12:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data.requiredDate) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== data.requiredDate || data.requiredDate < today()) errors.requiredDate = 'Choose today or a future date.';
      if (!['Everyday treat', 'Birthday', 'Celebration', 'Work event', 'Other'].includes(data.occasion)) errors.occasion = 'Choose an occasion.';
      if (['custom', 'catering'].includes(data.requestType) && data.message.length < 10) errors.message = 'Tell us a little more: at least 10 characters about your request.';
      data.items = [];
      if (['bag', 'menu'].includes(data.requestType)) {
        const items = Array.isArray(input.items) ? input.items : [];
        const seen = new Set();
        if (!items.length || items.length > catalogue.length) errors.items = 'Choose a menu bake or add some favourites to your bag.';
        if (data.requestType === 'menu' && items.length !== 1) errors.items = 'Choose one menu bake for this enquiry.';
        for (const line of items) {
          if (!line || !catalogue.some(p => p.id === line.id) || seen.has(line.id) || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 99) {
            errors.items = 'Use a whole quantity from 1 to 99 for each valid bake.'; break;
          }
          seen.add(line.id); data.items.push({id: line.id, quantity: line.quantity});
        }
      }
    } else errors.form = 'Unknown form type.';
    return {data, errors};
  }
  function estimate(data) {
    return (data.items || []).reduce((sum, line) => sum + catalogue.find(p => p.id === line.id).price * line.quantity, 0);
  }
  function summary(data, kind) {
    const lines = ['UMHLANGA BAKEHOUSE', kind === 'contact' ? 'GENERAL MESSAGE' : 'BAKERY ENQUIRY', '', `Name: ${data.name}`, `Email: ${data.email}`, `Phone: ${data.phone || 'Not supplied'}`];
    if (kind === 'contact') lines.push(`Topic: ${data.subject}`);
    else {
      const labels = {bag: 'My bag', menu: 'Menu bake', custom: 'Custom cake', catering: 'Catering / bulk order'};
      lines.push('', `Request: ${labels[data.requestType]}`, `Preferred date: ${data.requiredDate}`, `Occasion: ${data.occasion}`, '');
      (data.items || []).forEach(line => {
        const p = catalogue.find(product => product.id === line.id);
        lines.push(`${line.quantity} × ${p.name} — ${money(p.price * line.quantity)}`);
      });
      lines.push(data.items?.length ? `Menu estimate: ${money(estimate(data))}` : 'Price: a personalised quotation is required.');
      lines.push('Availability: the bakery needs to confirm your preferred date.', 'Collection, product sizes and any additional costs: to be agreed.');
    }
    lines.push('', 'MESSAGE', data.message || 'No additional notes.', '', 'This is an enquiry, not a confirmed order or proof of payment.');
    return lines.join('\n');
  }
  return Object.freeze({today, validate, summary, estimate, money});
});
