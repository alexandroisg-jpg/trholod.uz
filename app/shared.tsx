'use client';
import {useState} from 'react';
import {Snowflake,MapPin,ArrowUpRight} from 'lucide-react';
import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from '@/components/ui/select';
export function Choice({value,onChange,options,label}:{value:string;onChange:(s:string)=>void;options:string[];label:string}){return <Select value={value} onValueChange={onChange}><SelectTrigger className="choice" aria-label={label}><SelectValue placeholder={label}/></SelectTrigger><SelectContent>{options.map(o=><SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select>}
export function Logo(){return <a href="/" className="brand" aria-label="TR HOLOD — каталог"><span className="brand-icon"><img src="/brand/tr-monogram.webp" width="58" height="58" alt=""/></span><span className="brand-type">TR<span className="brand-space"> </span><b>HOLOD</b><small>ТЕХНОЛОГИИ ХОЛОДА</small></span></a>}
export function DemoBar(){return <div className="demo-bar"><span className="wrap">Ташкент <span className="demo-divider">/</span> Холодильное оборудование · подбор по модели</span></div>}
export function Header(){return <div className="store-top"><DemoBar/><header className="wrap header"><Logo/><nav><a href="/">Каталог</a><a href="/orders">Мои заказы</a><a href="/admin">Управление <ArrowUpRight size={15}/></a></nav></header></div>}
export function Footer(){return <footer><div className="wrap footer-main"><Logo/><div><strong>Склад TR HOLOD</strong><p><MapPin size={16}/> Ташкент, Яккасарайский район,<br/>массив Башлык, 6/1</p></div><div><a href="/orders">Мои заказы</a><a href="/admin">Управление магазином</a><a href="/credits">Об изображениях и товарах</a></div></div><div className="wrap footer-bottom"><span>© 2026 ООО «TR HOLOD» · Демонстрационный каталог</span><span>Разработка ASIATECHNOSTROY</span></div></footer>}

export function LogoutButton(){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 async function logout(){setBusy(true);setError('');try{const response=await fetch('/api/auth/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});if(!response.ok)throw new Error('Не удалось выйти. Попробуйте ещё раз.');window.location.assign('/');}catch(error){setError(error instanceof Error?error.message:'Не удалось выйти.');setBusy(false);}}
 return <><button className="text-button" type="button" disabled={busy} onClick={logout}>{busy?'Выходим…':'Выйти из учётной записи'}</button>{error&&<p className="error" role="alert">{error}</p>}</>;
}
