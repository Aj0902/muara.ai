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

function extractReplyText(input) {
  if (!input) return '';
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        const extracted = extractReplyText(parsed);
        if (extracted) return extracted;
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }
  if (Array.isArray(input)) {
    for (const item of input) {
      const res = extractReplyText(item);
      if (res) return res;
    }
    return '';
  }
  if (typeof input === 'object') {
    if (input.reply && typeof input.reply === 'string') return input.reply;
    if (input.output && typeof input.output === 'string') return input.output;
    if (input.text && typeof input.text === 'string') return input.text;
    if (input.message && typeof input.message === 'string') return input.message;

    if (input.reply) { const res = extractReplyText(input.reply); if (res) return res; }
    if (input.output) { const res = extractReplyText(input.output); if (res) return res; }
    if (input.json) { const res = extractReplyText(input.json); if (res) return res; }
    if (input.data) { const res = extractReplyText(input.data); if (res) return res; }
    if (input.body) { const res = extractReplyText(input.body); if (res) return res; }
    if (input.text) { const res = extractReplyText(input.text); if (res) return res; }
    if (input.message) { const res = extractReplyText(input.message); if (res) return res; }

    for (const val of Object.values(input)) {
      const res = extractReplyText(val);
      if (res) return res;
    }
  }
  return '';
}

// Generate Category Specific Vocabulary & Rules
function getCategoryInstructions(category) {
  if (category === 'fashion') {
    return '1. Kategori = FASHION (toko menjual BUSANA/PAKAIAN/BATIK).\n' +
      '2. DILARANG memakai kata: "menu", "makanan", "minuman", "dapur", "lezat", "rasa", atau "meja".\n' +
      '3. GUNAKAN istilah: "katalog busana", "pakaian/batik", "panduan ukuran (size chart)", "packing", "pengiriman kurir/ekspedisi".';
  } else if (category === 'kriya') {
    return '1. Kategori = KRIYA (toko menjual KERAJINAN TANGAN/FURNITURE ROTAN).\n' +
      '2. DILARANG memakai kata: "menu", "makanan", "minuman", "dapur", "lezat", "rasa", atau "meja makan/resto".\n' +
      '3. GUNAKAN istilah: "katalog kerajinan rotan", "perabotan", "spesifikasi custom / Pre-Order (PO)", "workshop", "quality control/finishing".';
  } else {
    return '1. Kategori = KULINER (toko menjual KULINER/RESTO/CAFE).\n' +
      '2. GUNAKAN istilah: "menu makanan & minuman", "sajian lezat", "racikan dapur", "layanan Makan di Tempat (Meja 1-20)" atau "Take Away".';
  }
}

// Build Perfected System Prompt
function buildPerfectedSystemPrompt({ type, message, store, products, history, cartItems }) {
  const categoryInstructions = getCategoryInstructions(store.category);

  const productListText = (products || []).length > 0
    ? products.map(p => `- ${p.name}: Rp ${Number(p.price).toLocaleString('id-ID')} ${p.description ? `(${p.description})` : ''}`).join('\n')
    : 'Katalog belum diunggah.';

  const historyText = (history || []).slice(-6).map(h => `${h.sender === 'user' ? 'Pelanggan' : 'CS AI'}: ${h.text}`).join('\n');

  return `Anda adalah ${store.chatbot_name || 'Asisten AI'}, asisten AI resmi yang ramah, santun, profesional, tegas, dan solutif untuk toko "${store.name}".

---
### 🚨 BATASAN WEWENANG & ALUR CHECKOUT (ATURAN KETAT DILARANG DILANGGAR):
1. DILARANG meminta pembeli mengetikkan Nama, Nomor WhatsApp, atau Alamat di dalam kolom chat untuk alasan "hold pesanan", "rekam data", atau "memproses transaksi secara manual".
2. Selalu arahkan pembeli untuk mengisi Formulir Pemesanan resmi yang sudah tersedia di bagian bawah drawer **Keranjang Belanja Web** (lalu klik tombol "Lanjutkan Pesanan" untuk menerbitkan QRIS/Invoice), ATAU mengklik tombol **"⚡ Beli Direct"** pada kartu produk.
3. Tugas Anda di Keranjang Belanja adalah: menyapa hangat, membantu rincikan barang belanjaannya, dan melakukan **Cross-Selling Cerdas** (merekomendasikan 1-2 barang pelengkap dari katalog toko). JANGAN mengambil alih fungsi formulir checkout web di dalam obrolan chat!

---
### 🏪 KONTEKS UTAMA TOKO:
- Nama Toko: ${store.name}
- ID Toko: ${store.id}
- Kategori Toko: ${store.category}
- Tagline Toko: ${store.tagline || 'Selamat datang di toko kami'}
- Deskripsi Singkat: ${store.description || ''}
- Cerita Brand: ${store.story || ''}
- Alamat Toko: ${store.address || 'Detail alamat dapat ditanyakan langsung'}
- Jam Operasional: ${store.hours || '09.00 - 21.00 WIB'}
- WhatsApp Resmi: ${store.whatsapp || ''}
- Persona Khusus Bot: ${store.chatbot_persona || 'Asisten Customer Service yang hangat dan sigap'}

---
### 💳 CARA MENJAWAB ALUR CHECKOUT & PEMBAYARAN:
Jika pembeli bertanya cara pesan/checkout/bayar, JAWAB DENGAN TEGAS & SINGKAT mengarahkan ke UI Web:

1. JIKA KATEGORI = "fashion":
   - Arahkan pembeli mengisi **Formulir Pemesanan di Keranjang Web** (masukkan Nama, No. WA, & Alamat Pengiriman Kurir/Ekspedisi 🚚), lalu bayar via QRIS/Invoice. Atau sarankan klik tombol **"⚡ Beli Direct"** untuk WA admin.

2. JIKA KATEGORI = "kriya":
   - Arahkan pembeli mengisi **Formulir Pemesanan di Keranjang Web** (masukkan Nama, No. WA, & Catatan Spesifikasi Custom Pre-Order 🛠️), lalu buat Invoice SPK Workshop. Atau sarankan klik tombol **"⚡ Beli Direct"** untuk konsultasi custom via WA.

3. JIKA KATEGORI = "kuliner":
   - Arahkan pembeli mengisi **Formulir Pemesanan di Keranjang Web** (masukkan Nama, No. WA, & pilih Meja 1-20 / Takeaway 🍽️), lalu bayar via QRIS instan.

---
### 🎴 FITUR KARTU INTERAKTIF UI WEB (MANDAT KHUSUS):
1. **Kartu Rekomendasi Produk Interaktif**:
   - Ketika Anda menyebutkan/merekomendasikan produk dari katalog, sistem Web UI akan OTOMATIS menampilkan Kartu Produk Interaktif di bawah pesan Anda (lengkap dengan tombol **"+ Tambah ke Keranjang"** dan tombol **"⚡ WA Direct"**).
   - Ajak pembeli dengan ramah: *"Klik tombol **+ Tambah** pada kartu produk di bawah ini untuk langsung memasukannya ke keranjang belanja Anda kak!"*
2. **Kartu Lokasi & Kontak Toko Interaktif**:
   - Ketika Anda menjelaskan lokasi, alamat, atau kontak toko, sistem Web UI akan OTOMATIS menampilkan Kartu Informasi Toko (lengkap dengan tombol **"💬 Chat WA Admin"** dan **"🗺️ Google Maps"**).
   - Ajak pembeli dengan ramah: *"Kakak bisa langsung mengklik tombol **💬 Chat WA Admin** atau **🗺️ Google Maps** di kartu bawah ini ya!"*

---
### 🚫 INSTRUKSI PERILAKU KATEGORI (HINDARI SALAH ISTILAH):
${categoryInstructions}

---
### 💡 PANDUAN SPESIFIK TIPE CHAT:
Tipe Chat Saat Ini: "${type || 'cs'}"

1. Jika Tipe Chat = "cart" (Asisten Keranjang Belanja):
   - Isi Keranjang Belanja Saat Ini: ${JSON.stringify(cartItems || [])}
   - TUGAS UTAMA: Sapa pembeli dengan hangat, bantu rincikan barang belanjaannya, dan lakukan **Cross-Selling Cerdas** (merekomendasikan 1-2 produk pelengkap yang cocok dari katalog toko).

2. Jika Tipe Chat = "cs" (Customer Service & Tracking):
   - TUGAS UTAMA: Jawab pertanyaan umum seputar lokasi toko, jam operasional, metode pembayaran, metode checkout, atau lacak status pesanan via nomor invoice.

---
### 📦 DAFTAR KATALOG PRODUK & HARGA RESMI TOKO:
${productListText}

---
### 📜 RIWAYAT OBROLAN TERAKHIR:
${historyText}

---
### 💬 PESAN PELANGGAN TERBARU:
"${message}"

---
### 💬 GAYA BAHASA & FORMAT JAWABAN (WAJIB PERHATIKAN):
1. SELALU jawab dalam Bahasa Indonesia yang ramah, alami, santun, komunikatif, dan solutif.
2. Gunakan sapaan yang menghormati seperti "Kak" atau "Kakak".
3. Gunakan emotikon seperlunya untuk memperhangat suasana (contoh: 👗 Fashion, 🛠️ Kriya, 🍔 Kuliner, 📦 Tracking Invoice).
4. Jawaban singkat, padat, rapi, dan langsung mengarahkan ke Formulir UI Web yang relevan.`;
}

// Native Smart Engine Fallback using Gemini REST API & Intelligent Context-Aware Engine
async function generateNativeGeminiResponse({ type, message, store, products, history, cartItems }) {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY)?.trim();

  const systemPrompt = buildPerfectedSystemPrompt({ type, message, store, products, history, cartItems });

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
    if (store.category === 'fashion') {
      return `🛒 *Cara Pemesanan & Pembayaran (Fashion)*:\n\n1. Pilih pakaian/busana favorit di katalog dan klik **+ Tambah**.\n2. Buka Keranjang Belanja di bawah dan isi Formulir Pemesanan (Nama, No. WA, Alamat Kurir/Ekspedisi 🚚).\n3. Klik **Lanjutkan Pesanan** untuk menerbitkan QRIS/Invoice instan! Atau klik tombol **⚡ Beli Direct** untuk order via WA admin. 😊`;
    } else if (store.category === 'kriya') {
      return `🛠️ *Cara Pemesanan & Custom Order (Kriya)*:\n\n1. Pilih perabotan/kerajinan di katalog dan klik **+ Tambah**.\n2. Buka Keranjang Belanja di bawah dan isi Formulir Pemesanan (Nama, No. WA, Catatan Spesifikasi Custom PO 🛠️).\n3. Klik **Lanjutkan Pesanan** untuk membuat Invoice SPK Workshop! Atau klik tombol **⚡ Beli Direct** untuk konsultasi custom via WA. 😊`;
    }
    return `🍽️ *Cara Pemesanan & Pembayaran (Kuliner)*:\n\n1. Pilih menu makanan/minuman lezat di katalog dan klik **+ Tambah**.\n2. Buka Keranjang Belanja di bawah dan isi Formulir Pemesanan (Nama, No. WA, Pilih Meja 1-20 / Takeaway 🍽️).\n3. Klik **Lanjutkan Pesanan** untuk menerbitkan QRIS pembayaran instan! 😊`;
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
        const categoryInstructions = getCategoryInstructions(store.category);
        const systemPrompt = buildPerfectedSystemPrompt({ type, message, store, products, history, cartItems });

        const payload = {
          type,
          message,
          session_id: sessionId,
          store_id: storeId,
          store_name: store.name,
          store_category: store.category,
          category_instructions: categoryInstructions,
          system_prompt: systemPrompt,
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
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const response = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const resText = await response.text();
          replyText = extractReplyText(resText);
        }
      } catch (err) {
        console.warn('n8n Webhook connection failed or timed out, executing Native Gemini AI Engine:', err.message);
      }
    }

    // 6. Native Fallback Engine if n8n was not configured, failed, or returned empty reply
    if (!replyText) {
      try {
        replyText = await generateNativeGeminiResponse({ type, message, store, products, history, cartItems });
      } catch (gemErr) {
        console.warn('Native Gemini Fallback error:', gemErr.message);
        replyText = `Halo kak! Terima kasih sudah menghubungi ${store.name}. Untuk respon cepat, silakan tanyakan via WhatsApp atau gunakan formulir pemesanan web ya! 💬`;
      }
    }

    if (!replyText) {
      replyText = `Halo kak! Selamat datang di ${store.name}. Ada yang bisa kami bantu seputar produk atau pesanan Kakak? 😊`;
    }

    // 7. Save AI reply to chat logs database
    await supabase.from('chat_logs').insert({
      store_id: storeId,
      session_id: sessionId,
      sender: 'ai',
      text: replyText
    });

    return NextResponse.json({ reply: replyText, products, storeInfo: store });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({
      reply: 'Halo kak! Terjadi kendala teknis sementara pada AI. Silakan tanyakan rekomendasi produk atau hubungi kami via WhatsApp ya! 💬',
      products: [],
      storeInfo: null
    }, { status: 200 });
  }
}
