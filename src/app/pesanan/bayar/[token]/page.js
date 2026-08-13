'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import styles from '../../../orderPage.module.css';

export default function CustomerPaymentPage() {
  const routeParams = useParams();
  const token = routeParams?.token;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null);
  const fileInputRef = useRef(null);

  const fetchOrder = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/orders/${token}`);
      const data = await res.json();
      if (data.error) setError(data.error);
      else setOrder(data.order);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!token) return;
      try {
        const res = await fetch(`/api/orders/${token}`);
        const data = await res.json();
        if (!ignore) {
          if (data.error) setError(data.error);
          else setOrder(data.order);
        }
      } catch (e) {
        if (!ignore) setError(e.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [token]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar (JPG, PNG) yang diperbolehkan!');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setUploadPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleUploadProof = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file && !uploadPreview) {
      alert('Silakan pilih foto/file bukti transfer terlebih dahulu!');
      return;
    }
    setUploading(true);
    try {
      // 1. Upload image via /api/upload
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else {
        throw new Error('File gambar tidak ditemukan.');
      }

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload bukti gagal');

      const proofUrl = uploadData.url;

      // 2. Save proof URL & update status to payment_uploaded (Waiting Verification)
      const orderUpdateRes = await fetch(`/api/orders/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentProofUrl: proofUrl })
      });
      const orderUpdateData = await orderUpdateRes.json();
      if (!orderUpdateRes.ok) throw new Error(orderUpdateData.error || 'Gagal menyimpan status bukti transfer');

      // 3. Trigger WhatsApp notification to UMKM Store Owner to verify payment
      const storeWa = order?.store_whatsapp;
      if (storeWa) {
        const baseUrl = 'https://muara-ai.vercel.app';
        const textMessage = `📎 *BUKTI TRANSFER DITERIMA!*\n\n` +
          `Pelanggan *${order.customer_name}* telah mengunggah bukti pembayaran untuk pesanan *#${order.invoice_number}* (Total: Rp ${Number(order.total_amount).toLocaleString('id-ID')}).\n\n` +
          `Silakan verifikasi & konfirmasi pembayaran di:\n` +
          `🔗 ${baseUrl}/pesanan/kelola/${token}`;

        await fetch('/api/whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: storeWa,
            message: textMessage
          })
        });
      }

      setUploadPreview(null);
      await fetchOrder();
      alert('Bukti transfer berhasil dikirim! Mohon tunggu verifikasi dari penjual.');
    } catch (e) {
      alert('Gagal mengunggah bukti: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  const statusLabels = {
    pending: '🕐 Pesanan Diterima',
    waiting_payment_proof: '💳 Silakan Lakukan Pembayaran',
    payment_uploaded: '⏳ Menunggu Verifikasi Pembayaran oleh Penjual',
    paid: '✅ Pembayaran Dikonfirmasi & Lunas',
    completed: '✅ Pesanan Selesai',
    cancelled: '❌ Pesanan Dibatalkan',
    ready: '📦 Pesanan Siap'
  };

  // Extract payment method from notes
  const paymentMethodMatch = order?.notes?.match(/Metode Bayar:\s*([^|]+)/i);
  const paymentMethodText = paymentMethodMatch ? paymentMethodMatch[1].trim() : 'Transfer / QRIS';

  if (loading) return (
    <div className={styles.container}>
      <div className={styles.loadingSpinner}></div>
      <p style={{ textAlign: 'center', color: '#94a3b8' }}>Memuat invoice...</p>
    </div>
  );

  if (error || !order) return (
    <div className={styles.container}>
      <div className={styles.errorCard}>
        <h2>❌ Invoice Tidak Ditemukan</h2>
        <p>{error || 'Maaf, pesanan dengan token ini tidak ditemukan.'}</p>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.badgeCustomer}>🧾 Invoice Pembayaran</span>
        <h1 className={styles.title}>#{order.invoice_number}</h1>
        {order.store_name && (
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>Toko: <strong>{order.store_name}</strong></p>
        )}
      </div>

      <div className={styles.statusBanner} data-status={order.status}>
        {statusLabels[order.status] || order.status}
      </div>

      {/* Payment Method Details */}
      <div className={styles.card}>
        <h3 className={styles.sectionTitle}>💳 Metode Pembayaran</h3>
        <div className={styles.paymentMethodBadge}>
          {paymentMethodText}
        </div>
        <p className={styles.paymentInstruction}>
          Silakan selesaikan pembayaran sebesar <strong className={styles.highlightAmount}>Rp {Number(order.total_amount).toLocaleString('id-ID')}</strong> sesuai metode di atas, lalu unggah foto/screenshot bukti transfer di bawah ini.
        </p>
      </div>

      {/* Detail Pesanan */}
      <div className={styles.card}>
        <h3 className={styles.sectionTitle}>🛒 Detail Pesanan</h3>
        <div className={styles.itemList}>
          {order.order_items?.map((item) => (
            <div key={item.id} className={styles.itemRow}>
              <span className={styles.itemName}>{item.product_name}</span>
              <span className={styles.itemQty}>{item.quantity}×</span>
              <span className={styles.itemPrice}>Rp {Number(item.price).toLocaleString('id-ID')}</span>
            </div>
          ))}
        </div>
        <div className={styles.totalRow}>
          <span>Total Tagihan</span>
          <span className={styles.totalAmount}>Rp {Number(order.total_amount).toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Payment Section - Upload form when waiting for proof */}
      {order.status === 'waiting_payment_proof' && (
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>📤 Upload Bukti Transfer</h3>
          <p className={styles.uploadHint}>Foto atau screenshot bukti transfer pembayaran Anda (maks. 5MB)</p>

          <div 
            className={styles.uploadArea}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadPreview ? (
              <img src={uploadPreview} alt="Preview Bukti TF" className={styles.uploadPreview} />
            ) : (
              <div className={styles.uploadPlaceholder}>
                <span className={styles.uploadIcon}>📸</span>
                <p>Klik / Tap di sini untuk memilih foto bukti transfer</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          <button 
            className={styles.actionBtn} 
            onClick={handleUploadProof} 
            disabled={uploading || !uploadPreview}
          >
            {uploading ? '⏳ Mengunggah...' : '📤 Kirim Bukti Pembayaran'}
          </button>
        </div>
      )}

      {/* Status: Payment Uploaded - Waiting seller verification */}
      {order.status === 'payment_uploaded' && (
        <div className={styles.card}>
          <div className={styles.waitingCard}>
            <div className={styles.waitingPulse}></div>
            <h3>⏳ Bukti Pembayaran Terkirim!</h3>
            <p>Bukti transfer Anda telah terkirim dan sedang diverifikasi oleh penjual. Anda akan menerima notifikasi WhatsApp setelah pembayaran dikonfirmasi.</p>
            <button className={styles.refreshBtn} onClick={fetchOrder}>🔄 Cek Status Verifikasi</button>
          </div>
        </div>
      )}

      {/* Status: Paid */}
      {order.status === 'paid' && (
        <div className={styles.successCard}>
          <h3>🎉 Pembayaran Dikonfirmasi & Lunas!</h3>
          <p>Pesanan Anda sedang diproses oleh penjual. Terima kasih telah berbelanja!</p>
        </div>
      )}

      {/* Status: Cancelled */}
      {order.status === 'cancelled' && (
        <div className={styles.cancelledCard}>
          <h3>Pesanan Dibatalkan</h3>
          <p>Pembayaran Anda ditolak oleh penjual. Silakan hubungi toko untuk informasi lebih lanjut.</p>
        </div>
      )}

      {/* Uploaded proof image display */}
      {order.payment_proof_url && (
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>🧾 Bukti Transfer Terkirim</h3>
          <img src={order.payment_proof_url} alt="Bukti Transfer" className={styles.proofImage} />
        </div>
      )}
    </div>
  );
}
