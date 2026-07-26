import React, { useState, useEffect } from 'react';

export default function FooterNav({
  machines,
  activeMachine,
  setActiveMachine,
  onImportExcel,
  syncStatus,
}) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const jam = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const tanggal = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="px-3 py-2 flex items-center bg-slate-50 border-t border-slate-200">

      {/* Tombol Upload */}
      <div className="flex-none mr-4">
        <button
          onClick={onImportExcel}
          className="text-[11px] font-bold text-slate-400 hover:text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer group"
          title="Import Jadwal Excel"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          {syncStatus === "OFFLINE" ? "UPLOAD FILE" : syncStatus}
        </button>
      </div>

      {/* Tab Mesin */}
      <div className="flex-1 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2">
          {machines.map((machine) => (
            <button
              key={machine}
              onClick={() => setActiveMachine(machine)}
              className={`
                relative flex-none px-4 py-1.5 rounded-md font-bold text-sm transition-all duration-300 ease-in-out select-none
                ${
                  activeMachine === machine
                    ? "bg-emerald-600 text-white shadow-sm border border-emerald-500"
                    : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-700"
                }
              `}
            >
              {machine} T
            </button>
          ))}
        </div>
      </div>

      {/* Jam Windows */}
      <div className="flex-none ml-5 text-right leading-tight select-none min-w-[170px]">
        <div className="text-[18px] font-semibold text-slate-700 tracking-wide font-mono">
          {jam}
        </div>
        <div className="text-[11px] text-slate-500 capitalize whitespace-nowrap">
          {tanggal}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .hide-scrollbar::-webkit-scrollbar{display:none;}
            .hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none;}
          `,
        }}
      />
    </div>
  );
}

// import React from 'react';

// export default function FooterNav({ machines, activeMachine, setActiveMachine, onImportExcel, syncStatus }) {
//   return (
//     <div className="px-3 py-2 flex items-center bg-slate-50 border-t border-slate-200">
      
//       {/* Tombol Upload Excel */}
//       <div className="flex-none mr-4">
//         <button 
//           onClick={onImportExcel}
//           className="text-[11px] font-bold text-slate-400 hover:text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer group"
//           title="Import Jadwal Excel"
//         >
//           <svg className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
//           {syncStatus === "OFFLINE" ? "UPLOAD FILE" : syncStatus}
//         </button>
//       </div>

//       {/* Tab Mesin */}
//       <div className="flex-1 overflow-x-auto hide-scrollbar">
//         <div className="flex gap-2">
//           {machines.map((machine) => (
//             <button
//               key={machine}
//               onClick={() => setActiveMachine(machine)}
//               className={`
//                 relative flex-none px-4 py-1.5 rounded-md font-bold text-sm transition-all duration-300 ease-in-out select-none
//                 ${activeMachine === machine ? "bg-emerald-600 text-white shadow-sm border border-emerald-500" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-700"}
//               `}
//             >
//               {machine} T
//             </button>
//           ))}
//         </div>
//       </div>
//       <style dangerouslySetInnerHTML={{__html: `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}} />
//     </div>
//   );
// }