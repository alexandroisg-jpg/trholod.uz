'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, LockKeyhole } from 'lucide-react';
export default function Login({ returnTo }: { returnTo: string }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password, returnTo }) });
      const result = await response.json() as {error?:string;returnTo?:string};
      if (!response.ok) throw new Error(result.error || 'Не удалось войти.');
      setPassword(''); window.location.assign(result.returnTo || '/orders');
    } catch (error) { setError(error instanceof Error ? error.message : 'Не удалось войти. Попробуйте ещё раз.'); }
    finally { setBusy(false); }
  }
  return <section className="auth-panel"><LockKeyhole size={30}/><div className="eyebrow">TR HOLOD / ЛИЧНЫЙ ДОСТУП</div><h1>Вход владельца</h1><p>Введите свой ключ для работы с заказами и управления магазином.</p><form onSubmit={submit}><label htmlFor="owner-password">Ключ владельца</label><input id="owner-password" name="password" type="password" autoComplete="current-password" required maxLength={512} value={password} onChange={(event) => setPassword(event.target.value)} disabled={busy}/>{error && <p className="error" role="alert">{error}</p>}<button className="primary" disabled={busy}>{busy ? 'Входим…' : 'Войти'}<ArrowRight size={18}/></button></form><Link className="text-button" href="/">Вернуться в каталог</Link></section>;
}
