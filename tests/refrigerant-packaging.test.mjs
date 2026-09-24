import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {test} from 'node:test';
import ts from 'typescript';

// Run the production updater against real SQLite and the committed migrations.
// TypeScript is transpiled in memory; no generated files or remote DB are used.
function moduleUrl(source){
  const {outputText}=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}});
  return `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`;
}
const photosUrl=moduleUrl(readFileSync(new URL('../lib/refrigerant-photos.ts',import.meta.url),'utf8'));
const updateSource=readFileSync(new URL('../lib/refrigerant-photo-update.ts',import.meta.url),'utf8').replace(/(['"])\.\/refrigerant-photos\1/,JSON.stringify(photosUrl));
const {updateRefrigerantPackaging,packagingPhotoChanges,packagingUpdateKey,smallRefrigerant}=await import(moduleUrl(updateSource));
const {pendingPhotoPath}=await import(photosUrl);

function fixture(t){
  const sql=new DatabaseSync(':memory:');
  for(const file of ['0000_smart_namor.sql','0001_gray_nomad.sql'])sql.exec(readFileSync(new URL(`../drizzle/${file}`,import.meta.url),'utf8'));
  t.after(()=>sql.close());
  class Statement{
    constructor(query,values=[]){this.query=query;this.values=values;}
    bind(...values){return new Statement(this.query,values);}
    async first(){return sql.prepare(this.query).get(...this.values)??null;}
    run(){return sql.prepare(this.query).run(...this.values);}
  }
  const d1={
    prepare(query){return new Statement(query);},
    async batch(statements){
      sql.exec('BEGIN');
      try{const results=statements.map(statement=>statement.run());sql.exec('COMMIT');return results;}
      catch(error){sql.exec('ROLLBACK');throw error;}
    },
  };
  const insert=(product)=>{
    const columns=Object.keys(product);
    sql.prepare(`INSERT INTO products (${columns.join(',')}) VALUES (${columns.map(()=>'?').join(',')})`).run(...Object.values(product));
  };
  const row=(id)=>{const result=sql.prepare('SELECT * FROM products WHERE id=?').get(id);return result?{...result}:null;};
  const marker=()=>sql.prepare('SELECT value FROM settings WHERE key=?').get(packagingUpdateKey)?.value;
  return {sql,d1,insert,row,marker};
}
function seeded(change,overrides={}){
  return {...smallRefrigerant,id:change.id,sku:`fixture-${change.id}`,title:`Owner title ${change.id}`,model:'Owner model',price:876543,stock:17,image:change.oldImage,description:change.oldDescription,...overrides};
}

test('replaces all four rejected default photos and exact descriptions, preserving owner fields',async t=>{
  const f=fixture(t);
  for(const change of packagingPhotoChanges)f.insert(seeded(change));
  const unrelated=seeded(packagingPhotoChanges[0],{id:'unrelated',sku:'unrelated',image:'/products/real-trgas-r134a.webp'});
  f.insert(unrelated);
  await updateRefrigerantPackaging(f.d1);
  for(const change of packagingPhotoChanges){
    assert.deepEqual(f.row(change.id),{...seeded(change),image:pendingPhotoPath,description:change.description});
  }
  assert.deepEqual(f.row(unrelated.id),unrelated);
  assert.deepEqual(f.row(smallRefrigerant.id),smallRefrigerant);
  assert.equal(f.marker(),'done');
});

test('preserves a custom owner description when replacing the old photo',async t=>{
  const f=fixture(t),change=packagingPhotoChanges[0];
  const product=seeded(change,{description:'Описание упаковки, отредактированное владельцем.',price:2400000,stock:83});
  f.insert(product);
  await updateRefrigerantPackaging(f.d1);
  assert.deepEqual(f.row(product.id),{...product,image:pendingPhotoPath});
});

test('leaves an owner-selected photo and all its product fields unchanged',async t=>{
  const f=fixture(t),product=seeded(packagingPhotoChanges[1],{image:'/products/owner-verified-r32.webp'});
  f.insert(product);
  await updateRefrigerantPackaging(f.d1);
  assert.deepEqual(f.row(product.id),product);
});

test('rerunning after the marker preserves subsequent owner changes and inserts no duplicate',async t=>{
  const f=fixture(t),change=packagingPhotoChanges[2];
  f.insert(seeded(change));
  await updateRefrigerantPackaging(f.d1);
  f.sql.prepare('UPDATE products SET image=?,description=?,price=?,stock=? WHERE id=?').run(change.oldImage,'Правка после обновления',9123456,29,change.id);
  f.sql.prepare('UPDATE products SET price=?,stock=?,description=? WHERE id=?').run(321000,6,'Теперь подтверждено владельцем',smallRefrigerant.id);
  const before=f.sql.prepare('SELECT * FROM products ORDER BY id').all();
  await updateRefrigerantPackaging(f.d1);
  assert.deepEqual(f.sql.prepare('SELECT * FROM products ORDER BY id').all(),before);
  assert.equal(f.sql.prepare('SELECT COUNT(*) AS count FROM products WHERE id=?').get(smallRefrigerant.id).count,1);
});

test('the new small R290 product is insert-only and cannot reset an existing edited product',async t=>{
  const f=fixture(t),existing={...smallRefrigerant,title:'Уточнённое название владельца',price:79000,stock:42,active:0,demo:0,image:'/products/owner-r290.webp',description:'Проверенная владельцем комплектация.'};
  f.insert(existing);
  await updateRefrigerantPackaging(f.d1);
  assert.deepEqual(f.row(existing.id),existing);
});

test('an existing owner SKU under another ID is retained without creating a duplicate SKU',async t=>{
  const f=fixture(t),existing={...smallRefrigerant,id:'owner-r290-350g',price:88000,stock:12};
  f.insert(existing);
  await updateRefrigerantPackaging(f.d1);
  assert.deepEqual(f.row(existing.id),existing);
  assert.equal(f.row(smallRefrigerant.id),null);
  assert.equal(f.sql.prepare('SELECT COUNT(*) AS count FROM products WHERE sku=?').get(smallRefrigerant.sku).count,1);
});

test('a failed batch rolls back photo changes and the marker, allowing a safe retry',async t=>{
  const f=fixture(t),change=packagingPhotoChanges[3],product=seeded(change);
  f.insert(product);
  f.sql.exec("CREATE TRIGGER reject_packaging_insert BEFORE INSERT ON products WHEN NEW.id='trgas-r290-350g' BEGIN SELECT RAISE(ABORT,'simulated write failure'); END");
  await assert.rejects(updateRefrigerantPackaging(f.d1),/simulated write failure/);
  assert.deepEqual(f.row(product.id),product);
  assert.equal(f.marker(),undefined);
  assert.equal(f.row(smallRefrigerant.id),null);
  f.sql.exec('DROP TRIGGER reject_packaging_insert');
  await updateRefrigerantPackaging(f.d1);
  assert.equal(f.row(product.id).image,pendingPhotoPath);
  assert.equal(f.marker(),'done');
});
