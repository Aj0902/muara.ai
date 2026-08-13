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
  const customSession = searchParams.get('session');

  const rawUrl = process.env.N8N_WEBHOOK_URL || process.env.WAHA_API_URL;
  const rawApiKey = customKey || process.env.WAHA_API_KEY;
  const session = customSession?.trim() || process.env.WAHA_SESSION?.trim() || 'muara';

  if (!rawUrl) {
    return NextResponse.json({
      error: 'Environment variable N8N_WEBHOOK_URL (atau WAHA_API_URL) belum ada di Vercel'
    }, { status: 400 });
  }

  if (!phone) {
    return NextResponse.json({
      message: 'Diagnostik n8n Webhook / WAHA Siap. Tambahkan ?phone=08xxxxxxxxxx di URL untuk tes kirim JSON payload ke webhook Anda.',
      config: {
        targetUrl: rawUrl.trim(),
        session,
        hasApiKey: !!rawApiKey
      }
    });
  }

  let url = rawUrl.trim();
  if (!url.includes('/api/sendText') && !url.includes('webhook') && !url.includes('n8n')) {
    url = url.replace(/\/+$/, '') + '/api/sendText';
  }

  const cleanPhone = normalizePhone(phone);
  const chatId = `${cleanPhone}@c.us`;

  const payload = {
    session,
    chatId,
    text: '🧪 Tes Notifikasi WhatsApp dari CMS UMKM!'
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
      webhookResponse: data
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
