import styles from '../../orderPage.module.css';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic'; // ensure fresh data

export default async function UMKMOrderPage({ params }) {
  const { token } = params;
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/orders/${token}`);
  const { order, error } = await res.json();
  if (error) return <div className={styles.container}>❌ {error}</div>;

  const handleTagih = async () => {
    const message = `Silakan transfer total ${order.total_amount} ke toko kami. Detail: ${process.env.NEXT_PUBLIC_BASE_URL || ''}/pesanan/bayar/${token}`;
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
    // Revalidate client-side (optional)
    revalidatePath(`/pesanan/kelola/${token}`);
    // refresh page
    window.location.reload();
  };

  const handleConfirm = async () => {
    await fetch(`/api/orders/${token}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paid' })
    });
    window.location.reload();
  };

  const handleReject = async () => {
    await fetch(`/api/orders/${token}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' })
    });
    window.location.reload();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Detail Pesanan #{order.invoice_number}</h1>
      <div className={styles.card}>
        <p><strong>Pelanggan:</strong> {order.customer_name}</p>
        <p><strong>Telepon:</strong> {order.customer_phone}</p>
        <p><strong>Alamat/Meja:</strong> {order.customer_address}</p>
        <p><strong>Total:</strong> Rp {order.total_amount.toLocaleString()}</p>
        <p><strong>Status:</strong> <span className={styles[`status-${order.status}`]}>{order.status}</span></p>
        <h3>Item:</h3>
        <ul className={styles.itemList}>
          {order.order_items.map((it) => (
            <li key={it.id}>{it.product_name} - {it.quantity} × Rp {it.price.toLocaleString()}</li>
          ))}
        </ul>
        {order.status === 'pending' && (
          <button className={styles.actionBtn} onClick={handleTagih}>📩 Tagih Pelanggan via WA</button>
        )}
        {order.status === 'payment_uploaded' && (
          <>
            <button className={styles.actionBtn} onClick={handleConfirm}>✅ Konfirmasi Lunas</button>
            <button className={styles.actionBtnReject} onClick={handleReject}>❌ Tolak Pembayaran</button>
          </>
        )}
      </div>
    </div>
  );
}
