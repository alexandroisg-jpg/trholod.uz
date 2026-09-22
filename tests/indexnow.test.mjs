import assert from 'node:assert/strict';
import { test } from 'node:test';
import { publicSitemapUrls } from '../scripts/submit-indexnow.mjs';

const sitemap = (urls) => `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${url}</loc></url>`).join('')}</urlset>`;

test('includes canonical public HTML routes and deduplicates', () => {
  const expected = ['https://trholod.uz/', 'https://trholod.uz/catalog', 'https://trholod.uz/credits', 'https://trholod.uz/catalog/category/tools', 'https://trholod.uz/catalog/value-vdg-s1--premium-t001'];
  assert.deepEqual(publicSitemapUrls(sitemap([...expected, expected[0]])), { urls: expected, skipped: 1 });
});

test('never submits owner paths, APIs, assets or encoded path aliases', () => {
  const excluded = ['/admin', '/admin/orders', '/orders', '/api/orders', '/api/catalog', '/robots.txt', '/sitemap.xml', '/products/photo.webp', '/%61dmin', '/catalog/%2e%2e/admin', '/catalog/../admin'];
  const result = publicSitemapUrls(sitemap(['https://trholod.uz/', ...excluded.map((path) => `https://trholod.uz${path}`)]));
  assert.deepEqual(result.urls, ['https://trholod.uz/']);
  assert.equal(result.skipped, excluded.length);
});

test('rejects off-site, insecure and noncanonical forms', () => {
  const excluded = ['https://other.example/catalog', 'http://trholod.uz/catalog', 'https://www.trholod.uz/catalog', 'https://trholod.uz:443/catalog', 'https://trholod.uz/catalog/', 'https://trholod.uz/catalog?sort=price&amp;page=2', 'https://trholod.uz/catalog#top', 'https://owner@trholod.uz/catalog', 'https://trholod.uz/catalog/../catalog', 'not a url'];
  const result = publicSitemapUrls(sitemap(['https://trholod.uz/', ...excluded]));
  assert.deepEqual(result.urls, ['https://trholod.uz/']);
  assert.equal(result.skipped, excluded.length);
});

test('rejects login HTML, sitemap indexes, DTDs and empty URL sets', () => {
  for (const xml of ['<html>Login</html>', '<sitemapindex></sitemapindex>', '<!DOCTYPE urlset SYSTEM "file:///etc/passwd"><urlset></urlset>', '<urlset></urlset>']) {
    assert.throws(() => publicSitemapUrls(xml));
  }
});
