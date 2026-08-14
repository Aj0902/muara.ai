import Papa from 'papaparse';

export function parseCSVFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (err) => {
        reject(err);
      }
    });
  });
}

export function downloadCSVTemplate(type, category = 'kuliner') {
  let headers = [];
  let sampleRow = {};
  let filename = 'template.csv';

  if (type === 'products') {
    filename = `template_produk_${category}.csv`;
    headers = ['nama', 'harga', 'kategori', 'deskripsi', 'gambar_url', 'status'];
    sampleRow = {
      nama: category === 'fashion' ? 'Koleksi Fashion Eksklusif' : category === 'kriya' ? 'Karya Kriya Buatan Tangan' : 'Sajian Kuliner Spesial',
      harga: category === 'fashion' ? '250000' : category === 'kriya' ? '350000' : '25000',
      kategori: category === 'fashion' ? 'Produk Fashion' : category === 'kriya' ? 'Karya Kriya' : 'Makanan/Kuliner',
      deskripsi: category === 'fashion' ? 'Produk fashion berkualitas tinggi dengan bahan pilihan' : category === 'kriya' ? 'Kerajinan tangan berkualitas dengan finishing presisi' : 'Sajian lezat diproses higienis dari bahan baku segar',
      gambar_url: 'https://images.unsplash.com/photo-1544441893-675973e31985',
      status: 'active'
    };
  } else if (type === 'journals') {
    filename = `template_jurnal_${category}.csv`;
    headers = ['judul', 'kutipan', 'konten', 'gambar_url'];
    sampleRow = {
      judul: 'Kisah Warisan dan Tradisi Khas Cirebon',
      kutipan: 'Menjelajahi keaslian karya warisan budaya yang diwariskan secara turun temurun.',
      konten: 'Setiap karya dan produk yang dihasilkan melalui proses panjang penuh ketelitian dan kecintaan terhadap seni lokal...',
      gambar_url: 'https://images.unsplash.com/photo-1544441893-675973e31985'
    };
  } else if (type === 'profile') {
    filename = `template_profil_toko.csv`;
    headers = ['tagline', 'description', 'story', 'address', 'hours', 'whatsapp', 'instagram', 'tiktok', 'facebook', 'shopeefood', 'gofood', 'grabfood'];
    sampleRow = {
      tagline: 'Warisan Seni & Kualitas Otentik Cirebon',
      description: 'Menyediakan produk berkualitas tinggi dengan pelayanan hangat dan harga terjangkau.',
      story: 'Didirikan sejak tahun 2010 dengan semangat memberdayakan pengrajin dan melestarikan budaya.',
      address: 'Jl. Cipto Mangunkusumo No. 123, Cirebon, Jawa Barat',
      hours: '08.00 - 21.00 WIB',
      whatsapp: '081234567890',
      instagram: 'https://instagram.com/tokoanda',
      tiktok: 'https://tiktok.com/@tokoanda',
      facebook: 'https://facebook.com/tokoanda',
      shopeefood: 'https://shopee.co.id/tokoanda',
      gofood: 'https://tokopedia.com/tokoanda',
      grabfood: 'https://lazada.co.id/shop/tokoanda'
    };
  }

  const csvContent = Papa.unparse({
    fields: headers,
    data: [sampleRow]
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
