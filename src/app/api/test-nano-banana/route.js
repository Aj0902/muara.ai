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

  // 2. Poll Task Details via the exact confirmed endpoint: recordInfo?taskId=
  const pollingEndpoint = `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`;
  let finalResult = null;
  let imageUrl = null;
  let attempts = 0;

  // Poll up to 5 times (10 seconds total)
  for (let i = 0; i < 5; i++) {
    attempts++;
    await new Promise((r) => setTimeout(r, 2000));
    try {
      const pollRes = await fetch(pollingEndpoint, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });

      if (pollRes.ok) {
        finalResult = await pollRes.json();
        const taskData = finalResult.data || {};
        const state = taskData.state;

        let parsedResultJson = null;
        if (taskData.resultJson) {
          try {
            parsedResultJson = JSON.parse(taskData.resultJson);
          } catch {
            parsedResultJson = taskData.resultJson;
          }
        }

        imageUrl = taskData.resultUrl || parsedResultJson?.resultUrl || parsedResultJson?.url || taskData.imageUrl;

        if (state === 'success' || state === 'completed' || imageUrl) {
          break;
        }
      }
    } catch (err) {
      console.warn('Polling Exception:', err.message);
    }
  }

  return NextResponse.json({
    status: 'SUCCESS',
    message: imageUrl ? '✅ Render Gambar Nano-Banana-2 Selesai!' : '⏳ Task Dibuat & Sedang Di-render oleh KIE GPU...',
    taskId,
    pollingEndpoint,
    attempts,
    taskState: finalResult?.data?.state || 'waiting',
    imageUrl: imageUrl || 'Gambar masih di-render oleh KIE GPU. Silakan refresh halaman dalam beberapa detik.',
    creditsConsumed: finalResult?.data?.creditsConsumed || 8,
    finalResult
  }, { status: 200 });
}
