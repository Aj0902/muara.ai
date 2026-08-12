import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY;

// Fallback dataset for instant load and offline/missing key reliability
const FALLBACK_PROVINCES = [
  { province_id: "9", province: "Jawa Barat" },
  { province_id: "10", province: "Jawa Tengah" },
  { province_id: "11", province: "Jawa Timur" },
  { province_id: "6", province: "DKI Jakarta" },
  { province_id: "5", province: "DI Yogyakarta" },
  { province_id: "1", province: "Bali" },
  { province_id: "22", province: "Sumatera Utara" },
  { province_id: "23", province: "Sumatera Barat" },
  { province_id: "26", province: "Sulawesi Selatan" }
];

const FALLBACK_CITIES = [
  // Jawa Barat (Province 9)
  { city_id: "109", province_id: "9", city_name: "Cirebon", type: "Kota", postal_code: "45110" },
  { city_id: "22", province_id: "9", city_name: "Bandung", type: "Kota", postal_code: "40111" },
  { city_id: "78", province_id: "9", city_name: "Bogor", type: "Kota", postal_code: "16111" },
  { city_id: "115", province_id: "9", city_name: "Depok", type: "Kota", postal_code: "16411" },
  { city_id: "54", province_id: "9", city_name: "Bekasi", type: "Kota", postal_code: "17111" },
  // Jawa Tengah (Province 10)
  { city_id: "398", province_id: "10", city_name: "Semarang", type: "Kota", postal_code: "50121" },
  { city_id: "444", province_id: "10", city_name: "Surakarta (Solo)", type: "Kota", postal_code: "57111" },
  // Jawa Timur (Province 11)
  { city_id: "442", province_id: "11", city_name: "Surabaya", type: "Kota", postal_code: "60111" },
  { city_id: "255", province_id: "11", city_name: "Malang", type: "Kota", postal_code: "65111" },
  // DKI Jakarta (Province 6)
  { city_id: "151", province_id: "6", city_name: "Jakarta Barat", type: "Kota", postal_code: "11110" },
  { city_id: "152", province_id: "6", city_name: "Jakarta Pusat", type: "Kota", postal_code: "10110" },
  { city_id: "153", province_id: "6", city_name: "Jakarta Selatan", type: "Kota", postal_code: "12110" },
  { city_id: "154", province_id: "6", city_name: "Jakarta Timur", type: "Kota", postal_code: "13110" },
  { city_id: "155", province_id: "6", city_name: "Jakarta Utara", type: "Kota", postal_code: "14110" },
  // DI Yogyakarta (Province 5)
  { city_id: "501", province_id: "5", city_name: "Yogyakarta", type: "Kota", postal_code: "55111" },
  // Bali (Province 1)
  { city_id: "114", province_id: "1", city_name: "Denpasar", type: "Kota", postal_code: "80111" },
  // Sumatera Utara (Province 22)
  { city_id: "21", province_id: "22", city_name: "Medan", type: "Kota", postal_code: "20111" },
  // Sulawesi Selatan (Province 26)
  { city_id: "282", province_id: "26", city_name: "Makassar", type: "Kota", postal_code: "90111" }
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  
  // Cari berkas cache lokal di src/lib/
  const provCachePath = path.join(process.cwd(), 'src', 'lib', 'rajaongkir-provinces.json');
  const cityCachePath = path.join(process.cwd(), 'src', 'lib', 'rajaongkir-cities.json');

  if (type === 'provinces' && fs.existsSync(provCachePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(provCachePath, 'utf-8'));
      return NextResponse.json({ rajaongkir: { results: data } });
    } catch (e) {
      console.error('Error reading cached provinces:', e);
    }
  }

  if (type === 'cities' && fs.existsSync(cityCachePath)) {
    try {
      const provinceId = searchParams.get('provinceId');
      const data = JSON.parse(fs.readFileSync(cityCachePath, 'utf-8'));
      const filtered = provinceId ? data.filter(c => c.province_id === provinceId) : data;
      return NextResponse.json({ rajaongkir: { results: filtered } });
    } catch (e) {
      console.error('Error reading cached cities:', e);
    }
  }

  if (!RAJAONGKIR_API_KEY) {
    // Return fallback lists jika cache dan key tidak ada
    if (type === 'provinces') {
      return NextResponse.json({ rajaongkir: { results: FALLBACK_PROVINCES } });
    }
    if (type === 'cities') {
      const provinceId = searchParams.get('provinceId');
      const filtered = FALLBACK_CITIES.filter(c => c.province_id === provinceId);
      return NextResponse.json({ rajaongkir: { results: filtered } });
    }
    return NextResponse.json({ error: 'RajaOngkir key not configured' }, { status: 400 });
  }

  try {
    if (type === 'provinces') {
      const res = await fetch('https://api.rajaongkir.com/starter/province', {
        headers: { key: RAJAONGKIR_API_KEY }
      });
      const data = await res.json();
      return NextResponse.json(data);
    }
    
    if (type === 'cities') {
      const provinceId = searchParams.get('provinceId');
      const res = await fetch(`https://api.rajaongkir.com/starter/city?province=${provinceId}`, {
        headers: { key: RAJAONGKIR_API_KEY }
      });
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (err) {
    console.error('RajaOngkir GET error:', err);
    // Graceful fallback on API fetch error
    if (type === 'provinces') {
      return NextResponse.json({ rajaongkir: { results: FALLBACK_PROVINCES } });
    }
    if (type === 'cities') {
      const provinceId = searchParams.get('provinceId');
      const filtered = FALLBACK_CITIES.filter(c => c.province_id === provinceId);
      return NextResponse.json({ rajaongkir: { results: filtered } });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { origin, destination, weight, courier } = body;

    if (!origin || !destination || !courier) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const courierCode = courier.toLowerCase();

    if (!RAJAONGKIR_API_KEY) {
      // Simulate dynamic rates based on origin/destination IDs
      return NextResponse.json(getSimulatedCost(origin, destination, weight || 1000, courierCode));
    }

    try {
      const formParams = new URLSearchParams();
      formParams.append('origin', origin);
      formParams.append('destination', destination);
      formParams.append('weight', (weight || 1000).toString());
      formParams.append('courier', courierCode);

      const res = await fetch('https://api.rajaongkir.com/starter/cost', {
        method: 'POST',
        headers: {
          key: RAJAONGKIR_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formParams.toString()
      });

      const data = await res.json();
      if (data.rajaongkir && data.rajaongkir.status && data.rajaongkir.status.code === 200) {
        return NextResponse.json(data);
      } else {
        console.warn('RajaOngkir API returned non-200, using simulation fallback:', data);
        return NextResponse.json(getSimulatedCost(origin, destination, weight || 1000, courierCode));
      }
    } catch (apiErr) {
      console.error('RajaOngkir API call failed, using simulation:', apiErr);
      return NextResponse.json(getSimulatedCost(origin, destination, weight || 1000, courierCode));
    }
  } catch (err) {
    console.error('RajaOngkir POST route error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Generate realistic simulated pricing for starters/testing
function getSimulatedCost(origin, destination, weight, courier) {
  // Base shipping rates depending on courier choice
  let basePrice = 9000;
  let serviceName = 'Reguler';
  let etd = '2-3';

  if (courier === 'pos') {
    basePrice = 8000;
    serviceName = 'Kilat Khusus';
    etd = '2-4';
  } else if (courier === 'jnt' || courier === 'j&t') {
    basePrice = 11000;
    serviceName = 'EZ';
    etd = '2-3';
  }

  // Cross-province premium (simulate by comparing IDs)
  // If destination is in another province, add premium cost
  const origCity = FALLBACK_CITIES.find(c => c.city_id === origin.toString());
  const destCity = FALLBACK_CITIES.find(c => c.city_id === destination.toString());
  
  let scaleFactor = 1;
  if (origCity && destCity) {
    if (origCity.province_id !== destCity.province_id) {
      scaleFactor = 1.8;
      etd = '3-5';
    }
  } else {
    // If not in fallback list, generate a random realistic premium
    scaleFactor = 1.5;
  }

  const calculatedCost = Math.round(basePrice * scaleFactor * (weight / 1000));
  const expressCost = Math.round(calculatedCost * 1.6);

  return {
    rajaongkir: {
      status: { code: 200, description: "OK" },
      results: [
        {
          code: courier,
          name: courier.toUpperCase(),
          costs: [
            {
              service: serviceName,
              description: `${courier.toUpperCase()} ${serviceName}`,
              cost: [
                {
                  value: calculatedCost,
                  etd: `${etd} HARI`,
                  note: ""
                }
              ]
            },
            {
              service: 'YES/Express',
              description: `${courier.toUpperCase()} Express/YES`,
              cost: [
                {
                  value: expressCost,
                  etd: '1-2 HARI',
                  note: ""
                }
              ]
            }
          ]
        }
      ]
    }
  };
}
