// Bypass SSL certificate check for downloading the offline SQL dump
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const fs = require('fs');
const path = require('path');
const https = require('https');

const SQL_URL = 'https://raw.githubusercontent.com/cahyadsn/db_rajaongkir/master/db_rajaongkir.sql';

console.log('Mengunduh database wilayah RajaOngkir dari GitHub...');

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Gagal mengunduh: status ${res.statusCode}`));
        return;
      }
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => resolve(rawData));
    }).on('error', (err) => reject(err));
  });
}

async function run() {
  try {
    const sqlContent = await httpsGet(SQL_URL);
    console.log('Database terunduh. Memulai parsing...');

    const cities = [];

    // Provinsi RajaOngkir Starter resmi:
    const OFFICIAL_PROVINCES = [
      { province_id: "1", province: "Bali" },
      { province_id: "2", province: "Bangka Belitung" },
      { province_id: "3", province: "Banten" },
      { province_id: "4", province: "Bengkulu" },
      { province_id: "5", province: "DI Yogyakarta" },
      { province_id: "6", province: "DKI Jakarta" },
      { province_id: "7", province: "Gorontalo" },
      { province_id: "8", province: "Jambi" },
      { province_id: "9", province: "Jawa Barat" },
      { province_id: "10", province: "Jawa Tengah" },
      { province_id: "11", province: "Jawa Timur" },
      { province_id: "12", province: "Kalimantan Barat" },
      { province_id: "13", province: "Kalimantan Selatan" },
      { province_id: "14", province: "Kalimantan Tengah" },
      { province_id: "15", province: "Kalimantan Timur" },
      { province_id: "16", province: "Kalimantan Utara" },
      { province_id: "17", province: "Kepulauan Riau" },
      { province_id: "18", province: "Lampung" },
      { province_id: "19", province: "Maluku" },
      { province_id: "20", province: "Maluku Utara" },
      { province_id: "21", province: "Nanggroe Aceh Darussalam (NAD)" },
      { province_id: "22", province: "Nusa Tenggara Barat (NTB)" },
      { province_id: "23", province: "Nusa Tenggara Timur (NTT)" },
      { province_id: "24", province: "Papua" },
      { province_id: "25", province: "Papua Barat" },
      { province_id: "26", province: "Riau" },
      { province_id: "27", province: "Sulawesi Barat" },
      { province_id: "28", province: "Sulawesi Selatan" },
      { province_id: "29", province: "Sulawesi Tengah" },
      { province_id: "30", province: "Sulawesi Tenggara" },
      { province_id: "31", province: "Sulawesi Utara" },
      { province_id: "32", province: "Sumatera Barat" },
      { province_id: "33", province: "Sumatera Selatan" },
      { province_id: "34", province: "Sumatera Utara" }
    ];

    const provinceMap = {};
    OFFICIAL_PROVINCES.forEach(p => {
      provinceMap[p.province_id] = p.province;
    });

    // Parse Cities dari INSERT INTO tb_ro_cities
    // Format baris: (city_id, province_id, 'city_name', 'postal_code')
    // Contoh: (1, 21, 'Kabupaten Aceh Barat', '23681'),
    const cityMatches = sqlContent.match(/\(\d+,\s*\d+,\s*'[^']+',\s*'\d+'\)/g);
    
    if (cityMatches) {
      cityMatches.forEach(match => {
        const clean = match.replace(/[\(\)]/g, '');
        const parts = clean.split(/,\s*/);
        const city_id = parts[0].trim();
        const province_id = parts[1].trim();
        let fullCityName = parts[2].replace(/'/g, '').trim();
        const postal_code = parts[3].replace(/'/g, '').trim();

        let type = 'Kabupaten';
        let city_name = fullCityName;

        if (fullCityName.startsWith('Kabupaten ')) {
          type = 'Kabupaten';
          city_name = fullCityName.replace('Kabupaten ', '');
        } else if (fullCityName.startsWith('Kota ')) {
          type = 'Kota';
          city_name = fullCityName.replace('Kota ', '');
        }

        const provinceName = provinceMap[province_id] || '';

        cities.push({
          city_id: city_id,
          province_id: province_id,
          province: provinceName,
          type: type,
          city_name: city_name,
          postal_code: postal_code
        });
      });
    }

    console.log(`Berhasil mem-parse ${OFFICIAL_PROVINCES.length} provinsi.`);
    console.log(`Berhasil mem-parse ${cities.length} kota/kabupaten.`);

    if (cities.length === 0) {
      throw new Error('Gagal mem-parse kota dari file SQL. Format tidak sesuai.');
    }

    const libDir = path.join(__dirname, '..', 'src', 'lib');
    if (!fs.existsSync(libDir)) {
      fs.mkdirSync(libDir, { recursive: true });
    }

    const provPath = path.join(libDir, 'rajaongkir-provinces.json');
    const cityPath = path.join(libDir, 'rajaongkir-cities.json');

    fs.writeFileSync(provPath, JSON.stringify(OFFICIAL_PROVINCES, null, 2), 'utf-8');
    fs.writeFileSync(cityPath, JSON.stringify(cities, null, 2), 'utf-8');

    console.log('\n\x1b[32m✓ Sukses! File wilayah berhasil digenerate secara offline:\x1b[0m');
    console.log(`  - Provinsi: ${provPath}`);
    console.log(`  - Kota: ${cityPath}`);
    console.log('\nWilayah kini sudah lengkap se-Indonesia dan berjalan tanpa hambatan!');

  } catch (err) {
    console.error('\n\x1b[31mTerjadi kesalahan saat generate data:\x1b[0m');
    console.error(err.message);
    process.exit(1);
  }
}

run();
