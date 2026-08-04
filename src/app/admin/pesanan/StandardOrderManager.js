'use client';

import { useState, useTransition } from 'react';
import { updateOrderStatus } from '@/app/actions/store';

export default function StandardOrderManager({ store, initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedOrders, setExpandedOrders] = useState({});
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = async (orderId, newStatus) => {
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, newStatus);
      if (res.error) {
        alert(res.error);
      } else {
        setOrders((prev) =>
          prev.map((ord) =>
            ord.id === orderId ? { ...ord, status: newStatus } : ord
          )
        );
      }
    });
  };

  const handlePrintReceipt = (ord) => {
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    const itemsHtml = ord.order_items.map(item => `
      <tr style="font-size: 11px; font-family: monospace;">
        <td style="padding: 4px 0; max-width: 170px; word-wrap: break-word;">${item.product_name}</td>
        <td style="padding: 4px 0; text-align: center;">${item.quantity}x</td>
        <td style="text-align: right; padding: 4px 0;">Rp ${(parseFloat(item.price) * item.quantity).toLocaleString('id-ID')}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Struk Invoice ${ord.invoice_number}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body { font-family: 'Courier New', Courier, monospace; width: 260px; padding: 10px; margin: 0; color: #000; background: #fff; }
            .header { text-align: center; margin-bottom: 8px; }
            .title { font-size: 14px; font-weight: bold; margin: 0; text-transform: uppercase; }
            .divider { border-top: 1px dashed #000; margin: 6px 0; }
            .info { font-size: 10px; line-height: 1.4; margin-bottom: 5px; }
            .table { width: 100%; border-collapse: collapse; }
            .total { font-weight: bold; font-size: 12px; }
            .footer { text-align: center; margin-top: 15px; font-size: 9px; line-height: 1.3; }
          </style>
        </head>
        <body>
          <div class="header">
            <p class="title">${store.name}</p>
            ${store.tagline ? `<p style="font-size: 8px; margin: 2px 0;">${store.tagline}</p>` : ''}
            ${store.address ? `<p style="font-size: 8px; margin: 2px 0; font-style: italic;">${store.address}</p>` : ''}
          </div>
          <div class="divider"></div>
          <div class="info">
            <div>Invoice : ${ord.invoice_number}</div>
            <div>Tanggal : ${new Date(ord.created_at).toLocaleString('id-ID')}</div>
            <div>Pemesak : ${ord.customer_name}</div>
            <div>HP      : ${ord.customer_phone}</div>
            <div>Layanan : ${ord.customer_address}</div>
          </div>
          <div class="divider"></div>
          <table class="table">
            <thead>
              <tr style="font-size: 9px; font-weight: bold; border-bottom: 1px dashed #000; text-align: left;">
                <th style="padding-bottom: 4px;">Menu</th>
                <th style="padding-bottom: 4px; text-align: center;">Qty</th>
                <th style="padding-bottom: 4px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="divider"></div>
          <table class="table">
            <tr class="total">
              <td>TOTAL</td>
              <td style="text-align: right;">Rp ${parseFloat(ord.total_amount).toLocaleString('id-ID')}</td>
            </tr>
          </table>
          ${ord.notes ? `
            <div class="divider"></div>
            <div style="font-size: 10px; font-style: italic;">
              Catatan: "${ord.notes}"
            </div>
          ` : ''}
          <div class="divider"></div>
          <div class="footer">
            <p>Terima Kasih Atas Kunjungan Anda</p>
            <p>Didukung oleh Platform CMS UMKM</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.customer_phone.includes(searchTerm);

    const matchesStatus = filterStatus === 'all' || ord.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* RESTO POS Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Menunggu Bayar</p>
            <h4 className="text-2xl font-bold text-orange-600 mt-1">
              {orders.filter((o) => o.status === 'pending').length}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-600 flex items-center justify-center font-bold">⏳</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sedang Dimasak</p>
            <h4 className="text-2xl font-bold text-blue-600 mt-1">
              {orders.filter((o) => o.status === 'paid').length}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 flex items-center justify-center font-bold">🍳</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Siap Disajikan</p>
            <h4 className="text-2xl font-bold text-emerald-600 mt-1">
              {orders.filter((o) => o.status === 'ready').length}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 flex items-center justify-center font-bold">🍽️</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Penjualan</p>
            <h4 className="text-xl font-bold text-slate-800 dark:text-white mt-1">
              Rp {orders.filter(o => o.status !== 'canceled').reduce((acc, o) => acc + parseFloat(o.total_amount), 0).toLocaleString('id-ID')}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center font-bold">💰</div>
        </div>
      </div>

      {/* POS Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Cari nomor invoice, nama pelanggan, atau no HP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-slate-700 dark:text-slate-300"
          />
          <span className="absolute left-3.5 top-2.5 text-slate-400">🔍</span>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {[
            { value: 'all', label: 'Semua' },
            { value: 'pending', label: 'Menunggu Bayar' },
            { value: 'paid', label: 'Diproses/Dimasak' },
            { value: 'ready', label: 'Siap Sajikan' },
            { value: 'completed', label: 'Selesai' },
            { value: 'canceled', label: 'Dibatalkan' }
          ].map((st) => (
            <button
              key={st.value}
              onClick={() => setFilterStatus(st.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-colors ${
                filterStatus === st.value
                  ? 'bg-slate-800 dark:bg-slate-100 border-slate-800 dark:border-slate-100 text-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resto Modern POS Table List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-950/75 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-5 w-8"></th>
                <th className="p-5">Invoice</th>
                <th className="p-5">Pelanggan</th>
                <th className="p-5">Layanan/Meja</th>
                <th className="p-5">Total</th>
                <th className="p-5">Status POS</th>
                <th className="p-5 text-right">Rincian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-slate-400">
                    Tidak ditemukan data transaksi pesanan.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const createdDate = new Date(ord.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  const isExpanded = !!expandedOrders[ord.id];

                  return (
                    <React.Fragment key={ord.id}>
                      <tr className="hover:bg-slate-50/40 dark:hover:bg-slate-950/40 transition-colors">
                        <td className="p-5">
                          <button
                            onClick={() => toggleExpand(ord.id)}
                            className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 font-bold transition-all"
                          >
                            {isExpanded ? '−' : '+'}
                          </button>
                        </td>
                        <td className="p-5 font-mono font-bold text-orange-600">
                          {ord.invoice_number}
                          <span className="block text-[9px] text-slate-400 font-normal font-sans mt-0.5">
                            {createdDate}
                          </span>
                        </td>
                        <td className="p-5 font-semibold text-slate-800 dark:text-slate-200">
                          {ord.customer_name}
                          <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                            {ord.customer_phone}
                          </span>
                        </td>
                        <td className="p-5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                            ord.customer_address.includes('Meja')
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400'
                          }`}>
                            {ord.customer_address}
                          </span>
                        </td>
                        <td className="p-5 font-bold text-slate-800 dark:text-white">
                          Rp {parseFloat(ord.total_amount).toLocaleString('id-ID')}
                        </td>
                        <td className="p-5">
                          <select
                            value={ord.status}
                            disabled={isPending}
                            onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border cursor-pointer focus:outline-none ${
                              ord.status === 'pending'
                                ? 'bg-orange-50 text-orange-700 border-orange-200/40 dark:bg-orange-950/20 dark:text-orange-400'
                                : ord.status === 'paid'
                                ? 'bg-blue-50 text-blue-700 border-blue-200/40 dark:bg-blue-950/20 dark:text-blue-400'
                                : ord.status === 'ready'
                                ? 'bg-amber-50 text-amber-700 border-amber-200/40 dark:bg-amber-950/20 dark:text-amber-400'
                                : ord.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/40 dark:bg-emerald-950/20 dark:text-emerald-400'
                                : 'bg-red-50 text-red-700 border-red-200/40 dark:bg-red-950/20 dark:text-red-400'
                            }`}
                          >
                            <option value="pending">Menunggu Bayar ⏳</option>
                            <option value="paid">Memasak/Diproses 🍳</option>
                            <option value="ready">Siap Disajikan 🍽️</option>
                            <option value="completed">Selesai 🏁</option>
                            <option value="canceled">Dibatalkan ❌</option>
                          </select>
                        </td>
                        <td className="p-5 text-right">
                          <button
                            onClick={() => toggleExpand(ord.id)}
                            className="text-orange-600 hover:text-orange-700 font-semibold"
                          >
                            {isExpanded ? 'Tutup Detail' : 'Lihat Detail'}
                          </button>
                        </td>
                      </tr>

                      {/* Collapsible Order Items details section */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="7" className="p-5 bg-slate-50/50 dark:bg-slate-950/30">
                            <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/60 p-4 space-y-4">
                              <div>
                                <h5 className="font-bold text-slate-700 dark:text-slate-350 text-[10px] uppercase tracking-wider mb-2">Item yang Dipesan:</h5>
                                <div className="space-y-2">
                                  {ord.order_items?.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex justify-between items-center text-xs py-1.5 border-b border-slate-50 dark:border-slate-800/30 last:border-b-0"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <span className="font-bold text-slate-800 dark:text-white">{item.product_name}</span>
                                        <span className="text-[10px] text-slate-400 ml-2">({item.quantity}x)</span>
                                      </div>
                                      <div className="text-right font-mono font-semibold text-slate-650 dark:text-slate-400">
                                        Rp {(parseFloat(item.price) * item.quantity).toLocaleString('id-ID')}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {ord.notes && (
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                  <h6 className="font-bold text-slate-700 dark:text-slate-350 text-[10px] uppercase tracking-wider">Catatan Pembeli:</h6>
                                  <p className="text-slate-500 dark:text-slate-400 italic text-[11px] mt-1 whitespace-pre-wrap">
                                    &ldquo;{ord.notes}&rdquo;
                                  </p>
                                </div>
                              )}

                              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <button
                                  onClick={() => handlePrintReceipt(ord)}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                                >
                                  <span>Cetak Struk 🖨️</span>
                                </button>
                                {ord.notes && (
                                  <span className="text-[10px] text-slate-400 italic">Ada catatan khusus dari pembeli</span>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Simple React stub for next.js imports
import React from 'react';
