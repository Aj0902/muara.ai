import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

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

// Native Smart Engine Fallback using Gemini REST API & Intelligent Context-Aware Engine
async function generateNativeGeminiResponse({ message, store, products, history }) {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY)?.trim();

  // Category specific instructions & vocabulary
  const categoryInstructions =
    store.category === 'fashion'
      ? 'Toko ini adalah RITEL FASHION / BATIK. Gunakan istilah "katalog busana", "pakaian/batik", "size chart", "packing", "pengiriman kurir/ekspedisi". JANGAN PERNAH menyebutkan "menu makanan", "meja", "dapur", atau "resep".'
      : store.category === 'kriya'
      ? 'Toko ini adalah KERAJINAN KRIYA / FURNITURE ROTAN. Gunakan istilah "katalog kerajinan rotan", "perabotan", "custom order/PO", "workshop", "finishing". JANGAN PERNAH menyebutkan "menu makanan", "meja makan", "dapur", atau "resep".'
      : 'Toko ini adalah KULINER / RESTO / CAFE. Gunakan istilah "menu makanan", "sajian lezat", "dapur", "meja dine-in", "takeaway".';

  const productListText = (products || []).length > 0
    ? products.map(p => `- ${p.name}: Rp ${Number(p.price).toLocaleString('id-ID')} ${p.description ? `(${p.description})` : ''}`).join('\n')
    : 'Katalog belum diunggah.';

  const historyText = (history || []).slice(-6).map(h => `${h.sender === 'user' ? 'Pelanggan' : 'CS AI'}: ${h.text}`).join('\n');

  const systemPrompt = `Anda adalah ${store.chatbot_name || 'Asisten AI CS Resmi'} untuk toko "${store.name}".
Persona & Gaya Komunikasi: ${store.chatbot_persona || 'Ramah, sopan, profesional, membantu, dan cerdas.'}

Aturan Khusus Kategori Toko:
${categoryInstructions}

Informasi Toko:
- Nama Toko: ${store.name}
- Tagline: ${store.tagline || '-'}
- Alamat / Lokasi: ${store.address || 'Menghubungi admin via WA'}
- Jam Operasional: ${store.hours || 'Setiap Hari'}
- No. WhatsApp: ${store.whatsapp || '-'}
- Instagram: ${store.instagram ? `@${store.instagram}` : '-'}

Daftar Katalog Produk & Harga Terkini:
${productListText}

Riwayat Obrolan Terakhir:
${historyText}

Pesan Pelanggan Terbaru: "${message}"

Tugas Anda:
Berdasarkan informasi toko dan katalog produk di atas, jawablah pesan pelanggan dengan sangat ramah, ringkas, informatif, dan membantu.
Gunakan emoticon yang sesuai. Jika pelanggan menanyakan produk, sebutkan nama produk dan harganya secara jelas. Jika menanyakan cara beli/checkout, jelaskan dengan lembut untuk menambah item ke keranjang dan menekan tombol checkout. JANGAN mengarang informasi di luar daftar produk di atas.`;

  // 1. Attempt Google Gemini REST API if API Key is available
  if (apiKey) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }]
        })
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText) return responseText.trim();
      }
    } catch (e) {
      console.warn('Gemini REST API fetch error, falling back to smart rule engine:', e.message);
    }
  }

  // 2. Native Smart Rule-Based Engine (Guaranteed 100% zero-error fallback)
  const lowerMsg = message.toLowerCase();

  // Greeting Intent
  if (lowerMsg.includes('halo') || lowerMsg.includes('hai') || lowerMsg.includes('pagi') || lowerMsg.includes('siang') || lowerMsg.includes('malam') || lowerMsg.includes('permisi')) {
    return `Halo kak! 👋 Selamat datang di *${store.name}*. Ada yang bisa ${store.chatbot_name || 'saya'} bantu hari ini? Silakan tanyakan seputar katalog produk, harga, atau lokasi toko kami! 😊`;
  }

  // Catalog / Menu Intent
  if (lowerMsg.includes('menu') || lowerMsg.includes('katalog') || lowerMsg.includes('produk') || lowerMsg.includes('jual') || lowerMsg.includes('ada apa')) {
    if ((products || []).length > 0) {
      const itemsFormatted = products.map(p => `• *${p.name}* - Rp ${Number(p.price).toLocaleString('id-ID')}`).join('\n');
      return `Berikut adalah pilihan produk menarik di *${store.name}*:\n\n${itemsFormatted}\n\nSilakan masukkan produk favorit Anda ke keranjang untuk melakukan pemesanan! 🛒✨`;
    }
    return `Saat ini katalog produk *${store.name}* sedang diperbarui. Silakan tanyakan langsung ke admin kami! 😊`;
  }

  // Price Intent
  if (lowerMsg.includes('harga') || lowerMsg.includes('berapa') || lowerMsg.includes('biaya')) {
    const matchedProducts = (products || []).filter(p => lowerMsg.includes(p.name.toLowerCase()));
    if (matchedProducts.length > 0) {
      const pricesText = matchedProducts.map(p => `• *${p.name}*: Rp ${Number(p.price).toLocaleString('id-ID')}`).join('\n');
      return `Berikut detail harga produk yang kakak tanyakan:\n\n${pricesText}\n\nAda yang ingin dipesan kak? 😊`;
    }
    return `Untuk melihat daftar harga produk, kakak dapat melihatnya langsung di katalog kami atau sebutkan nama produk spesifik yang ingin ditanyakan ya! 🏷️`;
  }

  // Location / Address Intent
  if (lowerMsg.includes('lokasi') || lowerMsg.includes('alamat') || lowerMsg.includes('buka') || lowerMsg.includes('jam') || lowerMsg.includes('toko di mana')) {
    return `📍 *Lokasi & Jam Operasional ${store.name}*:\n\n• *Alamat:* ${store.address || 'Silakan hubungi kami via WhatsApp'}\n• *Jam Buka:* ${store.hours || 'Setiap Hari'}\n\nKami tunggu kedatangannya ya kak! 🏪✨`;
  }

  // Contact / WhatsApp Intent
  if (lowerMsg.includes('wa') || lowerMsg.includes('whatsapp') || lowerMsg.includes('kontak') || lowerMsg.includes('admin') || lowerMsg.includes('hubungi')) {
    return `📞 Kakak bisa menghubungi admin *${store.name}* secara langsung via WhatsApp di nomor: *${store.whatsapp || '-'}*. Kami siap membantu! 🙏`;
  }

  // Payment / Checkout Intent
  if (lowerMsg.includes('bayar') || lowerMsg.includes('pesan') || lowerMsg.includes('order') || lowerMsg.includes('checkout') || lowerMsg.includes('transfer')) {
    return `🛒 *Cara Pemesanan & Pembayaran*:\n\n1. Pilih produk yang disukai di katalog dan klik **+ Tambah**.\n2. Buka keranjang belanja di bawah.\n3. Isi nama, no. WA, dan metode layanan.\n4. Klik **Checkout** untuk mendapatkan rincian tagihan & QRIS / Rekening pembayaran!\n\nPraktis dan cepat kak! 😊`;
  }

  // Generic Intelligent Fallback
  return `Terima kasih sudah menghubungi *${store.name}*! 🙏\n\nUntuk pertanyaan seputar produk, harga, atau layanan pesanan custom, kakak juga dapat menghubungi kami langsung via WhatsApp *${store.whatsapp || '-'}*. Ada produk spesifik yang ingin kakak tanyakan? 😊`;
}

export async function POST(req) {
  try {
    const { type, message, sessionId, storeId, cartItems } = await req.json();

    if (!message || !sessionId || !storeId) {
      return NextResponse.json({ error: 'Message, sessionId, and storeId are required!' }, { status: 400 });
    }

    // 1. Fetch store info
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single();

    if (storeError || !store) {
      return NextResponse.json({ error: 'Store not found!' }, { status: 404 });
    }

    // 2. Fetch catalog products
    const { data: products } = await supabase
      .from('products')
      .select('name, price, description, status')
      .eq('store_id', storeId);

    // 3. Fetch chat history (last 10 messages)
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

    // 4. Save user message to database
    await supabase.from('chat_logs').insert({
      store_id: storeId,
      session_id: sessionId,
      sender: 'user',
      text: message
    });

    let replyText = '';
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    // 5. Attempt n8n Webhook call first if URL is configured
    if (n8nWebhookUrl) {
      try {
        const categoryInstructions =
          store.category === 'fashion'
            ? 'Toko ini adalah RITEL FASHION / BATIK. Gunakan istilah "katalog busana", "pakaian/batik", "size chart", "packing", "pengiriman kurir/ekspedisi". JANGAN PERNAH menyebutkan "menu makanan", "meja", "dapur", atau "resep".'
            : store.category === 'kriya'
            ? 'Toko ini adalah KERAJINAN KRIYA / FURNITURE ROTAN. Gunakan istilah "katalog kerajinan rotan", "perabotan", "custom order/PO", "workshop", "finishing". JANGAN PERNAH menyebutkan "menu makanan", "meja makan", "dapur", atau "resep".'
            : 'Toko ini adalah KULINER / RESTO / CAFE. Gunakan istilah "menu makanan", "sajian lezat", "dapur", "meja dine-in", "takeaway".';

        const payload = {
          type,
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

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data && typeof data === 'object') {
            replyText = data.reply || data.text || (typeof data === 'string' ? data : '');
          } else if (typeof data === 'string') {
            replyText = data;
          }
        }
      } catch (err) {
        console.warn('n8n Webhook connection failed or timed out, executing Native Gemini AI Engine:', err.message);
      }
    }

    // 6. Native Fallback Engine if n8n was not configured, failed, or returned empty reply
    if (!replyText) {
      replyText = await generateNativeGeminiResponse({ message, store, products, history });
    }

    // 7. Save AI reply to chat logs database
    await supabase.from('chat_logs').insert({
      store_id: storeId,
      session_id: sessionId,
      sender: 'ai',
      text: replyText
    });

    return NextResponse.json({ reply: replyText });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
