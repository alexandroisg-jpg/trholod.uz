import { db,endpoint,json,seed } from '@/lib/server';
export const dynamic='force-dynamic';
export async function GET(){return endpoint(async()=>{await seed();return json({products:(await db().prepare('SELECT * FROM products WHERE active = 1 ORDER BY rowid').all()).results,demo:true});});}
