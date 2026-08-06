import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { type, message, sessionId, storeId, cartItems } = await req.json();

    if (!message || !sessionId || !storeId) {
      return NextResponse.json({ error: 'Message, sessionId, and storeId are required!' }, { status: 400 });
    }

    // 1. Fetch store info (profile & AI settings)
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single();

    if (storeError || !store) {
      return NextResponse.json({ error: 'Store not found!' }, { status: 404 });
    }

    // 2. Fetch catalog products list (so the AI knows the menu)
    const { data: products } = await supabase
      .from('products')
      .select('name, price, description, status')
      .eq('store_id', storeId);

    // 3. Fetch chat history (last 10 messages for this session)
    const { data: historyLogs } = await supabase
      .from('chat_logs')
      .select('sender, text')
      .eq('store_id', storeId)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(10);

    const history = (historyLogs || []).map(log => ({
      sender: log.sender,
      text: log.text
    }));

    // 4. Save the user's new message to the chat logs database
    await supabase.from('chat_logs').insert({
      store_id: storeId,
      session_id: sessionId,
      sender: 'user',
      text: message
    });

    // 5. Send payload to n8n Webhook
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    let replyText = '';

    if (!n8nWebhookUrl) {
      // Local fallback warning if n8n is not running/configured yet
      replyText = `⚠️ **[System Warning]**: Env var \`N8N_WEBHOOK_URL\` belum dikonfigurasi di file \`.env.local\`. Silakan konfigurasikan webhook n8n Anda.\n\n*Pesan Anda:* "${message}"`;
    } else {
      try {
        const categoryInstructions =
          store.category === 'fashion'
            ? 'Toko ini adalah RITEL FASHION / BATIK. JANGAN PERNAH menyebutkan "menu makanan", "meja", "dapur", atau "resep". Gunakan istilah "katalog busana", "pakaian/batik", "size chart", "packing", "pengiriman kurir/ekspedisi".'
            : store.category === 'kriya'
            ? 'Toko ini adalah KERAJINAN KRIYA / FURNITURE ROTAN. JANGAN PERNAH menyebutkan "menu makanan", "meja makan", "dapur", atau "resep". Gunakan istilah "katalog kerajinan rotan", "perabotan", "custom order/PO", "workshop", "finishing".'
            : 'Toko ini adalah KULINER / RESTO / CAFE. Gunakan istilah "menu makanan", "sajian lezat", "dapur", "meja dine-in", "takeaway".';

        const payload = {
          type, // "cart" atau "cs"
          message,
          session_id: sessionId,
          store_id: storeId,
          store_name: store.name,
          store_category: store.category,
          category_instructions: categoryInstructions,
          store_info: {
            tagline: store.tagline,
            description: store.description,
            story: store.story,
            address: store.address,
            hours: store.hours,
            whatsapp: store.whatsapp,
            instagram: store.instagram,
            tiktok: store.tiktok,
            facebook: store.facebook,
            gofood: store.gofood,
            grabfood: store.grabfood,
            shopeefood: store.shopeefood
          },
          chatbot_name: store.chatbot_name || 'Asisten AI',
          chatbot_persona: store.chatbot_persona || '',
          cart_items: cartItems || [],
          products: products || [],
          history
        };

        const response = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`n8n webhook returned status ${response.status}`);
        }

        const data = await response.json();
        
        // Parse n8n response dynamically (could be raw text, or { reply: "..." }, or { text: "..." })
        if (data && typeof data === 'object') {
          replyText = data.reply || data.text || JSON.stringify(data);
        } else if (typeof data === 'string') {
          replyText = data;
        } else {
          replyText = 'Maaf, saya tidak menerima respons yang valid dari server AI.';
        }
      } catch (err) {
        console.error('Error contacting n8n webhook:', err);
        replyText = `Maaf kak, saat ini saya sedang mengalami gangguan koneksi ke server AI CS. Silakan coba beberapa saat lagi atau hubungi kami via WhatsApp.`;
      }
    }

    // 6. Save AI reply to the database chat logs
    await supabase.from('chat_logs').insert({
      store_id: storeId,
      session_id: sessionId,
      sender: 'ai',
      text: replyText
    });

    return NextResponse.json({ reply: replyText });
  } catch (err) {
    console.error('Chat API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
