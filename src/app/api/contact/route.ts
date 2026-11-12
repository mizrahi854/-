import { NextResponse } from 'next/server';

/**
 * Contact endpoint. Delivery requires CONTACT_WEBHOOK_URL (e.g. a CRM / Zapier / Make webhook).
 * Without it the endpoint answers 503 so the UI never reports a false success.
 */
const phoneRe = /^(?:\+?972|0)(?:[23489]|5\d|7\d)\d{7}$/;
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 }); }
  const name = String(body.name ?? '').trim();
  const phone = String(body.phone ?? '').replace(/[\s-]/g, '');
  const email = String(body.email ?? '').trim();
  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = 'required';
  if (!phoneRe.test(phone)) errors.phone = 'invalid';
  if (email && !emailRe.test(email)) errors.email = 'invalid';
  if (!body.privacy) errors.privacy = 'required';
  if (body.company_website) return NextResponse.json({ ok: true }); // honeypot
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, error: 'validation', errors }, { status: 422 });

  const url = process.env.CONTACT_WEBHOOK_URL;
  if (!url) return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });

  const payload = {
    name, phone, email,
    inquiry: String(body.inquiry ?? ''), project: String(body.project ?? ''), message: String(body.message ?? '').slice(0, 4000),
    marketingConsent: Boolean(body.marketing), source: 'bonei-website', at: new Date().toISOString(),
  };
  try {
    const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    if (!r.ok) return NextResponse.json({ ok: false, error: 'upstream' }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'upstream' }, { status: 502 });
  }
}
