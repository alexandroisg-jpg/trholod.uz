import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import ts from 'typescript';

function moduleUrl(source) {
  const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } });
  return `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`;
}
const photosUrl = moduleUrl(readFileSync(new URL('../lib/refrigerant-photos.ts', import.meta.url), 'utf8'));
const packagingUrl = moduleUrl(readFileSync(new URL('../lib/refrigerant-photo-update.ts', import.meta.url), 'utf8').replace(/(['"])\.\/refrigerant-photos\1/, JSON.stringify(photosUrl)));
const studioUrl = moduleUrl(readFileSync(new URL('../lib/refrigerant-studio-update.ts', import.meta.url), 'utf8').replace(/(['"])\.\/refrigerant-photo-update\1/, JSON.stringify(packagingUrl)));
const { updateRefrigerantPackaging, smallRefrigerant } = await import(packagingUrl);
const { updateRefrigerantStudio, studioChanges, studioUpdateKey } = await import(studioUrl);

function fixture(t) {
  const sql = new DatabaseSync(':memory:');
  for (const file of ['0000_smart_namor.sql', '0001_gray_nomad.sql']) sql.exec(readFileSync(new URL(`../drizzle/${file}`, import.meta.url), 'utf8'));
  t.after(() => sql.close());
  class Statement {
    constructor(query, values = []) { this.query = query; this.values = values; }
    bind(...values) { return new Statement(this.query, values); }
    async first() { return sql.prepare(this.query).get(...this.values) ?? null; }
    run() { return sql.prepare(this.query).run(...this.values); }
  }
  const d1 = {
    prepare(query) { return new Statement(query); },
    async batch(statements) {
      sql.exec('BEGIN');
      try { const result = statements.map(statement => statement.run()); sql.exec('COMMIT'); return result; }
      catch (error) { sql.exec('ROLLBACK'); throw error; }
    },
  };
  const insert = product => {
    const fields = Object.keys(product);
    sql.prepare(`INSERT INTO products (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`).run(...Object.values(product));
  };
  const row = id => { const result = sql.prepare('SELECT * FROM products WHERE id=?').get(id); return result ? { ...result } : null; };
  const marker = () => sql.prepare('SELECT value FROM settings WHERE key=?').get(studioUpdateKey)?.value;
  return { sql, d1, insert, row, marker };
}
function product(change, overrides = {}) {
  return {
    id: change.id, sku: change.sku, category: 'Хладагенты', refrigerant: change.refrigerant,
    ...Object.fromEntries(Object.entries(change.previous).map(([field, values]) => [field, values[0]])),
    price: 984310, stock: 27, active: 1, demo: 1, model: change.refrigerant, ...overrides,
  };
}

// Real SQLite exercises the production statements, independently of catalog-data.ts.
test('all seven default cards receive a studio image and weight-free copy without changing commercial data', async t => {
  const f = fixture(t);
  assert.deepEqual(studioChanges.map(change => change.refrigerant).sort(), ['R134a', 'R290', 'R32', 'R404A', 'R407C', 'R410A', 'R600a'].sort());
  for (const change of studioChanges) f.insert(product(change));
  await updateRefrigerantStudio(f.d1);
  for (const change of studioChanges) {
    const result = f.row(change.id);
    assert.deepEqual(result, { ...product(change), ...change.next });
    assert.equal(result.title, `Хладагент TR GAS ${change.refrigerant}`);
    assert.equal(result.image, `/products/trgas-studio-${change.refrigerant.toLowerCase()}.webp`);
    assert.equal(result.brand, 'TR GAS');
    assert.doesNotMatch(`${result.title} ${result.specification} ${result.description}`, /\d+(?:[.,]\d+)?\s*(?:кг|г|л)(?:\s|$|[.,])|фасовк|фото|маленьк|больш|готовится/iu);
    assert.equal(result.price, 984310);
    assert.equal(result.stock, 27);
  }
  assert.equal(f.marker(), 'done');
});

test('a real frozen R134a default updates independently of the current catalog fixture', async t => {
  const f = fixture(t);
  const old = {
    id: 'demo-r1', sku: 'DEMO-R001', title: 'Хладагент TR Gas R134a · 13,6 кг', category: 'Хладагенты',
    description: 'Хладагент R134a из каталога TR Gas / Tura. Фасовка 13,6 кг. На фотографии — оригинальная упаковка с обозначением хладагента. Совместимость подбирается по паспорту оборудования.',
    refrigerant: 'R134a', specification: '13,6 кг · баллон', price: 1900000, stock: 4,
    image: '/products/real-trgas-r134a.webp', active: 1, demo: 1, brand: 'TR Gas', model: 'R134a', series: 'TR Gas',
  };
  f.insert(old);
  await updateRefrigerantStudio(f.d1);
  assert.equal(f.row(old.id).title, 'Хладагент TR GAS R134a');
  assert.equal(f.row(old.id).image, '/products/trgas-studio-r134a.webp');
  assert.equal(f.row(old.id).specification, 'Для систем на R134a');
  assert.equal(f.row(old.id).price, old.price);
  assert.equal(f.row(old.id).stock, old.stock);
});

test('custom text and owner images are preserved independently while other default fields update', async t => {
  const f = fixture(t), change = studioChanges[1];
  const custom = product(change, {
    title: 'Название владельца', description: 'Уточнённое описание владельца.', specification: 'Подтверждённые характеристики',
    image: '/products/owner-r410a.webp', price: 700000, stock: 123, active: 0,
  });
  f.insert(custom);
  await updateRefrigerantStudio(f.d1);
  assert.deepEqual(f.row(custom.id), { ...custom, brand: 'TR GAS', series: 'TR GAS' });
});

test('the updater does not rewrite an owner-converted or repurposed record or unrelated gas', async t => {
  const f = fixture(t);
  const products = [
    product(studioChanges[0], { demo: 0 }),
    product(studioChanges[1], { sku: 'OWNER-SKU' }),
    product(studioChanges[2], { refrigerant: 'R22' }),
    product(studioChanges[3], { category: 'Компрессоры' }),
    product(studioChanges[4], { id: 'owner-other-gas' }),
  ];
  for (const item of products) f.insert(item);
  await updateRefrigerantStudio(f.d1);
  for (const item of products) assert.deepEqual(f.row(item.id), item);
});

test('the untouched duplicate becomes inactive without deleting its record or changing its fields', async t => {
  const f = fixture(t);
  f.insert(smallRefrigerant);
  await updateRefrigerantStudio(f.d1);
  assert.deepEqual(f.row(smallRefrigerant.id), { ...smallRefrigerant, active: 0 });
  assert.equal(f.sql.prepare('SELECT COUNT(*) AS count FROM products').get().count, 1);
});

test('any owner edit to the duplicate prevents automatic retirement', async t => {
  for (const override of [
    { price: 88000 }, { stock: 9 }, { title: 'Позиция владельца' }, { description: 'Описание владельца' },
    { specification: 'Комплектация владельца' }, { image: '/products/owner-r290.webp' }, { sku: 'OWNER-R290' },
    { demo: 0 }, { brand: 'Другая марка' }, { model: 'Другая модель' }, { series: 'Другая серия' },
    { refrigerant: 'R600a' }, { category: 'Другое' },
  ]) {
    const f = fixture(t), existing = { ...smallRefrigerant, ...override };
    f.insert(existing);
    await updateRefrigerantStudio(f.d1);
    assert.deepEqual(f.row(existing.id), existing);
  }
});

test('v5 followed by v6 retires the newly inserted duplicate and replaces prior rejected packaging', async t => {
  const f = fixture(t), change = studioChanges.find(change => change.refrigerant === 'R410A');
  f.insert(product(change, { image: '/products/real-trgas-r410a.webp', description: change.previous.description[1] }));
  await updateRefrigerantPackaging(f.d1);
  assert.equal(f.row(change.id).image, '/products/photo-pending.svg');
  await updateRefrigerantStudio(f.d1);
  assert.equal(f.row(change.id).image, '/products/trgas-studio-r410a.webp');
  assert.equal(f.row(change.id).description, change.next.description);
  assert.equal(f.row(smallRefrigerant.id).active, 0);
});

test('a completed v6 marker preserves later owner edits and does not duplicate records', async t => {
  const f = fixture(t), change = studioChanges[0];
  f.insert(product(change));
  f.insert(smallRefrigerant);
  await updateRefrigerantStudio(f.d1);
  f.sql.prepare('UPDATE products SET title=?,image=?,description=?,price=?,stock=? WHERE id=?')
    .run(change.previous.title[0], change.previous.image[0], 'Правка после обновления', 444444, 3, change.id);
  f.sql.prepare('UPDATE products SET active=1,stock=2 WHERE id=?').run(smallRefrigerant.id);
  const before = f.sql.prepare('SELECT * FROM products ORDER BY id').all();
  await updateRefrigerantStudio(f.d1);
  assert.deepEqual(f.sql.prepare('SELECT * FROM products ORDER BY id').all(), before);
});

test('a failing batch rolls back both card changes and duplicate retirement, then can retry', async t => {
  const f = fixture(t), existing = product(studioChanges[0]);
  f.insert(existing);
  f.insert(smallRefrigerant);
  f.sql.exec(`CREATE TRIGGER reject_studio_marker BEFORE INSERT ON settings WHEN NEW.key='seed_refrigerant_studio_v6' BEGIN SELECT RAISE(ABORT,'simulated studio failure'); END`);
  await assert.rejects(updateRefrigerantStudio(f.d1), /simulated studio failure/);
  assert.deepEqual(f.row(existing.id), existing);
  assert.deepEqual(f.row(smallRefrigerant.id), smallRefrigerant);
  assert.equal(f.marker(), undefined);
  f.sql.exec('DROP TRIGGER reject_studio_marker');
  await updateRefrigerantStudio(f.d1);
  assert.equal(f.row(existing.id).title, 'Хладагент TR GAS R134a');
  assert.equal(f.row(smallRefrigerant.id).active, 0);
  assert.equal(f.marker(), 'done');
});
