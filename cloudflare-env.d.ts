declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    ADMIN_ACCESS_KEY_SHA256?: string;
    SESSION_SECRET?: string;
    OWNER_EMAIL?: string;
  }
}
