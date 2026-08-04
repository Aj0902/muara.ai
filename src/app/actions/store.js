'use server';

import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

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
