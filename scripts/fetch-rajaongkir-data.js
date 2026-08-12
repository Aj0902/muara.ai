const fs = require('fs');
const path = require('path');
const https = require('https');

// Membaca API Key dari parameter CLI atau berkas .env.local
let apiKey = process.argv[2];

if (!apiKey) {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const match = envContent.match(/^RAJAONGKIR_API_KEY\s*=\s*(.*)$/m);
      if (match && match[1]) {
        apiKey = match[1].trim().replace(/['"]/g, '');
      }
    }
  } catch (e) {
    console.error('Gagal membaca .env.local:', e);
  }
}

if (!apiKey) {
  console.error('\x1b[31mError: API Key RajaOngkir tidak ditemukan!\x1b[0m');
  console.log('Silakan jalankan script ini dengan argumen API Key Anda, contoh:');
  console.log('  \x1b[36mnode scripts/fetch-rajaongkir-data.js KUNCI_API_ANDA\x1b[0m');
  console.log('Atau tambahkan RAJAONGKIR_API_KEY ke berkas .env.local Anda.');
  process.exit(1);
}

console.log('Memulai pengambilan data wilayah dari RajaOngkir...');

// Helper https.get berbasis Promise untuk menghindari issue fetch IPv6 di Node.js
function httpsGet(url, headers) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: headers }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP Status Code: ${res.statusCode}`));
        return;
      }
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(rawData);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Gagal parse JSON: ${e.message}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function run() {
  try {
    const headers = { key: apiKey };

    // 1. Fetch Provinces
    console.log('Mengambil daftar provinsi (RajaOngkir)...');
    const provData = await httpsGet('https://api.rajaongkir.com/starter/province', headers);
    
    if (!provData.rajaongkir || provData.rajaongkir.status.code !== 200) {
      throw new Error(`Gagal mengambil provinsi: ${provData.rajaongkir?.status?.description || 'Response Error'}`);
    }
    
    const provinces = provData.rajaongkir.results;
    console.log(`Berhasil mengambil ${provinces.length} provinsi.`);

    // 2. Fetch Cities
    console.log('Mengambil daftar kota/kabupaten (RajaOngkir)...');
    const cityData = await httpsGet('https://api.rajaongkir.com/starter/city', headers);
    
    if (!cityData.rajaongkir || cityData.rajaongkir.status.code !== 200) {
      throw new Error(`Gagal mengambil kota: ${cityData.rajaongkir?.status?.description || 'Response Error'}`);
    }
    
    const cities = cityData.rajaongkir.results;
    console.log(`Berhasil mengambil ${cities.length} kota/kabupaten.`);

    // 3. Save JSON Files to src/lib
    const libDir = path.join(__dirname, '..', 'src', 'lib');
    if (!fs.existsSync(libDir)) {
      fs.mkdirSync(libDir, { recursive: true });
    }

    const provPath = path.join(libDir, 'rajaongkir-provinces.json');
    const cityPath = path.join(libDir, 'rajaongkir-cities.json');

    fs.writeFileSync(provPath, JSON.stringify(provinces, null, 2), 'utf-8');
    fs.writeFileSync(cityPath, JSON.stringify(cities, null, 2), 'utf-8');

    console.log('\n\x1b[32m✓ Sukses! File wilayah berhasil disimpan:\x1b[0m');
    console.log(`  - Provinsi: ${provPath}`);
    console.log(`  - Kota: ${cityPath}`);
    console.log('\nWilayah kini akan dimuat INSTAN di dashboard dan checkout storefront tanpa memakan kuota API!');

  } catch (error) {
    console.error('\n\x1b[31mTerjadi kesalahan saat fetch data:\x1b[0m');
    console.error(error.message);
    process.exit(1);
  }
}

run();
