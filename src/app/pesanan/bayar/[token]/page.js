'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from '../../../orderPage.module.css';

export default function CustomerPaymentPage({ params }) {
  const { token } = params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null);
  const fileInputRef = useRef(null);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${token}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setOrder(data.order);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
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
    if (!file) {
      alert('Silakan pilih file bukti transfer terlebih dahulu!');
      return;
    }
    setUploading(true);
    try {
      // Upload image via existing upload API
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload gagal');

      const proofUrl = uploadData.url;

      // Save proof URL & update status
      await fetch(`/api/orders/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentProofUrl: proofUrl })
      });

      // Notify UMKM owner via WhatsApp
      const baseUrl = window.location.origin;
      await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: order.store_whatsapp || '',
          message: `📎 Bukti transfer diterima untuk pesanan ${order.invoice_number} dari ${order.customer_name}.\n\nSilakan konfirmasi pembayaran di:\n${baseUrl}/pesanan/kelola/${token}`
        })
      });

      setUploadPreview(null);
      await fetchOrder();
      alert('Bukti transfer berhasil dikirim! Mohon tunggu konfirmasi dari penjual.');
    } catch (e) {
      alert('Gagal mengunggah bukti: ' + e.message);
    } finally {
      setUploading(false);
    }
  };

  const statusLabels = {
    pending: '🕐 Pesanan Diterima',
    waiting_payment_proof: '💳 Silakan Lakukan Pembayaran',
    payment_uploaded: '⏳ Menunggu Konfirmasi Penjual',
    paid: '✅ Pembayaran Dikonfirmasi',
    completed: '✅ Pesanan Selesai',
    cancelled: '❌ Pesanan Dibatalkan',
    ready: '📦 Pesanan Siap'
  };

  if (loading) return (
    <div className={styles.container}>
      <div className={styles.loadingSpinner}></div>
      <p style={{ textAlign: 'center', color: '#94a3b8' }}>Memuat invoice...</p>
    </div>
  );

  if (error) return (
    <div className={styles.container}>
      <div className={styles.errorCard}>
        <h2>❌ Pesanan Tidak Ditemukan</h2>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.badgeCustomer}>🧾 Invoice Pembayaran</span>
        <h1 className={styles.title}>#{order.invoice_number}</h1>
      </div>

      <div className={styles.statusBanner} data-status={order.status}>
        {statusLabels[order.status] || order.status}
      </div>

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

      {/* Payment Section - only show when waiting for payment */}
      {order.status === 'waiting_payment_proof' && (
        <>
          {/* QRIS & Bank Info */}
          {order.store_qris_url && (
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>📱 Bayar via QRIS</h3>
              <div className={styles.qrisContainer}>
                <img src={order.store_qris_url} alt="QRIS" className={styles.qrisImage} />
              </div>
            </div>
          )}

          {/* Upload Proof */}
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>📤 Upload Bukti Transfer</h3>
            <p className={styles.uploadHint}>Foto/screenshot bukti transfer Anda (maks. 5MB)</p>

            <div 
              className={styles.uploadArea}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadPreview ? (
                <img src={uploadPreview} alt="Preview" className={styles.uploadPreview} />
              ) : (
                <div className={styles.uploadPlaceholder}>
                  <span className={styles.uploadIcon}>📸</span>
                  <p>Tap untuk pilih foto</p>
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
        </>
      )}

      {/* Status: Payment Uploaded - Waiting confirmation */}
      {order.status === 'payment_uploaded' && (
        <div className={styles.card}>
          <div className={styles.waitingCard}>
            <div className={styles.waitingPulse}></div>
            <h3>Bukti Transfer Sudah Dikirim</h3>
            <p>Menunggu konfirmasi dari penjual. Anda akan menerima notifikasi WhatsApp saat pembayaran dikonfirmasi.</p>
            <button className={styles.refreshBtn} onClick={fetchOrder}>🔄 Cek Status</button>
          </div>
        </div>
      )}

      {/* Status: Paid */}
      {order.status === 'paid' && (
        <div className={styles.successCard}>
          <h3>🎉 Pembayaran Dikonfirmasi!</h3>
          <p>Pesanan Anda sedang diproses oleh penjual. Terima kasih!</p>
        </div>
      )}

      {/* Status: Cancelled */}
      {order.status === 'cancelled' && (
        <div className={styles.cancelledCard}>
          <h3>Pesanan Dibatalkan</h3>
          <p>Pembayaran Anda ditolak oleh penjual. Silakan hubungi toko untuk informasi lebih lanjut.</p>
        </div>
      )}

      {/* Proof image if exists */}
      {order.payment_proof_url && (
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>🧾 Bukti Transfer Anda</h3>
          <img src={order.payment_proof_url} alt="Bukti Transfer" className={styles.proofImage} />
        </div>
      )}
    </div>
  );
}
