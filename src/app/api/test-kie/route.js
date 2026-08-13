import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = (process.env.KIE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)?.trim();
  const modelName = process.env.KIE_MODEL_NAME || 'gemini-3-5-flash';
  const baseUrl = (process.env.KIE_API_BASE_URL || 'https://api.kie.ai/v1').replace(/\/+$/, '');
  const endpoint = `${baseUrl}/chat/completions`;

  const isPlaceholderKey = !apiKey || apiKey === 'your_kie_api_key_here';

  if (isPlaceholderKey) {
    return NextResponse.json({
      status: 'WARNING',
      message: 'KIE_API_KEY belum dikonfigurasi di Vercel / .env.local',
      instructions: 'Tambahkan KIE_API_KEY di Vercel Environment Variables lalu redeploy.',
      config: {
        hasApiKey: false,
        modelName,
        baseUrl,
        endpoint
      }
    }, { status: 200 });
  }

  try {
    const startTime = Date.now();
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: 'You are a diagnostic bot testing API connectivity.' },
          { role: 'user', content: 'Respond with a simple JSON object: {"status": "ok", "message": "KIE.ai API is working perfectly!"}' }
        ],
        response_format: { type: 'json_object' }
      })
    });

    const duration = `${Date.now() - startTime}ms`;
    const responseText = await res.text();

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    if (!res.ok) {
      return NextResponse.json({
        status: 'ERROR',
        httpStatus: res.status,
        latency: duration,
        message: 'Terjadi kesalahan saat memanggil KIE.ai API',
        errorDetails: responseData,
        config: {
          hasApiKey: true,
          apiKeySnippet: `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`,
          modelName,
          baseUrl,
          endpoint
        }
      }, { status: 200 });
    }

    return NextResponse.json({
      status: 'SUCCESS',
      httpStatus: res.status,
      latency: duration,
      message: '✅ Koneksi KIE.ai API Berhasil!',
      rawOutput: responseData,
      config: {
        hasApiKey: true,
        apiKeySnippet: `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`,
        modelName,
        baseUrl,
        endpoint
      }
    }, { status: 200 });

  } catch (err) {
    return NextResponse.json({
      status: 'EXCEPTION',
      message: 'Gagal menghubungi KIE.ai API (Network/Timeout Error)',
      error: err.message,
      config: {
        hasApiKey: true,
        modelName,
        baseUrl,
        endpoint
      }
    }, { status: 200 });
  }
}
