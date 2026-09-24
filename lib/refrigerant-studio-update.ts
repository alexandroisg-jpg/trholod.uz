import { smallRefrigerant } from './refrigerant-photo-update';

export const studioUpdateKey = 'seed_refrigerant_studio_v6';
const editableFields = ['title', 'description', 'specification', 'image', 'brand', 'series'] as const;
type StudioField = typeof editableFields[number];
type StudioChange = {
  id: string;
  sku: string;
  refrigerant: string;
  previous: Record<StudioField, string[]>;
  next: Record<StudioField, string>;
};

// Frozen pre-v6 defaults let each field be updated without overwriting owner edits.
export const studioChanges: StudioChange[] = [
  {
    "id": "demo-r1",
    "sku": "DEMO-R001",
    "refrigerant": "R134a",
    "previous": {
      "title": [
        "Хладагент TR Gas R134a · 13,6 кг"
      ],
      "description": [
        "Хладагент R134a из каталога TR Gas / Tura. Фасовка 13,6 кг. На фотографии — оригинальная упаковка с обозначением хладагента. Совместимость подбирается по паспорту оборудования."
      ],
      "specification": [
        "13,6 кг · баллон"
      ],
      "image": [
        "/products/real-trgas-r134a.webp"
      ],
      "brand": [
        "TR Gas"
      ],
      "series": [
        "TR Gas"
      ]
    },
    "next": {
      "title": "Хладагент TR GAS R134a",
      "description": "Хладагент TR GAS R134a для оборудования, рассчитанного на работу с R134a. Совместимость проверяется по паспорту оборудования.",
      "specification": "Для систем на R134a",
      "image": "/products/trgas-studio-r134a.webp",
      "brand": "TR GAS",
      "series": "TR GAS"
    }
  },
  {
    "id": "demo-r2",
    "sku": "DEMO-R002",
    "refrigerant": "R410A",
    "previous": {
      "title": [
        "Хладагент TR Gas R410A · 10 кг"
      ],
      "description": [
        "Хладагент R410A из каталога TR Gas / Tura. Фасовка 10 кг. Совместимость подбирается по паспорту оборудования. Оригинальное фото нужной упаковки готовится.",
        "Хладагент R410A из каталога TR Gas / Tura. Фасовка 10 кг. На фотографии — оригинальная упаковка с обозначением хладагента. Совместимость подбирается по паспорту оборудования."
      ],
      "specification": [
        "10 кг · баллон"
      ],
      "image": [
        "/products/photo-pending.svg",
        "/products/real-trgas-r410a.webp"
      ],
      "brand": [
        "TR Gas"
      ],
      "series": [
        "TR Gas"
      ]
    },
    "next": {
      "title": "Хладагент TR GAS R410A",
      "description": "Хладагент TR GAS R410A для оборудования, рассчитанного на работу с R410A. Совместимость проверяется по паспорту оборудования.",
      "specification": "Для систем на R410A",
      "image": "/products/trgas-studio-r410a.webp",
      "brand": "TR GAS",
      "series": "TR GAS"
    }
  },
  {
    "id": "premium-r003",
    "sku": "DEMO-R003",
    "refrigerant": "R600a",
    "previous": {
      "title": [
        "Хладагент TR Gas R600a · 420 г"
      ],
      "description": [
        "Хладагент R600a из каталога TR Gas / Tura. Фасовка 420 г. На фотографии — оригинальная упаковка с обозначением хладагента. Совместимость подбирается по паспорту оборудования. R600a — изобутан; не путать с R600. На витрине показан баллончик 420 г."
      ],
      "specification": [
        "420 г · баллончик"
      ],
      "image": [
        "/products/real-trgas-r600a.webp"
      ],
      "brand": [
        "TR Gas"
      ],
      "series": [
        "TR Gas"
      ]
    },
    "next": {
      "title": "Хладагент TR GAS R600a",
      "description": "Хладагент TR GAS R600a для оборудования, рассчитанного на работу с R600a. Совместимость проверяется по паспорту оборудования.",
      "specification": "Для систем на R600a",
      "image": "/products/trgas-studio-r600a.webp",
      "brand": "TR GAS",
      "series": "TR GAS"
    }
  },
  {
    "id": "premium-r004",
    "sku": "DEMO-R004",
    "refrigerant": "R32",
    "previous": {
      "title": [
        "Хладагент TR Gas R32 · 9 кг"
      ],
      "description": [
        "Хладагент R32 из каталога TR Gas / Tura. Фасовка 9 кг. Совместимость подбирается по паспорту оборудования. Оригинальное фото нужной упаковки готовится.",
        "Хладагент R32 из каталога TR Gas / Tura. Фасовка 9 кг. На фотографии — оригинальная упаковка с обозначением хладагента. Совместимость подбирается по паспорту оборудования."
      ],
      "specification": [
        "9 кг · баллон"
      ],
      "image": [
        "/products/photo-pending.svg",
        "/products/real-trgas-r32.webp"
      ],
      "brand": [
        "TR Gas"
      ],
      "series": [
        "TR Gas"
      ]
    },
    "next": {
      "title": "Хладагент TR GAS R32",
      "description": "Хладагент TR GAS R32 для оборудования, рассчитанного на работу с R32. Совместимость проверяется по паспорту оборудования.",
      "specification": "Для систем на R32",
      "image": "/products/trgas-studio-r32.webp",
      "brand": "TR GAS",
      "series": "TR GAS"
    }
  },
  {
    "id": "premium-r005",
    "sku": "DEMO-R005",
    "refrigerant": "R404A",
    "previous": {
      "title": [
        "Хладагент TR Gas R404A · 10 кг"
      ],
      "description": [
        "Хладагент R404A из каталога TR Gas / Tura. Фасовка 10 кг. Совместимость подбирается по паспорту оборудования. Оригинальное фото нужной упаковки готовится.",
        "Хладагент R404A из каталога TR Gas / Tura. Фасовка 10 кг. На фотографии — оригинальная упаковка с обозначением хладагента. Совместимость подбирается по паспорту оборудования."
      ],
      "specification": [
        "10 кг · баллон"
      ],
      "image": [
        "/products/photo-pending.svg",
        "/products/real-trgas-r404a.webp"
      ],
      "brand": [
        "TR Gas"
      ],
      "series": [
        "TR Gas"
      ]
    },
    "next": {
      "title": "Хладагент TR GAS R404A",
      "description": "Хладагент TR GAS R404A для оборудования, рассчитанного на работу с R404A. Совместимость проверяется по паспорту оборудования.",
      "specification": "Для систем на R404A",
      "image": "/products/trgas-studio-r404a.webp",
      "brand": "TR GAS",
      "series": "TR GAS"
    }
  },
  {
    "id": "premium-r006",
    "sku": "DEMO-R006",
    "refrigerant": "R407C",
    "previous": {
      "title": [
        "Хладагент TR Gas R407C · 10 кг"
      ],
      "description": [
        "Хладагент R407C из каталога TR Gas / Tura. Фасовка 10 кг. Совместимость подбирается по паспорту оборудования. Оригинальное фото нужной упаковки готовится.",
        "Хладагент R407C из каталога TR Gas / Tura. Фасовка 10 кг. На фотографии — оригинальная упаковка с обозначением хладагента. Совместимость подбирается по паспорту оборудования."
      ],
      "specification": [
        "10 кг · баллон"
      ],
      "image": [
        "/products/photo-pending.svg",
        "/products/real-trgas-r407c.webp"
      ],
      "brand": [
        "TR Gas"
      ],
      "series": [
        "TR Gas"
      ]
    },
    "next": {
      "title": "Хладагент TR GAS R407C",
      "description": "Хладагент TR GAS R407C для оборудования, рассчитанного на работу с R407C. Совместимость проверяется по паспорту оборудования.",
      "specification": "Для систем на R407C",
      "image": "/products/trgas-studio-r407c.webp",
      "brand": "TR GAS",
      "series": "TR GAS"
    }
  },
  {
    "id": "premium-r008",
    "sku": "DEMO-R008",
    "refrigerant": "R290",
    "previous": {
      "title": [
        "Хладагент TR Gas R290 · 5 кг"
      ],
      "description": [
        "Хладагент R290 из каталога TR Gas / Tura. Фасовка 5 кг. На фотографии — оригинальная упаковка с обозначением хладагента. Совместимость подбирается по паспорту оборудования."
      ],
      "specification": [
        "5 кг · баллон"
      ],
      "image": [
        "/products/real-trgas-r290.webp"
      ],
      "brand": [
        "TR Gas"
      ],
      "series": [
        "TR Gas"
      ]
    },
    "next": {
      "title": "Хладагент TR GAS R290",
      "description": "Хладагент TR GAS R290 для оборудования, рассчитанного на работу с R290. Совместимость проверяется по паспорту оборудования.",
      "specification": "Для систем на R290",
      "image": "/products/trgas-studio-r290.webp",
      "brand": "TR GAS",
      "series": "TR GAS"
    }
  }
];

export async function updateRefrigerantStudio(d: D1Database) {
  if (await d.prepare('SELECT value FROM settings WHERE key=?').bind(studioUpdateKey).first()) return;

  const statements = studioChanges.map(change => {
    const values: string[] = [];
    const assignments = editableFields.map(field => {
      const previous = change.previous[field];
      values.push(...previous, change.next[field]);
      return `${field}=CASE WHEN ${field} IN (${previous.map(() => '?').join(',')}) THEN ? ELSE ${field} END`;
    });
    return d.prepare(`UPDATE products SET ${assignments.join(',')} WHERE id=? AND sku=? AND refrigerant=? AND category=? AND demo=1`)
      .bind(...values, change.id, change.sku, change.refrigerant, 'Хладагенты');
  });

  // Retire the duplicate only if it is still the untouched, original demo record.
  // Owner-edited variants, prices, stock and all order history remain intact.
  const duplicateFields = Object.keys(smallRefrigerant) as (keyof typeof smallRefrigerant)[];
  statements.push(d.prepare(`UPDATE products SET active=0 WHERE ${duplicateFields.map(field => `${field}=?`).join(' AND ')}`)
    .bind(...duplicateFields.map(field => smallRefrigerant[field])));
  statements.push(d.prepare('INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)').bind(studioUpdateKey, 'done'));
  await d.batch(statements);
}
