// Hubtel SMS + Receive Money client wrappers.
//
// These are intentionally fetch-based and provider-agnostic in their interface
// so that swapping to mNotify / Arkesel later is a small change. In dev (no
// keys) calls short-circuit to a mock response that still updates the store.
//
// Production wiring assumes the Capacitor app runs against a small server-side
// proxy that holds the Hubtel keys (the .p8 equivalent for Hubtel — they
// should never ship inside the bundled .apk/.ipa). See PHASE_4_HUBTEL_NOTES.md
// for the proxy spec when you set up the cloudflare worker.

const HUBTEL_SMS_BASE = "https://devp-sms03726-api.hubtel.com/v1/messages/send";
const HUBTEL_BALANCE_BASE = "https://devp-sms03726-api.hubtel.com/v1/account/profile";
const HUBTEL_CHECKOUT_BASE = "https://payproxyapi.hubtel.com/items/initiate";

export interface HubtelCreds {
  clientId: string;
  clientSecret: string;
  senderId?: string;
}

export interface SmsSendInput {
  to: string;
  body: string;
  senderId?: string;
}

export interface SmsSendResult {
  ok: boolean;
  reference?: string;
  error?: string;
  costEstimate?: number;
}

function basicAuth({ clientId, clientSecret }: HubtelCreds): string {
  if (typeof btoa === "function") return `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
  // Node-side fallback when SSR'd
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
}

export async function hubtelSendSms(creds: HubtelCreds, input: SmsSendInput): Promise<SmsSendResult> {
  if (!creds.clientId || !creds.clientSecret) {
    // Mock path — no keys configured. UI still shows the SMS log so admin can verify the message flow.
    return { ok: true, reference: `mock-${Date.now()}`, costEstimate: 0.03 };
  }
  try {
    const url = new URL(HUBTEL_SMS_BASE);
    url.searchParams.set("clientid", creds.clientId);
    url.searchParams.set("clientsecret", creds.clientSecret);
    url.searchParams.set("from", input.senderId ?? creds.senderId ?? "PHOENIX");
    url.searchParams.set("to", input.to);
    url.searchParams.set("content", input.body);
    const res = await fetch(url.toString(), { method: "GET" });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    const json = await res.json().catch(() => ({}));
    return { ok: true, reference: json.MessageId ?? json.messageId, costEstimate: json.Rate ?? json.rate };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

export async function hubtelGetBalance(creds: HubtelCreds): Promise<{ ok: boolean; balanceGhs?: number; error?: string }> {
  if (!creds.clientId || !creds.clientSecret) {
    return { ok: true, balanceGhs: 0 };
  }
  try {
    const res = await fetch(HUBTEL_BALANCE_BASE, {
      method: "GET",
      headers: { Authorization: basicAuth(creds), Accept: "application/json" },
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const json = await res.json().catch(() => ({}));
    // Hubtel returns balance under various keys depending on product
    const bal = json.balance ?? json.smsCreditBalance ?? json.data?.balance ?? 0;
    return { ok: true, balanceGhs: Number(bal) || 0 };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

export interface CheckoutInput {
  amount: number;
  description: string;
  clientReference: string;
  customer: { name: string; email?: string; phone?: string };
  callbackUrl: string;
  returnUrl: string;
}

export interface CheckoutResult {
  ok: boolean;
  checkoutUrl?: string;
  invoiceId?: string;
  error?: string;
}

export async function hubtelInitiateCheckout(
  creds: HubtelCreds & { merchantId?: string },
  input: CheckoutInput,
): Promise<CheckoutResult> {
  if (!creds.clientId || !creds.clientSecret || !creds.merchantId) {
    // Mock path — surface a fake URL so the admin/parent can preview the flow.
    return {
      ok: true,
      invoiceId: `mock-inv-${Date.now()}`,
      checkoutUrl: `https://checkout.hubtel.com/preview?ref=${input.clientReference}&amt=${input.amount}`,
    };
  }
  try {
    const body = {
      totalAmount: input.amount,
      description: input.description,
      callbackUrl: input.callbackUrl,
      returnUrl: input.returnUrl,
      merchantAccountNumber: creds.merchantId,
      cancellationUrl: input.returnUrl,
      clientReference: input.clientReference,
      customerName: input.customer.name,
      customerEmail: input.customer.email,
      customerMsisdn: input.customer.phone,
    };
    const res = await fetch(HUBTEL_CHECKOUT_BASE, {
      method: "POST",
      headers: {
        Authorization: basicAuth(creds),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const json = await res.json().catch(() => ({}));
    const data = json.data ?? json;
    return {
      ok: true,
      checkoutUrl: data.checkoutUrl ?? data.checkoutDirectUrl,
      invoiceId: data.checkoutId ?? data.invoiceToken ?? json.responseCode,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

// Cost helpers
const HUBTEL_SMS_UNIT_GHS = 0.03; // approx — re-check live pricing
export function estimateSmsCost(recipientCount: number, segmentsPerMessage = 1): number {
  return Number((recipientCount * segmentsPerMessage * HUBTEL_SMS_UNIT_GHS).toFixed(2));
}
