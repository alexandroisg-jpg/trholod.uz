import Link from 'next/link';
import { Header, Footer, LogoutButton } from '@/app/shared';
export const metadata = { title: 'Выход — TR HOLOD', robots: { index: false, follow: false } };
export default function LogoutPage() {
  return <><Header/><main className="wrap page-main"><section className="auth-panel"><h1>Выход из магазина</h1><p>Завершите сеанс владельца на этом устройстве.</p><LogoutButton/><Link className="text-button" href="/">Вернуться в каталог</Link></section></main><Footer/></>;
}
