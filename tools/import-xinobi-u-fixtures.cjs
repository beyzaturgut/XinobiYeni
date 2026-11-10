#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DEFAULT_PACKAGE = path.resolve(__dirname, '../fixtures/product-surfaces/xinobi-u-accepted');
const DEFAULT_TARGET = path.resolve(__dirname, '../services/api/App_Data');

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

function writeJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function isInside(root, target) {
  const relative = path.relative(path.resolve(root), path.resolve(target));
  return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

function assertInside(root, target, label) {
  if (!isInside(root, target)) throw new Error(`${label} paket dışına çıkıyor.`);
}

function parseArgs(argv) {
  const args = { packageRoot: DEFAULT_PACKAGE, targetRoot: DEFAULT_TARGET, apply: false, mergeCatalog: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--apply') args.apply = true;
    else if (arg === '--merge-catalog') args.mergeCatalog = true;
    else if (arg === '--package') args.packageRoot = path.resolve(argv[++i] || '');
    else if (arg === '--target') args.targetRoot = path.resolve(argv[++i] || '');
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Bilinmeyen argüman: ${arg}`);
  }
  if (args.mergeCatalog && !args.apply) throw new Error('--merge-catalog yalnızca --apply ile kullanılabilir.');
  return args;
}

function printHelp() {
  console.log(`XINOBI U accepted fixture importer\n\n` +
    `Varsayılan davranış yalnızca doğrulama ve plan çıktısıdır; dosya yazmaz.\n` +
    `Kurulum: node tools/import-xinobi-u-fixtures.cjs --apply\n` +
    `Mevcut state'e eksik ürün/varyantları eklemek için: --apply --merge-catalog\n` +
    `Özel paket/hedef: --package <dir> --target <App_Data dir>\n` +
    `Var olan dosyalar aynı SHA-256 değilse importer durur ve üzerine yazmaz.`);
}

function validateManifest(packageRoot) {
  const manifestPath = path.join(packageRoot, 'manifest.json');
  if (!fs.existsSync(manifestPath)) throw new Error(`manifest.json bulunamadı: ${manifestPath}`);
  const manifest = readJson(manifestPath);
  if (manifest.schemaVersion !== 1 || manifest.packageKind !== 'xinobi-u-accepted-surfaces') {
    throw new Error('Desteklenmeyen fixture manifest şeması.');
  }
  if (!Array.isArray(manifest.variants) || manifest.variants.length !== 8) {
    throw new Error(`Paket tam olarak 8 varyant içermeli; bulunan: ${manifest.variants?.length ?? 0}`);
  }
  const ids = new Set();
  for (const item of manifest.variants) {
    for (const key of ['slug', 'productId', 'variantId', 'version', 'source', 'files']) {
      if (!item[key]) throw new Error(`Eksik manifest alanı: ${key}`);
    }
    const idKey = `${item.productId}/${item.variantId}`;
    if (ids.has(idKey)) throw new Error(`Tekrarlı varyant: ${idKey}`);
    ids.add(idKey);
    const variantRoot = path.join(packageRoot, 'variants', item.slug);
    const versionRoot = path.join(variantRoot, item.version);
    assertInside(packageRoot, variantRoot, item.slug);
    assertInside(packageRoot, versionRoot, item.version);
    const currentPath = path.join(variantRoot, 'current.json');
    const current = readJson(currentPath);
    if (current.version !== item.version) throw new Error(`${item.slug}/current.json sürümü uyuşmuyor.`);
    const acceptancePath = path.join(versionRoot, 'acceptance.json');
    const acceptance = readJson(acceptancePath);
    if (acceptance.version !== item.version || acceptance.productId !== item.productId || acceptance.variantId !== item.variantId) {
      throw new Error(`${item.slug}/acceptance.json kimlikleri manifest ile uyuşmuyor.`);
    }
    if (acceptance.sourceSha256 !== item.source.sha256) throw new Error(`${item.slug} kaynak SHA uyuşmuyor.`);
    for (const [name, info] of Object.entries(item.files)) {
      const file = name === 'current.json' ? currentPath : path.join(versionRoot, name);
      assertInside(packageRoot, file, `${item.slug}/${name}`);
      if (!fs.existsSync(file)) throw new Error(`Paket dosyası bulunamadı: ${file}`);
      const bytes = fs.readFileSync(file);
      if (bytes.length !== info.bytes || sha256(bytes) !== info.sha256) {
        throw new Error(`Paket dosyası bozuk veya manifest dışı: ${item.slug}/${name}`);
      }
    }
    const sourcePath = path.join(packageRoot, item.source.path);
    assertInside(packageRoot, sourcePath, `${item.slug} kaynak`);
    if (!fs.existsSync(sourcePath)) throw new Error(`Kaynak medya bulunamadı: ${sourcePath}`);
    const source = fs.readFileSync(sourcePath);
    if (source.length !== item.source.bytes || sha256(source) !== item.source.sha256) {
      throw new Error(`Kaynak medya bozuk veya manifest dışı: ${item.source.path}`);
    }
  }
  const fragmentPath = path.join(packageRoot, 'catalog-state.fragment.json');
  const fragment = readJson(fragmentPath);
  if (!Array.isArray(fragment.products) || fragment.products.length !== 3) {
    throw new Error('Katalog fragmentı CM101, CM121 ve EC501 olmak üzere 3 ürün ailesi içermeli.');
  }
  if (!Array.isArray(manifest.catalogMedia)) throw new Error('Manifest katalog medyası listesi içermiyor.');
  for (const media of manifest.catalogMedia) {
    if (!media.fileName || !media.path || !media.sha256 || !Number.isInteger(media.bytes)) throw new Error('Geçersiz katalog medya girdisi.');
    const sourcePath = path.join(packageRoot, media.path);
    assertInside(packageRoot, sourcePath, `katalog medya ${media.fileName}`);
    if (!fs.existsSync(sourcePath)) throw new Error(`Katalog medyası bulunamadı: ${sourcePath}`);
    const bytes = fs.readFileSync(sourcePath);
    if (bytes.length !== media.bytes || sha256(bytes) !== media.sha256) throw new Error(`Katalog medyası bozuk: ${media.fileName}`);
  }
  return { manifest, fragment };
}

function hashFile(file) {
  return sha256(fs.readFileSync(file));
}

function planCopy(operations, source, destination, label, scheduledDestinations = null) {
  if (scheduledDestinations?.has(destination)) return;
  scheduledDestinations?.add(destination);
  if (fs.existsSync(destination)) {
    if (!fs.statSync(destination).isFile()) throw new Error(`${label} hedefi dosya değil.`);
    if (hashFile(source) !== hashFile(destination)) throw new Error(`${label} hedefte farklı; üzerine yazılmadı.`);
    operations.push({ kind: 'skip', label, destination });
    return;
  }
  operations.push({ kind: 'copy', source, destination, label });
}

function stateMerge(fragment, statePath, mergeCatalog) {
  if (!fs.existsSync(statePath)) {
    const state = { products: fragment.products, prices: {}, content: {}, categories: [], announcements: [] };
    return { state, action: 'create' };
  }
  const current = readJson(statePath);
  if (!Array.isArray(current.products)) throw new Error('Mevcut catalog state products dizisi içermiyor.');
  const next = { ...current, products: current.products.map(product => ({ ...product, variants: Array.isArray(product.variants) ? [...product.variants] : [] })) };
  let additions = 0;
  for (const product of fragment.products) {
    const existing = next.products.find(candidate => candidate.id === product.id);
    if (!existing) {
      next.products.push(product);
      additions += 1;
      continue;
    }
    for (const key of ['name', 'category', 'active', 'personalizable']) {
      if ((existing[key] ?? null) !== (product[key] ?? null)) {
        throw new Error(`Mevcut ürün metadata çakışması: ${product.id}.${key}`);
      }
    }
    for (const variant of product.variants) {
      const found = existing.variants.find(candidate => candidate.id === variant.id);
      if (!found) {
        if (!mergeCatalog) throw new Error(`Eksik varyant için --merge-catalog gerekli: ${variant.id}`);
        existing.variants.push(variant);
        additions += 1;
      } else if (JSON.stringify(found) !== JSON.stringify(variant)) {
        throw new Error(`Mevcut varyant metadata çakışması: ${variant.id}`);
      }
    }
  }
  if (additions && !mergeCatalog) throw new Error('Mevcut state eksik; kullanıcı verisini değiştirmemek için --merge-catalog belirtin.');
  return { state: next, action: additions ? 'merge' : 'skip' };
}

function buildPlan({ packageRoot, targetRoot, manifest, fragment, mergeCatalog }) {
  const operations = [];
  const scheduledDestinations = new Set();
  const acceptedRoot = path.join(targetRoot, 'catalog-surface-review', 'accepted');
  const mediaRoot = path.join(targetRoot, 'real-catalog-qa', 'media');
  const statePath = path.join(targetRoot, 'real-catalog-qa', 'state.json');
  assertInside(targetRoot, acceptedRoot, 'accepted hedefi');
  assertInside(targetRoot, mediaRoot, 'media hedefi');
  assertInside(targetRoot, statePath, 'state hedefi');
  for (const item of manifest.variants) {
    const key = sha256(Buffer.from(JSON.stringify([item.productId, item.variantId])));
    const destinationRoot = path.join(acceptedRoot, key);
    const destinationVersion = path.join(destinationRoot, item.version);
    const sourceVersion = path.join(packageRoot, 'variants', item.slug, item.version);
    for (const name of ['mask.png', 'branding.png', 'acceptance.json']) {
      planCopy(operations, path.join(sourceVersion, name), path.join(destinationVersion, name), `${item.slug}/${item.version}/${name}`, scheduledDestinations);
    }
    planCopy(operations, path.join(packageRoot, 'variants', item.slug, 'current.json'), path.join(destinationRoot, 'current.json'), `${item.slug}/current.json`, scheduledDestinations);
    planCopy(operations, path.join(packageRoot, item.source.path), path.join(mediaRoot, item.source.fileName), `${item.slug} kaynak medya`, scheduledDestinations);
  }
  for (const media of manifest.catalogMedia) {
    planCopy(operations, path.join(packageRoot, media.path), path.join(mediaRoot, media.fileName), `katalog medya ${media.fileName}`, scheduledDestinations);
  }
  const stateResult = stateMerge(fragment, statePath, mergeCatalog);
  if (stateResult.action !== 'skip') operations.push({ kind: 'json', destination: statePath, value: stateResult.state, label: `catalog state (${stateResult.action})` });
  return operations;
}

function execute(operations) {
  for (const operation of operations) {
    if (operation.kind === 'skip') continue;
    fs.mkdirSync(path.dirname(operation.destination), { recursive: true });
    if (operation.kind === 'copy') fs.copyFileSync(operation.source, operation.destination, fs.constants.COPYFILE_EXCL);
    else fs.writeFileSync(operation.destination, writeJson(operation.value), { flag: 'wx' });
  }
}

function main() {
  console.warn('LEGACY variant fixture import only; not a single-source migration. See docs/runbooks/single-source-personalization.md.');
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return printHelp();
  const { manifest, fragment } = validateManifest(args.packageRoot);
  const operations = buildPlan({ ...args, manifest, fragment });
  const writes = operations.filter(operation => operation.kind !== 'skip');
  console.log(`Fixture doğrulandı: ${manifest.variants.length} varyant, ${operations.length} hedef işlemi.`);
  if (!args.apply) {
    console.log('Plan modu: dosya yazılmadı. Uygulamak için --apply kullanın.');
    for (const operation of writes) console.log(`CREATE ${operation.destination}`);
    return;
  }
  execute(writes);
  console.log(`Kurulum tamamlandı: ${writes.length} yeni dosya yazıldı; mevcut eşleşen dosyalar korunarak atlandı.`);
}

if (require.main === module) {
  try { main(); } catch (error) { console.error(`Fixture kurulumu durdu: ${error.message}`); process.exitCode = 1; }
}

module.exports = { validateManifest, buildPlan, stateMerge };
