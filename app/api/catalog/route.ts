import { db,endpoint,json,seed } from '@/lib/server';
import {storefrontProducts,type Product} from '@/lib/catalog';
export const dynamic='force-dynamic';
export async function GET(){return endpoint(async()=>{await seed();return json({products:storefrontProducts((await db().prepare('SELECT * FROM products WHERE active = 1 ORDER BY rowid').all<Product>()).results),demo:true});});}
