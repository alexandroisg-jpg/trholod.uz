import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const cli=fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js',import.meta.url));
let secrets;
try {
 const output=execFileSync(process.execPath,[cli,'secret','list','--config','wrangler.json'],{encoding:'utf8',env:{...process.env,WRANGLER_SEND_METRICS:'false'},stdio:['ignore','pipe','pipe']});
 secrets=JSON.parse(output);
} catch {
 console.error('Cannot check Worker secrets. Connect the owner Cloudflare account and configure the Worker before deployment.');
 process.exit(1);
}
const names=new Set(secrets.map((item)=>item.name));
const missing=['ADMIN_ACCESS_KEY_SHA256','SESSION_SECRET','OWNER_EMAIL'].filter((name)=>!names.has(name));
if(missing.length){console.error('Missing runtime secrets: '+missing.join(', '));process.exit(1);}
console.log('Required runtime secrets are present; no secret values were read.');
