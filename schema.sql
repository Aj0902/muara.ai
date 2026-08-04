-- =======================================================
-- SKEMA SQL UNTUK CMS MULTI-TENANT UMKM
-- Jalankan skema ini di SQL Editor Supabase Anda
-- =======================================================

-- 1. Bersihkan tabel jika sudah ada (Opsional untuk Reset)
drop table if exists journals cascade;
drop table if exists gallery cascade;
drop table if exists products cascade;
drop table if exists categories cascade;
drop table if exists stores cascade;

-- 2. Tabel Akun Toko / Merchant
create table stores (
  id uuid default gen_random_uuid() primary key,
  username text unique not null,
  password_hash text not null, -- Sandi disimpan aman (hash sederhana untuk MVP)
  slug text unique not null,
  name text not null,          -- Nama Toko
  category text not null check (category in ('kuliner', 'fashion', 'kriya')),
  
  -- Info Profil Toko
  tagline text,
  description text,
  story text,
  address text,
  maps_link text,
  whatsapp text,
  hours text,
  instagram text,
  tiktok text,
  facebook text,
  shopeefood text,
  gofood text,
  grabfood text,
  logo_url text,
  hero_url text,
  about_url text,
  
  -- Konfigurasi Chatbot AI (Phase 2)
  chatbot_name text default 'Asisten AI',
  chatbot_persona text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabel Kategori Produk / Menu
create table categories (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tabel Produk / Menu Jualan
create table products (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  price numeric not null,
  description text,
  image_url text,
  status text default 'tersedia' check (status in ('tersedia', 'terbatas', 'habis')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Tabel Galeri Foto Bento Grid
create table gallery (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  image_url text not null,
  caption text,
  display_order int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Tabel Jurnal Cerita / Blog UMKM
create table journals (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  title text not null,
  content text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =======================================================
-- MOCK DATA AWAL (Jamblang Cipto - Kuliner)
-- =======================================================

-- Masukkan data toko mock (Password: "cipto123", hash sederhana "cipto123" untuk testing MVP)
insert into stores (id, username, password_hash, slug, name, category, tagline, description, story, address, maps_link, whatsapp, hours, logo_url, hero_url, about_url)
values (
  'a3b194d4-28b3-4fde-ba46-0b1e428bcbf9',
  'jamblangcipto',
  'cipto123', -- simple password check
  'jamblang-cipto',
  'Jamblang Cipto',
  'kuliner',
  'Legenda Rasa dari Balik Daun Jati',
  'Warisan rasa otentik yang dibungkus kearifan lokal sejak puluhan tahun silam.',
  'Bukan sekadar mengenyangkan. Nasi Jamblang Cipto adalah warisan rasa otentik yang dibungkus kearifan lokal sejak puluhan tahun silam di Kota Cirebon. Resep cumi tinta hitam dan sate kentang kami telah dijaga selama tiga generasi untuk menjaga keaslian cita rasa kuliner tradisional Cirebon.',
  'Jl. Cipto Mangunkusumo No. 12, Kesambi, Kota Cirebon, Jawa Barat 45131',
  'https://maps.google.com/?q=Jl.+Cipto+Mangunkusumo+No.12,+Cirebon',
  '081234567890',
  'Senin - Minggu: 08.00 - 22.00 WIB',
  'https://ui-avatars.com/api/?name=Jamblang+Cipto&background=C2410C&color=fff&size=150',
  'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=800&q=80',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80'
);

-- Masukkan Kategori Mock
insert into categories (id, store_id, name) values 
('c001f3c3-1d04-4530-80de-c793ff00c011', 'a3b194d4-28b3-4fde-ba46-0b1e428bcbf9', 'Seafood'),
('c002f3c3-1d04-4530-80de-c793ff00c012', 'a3b194d4-28b3-4fde-ba46-0b1e428bcbf9', 'Lauk Pendamping'),
('c003f3c3-1d04-4530-80de-c793ff00c013', 'a3b194d4-28b3-4fde-ba46-0b1e428bcbf9', 'Minuman');

-- Masukkan Produk Mock
insert into products (store_id, category_id, name, price, description, image_url, status) values
('a3b194d4-28b3-4fde-ba46-0b1e428bcbf9', 'c001f3c3-1d04-4530-80de-c793ff00c011', 'Balakutak Hideung', 25000, 'Cumi sotong utuh segar yang dimasak perlahan bersama tinta hitam aslinya, menghasilkan rasa gurih legit yang tiada duanya.', 'https://images.unsplash.com/photo-1544025162-811114215755?w=500&q=80', 'tersedia'),
('a3b194d4-28b3-4fde-ba46-0b1e428bcbf9', 'c002f3c3-1d04-4530-80de-c793ff00c012', 'Sate Kentang', 10000, 'Kentang bulat mini pilihan yang direbus empuk lalu dimasak dengan balutan bumbu kecap manis gurih khas Cirebonan.', 'https://images.unsplash.com/photo-1627308595229-7830f5c9099f?w=500&q=80', 'tersedia'),
('a3b194d4-28b3-4fde-ba46-0b1e428bcbf9', 'c003f3c3-1d04-4530-80de-c793ff00c013', 'Es Teh Manis Daun Jati', 5000, 'Es teh segar aromatik dengan pemanis gula batu asli, disajikan dingin menyegarkan.', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80', 'tersedia');

-- Masukkan Galeri Mock
insert into gallery (store_id, image_url, caption, display_order) values
('a3b194d4-28b3-4fde-ba46-0b1e428bcbf9', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80', 'Sajian Nasi Jamblang Daun Jati Segar', 1),
('a3b194d4-28b3-4fde-ba46-0b1e428bcbf9', 'https://images.unsplash.com/photo-1596627581971-50e5015383ea?w=600&q=80', 'Dapur Tradisional dengan Kayu Bakar', 2),
('a3b194d4-28b3-4fde-ba46-0b1e428bcbf9', 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600&q=80', 'Bumbu Rempah Pilihan Cirebonan', 3),
('a3b194d4-28b3-4fde-ba46-0b1e428bcbf9', 'https://images.unsplash.com/photo-1626804475297-41609ea0aa4d?w=600&q=80', 'Suasana Ramai Pengunjung di Jam Makan Siang', 4);

-- Masukkan Jurnal Mock
insert into journals (store_id, title, content, image_url) values
(
  'a3b194d4-28b3-4fde-ba46-0b1e428bcbf9',
  'Kisah di Balik Resep Rahasia Keluarga Kami',
  'Mengapa Nasi Jamblang dibungkus daun jati? Bukan cuma biar estetis, tapi daun jati memiliki pori-pori alami yang menjaga nasi tetap hangat namun tidak cepat basi. Warisan cara bungkus inilah yang kami pertahankan hingga kini...',
  'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80'
),
(
  'a3b194d4-28b3-4fde-ba46-0b1e428bcbf9',
  'Memilih Bahan Baku Langsung dari Nelayan Cirebon',
  'Untuk menu Balakutak Hideung, kualitas cumi adalah nomor satu. Setiap subuh, tim kami pergi langsung ke pelabuhan nelayan Kejawanan Cirebon untuk memastikan cumi yang didapatkan benar-benar segar dan tintanya utuh...',
  'https://images.unsplash.com/photo-1596627581971-50e5015383ea?w=800&q=80'
);

-- =======================================================
-- PERSIPAN PHASE 2: TRANSAKSI & PELACAKAN (n8n Webhook)
-- =======================================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, paid, shipping, completed, canceled
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(200) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE chat_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    session_id UUID NOT NULL, -- Di-generate unik di sisi client per pembeli
    sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'ai')),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chat_logs_session ON chat_logs(store_id, session_id);

CREATE TABLE special_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    notes TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, dihubungi, selesai
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_special_orders_store ON special_orders(store_id);
