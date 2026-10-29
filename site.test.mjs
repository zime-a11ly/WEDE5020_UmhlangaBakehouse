import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import {once} from 'node:events';
import {createServer} from '../server.mjs';

const require = createRequire(import.meta.url);
const rules = require('../js/validation.js');
const products = require('../js/catalogue.js');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const valid = {name:'Test Baker',email:'baker@example.com',phone:'+27 82 123 4567',consent:true,message:'A test enquiry for the bakery.',requestId:'test-request-123456',website:''};
const contact = {...valid,subject:'General question'};
const enquiry = {...valid,requestType:'bag',occasion:'Birthday',requiredDate:'2099-01-01',items:[{id:'chocolate-dream-cake',quantity:2},{id:'vanilla-bean-loaf',quantity:1}]};

async function withServer(options, run) {
  const server = createServer(options);
  server.listen(0,'127.0.0.1'); await once(server,'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try { await run(base); } finally { server.closeAllConnections(); await new Promise(resolve=>server.close(resolve)); }
}
function submit(base, endpoint, body, headers={}) { return fetch(base+endpoint,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)}); }

test('menu estimate uses authoritative prices and ignores client totals',()=>{
  const result=rules.validate({...enquiry,total:1,items:[{id:'chocolate-dream-cake',quantity:2,price:1},{id:'vanilla-bean-loaf',quantity:1,price:0}]},'enquiry');
  assert.deepEqual(result.errors,{}); assert.equal(rules.estimate(result.data),58500);
  assert.match(rules.summary(result.data,'enquiry'),/R585\.00/);
});
test('invalid quantities, duplicate items, unknown products and empty bags are rejected',()=>{
  for(const items of [[],[{id:'unknown',quantity:1}],[{id:'vanilla-bean-loaf',quantity:0}],[{id:'vanilla-bean-loaf',quantity:1.5}],[{id:'vanilla-bean-loaf',quantity:100}],[{id:'vanilla-bean-loaf',quantity:1},{id:'vanilla-bean-loaf',quantity:1}]]) assert.ok(rules.validate({...enquiry,items},'enquiry').errors.items);
});
test('form validation rejects bad contact details, missing consent and invalid dates',()=>{
  assert.ok(rules.validate({...contact,name:' ',email:'bad',phone:'123',consent:false,message:'tiny'},'contact').errors.email);
  for(const date of ['2000-01-01','2099-02-30','invalid','']) assert.ok(rules.validate({...enquiry,requiredDate:date},'enquiry').errors.requiredDate);
  assert.ok(rules.validate({...contact,website:'spam'},'contact').errors.form);
  assert.ok(rules.validate({...enquiry,requestType:'custom',message:''},'enquiry').errors.message);
  assert.deepEqual(rules.validate(contact,'contact').errors,{});
});
test('cart persists across page loads, bounds quantity, removes items and survives blocked storage',async()=>{
  const source=await readFile(path.join(root,'js/cart.js'),'utf8');
  const values=new Map();
  const localStorage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)};
  function boot(storage) {
    const events=new Map();
    const window={BAKEHOUSE_CATALOGUE:products,BAKEHOUSE_UI:{toast(){}},addEventListener:(name,fn)=>events.set(name,fn),dispatchEvent:event=>events.get(event.type)?.()};
    const document={querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){}};
    vm.runInNewContext(source,{window,document,localStorage:storage,CustomEvent:class {constructor(type){this.type=type;}}});
    return window.BAKEHOUSE_BAG;
  }
  let bag=boot(localStorage);bag.add('vanilla-bean-loaf');bag.add('chocolate-dream-cake');bag.add('chocolate-dream-cake');
  assert.equal(bag.total(),58500); assert.equal(boot(localStorage).count(),3);
  assert.equal(bag.setQuantity('vanilla-bean-loaf',1.2),false);assert.equal(bag.setQuantity('vanilla-bean-loaf',100),false);
  bag.remove('vanilla-bean-loaf');assert.equal(bag.total(),50000);bag.clear();assert.equal(bag.count(),0);
  values.set('umhlanga-bakehouse-bag-v1',JSON.stringify([{id:'unknown',quantity:3},{id:'vanilla-bean-loaf',quantity:-1}]));assert.equal(boot(localStorage).count(),0);
  bag=boot({getItem(){throw new Error('blocked')},setItem(){throw new Error('blocked')}});bag.add('butter-croissant-box');assert.equal(bag.total(),12000);
});
test('HTTP service is honest when email is unavailable and protects private files',async()=>{
  await withServer({env:{},rateLimit:100},async base=>{
    assert.equal((await (await fetch(base+'/api/health')).json()).emailReady,false);
    assert.equal((await submit(base,'/api/contact',contact)).status,503);
    assert.equal((await submit(base,'/api/contact',{...contact,email:'broken'})).status,422);
    assert.equal((await submit(base,'/api/contact',contact,{Origin:'https://untrusted.example'})).status,403);
    for(const url of ['/.env','/server.mjs','/package.json','/docs/original-submissions/original-proposals.pdf','/%2e%2e%2fserver.mjs']) assert.equal((await fetch(base+url)).status,404);
    assert.equal((await fetch(base+'/index.html')).status,200);
    assert.equal((await fetch(base+'/assets/images/umhlanga-bakehouse-logo.webp')).status,200);
  });
});
test('configured email submission sends only to the configured recipient and provides retry keys',async()=>{
  const calls=[];
  await withServer({env:{RESEND_API_KEY:'test-key',MAIL_FROM:'Bakery <sender@example.com>',CONTACT_EMAIL:'bakery@example.com'},fetchImpl:async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({id:'test-delivery-1'})};}},async base=>{
    for(let i=0;i<2;i++) {const response=await submit(base,'/api/enquiry',{...enquiry,to:'attacker@example.com'});assert.equal(response.status,200);const result=await response.json();assert.equal(result.estimate,58500);assert.match(result.reference,/^UB-/);}
    assert.equal(calls[0].url,'https://api.resend.com/emails');
    assert.equal(calls[0].options.headers['Idempotency-Key'],calls[1].options.headers['Idempotency-Key']);
    const sent=JSON.parse(calls[0].options.body);assert.deepEqual(sent.to,['bakery@example.com']);assert.equal(sent.reply_to,valid.email);assert.match(sent.text,/R585\.00/);
  });
});
test('provider rejection and rate limits never claim success',async()=>{
  await withServer({env:{RESEND_API_KEY:'test-key',MAIL_FROM:'sender@example.com',CONTACT_EMAIL:'bakery@example.com'},rateLimit:1,fetchImpl:async()=>({ok:false,json:async()=>({error:'Unavailable'})})},async base=>{
    const first=await submit(base,'/api/contact',contact);assert.equal(first.status,502);assert.equal((await first.json()).ok,false);
    const second=await submit(base,'/api/contact',contact);assert.equal(second.status,429);
  });
});
test('all pages have SEO metadata, one main heading, valid local links and descriptive images',async()=>{
  const names=(await readdir(root)).filter(name=>name.endsWith('.html'));
  assert.equal(names.length,8);
  const titles=new Set();
  for(const name of names) {
    const html=await readFile(path.join(root,name),'utf8');
    const title=html.match(/<title>(.*?)<\/title>/)?.[1];assert.ok(title);titles.add(title);
    assert.match(html,/<meta name="description" content="[^"]{60,}"/);assert.match(html,/<meta name="keywords"/);assert.match(html,/<link rel="canonical"/);
    assert.equal((html.match(/<h1[\s>]/g)||[]).length,1,name);
    for(const img of html.matchAll(/<img\b[^>]*>/g)) assert.match(img[0],/alt="[^"]+"/);
    for(const match of html.matchAll(/(?:src|href)="([^"#?]+)[^"]*"/g)) {
      const value=match[1];if(/^(?:https?:|mailto:|tel:|#|data:)/.test(value))continue;
      assert.ok((await stat(path.join(root,value))).isFile(),`${name}: ${value}`);
    }
    for(const form of html.matchAll(/<form\b[^>]*>/g)) {assert.match(form[0],/action="api\/(contact|enquiry)"/);assert.match(form[0],/method="post"/);}
  }
  assert.equal(titles.size,8);
});
