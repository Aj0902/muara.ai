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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');
  const customKey = searchParams.get('key');

  const rawUrl = process.env.WAHA_API_URL;
  const rawApiKey = customKey || process.env.WAHA_API_KEY;
  const session = 'muara'; // Permanently set session to 'muara'

  if (!rawUrl) {
    return NextResponse.json({
      error: 'Environment variable WAHA_API_URL belum ada di Vercel'
    }, { status: 400 });
  }

  if (!phone) {
    return NextResponse.json({
      message: 'Diagnostik WAHA API Siap. Tambahkan ?phone=08xxxxxxxxxx di URL untuk tes kirim 3-field JSON payload ke server WAHA Anda.',
      config: {
        targetUrl: rawUrl.trim(),
        session,
        hasApiKey: !!rawApiKey
      }
    });
  }

  const baseUrl = rawUrl.trim().replace(/\/+$/, '');
  const url = baseUrl.endsWith('/api/sendText') ? baseUrl : `${baseUrl}/api/sendText`;

  const cleanPhone = normalizePhone(phone);
  const chatId = `${cleanPhone}@c.us`;

  const payload = {
    session,
    chatId,
    text: '🧪 Tes Notifikasi WAHA API dari CMS UMKM (muara-ai.vercel.app)!'
  };

  const headers = { 'Content-Type': 'application/json' };
  if (rawApiKey) {
    headers['X-Api-Key'] = rawApiKey.trim();
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const resText = await res.text();
    let data;
    try { data = JSON.parse(resText); } catch { data = resText; }

    return NextResponse.json({
      success: res.ok,
      httpStatus: res.status,
      targetUrl: url,
      payloadSent: payload,
      wahaResponse: data
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message,
      targetUrl: url,
      payloadSent: payload
    }, { status: 500 });
  }
}
