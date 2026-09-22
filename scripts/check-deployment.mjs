import { readFileSync } from 'node:fs';
const config = JSON.parse(readFileSync(new URL('../wrangler.json', import.meta.url), 'utf8'));
const errors = [];
const db = config.d1_databases?.find((item) => item.binding === 'DB');
if (!db || !/^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i.test(db.database_id) || db.database_id === '00000000-0000-4000-8000-000000000000') errors.push('Set the real D1 database_id in wrangler.json.');
if (!/^[a-f\d]{32}$/i.test(config.account_id || process.env.CLOUDFLARE_ACCOUNT_ID || '')) errors.push('Set the owner Cloudflare account_id.');
const domain = config.routes?.some((route) => route.pattern === 'trholod.uz' && route.custom_domain === true);
if (!domain && config.workers_dev !== true) errors.push('Configure trholod.uz or the owner account workers.dev address.');
if (config.preview_urls !== false) errors.push('Keep extra version preview URLs disabled.');
if (config.assets?.binding !== 'ASSETS' || config.assets?.run_worker_first !== false) errors.push('Use public asset-first delivery with the ASSETS binding.');
if (process.argv.includes('--built')) {
  try {
    const built = JSON.parse(readFileSync(new URL('../dist/server/wrangler.json', import.meta.url), 'utf8'));
    for (const key of ['name', 'account_id', 'workers_dev', 'preview_urls', 'vars', 'routes']) {
      if (JSON.stringify(built[key]) !== JSON.stringify(config[key])) errors.push(`Build is out of date for ${key}; rebuild.`);
    }
    if (built.assets?.binding !== 'ASSETS' || built.assets?.run_worker_first !== false) errors.push('Built assets configuration is out of date; rebuild.');
    if (built.d1_databases?.find((item) => item.binding === 'DB')?.database_id !== db?.database_id) errors.push('Built D1 binding differs from wrangler.json; rebuild.');
  } catch { errors.push('No production build; run npm run build first.'); }
}
if (errors.length) {console.error('Deployment is not configured:\n' + errors.map((error) => '- ' + error).join('\n'));process.exit(1);}
console.log('Owner account, database and hosting configuration checked.');
