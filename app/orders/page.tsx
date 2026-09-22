import {requireStoreUser} from '@/app/auth';
import Orders from './orders';
export const dynamic='force-dynamic';
export default async function Page(){await requireStoreUser();return <Orders/>}

export const metadata = { robots: { index: false, follow: false } };
