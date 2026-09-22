import { env } from 'cloudflare:workers';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { accessUserFromHeaders, safeReturnPath, type StoreUser } from '@/lib/access-auth';

export async function getStoreUser(): Promise<StoreUser | null> {
  return accessUserFromHeaders(await headers(), env);
}

export async function requireStoreUser(returnTo = "/orders"): Promise<StoreUser> {
  const user = await getStoreUser();
  if (user) return user;
  redirect(`/login?returnTo=${encodeURIComponent(safeReturnPath(returnTo))}`);
}
