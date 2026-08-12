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

  // Fetch store info (whatsapp, qris)
  const { data: store } = await supabase
    .from('stores')
    .select('whatsapp, name')
    .eq('id', order.store_id)
    .single();

  order.store_whatsapp = store?.whatsapp || '';
  order.store_name = store?.name || '';

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

  const { error } = await supabase
    .from('orders')
    .update({ payment_proof_url: paymentProofUrl, status: 'payment_uploaded' })
    .eq('order_token', token);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
