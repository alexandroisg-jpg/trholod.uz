import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const origin = 'https://trholod.uz';
const endpoint = 'https://api.indexnow.org/indexnow';
// Public domain-verification file, not a password or a hosting credential.
const key = 'fa7ea336dbe39a88a80b3a838bce7dd9';
const keyLocation = `${origin}/${key}.txt`;
const sitemapLocation = `${origin}/sitemap.xml`;

function xmlText(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, entity) => {
    if (entity[0] === '#') {
      const number = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      if (!Number.isSafeInteger(number) || number < 0 || number > 0x10ffff) throw new Error('Некорректная XML-сущность в sitemap.');
      return String.fromCodePoint(number);
    }
    return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[entity.toLowerCase()];
  });
}

export function publicSitemapUrls(xml) {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml) || !/<urlset\b/i.test(xml) || !/<\/urlset\s*>/i.test(xml)) {
    throw new Error('Ожидался XML sitemap с urlset; индексы sitemap и внешние сущности не поддерживаются.');
  }
  const locations = [...xml.matchAll(/<loc\s*>\s*([^<]*?)\s*<\/loc\s*>/gi)].map((match) => xmlText(match[1]));
  const urls = new Set();
  for (const location of locations) {
    try {
      const url = new URL(location);
      if (url.origin !== origin || url.username || url.password || url.search || url.hash || url.href !== location) continue;
      // Only canonical HTML routes; never submit APIs, owner sections or static files.
      const publicPage = ['/', '/catalog', '/credits'].includes(url.pathname)
        || /^\/catalog\/(?:category\/)?[a-z0-9-]+$/.test(url.pathname);
      if (publicPage) urls.add(url.href);
    } catch {
      // Ignore malformed, off-site, private and noncanonical entries.
    }
  }
  if (!urls.size) throw new Error('В sitemap нет подходящих публичных адресов trholod.uz.');
  if (urls.size > 10000) throw new Error('В sitemap больше 10 000 адресов; разделите отправку на пакеты.');
  return { urls: [...urls], skipped: locations.length - urls.size };
}

async function liveText(url, label) {
  let response;
  try {
    response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(15000) });
  } catch {
    throw new Error(`${label} недоступен по ${url}. Сначала опубликуйте сайт и подключите домен; отправка в IndexNow не выполнена.`);
  }
  if (response.status !== 200) throw new Error(`${label}: HTTP ${response.status}. Сначала восстановите публичный доступ; отправка не выполнена.`);
  const text = await response.text();
  if (text.length > 5000000) throw new Error(`${label} превышает допустимый размер; отправка не выполнена.`);
  return text;
}

export async function submitIndexNow({ dryRun = false } = {}) {
  const localKey = (await readFile(new URL(`../public/${key}.txt`, import.meta.url), 'utf8')).trim();
  if (localKey !== key) throw new Error('Локальный файл подтверждения IndexNow не соответствует ключу.');
  const [remoteKey, xml] = await Promise.all([
    liveText(keyLocation, 'Файл подтверждения IndexNow'),
    liveText(sitemapLocation, 'Sitemap'),
  ]);
  if (remoteKey.trim() !== key) throw new Error('Файл подтверждения на trholod.uz не совпадает с ключом. Отправка не выполнена.');
  const { urls, skipped } = publicSitemapUrls(xml);
  if (skipped) console.log(`Пропущено ${skipped} повторных, закрытых или неканонических адресов.`);
  if (dryRun) {
    console.log(`Проверено ${urls.length} публичных адресов. Режим проверки: в IndexNow ничего не отправлено.`);
    return { submitted: false, count: urls.length };
  }
  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      redirect: 'error',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: 'trholod.uz', key, keyLocation, urlList: urls }),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new Error('Ответ IndexNow не получен. Доставка запроса не подтверждена; автоматического повторения нет.');
  }
  if (![200, 202].includes(response.status)) {
    const reasons = { 400: 'неверный формат запроса', 403: 'не подтверждён ключ', 422: 'неверный домен или адреса', 429: 'превышена частота запросов' };
    throw new Error(`IndexNow: HTTP ${response.status}${reasons[response.status] ? ` — ${reasons[response.status]}` : ''}. Успешная отправка не подтверждена.`);
  }
  console.log(`IndexNow получил ${urls.length} адресов (HTTP ${response.status}).${response.status === 202 ? ' Проверка ключа ещё ожидается.' : ''} Это уведомление об адресах, а не подтверждение индексации. Google через IndexNow не уведомляется.`);
  return { submitted: true, count: urls.length, status: response.status };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== '--dry-run')) {
    console.error('Использование: node scripts/submit-indexnow.mjs [--dry-run]');
    process.exitCode = 1;
  } else {
    submitIndexNow({ dryRun: args.includes('--dry-run') }).catch((error) => {
      console.error(error instanceof Error ? error.message : 'IndexNow: неизвестная ошибка.');
      process.exitCode = 1;
    });
  }
}
