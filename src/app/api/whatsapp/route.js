import { NextResponse } from 'next/server';

export async function POST(request) {
  const { to, message } = await request.json();
  const url = process.env.WAHA_API_URL;
  const apiKey = process.env.WAHA_API_KEY;
  if (!url || !apiKey) {
    return NextResponse.json({ error: 'WAHA env vars not set' }, { status: 500 });
  }

  // Normalize phone to international format: strip +, ensure 62 prefix, append @c.us
  let phone = to.replace(/[^0-9]/g, '');
  if (phone.startsWith('08')) phone = '62' + phone.slice(1);
  if (!phone.startsWith('62')) phone = '62' + phone;
  const chatId = `${phone}@c.us`;

  try {
    const res = await fetch(`${url}/api/sendText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      },
      body: JSON.stringify({
        session: 'default',
        chatId,
        text: message
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'WAHA request failed');
    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error('WAHA error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
