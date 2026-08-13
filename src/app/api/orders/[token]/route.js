import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

async function sendWhatsAppMessage(to, message) {
  const rawUrl = process.env.WAHA_API_URL;
  const apiKey = (process.env.WAHA_API_KEY || process.env.WHATSAPP_API_KEY || process.env.WAHA_KEY)?.trim();
  const session = 'muara';

  if (!rawUrl || !to || !message) return { success: false, error: 'Missing parameters' };

  const baseUrl = rawUrl.trim().replace(/\/+$/, '');
  const baseEndpoint = baseUrl.endsWith('/api/sendText') ? baseUrl : `${baseUrl}/api/sendText`;

  const targetUrl = new URL(baseEndpoint);
  if (apiKey) targetUrl.searchParams.set('x-api-key', apiKey);
  targetUrl.searchParams.set('session', session);

  const cleanPhone = normalizePhone(to);
  const chatId = `${cleanPhone}@c.us`;

  const payload = {
    session,
    chatId,
    text: message
  };

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) {
    headers['X-Api-Key'] = apiKey;
  }

  try {
    const res = await fetch(targetUrl.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    const resText = await res.text();
    let data;
    try { data = JSON.parse(resText); } catch { data = resText; }
    console.log('WAHA Notification sent to store:', chatId, res.status, data);
    return { success: res.ok, data };
  } catch (e) {
    console.error('WAHA Notification error:', e);
    return { success: false, error: e.message };
  }
}

export async function GET(request, { params }) {
  const { token } = await params;
  if (!token) {
    return NextResponse.json({ error: 'Token pesanan tidak valid' }, { status: 400 });
  }
  
  // Fetch order with items by order_token (UUID) or fallback id / invoice_number
  let { data: order } = await supabase
    .from('orders')
    .select(`*, order_items (*)`)
    .eq('order_token', token)
    .maybeSingle();

  if (!order) {
    if (!isNaN(token)) {
      const resById = await supabase
        .from('orders')
        .select(`*, order_items (*)`)
        .eq('id', Number(token))
        .maybeSingle();
      if (resById.data) order = resById.data;
    } else {
      const resByInvoice = await supabase
        .from('orders')
        .select(`*, order_items (*)`)
        .eq('invoice_number', token)
        .maybeSingle();
      if (resByInvoice.data) order = resByInvoice.data;
    }
  }

  if (!order) {
    return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
  }

  // Fetch store info (whatsapp, name) separately
  const { data: store } = await supabase
    .from('stores')
    .select('whatsapp, name')
    .eq('id', order.store_id)
    .maybeSingle();

  order.store_whatsapp = store?.whatsapp || '';
  order.store_name = store?.name || '';

  // Fallback extraction of proof URL from notes if column is missing/null
  if (!order.payment_proof_url && order.notes && order.notes.includes('Bukti Transfer: ')) {
    const match = order.notes.match(/Bukti Transfer: (https?:\/\/[^\s|]+)/);
    if (match) {
      order.payment_proof_url = match[1];
    }
  }

  return NextResponse.json({ order });
}

export async function PATCH(request, { params }) {
  const { token } = await params;
  const { status } = await request.json();

  const allowedStatuses = ['pending', 'waiting_payment_proof', 'payment_uploaded', 'paid', 'cancelled', 'ready', 'completed'];
  if (!allowedStatuses.includes(status)) {
    return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 });
  }

  let { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('order_token', token);

  if (error) {
    // Try updating by id or invoice_number
    if (!isNaN(token)) {
      const resById = await supabase.from('orders').update({ status }).eq('id', Number(token));
      error = resById.error;
    } else {
      const resByInvoice = await supabase.from('orders').update({ status }).eq('invoice_number', token);
      error = resByInvoice.error;
    }
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

export async function POST(request, { params }) {
  const { token } = await params;
  const { paymentProofUrl } = await request.json();

  if (!paymentProofUrl) {
    return NextResponse.json({ error: 'URL bukti pembayaran wajib diisi' }, { status: 400 });
  }

  // 1. Fetch order by order_token (UUID), id, or invoice_number
  let { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('order_token', token)
    .maybeSingle();

  if (!order && !isNaN(token)) {
    const resById = await supabase.from('orders').select('*').eq('id', Number(token)).maybeSingle();
    if (resById.data) order = resById.data;
  }
  if (!order) {
    const resByInvoice = await supabase.from('orders').select('*').eq('invoice_number', token).maybeSingle();
    if (resByInvoice.data) order = resByInvoice.data;
  }

  if (!order) {
    return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
  }

  const updatedNotes = [order.notes, `Bukti Transfer: ${paymentProofUrl}`].filter(Boolean).join(' | ');

  // 2. Update payment_proof_url and status to payment_uploaded
  let { error: updateErr } = await supabase
    .from('orders')
    .update({
      payment_proof_url: paymentProofUrl,
      notes: updatedNotes,
      status: 'payment_uploaded'
    })
    .eq('id', order.id);

  if (updateErr) {
    console.warn('payment_proof_url column update failed, using notes fallback:', updateErr.message);
    const fallbackRes = await supabase
      .from('orders')
      .update({ notes: updatedNotes, status: 'payment_uploaded' })
      .eq('id', order.id);

    if (fallbackRes.error) return NextResponse.json({ error: fallbackRes.error.message }, { status: 400 });
  }

  // 3. Trigger WhatsApp notification to store owner ONLY
  const { data: store } = await supabase
    .from('stores')
    .select('whatsapp')
    .eq('id', order.store_id)
    .maybeSingle();

  const storeWa = store?.whatsapp;
  const baseUrl = 'https://muara-ai.vercel.app';
  const orderToken = order.order_token || order.id;

  // Send WA to store owner
  if (storeWa) {
    const storeMsg = `📎 *BUKTI TRANSFER DITERIMA!*\n\n` +
      `Pelanggan *${order.customer_name}* telah mengunggah bukti pembayaran untuk pesanan *#${order.invoice_number}* (Total: Rp ${Number(order.total_amount).toLocaleString('id-ID')}).\n\n` +
      `Silakan verifikasi & konfirmasi pembayaran di:\n` +
      `🔗 ${baseUrl}/pesanan/kelola/${orderToken}`;

    await sendWhatsAppMessage(storeWa, storeMsg);
  }

  return NextResponse.json({ success: true, orderToken: order.order_token });
}
