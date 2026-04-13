// // src/components/Header.jsx
// import React from "react";

// const Header = ({ viewMode, setViewMode, selectedDate, setSelectedDate }) => {
//   const navItems = [
//     { id: "scan", label: "SCAN" },
//     { id: "input", label: "INPUT DB" },
//     { id: "info", label: "INFO PART" },
//     { id: "manual", label: "MANUAL REQ" },
//     { id: "history", label: "HISTORY" },
//   ];

//   return (
//     <div className="flex-none bg-white shadow-sm z-20 print:hidden border-b border-gray-200 sticky top-0">
//       {/* Container utama dengan height full untuk menyelaraskan garis bawah */}
//       <div className="px-6 h-16 flex justify-between items-center">
//         {/* KIRI: LOGO & JUDUL */}
//         <div className="flex items-center gap-3">
//           <div className="flex flex-col justify-center leading-none">
//             <h1 className="text-xl font-black text-slate-900 tracking-tight">
//               PT VUTEQ INDONESIA
//             </h1>
//             <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-1">
//               Production C - INJECTION
//             </p>
//           </div>
//         </div>

//         {/* TENGAH: NAVBAR MENU (GAYA LINK MODERN) */}
//         <nav className="hidden md:flex items-center gap-8 h-full">
//           {navItems.map((item) => (
//             <button
//               key={item.id}
//               onClick={() => setViewMode(item.id)}
//               className={`relative h-full flex items-center text-sm font-bold tracking-wide transition-colors ${
//                 viewMode === item.id
//                   ? "text-blue-600"
//                   : "text-slate-400 hover:text-slate-800"
//               }`}
//             >
//               {item.label}
//             </button>
//           ))}
//         </nav>

//         {/* KANAN: TANGGAL */}
//         <div className="flex items-center gap-3">
//           <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-colors hover:border-blue-300">
//             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
//               TGL:
//             </label>
//             <input
//               type="date"
//               value={selectedDate}
//               onChange={(e) => setSelectedDate(e.target.value)}
//               className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Header;


// src/components/Header.jsx
import React from "react";

const Header = ({ viewMode, setViewMode, selectedDate, setSelectedDate }) => {
  const navItems = [
    { id: "scan", label: "SCAN" },
    { id: "input", label: "INPUT DB" },
    { id: "info", label: "INFO PART" }, 
    { id: "manual", label: "MANUAL REQ" },
    { id: "history", label: "HISTORY" },
  ];

  return (
    <div className="flex-none bg-white shadow-sm z-20 print:hidden border-b border-slate-200 sticky top-0">
      <div className="flex flex-col md:flex-row justify-between w-full">
        
        {/* BARIS ATAS (MOBILE): Logo & Tanggal */}
        <div className="flex justify-between items-center px-4 md:px-6 py-3 md:py-0 md:h-16">
          <div className="flex flex-col justify-center leading-none">
            <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
              PT VUTEQ INDONESIA
            </h1>
            <p className="text-[8px] md:text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-1">
              Production C - INJECTION
            </p>
          </div>
          {/* Tanggal khusus versi HP (Kecil di kanan atas) */}
          <div className="flex md:hidden items-center gap-1.5 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200 shadow-sm">
            <label className="text-[9px] font-black text-slate-400 uppercase">TGL:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-[10px] font-bold text-slate-700 bg-transparent outline-none w-[95px]"
            />
          </div>
        </div>

        {/* BARIS BAWAH (MOBILE) / TENGAH (DESKTOP): Menu Navigasi */}
        <nav className="flex items-center gap-2 md:gap-8 overflow-x-auto custom-scrollbar px-4 md:px-0 pb-3 md:pb-0 pt-1 md:pt-0 md:h-16">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setViewMode(item.id)}
              className={`relative whitespace-nowrap px-4 py-2.5 md:p-0 flex items-center text-[10px] md:text-sm font-bold tracking-wide transition-colors rounded-lg md:rounded-none md:h-full ${
                viewMode === item.id
                  ? "bg-slate-900 text-white md:bg-transparent md:text-blue-600 md:border-b-[3px] md:border-blue-600"
                  : "bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 md:bg-transparent md:border-none"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* KANAN (DESKTOP): Tanggal versi PC */}
        <div className="hidden md:flex items-center pr-6 h-16">
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-colors hover:border-blue-300">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TGL:</label>
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