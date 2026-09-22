import { handleOwnerLogout } from '@/lib/access-auth';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) { return handleOwnerLogout(request); }
