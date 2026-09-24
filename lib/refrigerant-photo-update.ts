import { pendingPhotoPath } from './refrigerant-photos';
export const packagingUpdateKey = 'seed_refrigerant_packaging_v5';
export const packagingPhotoChanges = [
  {
    "id": "demo-r2",
    "oldImage": "/products/real-trgas-r410a.webp",
    "oldDescription": "Хладагент R410A из каталога TR Gas / Tura. Фасовка 10 кг. На фотографии — оригинальная упаковка с обозначением хладагента. Совместимость подбирается по паспорту оборудования.",
    "description": "Хладагент R410A из каталога TR Gas / Tura. Фасовка 10 кг. Совместимость подбирается по паспорту оборудования. Оригинальное фото нужной упаковки готовится."
  },
  {
    "id": "premium-r004",
    "oldImage": "/products/real-trgas-r32.webp",
    "oldDescription": "Хладагент R32 из каталога TR Gas / Tura. Фасовка 9 кг. На фотографии — оригинальная упаковка с обозначением хладагента. Совместимость подбирается по паспорту оборудования.",
    "description": "Хладагент R32 из каталога TR Gas / Tura. Фасовка 9 кг. Совместимость подбирается по паспорту оборудования. Оригинальное фото нужной упаковки готовится."
  },
  {
    "id": "premium-r005",
    "oldImage": "/products/real-trgas-r404a.webp",
    "oldDescription": "Хладагент R404A из каталога TR Gas / Tura. Фасовка 10 кг. На фотографии — оригинальная упаковка с обозначением хладагента. Совместимость подбирается по паспорту оборудования.",
    "description": "Хладагент R404A из каталога TR Gas / Tura. Фасовка 10 кг. Совместимость подбирается по паспорту оборудования. Оригинальное фото нужной упаковки готовится."
  },
  {
    "id": "premium-r006",
    "oldImage": "/products/real-trgas-r407c.webp",
    "oldDescription": "Хладагент R407C из каталога TR Gas / Tura. Фасовка 10 кг. На фотографии — оригинальная упаковка с обозначением хладагента. Совместимость подбирается по паспорту оборудования.",
    "description": "Хладагент R407C из каталога TR Gas / Tura. Фасовка 10 кг. Совместимость подбирается по паспорту оборудования. Оригинальное фото нужной упаковки готовится."
  }
];
export const smallRefrigerant = {
  "id": "trgas-r290-350g",
  "sku": "TR-R290-350G",
  "title": "Хладагент TR Gas R290 · 350 г",
  "category": "Хладагенты",
  "description": "Хладагент R290 (пропан) в одноразовом баллончике 350 г из каталога Tura. На оригинальном фото читаются R290 и масса нетто 350 г; логотип TR Gas на лицевой стороне не виден. Совместимость подбирается по паспорту оборудования. Наличие и цена уточняются.",
  "refrigerant": "R290",
  "specification": "350 г · одноразовый баллончик",
  "price": 0,
  "stock": 0,
  "image": "/products/real-trgas-r290-350g.png",
  "active": 1,
  "demo": 1,
  "brand": "TR Gas",
  "model": "R290",
  "series": "TR Gas"
};
export async function updateRefrigerantPackaging(d: D1Database) {
  if (await d.prepare('SELECT value FROM settings WHERE key=?').bind(packagingUpdateKey).first()) return;
  const p=smallRefrigerant;
  await d.batch([
    ...packagingPhotoChanges.map(change=>d.prepare('UPDATE products SET image=?, description=CASE WHEN description=? THEN ? ELSE description END WHERE id=? AND image=?').bind(pendingPhotoPath,change.oldDescription,change.description,change.id,change.oldImage)),
    d.prepare('INSERT OR IGNORE INTO products (id,sku,title,category,description,refrigerant,specification,price,stock,image,active,demo,brand,model,series) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(p.id,p.sku,p.title,p.category,p.description,p.refrigerant,p.specification,p.price,p.stock,p.image,p.active,p.demo,p.brand,p.model,p.series),
    d.prepare('INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)').bind(packagingUpdateKey,'done'),
  ]);
}
