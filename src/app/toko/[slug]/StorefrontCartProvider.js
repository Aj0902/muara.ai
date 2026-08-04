'use client';

import { useState, useEffect, createContext, useContext, useTransition } from 'react';
import { useStorefrontTheme } from './StorefrontThemeWrapper';
import { createSpecialOrder, createOrder, getOccupiedTables } from '@/app/actions/store';

const CartContext = createContext({
  cart: [],
  cartCount: 0,
  cartSubtotal: 0,
  cartOpen: false,
  setCartOpen: () => {},
  chatOpen: false,
  setChatOpen: () => {},
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  cartMessages: [],
  sendCartMessage: () => {},
  csMessages: [],
  sendCSMessage: () => {}
});

export const useStorefrontCart = () => useContext(CartContext);

export default function StorefrontCartProvider({ children, store }) {
  const { theme } = useStorefrontTheme();
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [isPendingSpecialOrder, startSpecialOrderTransition] = useTransition();
  const [isPendingCheckout, startCheckoutTransition] = useTransition();

  // Checkout Form States
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [serviceType, setServiceType] = useState('dine_in'); // dine_in | take_away
  const [tableNo, setTableNo] = useState('');
  const [checkoutNotes, setCheckoutNotes] = useState('');
  const [occupiedTables, setOccupiedTables] = useState([]);

  // Fetch occupied tables dynamically when drawer opens
  useEffect(() => {
    if (cartOpen) {
      const fetchOccupied = async () => {
        const res = await getOccupiedTables(store.id);
        if (res && res.occupied) {
          setOccupiedTables(res.occupied);
        }
      };
      fetchOccupied();
    }
  }, [cartOpen, store.id]);

  // Special Order Modal States
  const [specialOrderOpen, setSpecialOrderOpen] = useState(false);
  const [specialOrderSuccess, setSpecialOrderSuccess] = useState(false);
  const [specialOrderError, setSpecialOrderError] = useState('');

  // Mock Invoice & QRIS Popup
  const [showQRIS, setShowQRIS] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState('');

  // Conversational Cart messages
  const [cartMessages, setCartMessages] = useState([
    {
      id: 'greet',
      sender: 'ai',
      text: 'Halo kak! 👋 Ini ringkasan pesanan yang udah kamu masukin. Silakan isi form data diri di bawah rincian ya, lalu klik "Lanjutkan Pesanan" untuk membuat QRIS & Invoice pembayaran! 🚀'
    }
  ]);

  // CS AI messages
  const [csMessages, setCSMessages] = useState([
    {
      id: 'greet',
      sender: 'ai',
      text: `Halo kak! 👋 Saya Asisten CS AI dari ${store.name}. Ada yang bisa saya bantu hari ini? Kakak bisa tanya soal menu, jam buka, lokasi, atau lacak status pesanan.`
    }
  ]);

  // Sync cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart_${store.id}`);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        const timer = setTimeout(() => {
          setCart(parsed);
        }, 0);
        return () => clearTimeout(timer);
      } catch (e) {
        console.error('Failed to parse cart:', e);
      }
    }
  }, [store.id]);

  // Save cart to localStorage
  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem(`cart_${store.id}`, JSON.stringify(newCart));
  };

  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      const updated = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
      saveCart(updated);
    } else {
      saveCart([...cart, { ...product, quantity: 1 }]);
    }
    // Auto open cart drawer
    setCartOpen(true);

    // AI reacts to adding item
    const aiMessage = {
      id: Date.now().toString(),
      sender: 'ai',
      text: `Mantap! 👍 Menu "${product.name}" berhasil dimasukkan ke keranjang. Silakan isi form di bawah untuk checkout.`
    };
    setCartMessages((prev) => [...prev, aiMessage]);
  };

  const removeFromCart = (productId) => {
    const updated = cart.filter((item) => item.id !== productId);
    saveCart(updated);
  };

  const updateQuantity = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    const updated = cart.map((item) =>
      item.id === productId ? { ...item, quantity: qty } : item
    );
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Send message inside conversational cart
  const sendCartMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now().toString() + '-u', sender: 'user', text };
    setCartMessages((prev) => [...prev, userMsg]);

    // Simulated AI response
    setTimeout(() => {
      let aiResponseText = 'Maaf kak, saya tidak mengerti. Bisa diperjelas?';
      const cleanText = text.toLowerCase();

      if (cleanText.includes('checkout') || cleanText.includes('bayar') || cleanText.includes('pesan')) {
        if (cart.length === 0) {
          aiResponseText = 'Keranjang belanja kakak masih kosong nih. Yuk pilih menu dulu di daftar produk!';
        } else {
          aiResponseText = `Untuk memproses pesanan, silakan isi form Nama, WhatsApp, dan Pilihan Meja di bawah rincian belanjaan kakak, lalu klik tombol "Lanjutkan Pesanan" di bawah!`;
        }
      } else if (cleanText.includes('tambah') || cleanText.includes('menu')) {
        aiResponseText = 'Kakak bisa menutup drawer ini dan klik tombol robot keranjang di daftar produk untuk menambahkan menu lezat lainnya!';
      } else if (cleanText.includes('lacak') || cleanText.includes('order') || cleanText.includes('status')) {
        aiResponseText = 'Kakak bisa melacak status pengiriman atau pesanan langsung lewat widget "Tanya CS AI" di pojok kanan bawah!';
      } else if (cleanText.includes('keluhan') || cleanText.includes('salah') || cleanText.includes('kecewa')) {
        aiResponseText = 'Aduh maaf banget atas ketidaknyamanannya kak. Kakak bisa klik tombol "Tanya CS AI" melayang di kanan bawah untuk langsung terhubung ke CS Admin/Keluhan Pelanggan kami!';
      } else {
        aiResponseText = `Siap kak, pesan tercatat. Pesanan saat ini adalah ${cart.map(i => `${i.name} (${i.quantity}x)`).join(', ')}. Silakan isi form di bawah untuk melanjutkan pembayaran!`;
      }

      setCartMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + '-ai', sender: 'ai', text: aiResponseText }
      ]);
    }, 800);
  };

  // Send message to CS AI
  const sendCSMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now().toString() + '-u', sender: 'user', text };
    setCSMessages((prev) => [...prev, userMsg]);

    // Simulated AI response
    setTimeout(() => {
      let aiResponseText = `Terima kasih pesannya kak. Ada hal spesifik tentang ${store.name} yang ingin ditanyakan?`;
      const cleanText = text.toLowerCase();

      if (cleanText.includes('jam') || cleanText.includes('buka') || cleanText.includes('tutup') || cleanText.includes('operasional')) {
        aiResponseText = store.hours 
          ? `Toko kami buka pada jam: *${store.hours}*. Silakan mampir atau pesan secara online ya kak!`
          : 'Untuk saat ini detail jam buka belum diperbarui oleh pemilik toko. Biasanya kami buka setiap hari mulai pukul 09.00 WIB.';
      } else if (cleanText.includes('lokasi') || cleanText.includes('alamat') || cleanText.includes('maps') || cleanText.includes('posisi')) {
        aiResponseText = store.address
          ? `Alamat lengkap kami berada di: *${store.address}*.${store.maps_link ? ` Kakak bisa lihat peta jalurnya di sini: [Google Maps Link](${store.maps_link})` : ''}`
          : 'Alamat kami belum dikonfigurasi secara lengkap di database. Silakan hubungi kami via WhatsApp untuk detail lokasi presisi.';
      } else if (cleanText.includes('menu') || cleanText.includes('rekomendasi') || cleanText.includes('enak') || cleanText.includes('best seller')) {
        aiResponseText = `Untuk menu andalan di kategori *${store.category}* kami, kami sangat merekomendasikan produk unggulan kami yang bisa dilihat di halaman katalog. Kakak bisa klik tombol robot di sebelah harga produk untuk langsung memasukannya ke keranjang belanja!`;
      } else if (cleanText.includes('lacak') || cleanText.includes('order') || cleanText.includes('pesanan') || cleanText.includes('tracking') || cleanText.includes('invoice')) {
        aiResponseText = 'Untuk melacak pesanan, silakan ketik nomor Invoice atau kode pesanan Anda (contoh: INV-20260805-001). CS AI kami akan langsung mengecek status pengirimannya!';
      } else if (cleanText.includes('inv-') || cleanText.includes('invoice-')) {
        // Fetch order mock or real status
        aiResponseText = '🔍 *Status Pesanan (MOCK TRACKING)*:\n• No. Invoice: ' + text.toUpperCase() + '\n• Status: *Sedang Diproses/Dalam Pengantaran Kurir*\n• Estimasi Tiba: *15-20 Menit*\n\nTerima kasih sudah bersabar menunggu pesanan terbaik kami!';
      } else if (cleanText.includes('keluhan') || cleanText.includes('kecewa') || cleanText.includes('dingin') || cleanText.includes('lama')) {
        aiResponseText = `Maaf atas kendalanya kak 🙏. Data keluhan kakak sudah dicatat. Jika ingin respon langsung dari pemilik toko, kakak bisa langsung mengklik link WhatsApp di bagian bawah.`;
      } else {
        aiResponseText = store.chatbot_persona
          ? `[CS AI Response]: ${store.chatbot_persona}`
          : `Halo! Saya asisten pintar ${store.name}. Untuk respon cepat mengenai pemesanan atau kustomisasi pesanan besar, kakak juga bisa mengklik tombol hubungi WhatsApp kami.`;
      }

      setCSMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + '-ai', sender: 'ai', text: aiResponseText }
      ]);
    }, 800);
  };

  // Submit Special Order (Katering / Acara)
  const handleSpecialOrder = (e) => {
    e.preventDefault();
    setSpecialOrderError('');
    const formData = new FormData(e.currentTarget);
    const name = formData.get('special_name');
    const phone = formData.get('special_phone');
    const notes = formData.get('special_notes');

    if (!name || !phone || !notes) {
      setSpecialOrderError('Semua kolom formulir wajib diisi!');
      return;
    }

    startSpecialOrderTransition(async () => {
      const res = await createSpecialOrder(store.id, name, phone, notes);
      if (res.error) {
        setSpecialOrderError(res.error);
      } else {
        setSpecialOrderSuccess(true);
        setTimeout(() => {
          setSpecialOrderOpen(false);
          setSpecialOrderSuccess(false);
        }, 3000);
      }
    });
  };

  // Submit standard cart checkout to Supabase
  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!custName || !custPhone) {
      alert('Nama dan No WhatsApp wajib diisi untuk melakukan pemesanan!');
      return;
    }
    if (serviceType === 'dine_in' && !tableNo) {
      alert('Silakan pilih nomor meja untuk layanan Dine In!');
      return;
    }

    startCheckoutTransition(async () => {
      const res = await createOrder(
        store.id,
        custName,
        custPhone,
        serviceType,
        tableNo,
        checkoutNotes,
        cartSubtotal,
        cart
      );

      if (res.error) {
        alert(res.error);
      } else {
        setGeneratedInvoice(res.invoiceNumber);
        setShowQRIS(true);

        // AI reacts inside cart drawer
        setCartMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'ai',
            text: `Pesanan kakak berhasil dibuat! 📝\nNo. Invoice: *${res.invoiceNumber}*\nLayanan: *${serviceType === 'dine_in' ? `Dine In (Meja ${tableNo})` : 'Take Away'}*\nTotal: *Rp ${cartSubtotal.toLocaleString('id-ID')}*\n\nSilakan simpan invoice dan selesaikan pembayaran di layar ya kak!`
          }
        ]);
      }
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartSubtotal,
        cartOpen,
        setCartOpen,
        chatOpen,
        setChatOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartMessages,
        sendCartMessage,
        csMessages,
        sendCSMessage
      }}
    >
      {children}

      {/* A. OVERLAY BACKDROP FOR CART DRAWER */}
      {cartOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={() => setCartOpen(false)}
        ></div>
      )}

      {/* B. CONVERSATIONAL CART SIDE DRAWER */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-slate-50 dark:bg-slate-950 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-l border-slate-200 dark:border-slate-800 ${
          cartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 p-4 flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/50 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme.primaryBgLight} ${theme.primaryText}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h3 className="font-serif font-bold text-base leading-tight text-slate-800 dark:text-white">Keranjang Belanja</h3>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-50"></span> conversational AI cart
              </p>
            </div>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable conversational list */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 hide-scrollbar">
          
          {/* AI Greetings log */}
          <div className="flex flex-col gap-4">
            {cartMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] items-end ${
                  msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 shadow ${theme.primary}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? `${theme.primary} text-white rounded-br-sm shadow-md`
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/50 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Cart Item Cards list (Rendered only if cart has items) */}
          {cart.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 space-y-3">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Item dalam Keranjang:</p>
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-xl p-3 flex items-center gap-3 shadow-sm"
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{item.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Rp {item.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 border border-slate-100 dark:border-slate-800 rounded-lg p-1 bg-slate-50/50 dark:bg-slate-950">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-5 h-5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-5 h-5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-red-500 p-1"
                    title="Hapus"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* INLINE CHECKOUT FORM */}
          {cart.length > 0 && (
            <form onSubmit={handleCheckoutSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-4 rounded-2xl mt-4 space-y-4">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Formulir Pemesanan:</p>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">NAMA PEMESAN</label>
                <input
                  type="text"
                  required
                  placeholder="Ketik nama Anda..."
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">NO WHATSAPP</label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">LAYANAN</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-2.5 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="dine_in">Makan di Tempat</option>
                    <option value="take_away">Bawa Pulang</option>
                  </select>
                </div>

                {serviceType === 'dine_in' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">PILIH MEJA</label>
                    <select
                      required
                      value={tableNo}
                      onChange={(e) => setTableNo(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-2.5 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                    >
                      <option value="">Pilih Meja...</option>
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => {
                        const isOccupied = occupiedTables.includes(num);
                        return (
                          <option key={num} value={num} disabled={isOccupied}>
                            Meja {num} {isOccupied ? '(Dipakai) 🔴' : '(Ready) 🟢'}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">CATATAN OPSIONAL</label>
                <textarea
                  placeholder="Ketik catatan di sini..."
                  rows="2"
                  value={checkoutNotes}
                  onChange={(e) => setCheckoutNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-orange-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isPendingCheckout}
                className={`w-full text-white py-3 rounded-xl font-bold text-xs transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md ${theme.primary}`}
              >
                <span>{isPendingCheckout ? 'Membuat Pesanan...' : 'Lanjutkan Pesanan (Bayar)'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          )}

        </div>

        {/* Suggestion Chips & User input */}
        <div className="bg-white dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-800/50 p-4 space-y-4 shrink-0">
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => sendCartMessage('🍔 Tambah Menu Lain')}
              className="text-[10px] font-semibold px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full transition-colors"
            >
              🍔 Tambah Menu Lain
            </button>
            <button
              onClick={() => setSpecialOrderOpen(true)}
              className="text-[10px] font-semibold px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 rounded-full transition-colors flex items-center gap-1"
            >
              ✨ Pesanan Khusus (Katering/Acara)
            </button>
          </div>

          <div className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-slate-400 font-semibold uppercase">Total Belanja</span>
            <span className="text-base font-bold text-slate-800 dark:text-white">
              Rp {cartSubtotal.toLocaleString('id-ID')}
            </span>
          </div>

          {/* Conversational input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.target.elements.cartInput;
              sendCartMessage(input.value);
              input.value = '';
            }}
            className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 rounded-full p-1.5 pl-4 border border-slate-200 dark:border-slate-800"
          >
            <input
              type="text"
              name="cartInput"
              placeholder="Tanya Asisten AI Cart..."
              className="flex-1 bg-transparent text-xs text-slate-800 dark:text-white focus:outline-none"
            />
            <button
              type="submit"
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-opacity hover:opacity-90 ${theme.primary}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* C. FLOATING CHAT WIDGET PANEL (CS AI) */}
      <div
        className={`fixed bottom-24 right-6 sm:bottom-28 sm:right-8 z-50 w-[calc(100vw-3rem)] sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right transform ${
          chatOpen && !cartOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-50 opacity-0 pointer-events-none translate-y-10'
        }`}
      >
        {/* Header */}
        <div className={`p-4 flex justify-between items-center text-white relative overflow-hidden ${theme.primary}`}>
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-md"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-sm shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-sm">Asisten CS AI</h4>
              <p className="text-[10px] text-slate-100 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online & Siap Membantu
              </p>
            </div>
          </div>
          <button
            onClick={() => setChatOpen(false)}
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chat Body messages */}
        <div className="flex-1 h-80 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-950/50 flex flex-col gap-4 hide-scrollbar">
          {csMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 items-end max-w-[85%] ${
                msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 text-[10px] ${theme.primary}`}>
                  🤖
                </div>
              )}
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? `${theme.primary} text-white rounded-br-sm shadow-md`
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/50 rounded-bl-sm shadow-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Prompts list */}
        <div className="px-4 py-2 bg-slate-100/50 dark:bg-slate-950/80 flex gap-2 overflow-x-auto hide-scrollbar border-t border-slate-200/40 dark:border-slate-800/40">
          <button
            onClick={() => sendCSMessage('📖 Rekomendasi Menu Utama')}
            className="shrink-0 text-[10px] font-semibold px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:border-orange-500/50 transition-colors"
          >
            📖 Rekomendasi Menu
          </button>
          <button
            onClick={() => sendCSMessage('⏰ Jam Buka Operasional')}
            className="shrink-0 text-[10px] font-semibold px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:border-orange-500/50 transition-colors"
          >
            ⏰ Jam Buka
          </button>
          <button
            onClick={() => sendCSMessage('📍 Lokasi Lengkap')}
            className="shrink-0 text-[10px] font-semibold px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:border-orange-500/50 transition-colors"
          >
            📍 Lokasi
          </button>
          <button
            onClick={() => sendCSMessage('📦 Lacak Status Pesanan')}
            className="shrink-0 text-[10px] font-semibold px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:border-orange-500/50 transition-colors"
          >
            📦 Lacak Pesanan
          </button>
        </div>

        {/* Input Area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.target.elements.csInput;
            sendCSMessage(input.value);
            input.value = '';
          }}
          className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-800/50"
        >
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 rounded-full p-1 pl-4 border border-slate-200 dark:border-slate-800">
            <input
              type="text"
              name="csInput"
              placeholder="Tanya CS AI..."
              className="flex-1 bg-transparent text-xs text-slate-800 dark:text-white focus:outline-none"
            />
            <button
              type="submit"
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-opacity hover:opacity-90 ${theme.primary}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* D. WIDGET CS AI FLOATING BUTTON */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 flex items-center justify-center text-white rounded-full p-3.5 sm:p-4 shadow-xl border-2 border-white dark:border-slate-950 cursor-pointer group hover:-translate-y-1 transition-all duration-300 ${
          cartOpen ? 'opacity-0 scale-50 pointer-events-none translate-y-10' : 'opacity-100 scale-100'
        } ${theme.primary}`}
      >
        <div className="relative flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6.5 h-6.5 text-white transform group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 z-20">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white dark:border-slate-950"></span>
          </span>
        </div>
        <span className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-500 ease-in-out whitespace-nowrap font-semibold text-xs leading-none">
          <span className="pl-2.5">Tanya CS AI</span>
        </span>
      </button>

      {/* E. MODAL CHECKOUT INVOICE & MOCK QRIS CODE */}
      {showQRIS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowQRIS(false)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 text-center border border-slate-200 dark:border-slate-800 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-white mb-1">Pesanan Berhasil Dibuat!</h3>
            <p className="text-xs text-slate-400 mb-4">No. Invoice: <span className="font-mono font-bold text-orange-600">{generatedInvoice}</span></p>
            
            {/* Mock QRIS Image */}
            <div className="w-44 h-44 mx-auto bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center p-3 mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`qris://pay?invoice=${generatedInvoice}&amount=${cartSubtotal}`)}`}
                alt="QRIS Code"
                className="w-full h-full object-contain"
              />
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl mb-4 text-left border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-xs font-semibold text-slate-650 dark:text-slate-400">
                <span>Total Bayar:</span>
                <span className="text-slate-800 dark:text-white">Rp {cartSubtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-450 mt-1">
                <span>Layanan:</span>
                <span>{serviceType === 'dine_in' ? `Makan di Tempat (Meja ${tableNo})` : 'Bawa Pulang (Take Away)'}</span>
              </div>
            </div>

            {/* CUSTOM NOTIFICATION TEXT REQUESTED BY USER */}
            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 rounded-xl text-[10.5px] text-slate-500 dark:text-slate-450 text-left leading-relaxed mb-5 space-y-1">
              <p className="font-semibold text-slate-700 dark:text-slate-350">💡 Panduan Pembayaran:</p>
              <p>Simpan atau screenshot invoice berikut. Nomor invoice digunakan untuk melacak pesanan Anda. Pembayaran bisa dilakukan dengan scan barcode QRIS di atas atau secara tunai dengan menunjukkannya ke kasir. Terima kasih telah berbelanja di sini!</p>
            </div>

            <button
              onClick={() => {
                setShowQRIS(false);
                clearCart();
                setCartOpen(false);
              }}
              className={`w-full py-3 text-white rounded-xl text-xs font-bold shadow transition-opacity hover:opacity-90 ${theme.primary}`}
            >
              Selesai & Tutup
            </button>
          </div>
        </div>
      )}

      {/* F. FORM MODAL PESANAN KHUSUS (KATERING/ACARA) */}
      {specialOrderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSpecialOrderOpen(false)}></div>
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-white">Formulir Pesanan Khusus (Acara/Catering)</h3>
              <button
                onClick={() => setSpecialOrderOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
              >
                ×
              </button>
            </div>

            {specialOrderSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                <h4 className="font-bold text-slate-800 dark:text-white">Pesanan Khusus Terkirim!</h4>
                <p className="text-xs text-slate-400">Terima kasih, Anda akan dihubungi kembali oleh admin kami via WhatsApp.</p>
              </div>
            ) : (
              <form onSubmit={handleSpecialOrder} className="space-y-4">
                {specialOrderError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 text-center">
                    {specialOrderError}
                  </div>
                )}
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">NAMA LENGKAP</label>
                  <input
                    type="text"
                    name="special_name"
                    required
                    placeholder="Ketik nama Anda..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">NOMOR WHATSAPP</label>
                  <input
                    type="tel"
                    name="special_phone"
                    required
                    placeholder="Contoh: 081234567890"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">RINCIAN PESANAN KHUSUS (ACARA / CATERING)</label>
                  <textarea
                    name="special_notes"
                    required
                    rows="4"
                    placeholder="Tulis detail pesanan katering Anda, jumlah porsi, tanggal acara, dll..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-orange-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isPendingSpecialOrder}
                  className={`w-full text-white py-3 rounded-xl font-bold text-xs transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md ${theme.primary}`}
                >
                  {isPendingSpecialOrder ? 'Mengirim...' : 'Kirim Pesanan Khusus'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </CartContext.Provider>
  );
}
