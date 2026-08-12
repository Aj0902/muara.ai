import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');

  const rawUrl = process.env.WAHA_API_URL;
  const rawKey = process.env.WAHA_API_KEY;
  const session = process.env.WAHA_SESSION?.trim() || 'default';

  if (!rawUrl || !rawKey) {
    return NextResponse.json({
      error: 'Environment variables WAHA_API_URL or WAHA_API_KEY are missing in Vercel / .env.local',
      envCheck: {
        hasUrl: !!rawUrl,
        hasKey: !!rawKey,
        session
      }
    }, { status: 400 });
  }

  if (!phone) {
    return NextResponse.json({
      message: 'WAHA diagnostic endpoint is ready. Add ?phone=08xxxxxxxxxx to test sending a test WA message.',
      config: {
        url: rawUrl.trim().replace(/\/+$/, ''),
        session,
        hasKey: true
      }
    });
  }

  const url = rawUrl.trim().replace(/\/+$/, '');
  const apiKey = rawKey.trim();

  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('08')) cleanPhone = '62' + cleanPhone.slice(1);
  if (!cleanPhone.startsWith('62')) cleanPhone = '62' + cleanPhone;
  const chatId = `${cleanPhone}@c.us`;

  const targetEndpoint = `${url}/api/sendText`;

  try {
    const res = await fetch(targetEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      },
      body: JSON.stringify({
        session,
        chatId,
        text: '🧪 Tes Notifikasi WhatsApp dari CMS UMKM!'
      })
    });

    const responseText = await res.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    return NextResponse.json({
      success: res.ok,
      httpStatus: res.status,
      targetEndpoint,
      chatId,
      session,
      wahaResponse: responseData
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
