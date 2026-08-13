import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request, { params }) {
  const { token } = params;
  
  // Fetch order with items
  const { data: order, error } = await supabase
    .from('orders')
    .select(`*, order_items (*)`)
    .eq('order_token', token)
    .single();
  
  if (error || !order) {
    return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
  }

  // Fetch store info (whatsapp, name)
  const { data: store } = await supabase
    .from('stores')
    .select('whatsapp, name')
    .eq('id', order.store_id)
    .single();

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
  const { token } = params;
  const { status } = await request.json();

  const allowedStatuses = ['pending', 'waiting_payment_proof', 'payment_uploaded', 'paid', 'cancelled', 'ready', 'completed'];
  if (!allowedStatuses.includes(status)) {
    return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 });
  }

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('order_token', token);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

export async function POST(request, { params }) {
  const { token } = params;
  const { paymentProofUrl } = await request.json();

  if (!paymentProofUrl) {
    return NextResponse.json({ error: 'URL bukti pembayaran wajib diisi' }, { status: 400 });
  }

  // Attempt update using payment_proof_url column
  let { error } = await supabase
    .from('orders')
    .update({ payment_proof_url: paymentProofUrl, status: 'payment_uploaded' })
    .eq('order_token', token);

  // Fallback: if column doesn't exist in Supabase yet, save to notes
  if (error) {
    console.warn('payment_proof_url column update failed, using notes fallback:', error.message);
    const { data: currentOrder } = await supabase
      .from('orders')
      .select('notes')
      .eq('order_token', token)
      .single();

    const updatedNotes = [currentOrder?.notes, `Bukti Transfer: ${paymentProofUrl}`].filter(Boolean).join(' | ');
    const fallbackRes = await supabase
      .from('orders')
      .update({ notes: updatedNotes, status: 'payment_uploaded' })
      .eq('order_token', token);

    if (fallbackRes.error) return NextResponse.json({ error: fallbackRes.error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
