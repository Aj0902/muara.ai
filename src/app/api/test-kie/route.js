import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = (process.env.KIE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)?.trim();
  const rawModel = process.env.KIE_MODEL_NAME;
  const modelName = (!rawModel || rawModel === 'KIE_MODEL_NAME') ? 'gemini-3-5-flash' : rawModel.trim();
  const rawBaseUrl = process.env.KIE_API_BASE_URL;
  const userBaseUrl = (!rawBaseUrl || rawBaseUrl.includes('KIE_API_BASE_URL')) ? 'https://api.kie.ai/v1' : rawBaseUrl.trim();

  const isPlaceholderKey = !apiKey || apiKey === 'your_kie_api_key_here';

  if (isPlaceholderKey) {
    return NextResponse.json({
      status: 'WARNING',
      message: 'KIE_API_KEY belum dikonfigurasi di Vercel / .env.local',
      instructions: 'Isi KIE_API_KEY dengan API Key asli dari dashboard KIE.ai di Vercel Environment Variables.',
      config: {
        hasApiKey: false,
        modelName,
        userBaseUrl
      }
    }, { status: 200 });
  }

  // Endpoints to test in order
  const testEndpoints = [
    {
      name: 'KIE OpenAI-Compatible (Model Specific)',
      url: `https://api.kie.ai/${modelName}-openai/v1/chat/completions`,
      type: 'openai'
    },
    {
      name: 'KIE OpenAI-Compatible (General v1)',
      url: `${userBaseUrl.replace(/\/+$/, '')}/chat/completions`,
      type: 'openai'
    },
    {
      name: 'KIE Native Gemini Endpoint',
      url: `https://api.kie.ai/gemini/v1/models/${modelName}:generateContent`,
      type: 'gemini_native'
    },
    {
      name: 'Google Gemini Direct Endpoint',
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      type: 'gemini_direct'
    }
  ];

  const results = [];
  let successfulResult = null;

  for (const ep of testEndpoints) {
    const startTime = Date.now();
    try {
      let res;
      if (ep.type === 'openai') {
        res = await fetch(ep.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: 'system', content: 'You are a test bot.' },
              { role: 'user', content: 'Say hello in JSON: {"status": "ok"}' }
            ],
            response_format: { type: 'json_object' }
          })
        });
      } else if (ep.type === 'gemini_native') {
        res = await fetch(ep.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Say hello in JSON: {"status": "ok"}' }] }]
          })
        });
      } else {
        // gemini_direct
        res = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Say hello in JSON: {"status": "ok"}' }] }]
          })
        });
      }

      const duration = `${Date.now() - startTime}ms`;
      const responseText = await res.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      const epResult = {
        name: ep.name,
        url: ep.url,
        httpStatus: res.status,
        latency: duration,
        success: res.ok,
        data: responseData
      };

      results.push(epResult);

      if (res.ok && !successfulResult) {
        successfulResult = epResult;
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

  if (successfulResult) {
    return NextResponse.json({
      status: 'SUCCESS',
      message: `✅ Koneksi Berhasil via Endpoint: ${successfulResult.name}!`,
      workingEndpoint: successfulResult.url,
      recommendedBaseUrl: successfulResult.url.replace(/\/chat\/completions$/, '').replace(/\/models\/.*$/, ''),
      latency: successfulResult.latency,
      testedEndpoints: results,
      keySnippet: `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`
    }, { status: 200 });
  }

  return NextResponse.json({
    status: 'ERROR',
    message: 'Seluruh endpoint mengalami error 404 / 401. Periksa kembali format KIE_API_KEY atau KIE_MODEL_NAME Anda di Vercel.',
    testedEndpoints: results,
    keySnippet: `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`
  }, { status: 200 });
}
