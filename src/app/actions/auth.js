'use server';

import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

// Helper untuk membuat slug URL dari nama toko
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// 1. Registrasi Akun Toko Baru
export async function registerStore(formData) {
  const username = formData.get('username')?.trim();
  const password = formData.get('password');
  const storeName = formData.get('storeName')?.trim();
  const category = formData.get('category'); // 'kuliner', 'fashion', 'kriya'

  if (!username || !password || !storeName || !category) {
    return { error: 'Semua kolom pendaftaran wajib diisi!' };
  }

  const slug = generateSlug(storeName);

  try {
    // Cek apakah username sudah dipakai
    const { data: existingUser } = await supabase
      .from('stores')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return { error: 'Username sudah digunakan, coba username lain!' };
    }

    // Cek apakah slug toko sudah dipakai
    const { data: existingSlug } = await supabase
      .from('stores')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingSlug) {
      return { error: 'Nama toko sudah terdaftar, harap gunakan nama toko unik!' };
    }

    // Insert toko baru ke database
    const logoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(storeName)}&background=C2410C&color=fff&size=150`;
    const { data: newStore, error } = await supabase
      .from('stores')
      .insert({
        username,
        password_hash: password, // simple hash untuk MVP
        name: storeName,
        slug,
        category,
        logo_url: logoUrl,
        tagline: 'Selamat datang di toko kami!',
        description: 'Edit profil toko Anda di dashboard admin.',
        hours: 'Senin - Minggu: 09.00 - 21.00 WIB'
      })
      .select()
      .single();

    if (error) {
      console.error('Registration DB Error:', error);
      return { error: 'Terjadi kesalahan database saat mendaftar: ' + error.message };
    }

    // Set cookie session (berlaku 7 hari)
    const cookieStore = await cookies();
    cookieStore.set('store_session', newStore.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: 'lax'
    });

    return { success: true, redirect: '/admin' };
  } catch (err) {
    console.error('Registration Exception:', err);
    return { error: 'Terjadi kesalahan sistem saat mendaftar!' };
  }
}

// 2. Login Toko
export async function loginStore(formData) {
  const username = formData.get('username')?.trim();
  const password = formData.get('password');

  if (!username || !password) {
    return { error: 'Username dan Password wajib diisi!' };
  }

  // Bypass login Super Admin
  if (username === 'superadmin' && password === 'super123') {
    const cookieStore = await cookies();
    cookieStore.set('super_session', 'active', {
      path: '/',
      maxAge: 60 * 60 * 24,
      httpOnly: true
    });
    return { success: true, redirect: '/super-admin' };
  }

  try {
    // Cari toko berdasarkan username dan password_hash (simple password check)
    const { data: store, error } = await supabase
      .from('stores')
      .select('*')
      .eq('username', username)
      .eq('password_hash', password)
      .maybeSingle();

    if (error) {
      console.error('Login DB Error:', error);
      return { error: 'Database error: ' + error.message };
    }

    if (!store) {
      return { error: 'Username atau Password salah!' };
    }

    // Set cookie session
    const cookieStore = await cookies();
    cookieStore.set('store_session', store.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: 'lax'
    });

    return { success: true, redirect: '/admin' };
  } catch (err) {
    console.error('Login Exception:', err);
    return { error: 'Terjadi kesalahan sistem saat masuk!' };
  }
}

// 3. Logout Toko & Super Admin
export async function logoutStore() {
  const cookieStore = await cookies();
  cookieStore.delete('store_session');
  cookieStore.delete('super_session');
  return { success: true, redirect: '/login' };
}

// 4. Dapatkan data toko login saat ini
export async function getCurrentStore() {
  try {
    const cookieStore = await cookies();
    const storeId = cookieStore.get('store_session')?.value;

    if (!storeId) return null;

    const { data: store } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .maybeSingle();

    return store || null;
  } catch (err) {
    console.error('Get Current Store Error:', err);
    return null;
  }
}

// 5. Impersonate (Super Admin login sebagai toko tertentu)
export async function impersonateStore(storeId) {
  try {
    const cookieStore = await cookies();
    // Cek apakah superadmin aktif
    const isSuper = cookieStore.get('super_session')?.value === 'active';
    if (!isSuper) return { error: 'Unauthorized!' };

    cookieStore.set('store_session', storeId, {
      path: '/',
      maxAge: 60 * 60 * 24, // 1 hari
      httpOnly: true
    });

    return { success: true, redirect: '/admin' };
  } catch (err) {
    console.error('Impersonate Error:', err);
    return { error: 'Gagal melakukan impersonasi.' };
  }
}
