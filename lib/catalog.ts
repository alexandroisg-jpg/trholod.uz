import { pendingPhotoPath, rejectedProductPhoto } from './refrigerant-photos';
export type Product = {id:string;sku:string;title:string;brand?:string;model?:string;series?:string;category:string;description:string;refrigerant:string;specification:string;price:number;stock:number;image:string;active:number;demo:number};
export const categories = ['Все товары','Хладагенты','Холодильные компрессоры','Кондиционерные компрессоры','Комплектующие','Инструменты'];
export const money = (n:number) => new Intl.NumberFormat('ru-RU').format(n)+' сум';
export const statusNames:Record<string,string>={new:'Новый',processing:'В работе',ready:'Готов к выдаче',completed:'Завершён',cancelled:'Отменён'};
export {catalogProducts as demoProducts} from './catalog-data';
export const featuredIds=['demo-r1','demo-r2','premium-r004','premium-r003','premium-r005','premium-r006','premium-r008','demo-c1','premium-c003','demo-c2','premium-c005','premium-c004'];
export function catalogRank(id:string){const rank=featuredIds.indexOf(id);return rank<0?100:rank;}
export const imageLabels:Record<string,string>={
  "/products/trgas-studio-r134a.webp":"TR GAS R134a · студийная иллюстрация",
  "/products/trgas-studio-r410a.webp":"TR GAS R410A · студийная иллюстрация",
  "/products/trgas-studio-r32.webp":"TR GAS R32 · студийная иллюстрация",
  "/products/trgas-studio-r404a.webp":"TR GAS R404A · студийная иллюстрация",
  "/products/trgas-studio-r407c.webp":"TR GAS R407C · студийная иллюстрация",
  "/products/trgas-studio-r600a.webp":"TR GAS R600a · студийная иллюстрация",
  "/products/trgas-studio-r290.webp":"TR GAS R290 · студийная иллюстрация",

  "/products/photo-pending.svg":"Фото упаковки готовится",
  "/products/real-trgas-r290-350g.png":"TR Gas R290 · 350 г",
  "/products/unverified.png":"Фото не подтверждено",
  "/products/compressor.jpg": "Danfoss / Secop SC18CL",
  "/products/fittings.jpg": "Медные фитинги",
  "/products/thermostat.jpg": "Термостат",
  "/products/capacitor.jpg": "Конденсатор",
  "/products/embraco-em-family.webp": "Embraco · серия EM",
  "/products/embraco-ne-family.webp": "Embraco · серия NE",
  "/products/embraco-nt-family.webp": "Embraco · серия NT",
  "/products/embraco-nj-family.webp": "Embraco · серия NJ",
  "/products/toshiba-da130a1f-25f.webp": "Toshiba · серия DA",
  "/products/gmcc-rotary-family.webp": "GMCC · серия TF",
  "/products/highly-asd-family.webp": "Highly · серия D",
  "/products/panasonic-r-family.webp": "Panasonic · серия R",
  "/products/panasonic-p-family.webp": "Panasonic · серия P",
  "/products/panasonic-k-family.webp": "Panasonic · серия K",
  "/products/real-trgas-r134a.webp": "TR Gas R134a · 13,6 кг",
  "/products/real-trgas-r600a.webp": "TR Gas R600a · 420 г",
  "/products/real-trgas-r290.webp": "TR Gas R290 · 5 кг",
  "/products/real-value-vmg-2-r410a-b.webp": "VALUE VMG-2-R410A-B",
  "/products/real-value-vtc-28.webp": "VALUE VTC-28",
  "/products/real-value-vdg-s1.webp": "VALUE VDG-S1",
  "/products/real-value-ve115n.webp": "VALUE VE115N",
  "/products/real-value-ve125n.webp": "VALUE VE125N",
  "/products/real-value-ve215n.webp": "VALUE VE215N",
  "/products/real-value-vtc-32.webp": "VALUE VTC-32",
  "/products/real-value-ve245n.webp": "VALUE VE245N",
  "/products/real-compressor-tles4-8kk-3.webp": "Danfoss / Secop TLES4.8KK.3",
  "/products/real-compressor-tl5g.webp": "Danfoss / Secop TL5G",
  "/products/real-compressor-nl6-1mf.webp": "Danfoss / Secop NL6.1MF",
  "/products/real-compressor-nl11f.webp": "Danfoss / Secop NL11F",
  "/products/real-compressor-fr8-5g.webp": "Danfoss / Secop FR8.5G",
  "/products/real-compressor-fr10g.webp": "Danfoss / Secop FR10G",
  "/products/real-compressor-sc12cl.webp": "Danfoss / Secop SC12CL",
  "/products/real-compressor-da130a1f-25f.webp": "Toshiba DA130A1F-25F",
  "/products/real-compressor-da111a1f-20f1.webp": "Toshiba DA111A1F-20F1",
  "/products/real-compressor-da89x1c-23fz2.webp": "Toshiba DA89X1C-23FZ2",
  "/products/real-compressor-da130a1f-27f.webp": "Toshiba DA130A1F-27F",
  "/products/real-compressor-ksk53d15uez3.webp": "GMCC KSK53D15UEZ3",
  "/products/real-compressor-ksn98d27uer31.webp": "GMCC KSN98D27UER31",
  "/products/real-compressor-ktk115d33ufz3.webp": "GMCC KTK115D33UFZ3",
  "/products/real-compressor-ktn150d53ufz3.webp": "GMCC KTN150D53UFZ3",
  "/products/real-compressor-ktm180d43umt.webp": "GMCC KTM180D43UMT",
  "/products/real-compressor-ktf310d43umt.webp": "GMCC KTF310D43UMT",
  "/products/real-compressor-9rs058hb.webp": "Panasonic 9RS058HB",
  "/products/real-compressor-9rs096ha.webp": "Panasonic 9RS096HA",
  "/products/real-compressor-9ps108ha.webp": "Panasonic 9PS108HA",
  "/products/real-compressor-9ks170ha.webp": "Panasonic 9KS170HA"
};

export function hasProductPhoto(path:string){return !!path && path!==pendingPhotoPath && !rejectedProductPhoto(path) && !/^\/products\/unverified\.(png|webp)$/.test(path);}
const optimizedImages:Record<string,string> = Object.fromEntries(['compressor','fittings','thermostat','capacitor'].map(name=>[`/products/${name}.jpg`,`/products/${name}.webp`]));
export function productImage(path:string){return hasProductPhoto(path)?optimizedImages[path]||path:pendingPhotoPath;}

export const modelReferences:Record<string,string>={
  "Danfoss / Secop TLES4.8KK.3": "https://www.secop.com/fileadmin/user_upload/obsolete-compressors/tles48kk3_102h4598_r600a_220v_50hz_03-2014_desd505y102.pdf",
  "Danfoss / Secop TL5G": "https://www.secop.com/fileadmin/user_upload/obsolete-compressors/tl5g_102g4550_r134a-r513a_220v_50hz_60hz_04-2023_ds.pdf",
  "Danfoss / Secop NL6.1MF": "https://www.secop.com/products/product-selector/application-search/variants/105G6660",
  "Danfoss / Secop NL11F": "https://www.secop.com/products/product-selector/application-search/variants/105G6900",
  "Danfoss / Secop FR8.5G": "https://www.secop.com/fileadmin/user_upload/obsolete-compressors/fr85g_103g6780_r134a_220v_50hz_60hz_08-2012_desd401m202.pdf",
  "Danfoss / Secop FR10G": "https://www.secop.com/fileadmin/user_upload/obsolete-compressors/fr10g_103g6890_r134a_220v_50hz_60hz_08-2012_desd401p202.pdf",
  "Danfoss / Secop SC12CL": "https://www.secop.com/products/product-selector/application-search/variants/104L2623",
  "Danfoss / Secop SC18CL": "https://www.secop.com/products/product-selector/application-search/variants/104L2123",
  "Embraco EMX55CLC": "https://www.embraco.com/en/documents/download/o0sye",
  "Embraco EMT45HDR": "https://www.embraco.com/en/documents/download/o0sye",
  "Embraco EMT2121U": "https://www.embraco.com/en/documents/download/o0sye",
  "Embraco EMC3134U": "https://www.embraco.com/en/documents/download/o0sye",
  "Embraco NEK6210GK": "https://www.embraco.com/en/documents/download/o0sye",
  "Embraco NEU6215GK": "https://www.embraco.com/en/documents/download/o0sye",
  "Embraco NT6222GK": "https://www.embraco.com/en/documents/download/o0sye",
  "Embraco NJ9238GK": "https://www.embraco.com/en/documents/download/o0sye",
  "Toshiba DA130A1F-25F": "https://www.toshiba-aircon.co.uk/wp-content/uploads/2017/09/Current_20130918_Outdoor_M18UAV-E_SM_A10-024_RAS-M18UAV-E____EN_01.pdf",
  "Toshiba DA111A1F-20F1": "https://toshiba-aircon.co.uk/assets/uploads/product_assets/20121029_SM_A05-009_RAS-M__GAV-E_14-18_EN_01.pdf",
  "Toshiba DA89X1C-23FZ2": "https://www.toshiba-aircon.co.uk/wp-content/uploads/2017/09/Current_20101012_Bi_Flow_N3AV2_SM_SVM10044_RAS-__UFV-E_B10-B13-B18_EN_01.pdf",
  "Toshiba DA130A1F-27F": "https://www.toshiba-aircon.co.uk/wp-content/uploads/2017/09/Current_20101012_Bi_Flow_N3AV2_SM_SVM10044_RAS-__UFV-E_B10-B13-B18_EN_01.pdf",
  "GMCC KSK53D15UEZ3": "https://www.hvacrcompressor.com/downloadpdf/GMCC-rotary-compressor-catalogue.pdf",
  "GMCC KSN98D27UER31": "https://www.hvacrcompressor.com/downloadpdf/GMCC-rotary-compressor-catalogue.pdf",
  "GMCC KTK115D33UFZ3": "https://www.hvacrcompressor.com/downloadpdf/GMCC-rotary-compressor-catalogue.pdf",
  "GMCC KTN150D53UFZ3": "https://www.hvacrcompressor.com/downloadpdf/GMCC-rotary-compressor-catalogue.pdf",
  "GMCC KTM180D43UMT": "https://www.hvacrcompressor.com/downloadpdf/GMCC-rotary-compressor-catalogue.pdf",
  "GMCC KTF310D43UMT": "https://www.hvacrcompressor.com/downloadpdf/GMCC-rotary-compressor-catalogue.pdf",
  "Highly ASD102SKQ-6B": "https://www.philexi.com/down-load/Highly-rotary-compressor-catalogue.pdf",
  "Highly ASG133SKQ": "https://www.philexi.com/down-load/Highly-rotary-compressor-catalogue.pdf",
  "Highly ATL232UDP-1": "https://www.philexi.com/down-load/Highly-rotary-compressor-catalogue.pdf",
  "Highly ATH307SD": "https://www.philexi.com/down-load/Highly-rotary-compressor-catalogue.pdf",
  "Highly ASH184TV-1": "https://www.philexi.com/down-load/Highly-rotary-compressor-catalogue.pdf",
  "Highly GSD088SKQ-6": "https://www.philexi.com/down-load/Highly-rotary-compressor-catalogue.pdf",
  "Panasonic 9RS058HB": "https://na.industrial.panasonic.com/products/hvacr-appliance-devices/compressors/rotary-compressors/series/150861",
  "Panasonic 9RS096HA": "https://na.industrial.panasonic.com/products/hvacr-appliance-devices/compressors/rotary-compressors/series/150861",
  "Panasonic 9PS108HA": "https://na.industrial.panasonic.com/products/hvacr-appliance-devices/compressors/rotary-compressors/series/150861",
  "Panasonic 9KS170HA": "https://na.industrial.panasonic.com/products/hvacr-appliance-devices/compressors/rotary-compressors/series/150861",
  "TR Gas R134a": "https://automaster.uz/products/xladagent-freon-r134a-13-6kg-turetskiy-tr-gas-15512",
  "TR Gas R410A": "https://www.212yedekparca.com/r410a-sogutucu-gaz-10-kg-tr-gas-tr-gas-r410a-sogutucu-gaz",
  "TR Gas R600a": "https://www.turaiklimlendirme.com/en/r600a-gas/",
  "TR Gas R32": "https://www.turaiklimlendirme.com/en/r32-gas/",
  "TR Gas R404A": "https://www.212yedekparca.com/r404a-sogutucu-gaz-10-kg-tr-gas-tr-gas-r404a-sogutucu-gaz",
  "TR Gas R407C": "https://www.212yedekparca.com/r407c-sogutucu-gaz-10-kg-tr-gas-tr-gas-r407c-sogutucu-gaz",
  "TR Gas R290": "https://www.turaiklimlendirme.com/en/r290-gas/",
  "VALUE VMG-2-R410A-B": "https://worldvalue.cn/news_info/id-14.html",
  "VALUE VTC-28": "https://value-instrument.ru/catalog/%D1%81utters/vtc-28.html",
  "VALUE VDG-S1": "https://www.worldvalue.cn/pro_info/VDG-S1",
  "VALUE VE115N": "https://www.worldvalue.cn/pro_info/VE115N",
  "VALUE VE125N": "https://www.worldvalue.cn/pro_info/VE125N",
  "VALUE VE215N": "https://www.worldvalue.cn/pro_info/VE215N",
  "VALUE VTC-32": "https://www.worldvalue.cn/pro_info/VTC-32",
  "VALUE VE245N": "https://www.worldvalue.cn/pro_info/VE245N"
};
export const photoCaptions:Record<string,string>={
  "/products/real-trgas-r290-350g.png":"Оригинальное фото из каталога Tura · R290 · 350 г",
  "/products/compressor.jpg": "Фото Danfoss / Secop SC18CL",
  "/products/embraco-em-family.webp": "Фото серии EM",
  "/products/embraco-ne-family.webp": "Фото серии NE",
  "/products/embraco-nt-family.webp": "Фото серии NT",
  "/products/embraco-nj-family.webp": "Фото серии NJ",
  "/products/toshiba-da130a1f-25f.webp": "Фото семейства Toshiba",
  "/products/gmcc-rotary-family.webp": "Фото семейства GMCC",
  "/products/highly-asd-family.webp": "Представитель семейства Highly",
  "/products/panasonic-r-family.webp": "Фото серии R",
  "/products/panasonic-p-family.webp": "Фото серии P",
  "/products/panasonic-k-family.webp": "Фото серии K",
  "/products/real-trgas-r134a.webp": "Оригинальное фото TR Gas · R134a · 13,6 кг",
  "/products/real-trgas-r600a.webp": "Фото из каталога Tura · R600a · 420 г",
  "/products/real-trgas-r290.webp": "Фото из каталога Tura · R290 · 5 кг",
  "/products/real-value-vmg-2-r410a-b.webp": "Фото VALUE VMG-2-R410A-B",
  "/products/real-value-vtc-28.webp": "Фото VALUE VTC-28",
  "/products/real-value-vdg-s1.webp": "Фото VALUE VDG-S1",
  "/products/real-value-ve115n.webp": "Фото VALUE VE115N",
  "/products/real-value-ve125n.webp": "Фото VALUE VE125N",
  "/products/real-value-ve215n.webp": "Фото VALUE VE215N",
  "/products/real-value-vtc-32.webp": "Фото VALUE VTC-32",
  "/products/real-value-ve245n.webp": "Фото VALUE VE245N",
  "/products/real-compressor-tles4-8kk-3.webp": "Фото Danfoss / Secop TLES4.8KK.3",
  "/products/real-compressor-tl5g.webp": "Фото Danfoss / Secop TL5G",
  "/products/real-compressor-nl6-1mf.webp": "Фото Danfoss / Secop NL6.1MF",
  "/products/real-compressor-nl11f.webp": "Фото Danfoss / Secop NL11F",
  "/products/real-compressor-fr8-5g.webp": "Фото Danfoss / Secop FR8.5G",
  "/products/real-compressor-fr10g.webp": "Secop FR10G. На фото исполнение 103G6880; код в паспорте карточки — 103G6890.",
  "/products/real-compressor-sc12cl.webp": "Фото Danfoss / Secop SC12CL",
  "/products/real-compressor-da130a1f-25f.webp": "Фото Toshiba DA130A1F-25F",
  "/products/real-compressor-da111a1f-20f1.webp": "Фото Toshiba DA111A1F-20F1",
  "/products/real-compressor-da89x1c-23fz2.webp": "Фото Toshiba DA89X1C-23FZ2",
  "/products/real-compressor-da130a1f-27f.webp": "Toshiba серии DA130. На фото DA130A1F-21F; модификация DA130A1F-27F может отличаться.",
  "/products/real-compressor-ksk53d15uez3.webp": "GMCC серии SK. На фото KSK103D33UEZ3; исполнение KSK53D15UEZ3 может отличаться.",
  "/products/real-compressor-ksn98d27uer31.webp": "GMCC серии SN. На фото KSN140D21UFZ; исполнение KSN98D27UER31 может отличаться.",
  "/products/real-compressor-ktk115d33ufz3.webp": "GMCC серии TK. На фото KTK130D43UFE3; исполнение KTK115D33UFZ3 может отличаться.",
  "/products/real-compressor-ktn150d53ufz3.webp": "GMCC серии TN. На фото KTN150D30UFZA; исполнение KTN150D53UFZ3 может отличаться.",
  "/products/real-compressor-ktm180d43umt.webp": "GMCC серии TM. На фото KTM240D43UKT; исполнение KTM180D43UMT может отличаться.",
  "/products/real-compressor-ktf310d43umt.webp": "Фото GMCC KTF310D43UMT",
  "/products/real-compressor-9rs058hb.webp": "Panasonic серии R. На фото 5RS058FAA21 (R410A); модель 9RS058HB — другое исполнение на R32.",
  "/products/real-compressor-9rs096ha.webp": "Panasonic серии R. На фото 5RS058FAA21 (R410A); модель 9RS096HA — другое исполнение на R32.",
  "/products/real-compressor-9ps108ha.webp": "Panasonic серии P. На фото 5PS108EAA22 (R410A); модель 9PS108HA — другое исполнение на R32.",
  "/products/real-compressor-9ks170ha.webp": "Panasonic серии K. На фото 5KS170EAB21 (R410A); модель 9KS170HA — другое исполнение на R32."
};
export function imageCaption(path:string){if(/\/trgas-studio-/.test(path))return 'Студийная иллюстрация. Внешний вид упаковки уточняется при заказе';return hasProductPhoto(path)?photoCaptions[path]||'Фото товарной группы':'Оригинальное фото упаковки готовится';}
export function modelSource(p:Product){return modelReferences[`${p.brand==='TR GAS'?'TR Gas':p.brand} ${p.model}`];}

export const largeImages:Record<string,string>={
  "/products/compressor.jpg":"/products/compressor.jpg",
  "/products/real-trgas-r134a.webp": "/products/real-trgas-r134a-full.webp",
  "/products/real-trgas-r600a.webp": "/products/real-trgas-r600a-full.webp",
  "/products/real-trgas-r290.webp": "/products/real-trgas-r290-full.webp",
  "/products/real-value-vmg-2-r410a-b.webp": "/products/real-value-vmg-2-r410a-b-full.webp",
  "/products/real-value-vtc-28.webp": "/products/real-value-vtc-28-full.webp",
  "/products/real-value-vdg-s1.webp": "/products/real-value-vdg-s1-full.webp",
  "/products/real-value-ve115n.webp": "/products/real-value-ve115n-full.webp",
  "/products/real-value-ve125n.webp": "/products/real-value-ve125n-full.webp",
  "/products/real-value-ve215n.webp": "/products/real-value-ve215n-full.webp",
  "/products/real-value-vtc-32.webp": "/products/real-value-vtc-32-full.webp",
  "/products/real-value-ve245n.webp": "/products/real-value-ve245n-full.webp",
  "/products/real-compressor-tles4-8kk-3.webp": "/products/real-compressor-tles4-8kk-3-full.webp",
  "/products/real-compressor-tl5g.webp": "/products/real-compressor-tl5g-full.webp",
  "/products/real-compressor-nl6-1mf.webp": "/products/real-compressor-nl6-1mf-full.webp",
  "/products/real-compressor-nl11f.webp": "/products/real-compressor-nl11f-full.webp",
  "/products/real-compressor-fr8-5g.webp": "/products/real-compressor-fr8-5g-full.webp",
  "/products/real-compressor-fr10g.webp": "/products/real-compressor-fr10g-full.webp",
  "/products/real-compressor-sc12cl.webp": "/products/real-compressor-sc12cl-full.webp",
  "/products/real-compressor-da130a1f-25f.webp": "/products/real-compressor-da130a1f-25f-full.webp",
  "/products/real-compressor-da111a1f-20f1.webp": "/products/real-compressor-da111a1f-20f1-full.webp",
  "/products/real-compressor-da89x1c-23fz2.webp": "/products/real-compressor-da89x1c-23fz2-full.webp",
  "/products/real-compressor-da130a1f-27f.webp": "/products/real-compressor-da130a1f-27f-full.webp",
  "/products/real-compressor-ksk53d15uez3.webp": "/products/real-compressor-ksk53d15uez3-full.webp",
  "/products/real-compressor-ksn98d27uer31.webp": "/products/real-compressor-ksn98d27uer31-full.webp",
  "/products/real-compressor-ktk115d33ufz3.webp": "/products/real-compressor-ktk115d33ufz3-full.webp",
  "/products/real-compressor-ktn150d53ufz3.webp": "/products/real-compressor-ktn150d53ufz3-full.webp",
  "/products/real-compressor-ktm180d43umt.webp": "/products/real-compressor-ktm180d43umt-full.webp",
  "/products/real-compressor-ktf310d43umt.webp": "/products/real-compressor-ktf310d43umt-full.webp",
  "/products/real-compressor-9rs058hb.webp": "/products/real-compressor-9rs058hb-full.webp",
  "/products/real-compressor-9rs096ha.webp": "/products/real-compressor-9rs096ha-full.webp",
  "/products/real-compressor-9ps108ha.webp": "/products/real-compressor-9ps108ha-full.webp",
  "/products/real-compressor-9ks170ha.webp": "/products/real-compressor-9ks170ha-full.webp"
};
export function largeProductImage(path:string){return hasProductPhoto(path)?largeImages[path]||productImage(path):pendingPhotoPath;}
export type PriceReference={price:number;url:string;label:string;checkedAt:string;note:string};
export const priceReferences:Record<string,PriceReference>={
  "demo-r1": {
    "url": "https://automaster.uz/products/xladagent-freon-r134a-13-6kg-turetskiy-tr-gas-15512",
    "label": "Цена узбекского продавца",
    "note": "Ориентир Automaster на 22.09.2026. Цена и наличие у поставщика не являются прайсом и остатком TR HOLOD.",
    "price": 1707000,
    "checkedAt": "22.09.2026"
  },
  "demo-r2": {
    "url": "https://www.212yedekparca.com/r410a-sogutucu-gaz-10-kg-tr-gas-tr-gas-r410a-sogutucu-gaz",
    "label": "Цена турецкого продавца",
    "note": "Ориентир: 10,540.99 TRY × 242,01 сум по курсу ЦБ от 22.09.2026, округлено. Доставка и импортные расходы не включены; цена магазина требует подтверждения.",
    "price": 2550000,
    "checkedAt": "22.09.2026"
  },
  "premium-r004": {
    "url": "https://erolsogutma.com/tr-gas-r32-tekrar-doldurulabilir-tupte-9kg-sogutucu-akiskan",
    "label": "Цена турецкого продавца",
    "note": "Ориентир: 8,290.00 TRY × 242,01 сум по курсу ЦБ от 22.09.2026, округлено. Доставка и импортные расходы не включены; цена магазина требует подтверждения.",
    "price": 2010000,
    "checkedAt": "22.09.2026"
  },
  "premium-r005": {
    "url": "https://www.212yedekparca.com/r404a-sogutucu-gaz-10-kg-tr-gas-tr-gas-r404a-sogutucu-gaz",
    "label": "Цена турецкого продавца",
    "note": "Ориентир: 8,198.55 TRY × 242,01 сум по курсу ЦБ от 22.09.2026, округлено. Доставка и импортные расходы не включены; цена магазина требует подтверждения.",
    "price": 1980000,
    "checkedAt": "22.09.2026"
  },
  "premium-r006": {
    "url": "https://www.212yedekparca.com/r407c-sogutucu-gaz-10-kg-tr-gas-tr-gas-r407c-sogutucu-gaz",
    "label": "Цена турецкого продавца",
    "note": "Ориентир: 10,540.99 TRY × 242,01 сум по курсу ЦБ от 22.09.2026, округлено. Доставка и импортные расходы не включены; цена магазина требует подтверждения.",
    "price": 2550000,
    "checkedAt": "22.09.2026"
  },
  "premium-t001": {
    "url": "https://market.yandex.uz/card/manometricheskiy-kollektor-value-vmg-2-r410a-b-pod-r410a-r22-r134a-r407c/102200625965",
    "label": "Ориентир открытого рынка",
    "note": "Цена из открытого объявления/каталога, не подтверждённая цена или остаток ТР ХОЛОД. Проверено 22.09.2026; отображаемая сумма округлена.",
    "price": 1550000,
    "checkedAt": "22.09.2026"
  },
  "premium-t002": {
    "url": "https://techholod.com/catalog/zapchasti_raskhodnye_materialy_1/instrumenty/instrument_value/",
    "label": "Ориентир открытого рынка",
    "note": "Ориентир 579 RUB, пересчитан по курсу ЦБ 140,68 сум/RUB от 22.09.2026 и округлён. Это не подтверждённая цена в Узбекистане; доставка не включена.",
    "price": 85000,
    "checkedAt": "22.09.2026"
  },
  "premium-t003": {
    "url": "https://market.yandex.uz/ru/card/elektronnyy-odnoventilnyy-kollektor-value-vdg-s1--shlangi-adapter-v-keyse-universalnyy/101827192248",
    "label": "Ориентир открытого рынка",
    "note": "Цена из открытого объявления/каталога, не подтверждённая цена или остаток ТР ХОЛОД. Проверено 22.09.2026; отображаемая сумма округлена.",
    "price": 2460000,
    "checkedAt": "22.09.2026"
  },
  "premium-t004": {
    "url": "https://flagma.uz/ru/vakuumny-nasos-ve115n-1-5-o1853191.html",
    "label": "Ориентир открытого рынка",
    "note": "Цена из открытого объявления/каталога, не подтверждённая цена или остаток ТР ХОЛОД. Проверено 22.09.2026; отображаемая сумма округлена.",
    "price": 990000,
    "checkedAt": "22.09.2026"
  },
  "premium-t005": {
    "url": "https://market.yandex.uz/card/vakuumnyy-nasos-value-ve125n-1st-70-lmin-20-pa-71-kg/101827196393",
    "label": "Ориентир открытого рынка",
    "note": "Цена из открытого объявления/каталога, не подтверждённая цена или остаток ТР ХОЛОД. Проверено 22.09.2026; отображаемая сумма округлена.",
    "price": 2290000,
    "checkedAt": "22.09.2026"
  },
  "premium-t006": {
    "url": "https://market.yandex.uz/card/vakuumnyy-nasos-value-ve215n-2st-42-lmin-2-pa-75-kg/103017406165",
    "label": "Ориентир открытого рынка",
    "note": "Цена из открытого объявления/каталога, не подтверждённая цена или остаток ТР ХОЛОД. Проверено 22.09.2026; отображаемая сумма округлена.",
    "price": 3450000,
    "checkedAt": "22.09.2026"
  },
  "premium-t007": {
    "url": "https://flagma.uz/ru/truborez-dlya-mednoy-truby-value-vtc-32-o1952658.html",
    "label": "Ориентир открытого рынка",
    "note": "Цена из открытого объявления/каталога, не подтверждённая цена или остаток ТР ХОЛОД. Проверено 22.09.2026; отображаемая сумма округлена.",
    "price": 190000,
    "checkedAt": "22.09.2026"
  },
  "premium-t008": {
    "url": "https://www.olx.uz/d/obyavlenie/vakuumnyy-nasos-value-ve245n-128-l-min-dvuhstupenchatyy-ID42v7e.html",
    "label": "Ориентир открытого рынка",
    "note": "Цена из открытого объявления/каталога, не подтверждённая цена или остаток ТР ХОЛОД. Проверено 22.09.2026; отображаемая сумма округлена.",
    "price": 2500000,
    "checkedAt": "22.09.2026"
  }
};
export function priceReference(p:Product){const ref=priceReferences[p.id];return ref?.price===p.price?ref:undefined;}

export function productPrice(p:Product){return p.price>0?money(p.price):'Цена по запросу';}

// Public presentation omits unconfirmed pack sizes; original owner fields stay in storage.
export function storefrontProduct(p:Product):Product{
 if(p.category!=='Хладагенты')return p;
 const code=p.refrigerant;
 const description=p.description.replace(/\d+(?:[.,]\d+)?\s*(?:килограмм(?:а|ов)?|грамм(?:а|ов)?|кг|kg|г|g|литров?|литра|л|мл)(?=\s|[.,·;:)(]|$)/gi,'').replace(/(?:маленьк|больш|мал)[а-яё]*\s+(?:баллон|фасовк)[^.!?]*[.!?]?/gi,'').replace(/Фасовка\s*[.,·;]?/gi,'').replace(/\s+([.,;])/g,'$1').trim();
 return {...p,brand:'TR GAS',series:'TR GAS',title:`Хладагент TR GAS ${code}`,specification:`Для систем на ${code}`,description};
}
export function storefrontProducts(products:Product[]):Product[]{
 const primaryR290=products.some(p=>p.id==='premium-r008'&&p.active&&hasProductPhoto(p.image));
 return products.filter(p=>p.active&&hasProductPhoto(p.image)&&!(primaryR290&&p.id==='trgas-r290-350g')).map(storefrontProduct);
}
