import { requireStoreUser } from '@/app/auth';
import Admin from './panel';
export const dynamic='force-dynamic';
export default async function AdminPage(){const u=await requireStoreUser();return <Admin name={u.displayName}/>}

export const metadata = { robots: { index: false, follow: false } };
