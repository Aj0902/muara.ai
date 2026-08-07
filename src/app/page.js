import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#070D1E] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* 🌟 Batik Megamendung Corner SVG Ornament - Top Right */}
      <div className="absolute top-0 right-0 w-72 sm:w-96 md:w-[480px] pointer-events-none opacity-20 dark:opacity-30 z-0">
        <svg viewBox="0 0 500 350" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M500 0H200C250 50 220 120 180 150C130 180 160 260 240 240C320 220 380 300 450 350H500V0Z" fill="url(#batik-gold)" />
          <path d="M480 0H280C320 40 300 90 260 120C220 150 240 210 300 200C360 190 410 250 480 300V0Z" stroke="#38BDF8" strokeWidth="3" fill="none" opacity="0.6" />
          <path d="M450 0H350C380 30 360 70 330 90C300 110 310 160 360 150C410 140 440 190 480 230V0Z" stroke="#F59E0B" strokeWidth="2" fill="none" opacity="0.4" />
          <defs>
            <linearGradient id="batik-gold" x1="200" y1="0" x2="500" y2="350" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1E1B4B" />
              <stop offset="0.5" stopColor="#0F172A" />
              <stop offset="1" stopColor="#F59E0B" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 🌟 Batik Megamendung Corner SVG Ornament - Bottom Left */}
      <div className="absolute bottom-0 left-0 w-72 sm:w-96 md:w-[480px] pointer-events-none opacity-20 dark:opacity-30 z-0">
        <svg viewBox="0 0 500 350" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto rotate-180">
          <path d="M500 0H200C250 50 220 120 180 150C130 180 160 260 240 240C320 220 380 300 450 350H500V0Z" fill="url(#batik-cyan)" />
          <path d="M480 0H280C320 40 300 90 260 120C220 150 240 210 300 200C360 190 410 250 480 300V0Z" stroke="#F59E0B" strokeWidth="3" fill="none" opacity="0.6" />
          <defs>
            <linearGradient id="batik-cyan" x1="200" y1="0" x2="500" y2="350" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0369A1" />
              <stop offset="0.7" stopColor="#0F172A" />
              <stop offset="1" stopColor="#38BDF8" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-10 w-[400px] h-[300px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none"></div>

      {/* Navbar */}
      <header className="max-w-7xl mx-auto w-full px-6 sm:px-8 h-24 flex items-center justify-between z-10 border-b border-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-amber-500 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#070D1E] rounded-[10px] flex items-center justify-center font-serif text-cyan-400 font-bold text-xl">
              M
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-white font-serif">Muara<span className="text-cyan-400">.ai</span></span>
            <span className="block text-[9px] uppercase tracking-widest text-amber-400/80 font-mono">Digital UMKM Engine</span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/register"
            className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20"
          >
            Daftar Toko Gratis
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 sm:px-8 flex flex-col items-center justify-center text-center py-12 sm:py-16 z-10 space-y-8">
        
        {/* Challenge Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/40 text-amber-300 text-[10px] sm:text-xs font-mono shadow-md backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          AI Bootcamp Impactpreneur Business Challenge • AI Solutions for SMEs
        </div>

        {/* Main Headline */}
        <div className="space-y-4 max-w-4xl">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-white tracking-tight leading-[1.15]">
            Muara Digital UMKM: Mengubah Trafik Medsos Menjadi{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-400 bg-clip-text text-transparent italic">
              Penjualan & Operasional Otomatis
            </span>{' '}
            Berbasis AI
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed">
            Subtopik Utama: <span className="text-slate-200 font-medium">Penjualan, Layanan Pelanggan & Operasional UMKM</span>
          </p>
        </div>

        {/* Motto & Vision Box */}
        <div className="max-w-3xl w-full bg-slate-900/70 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-md shadow-2xl text-left space-y-3 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-semibold uppercase tracking-wider">
            <span>💬 Motto & Visi Inovasi</span>
          </div>
          <p className="text-slate-200 font-serif italic text-sm sm:text-base border-l-2 border-amber-500 pl-4 py-1">
            &ldquo;Democratizing AI for Local SMEs: Memanusiakan Teknologi, Menguatkan Ekonomi Lokal.&rdquo;
          </p>
          <p className="text-xs text-slate-400 leading-relaxed font-light pl-4">
            <span className="font-semibold text-slate-300">Ahmad Abdul Jalil</span> — &ldquo;Tujuan kami sederhana: mendobrak batasan antara teknologi AI tingkat tinggi dengan kebutuhan operasional harian UMKM. Menjadikan inovasi bukan sekadar pameran teknologi, melainkan mesin penggerak ekonomi rakyat.&rdquo;
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full justify-center max-w-sm sm:max-w-none">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-full font-bold text-sm transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            Mulai Bangun Toko AI
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <a
            href="#demo-showcase"
            className="w-full sm:w-auto px-8 py-4 border border-slate-700 hover:bg-slate-900/80 text-slate-300 hover:text-white rounded-full font-semibold text-sm transition-all text-center"
          >
            Jelajahi Live Demo Toko ⬇️
          </a>
        </div>

        {/* SECTION 1: Problem Statement */}
        <div className="w-full pt-16 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">Jebakan Algoritma Medsos & Ketiadaan Sistem</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">Sebagian besar UMKM terjebak dalam siklus trafik yang tidak berkelanjutan dan pengelolaan bisnis serba manual.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Problem Card 1 */}
            <div className="bg-slate-900/60 border border-red-500/30 p-6 rounded-3xl backdrop-blur-md space-y-4 hover:border-red-500/50 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-lg">#</div>
              <div>
                <h3 className="text-lg font-bold text-white">Terjebak Algoritma Medsos</h3>
                <p className="text-xs text-red-400 font-semibold mt-0.5">Trafik Tinggi tapi Transient (Sementara)</p>
              </div>
              <ul className="space-y-2 text-xs text-slate-400 font-light">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  Tanpa platform terpusat (owned media), trafik viral menguap begitu saja.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  Konten viral gagal dikonversi menjadi database pelanggan setia.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  Sangat rentan terhadap perubahan algoritma media sosial sewaktu-waktu.
                </li>
              </ul>
            </div>

            {/* Problem Card 2 */}
            <div className="bg-slate-900/60 border border-amber-500/30 p-6 rounded-3xl backdrop-blur-md space-y-4 hover:border-amber-500/50 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg">📦</div>
              <div>
                <h3 className="text-lg font-bold text-white">Operasional Tanpa Sistem</h3>
                <p className="text-xs text-amber-400 font-semibold mt-0.5">Proses Serba Manual & Fragmented</p>
              </div>
              <ul className="space-y-2 text-xs text-slate-400 font-light">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">✕</span>
                  Pemasaran, penjualan, & inventoris berjalan manual via WhatsApp / IG DM.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">✕</span>
                  Rawan terjadi lost leads, pesanan terselip, dan respon lambat.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">✕</span>
                  Pelaku UMKM buta data bisnis karena tidak ada rekapitulasi terstruktur.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* SECTION 2: Solusi Inovatif Engine */}
        <div className="w-full pt-16 space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono border border-cyan-500/20">
              ⚡ Solusi Inovatif
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">Muara.ai Engine Platform</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-3 hover:border-cyan-500/40 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">🏛️</div>
              <h3 className="font-bold text-white text-base">Muara Digital Terpusat</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Menyatukan seluruh trafik medsos ke platform Headless CMS & POS milik UMKM sendiri (owned media).
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-3 hover:border-cyan-500/40 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">🤖</div>
              <h3 className="font-bold text-white text-base">Dual-AI Automation</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                AI Sales merekomendasikan cross-selling cerdas di keranjang. AI CS melacak pesanan via 1-kolom invoice 24/7.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-3 hover:border-cyan-500/40 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">🎛️</div>
              <h3 className="font-bold text-white text-base">Adaptif Multi-Kategori</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Alur operasional, formulir checkout, & cetak dokumen menyesuaikan otomatis (Kuliner, Fashion, Kriya).
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: Live Demo Showcase (3 Kategori Kabupaten Cirebon) */}
        <div id="demo-showcase" className="w-full pt-16 space-y-8 scroll-mt-24">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">Live Demo Showcase</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Satu Sistem, 3 Adaptasi Spesifik: Memfasilitasi 3 Sektor Utama UMKM Kabupaten Cirebon (Kuliner, Fashion, Kriya).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            {/* Demo 1: Kuliner */}
            <div className="bg-slate-900/90 border border-emerald-500/30 p-6 rounded-3xl space-y-5 flex flex-col justify-between hover:border-emerald-500/60 transition-all shadow-xl">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl">🍔</span>
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">KULINER</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Kuliner (Jamblang Cipto)</h3>
                  <p className="text-xs text-slate-400">Operasional Restoran & Dine-in</p>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 font-light border-t border-slate-800/80 pt-3">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> Management Meja Dine-in & Status Memasak Real-time
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> Direct Printing Struk Kasir Thermal (80mm / 58mm)
                  </li>
                </ul>
              </div>
              <Link
                href="/toko/jamblang-cipto"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs text-center transition-all shadow-md shadow-emerald-600/20 block"
              >
                Buka Toko Kuliner ➔
              </Link>
            </div>

            {/* Demo 2: Fashion */}
            <div className="bg-slate-900/90 border border-sky-500/30 p-6 rounded-3xl space-y-5 flex flex-col justify-between hover:border-sky-500/60 transition-all shadow-xl">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl">👗</span>
                  <span className="px-2.5 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">FASHION</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Fashion (Busana Trusmi)</h3>
                  <p className="text-xs text-slate-400">Manajemen Ritel & Logistik Batik</p>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 font-light border-t border-slate-800/80 pt-3">
                  <li className="flex items-center gap-2">
                    <span className="text-sky-400">✓</span> Form Alamat Pengiriman & Catatan Ukuran/Warna
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-sky-400">✓</span> Auto Generate Stiker Label Resi Shipping Paket
                  </li>
                </ul>
              </div>
              <Link
                href="/toko/busana-trusmi"
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold text-xs text-center transition-all shadow-md shadow-sky-600/20 block"
              >
                Buka Toko Fashion ➔
              </Link>
            </div>

            {/* Demo 3: Kriya */}
            <div className="bg-slate-900/90 border border-amber-500/30 p-6 rounded-3xl space-y-5 flex flex-col justify-between hover:border-amber-500/60 transition-all shadow-xl">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl">🛠️</span>
                  <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">KRIYA</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Kriya (Rotan Plumbon)</h3>
                  <p className="text-xs text-slate-400">Manajemen Custom & Pre-Order</p>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 font-light border-t border-slate-800/80 pt-3">
                  <li className="flex items-center gap-2">
                    <span className="text-amber-400">✓</span> Spesifikasi Custom Pre-Order (PO) Khusus
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-400">✓</span> Auto-Cetak Surat Perintah Kerja (SPK) Workshop
                  </li>
                </ul>
              </div>
              <Link
                href="/toko/rotan-plumbon"
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold text-xs text-center transition-all shadow-md shadow-amber-600/20 block"
              >
                Buka Toko Kriya ➔
              </Link>
            </div>

          </div>
        </div>

        {/* SECTION 4: Impact & Metrics */}
        <div className="w-full pt-16 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">Dampak Nyata & Skalabilitas UMKM</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">Transformasi Digital Terukur untuk Kemandirian Operasional Bisnis</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-2">
              <h4 className="text-3xl sm:text-4xl font-extrabold text-cyan-400 font-mono">100%</h4>
              <p className="text-xs font-bold text-white uppercase tracking-wider">OWNED DATA</p>
              <p className="text-[10px] text-slate-400">Bebas & lepas dari ketergantungan penuh algoritma medsos.</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-2">
              <h4 className="text-3xl sm:text-4xl font-extrabold text-cyan-400 font-mono">3x</h4>
              <p className="text-xs font-bold text-white uppercase tracking-wider">KONVERSI SALES</p>
              <p className="text-[10px] text-slate-400">Trafik sosial media dikonversi jadi transaksi terstruktur instan.</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-2">
              <h4 className="text-3xl sm:text-4xl font-extrabold text-cyan-400 font-mono">-70%</h4>
              <p className="text-xs font-bold text-white uppercase tracking-wider">BEBAN ADMIN</p>
              <p className="text-[10px] text-slate-400">Otomasi penuh CS & tracking pesanan otomatis 24/7.</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-2">
              <h4 className="text-xl sm:text-2xl font-extrabold text-amber-400 font-mono mt-2">&lt;1KB</h4>
              <p className="text-xs font-bold text-white uppercase tracking-wider">COST / CHAT</p>
              <p className="text-[10px] text-slate-400">Agentic tool-calling ultra efisien dengan payload &lt;1KB.</p>
            </div>
          </div>

          {/* Banner Callout */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-cyan-500/30 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 text-left shadow-2xl">
            <div className="space-y-2 max-w-xl">
              <h3 className="text-xl font-serif font-bold text-white">Saatnya UMKM <span className="text-cyan-400">Naik Kelas</span> dengan AI</h3>
              <p className="text-xs text-slate-400 font-light">
                Mengubah setiap interaksi sosial media menjadi pertumbuhan bisnis yang terukur & terotomasi.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-3 bg-slate-950/80 px-4 py-3 rounded-2xl border border-slate-800">
              <div className="w-9 h-9 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-bold text-xs">AA</div>
              <div className="text-xs">
                <p className="font-bold text-white">Ahmad Abdul Jalil</p>
                <p className="text-[10px] text-slate-400 font-mono">Developer & Founder Muara.ai</p>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-900/80 text-center text-xs text-slate-500 font-mono z-10 space-y-2">
        <p>&copy; {new Date().getFullYear()} Muara.ai — AI Solutions for SMEs. All rights reserved.</p>
        <p className="text-[10px] text-slate-600">STIKOM Bandung • Ai Bootcamp Impactpreneur Business Challenge</p>
      </footer>
    </div>
  );
}
