import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { to, message } = await request.json();
    const rawUrl = process.env.WAHA_API_URL;
    const rawApiKey = process.env.WAHA_API_KEY;
    const session = process.env.WAHA_SESSION?.trim() || 'default';

    if (!rawUrl || !rawApiKey) {
      return NextResponse.json({
        error: 'WAHA_API_URL atau WAHA_API_KEY belum dikonfigurasi di Environment Variables.'
      }, { status: 500 });
    }

    if (!to || !message) {
      return NextResponse.json({ error: 'Nomor tujuan (to) dan pesan (message) wajib diisi.' }, { status: 400 });
    }

    const url = rawUrl.trim().replace(/\/+$/, '');
    const apiKey = rawApiKey.trim();

    // Normalize phone: strip +, ensure 62 prefix, append @c.us
    let phone = to.replace(/[^0-9]/g, '');
    if (phone.startsWith('08')) phone = '62' + phone.slice(1);
    if (!phone.startsWith('62')) phone = '62' + phone;
    const chatId = `${phone}@c.us`;

    const res = await fetch(`${url}/api/sendText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      },
      body: JSON.stringify({
        session,
        chatId,
        text: message
      })
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
