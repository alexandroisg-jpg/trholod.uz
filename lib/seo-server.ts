import { cache } from 'react';
import { db,seed } from './server';
import type {Product} from './catalog';

// A failed database request must not silently publish stale demonstration data.
export const publicProducts=cache(async():Promise<Product[]>=>{
  await seed();
  const result=await db().prepare('SELECT * FROM products WHERE active = 1 ORDER BY category, title, id').all<Product>();
  return result.results;
});
