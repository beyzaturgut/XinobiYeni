// All API requests intercepted; no real session, SQL or business writes.
import assert from 'node:assert/strict'
import { chromium } from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs'
const origin = process.env.QUOTE_UI_ORIGIN || 'http://127.0.0.1:5198'
assert.match(origin, /^http:\/\/127\.0\.0\.1:\d+$/)
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const gate = () => { let release; const promise = new Promise(resolve => { release = resolve }); return { promise, release } }
const quote = { id: 'fixture', code: 'FIXTURE-1', company: 'Synthetic company', contactName: 'Synthetic', email: 'test@example.invalid', items: [{ productId: 'p', productName: 'Fixture product', quantity: 10 }], status: 'received', createdAt: '2026-10-20T00:00:00Z', messages: [], history: [] }
const ok = (body = [quote]) => ({ status: 200, body })
let passed = 0
async function fixture(read = async () => ok(), permissions = ['quotes.read', 'quotes.write'], mutate) {
 const context = await browser.newContext(), page = await context.newPage(), errors = []
 let calls = 0, posts = 0
 page.on('pageerror', error => errors.push(error.message))
 await context.route('**/api/v1/**', async route => {
  const request = route.request(), url = new URL(request.url())
  if (request.method() === 'POST') {
   assert.ok(mutate, 'No unexpected writes allowed')
   assert.ok(permissions.includes('quotes.write'))
   assert.ok(url.pathname.endsWith('/local-commerce/quotes/fixture/status'))
   const result = await mutate(++posts, request.postDataJSON())
   return route.fulfill({ status: result.status, contentType: 'application/json', body: JSON.stringify(result.body) })
  }
  assert.equal(request.method(), 'GET', 'No unexpected writes allowed')
  let result
  if (url.pathname.endsWith('/admin/session')) result = ok({ account: { name: 'Synthetic' }, permissions })
  else if (url.pathname.endsWith('/local-commerce/state')) result = { status: 503, body: { title: 'Fixture catalog unavailable' } }
  else if (url.pathname.endsWith('/local-commerce/quotes')) result = await read(++calls, url.searchParams.get('status'))
  else if (url.pathname.endsWith('/auth/admin/refresh')) result = { status: 401, body: {} }
  else throw new Error('Unexpected request: ' + url.pathname)
  if (result.abort) return route.abort('failed')
  return route.fulfill({ status: result.status, contentType: 'application/json', body: JSON.stringify(result.body) })
 })
 await page.goto(origin + '/?view=quotes')
 const section = page.getByRole('region', { name: 'Kurumsal teklifler' })
 return { page, section, posts: () => posts, close: async () => { assert.deepEqual(errors, []); await context.close(); passed++ } }
}
try {
 { let reads=0
   const rows=Array.from({length:45},(_,i)=>({...quote,id:`q${i}`,code:`CODE-${String(i).padStart(2,'0')}`,company:i===25?'ÖZEL FİRMA':'Standard',items:[{...quote.items[0],productName:i===44?'ÇELİK ÜRÜN':'Standard product'}]}))
   const f=await fixture(async(n,status)=>{reads++;return ok(status?rows.slice(0,2):rows)})
   await f.section.getByText('45 talep',{exact:true}).waitFor()
   const next=f.section.getByRole('button',{name:'Sonraki teklif sayfası'}),prev=f.section.getByRole('button',{name:'Önceki teklif sayfası'}),search=f.section.getByRole('textbox',{name:'Yüklenen tekliflerde ara'})
   assert.equal(await prev.isEnabled(),false);assert.equal(await f.section.getByRole('button',{name:'Aç',exact:true}).count(),20)
   await f.section.getByRole('button',{name:'Aç',exact:true}).first().click()
   await f.section.getByLabel('Firmaya mesaj',{exact:true}).fill('Retained search draft')
   await next.click();await f.section.getByText(/Sayfa 2\/3/).waitFor();await next.click();await f.section.getByText(/Sayfa 3\/3/).waitFor()
   assert.equal(await next.isEnabled(),false);assert.equal(await f.section.getByRole('button',{name:'Aç',exact:true}).count(),5)
   for(const term of ['code-00','özel firma','çelik ürün']){await search.fill(term);await f.section.getByText('1 talep',{exact:true}).waitFor();await f.section.getByText(/Sayfa 1\/1/).waitFor()}
   await search.fill('missing');await f.section.getByText('Aramaya uygun talep yok',{exact:true}).waitFor()
   await f.section.getByRole('button',{name:'Aramayı temizle'}).click();await f.section.getByText('45 talep',{exact:true}).waitFor()
   assert.equal(reads,1);assert.equal(await f.section.getByRole('textbox',{name:/^Firmaya mesaj/}).inputValue(),'Retained search draft')
   await next.click();await f.section.getByRole('combobox').selectOption('reviewing');await f.section.getByText('2 talep',{exact:true}).waitFor();await f.section.getByText(/Sayfa 1\/1/).waitFor()
   await search.fill('code-01');await f.section.getByText('1 talep',{exact:true}).waitFor();assert.equal(reads,2)
   for(const width of [1440,1280,768,390]){await f.page.setViewportSize({width,height:900});await search.focus();await f.page.keyboard.press('Tab');assert.ok(await f.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))}
   assert.equal(f.posts(),0);await f.close()
 }
 for (const status of ['offered', 'accepted', 'rejected', 'closed']) for (const write of [false, true]) {
  const saved = { ...quote, status, offer: { total: { amountMinor: 12340, currency: 'TRY' }, validUntil: '2026-11-02', note: 'Fixture saved offer note' }, items: [{ ...quote.items[0], unitPrice: { amountMinor: 1234, currency: 'TRY' } }] }
  const f = await fixture(async () => ok([saved]), write ? ['quotes.read', 'quotes.write'] : ['quotes.read'])
  await f.section.getByRole('button', { name: 'Aç', exact: true }).focus(); await f.page.keyboard.press('Enter')
  const summary = f.section.getByRole('region', { name: 'Kayıtlı teklif özeti' })
  await summary.getByText('02.11.2026', { exact: true }).waitFor(); await summary.getByText('Fixture saved offer note', { exact: true }).waitFor()
  assert.equal((await summary.getByRole('cell').innerText()).replace(/\s/g, ''), new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(12.34).replace(/\s/g, ''))
  if (write && status === 'offered') {
   await f.section.getByRole('textbox', { name: /^Teklif notu \(/ }).fill('Unsaved offer draft')
   await f.section.getByLabel('Firmaya mesaj', { exact: true }).fill('Unsaved message draft')
   await summary.getByText('Fixture saved offer note', { exact: true }).waitFor()
   assert.equal(await f.section.getByRole('textbox', { name: /^Teklif notu \(/ }).inputValue(), 'Unsaved offer draft')
  }
  for (const width of [1440, 1280, 768, 390]) { await f.page.setViewportSize({ width, height: 900 }); assert.ok(await f.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)) }
  assert.equal(f.posts(), 0); await f.close()
 }
 { const f = await fixture(); await f.section.getByRole('button', { name: 'Aç', exact: true }).click()
   const summary = f.section.getByRole('region', { name: 'Kayıtlı teklif özeti' }); await summary.getByText('Henüz teklif oluşturulmamış.', { exact: true }).waitFor()
   assert.equal(await summary.getByRole('table').count(), 0); assert.equal(f.posts(), 0); await f.close() }
 { const wait = gate(), started = gate(), saved = { ...quote, offer: { total: { amountMinor: 1000, currency: 'TRY' }, validUntil: '2026-11-02', note: 'OLD SUMMARY' } }
   const f = await fixture(async (n, status) => { if (status === 'reviewing') { started.release(); await wait.promise; return ok([saved]) } return n === 1 ? ok([saved]) : { status: 503, body: { title: 'Fixture summary unavailable' } } })
   await f.section.getByRole('button', { name: 'Aç', exact: true }).click(); await f.section.getByRole('region', { name: 'Kayıtlı teklif özeti' }).getByText('OLD SUMMARY', { exact: true }).waitFor()
   await f.section.getByRole('combobox').selectOption('reviewing'); await started.promise
   assert.equal(await f.section.getByRole('region', { name: 'Kayıtlı teklif özeti' }).count(), 0)
   await f.section.getByRole('combobox').selectOption(''); await f.section.getByRole('alert').waitFor()
   wait.release(); await f.page.waitForTimeout(100); assert.equal(await f.section.getByText('OLD SUMMARY', { exact: true }).count(), 0)
   assert.equal(f.posts(), 0); await f.close() }
 { const wait = gate(), f = await fixture(async () => { await wait.promise; return ok() })
   await f.section.getByText('Teklifler yükleniyor…', { exact: true }).waitFor()
   assert.equal(await f.section.getByText('0 talep', { exact: true }).count(), 0)
   assert.equal(await f.section.getByText('Talep yok', { exact: true }).count(), 0)
   wait.release(); await f.section.getByText('1 talep', { exact: true }).waitFor(); await f.close() }
 { const f = await fixture(async () => ok([])); await f.section.getByText('Talep yok', { exact: true }).waitFor(); await f.section.getByText('0 talep', { exact: true }).waitFor(); await f.close() }
 for (const failure of [{ status: 403, body: { title: 'Fixture forbidden' } }, { status: 503, body: { title: 'Fixture unavailable' } }, { abort: true }]) {
  const wait = gate(), f = await fixture(async n => { if (n === 1) return failure; await wait.promise; return ok() })
  await f.section.getByRole('alert').waitFor(); assert.equal(await f.section.getByText('Talep yok', { exact: true }).count(), 0)
  await f.section.getByRole('button', { name: 'Tekrar dene', exact: true }).click()
  await f.section.getByText('Teklifler yükleniyor…', { exact: true }).waitFor(); assert.equal(await f.section.getByRole('alert').count(), 0)
  wait.release(); await f.section.getByText('1 talep', { exact: true }).waitFor(); await f.close()
 }
 { const wait = gate(), started = gate(), f = await fixture(async (n, status) => { if (status === 'reviewing') { started.release(); await wait.promise; return ok([{ ...quote, code: 'STALE' }]) } return ok() })
   await f.section.getByText('1 talep', { exact: true }).waitFor(); await f.section.getByRole('button', { name: 'Aç', exact: true }).click()
   await f.section.getByLabel('Firmaya mesaj', { exact: true }).fill('Retained draft')
   await f.section.getByLabel('Teklif notu (KDV, kargo, termin)', { exact: true }).fill('Retained offer')
   await f.section.getByRole('combobox').selectOption('reviewing'); await started.promise
   assert.equal(await f.section.getByText('1 talep', { exact: true }).count(), 0)
   await f.section.getByRole('combobox').selectOption(''); await f.section.getByText('1 talep', { exact: true }).waitFor()
   wait.release(); await f.page.waitForTimeout(100); assert.equal(await f.section.getByText('STALE', { exact: true }).count(), 0)
   assert.equal(await f.section.getByRole('textbox', { name: /^Firmaya mesaj/ }).inputValue(), 'Retained draft')
   assert.equal(await f.section.getByRole('textbox', { name: /^Teklif notu/ }).inputValue(), 'Retained offer'); await f.close() }
 { const wait = gate(), f = await fixture(async n => { if (n > 1) { await wait.promise; return { status: 503, body: { title: 'Fixture unavailable' } } } return ok() })
   await f.section.getByText('1 talep', { exact: true }).waitFor(); await f.section.getByRole('button', { name: 'Yenile', exact: true }).click()
   await f.section.getByText('Teklifler yükleniyor…', { exact: true }).waitFor(); assert.equal(await f.section.getByText('1 talep', { exact: true }).count(), 0)
   wait.release(); await f.section.getByRole('alert').waitFor(); assert.equal(await f.section.getByRole('button', { name: 'Aç', exact: true }).count(), 0); await f.close() }
 { const f = await fixture(async () => ok([{ ...quote, messages: [{ from: 'store', text: 'Fixture readable message', at: quote.createdAt }], history: [{ status: 'received', actor: 'customer', at: quote.createdAt, note: 'Fixture readable history' }] }]), ['quotes.read']); await f.section.getByRole('button', { name: 'Aç', exact: true }).click()
   await f.section.getByText('Fixture readable message', { exact: true }).waitFor()
   await f.section.getByText(/Fixture readable history/).waitFor()
   assert.equal(await f.section.getByRole('button', { name: 'Teklifi gönder', exact: true }).count(), 0)
   assert.equal(await f.section.getByRole('button', { name: 'Talebi kapat', exact: true }).isEnabled(), false)
   assert.equal(await f.section.getByRole('button', { name: 'İncelemeye al', exact: true }).isEnabled(), false)
   for (const width of [1440, 1280, 768, 390]) {
    await f.page.setViewportSize({ width, height: 900 })
    const button = f.section.getByRole('button', { name: 'Talebi kapat', exact: true })
    await button.evaluate(element => element.click())
    assert.equal(f.posts(), 0)
    assert.ok(await f.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
   }
   assert.equal(f.posts(), 0); await f.close() }
 for (const status of ['reviewing', 'closed']) {
  const wait = gate(), started = gate(); let current = quote
  const f = await fixture(async () => ok([current]), undefined, async (n, payload) => {
   assert.equal(payload.status, status); started.release(); await wait.promise
   current = { ...quote, status }; return ok(current)
  })
  await f.section.getByRole('button', { name: 'Aç', exact: true }).click()
  f.page.on('dialog', dialog => dialog.accept())
  const button = f.section.getByRole('button', { name: status === 'closed' ? 'Talebi kapat' : 'İncelemeye al', exact: true })
  await button.focus(); await f.page.keyboard.press('Enter'); await started.promise
  assert.equal(await button.isEnabled(), false)
  await button.evaluate(element => { element.click(); element.click() }); assert.equal(f.posts(), 1)
  wait.release(); await f.section.getByText(status === 'closed' ? 'Talep kapatıldı.' : 'İncelemeye alındı.', { exact: true }).waitFor()
  assert.equal(f.posts(), 1); await f.close()
 }
 { const f = await fixture(undefined, undefined, async () => ({ status: 503, body: { title: 'Fixture status unavailable' } }))
   await f.section.getByRole('button', { name: 'Aç', exact: true }).click()
   await f.section.getByLabel('Firmaya mesaj', { exact: true }).fill('Keep after failure')
   const button = f.section.getByRole('button', { name: 'İncelemeye al', exact: true }); await button.click()
   await f.section.getByText('Fixture status unavailable', { exact: true }).waitFor()
   assert.equal(await button.isEnabled(), true)
   assert.equal(await f.section.getByRole('textbox', { name: /^Firmaya mesaj/ }).inputValue(), 'Keep after failure')
   assert.equal(f.posts(), 1); await f.close() }
 for (const width of [1440, 1280, 768, 390]) {
  const f = await fixture(); await f.page.setViewportSize({ width, height: 900 }); const open = f.section.getByRole('button', { name: 'Aç', exact: true })
  await open.focus(); await f.page.keyboard.press('Enter'); await f.section.getByLabel('Firmaya mesaj', { exact: true }).waitFor()
  assert.ok(await f.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)); await f.close()
 }
 console.log(`PASS: ${passed} Chrome fixture scenarios; loading/count/empty/errors/retry/stale/drafts/permission/keyboard/4 widths; no real writes`)
} finally { await browser.close() }
