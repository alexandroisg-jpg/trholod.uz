declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    ADMIN_ACCESS_KEY_SHA256?: string;
    CLOUDFLARE_ACCESS_TEAM_DOMAIN?: string;
    CLOUDFLARE_ACCESS_AUD?: string;
    OWNER_EMAIL?: string;
  }
}
