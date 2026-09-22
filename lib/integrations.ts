// Provider-neutral boundaries. No provider is selected and no network call is made.
// A real adapter must verify signatures, currency/amount, merchant ID and idempotency.
export type PaymentRequest={orderId:string;amountUZS:number;returnUrl:string;idempotencyKey:string};
export interface PaymentProvider{createHostedCheckout(input:PaymentRequest):Promise<{url:string;transactionId:string}>;verifyWebhook(request:Request):Promise<{orderId:string;amountUZS:number;transactionId:string;paid:boolean}>;}
export interface NotificationProvider{send(input:{eventId:string;orderId:string;recipient:'buyer'|'manager';text:string}):Promise<{providerMessageId:string}>;}
export const integrationState={payments:'not_connected',buyerNotifications:'not_configured',managerNotifications:'not_configured'} as const;
