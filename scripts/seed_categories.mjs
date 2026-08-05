import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://urauzxjgaaymjnfulxdb.supabase.co';
const supabaseAnonKey = 'sb_publishable_0K8GI2C3Rdno7dqKAClLrQ_Urws6MqP';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedMultiCategory() {
  console.log('🌱 Starting Multi-Category Store Seeding...');

  // 1. Store Fashion: Busana Trusmi
  const { data: fashionStore, error: fashionErr } = await supabase
    .from('stores')
    .upsert(
      {
        username: 'busanatrusmi',
        password_hash: '123456',
        slug: 'busana-trusmi',
        name: 'Busana Batik Trusmi Cirebon',
        category: 'fashion',
        tagline: 'Pusat Batik Trusmi & Busana Muslim Elegant Cirebon',
        description: 'Menyediakan aneka Batik Megamendung khas Trusmi Cirebon, Gamis, Kemeja Batik Premium, dan OOTD Tradisional Modern.',
        story: 'Berdiri sejak 1998 di Kawasan Batik Trusmi Cirebon, kami memberdayakan puluhan pengrajin batik tulis dan cap lokal.',
        address: 'Jl. Raya Trusmi No. 88, Plered, Kabupaten Cirebon',
        whatsapp: '081234567891',
        hours: '08.00 - 21.00 WIB',
        logo_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=80',
        hero_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80',
        chatbot_name: 'Asisten Batik Trusmi 👗',
        chatbot_persona: 'Ramah, mengerti size chart pakaian, paham rekomendasi warna batik Megamendung, dan membantu pengiriman kurir.'
      },
      { onConflict: 'username' }
    )
    .select()
    .single();

  if (fashionErr) console.error('Fashion store err:', fashionErr);
  else console.log('✅ Store Fashion Created:', fashionStore.name);

  // Add Products for Fashion
  if (fashionStore) {
    await supabase.from('products').delete().eq('store_id', fashionStore.id);
    await supabase.from('products').insert([
      {
        store_id: fashionStore.id,
        name: 'Kemeja Batik Megamendung Silk (Size M/L/XL)',
        price: 275000,
        description: 'Kemeja pria batik sutra halus motif Megamendung khas Cirebon. Pilihan warna: Biru Royal, Merah Cabai.',
        image_url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&q=80',
        status: 'tersedia'
      },
      {
        store_id: fashionStore.id,
        name: 'Gamis Batik Kombinasi Premium',
        price: 350000,
        description: 'Gamis wanita bahan Toyobo mix Batik Tulis Trusmi. Lembut, adem, busui friendly.',
        image_url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&q=80',
        status: 'tersedia'
      },
      {
        store_id: fashionStore.id,
        name: 'Kain Selendang Batik Tulis Halus',
        price: 450000,
        description: 'Kain batik murni buatan tangan pengrajin Trusmi 100% serat katun primisima.',
        image_url: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=500&q=80',
        status: 'tersedia'
      }
    ]);
  }

  // 2. Store Kriya: Rotan Plumbon
  const { data: kriyaStore, error: kriyaErr } = await supabase
    .from('stores')
    .upsert(
      {
        username: 'rotanplumbon',
        password_hash: '123456',
        slug: 'rotan-plumbon',
        name: 'Kriya Rotan Plumbon Cirebon',
        category: 'kriya',
        tagline: 'Kerajinan Furniture & Home Decor Rotan Sintetis Export Quality',
        description: 'Spesialis perabotan rotan alami & sintetis, kursi santai, tempat sampah estetika, dan keranjang custom.',
        story: 'Sentra kerajinan rotan Plumbon Cirebon yang merambah pasar ekspor Eropa dan Asia sejak 2005.',
        address: 'Blok Karanganyar, Desa Plumbon, Cirebon',
        whatsapp: '081234567892',
        hours: '08.00 - 17.00 WIB',
        logo_url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=200&q=80',
        hero_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80',
        chatbot_name: 'Craftmaster Rotan AI 🛠️',
        chatbot_persona: 'Ahli estimasi pengerjaan pre-order rotan, rekomendasi spesifikasi bahan sintetis vs alam, dan kirim kargo.'
      },
      { onConflict: 'username' }
    )
    .select()
    .single();

  if (kriyaErr) console.error('Kriya store err:', kriyaErr);
  else console.log('✅ Store Kriya Created:', kriyaStore.name);

  // Add Products for Kriya
  if (kriyaStore) {
    await supabase.from('products').delete().eq('store_id', kriyaStore.id);
    await supabase.from('products').insert([
      {
        store_id: kriyaStore.id,
        name: 'Kursi Rotan Santai Egg Chair (PO 5 Hari)',
        price: 850000,
        description: 'Kursi gantung rotan sintetis anti UV lengkap dengan bantal empuk warna custom.',
        image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80',
        status: 'tersedia'
      },
      {
        store_id: kriyaStore.id,
        name: 'Keranjang Laundry Rotan Estetik Set isi 3',
        price: 320000,
        description: 'Set keranjang rotan laundry & tempat mainan dengan puring kain linen krem.',
        image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&q=80',
        status: 'tersedia'
      },
      {
        store_id: kriyaStore.id,
        name: 'Meja Tamu Minimalis Anyaman Rotan Alami',
        price: 650000,
        description: 'Meja kopi bulat kombinasi kayu mahoni solid dan anyaman rotan pitrit halus.',
        image_url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=500&q=80',
        status: 'tersedia'
      }
    ]);
  }

  console.log('🎉 Seeding Multi-Category Done!');
}

seedMultiCategory();
