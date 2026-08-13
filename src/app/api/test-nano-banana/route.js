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
    }
  ];

  const results = [];
  let workingTask = null;

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

      if (isSuccess && responseData.data?.taskId) {
        workingTask = responseData.data;
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

  if (workingTask) {
    const taskId = workingTask.taskId;
    let polledData = null;

    // Polling task detail for 3 attempts (6s total)
    for (let i = 0; i < 3; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const pollRes = await fetch(`https://api.kie.ai/api/v1/jobs/recordDetail?taskId=${taskId}`, {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (pollRes.ok) {
          polledData = await pollRes.json();
          const imgUrl = polledData.data?.resultUrl || polledData.data?.response?.resultUrl || polledData.data?.url;
          if (imgUrl) break;
        }
      } catch (err) {
        console.warn('Polling error:', err.message);
      }
    }

    return NextResponse.json({
      status: 'SUCCESS',
      message: '✅ Task Nano-Banana-2 Berhasil Dibuat & Diproses!',
      taskId,
      createdTask: workingTask,
      polledResult: polledData,
      imageUrl: polledData?.data?.resultUrl || polledData?.data?.response?.resultUrl || polledData?.data?.url || 'Sedang diproses oleh KIE.ai server...',
      results
    }, { status: 200 });
  }

  return NextResponse.json({
    status: 'DIAGNOSTIC_INFO',
    message: 'Hasil pengujian Nano-Banana-2 Image API:',
    results
  }, { status: 200 });
}
