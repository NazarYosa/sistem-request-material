// src/components/Sidebar.jsx
import React, { useState } from "react";

const Sidebar = ({ viewMode, setViewMode }) => {
  const [isOpen, setIsOpen] = useState(false); // default TERTUTUP

  const navItems = [
    { id: "scan", label: "SCAN", icon: "📷" },
    { id: "input", label: "INPUT DB", icon: "🗃️" },
    { id: "info", label: "INFO PART", icon: "🔍" },
    { id: "manual", label: "MANUAL REQ", icon: "✏️" },
    { id: "stock", label: "STOK DASHBOARD", icon: "📊" },
  ];

  const handleSelect = (id) => {
    setViewMode(id);
    setIsOpen(false); // otomatis nutup abis milih menu
  };

  return (
    <>
      {/* TOMBOL TOGGLE — selalu nempel di tepi kanan layar */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed top-1/2 -translate-y-1/2 right-0 z-50 bg-slate-900/70 hover:bg-slate-900 text-white w-4 h-10 rounded-l-md flex items-center justify-center shadow-md transition-all print:hidden"
        title={isOpen ? "Tutup Menu" : "Buka Menu"}
      >
        <span className="text-[9px] leading-none">{isOpen ? "▶" : "◀"}</span>
      </button>

      {/* BACKDROP — klik buat nutup */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-40 print:hidden"
        />
      )}

      {/* PANEL SIDEBAR — slide dari kanan */}
      <div
        className={`fixed top-0 right-0 h-screen w-64 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out print:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* LOGO */}
        <div className="px-5 py-5 border-b border-slate-100">
          <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">
            PT VUTEQ INDONESIA
          </h1>
          <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-1.5">
            Production C - INJECTION
          </p>
        </div>

        {/* MENU NAVIGASI */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1 custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-colors text-left ${
                viewMode === item.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
