import { env } from 'cloudflare:workers';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { accessUserFromHeaders, type StoreUser } from '@/lib/access-auth';

export async function getStoreUser(): Promise<StoreUser | null> {
  return accessUserFromHeaders(await headers(), env);
}

export async function requireStoreUser(): Promise<StoreUser> {
  const user = await getStoreUser();
  if (user) return user;
  redirect('/cdn-cgi/access/logout');
}
