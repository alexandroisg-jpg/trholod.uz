import { updateRefrigerantPackaging } from './refrigerant-photo-update';
import { env } from 'cloudflare:workers';
import { getStoreUser } from '@/app/auth';
import { demoProducts } from './catalog';
export class HttpError extends Error { constructor(public status:number,message:string){super(message)} }
export function db(){if(!env.DB)throw new HttpError(503,'Хранилище временно недоступно. Попробуйте позже.');return env.DB;}
export const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
export async function endpoint(fn:()=>Promise<Response>){try{return await fn()}catch(e){if(e instanceof HttpError)return json({error:e.message},e.status);console.error('Store request failed',e instanceof Error?e.message:'unknown');return json({error:'Не удалось выполнить действие. Данные формы сохранены — попробуйте ещё раз.'},503);}}
export async function user(){const u=await getStoreUser();if(!u)throw new HttpError(401,'Войдите, чтобы продолжить.');return u;}
export async function digest(s:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(b=>b.toString(16).padStart(2,'0')).join('');}
export async function admin(req:Request){const u=await user();const expected=env.ADMIN_ACCESS_KEY_SHA256;if(!expected)throw new HttpError(503,'Ключ управляющего ещё не настроен.');const supplied=await digest(req.headers.get('x-admin-key')||'');let diff=supplied.length^expected.length;for(let i=0;i<expected.length;i++)diff|=(supplied.charCodeAt(i)||0)^expected.charCodeAt(i);if(diff)throw new HttpError(403,'Неверный ключ управляющего.');return u;}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');if(!origin||origin!==new URL(req.url).origin)throw new HttpError(403,'Запрос должен быть отправлен со страницы магазина.');if(!req.headers.get('content-type')?.includes('application/json'))throw new HttpError(415,'Ожидается JSON.');}
export async function body(req:Request){const text=await req.text();if(text.length>40000)throw new HttpError(413,'Слишком большой запрос.');try{return JSON.parse(text)}catch{throw new HttpError(400,'Некорректные данные.');}}

export async function seed(){
 const d=db();
 if(await d.prepare('SELECT value FROM settings WHERE key=?').bind('seed_originals_v4_release').first()){await updateRefrigerantPackaging(d);return;}
 const reprice=new Set([
  "demo-r1",
  "demo-r2",
  "premium-r004",
  "premium-r005",
  "premium-r006",
  "premium-t001",
  "premium-t002",
  "premium-t003",
  "premium-t004",
  "premium-t005",
  "premium-t006",
  "premium-t007",
  "premium-t008",
  "premium-r003",
  "premium-r008"
]);
 const retired=new Set([
  "premium-r007",
  "premium-r009",
  "premium-r010",
  "premium-r011",
  "premium-r012"
]);
 const changed=new Set([
  "premium-r003",
  "demo-r2",
  "premium-r004",
  "demo-r1",
  "premium-r005",
  "premium-r006",
  "premium-r007",
  "premium-r008",
  "premium-r009",
  "premium-r010",
  "premium-r011",
  "premium-r012",
  "premium-t001",
  "premium-t003",
  "premium-t002",
  "premium-t007",
  "premium-t004",
  "premium-t005",
  "premium-t006",
  "premium-t008",
  "model-secop-tles4-8kk-3",
  "model-secop-tl5g",
  "model-secop-nl6-1mf",
  "model-secop-nl11f",
  "model-secop-fr8-5g",
  "model-secop-fr10g",
  "premium-c007",
  "demo-c2",
  "model-toshiba-da111a1f-20f1",
  "model-toshiba-da89x1c-23fz2",
  "model-toshiba-da130a1f-27f",
  "model-gmcc-ksk53d15uez3",
  "model-gmcc-ksn98d27uer31",
  "model-gmcc-ktk115d33ufz3",
  "model-gmcc-ktn150d53ufz3",
  "model-gmcc-ktm180d43umt",
  "model-gmcc-ktf310d43umt",
  "model-panasonic-9rs058hb",
  "premium-c005",
  "model-panasonic-9ps108ha",
  "model-panasonic-9ks170ha"
]);
 await d.batch([
  ...demoProducts.map(p=>{
   const fields=['title','category','description','refrigerant','specification','image','brand','model','series'];
   if(reprice.has(p.id))fields.push('price');
   if(retired.has(p.id))fields.push('active');
   const suffix=changed.has(p.id)?' ON CONFLICT(id) DO UPDATE SET '+fields.map(k=>`${k}=excluded.${k}`).join(',')+' WHERE products.sku=excluded.sku AND products.demo=1':'';
   return d.prepare((changed.has(p.id)?'INSERT':'INSERT OR IGNORE')+' INTO products (id,sku,title,category,description,refrigerant,specification,price,stock,image,active,demo,brand,model,series) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'+suffix).bind(p.id,p.sku,p.title,p.category,p.description,p.refrigerant,p.specification,p.price,p.stock,p.image,p.active,p.demo,p.brand||'',p.model||'',p.series||'');
  }),
  ...['seed_v1','seed_premium_v2','seed_branded_v3','seed_originals_v4_release'].map(key=>d.prepare('INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)').bind(key,'done'))
 ]);
 await updateRefrigerantPackaging(d);
}
