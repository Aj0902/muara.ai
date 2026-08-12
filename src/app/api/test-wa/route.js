import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');
  const customKey = searchParams.get('key');

  const rawUrl = process.env.WAHA_API_URL;
  const rawApiKey = customKey || process.env.WAHA_API_KEY;
  const session = process.env.WAHA_SESSION?.trim() || 'default';

  if (!rawUrl) {
    return NextResponse.json({
      error: 'Environment variable WAHA_API_URL is missing in Vercel'
    }, { status: 400 });
  }

  if (!rawApiKey) {
    return NextResponse.json({
      error: 'Environment variable WAHA_API_KEY is missing in Vercel. You can also pass &key=YOUR_KEY in URL to test.',
    }, { status: 400 });
  }

  if (!phone) {
    return NextResponse.json({
      message: 'WAHA diagnostic endpoint ready. Add ?phone=08xxxxxxxxxx to test. You can also pass &key=YOUR_KEY if testing different keys.',
      config: {
        url: rawUrl.trim().replace(/\/+$/, ''),
        session,
        apiKeyFirstChars: rawApiKey.substring(0, 4) + '***'
      }
    });
  }

  const url = rawUrl.trim().replace(/\/+$/, '');
  const apiKey = rawApiKey.trim();

  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('08')) cleanPhone = '62' + cleanPhone.slice(1);
  if (!cleanPhone.startsWith('62')) cleanPhone = '62' + cleanPhone;
  const chatId = `${cleanPhone}@c.us`;

  // We will try standard X-Api-Key header, and also x-api-key query param as fallback if 401
  const targetEndpoint = `${url}/api/sendText`;

  const payload = {
    session,
    chatId,
    text: '🧪 Tes Notifikasi WhatsApp dari CMS UMKM!'
  };

  try {
    // Attempt 1: X-Api-Key header
    let res = await fetch(targetEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      },
      body: JSON.stringify(payload)
    });

    let resText = await res.text();
    let data;
    try { data = JSON.parse(resText); } catch { data = resText; }

    // If 401, try Attempt 2: x-api-key query parameter
    let attemptUsed = 'X-Api-Key header';
    if (res.status === 401) {
      const urlWithKey = `${targetEndpoint}?x-api-key=${encodeURIComponent(apiKey)}`;
      const res2 = await fetch(urlWithKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resText2 = await res2.text();
      let data2;
      try { data2 = JSON.parse(resText2); } catch { data2 = resText2; }
      if (res2.ok) {
        res = res2;
        data = data2;
        attemptUsed = 'x-api-key query parameter';
      }
    }

    return NextResponse.json({
      success: res.ok,
      httpStatus: res.status,
      attemptUsed,
      targetEndpoint,
      chatId,
      session,
      apiKeyUsedPreview: apiKey.substring(0, 4) + '***' + apiKey.substring(Math.max(0, apiKey.length - 2)),
      wahaResponse: data
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message,
      targetEndpoint,
      chatId,
      session
    }, { status: 500 });
  }
}
