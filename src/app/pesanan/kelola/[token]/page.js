'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from '../../orderPage.module.css';

export default function UMKMOrderPage({ params }) {
  const { token } = params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');

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

  const handleTagih = async () => {
    setActionLoading('tagih');
    try {
      const baseUrl = window.location.origin;
      const message = `Halo ${order.customer_name}, berikut detail tagihan pesanan Anda (${order.invoice_number}):\n\nTotal: Rp ${Number(order.total_amount).toLocaleString('id-ID')}\n\nSilakan lakukan pembayaran dan upload bukti transfer di link berikut:\n${baseUrl}/pesanan/bayar/${token}\n\nTerima kasih! 🙏`;
      
      await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: order.customer_phone, message })
      });

      await fetch(`/api/orders/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'waiting_payment_proof' })
      });

      await fetchOrder();
    } catch (e) {
      alert('Gagal mengirim tagihan: ' + e.message);
    } finally {
      setActionLoading('');
    }
  };

  const handleConfirm = async () => {
    if (!confirm('Konfirmasi bahwa pembayaran sudah diterima?')) return;
    setActionLoading('confirm');
    try {
      await fetch(`/api/orders/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' })
      });

      // Notify customer
      const baseUrl = window.location.origin;
      await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          to: order.customer_phone, 
          message: `✅ Pembayaran pesanan ${order.invoice_number} telah dikonfirmasi! Pesanan Anda sedang diproses.\n\nCek status: ${baseUrl}/pesanan/bayar/${token}\n\nTerima kasih! 🎉` 
        })
      });

      await fetchOrder();
    } catch (e) {
      alert('Gagal mengkonfirmasi: ' + e.message);
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async () => {
    if (!confirm('Tolak pembayaran ini? Pelanggan akan diberitahu via WhatsApp.')) return;
    setActionLoading('reject');
    try {
      await fetch(`/api/orders/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });

      // Notify customer
      await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          to: order.customer_phone, 
          message: `❌ Pembayaran pesanan ${order.invoice_number} ditolak oleh penjual. Silakan hubungi toko untuk informasi lebih lanjut.` 
        })
      });

      await fetchOrder();
    } catch (e) {
      alert('Gagal menolak: ' + e.message);
    } finally {
      setActionLoading('');
    }
  };

  const statusLabels = {
    pending: '🕐 Menunggu Dikirim',
    waiting_payment_proof: '⏳ Menunggu Bukti Transfer',
    payment_uploaded: '📎 Bukti Transfer Diterima',
    paid: '✅ Lunas',
    completed: '✅ Selesai',
    cancelled: '❌ Dibatalkan',
    ready: '📦 Siap'
  };

  if (loading) return (
    <div className={styles.container}>
      <div className={styles.loadingSpinner}></div>
      <p style={{ textAlign: 'center', color: '#94a3b8' }}>Memuat detail pesanan...</p>
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
        <span className={styles.badge}>🏪 Panel UMKM</span>
        <h1 className={styles.title}>Pesanan #{order.invoice_number}</h1>
      </div>

      <div className={styles.statusBanner} data-status={order.status}>
        {statusLabels[order.status] || order.status}
      </div>

      <div className={styles.card}>
        <h3 className={styles.sectionTitle}>👤 Info Pelanggan</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Nama</span>
            <span className={styles.infoValue}>{order.customer_name}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>WhatsApp</span>
            <span className={styles.infoValue}>{order.customer_phone}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Alamat/Meja</span>
            <span className={styles.infoValue}>{order.customer_address}</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.sectionTitle}>🛒 Daftar Item</h3>
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
          <span>Total</span>
          <span className={styles.totalAmount}>Rp {Number(order.total_amount).toLocaleString('id-ID')}</span>
        </div>
      </div>

      {order.notes && (
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>📝 Catatan</h3>
          <p className={styles.notes}>{order.notes}</p>
        </div>
      )}

      {order.payment_proof_url && (
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>🧾 Bukti Pembayaran</h3>
          <img src={order.payment_proof_url} alt="Bukti Transfer" className={styles.proofImage} />
        </div>
      )}

      {/* Action Buttons */}
      <div className={styles.actionArea}>
        {order.status === 'pending' && (
          <button className={styles.actionBtn} onClick={handleTagih} disabled={!!actionLoading}>
            {actionLoading === 'tagih' ? '⏳ Mengirim...' : '📩 Tagih Pelanggan via WhatsApp'}
          </button>
        )}

        {order.status === 'waiting_payment_proof' && (
          <div className={styles.waitingCard}>
            <div className={styles.waitingPulse}></div>
            <p>Menunggu pelanggan mengunggah bukti transfer...</p>
            <button className={styles.refreshBtn} onClick={fetchOrder}>🔄 Refresh</button>
          </div>
        )}

        {order.status === 'payment_uploaded' && (
          <>
            <button className={styles.actionBtn} onClick={handleConfirm} disabled={!!actionLoading}>
              {actionLoading === 'confirm' ? '⏳ Memproses...' : '✅ Konfirmasi Lunas'}
            </button>
            <button className={styles.actionBtnReject} onClick={handleReject} disabled={!!actionLoading}>
              {actionLoading === 'reject' ? '⏳ Memproses...' : '❌ Tolak Pembayaran'}
            </button>
          </>
        )}

        {order.status === 'paid' && (
          <div className={styles.successCard}>
            <p>🎉 Pembayaran sudah dikonfirmasi! Pesanan sedang diproses.</p>
          </div>
        )}

        {order.status === 'cancelled' && (
          <div className={styles.cancelledCard}>
            <p>Pesanan ini telah dibatalkan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
