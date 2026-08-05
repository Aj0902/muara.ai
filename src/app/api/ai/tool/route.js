import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const storeId = searchParams.get('store_id');
    const invoice = searchParams.get('invoice');

    if (!storeId) {
      return NextResponse.json({ error: 'store_id parameter is required' }, { status: 400 });
    }

    // 1. Tool Action: Get Store Products Catalog
    if (action === 'get_products') {
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, price, description, status')
        .eq('store_id', storeId);

      if (error) throw error;
      return NextResponse.json({
        success: true,
        count: products?.length || 0,
        products: products || []
      });
    }

    // 2. Tool Action: Track Order Status
    if (action === 'track_order') {
      if (!invoice) {
        return NextResponse.json({ error: 'invoice parameter is required for tracking' }, { status: 400 });
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          id,
          invoice_number,
          customer_name,
          customer_phone,
          customer_address,
          total_amount,
          status,
          notes,
          created_at,
          order_items (
            product_name,
            price,
            quantity
          )
        `)
        .eq('store_id', storeId)
        .ilike('invoice_number', `%${invoice.trim()}%`)
        .single();

      if (orderError || !order) {
        return NextResponse.json({
          found: false,
          message: `Pesanan dengan invoice "${invoice}" tidak ditemukan di database toko ini.`
        });
      }

      return NextResponse.json({
        found: true,
        invoice: order.invoice_number,
        customer: order.customer_name,
        service: order.customer_address,
        status: order.status,
        statusLabel:
          order.status === 'pending'
            ? 'Menunggu Bayar ⏳'
            : order.status === 'paid'
            ? 'Memasak/Diproses 🍳'
            : order.status === 'ready'
            ? 'Siap Disajikan / Sedang Makan 🍽️'
            : order.status === 'completed'
            ? 'Selesai 🏁'
            : 'Dibatalkan ❌',
        totalAmount: order.total_amount,
        items: order.order_items || [],
        orderDate: order.created_at
      });
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
  } catch (err) {
    console.error('AI Tool API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
