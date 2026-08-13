'use server';

import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

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

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/+$/, '');
  return 'https://muara-ai.vercel.app';
}

// Helper to send WA message via WAHA API directly
async function sendWhatsApp(to, message) {
  const rawUrl = process.env.WAHA_API_URL;
  const apiKey = (process.env.WAHA_API_KEY || process.env.WHATSAPP_API_KEY || process.env.WAHA_KEY)?.trim();
  const session = 'muara';

  if (!rawUrl || !to || !message) {
    console.warn('WAHA Notification skipped: Missing WAHA_API_URL, target phone, or message text', { hasUrl: !!rawUrl, to });
    return { success: false, error: 'Missing WAHA_API_URL or parameters' };
  }

  const baseUrl = rawUrl.trim().replace(/\/+$/, '');
  const baseEndpoint = baseUrl.endsWith('/api/sendText') ? baseUrl : `${baseUrl}/api/sendText`;

  // Append key and session to URL query params for maximum compatibility
  const targetUrl = new URL(baseEndpoint);
  if (apiKey) targetUrl.searchParams.set('x-api-key', apiKey);
  targetUrl.searchParams.set('session', session);

  const cleanPhone = normalizePhone(to);
  const chatId = `${cleanPhone}@c.us`;

  // Strict 3-field JSON payload expected by WAHA API:
  const payload = {
    session,
    chatId,
    text: message
  };

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) {
    headers['X-Api-Key'] = apiKey;
  }

  try {
    const res = await fetch(targetUrl.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    const resText = await res.text();
    let data;
    try { data = JSON.parse(resText); } catch { data = resText; }
    console.log('WAHA WhatsApp notification sent to', chatId, ':', data);
    return { success: true, data };
  } catch (e) {
    console.error('Failed to send WAHA WhatsApp notification:', e.message || e);
    return { success: false, error: e.message || e };
  }
}


// Helper untuk mendapatkan store_id dari session cookie
async function getAuthStoreId() {
  const cookieStore = await cookies();
  return cookieStore.get('store_session')?.value;
}

// 1. UPDATE PROFILE TOKO
export async function updateStoreProfile(formData) {
  const storeId = await getAuthStoreId();
  if (!storeId) return { error: 'Unauthorized!' };

  const name = formData.get('name')?.trim();
  const tagline = formData.get('tagline')?.trim();
  const description = formData.get('description')?.trim();
  const story = formData.get('story')?.trim();
  const address = formData.get('address')?.trim();
  const mapsLink = formData.get('maps_link')?.trim();
  const whatsapp = formData.get('whatsapp')?.trim();
  const hours = formData.get('hours')?.trim();
  const instagram = formData.get('instagram')?.trim();
  const tiktok = formData.get('tiktok')?.trim();
  const facebook = formData.get('facebook')?.trim();
  const shopeefood = formData.get('shopeefood')?.trim();
  const gofood = formData.get('gofood')?.trim();
  const grabfood = formData.get('grabfood')?.trim();
  const logoUrl = formData.get('logo_url')?.trim();
  const heroUrl = formData.get('hero_url')?.trim();
  const aboutUrl = formData.get('about_url')?.trim();

  if (!name) return { error: 'Nama Toko wajib diisi!' };

  try {
    const { error } = await supabase
      .from('stores')
      .update({
        name,
        tagline,
        description,
        story,
        address,
        maps_link: mapsLink,
        whatsapp,
        hours,
        instagram,
        tiktok,
        facebook,
        shopeefood,
        gofood,
        grabfood,
        logo_url: logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=C2410C&color=fff`,
        hero_url: heroUrl,
        about_url: aboutUrl
      })
      .eq('id', storeId);

    if (error) throw error;

    revalidatePath('/admin/profile');
    revalidatePath(`/toko/[slug]`, 'layout');
    return { success: true };
  } catch (err) {
    console.error('Update Profile Error:', err);
    return { error: 'Gagal mengupdate profil toko: ' + err.message };
  }
}

// 2. KATEGORI ACTIONS
export async function addCategory(formData) {
  const storeId = await getAuthStoreId();
  if (!storeId) return { error: 'Unauthorized!' };

  const name = formData.get('name')?.trim();
  if (!name) return { error: 'Nama kategori wajib diisi!' };

  try {
    const { error } = await supabase
      .from('categories')
      .insert({ store_id: storeId, name });

    if (error) throw error;

    revalidatePath('/admin/produk');
    revalidatePath(`/toko/[slug]/menu`, 'layout');
    return { success: true };
  } catch (err) {
    console.error('Add Category Error:', err);
    return { error: 'Gagal menambahkan kategori.' };
  }
}

export async function deleteCategory(categoryId) {
  const storeId = await getAuthStoreId();
  if (!storeId) return { error: 'Unauthorized!' };

  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .eq('store_id', storeId);

    if (error) throw error;

    revalidatePath('/admin/produk');
    revalidatePath(`/toko/[slug]/menu`, 'layout');
    return { success: true };
  } catch (err) {
    console.error('Delete Category Error:', err);
    return { error: 'Gagal menghapus kategori.' };
  }
}

// 3. PRODUK / MENU ACTIONS
export async function addProduct(formData) {
  const storeId = await getAuthStoreId();
  if (!storeId) return { error: 'Unauthorized!' };

  const name = formData.get('name')?.trim();
  const price = parseFloat(formData.get('price'));
  const categoryId = formData.get('category_id');
  const description = formData.get('description')?.trim();
  const imageUrl = formData.get('image_url')?.trim();
  const status = formData.get('status') || 'tersedia';

  if (!name || isNaN(price)) return { error: 'Nama produk dan Harga wajib diisi!' };

  try {
    const { error } = await supabase
      .from('products')
      .insert({
        store_id: storeId,
        category_id: categoryId || null,
        name,
        price,
        description,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
        status
      });

    if (error) throw error;

    revalidatePath('/admin/produk');
    revalidatePath(`/toko/[slug]/menu`, 'layout');
    return { success: true };
  } catch (err) {
    console.error('Add Product Error:', err);
    return { error: 'Gagal menambahkan produk.' };
  }
}

export async function updateProduct(id, formData) {
  const storeId = await getAuthStoreId();
  if (!storeId) return { error: 'Unauthorized!' };

  const name = formData.get('name')?.trim();
  const price = parseFloat(formData.get('price'));
  const categoryId = formData.get('category_id');
  const description = formData.get('description')?.trim();
  const imageUrl = formData.get('image_url')?.trim();
  const status = formData.get('status') || 'tersedia';

  if (!name || isNaN(price)) return { error: 'Nama produk dan Harga wajib diisi!' };

  try {
    const { error } = await supabase
      .from('products')
      .update({
        category_id: categoryId || null,
        name,
        price,
        description,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
        status
      })
      .eq('id', id)
      .eq('store_id', storeId);

    if (error) throw error;

    revalidatePath('/admin/produk');
    revalidatePath(`/toko/[slug]/menu`, 'layout');
    return { success: true };
  } catch (err) {
    console.error('Update Product Error:', err);
    return { error: 'Gagal memperbarui produk.' };
  }
}

export async function deleteProduct(productId) {
  const storeId = await getAuthStoreId();
  if (!storeId) return { error: 'Unauthorized!' };

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('store_id', storeId);

    if (error) throw error;

    revalidatePath('/admin/produk');
    revalidatePath(`/toko/[slug]/menu`, 'layout');
    return { success: true };
  } catch (err) {
    console.error('Delete Product Error:', err);
    return { error: 'Gagal menghapus produk.' };
  }
}

// 4. GALERI BENTO ACTIONS
export async function addGalleryItem(formData) {
  const storeId = await getAuthStoreId();
  if (!storeId) return { error: 'Unauthorized!' };

  const imageUrl = formData.get('image_url')?.trim();
  const caption = formData.get('caption')?.trim();
  const displayOrder = parseInt(formData.get('display_order') || '0');

  if (!imageUrl) return { error: 'Link URL Gambar wajib diisi!' };

  try {
    const { error } = await supabase
      .from('gallery')
      .insert({
        store_id: storeId,
        image_url: imageUrl,
        caption,
        display_order: displayOrder
      });

    if (error) throw error;

    revalidatePath('/admin/gallery');
    revalidatePath(`/toko/[slug]`, 'layout');
    return { success: true };
  } catch (err) {
    console.error('Add Gallery Error:', err);
    return { error: 'Gagal menambahkan foto ke galeri.' };
  }
}

export async function deleteGalleryItem(itemId) {
  const storeId = await getAuthStoreId();
  if (!storeId) return { error: 'Unauthorized!' };

  try {
    const { error } = await supabase
      .from('gallery')
      .delete()
      .eq('id', itemId)
      .eq('store_id', storeId);

    if (error) throw error;

    revalidatePath('/admin/gallery');
    revalidatePath(`/toko/[slug]`, 'layout');
    return { success: true };
  } catch (err) {
    console.error('Delete Gallery Error:', err);
    return { error: 'Gagal menghapus foto dari galeri.' };
  }
}

// 5. JURNAL CERITA ACTIONS
export async function addJournalItem(formData) {
  const storeId = await getAuthStoreId();
  if (!storeId) return { error: 'Unauthorized!' };

  const title = formData.get('title')?.trim();
  const content = formData.get('content')?.trim();
  const imageUrl = formData.get('image_url')?.trim();

  if (!title || !content) return { error: 'Judul dan Cerita wajib diisi!' };

  try {
    const { error } = await supabase
      .from('journals')
      .insert({
        store_id: storeId,
        title,
        content,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80'
      });

    if (error) throw error;

    revalidatePath('/admin/jurnal');
    revalidatePath(`/toko/[slug]/jurnal`, 'layout');
    return { success: true };
  } catch (err) {
    console.error('Add Journal Error:', err);
    return { error: 'Gagal menerbitkan jurnal.' };
  }
}

export async function deleteJournalItem(itemId) {
  const storeId = await getAuthStoreId();
  if (!storeId) return { error: 'Unauthorized!' };

  try {
    const { error } = await supabase
      .from('journals')
      .delete()
      .eq('id', itemId)
      .eq('store_id', storeId);

    if (error) throw error;

    revalidatePath('/admin/jurnal');
    revalidatePath(`/toko/[slug]/jurnal`, 'layout');
    return { success: true };
  } catch (err) {
    console.error('Delete Journal Error:', err);
    return { error: 'Gagal menghapus jurnal.' };
  }
}

// 6. UPDATE SETTING PERSONA AI (Phase 2)
export async function updateAISettings(formData) {
  const storeId = await getAuthStoreId();
  if (!storeId) return { error: 'Unauthorized!' };

  const chatbotName = formData.get('chatbot_name')?.trim();
  const chatbotPersona = formData.get('chatbot_persona')?.trim();

  if (!chatbotName) return { error: 'Nama Chatbot wajib diisi!' };

  try {
    const { error } = await supabase
      .from('stores')
      .update({
        chatbot_name: chatbotName,
        chatbot_persona: chatbotPersona
      })
      .eq('id', storeId);

    if (error) throw error;

    revalidatePath('/admin/ai-asisten');
    return { success: true };
  } catch (err) {
    console.error('Update AI Settings Error:', err);
    return { error: 'Gagal memperbarui pengaturan AI: ' + err.message };
  }
}

// 7. SUPER ADMIN ACTIONS
export async function getAllStores() {
  const cookieStore = await cookies();
  const isSuper = cookieStore.get('super_session')?.value === 'active';
  if (!isSuper) return { error: 'Unauthorized!' };

  try {
    const { data: stores, error } = await supabase
      .from('stores')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, stores };
  } catch (err) {
    console.error('Get All Stores Error:', err);
    return { error: 'Gagal mendapatkan data toko.' };
  }
}

export async function deleteStore(storeId) {
  const cookieStore = await cookies();
  const isSuper = cookieStore.get('super_session')?.value === 'active';
  if (!isSuper) return { error: 'Unauthorized!' };

  try {
    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', storeId);

    if (error) throw error;

    revalidatePath('/super-admin');
    return { success: true };
  } catch (err) {
    console.error('Delete Store Error:', err);
    return { error: 'Gagal menghapus toko.' };
  }
}

// 8. SPECIAL ORDERS ACTIONS
export async function createSpecialOrder(storeId, name, phone, notes) {
  if (!storeId || !name || !phone || !notes) {
    return { error: 'Semua kolom wajib diisi!' };
  }

  try {
    const { error } = await supabase
      .from('special_orders')
      .insert({
        store_id: storeId,
        customer_name: name,
        customer_phone: phone,
        notes: notes,
        status: 'pending'
      });

    if (error) throw error;
    revalidatePath('/admin/pesanan-khusus');
    return { success: true };
  } catch (err) {
    console.error('Create Special Order Error:', err);
    return { error: 'Gagal membuat pesanan khusus: ' + err.message };
  }
}

export async function getSpecialOrders() {
  const cookieStore = await cookies();
  const storeId = cookieStore.get('store_session')?.value;
  if (!storeId) return { error: 'Unauthorized!' };

  try {
    const { data: orders, error } = await supabase
      .from('special_orders')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, orders };
  } catch (err) {
    console.error('Get Special Orders Error:', err);
    return { error: 'Gagal memuat pesanan khusus.' };
  }
}

export async function updateSpecialOrderStatus(orderId, status) {
  const cookieStore = await cookies();
  const storeId = cookieStore.get('store_session')?.value;
  if (!storeId) return { error: 'Unauthorized!' };

  try {
    const { error } = await supabase
      .from('special_orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;
    revalidatePath('/admin/pesanan-khusus');
    return { success: true };
  } catch (err) {
    console.error('Update Special Order Status Error:', err);
    return { error: 'Gagal memperbarui status.' };
  }
}

// 9. CLIENT STANDARD ORDERS ACTIONS
export async function createOrder(storeId, customerName, customerPhone, serviceType, tableNo, notes, totalAmount, items) {
  if (!storeId || !customerName || !customerPhone || !items || items.length === 0) {
    return { error: 'Semua kolom wajib diisi!' };
  }

  try {
    const invoiceNumber = `INV-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

      const orderToken = randomUUID();
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          store_id: storeId,
          order_token: orderToken,
          invoice_number: invoiceNumber,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_address:
            serviceType === 'dine_in'
              ? `Meja ${tableNo}`
              : notes
              ? notes
              : serviceType === 'shipping'
              ? 'Pengiriman Kurir / Ekspedisi'
              : serviceType === 'pickup'
              ? 'Pickup (Ambil di Toko)'
              : serviceType === 'custom_po'
              ? 'Pesanan Custom (PO)'
              : 'Take Away / Delivery',
          total_amount: totalAmount,
          status: 'pending',
          notes: notes
        })
        .select()
        .single();

    if (orderError) throw orderError;
    // Notify UMKM via WhatsApp
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('whatsapp')
      .eq('id', storeId)
      .single();
    if (!storeError && storeData?.whatsapp) {
      const baseUrl = getBaseUrl();
      const textMessage = `🛒 *PESANAN BARU MASUK!*\n\n` +
        `📋 *Invoice:* #${invoiceNumber}\n` +
        `👤 *Pelanggan:* ${customerName}\n` +
        `📞 *No. WA:* ${customerPhone}\n` +
        `💰 *Total:* Rp ${Number(totalAmount).toLocaleString('id-ID')}\n\n` +
        `🔗 *Kelola Pesanan:* ${baseUrl}/pesanan/kelola/${orderToken}`;

      await sendWhatsApp(storeData.whatsapp, textMessage);
    } else {
      console.warn('Webhook / WAHA: Store WhatsApp number missing or store query error:', storeError, storeData);
    }
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.selectedSize || item.selectedColor
        ? `${item.name} (${[item.selectedSize ? `Ukuran: ${item.selectedSize}` : '', item.selectedColor ? `Warna: ${item.selectedColor}` : ''].filter(Boolean).join(', ')})`
        : item.name,
      price: item.price,
      quantity: item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    revalidatePath('/admin/pesanan');
    return { success: true, invoiceNumber, orderId: order.id };
  } catch (err) {
    console.error('Create Order Error:', err);
    return { error: 'Gagal membuat pesanan: ' + err.message };
  }
}

export async function getOrders() {
  const cookieStore = await cookies();
  const storeId = cookieStore.get('store_session')?.value;
  if (!storeId) return { error: 'Unauthorized!' };

  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, orders };
  } catch (err) {
    console.error('Get Orders Error:', err);
    return { error: 'Gagal memuat daftar pesanan.' };
  }
}

export async function updateOrderStatus(orderId, status) {
  const cookieStore = await cookies();
  const storeId = cookieStore.get('store_session')?.value;
  if (!storeId) return { error: 'Unauthorized!' };

  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;
    revalidatePath('/admin/pesanan');
    return { success: true };
  } catch (err) {
    console.error('Update Order Status Error:', err);
    return { error: 'Gagal memperbarui status pesanan.' };
  }
}

export async function getOccupiedTables(storeId) {
  try {
    const { data: activeOrders, error } = await supabase
      .from('orders')
      .select('customer_address')
      .eq('store_id', storeId)
      .in('status', ['pending', 'paid', 'ready']);

    if (error) throw error;

    const occupied = activeOrders
      .map((ord) => {
        const match = ord.customer_address.match(/^Meja (\d+)$/);
        return match ? parseInt(match[1]) : null;
      })
      .filter((num) => num !== null);

    return { success: true, occupied };
  } catch (err) {
    console.error('Get Occupied Tables Error:', err);
    return { occupied: [] };
  }
}

// 10. BULK CSV IMPORT ACTIONS
export async function bulkInsertProducts(productsArray) {
  const cookieStore = await cookies();
  const storeId = cookieStore.get('store_session')?.value;
  if (!storeId) return { error: 'Unauthorized!' };

  if (!productsArray || productsArray.length === 0) {
    return { error: 'Tidak ada data produk dalam file CSV!' };
  }

  try {
    const formattedProducts = productsArray.map((row) => ({
      store_id: storeId,
      name: row.nama || row.name || 'Produk Baru',
      price: parseInt((row.harga || row.price || '0').replace(/[^0-9]/g, '')) || 0,
      category: row.kategori || row.category || 'Umum',
      description: row.deskripsi || row.description || '',
      image_url: row.gambar_url || row.image_url || 'https://images.unsplash.com/photo-1544441893-675973e31985',
      status: row.status || 'active'
    }));

    const { error } = await supabase.from('products').insert(formattedProducts);
    if (error) throw error;

    revalidatePath('/admin/produk');
    revalidatePath('/toko/[slug]', 'page');
    return { success: true, count: formattedProducts.length };
  } catch (err) {
    console.error('Bulk Insert Products Error:', err);
    return { error: 'Gagal mengimpor CSV Produk: ' + err.message };
  }
}

export async function bulkInsertJournals(journalsArray) {
  const cookieStore = await cookies();
  const storeId = cookieStore.get('store_session')?.value;
  if (!storeId) return { error: 'Unauthorized!' };

  if (!journalsArray || journalsArray.length === 0) {
    return { error: 'Tidak ada data jurnal dalam file CSV!' };
  }

  try {
    const formattedJournals = journalsArray.map((row) => ({
      store_id: storeId,
      title: row.judul || row.title || 'Artikel Jurnal Baru',
      excerpt: row.kutipan || row.excerpt || '',
      content: row.konten || row.content || '',
      image_url: row.gambar_url || row.image_url || 'https://images.unsplash.com/photo-1544441893-675973e31985'
    }));

    const { error } = await supabase.from('journals').insert(formattedJournals);
    if (error) throw error;

    revalidatePath('/admin/jurnal');
    revalidatePath('/toko/[slug]/jurnal', 'page');
    return { success: true, count: formattedJournals.length };
  } catch (err) {
    console.error('Bulk Insert Journals Error:', err);
    return { error: 'Gagal mengimpor CSV Jurnal: ' + err.message };
  }
}

export async function importProfileFromCSV(profileRow) {
  const cookieStore = await cookies();
  const storeId = cookieStore.get('store_session')?.value;
  if (!storeId) return { error: 'Unauthorized!' };

  try {
    const updateData = {
      tagline: profileRow.tagline || undefined,
      description: profileRow.description || undefined,
      story: profileRow.story || undefined,
      address: profileRow.address || undefined,
      hours: profileRow.hours || undefined,
      whatsapp: profileRow.whatsapp || undefined,
      instagram: profileRow.instagram || undefined,
      tiktok: profileRow.tiktok || undefined,
      facebook: profileRow.facebook || undefined,
      shopeefood: profileRow.shopeefood || undefined,
      gofood: profileRow.gofood || undefined,
      grabfood: profileRow.grabfood || undefined
    };

    // Clean undefined keys
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const { error } = await supabase
      .from('stores')
      .update(updateData)
      .eq('id', storeId);

    if (error) throw error;

    revalidatePath('/admin/profile');
    return { success: true };
  } catch (err) {
    console.error('Import Profile CSV Error:', err);
    return { error: 'Gagal memperbarui profil: ' + err.message };
  }
}

export async function updateOrderProof(orderId, proofUrl) {
  if (!orderId || !proofUrl) return { error: 'Order ID dan URL Bukti Bayar wajib!' };
  try {
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('notes')
      .eq('id', orderId)
      .single();

    if (fetchErr) throw fetchErr;

    const updatedNotes = [order.notes, `Bukti Bayar (Cloudinary): ${proofUrl}`].filter(Boolean).join(' | ');

    const { error: updateErr } = await supabase
      .from('orders')
      .update({ notes: updatedNotes, status: 'paid' })
      .eq('id', orderId);

    if (updateErr) throw updateErr;

    revalidatePath('/admin/pesanan');
    return { success: true };
  } catch (err) {
    console.error('Update Order Proof Error:', err);
    return { error: 'Gagal memperbarui bukti bayar: ' + err.message };
  }
}
