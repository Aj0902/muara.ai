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

// ==========================================
// WORKER 2: UNSPLASH IMAGE CURATOR ENGINE
// (High-Resolution Curated Images per Category & Topic)
// ==========================================
const UNSPLASH_IMAGE_BANK = {
  fashion: {
    banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
    products: [
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80', // Kemeja batik / busana
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', // Dress / gaun
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80', // Outer / jacket
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80'  // Fashion collection
    ],
    journals: [
      'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&q=80',
      'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80',
      'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80',
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80'
    ]
  },
  kriya: {
    banner: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1200&q=80',
    products: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80', // Kursi rotan / furnitur
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80', // Anyaman keranjang
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80', // Ukiran kayu / ornamen
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80'  // Kerajinan tangan
    ],
    journals: [
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80'
    ]
  },
  kuliner: {
    banner: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80',
    products: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', // Makanan utama
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80', // Snack / makanan ringan
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80', // Minuman segar
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80'  // Hidangan resto
    ],
    journals: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80'
    ]
  }
};

function curateImagesForStore(category) {
  const cat = (category || 'kuliner').toLowerCase();
  const bank = UNSPLASH_IMAGE_BANK[cat] || UNSPLASH_IMAGE_BANK.kuliner;
  return {
    bannerUrl: bank.banner,
    productImages: bank.products,
    journalImages: bank.journals,
    galleryImages: bank.gallery
  };
}

// Open Dynamic Preset Fallback Starter Pack (Broad Category Sense - Zero Narrow Keywords)
function getCategoryPresetFallback(storeName, category, description) {
  const cat = (category || 'kuliner').toLowerCase();
  const images = curateImagesForStore(cat);

  if (cat === 'fashion') {
    return {
      profile: {
        tagline: `Koleksi Produk Fashion & Gaya Terkini dari ${storeName}`,
        story: `${storeName} hadir untuk menghadirkan produk fashion dan gaya berbusana berkualitas tinggi yang memadukan estetika, kenyamanan, dan karakter unik Anda. Setiap produk dirancang dengan perhatian pada detail terbaik.`,
        description: description || `Pusat produk fashion & gaya hidup eksklusif ${storeName}. Menyediakan ragam pilihan produk fashion berkualitas tinggi.`,
        address: 'Jl. Boulevard Utama No. 88, Jakarta Selatan',
        hours: 'Senin - Sabtu: 09.00 - 21.00 WIB',
        instagram: `@${slugify(storeName)}_official`,
        chatbot_name: `Asisten ${storeName}`,
        chatbot_persona: 'Asisten Customer Service yang ramah, siap merekomendasikan produk fashion terbaik dan membantu pilihan ukuran.',
        logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(storeName)}&background=C2410C&color=fff&size=150`
      },
      products: [
        {
          name: `Koleksi Utama ${storeName}`,
          price: 245000,
          description: 'Produk fashion berkualitas tinggi dengan bahan pilihan yang nyaman digunakan harian.',
          image_url: images.productImages[0],
          status: 'tersedia'
        },
        {
          name: `Varian Spesial ${storeName}`,
          price: 320000,
          description: 'Desain eksklusif dengan paduan gaya modern dan daya tahan maksimal.',
          image_url: images.productImages[1],
          status: 'tersedia'
        },
        {
          name: `Produk Favorit ${storeName}`,
          price: 185000,
          description: 'Pilihan terfavorit pelanggan untuk melengkapi penampilan percaya diri Anda.',
          image_url: images.productImages[2],
          status: 'tersedia'
        }
      ],
      journals: [
        {
          title: `Kisah Di Balik Peluncuran ${storeName}`,
          content: `${storeName} didirikan dengan komitmen memberikan produk fashion autentik yang memberikan kebanggaan bagi pemakainya.`,
          image_url: images.journalImages[0]
        },
        {
          title: 'Tips Perawatan Produk Agar Tetap Awet',
          content: 'Rawat produk dengan petunjuk pembersihan yang tepat untuk menjaga daya tahan dan kilau warna alami.',
          image_url: images.journalImages[1]
        },
        {
          title: 'Inspirasi Gaya dan Padu Padan Harian',
          content: 'Temukan kombinasi gaya unik yang mencerminkan karakter pribadi Anda di setiap kesempatan.',
          image_url: images.journalImages[2]
        }
      ],
      gallery: [
        {
          caption: 'Detail Kualitas Produk',
          image_url: images.galleryImages[0],
          display_order: 1
        },
        {
          caption: 'Sudut Studio Karya Kami',
          image_url: images.galleryImages[1],
          display_order: 2
        },
        {
          caption: 'Koleksi Terbaru',
          image_url: images.galleryImages[2],
          display_order: 3
        }
      ]
    };
  } else if (cat === 'kriya') {
    return {
      profile: {
        tagline: `Karya Seni Kriya & Kerajinan Autentik dari ${storeName}`,
        story: `${storeName} berdedikasi menciptakan karya kerajinan buatan tangan berkualitas yang menggabungkan estetika seni lokal dan fungsi praktis. Setiap karya dikerjakan dengan ketelitian jemari perajin berbakat.`,
        description: description || `Pusat seni kriya & kerajinan buatan tangan di ${storeName}. Hadirkan sentuhan estetika istimewa untuk ruangan dan kebutuhan Anda.`,
        address: 'Jl. Sentra Industri Kreatif No. 12, Bandung',
        hours: 'Senin - Sabtu: 08.30 - 18.00 WIB',
        instagram: `@${slugify(storeName)}_craft`,
        chatbot_name: `Asisten Karya ${storeName}`,
        chatbot_persona: 'Asisten Customer Service yang paham spesifikasi produk kriya, pesanan custom PO, dan pengiriman aman.',
        logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(storeName)}&background=C2410C&color=fff&size=150`
      },
      products: [
        {
          name: `Karya Kriya Utama ${storeName}`,
          price: 280000,
          description: 'Hasil kerajinan buatan tangan dengan bahan berkualitas dan finishing presisi.',
          image_url: images.productImages[0],
          status: 'tersedia'
        },
        {
          name: `Kerajinan Estetik ${storeName}`,
          price: 150000,
          description: 'Ornamen dekoratif unik untuk menambah kehangatan dan keindahan sudut ruangan.',
          image_url: images.productImages[1],
          status: 'tersedia'
        },
        {
          name: `Karya Custom ${storeName}`,
          price: 350000,
          description: 'Hasil karya kriya edisi khusus yang dirancang sesuai keinginan dan kebutuhan Anda.',
          image_url: images.productImages[2],
          status: 'tersedia'
        }
      ],
      journals: [
        {
          title: `Filosofi Pembuatan Karya di ${storeName}`,
          content: 'Setiap karya kriya lahir dari dedikasi dan apresiasi mendalam terhadap nilai kerajinan buatan tangan.',
          image_url: images.journalImages[0]
        },
        {
          title: 'Cara Merawat Produk Kriya dan Dekorasi',
          content: 'Jaga kebersihan produk dengan mengelapnya secara lembut untuk mempertahankan keindahan bentuk dan warna.',
          image_url: images.journalImages[1]
        },
        {
          title: 'Menghadirkan Sentuhan Seni di Setiap Ruangan',
          content: 'Sentuhan elemen kerajinan tangan memberikan nuansa hangat dan karakter yang khas pada tempat tinggal Anda.',
          image_url: images.journalImages[2]
        }
      ],
      gallery: [
        {
          caption: 'Proses Pembuatan Karya',
          image_url: images.galleryImages[0],
          display_order: 1
        },
        {
          caption: 'Sudut Workshop Perajin',
          image_url: images.galleryImages[1],
          display_order: 2
        },
        {
          caption: 'Koleksi Hasil Karya',
          image_url: images.galleryImages[2],
          display_order: 3
        }
      ]
    };
  } else {
    // Kuliner
    return {
      profile: {
        tagline: `Cita Rasa Kuliner Spesial dari ${storeName}`,
        story: `${storeName} menyajikan sajian kuliner lezat yang disiapkan dari bahan-bahan berkualitas dan racikan istimewa. Kami hadir untuk melengkapi momen spesial Anda dengan kenikmatan rasa yang memanjakan.`,
        description: description || `Destinasi kuliner lezat ${storeName}. Menyediakan pilihan produk kuliner berkualitas.`,
        address: 'Jl. Kuliner Utama No. 99, Bandung',
        hours: 'Setiap Hari: 09.00 - 21.00 WIB',
        instagram: `@${slugify(storeName)}_kuliner`,
        chatbot_name: `Asisten Kuliner ${storeName}`,
        chatbot_persona: 'Asisten Customer Service yang ramah, paham varian produk kuliner, dan siap membantu pemesanan.',
        logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(storeName)}&background=C2410C&color=fff&size=150`
      },
      products: [
        {
          name: `Menu/Sajian Utama ${storeName}`,
          price: 45000,
          description: 'Sajian kuliner khas racikan istimewa dengan bahan baku segar dan aroma yang menggugah selera.',
          image_url: images.productImages[0],
          status: 'tersedia'
        },
        {
          name: `Varian Spesial ${storeName}`,
          price: 28000,
          description: 'Pilihan favorit lezat yang cocok untuk dinikmati kapan saja bersama teman dan keluarga.',
          image_url: images.productImages[1],
          status: 'tersedia'
        },
        {
          name: `Minuman/Olahan Segar ${storeName}`,
          price: 18000,
          description: 'Racikan segar penyegar hari dengan cita rasa alami khas racikan kami.',
          image_url: images.productImages[2],
          status: 'tersedia'
        }
      ],
      journals: [
        {
          title: `Rahasia Kelezatan di ${storeName}`,
          content: 'Kami meyakini kelezatan rasa lahir dari bahan baku berkualitas segar dan ketulusan dalam setiap proses penyajian.',
          image_url: images.journalImages[0]
        },
        {
          title: 'Komitmen Kualitas & Kesegaran Sajian',
          content: 'Setiap produk diproses dengan standar kebersihan dan higienis tinggi untuk menjamin kepuasan Anda.',
          image_url: images.journalImages[1]
        },
        {
          title: 'Menikmati Momen Bersama Sajian Spesial',
          content: 'Sajikan momen hangat bersama keluarga dan kerabat ditemani varian rasa terbaik dari kami.',
          image_url: images.journalImages[2]
        }
      ],
      gallery: [
        {
          caption: 'Suasana & Penyajian Produk',
          image_url: images.galleryImages[0],
          display_order: 1
        },
        {
          caption: 'Proses Racikan Bahan Segar',
          image_url: images.galleryImages[1],
          display_order: 2
        },
        {
          caption: 'Koleksi Sajian Favorit',
          image_url: images.galleryImages[2],
          display_order: 3
        }
      ]
    };
  }
}

// ==========================================
// WORKER 1: COPYWRITING AI LLM ENGINE
// ==========================================
async function generateCopywritingWithKIE(storeName, category, description) {
  const apiKey = (process.env.KIE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)?.trim();
  const rawModel = process.env.KIE_MODEL_NAME;
  const modelName = (!rawModel || rawModel === 'KIE_MODEL_NAME') ? 'gemini-3-5-flash' : rawModel.trim();
  const rawBaseUrl = process.env.KIE_API_BASE_URL;
  const userBaseUrl = (!rawBaseUrl || rawBaseUrl.includes('KIE_API_BASE_URL')) ? 'https://api.kie.ai/v1' : rawBaseUrl.trim();

  if (!apiKey || apiKey === 'your_kie_api_key_here') {
    return null;
  }

  const prompt = `Anda adalah Pakar Copywriting, Branding, dan USP Analyst UMKM Indonesia Tingkat Dewa.
Tugas Anda adalah mengidentifikasi dan meracik narasi toko berdasarkan ide spesifik bisnis dari user dalam ARTI LUAS (Broad Category Sense) tanpa pernah terikat pada asumsi generik/terbatas.

KATEGORI BISNIS DALAM ARTI LUAS:
- **Kriya**: Bukan hanya rotan/kayu! Bisa berupa tembikar/keramik, perhiasan perak, rajutan/knitting, lilin aromaterapi, hampers buatan tangan, ukiran logam, kerajinan kulit, resin art, dll.
- **Kuliner**: Bukan hanya makanan resto/makan di tempat! Bisa berupa katering harian, bakery/kue kering, frozen food, kopi kekinian, bumbu/sambal kemasan, jajanan pasar, minuman herbal, gelato, dll.
- **Fashion**: Bukan hanya kemeja batik/busana pesta! Bisa berupa streetwear, busana muslim/hijab, sepatu/sandal, kaos distro, baju anak, tas kain/totebag, pakaian olahraga, aksesoris fashion, dll.

INPUT DARI USER:
- Nama Toko: "${storeName}"
- Kategori Utama: "${category}" (fashion | kriya | kuliner)
- Prompt Deskripsi Bisnis User: "${description}"

MANDAT PENULISAN COPYWRITING (WAJIB PERHATIKAN):
1. **DILARANG PAKAI KATA TERIKAT/TEMPLAT KECUALI DIKetik USER**: Jangan pernah menyelipkan kata generik seperti "rotan", "batik", "kemeja", "resto", "makanan resto" KECUALI kata tersebut memang diketik user dalam prompt deskripsi!
2. **EXTRACT POV STORY & USP DARI DESKRIPSI USER**:
   - story: Tuliskan cerita brand yang mendalam, emosional, dan inspiratif (2-3 paragraf) berdasarkan sudut pandang (POV) keunggulan khas/keunikan bisnis user.
   - tagline: Buat tagline kreatif yang sangat menjual dan mencerminkan USP utama bisnis user.
   - description: JANGAN MENYALIN MENTAH-MENTAH ketikan user! Rakit ulang deskripsi user menjadi kalimat copywriting yang singkat, padat, jelas, profesional, dan sangat MENJUAL (high-converting).

3. **PRODUK & JURNAL SPESIFIK SESUAI KONTEKS USER**:
   - products: Generasikan 3 nama produk yang BENAR-BENAR SPESIFIK dan RELEVAN dengan bisnis user (bukan produk umum), sertakan harga realistis dan deskripsi produk yang menggiurkan.
   - journals: Tulis 3 judul & artikel jurnal yang menceritakan filosofi produk, tips penggunaan, dan kisah pembuatan sesuai bisnis user.
   - gallery: Tulis 3 caption galeri yang menggambarkan suasana workshop/dapur/studio toko.

4. **INFORMASI KONTAK DEFAULT LENGKAP & AKTIF**:
   - address: Generasikan alamat fisik toko yang lengkap dan realistis di kota Indonesia yang relevan.
   - hours: Generasikan jam operasional spesifik yang pas dengan tipe bisnis user (contoh: "Senin - Sabtu: 08.00 - 21.00 WIB").
   - instagram: Buat handle instagram estetik (contoh: "@${slugify(storeName)}_official").
   - chatbot_name: Nama Asisten AI CS yang ramah.
   - chatbot_persona: Deskripsi karakter Asisten AI CS yang responsif.

Panduan Output JSON Wajib (RAW JSON MURNI):
{
  "profile": {
    "tagline": "Tagline khas mencerminkan USP user",
    "story": "Cerita brand POV emosional & inspiratif (2-3 paragraf)",
    "description": "Hasil rakitan ulang deskripsi user yang singkat, padat, dan menjual",
    "address": "Alamat toko fisik lengkap dan realistis",
    "hours": "Jam operasional toko",
    "instagram": "@handle_instagram_toko",
    "chatbot_name": "Nama Asisten AI CS",
    "chatbot_persona": "Deskripsi karakter Asisten AI CS"
  },
  "products": [
    {
      "name": "Nama produk 1 spesifik sesuai deskripsi user",
      "price": 150000,
      "description": "Deskripsi produk 1 yang menggiurkan dan menjual",
      "status": "tersedia"
    },
    {
      "name": "Nama produk 2 spesifik sesuai deskripsi user",
      "price": 250000,
      "description": "Deskripsi produk 2 yang menggiurkan dan menjual",
      "status": "tersedia"
    },
    {
      "name": "Nama produk 3 spesifik sesuai deskripsi user",
      "price": 180000,
      "description": "Deskripsi produk 3 yang menggiurkan dan menjual",
      "status": "tersedia"
    }
  ],
  "journals": [
    {
      "title": "Judul artikel jurnal 1 menceritakan POV/filosofi bisnis",
      "content": "Isi artikel jurnal 1 emosional dan menarik"
    },
    {
      "title": "Judul artikel jurnal 2 tips/panduan relevan",
      "content": "Isi artikel jurnal 2 bermanfaat"
    },
    {
      "title": "Judul artikel jurnal 3 gaya hidup/cerita pelanggan",
      "content": "Isi artikel jurnal 3 inspiratif"
    }
  ],
  "gallery": [
    {
      "caption": "Caption foto galeri 1 (suasana workshop/dapur)",
      "display_order": 1
    },
    {
      "caption": "Caption foto galeri 2 (proses pembuatan)",
      "display_order": 2
    },
    {
      "caption": "Caption foto galeri 3 (hasil karya)",
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
              { role: 'system', content: 'Anda adalah Pakar Copywriting UMKM yang mengembalikan RAW JSON murni.' },
              { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' }
          }),
          signal: controller.signal
        });
      } else {
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

        const match = rawContent.match(/\{[\s\S]*\}/);
        if (match) {
          const data = JSON.parse(match[0]);
          if (data && data.profile && Array.isArray(data.products) && data.products.length > 0) {
            return data;
          }
        }
      }
    } catch (err) {
      console.warn(`Copywriting Worker Candidate Endpoint ${ep.url} failed:`, err.message);
    }
  }

  return null;
}

// Master Dual-Worker Onboarding Generator Server Action
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

    // 2. RUN WORKER 1 (Copywriting LLM) & WORKER 2 (Image Curator) IN PARALLEL
    const [copywritingData, imageAssets] = await Promise.all([
      generateCopywritingWithKIE(storeName, category, description),
      Promise.resolve(curateImagesForStore(category))
    ]);

    // Merge Copywriting + Image Curator assets
    const fallbackPreset = getCategoryPresetFallback(storeName, category, description);
    const prof = copywritingData?.profile || fallbackPreset.profile;
    const rawProds = copywritingData?.products || fallbackPreset.products;
    const rawJourns = copywritingData?.journals || fallbackPreset.journals;
    const rawGals = copywritingData?.gallery || fallbackPreset.gallery;

    const logoUrl = prof.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(storeName)}&background=C2410C&color=fff&size=150`;

    const cleanSlug = slugify(storeName);
    const defaultInstagram = prof.instagram || `https://instagram.com/${cleanSlug}`;
    const defaultTiktok = `https://tiktok.com/@${cleanSlug}`;
    const defaultFacebook = `https://facebook.com/${cleanSlug}`;
    const defaultMapsLink = `https://maps.google.com/?q=${encodeURIComponent(storeName)}`;
    const defaultShopeeFood = category === 'kuliner' ? `https://shopee.co.id/universal-link` : `https://shopee.co.id/${cleanSlug}`;
    const defaultGoFood = category === 'kuliner' ? `https://gofood.link/a/${cleanSlug}` : `https://tokopedia.com/${cleanSlug}`;
    const defaultGrabFood = category === 'kuliner' ? `https://grab.onelink.me/${cleanSlug}` : `https://lazada.co.id/shop/${cleanSlug}`;

    // 3. Insert Store Profile to Supabase (FIXED COLUMNS & ALL SOCIAL LINKS AUTO-FILLED)
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
        whatsapp: '0882000009822',
        instagram: defaultInstagram,
        tiktok: defaultTiktok,
        facebook: defaultFacebook,
        maps_link: defaultMapsLink,
        shopeefood: defaultShopeeFood,
        gofood: defaultGoFood,
        grabfood: defaultGrabFood,
        chatbot_name: prof.chatbot_name || `Asisten ${storeName}`,
        chatbot_persona: prof.chatbot_persona || 'Asisten Customer Service yang ramah dan sigap.',
        logo_url: logoUrl,
        hero_url: imageAssets.bannerUrl,
        about_url: imageAssets.journalImages[0],
        username: username,
        password_hash: password
      })
      .select()
      .single();

    if (storeError) {
      console.error('Store Insertion Error:', storeError);
      throw new Error(`Gagal menyimpan profil toko: ${storeError.message}`);
    }

    const storeId = newStore.id;

    // 4. Parallel Multi-Table Auto-Insert (Products, Journals, Gallery with curated Unsplash images)
    const insertTasks = [];

    // Products
    if (rawProds.length > 0) {
      const prodInserts = rawProds.map((p, idx) => ({
        store_id: storeId,
        name: p.name,
        price: Number(p.price) || 100000,
        description: p.description || '',
        image_url: imageAssets.productImages[idx % imageAssets.productImages.length],
        status: 'tersedia'
      }));
      insertTasks.push(supabase.from('products').insert(prodInserts));
    }

    // Journals
    if (rawJourns.length > 0) {
      const journInserts = rawJourns.map((j, idx) => ({
        store_id: storeId,
        title: j.title,
        content: j.content,
        image_url: imageAssets.journalImages[idx % imageAssets.journalImages.length]
      }));
      insertTasks.push(supabase.from('journals').insert(journInserts));
    }

    // Gallery
    if (rawGals.length > 0) {
      const galInserts = rawGals.map((g, idx) => ({
        store_id: storeId,
        caption: g.caption || `Galeri ${idx + 1}`,
        image_url: imageAssets.galleryImages[idx % imageAssets.galleryImages.length],
        display_order: g.display_order || idx + 1
      }));
      insertTasks.push(supabase.from('gallery').insert(galInserts));
    }

    // Execute parallel insertions
    await Promise.all(insertTasks);

    // 5. Auto Cookie Session Login
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
