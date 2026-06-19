import { ENV } from "./env";

const BASE = () =>
  ENV.billplzSandbox ? "https://www.billplz-sandbox.com/api/v3" : "https://www.billplz.com/api/v3";

export function billplzConfigured(): boolean {
  return !!(ENV.billplzApiKey && ENV.billplzCollectionId);
}

function authHeader(): string {
  // Billplz uses HTTP Basic auth with the API key as username and a blank password.
  return "Basic " + Buffer.from(`${ENV.billplzApiKey}:`).toString("base64");
}

export type Bill = { id: string; url: string; paid: boolean; reference_1?: string | null };

/** Create a Billplz bill and return its hosted payment URL. */
export async function createBill(params: {
  email: string;
  name: string;
  amountCents: number;
  description: string;
  callbackUrl: string;
  redirectUrl: string;
  reference?: string;
}): Promise<{ id: string; url: string }> {
  const body = new URLSearchParams({
    collection_id: ENV.billplzCollectionId,
    email: params.email,
    name: params.name || params.email,
    amount: String(Math.max(1, Math.round(params.amountCents))),
    description: params.description.slice(0, 200),
    callback_url: params.callbackUrl,
    redirect_url: params.redirectUrl,
  });
  if (params.reference) {
    body.set("reference_1_label", "ref");
    body.set("reference_1", params.reference);
  }

  const resp = await fetch(`${BASE()}/bills`, {
    method: "POST",
    headers: { Authorization: authHeader(), "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!resp.ok) {
    throw new Error(`Billplz create bill failed (${resp.status}): ${await resp.text().catch(() => "")}`);
  }
  const data = (await resp.json()) as { id: string; url: string };
  return { id: data.id, url: data.url };
}

/**
 * Fetch a bill from Billplz to confirm its real payment status. Re-querying the
 * source of truth is safer than trusting the callback body / signature.
 */
export async function getBill(id: string): Promise<Bill> {
  const resp = await fetch(`${BASE()}/bills/${encodeURIComponent(id)}`, {
    headers: { Authorization: authHeader() },
  });
  if (!resp.ok) {
    throw new Error(`Billplz get bill failed (${resp.status})`);
  }
  return (await resp.json()) as Bill;
}

/** Amount (in sen/cents) charged per plan. */
export function planAmountCents(plan: "monthly" | "annual" | "pay_per_use"): number {
  switch (plan) {
    case "monthly": return 5900;    // RM 59
    case "annual": return 59000;    // RM 590
    case "pay_per_use": return 1200; // RM 12
  }
}
