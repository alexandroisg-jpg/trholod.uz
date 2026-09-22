import { safeReturnPath } from '@/lib/access-auth';
import { Header, Footer } from '@/app/shared';
import Login from './sign-in';
export const metadata = { title: 'Вход владельца — TR HOLOD', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  const params = await searchParams;
  return <><Header/><main className="wrap page-main"><Login returnTo={safeReturnPath(params.returnTo)}/></main><Footer/></>;
}
