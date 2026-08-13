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

  // 1. Create Task
  let createTaskRes;
  let taskId = null;

  try {
    const res = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'nano-banana-2',
        input: {
          prompt: 'A stunning modern storefront banner for an artisan shop, 4k resolution, professional photography',
          resolution: '1K',
          aspect_ratio: '16:9',
          output_format: 'png'
        }
      })
    });

    createTaskRes = await res.json();
    taskId = createTaskRes.data?.taskId || createTaskRes.data?.recordId;
  } catch (err) {
    return NextResponse.json({
      status: 'ERROR',
      message: 'Gagal membuat createTask Nano-Banana-2',
      error: err.message
    }, { status: 200 });
  }

  if (!taskId) {
    return NextResponse.json({
      status: 'ERROR',
      message: 'Task ID tidak dikembalikan oleh KIE.ai server',
      createTaskRes
    }, { status: 200 });
  }

  // 2. Poll Task Details via multiple candidate endpoints
  const pollCandidates = [
    `https://api.kie.ai/api/v1/jobs/recordInfo?recordId=${taskId}`,
    `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`,
    `https://api.kie.ai/api/v1/jobs/recordDetail?taskId=${taskId}`,
    `https://api.kie.ai/api/v1/jobs/recordDetail?recordId=${taskId}`
  ];

  const pollResults = [];
  let foundImageUrl = null;
  let workingPollEndpoint = null;

  for (const url of pollCandidates) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      const data = await res.json();
      
      const imgUrl = data.data?.resultUrl || data.data?.response?.resultUrl || data.data?.url || data.data?.imageUrl || data.resultUrl;
      
      pollResults.push({
        url,
        httpStatus: res.status,
        success: res.ok,
        hasImageUrl: !!imgUrl,
        data
      });

      if (imgUrl && !foundImageUrl) {
        foundImageUrl = imgUrl;
        workingPollEndpoint = url;
      }
    } catch (err) {
      pollResults.push({
        url,
        success: false,
        error: err.message
      });
    }
  }

  return NextResponse.json({
    status: 'SUCCESS',
    message: '✅ Task Creation & Diagnostic Polling Selesai!',
    taskId,
    workingPollEndpoint: workingPollEndpoint || 'Belum selesai merender / Cek hasil pollResults',
    foundImageUrl: foundImageUrl || 'Sedang diproses oleh KIE.ai GPU server...',
    createTaskRes,
    pollResults
  }, { status: 200 });
}
