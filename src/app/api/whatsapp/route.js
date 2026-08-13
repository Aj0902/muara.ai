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
    const { to, message, session: reqSession } = await request.json();

    const targetUrl = process.env.N8N_WEBHOOK_URL || process.env.WAHA_API_URL;
    const apiKey = process.env.WAHA_API_KEY?.trim();
    const session = reqSession?.trim() || process.env.WAHA_SESSION?.trim() || 'muara';

    if (!targetUrl) {
      return NextResponse.json({
        error: 'N8N_WEBHOOK_URL atau WAHA_API_URL belum dikonfigurasi di Environment Variables.'
      }, { status: 500 });
    }

    if (!to || !message) {
      return NextResponse.json({ error: 'Nomor tujuan (to) dan pesan (message) wajib diisi.' }, { status: 400 });
    }

    let url = targetUrl.trim();
    if (!url.includes('/api/sendText') && !url.includes('webhook') && !url.includes('n8n')) {
      url = url.replace(/\/+$/, '') + '/api/sendText';
    }

    const cleanPhone = normalizePhone(to);
    const chatId = `${cleanPhone}@c.us`;

    // Strict 3-field WAHA JSON payload format:
    const payload = {
      session,
      chatId,
      text: message
    };

    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    const res = await fetch(url, {
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
    console.error('WA API Route error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
