// src/components/Header.jsx
import React from "react";

const Header = ({ viewMode, setViewMode, selectedDate, setSelectedDate }) => {
  // URUTAN MENU SUDAH DISESUAIKAN
  const navItems = [
    { id: "scan", label: "SCAN" },
    { id: "manual", label: "MANUAL REQ" },
    { id: "input", label: "INPUT DB" },
    { id: "history", label: "HISTORY" },
  ];

  return (
    <div className="flex-none bg-white shadow-sm z-20 print:hidden border-b border-gray-200 sticky top-0">
      <div className="px-6 h-16 flex justify-between items-center relative">
        {/* KIRI: LOGO & JUDUL */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col justify-center leading-none">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              VUTEQ <span className="text-blue-600">LABEL SYSTEM</span>
            </h1>
            <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-1">
              Production Plan Reader
            </p>
          </div>
        </div>

        {/* TENGAH: NAVBAR MENU */}
        <nav className="hidden md:flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setViewMode(item.id)}
              className={`px-6 py-2 text-xs font-bold rounded-lg transition-all ${
                viewMode === item.id
                  ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* KANAN: TANGGAL */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-colors hover:border-blue-300">
            <label className="text-[10px] font-black uppercase tracking-widest">
              TANGGAL
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
