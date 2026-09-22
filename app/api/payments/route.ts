import {endpoint,json,user,sameOrigin} from '@/lib/server';
export async function POST(req:Request){return endpoint(async()=>{sameOrigin(req);await user();return json({error:'Онлайн-оплата ещё не подключена. Списание денег не выполнялось.'},503);});}
