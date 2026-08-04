'use client';

import { useState, useTransition } from 'react';
import { updateSpecialOrderStatus } from '@/app/actions/store';

export default function SpecialOrderManager({ store, initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = async (orderId, newStatus) => {
    startTransition(async () => {
      const res = await updateSpecialOrderStatus(orderId, newStatus);
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

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.customer_phone.includes(searchTerm);

    const matchesStatus = filterStatus === 'all' || ord.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Overview stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Masuk</p>
            <h4 className="text-2xl font-bold text-slate-800 mt-1">{orders.length}</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">📋</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Belum Dihubungi</p>
            <h4 className="text-2xl font-bold text-red-600 mt-1">
              {orders.filter((o) => o.status === 'pending').length}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">⚠️</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Selesai Diproses</p>
            <h4 className="text-2xl font-bold text-emerald-600 mt-1">
              {orders.filter((o) => o.status === 'selesai').length}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">✓</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Cari nama pemesan atau detail rincian..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-slate-700"
          />
          <span className="absolute left-3.5 top-2.5 text-slate-400">🔍</span>
        </div>

        <div className="flex gap-2.5">
          {['all', 'pending', 'dihubungi', 'selesai'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors border ${
                filterStatus === st
                  ? 'bg-slate-800 border-slate-800 text-white dark:bg-slate-900'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st === 'all' ? 'Semua' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Table list of special orders */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-5">Tanggal Masuk</th>
                <th className="p-5">Nama Pemesan</th>
                <th className="p-5">Rincian Acara / Catering</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-400">
                    Tidak ditemukan data pesanan khusus.
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

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-5 text-slate-400 font-mono whitespace-nowrap">
                        {createdDate}
                      </td>
                      <td className="p-5 font-bold text-slate-800">
                        <div>{ord.customer_name}</div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                          {ord.customer_phone}
                        </div>
                      </td>
                      <td className="p-5 text-slate-600 max-w-sm whitespace-pre-wrap leading-relaxed">
                        {ord.notes}
                      </td>
                      <td className="p-5 whitespace-nowrap">
                        <select
                          value={ord.status}
                          disabled={isPending}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border cursor-pointer focus:outline-none ${
                            ord.status === 'pending'
                              ? 'bg-red-50 text-red-700 border-red-200/40'
                              : ord.status === 'dihubungi'
                              ? 'bg-blue-50 text-blue-700 border-blue-200/40'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200/40'
                          }`}
                        >
                          <option value="pending">Pending ⚠️</option>
                          <option value="dihubungi">Dihubungi 📱</option>
                          <option value="selesai">Selesai ✓</option>
                        </select>
                      </td>
                      <td className="p-5 text-right whitespace-nowrap">
                        <a
                          href={`https://wa.me/${ord.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Halo kak ${ord.customer_name},\nKami dari ${store.name} ingin mengonfirmasi detail Formulir Pesanan Khusus (Acara/Katering) yang kakak kirimkan di website kami.\n\nDetail:\n"${ord.notes}"`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold shadow transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          Hubungi WA
                        </a>
                      </td>
                    </tr>
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
