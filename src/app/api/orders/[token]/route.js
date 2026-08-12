import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request, { params }) {
  const { token } = params;
  const { data: order, error } = await supabase
    .from('orders')
    .select(`*, order_items (*)`)
    .eq('order_token', token)
    .single();
  if (error) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(request, { params }) {
  const { token } = params;
  const { status } = await request.json();
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('order_token', token);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  // Revalidate admin pages if needed
  // Note: next/cache revalidation not available in API route; could trigger webhook.
  return NextResponse.json({ success: true });
}

export async function POST(request, { params }) {
  // Example: upload payment proof URL
  const { token } = params;
  const { paymentProofUrl } = await request.json();
  const { error } = await supabase
    .from('orders')
    .update({ payment_proof_url: paymentProofUrl, status: 'payment_uploaded' })
    .eq('order_token', token);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
