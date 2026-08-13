import { NextResponse } from 'next/server';

function normalizePhone(rawPhone) {
  if (!rawPhone) return '';
  let phone = String(rawPhone).replace(/[^0-9]/g, '');
  if (phone.startsWith('6208')) {
    phone = '62' + phone.slice(4);
  } else if (phone.startsWith('08')) {
    phone = '62' + phone.slice(1);
  } else if (phone.startsWith('0')) {
    phone = '62' + phone.slice(1);
  } else if (!phone.startsWith('62')) {
    phone = '62' + phone;
  }
  return phone;
}

export async function POST(request) {
  try {
    const { to, message } = await request.json();

    const rawUrl = process.env.WAHA_API_URL;
    const apiKey = process.env.WAHA_API_KEY?.trim();
    const session = 'muara';

    if (!rawUrl) {
      return NextResponse.json({
        error: 'WAHA_API_URL belum dikonfigurasi di Environment Variables.'
      }, { status: 500 });
    }

    if (!to || !message) {
      return NextResponse.json({ error: 'Nomor tujuan (to) dan pesan (message) wajib diisi.' }, { status: 400 });
    }

    const baseUrl = rawUrl.trim().replace(/\/+$/, '');
    const baseEndpoint = baseUrl.endsWith('/api/sendText') ? baseUrl : `${baseUrl}/api/sendText`;

    // Append key and session to URL query params for maximum compatibility
    const targetUrl = new URL(baseEndpoint);
    if (apiKey) targetUrl.searchParams.set('x-api-key', apiKey);
    targetUrl.searchParams.set('session', session);

    const cleanPhone = normalizePhone(to);
    const chatId = `${cleanPhone}@c.us`;

    // Strict 3-field JSON payload expected by WAHA API:
    const payload = {
      session,
      chatId,
      text: message
    };

    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    const res = await fetch(targetUrl.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const resText = await res.text();
    let data;
    try { data = JSON.parse(resText); } catch { data = resText; }

    if (!res.ok) {
      return NextResponse.json({
        error: typeof data === 'object' ? (data.message || data.error || JSON.stringify(data)) : data,
        status: res.status
      }, { status: res.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error('WAHA API Route error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
