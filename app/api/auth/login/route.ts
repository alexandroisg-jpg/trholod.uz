import { env } from 'cloudflare:workers';
import { handleOwnerLogin } from '@/lib/access-auth';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) { return handleOwnerLogin(request, env); }
