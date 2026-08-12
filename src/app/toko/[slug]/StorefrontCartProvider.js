'use client';

import { useState, useEffect, createContext, useContext, useTransition } from 'react';
import { useStorefrontTheme } from './StorefrontThemeWrapper';
import { createSpecialOrder, createOrder, getOccupiedTables } from '@/app/actions/store';

// Helper to parse size and color options from product description
function getProductOptions(product) {
  const desc = product.description || '';
  
  // Parse sizes (e.g., "Ukuran: S, M, L, XL" or "Size: S, M, L")
  let sizes = ['S', 'M', 'L', 'XL'];
  const sizeRegex = /(?:ukuran|size)\s*:\s*([^.\n;]+)/i;
  const sizeMatch = desc.match(sizeRegex);
  if (sizeMatch) {
    const parsed = sizeMatch[1].split(/[,|/]/).map(s => s.trim()).filter(Boolean);
    if (parsed.length > 0) sizes = parsed;
  }
  
  // Parse colors (e.g., "Warna: Hitam, Navy, Maroon" or "Warna: Hitam | Putih")
  let colors = ['Hitam', 'Putih', 'Navy', 'Maroon', 'Cream'];
  const colorRegex = /(?:warna|color)\s*:\s*([^.\n;]+)/i;
  const colorMatch = desc.match(colorRegex);
  if (colorMatch) {
    const parsed = colorMatch[1].split(/[,|/]/).map(c => c.trim()).filter(Boolean);
    if (parsed.length > 0) colors = parsed;
  }
  
  return { sizes, colors };
}

const CartContext = createContext({
  cart: [],
  cartCount: 0,
  cartSubtotal: 0,
  cartOpen: false,
  setCartOpen: () => {},
  chatOpen: false,
  setChatOpen: () => {},
  addToCart: () => {},
  buyDirect: () => {},
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
  const defaultService =
    (store?.category || 'kuliner').toLowerCase() === 'fashion'
      ? 'shipping'
      : (store?.category || 'kuliner').toLowerCase() === 'kriya'
      ? 'custom_po'
      : 'dine_in';

  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [serviceType, setServiceType] = useState(defaultService);
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

  // Dedicated Invoice Tracking Form states
  const [showCartTrackInput, setShowCartTrackInput] = useState(false);
  const [cartTrackInvoice, setCartTrackInvoice] = useState('');

  const [showCSTrackInput, setShowCSTrackInput] = useState(false);
  const [csTrackInvoice, setCSTrackInvoice] = useState('');

  // Size & Color Selection Modal States (kategori fashion)
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [optionsProduct, setOptionsProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [isBeliDirectMode, setIsBeliDirectMode] = useState(false);

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
      text:
        (store.category || 'kuliner').toLowerCase() === 'fashion'
          ? `Halo kak! 👗 Saya Asisten AI dari ${store.name}. Ada yang bisa saya bantu hari ini? Kakak bisa tanya rekomendasi busana/OOTD, panduan ukuran (size chart), lokasi toko, atau lacak status pesanan.`
          : (store.category || 'kuliner').toLowerCase() === 'kriya'
          ? `Halo kak! 🛠️ Saya Asisten AI dari ${store.name}. Ada yang bisa saya bantu hari ini? Kakak bisa tanya katalog kerajinan rotan, spesifikasi custom PO, lokasi toko, atau lacak status pesanan.`
          : `Halo kak! 🍽️ Saya Asisten CS AI dari ${store.name}. Ada yang bisa saya bantu hari ini? Kakak bisa tanya soal menu lezat, jam buka, lokasi toko, atau lacak status pesanan.`
    }
  ]);

  const [chatSessionId, setChatSessionId] = useState('');

  // Persist a unique session ID for the chat logs
  useEffect(() => {
    let sess = localStorage.getItem(`chat_session_${store.id}`);
    if (!sess) {
      sess = crypto.randomUUID();
      localStorage.setItem(`chat_session_${store.id}`, sess);
    }
    const timer = setTimeout(() => {
      setChatSessionId(sess);
    }, 0);
    return () => clearTimeout(timer);
  }, [store.id]);

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

  const executeAddToCart = (product, selectedSize = null, selectedColor = null) => {
    const existing = cart.find(
      (item) =>
        item.id === product.id &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
    );
    if (existing) {
      const updated = cart.map((item) =>
        item.id === product.id &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      saveCart(updated);
    } else {
      saveCart([...cart, { ...product, quantity: 1, selectedSize, selectedColor }]);
    }
    // Auto open cart drawer
    setCartOpen(true);

    // AI reacts to adding item
    let detailText = '';
    if (selectedSize || selectedColor) {
      detailText = ` (${[selectedSize ? `Ukuran: ${selectedSize}` : '', selectedColor ? `Warna: ${selectedColor}` : ''].filter(Boolean).join(', ')})`;
    }
    const aiMessage = {
      id: Date.now().toString(),
      sender: 'ai',
      text:
        (store.category || 'kuliner').toLowerCase() === 'fashion'
          ? `Mantap! 👗 Pakaian "${product.name}${detailText}" berhasil dimasukkan ke keranjang. Silakan isi alamat pengiriman di bawah untuk checkout.`
          : (store.category || 'kuliner').toLowerCase() === 'kriya'
          ? `Mantap! 🛠️ Kerajinan rotan "${product.name}" berhasil dimasukkan ke keranjang. Silakan isi detail spesifikasi di bawah untuk checkout.`
          : `Mantap! 🍽️ Menu "${product.name}" berhasil dimasukkan ke keranjang. Silakan pilih meja atau takeaway di bawah untuk checkout.`
    };
    setCartMessages((prev) => [...prev, aiMessage]);
  };

  const addToCart = (product, selectedSize = null, selectedColor = null) => {
    if ((store.category || 'kuliner').toLowerCase() === 'fashion' && (!selectedSize || !selectedColor)) {
      const options = getProductOptions(product);
      setOptionsProduct(product);
      setAvailableSizes(options.sizes);
      setAvailableColors(options.colors);
      setSelectedSize(options.sizes[0] || 'M');
      setSelectedColor(options.colors[0] || 'Hitam');
      setIsBeliDirectMode(false);
      setShowOptionsModal(true);
    } else {
      executeAddToCart(product, selectedSize, selectedColor);
    }
  };

  const buyDirect = (product) => {
    if ((store.category || 'kuliner').toLowerCase() === 'fashion') {
      const options = getProductOptions(product);
      setOptionsProduct(product);
      setAvailableSizes(options.sizes);
      setAvailableColors(options.colors);
      setSelectedSize(options.sizes[0] || 'M');
      setSelectedColor(options.colors[0] || 'Hitam');
      setIsBeliDirectMode(true);
      setShowOptionsModal(true);
    } else {
      const text = `Halo admin ${store.name}, saya mau pesan langsung: *${product.name}* (Harga: Rp ${product.price.toLocaleString('id-ID')})`;
      const url = `https://wa.me/${(store.whatsapp || '081234567890').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  };

  const removeFromCart = (productId, selectedSize = null, selectedColor = null) => {
    const updated = cart.filter(
      (item) =>
        !(
          item.id === productId &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
        )
    );
    saveCart(updated);
  };

  const updateQuantity = (productId, qty, selectedSize = null, selectedColor = null) => {
    if (qty <= 0) {
      removeFromCart(productId, selectedSize, selectedColor);
      return;
    }
    const updated = cart.map((item) =>
      item.id === productId &&
      item.selectedSize === selectedSize &&
      item.selectedColor === selectedColor
        ? { ...item, quantity: qty }
        : item
    );
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Send message inside conversational cart
  const sendCartMessage = async (text) => {
    if (!text.trim() || !chatSessionId) return;
    const userMsg = { id: Date.now().toString() + '-u', sender: 'user', text };
    setCartMessages((prev) => [...prev, userMsg]);

    const typingId = Date.now().toString() + '-typing';
    setCartMessages((prev) => [...prev, { id: typingId, sender: 'ai', text: 'Mengetik... 🤖' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'cart',
          message: text,
          sessionId: chatSessionId,
          storeId: store.id,
          cartItems: cart
        })
      });

      const data = await response.json();
      setCartMessages((prev) =>
        prev.map((msg) =>
          msg.id === typingId ? { ...msg, text: data.reply || 'Maaf, ada kendala koneksi.' } : msg
        )
      );
    } catch (err) {
      console.error('Failed to send cart message:', err);
      setCartMessages((prev) =>
        prev.map((msg) =>
          msg.id === typingId ? { ...msg, text: 'Maaf kak, gagal menghubungi server AI.' } : msg
        )
      );
    }
  };

  // Send message to CS AI
  const sendCSMessage = async (text) => {
    if (!text.trim() || !chatSessionId) return;
    const userMsg = { id: Date.now().toString() + '-u', sender: 'user', text };
    setCSMessages((prev) => [...prev, userMsg]);

    const typingId = Date.now().toString() + '-typing';
    setCSMessages((prev) => [...prev, { id: typingId, sender: 'ai', text: 'Mengetik... 🤖' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'cs',
          message: text,
          sessionId: chatSessionId,
          storeId: store.id,
          cartItems: cart
        })
      });

      const data = await response.json();
      setCSMessages((prev) =>
        prev.map((msg) =>
          msg.id === typingId ? { ...msg, text: data.reply || 'Maaf, ada kendala koneksi.' } : msg
        )
      );
    } catch (err) {
      console.error('Failed to send CS message:', err);
      setCSMessages((prev) =>
        prev.map((msg) =>
          msg.id === typingId ? { ...msg, text: 'Maaf kak, gagal menghubungi server AI.' } : msg
        )
      );
    }
  };

  const handleCartTrackSubmit = (e) => {
    e.preventDefault();
    if (!cartTrackInvoice.trim()) return;
    const inv = cartTrackInvoice.trim();
    sendCartMessage(`Lacak status pesanan invoice: ${inv}`);
    setCartTrackInvoice('');
    setShowCartTrackInput(false);
  };

  const handleCSTrackSubmit = (e) => {
    e.preventDefault();
    if (!csTrackInvoice.trim()) return;
    const inv = csTrackInvoice.trim();
    sendCSMessage(`Lacak status pesanan invoice: ${inv}`);
    setCSTrackInvoice('');
    setShowCSTrackInput(false);
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
    if ((store?.category || 'kuliner').toLowerCase() === 'kuliner' && serviceType === 'dine_in' && !tableNo) {
      alert('Silakan pilih nomor meja untuk layanan Makan di Tempat!');
      return;
    }

    startCheckoutTransition(async () => {
      const combinedNotes = [custAddress, checkoutNotes].filter(Boolean).join(' | ');
      const res = await createOrder(
        store.id,
        custName,
        custPhone,
        serviceType,
        tableNo,
        combinedNotes,
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
        buyDirect,
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
              {cart.map((item) => {
                const itemKey = `${item.id}-${item.selectedSize || ''}-${item.selectedColor || ''}`;
                return (
                  <div
                    key={itemKey}
                    className="bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-xl p-3 flex items-center gap-3 shadow-sm"
                  >
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{item.name}</h4>
                      {(item.selectedSize || item.selectedColor) && (
                        <p className="text-[9px] text-slate-500 font-medium mt-0.5">
                          {[item.selectedSize && `Ukuran: ${item.selectedSize}`, item.selectedColor && `Warna: ${item.selectedColor}`].filter(Boolean).join(' | ')}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Rp {item.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 border border-slate-100 dark:border-slate-800 rounded-lg p-1 bg-slate-50/50 dark:bg-slate-950">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize, item.selectedColor)}
                        className="w-5 h-5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize, item.selectedColor)}
                        className="w-5 h-5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                      className="text-slate-400 hover:text-red-500 p-1"
                      title="Hapus"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
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

              {/* Formulir Checkout Berdasarkan Kategori Toko */}
              {(store.category || 'kuliner').toLowerCase() === 'fashion' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">METODE PENGIRIMAN</label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-2.5 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                    >
                      <option value="shipping">Pengiriman Kurir / Ekspedisi 🚚</option>
                      <option value="pickup">Ambil di Toko 🛍️</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">ALAMAT LENGKAP PENGIRIMAN & KOTA</label>
                    <textarea
                      rows={2}
                      required={serviceType === 'shipping'}
                      placeholder="Masukkan alamat jalan, RT/RW, Kecamatan, & Kota..."
                      value={custAddress}
                      onChange={(e) => setCustAddress(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              ) : (store.category || 'kuliner').toLowerCase() === 'kriya' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">JENIS PESANAN KRIYA</label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-2.5 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                    >
                      <option value="custom_po">Pesanan Custom / Pre-Order (PO) 🛠️</option>
                      <option value="shipping">Pengiriman Langsung 📦</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">SPESIFIKASI CUSTOM & ALAMAT</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Sebutkan ukuran custom, bahan/material pilihan, & alamat kirim..."
                      value={custAddress}
                      onChange={(e) => setCustAddress(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              ) : (
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
              )}

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
          
          {showCartTrackInput ? (
            <form onSubmit={handleCartTrackSubmit} className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-xl border border-amber-200 dark:border-amber-800">
              <input
                type="text"
                required
                placeholder="Ketik No. Invoice (misal: INV-20260805-001)..."
                value={cartTrackInvoice}
                onChange={(e) => setCartTrackInvoice(e.target.value)}
                className="flex-1 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 px-3 py-1.5 rounded-lg text-xs text-slate-800 dark:text-white focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
              >
                Cari 🔍
              </button>
              <button
                type="button"
                onClick={() => setShowCartTrackInput(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1"
              >
                ✕
              </button>
            </form>
          ) : (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setShowCartTrackInput(true)}
                className="text-[10px] font-semibold px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
              >
                📦 Lacak Pesanan
              </button>
              <button
                onClick={() => setSpecialOrderOpen(true)}
                className="text-[10px] font-semibold px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
              >
                ✨ Pesanan Khusus (Acara)
              </button>
            </div>
          )}

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

        {/* Quick Prompts list & Tracking form */}
        {showCSTrackInput ? (
          <form onSubmit={handleCSTrackSubmit} className="p-2 bg-amber-50 dark:bg-amber-950/30 border-t border-amber-200 dark:border-amber-800 flex items-center gap-2">
            <input
              type="text"
              required
              placeholder="Ketik No. Invoice (misal: INV-20260805-001)..."
              value={csTrackInvoice}
              onChange={(e) => setCSTrackInvoice(e.target.value)}
              className="flex-1 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 px-3 py-1.5 rounded-lg text-xs text-slate-800 dark:text-white focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
            >
              Cari 🔍
            </button>
            <button
              type="button"
              onClick={() => setShowCSTrackInput(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1"
            >
              ✕
            </button>
          </form>
        ) : (
          <div className="px-4 py-2 bg-slate-100/50 dark:bg-slate-950/80 flex gap-2 overflow-x-auto hide-scrollbar border-t border-slate-200/40 dark:border-slate-800/40">
            <button
              onClick={() =>
                sendCSMessage(
                  (store.category || 'kuliner').toLowerCase() === 'fashion'
                    ? '📖 Rekomendasi Busana & OOTD'
                    : (store.category || 'kuliner').toLowerCase() === 'kriya'
                    ? '📖 Rekomendasi Kerajinan Rotan'
                    : '📖 Rekomendasi Menu Utama'
                )
              }
              className="shrink-0 text-[10px] font-semibold px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:border-orange-500/50 transition-colors"
            >
              {(store.category || 'kuliner').toLowerCase() === 'fashion'
                ? '📖 Katalog Busana'
                : (store.category || 'kuliner').toLowerCase() === 'kriya'
                ? '📖 Katalog Rotan'
                : '📖 Rekomendasi Menu'}
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
              onClick={() => setShowCSTrackInput(true)}
              className="shrink-0 text-[10px] font-semibold px-3 py-1.5 bg-amber-500 text-white rounded-full transition-colors flex items-center gap-1 cursor-pointer"
            >
              📦 Lacak Pesanan
            </button>
          </div>
        )}

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
              <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-white">
                {(store.category || 'kuliner').toLowerCase() === 'fashion'
                  ? 'Formulir Order Seragam / Grosir'
                  : (store.category || 'kuliner').toLowerCase() === 'kriya'
                  ? 'Formulir Order Custom Project Furniture'
                  : 'Formulir Pesanan Khusus (Acara/Catering)'}
              </h3>
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
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">
                    {(store.category || 'kuliner').toLowerCase() === 'fashion'
                      ? 'RINCIAN PESANAN SERAGAM / GROSIR BATIK'
                      : (store.category || 'kuliner').toLowerCase() === 'kriya'
                      ? 'SPESIFIKASI CUSTOM PROJECT & DIMENSI ROTAN'
                      : 'RINCIAN PESANAN KHUSUS (ACARA / CATERING)'}
                  </label>
                  <textarea
                    name="special_notes"
                    required
                    rows="4"
                    placeholder={
                      (store.category || 'kuliner').toLowerCase() === 'fashion'
                        ? 'Tulis detail jumlah kemeja/gamis, bahan kain, ukuran S-XXL, dan tanggal pengerjaan...'
                        : (store.category || 'kuliner').toLowerCase() === 'kriya'
                        ? 'Tulis detail dimensi ukuran rotan, warna finishing, jumlah unit, dan tanggal deadline...'
                        : 'Tulis detail pesanan katering Anda, jumlah porsi, tanggal acara, dll...'
                    }
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

      {/* G. MODAL OPSI UKURAN & WARNA (FASHION) */}
      {showOptionsModal && optionsProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            onClick={() => setShowOptionsModal(false)}
          ></div>
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="font-serif text-base font-bold text-slate-800 dark:text-white">
                  Pilih Variasi Produk
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Silakan pilih ukuran dan warna sebelum melanjutkan.</p>
              </div>
              <button
                onClick={() => setShowOptionsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Product Summary */}
            <div className="flex gap-3 mb-5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
              <img 
                src={optionsProduct.image_url} 
                alt={optionsProduct.name} 
                className="w-14 h-14 object-cover rounded-lg bg-slate-200 shrink-0" 
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{optionsProduct.name}</h4>
                <p className="text-[11px] font-bold text-orange-600 mt-1">
                  Rp {optionsProduct.price.toLocaleString('id-ID')}
                </p>
                {optionsProduct.status && (
                  <span className="inline-block text-[8px] uppercase font-mono px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded mt-1.5 border border-emerald-100 dark:border-emerald-900/30 font-bold">
                    Stok: {optionsProduct.status}
                  </span>
                )}
              </div>
            </div>

            {/* Sizes Selection */}
            {availableSizes.length > 0 && (
              <div className="mb-4">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Ukuran (Size)</label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        selectedSize === size
                          ? `${theme.primary} text-white border-transparent shadow-sm`
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-350'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors Selection */}
            {availableColors.length > 0 && (
              <div className="mb-6">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pilihan Warna</label>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        selectedColor === color
                          ? `${theme.primary} text-white border-transparent shadow-sm`
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-350'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {isBeliDirectMode ? (
                <button
                  type="button"
                  onClick={() => {
                    const detail = `(Ukuran: ${selectedSize}, Warna: ${selectedColor})`;
                    const text = `Halo admin ${store.name}, saya mau pesan langsung: *${optionsProduct.name}* ${detail} (Harga: Rp ${optionsProduct.price.toLocaleString('id-ID')})`;
                    const url = `https://wa.me/${(store.whatsapp || '081234567890').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
                    window.open(url, '_blank');
                    setShowOptionsModal(false);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>⚡ Beli Direct via WhatsApp</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    executeAddToCart(optionsProduct, selectedSize, selectedColor);
                    setShowOptionsModal(false);
                  }}
                  className={`w-full py-3 text-white rounded-xl text-xs font-bold shadow transition-all hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer ${theme.primary}`}
                >
                  <span>+ Tambahkan ke Keranjang</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </CartContext.Provider>
  );
}
