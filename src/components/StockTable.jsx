import React from 'react';

export default function StockTable({ data = [] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 font-medium text-sm">
        Belum ada daftar part master untuk mesin ini di database.
      </div>
    );
  }

  // ========================================================
  // LOGIKA GRID AUTO-FIT (Kunci untuk Penuh 100% Layar)
  // ========================================================
  const len = data.length;
  let cols = 1;
  let rows = 1;

  // Mengatur porsi pembagian kolom dan baris secara cerdas
  if (len <= 2) { cols = 2; rows = 1; }
  else if (len <= 4) { cols = 2; rows = 2; }
  else if (len <= 6) { cols = 3; rows = 2; }
  else if (len <= 8) { cols = 4; rows = 2; }
  else if (len <= 10) { cols = 5; rows = 2; }
  else if (len <= 12) { cols = 4; rows = 3; }
  else if (len <= 15) { cols = 5; rows = 3; }
  else if (len <= 18) { cols = 6; rows = 3; }
  else if (len <= 24) { cols = 6; rows = 4; }
  else { cols = 7; rows = Math.ceil(len / 7); } // Jika lebih dari 24, tambah baris

  return (
    // Gunakan inline-style untuk memaksa grid mengisi 100% tinggi (h-full) secara proporsional
    <div 
      className="grid gap-2 h-full w-full overflow-hidden pb-1"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
      }}
    >
      {data.map((fb, index) => {
        const isRightLeft = fb.partAssyFgRight || fb.partAssyFgLeft;
        const isSingle = fb.partAssyFg && !isRightLeft;
        const displayPartName = fb.partAssyName || fb.id.replace(/_/g, "/");

        return (
          // Kartu dibuat menggunakan flex flex-col justify-between agar kontennya merenggang rata jika kartunya membesar
          <div 
            key={fb.id || index} 
            className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col shadow-sm relative h-full overflow-hidden"
          >
            {/* Nomor Urut */}
            <div className="absolute top-0 left-0 bg-slate-800 text-white text-[10px] font-black px-2 py-0.5 rounded-br-lg rounded-tl-xl shadow-sm z-10">
              #{index + 1}
            </div>

<div className="flex-1 flex items-start mt-3 mb-2">
   <h3 className="text-xs sm:text-sm lg:text-base font-black text-slate-800 leading-tight line-clamp-3 w-full text-left">
     {displayPartName}
   </h3>
</div>

            {/* Area Data & QTY */}
            <div className="flex flex-col gap-1.5 w-full justify-end">
              
              {isRightLeft ? (
                <>
                  {fb.partAssyFgRight && (
                    <div className="bg-blue-50/70 rounded-lg p-2 border border-blue-100 flex items-center justify-between transition-all">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-200 text-blue-800 w-fit mb-0.5">R</span>
                        <span className="font-mono text-[10px] text-slate-500 font-bold leading-none">{fb.partAssyFgRight}</span>
                      </div>
                      <span className="text-2xl lg:text-3xl font-black text-slate-800 leading-none">{fb.qtyActRight || 0}</span>
                    </div>
                  )}
                  {fb.partAssyFgLeft && (
                    <div className="bg-orange-50/70 rounded-lg p-2 border border-orange-100 flex items-center justify-between transition-all">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-orange-200 text-orange-800 w-fit mb-0.5">L</span>
                        <span className="font-mono text-[10px] text-slate-500 font-bold leading-none">{fb.partAssyFgLeft}</span>
                      </div>
                      <span className="text-2xl lg:text-3xl font-black text-slate-800 leading-none">{fb.qtyActLeft || 0}</span>
                    </div>
                  )}
                </>
              ) : isSingle ? (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 flex items-center justify-between h-full min-h-12.5 transition-all">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">NO</span>
                    <span className="font-mono text-[11px] text-slate-600 font-bold leading-none">{fb.partAssyFg}</span>
                  </div>
                  <span className="text-4xl lg:text-5xl font-black text-slate-800 leading-none">{fb.qtyActSingle || 0}</span>
                </div>
              ) : (
                <div className="bg-red-50 rounded-lg p-2 border border-red-100 flex items-center justify-center h-full">
                  <span className="text-[11px] text-red-500 italic font-bold">Format tidak valid</span>
                </div>
              )}
              
            </div>
          </div>
        );
      })}
    </div>
  );
}