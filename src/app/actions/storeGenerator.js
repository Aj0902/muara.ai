'use server';

import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Preset Fallback Starter Pack (Guarantees 100% Zero Blank Slate Registration)
function getCategoryPresetFallback(storeName, category, description) {
  const cat = (category || 'kuliner').toLowerCase();

  if (cat === 'fashion') {
    return {
      profile: {
        tagline: `Koleksi Busana & Batik Elegan dari ${storeName}`,
        story: `${storeName} hadir untuk menghadirkan busana berkualitas tinggi yang memadukan keindahan sentuhan budaya dan tren modern. Setiap helai pakaian dirancang dengan dedikasi tinggi untuk memberikan kenyamanan dan kepercayaan diri bagi Anda.`,
        description: description || `Pusat busana dan batik eksklusif ${storeName}. Sedia beragam pakaian pria & wanita berkualitas tinggi.`,
        address: 'Jl. Boulevard Raya No. 88, Blok F4, Jakarta Selatan',
        hours: 'Senin - Sabtu: 09.00 - 21.00 WIB',
        instagram: `@${slugify(storeName)}_official`,
        chatbot_name: `Asisten Busana ${storeName}`,
        chatbot_persona: 'Asisten Customer Service yang ramah, paham panduan ukuran (size chart), dan siap merekomendasikan busana terbaik.',
        banner_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80'
      },
      products: [
        {
          name: `Kemeja Batik Elegan ${storeName}`,
          price: 245000,
          description: 'Kemeja batik pria katun primisima premium. Adem dan jahitan rapi. Ukuran: S, M, L, XL | Warna: Navy, Black',
          image_url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80',
          status: 'tersedia'
        },
        {
          name: `Dress Motif Modern ${storeName}`,
          price: 320000,
          description: 'Gaun wanita modern elegan cocok untuk acara santai maupun pesta. Ukuran: S, M, L | Warna: Maroon, Cream',
          image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
          status: 'tersedia'
        },
        {
          name: `Outer Premium Casual ${storeName}`,
          price: 275000,
          description: 'Outer serbaguna dengan bahan nyaman untuk padupadan OOTD harian Anda. Ukuran: All Size | Warna: Mocca',
          image_url: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&q=80',
          status: 'tersedia'
        }
      ],
      journals: [
        {
          title: `Kisah Di Balik Peluncuran ${storeName}`,
          content: `${storeName} didirikan dengan impian memberikan pengalaman berbusana yang memikat dan penuh gaya. Kami terus berinovasi menghasilkan karya terbaik bagi para pelanggan kami.`,
          image_url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&q=80'
        },
        {
          title: 'Tips Merawat Busana Agar Warna Awet',
          content: 'Cuci pakaian dengan deterjen lembut, hindari memeras terlalu kuat, dan jemur di tempat teduh agar warna kain tetap cemerlang.',
          image_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80'
        },
        {
          title: 'Inspirasi OOTD Elegan Untuk Acara Formal',
          content: 'Padukan outer bermotif dengan celana bahan netral untuk memberikan kesan profesional sekaligus modis.',
          image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80'
        }
      ],
      gallery: [
        {
          caption: 'Proses Quality Control Pakaian',
          image_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80',
          display_order: 1
        },
        {
          caption: 'Sudut Galeri Studio Kami',
          image_url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80',
          display_order: 2
        },
        {
          caption: 'Koleksi Busana Terbaru',
          image_url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80',
          display_order: 3
        }
      ]
    };
  } else if (cat === 'kriya') {
    return {
      profile: {
        tagline: `Karya Kerajinan Tangan & Rotan Seni dari ${storeName}`,
        story: `${storeName} berdedikasi melestarikan seni kriya dan furnitur rotan buatan tangan seniman lokal. Setiap produk menggabungkan nilai estetika alami dengan daya tahan terbaik untuk mempercantik ruangan Anda.`,
        description: description || `Pusat seni kerajinan tangan & furnitur rotan buatan seniman profesional di ${storeName}.`,
        address: 'Jl. Craftsmen Craft No. 12, Workshop Sentra Industri, Cirebon',
        hours: 'Senin - Sabtu: 08.30 - 18.00 WIB',
        instagram: `@${slugify(storeName)}_craft`,
        chatbot_name: `Asisten Workshop ${storeName}`,
        chatbot_persona: 'Asisten Customer Service yang mahir spesifikasi custom PO, finishing kayu/rotan, dan pengiriman aman.',
        banner_url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1200&q=80'
      },
      products: [
        {
          name: `Kursi Rotan Estetik ${storeName}`,
          price: 480000,
          description: 'Kursi bersantai rotan sintetis kokoh dan alami. Cocok untuk sudut teras atau ruang tamu. Ukuran: 60x65x75cm',
          image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
          status: 'tersedia'
        },
        {
          name: `Keranjang Anyaman Dekoratif ${storeName}`,
          price: 135000,
          description: 'Keranjang serbaguna dari bahan serat alami untuk wadah tanaman atau tempat penyimpanan. Diameter: 30cm',
          image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80',
          status: 'tersedia'
        },
        {
          name: `Hiasan Dinding Kayu Ukir ${storeName}`,
          price: 220000,
          description: 'Ornamen dinding ukiran artistik kayu jati asli dengan finishing natural smooth.',
          image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80',
          status: 'tersedia'
        }
      ],
      journals: [
        {
          title: `Seni Menganyam Rotan di ${storeName}`,
          content: 'Menganyam rotan adalah perpaduan ketelitian jemari dan jiwa seni. Setiap pola anyaman menceritakan dedikasi para perajin kami.',
          image_url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&q=80'
        },
        {
          title: 'Merawat Furnitur Rotan Agar Tetap Mengilap',
          content: 'Bersihkan debu dengan sikat halus secara berkala dan lap dengan kain setengah lembap untuk menjaga kelembapan alami rotan.',
          image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'
        },
        {
          title: 'Menata Ruangan Bertema Alami & Minimalis',
          content: 'Sentuhan elemen kayu dan rotan memberikan kehangatan alami yang menenangkan di tengah suasana hunian modern.',
          image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80'
        }
      ],
      gallery: [
        {
          caption: 'Proses Finishing Anyaman Rotan',
          image_url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&q=80',
          display_order: 1
        },
        {
          caption: 'Sudut Workshop Kerajinan',
          image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
          display_order: 2
        },
        {
          caption: 'Hasil Karya Kriya Terpilih',
          image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80',
          display_order: 3
        }
      ]
    };
  } else {
    // Kuliner
    return {
      profile: {
        tagline: `Cita Rasa Kuliner Dapur Spesial dari ${storeName}`,
        story: `${storeName} menyajikan racikan hidangan lezat yang disiapkan dari bahan-bahan segar berkualitas dan resep rahasia keluarga. Kami menghadirkan kenikmatan bersantap istimewa untuk setiap momen istimewa Anda.`,
        description: description || `Destinasi kuliner lezat & segar ${storeName}. Menyediakan hidangan istimewa makan di tempat & takeaway.`,
        address: 'Jl. Culinary Food Market No. 99, Bandung',
        hours: 'Setiap Hari: 10.00 - 22.00 WIB',
        instagram: `@${slugify(storeName)}_kuliner`,
        chatbot_name: `Asisten Dapur ${storeName}`,
        chatbot_persona: 'Asisten Customer Service yang ramah, paham menu lezat, dan sigap membantu pemesanan tempat/takeaway.',
        banner_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80'
      },
      products: [
        {
          name: `Menu Spesial Utama ${storeName}`,
          price: 45000,
          description: 'Sajian hidangan khas racikan chef dengan bumbu rempah segar dan aroma menggiurkan.',
          image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
          status: 'tersedia'
        },
        {
          name: `Camilan Renyah Favorit ${storeName}`,
          price: 25000,
          description: 'Snack goreng renyah bumbu gurih garing cocok menemani santai bersama teman.',
          image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
          status: 'tersedia'
        },
        {
          name: `Minuman Segar Dingin ${storeName}`,
          price: 18000,
          description: 'Minuman dingin penyegar dahaga dengan perpaduan rasa buah manis dan es segar.',
          image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&q=80',
          status: 'tersedia'
        }
      ],
      journals: [
        {
          title: `Rahasia Kelezatan Dapur ${storeName}`,
          content: 'Kami meyakini masakan yang lezat lahir dari ketulusan meracik bumbu rempah pilihan dan bahan makanan yang segar.',
          image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80'
        },
        {
          title: 'Suasana Nyaman Bersantap Bersama Keluarga',
          content: 'Nikmati suasana bersantap yang hangat dan pelayanan terbaik dari seluruh tim kuliner kami.',
          image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80'
        },
        {
          title: 'Sensasi Minuman Segar Penutup Santap Siang',
          content: 'Segarkan harimu dengan pilihan varian racikan minuman spesial dingin dari resto kami.',
          image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80'
        }
      ],
      gallery: [
        {
          caption: 'Suasana Resto & Dapur',
          image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
          display_order: 1
        },
        {
          caption: 'Penyajian Makanan Segar',
          image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
          display_order: 2
        },
        {
          caption: 'Racikan Bumbu Rempah',
          image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
          display_order: 3
        }
      ]
    };
  }
}

// Call KIE.ai OpenAI-Compatible & Gemini API Endpoints
async function generateStoreContentWithKIE(storeName, category, description) {
  const apiKey = (process.env.KIE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)?.trim();
  const rawModel = process.env.KIE_MODEL_NAME;
  const modelName = (!rawModel || rawModel === 'KIE_MODEL_NAME') ? 'gemini-3-5-flash' : rawModel.trim();
  const rawBaseUrl = process.env.KIE_API_BASE_URL;
  const userBaseUrl = (!rawBaseUrl || rawBaseUrl.includes('KIE_API_BASE_URL')) ? 'https://api.kie.ai/v1' : rawBaseUrl.trim();

  if (!apiKey || apiKey === 'your_kie_api_key_here') {
    console.warn('KIE_API_KEY is not configured, fallback to category preset.');
    return getCategoryPresetFallback(storeName, category, description);
  }

  const prompt = `Anda adalah AI Instant Store Creator profesional. Tugas Anda adalah meng-generate 100% data toko baru secara lengkap, kontekstual, menarik, dan ramah pembeli dalam format RAW JSON MURNI tanpa bungkus markdown.

Input Toko:
- Nama Toko: "${storeName}"
- Kategori Toko: "${category}" (fashion | kriya | kuliner)
- Deskripsi Singkat Bisnis: "${description}"

Panduan Output JSON Wajib:
{
  "profile": {
    "tagline": "Tagline kreatif menarik",
    "story": "Cerita brand emosional inspiratif (2-3 paragraf)",
    "description": "Deskripsi toko SEO friendly",
    "address": "Alamat fisik realistis di kota besar Indonesia",
    "hours": "Jam operasional toko (contoh: Senin - Sabtu: 08.00 - 21.00 WIB)",
    "instagram": "@handle_instagram_toko",
    "chatbot_name": "Nama Asisten AI CS",
    "chatbot_persona": "Deskripsi karakter ramah Asisten AI CS",
    "banner_url": "URL Unsplash HD relevan"
  },
  "products": [
    {
      "name": "Nama produk 1 kontekstual",
      "price": 150000,
      "description": "Deskripsi produk 1 menarik (termasuk opsi ukuran/warna jika fashion/kriya)",
      "image_url": "URL Unsplash HD produk 1",
      "status": "tersedia"
    },
    {
      "name": "Nama produk 2 kontekstual",
      "price": 250000,
      "description": "Deskripsi produk 2 menarik",
      "image_url": "URL Unsplash HD produk 2",
      "status": "tersedia"
    },
    {
      "name": "Nama produk 3 kontekstual",
      "price": 180000,
      "description": "Deskripsi produk 3 menarik",
      "image_url": "URL Unsplash HD produk 3",
      "status": "tersedia"
    }
  ],
  "journals": [
    {
      "title": "Judul artikel jurnal 1 inspiratif",
      "content": "Isi artikel jurnal 1 emosional dan menarik",
      "image_url": "URL Unsplash HD banner 1"
    },
    {
      "title": "Judul artikel jurnal 2 tips/cerita",
      "content": "Isi artikel jurnal 2 bermanfaat",
      "image_url": "URL Unsplash HD banner 2"
    },
    {
      "title": "Judul artikel jurnal 3 gaya hidup",
      "content": "Isi artikel jurnal 3 gaya hidup",
      "image_url": "URL Unsplash HD banner 3"
    }
  ],
  "gallery": [
    {
      "caption": "Judul/caption foto galeri 1",
      "image_url": "URL Unsplash HD galeri 1",
      "display_order": 1
    },
    {
      "caption": "Judul/caption foto galeri 2",
      "image_url": "URL Unsplash HD galeri 2",
      "display_order": 2
    },
    {
      "caption": "Judul/caption foto galeri 3",
      "image_url": "URL Unsplash HD galeri 3",
      "display_order": 3
    }
  ]
}`;

  const candidateEndpoints = [
    {
      url: `https://api.kie.ai/${modelName}-openai/v1/chat/completions`,
      type: 'openai'
    },
    {
      url: `${userBaseUrl.replace(/\/+$/, '')}/chat/completions`,
      type: 'openai'
    },
    {
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      type: 'gemini_direct'
    }
  ];

  for (const ep of candidateEndpoints) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 7000);

      let res;
      if (ep.type === 'openai') {
        res = await fetch(ep.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: 'system', content: 'Anda adalah AI Instant Store Creator yang mengembalikan RAW JSON murni.' },
              { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' }
          }),
          signal: controller.signal
        });
      } else {
        // gemini_direct
        res = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          }),
          signal: controller.signal
        });
      }

      clearTimeout(timer);

      if (res.ok) {
        const resJson = await res.json();
        let rawContent = '';
        if (ep.type === 'openai') {
          rawContent = resJson.choices?.[0]?.message?.content || resJson.output || '';
        } else {
          rawContent = resJson.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }

        const cleanText = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanText);

        if (data && data.profile && Array.isArray(data.products) && data.products.length > 0) {
          console.log(`Successfully generated store content via ${ep.url}`);
          return data;
        }
      }
    } catch (err) {
      console.warn(`KIE.ai Candidate Endpoint ${ep.url} failed:`, err.message);
    }
  }

  console.warn('All KIE endpoints failed or timed out. Executing Category Preset Fallback.');
  return getCategoryPresetFallback(storeName, category, description);
}

// Master Onboarding Generator Server Action
export async function createInstantStoreWithAI(formData) {
  const storeName = formData.get('store_name')?.trim();
  const category = (formData.get('category') || 'kuliner').trim().toLowerCase();
  const description = formData.get('description')?.trim() || '';
  const username = formData.get('username')?.trim();
  const password = formData.get('password')?.trim();

  if (!storeName || !username || !password) {
    return { error: 'Nama Toko, Username, dan Password wajib diisi!' };
  }

  try {
    // 1. Generate slug and ensure uniqueness
    let baseSlug = slugify(storeName);
    if (!baseSlug) baseSlug = `toko-${Date.now()}`;
    let storeSlug = baseSlug;
    let counter = 1;

    while (true) {
      const { data: existing } = await supabase
        .from('stores')
        .select('id')
        .eq('slug', storeSlug)
        .maybeSingle();

      if (!existing) break;
      storeSlug = `${baseSlug}-${counter++}`;
    }

    // 2. Execute AI Content Generation (or Preset Fallback)
    const generatedData = await generateStoreContentWithKIE(storeName, category, description);
    const prof = generatedData.profile || {};
    const prods = generatedData.products || [];
    const journs = generatedData.journals || [];
    const gals = generatedData.gallery || [];

    // 3. Insert Store Profile to Supabase
    const { data: newStore, error: storeError } = await supabase
      .from('stores')
      .insert({
        name: storeName,
        slug: storeSlug,
        category: category,
        tagline: prof.tagline || `Toko ${storeName}`,
        story: prof.story || description,
        description: prof.description || description,
        address: prof.address || 'Jl. Utama No. 1',
        hours: prof.hours || 'Senin - Sabtu: 08.00 - 21.00 WIB',
        whatsapp: '081234567890',
        instagram: prof.instagram || `@${storeSlug}`,
        chatbot_name: prof.chatbot_name || `Asisten ${storeName}`,
        chatbot_persona: prof.chatbot_persona || 'Asisten Customer Service yang ramah dan sigap.',
        banner_url: prof.banner_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
        username: username,
        password: password
      })
      .select()
      .single();

    if (storeError) throw storeError;

    const storeId = newStore.id;

    // 4. Multi-Table Auto-Insert Products
    if (prods.length > 0) {
      const prodInserts = prods.map((p) => ({
        store_id: storeId,
        name: p.name,
        price: Number(p.price) || 100000,
        description: p.description || '',
        image_url: p.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
        status: 'tersedia'
      }));
      await supabase.from('products').insert(prodInserts);
    }

    // 5. Multi-Table Auto-Insert Journals
    if (journs.length > 0) {
      const journInserts = journs.map((j) => ({
        store_id: storeId,
        title: j.title,
        content: j.content,
        image_url: j.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80'
      }));
      await supabase.from('journals').insert(journInserts);
    }

    // 6. Multi-Table Auto-Insert Gallery
    if (gals.length > 0) {
      const galInserts = gals.map((g, idx) => ({
        store_id: storeId,
        caption: g.caption || `Galeri ${idx + 1}`,
        image_url: g.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
        display_order: g.display_order || idx + 1
      }));
      await supabase.from('gallery').insert(galInserts);
    }

    // 7. Auto Cookie Session Login
    const cookieStore = await cookies();
    cookieStore.set('store_session', String(storeId), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    });

    revalidatePath('/admin');
    revalidatePath('/admin/profile');
    revalidatePath('/admin/produk');
    revalidatePath('/admin/jurnal');
    revalidatePath('/admin/gallery');
    revalidatePath(`/toko/${storeSlug}`);

    return { success: true, storeId, storeSlug };
  } catch (err) {
    console.error('Instant Store Creation Error:', err);
    return { error: err.message || 'Gagal membuat toko dengan AI.' };
  }
}
