'use client';

import { useState } from 'react';

export default function ChatLogManager({ store, initialLogs }) {
  const [logs, setLogs] = useState(initialLogs);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Group logs by session_id
  const sessions = {};
  logs.forEach((log) => {
    if (!sessions[log.session_id]) {
      sessions[log.session_id] = {
        session_id: log.session_id,
        messages: [],
        lastActive: log.created_at
      };
    }
    sessions[log.session_id].messages.push(log);
    if (new Date(log.created_at) > new Date(sessions[log.session_id].lastActive)) {
      sessions[log.session_id].lastActive = log.created_at;
    }
  });

  // Convert to array and sort by last active date descending
  const sessionList = Object.values(sessions).sort(
    (a, b) => new Date(b.lastActive) - new Date(a.lastActive)
  );

  // Filter sessions by search term (searches session_id or message content)
  const filteredSessions = sessionList.filter((sess) => {
    const matchesId = sess.session_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesContent = sess.messages.some((msg) =>
      msg.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesId || matchesContent;
  });

  const selectedSession = sessions[selectedSessionId];

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Sidebar: Sessions list */}
      <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full shrink-0">
        {/* Search */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari sesi atau kata chat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-orange-500 text-slate-700 dark:text-slate-350"
            />
            <span className="absolute left-3.5 top-2.5 text-slate-400 text-xs">🔍</span>
          </div>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850 hide-scrollbar">
          {filteredSessions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Tidak ada sesi obrolan ditemukan.
            </div>
          ) : (
            filteredSessions.map((sess, idx) => {
              const lastMsg = sess.messages[sess.messages.length - 1];
              const isActive = selectedSessionId === sess.session_id;
              const formattedDate = new Date(sess.lastActive).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <button
                  key={sess.session_id}
                  onClick={() => setSelectedSessionId(sess.session_id)}
                  className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-850/50 flex flex-col gap-1 transition-colors ${
                    isActive ? 'bg-orange-50/50 dark:bg-orange-950/10 border-l-4 border-orange-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      Sesi Obrolan #{filteredSessions.length - idx}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {formattedDate}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate w-full">
                    ID: {sess.session_id.substring(0, 8)}...
                  </p>
                  {lastMsg && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate w-full mt-1.5 leading-relaxed font-light">
                      <span className="font-bold">{lastMsg.sender === 'user' ? 'User: ' : 'AI: '}</span>
                      {lastMsg.text}
                    </p>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Chat transcript detail */}
      <div className="flex-1 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col h-full">
        {selectedSession ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header info */}
            <div className="bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
              <div>
                <h4 className="font-bold text-slate-850 dark:text-white text-sm">
                  Transkrip Obrolan Sesi
                </h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  UUID: {selectedSession.session_id}
                </p>
              </div>
              <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-bold font-mono">
                {selectedSession.messages.length} Pesan
              </div>
            </div>

            {/* Message log list */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 hide-scrollbar bg-slate-50 dark:bg-slate-950/40">
              {selectedSession.messages.map((msg) => {
                const isUser = msg.sender === 'user';
                const time = new Date(msg.created_at).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[70%] ${
                      isUser ? 'self-end items-end' : 'self-start items-start'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-[9px] text-slate-400 uppercase tracking-wider mb-1 font-bold">
                      <span>{isUser ? '👤 Pengunjung' : '🤖 Asisten AI'}</span>
                      <span>•</span>
                      <span className="font-mono font-normal">{time}</span>
                    </div>
                    
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm border ${
                        isUser
                          ? 'bg-slate-800 border-slate-800 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900 rounded-tr-sm'
                          : 'bg-white border-slate-200/50 dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-350 rounded-tl-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap font-sans">{msg.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900/40 m-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 border-dashed">
            <span className="text-4xl mb-3">💬</span>
            <h4 className="font-serif font-bold text-slate-700 dark:text-slate-350 text-base">Pilih Sesi Obrolan</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
              Silakan pilih salah satu riwayat sesi di sebelah kiri untuk melihat transkrip lengkap percakapan pelanggan dengan Asisten AI.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
