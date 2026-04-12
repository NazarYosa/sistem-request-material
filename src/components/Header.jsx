// src/components/Header.jsx
import React from "react";

const Header = ({ viewMode, setViewMode, selectedDate, setSelectedDate }) => {
  const navItems = [
    { id: "scan", label: "SCAN" },
    { id: "input", label: "INPUT DB" },
    { id: "manual", label: "MANUAL REQ" },
    { id: "history", label: "HISTORY" },
  ];

  return (
    <div className="flex-none bg-white shadow-sm z-20 print:hidden border-b border-gray-200 sticky top-0">
      {/* Container utama dengan height full untuk menyelaraskan garis bawah */}
      <div className="px-6 h-16 flex justify-between items-center">
        {/* KIRI: LOGO & JUDUL */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col justify-center leading-none">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              PT VUTEQ INDONESIA
            </h1>
            <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-1">
              Production C - INJECTION
            </p>
          </div>
        </div>

        {/* TENGAH: NAVBAR MENU (GAYA LINK MODERN) */}
        <nav className="hidden md:flex items-center gap-8 h-full">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setViewMode(item.id)}
              className={`relative h-full flex items-center text-sm font-bold tracking-wide transition-colors ${
                viewMode === item.id
                  ? "text-blue-600"
                  : "text-slate-400 hover:text-slate-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* KANAN: TANGGAL */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-colors hover:border-blue-300">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              TGL:
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
