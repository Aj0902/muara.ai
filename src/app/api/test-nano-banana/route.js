import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = (process.env.KIE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)?.trim();
  const isPlaceholderKey = !apiKey || apiKey === 'your_kie_api_key_here';

  if (isPlaceholderKey) {
    return NextResponse.json({
      status: 'WARNING',
      message: 'KIE_API_KEY belum dikonfigurasi di Vercel / .env.local',
      instructions: 'Tambahkan KIE_API_KEY di Vercel Environment Variables.'
    }, { status: 200 });
  }

  const endpointsToTest = [
    {
      name: 'KIE Task Creation API (jobs/createTask)',
      url: 'https://api.kie.ai/api/v1/jobs/createTask',
      body: {
        model: 'nano-banana-2',
        input: {
          prompt: 'A stunning modern storefront banner for an artisan shop, 4k resolution, professional photography',
          resolution: '1K',
          aspect_ratio: '16:9',
          output_format: 'png'
        }
      }
    },
    {
      name: 'KIE OpenAI Images API (v1/images/generations)',
      url: 'https://api.kie.ai/v1/images/generations',
      body: {
        model: 'nano-banana-2',
        prompt: 'A stunning modern storefront banner for an artisan shop, 4k resolution, professional photography',
        n: 1,
        size: '1024x1024'
      }
    }
  ];

  const results = [];
  let workingEndpoint = null;

  for (const ep of endpointsToTest) {
    const startTime = Date.now();
    try {
      const res = await fetch(ep.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(ep.body)
      });

      const duration = `${Date.now() - startTime}ms`;
      const responseText = await res.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      const isSuccess = res.ok;
      results.push({
        name: ep.name,
        url: ep.url,
        httpStatus: res.status,
        latency: duration,
        success: isSuccess,
        data: responseData
      });

      if (isSuccess && !workingEndpoint) {
        workingEndpoint = ep;
      }
    } catch (err) {
      results.push({
        name: ep.name,
        url: ep.url,
        httpStatus: 0,
        latency: `${Date.now() - startTime}ms`,
        success: false,
        error: err.message
      });
    }
  }

  if (workingEndpoint) {
    return NextResponse.json({
      status: 'SUCCESS',
      message: '✅ Koneksi Nano-Banana-2 Image Generator Berhasil!',
      workingEndpoint: workingEndpoint.name,
      results
    }, { status: 200 });
  }

  return NextResponse.json({
    status: 'DIAGNOSTIC_INFO',
    message: 'Hasil pengujian Nano-Banana-2 Image API:',
    results
  }, { status: 200 });
}
