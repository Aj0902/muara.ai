'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import styles from '../../../orderPage.module.css';

function normalizePhone(rawPhone) {
  if (!rawPhone) return '';
  let phone = String(rawPhone).replace(/[^0-9]/g, '');
  if (phone.startsWith('6208')) {
    phone = '62' + phone.slice(4);
  } else if (phone.startsWith('08')) {
    phone = '62' + phone.slice(1);
  } else if (phone.startsWith('0')) {
    phone = '62' + phone.slice(1);
  } else if (!phone.startsWith('62')) {
    phone = '62' + phone;
  }
  return phone;
}

export default function UMKMOrderPage() {
  const routeParams = useParams();
  const token = routeParams?.token;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');

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

  // REDIRECT DIRECTLY TO WHATSAPP WEB / APP FOR UMKM OWNER TO SEND INVOICE
  const handleTagih = async () => {
    if (!order) return;
    setActionLoading('tagih');
    try {
      // Update order status to waiting_payment_proof
      await fetch(`/api/orders/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'waiting_payment_proof' })
      });

      const baseUrl = 'https://muara-ai.vercel.app';
      const cleanPhone = normalizePhone(order.customer_phone);
      const textMessage = `Halo ${order.customer_name}, berikut detail tagihan pesanan Anda (#${order.invoice_number}):\n\n` +
        `💰 *Total:* Rp ${Number(order.total_amount).toLocaleString('id-ID')}\n\n` +
        `Silakan lakukan pembayaran dan upload bukti transfer di link berikut:\n` +
        `🔗 ${baseUrl}/pesanan/bayar/${token}\n\n` +
        `Terima kasih! 🙏`;

      // Redirect directly to WhatsApp chat
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(textMessage)}`, '_blank');

      await fetchOrder();
    } catch (e) {
      alert('Gagal memperbarui status: ' + e.message);
    } finally {
      setActionLoading('');
    }
  };

  const handleConfirm = async () => {
    if (!confirm('Konfirmasi bahwa pembayaran sudah diverifikasi & lunas?')) return;
    setActionLoading('confirm');
    try {
      await fetch(`/api/orders/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' })
      });

      // Notify customer via WA
      const baseUrl = 'https://muara-ai.vercel.app';
      const textMessage = `✅ *PEMBAYARAN DIVERIFIKASI & LUNAS!*\n\n` +
        `Pembayaran Anda untuk pesanan #${order.invoice_number} telah dikonfirmasi & diverifikasi oleh penjual. Pesanan Anda sedang diproses!\n\n` +
        `🔗 *Cek Status:* ${baseUrl}/pesanan/bayar/${token}\n\n` +
        `Terima kasih! 🎉`;

      await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: order.customer_phone,
          message: textMessage
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

      // Notify customer via WA
      const textMessage = `❌ *PEMBAYARAN DITOLAK*\n\n` +
        `Pembayaran untuk pesanan #${order.invoice_number} ditolak oleh penjual. Silakan hubungi penjual untuk informasi lebih lanjut.`;

      await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: order.customer_phone,
          message: textMessage
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
    pending: '🕐 Menunggu Dikirim Tagihan',
    waiting_payment_proof: '⏳ Menunggu Bukti Transfer',
    payment_uploaded: '📎 Bukti Transfer Diterima (Perlu Verifikasi)',
    paid: '✅ Lunas & Diverifikasi',
    completed: '✅ Selesai',
    cancelled: '❌ Dibatalkan',
    ready: '📦 Siap'
  };

  // Extract payment method from notes
  const paymentMethodMatch = order?.notes?.match(/Metode Bayar:\s*([^|]+)/i);
  const paymentMethodText = paymentMethodMatch ? paymentMethodMatch[1].trim() : 'Transfer / QRIS';

  if (loading) return (
    <div className={styles.container}>
      <div className={styles.loadingSpinner}></div>
      <p style={{ textAlign: 'center', color: '#94a3b8' }}>Memuat detail pesanan...</p>
    </div>
  );

  if (error || !order) return (
    <div className={styles.container}>
      <div className={styles.errorCard}>
        <h2>❌ Pesanan Tidak Ditemukan</h2>
        <p>{error || 'Maaf, pesanan dengan token ini tidak ditemukan.'}</p>
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
        <h3 className={styles.sectionTitle}>💳 Metode Pembayaran</h3>
        <div className={styles.paymentMethodBadge}>
          {paymentMethodText}
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
          <h3 className={styles.sectionTitle}>🧾 Bukti Transfer Uploaded</h3>
          <img src={order.payment_proof_url} alt="Bukti Transfer" className={styles.proofImage} />
        </div>
      )}

      {/* Action Buttons */}
      <div className={styles.actionArea}>
        {order.status === 'pending' && (
          <button className={styles.actionBtn} onClick={handleTagih} disabled={!!actionLoading}>
            {actionLoading === 'tagih' ? '⏳ Membuka WhatsApp...' : '📩 Tagih Pelanggan via WhatsApp (Redirect)'}
          </button>
        )}

        {order.status === 'waiting_payment_proof' && (
          <div className={styles.waitingCard}>
            <div className={styles.waitingPulse}></div>
            <p>Menunggu pelanggan mengunggah bukti transfer...</p>
            <button className={styles.refreshBtn} onClick={fetchOrder}>🔄 Refresh Status</button>
          </div>
        )}

        {order.status === 'payment_uploaded' && (
          <>
            <button className={styles.actionBtn} onClick={handleConfirm} disabled={!!actionLoading}>
              {actionLoading === 'confirm' ? '⏳ Verifikasi...' : '✅ Konfirmasi Lunas & Verifikasi'}
            </button>
            <button className={styles.actionBtnReject} onClick={handleReject} disabled={!!actionLoading}>
              {actionLoading === 'reject' ? '⏳ Memproses...' : '❌ Tolak Pembayaran'}
            </button>
          </>
        )}

        {order.status === 'paid' && (
          <div className={styles.successCard}>
            <p>🎉 Pembayaran sudah diverifikasi lunas! Pesanan sedang diproses.</p>
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
