import { readFileSync } from "node:fs";

// Account identifiers are deliberately unset until the owner's resources exist.
const config = JSON.parse(readFileSync(new URL("../wrangler.json", import.meta.url), "utf8"));
const errors = [];
const db = config.d1_databases?.find((item) => item.binding === "DB");
if (!db || !/^[a-f\d-]{36}$/i.test(db.database_id) || db.database_id === "00000000-0000-4000-8000-000000000000") errors.push("Set the owner's real D1 database_id in wrangler.json.");
if (!/^[a-f\d]{32}$/i.test(config.account_id || process.env.CLOUDFLARE_ACCOUNT_ID || "")) errors.push("Set account_id or CLOUDFLARE_ACCOUNT_ID to the owner's Cloudflare account ID.");
const vars = config.vars || {};
if (!/^https:\/\/[a-z\d-]+\.cloudflareaccess\.com$/i.test(vars.CLOUDFLARE_ACCESS_TEAM_DOMAIN || "")) errors.push("Set CLOUDFLARE_ACCESS_TEAM_DOMAIN to https://your-team.cloudflareaccess.com.");
if (!/^[a-f\d]{64}$/i.test(vars.CLOUDFLARE_ACCESS_AUD || "")) errors.push("Set CLOUDFLARE_ACCESS_AUD to the Access application's audience tag.");
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vars.OWNER_EMAIL || "")) errors.push("Set OWNER_EMAIL to the address allowed by the Access policy.");
if (config.workers_dev !== false || config.preview_urls !== false) errors.push("Keep workers.dev and preview URLs disabled for the domain-only deployment.");
if (config.assets?.binding !== "ASSETS" || config.assets?.run_worker_first !== false) errors.push("Use public asset-first delivery with the ASSETS binding for styles, scripts and images.");
if (!config.routes?.some((route) => route.pattern === "trholod.uz" && route.custom_domain === true)) errors.push("Add the trholod.uz custom domain route after the zone is active in your account.");
if (process.argv.includes("--built")) {
  try {
    const built = JSON.parse(readFileSync(new URL("../dist/server/wrangler.json", import.meta.url), "utf8"));
    for (const key of ["name", "account_id", "workers_dev", "preview_urls", "vars", "routes"]) {
      if (JSON.stringify(built[key]) !== JSON.stringify(config[key])) errors.push(`Build is out of date for ${key}; run npm run build again.`);
    }
    if (built.assets?.binding !== "ASSETS" || built.assets?.run_worker_first !== false) errors.push("Built assets configuration is out of date; rebuild.");
    if (built.d1_databases?.find((item) => item.binding === "DB")?.database_id !== db?.database_id) errors.push("Built D1 binding differs from wrangler.json; rebuild.");
  } catch { errors.push("No production build; run npm run build first."); }
}
if (errors.length) {
  console.error("Deployment is not configured:\n" + errors.map((error) => "- " + error).join("\n"));
  process.exit(1);
}
console.log("Owner account, database, private access and domain configuration checked.");
