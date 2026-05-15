// Paystack Inline checkout helper.
//
// Uses Paystack's inline.js — loaded on demand. Inline checkout pops a modal
// where the parent chooses MoMo (MTN / Telecel / AT), card, bank transfer, or
// USSD. Public key is safe to embed in the bundled app; secret key stays
// server-side (we don't use it from the client).
//
// Reference docs: https://paystack.com/docs/payments/accept-payments/

declare global {
  interface Window {
    PaystackPop?: {
      setup: (opts: PaystackInlineOptions) => { openIframe: () => void };
    };
  }
}

interface PaystackInlineOptions {
  key: string;
  email: string;
  amount: number; // pesewas (GHS * 100)
  currency: string;
  ref: string;
  channels?: string[];
  subaccount?: string;
  metadata?: Record<string, unknown>;
  callback: (response: { reference: string; status: string; trans?: string }) => void;
  onClose: () => void;
}

const PAYSTACK_SCRIPT_URL = "https://js.paystack.co/v1/inline.js";

async function loadPaystackScript(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (window.PaystackPop) return true;
  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${PAYSTACK_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = PAYSTACK_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface PaystackCheckoutInput {
  publicKey: string;
  amountGhs: number;
  email: string;
  reference: string;
  subaccount?: string;
  metadata?: Record<string, unknown>;
}

export interface PaystackCheckoutResult {
  ok: boolean;
  reference?: string;
  status?: string;
  error?: string;
  closed?: boolean;
}

export async function paystackInlineCheckout(input: PaystackCheckoutInput): Promise<PaystackCheckoutResult> {
  if (!input.publicKey) {
    return { ok: false, error: "Paystack public key not configured. Add it in /admin/settings." };
  }
  const loaded = await loadPaystackScript();
  if (!loaded || !window.PaystackPop) {
    return { ok: false, error: "Could not load Paystack — check your internet connection." };
  }
  return new Promise<PaystackCheckoutResult>((resolve) => {
    const handler = window.PaystackPop!.setup({
      key: input.publicKey,
      email: input.email,
      amount: Math.round(input.amountGhs * 100),
      currency: "GHS",
      ref: input.reference,
      channels: ["mobile_money", "card", "bank", "ussd", "bank_transfer"],
      subaccount: input.subaccount,
      metadata: input.metadata,
      callback: (response) => {
        resolve({ ok: true, reference: response.reference, status: response.status });
      },
      onClose: () => {
        resolve({ ok: false, closed: true, error: "Payment window closed before completion." });
      },
    });
    handler.openIframe();
  });
}
