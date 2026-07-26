// src/components/HeaderInfo.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';

export default function HeaderInfo({ db, activeMachine, jadwalMesin }) {
  // 1. STATE HARUS DI PALING ATAS
  const [waktuSekarang, setWaktuSekarang] = useState(new Date());
  const [actualHeader, setActualHeader] = useState(0); // State Actual dari Firebase

  // 2. JAM REAL-TIME
  useEffect(() => { 
    const timer = setInterval(() => setWaktuSekarang(new Date()), 1000); 
    return () => clearInterval(timer); 
  }, []);

  // 3. ENGINE WAKTU ABSOLUT
  const processedJadwal = useMemo(() => {
    let lastRawMins = -1; let dayOffset = 0;
    return jadwalMesin.map((item) => {
      let aStart = -1, aFinish = -1;
      if (item.start && item.start !== "-") {
        const [h, m] = item.start.split(":").map(Number); const sRaw = h * 60 + m;
        if (lastRawMins !== -1 && sRaw < lastRawMins && (lastRawMins - sRaw) > 200) dayOffset += 1440;
        aStart = sRaw + dayOffset; lastRawMins = sRaw;
      }
      if (item.finish && item.finish !== "-") {
        const [h, m] = item.finish.split(":").map(Number); const fRaw = h * 60 + m;
        if (lastRawMins !== -1 && fRaw < lastRawMins && (lastRawMins - fRaw) > 200) dayOffset += 1440;
        aFinish = fRaw + dayOffset; lastRawMins = fRaw;
      }
      return { ...item, aStart, aFinish };
    });
  }, [jadwalMesin]);

  // 4. LOGIKA PREVIOUS, CURRENT, NEXT SCHEDULE
  const { prevItem, currItem, nextItem } = useMemo(() => {
    let prev = null, curr = null, next = null;
    const nowH = waktuSekarang.getHours(); const nowM = waktuSekarang.getMinutes();
    let currentMins = nowH * 60 + nowM;
    if (nowH < 7 || (nowH === 7 && nowM < 30)) currentMins += 1440;

    processedJadwal.forEach((item) => {
      if (item.aStart !== -1 && item.aFinish !== -1) {
        if (currentMins >= item.aFinish) prev = item; 
        else if (currentMins >= item.aStart && currentMins < item.aFinish) curr = item;
        else if (currentMins < item.aStart && !next) next = item;
      }
    });
    return { prevItem: prev, currItem: curr, nextItem: next };
  }, [processedJadwal, waktuSekarang]);

  // 5. LISTENER FIREBASE REAL-TIME (Harus di bawah currItem)
  useEffect(() => {
    if (!activeMachine) return;

    // Listen ke dokumen "MESIN_XXXX"
    const unsub = onSnapshot(doc(db, "header_berjalan", `MESIN_${activeMachine}`), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Cek apakah Part ID di database sama dengan Part ID jadwal yang sedang jalan
        const runningPartId = currItem?.firebaseData?.id; 

        if (runningPartId && data.partId === runningPartId) {
          // Jika cocok, tampilkan angkanya
          setActualHeader(data.qtyActual || 0);
        } else {
          // Jika belum ada jadwal jalan atau part-nya beda (Job Change), paksa 0
          setActualHeader(0); 
        }
      } else {
        setActualHeader(0); // Jika dokumen belum pernah dibuat
      }
    });

    return () => unsub();
  }, [activeMachine, currItem]); 


  // ==========================================
  // RENDER TAMPILAN UI
  // ==========================================
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
      
      {/* SEBELUMNYA */}
      <div className="bg-slate-200 text-slate-600 rounded-lg p-3 flex flex-col justify-between border border-slate-300 shadow-inner opacity-90 h-full">
        <div>
          <p className="text-[9px] font-black uppercase tracking-wider mb-0.5 text-slate-500">⏮️ Sebelumnya</p>
          <h3 className="text-xs font-bold leading-tight line-clamp-1">{prevItem ? prevItem.namaPart : "TIDAK ADA JADWAL"}</h3>
          {prevItem && (
            <div className="mt-1.5 text-[9px] font-bold bg-slate-300/60 text-slate-600 w-fit px-2 py-0.5 rounded flex items-center">
              {prevItem.start} - {prevItem.finish}
            </div>
          )}
        </div>
        
        {prevItem && (
          <div className="flex gap-2 mt-2 pt-2 border-t border-slate-300/50">
            <div className="flex-1">
              <p className="text-[8px] font-bold text-slate-400 uppercase">Plan</p>
              <p className="text-sm font-black leading-none">{prevItem.qty}</p>
            </div>
            <div className="w-px bg-slate-300"></div>
            <div className="flex-1">
              <p className="text-[8px] font-bold text-slate-400 uppercase">Act</p>
              {/* Angka Actual Sebelumnya (Sengaja dibuat 0 dulu atau nanti bisa disambungkan ke history) */}
              <p className="text-sm font-black leading-none text-emerald-600">0</p>
            </div>
          </div>
        )}
      </div>

      {/* SEDANG JALAN / STATUS MESIN */}
      <div className="lg:col-span-2 bg-emerald-600 text-white rounded-lg shadow-md border border-emerald-700 p-3 flex flex-row justify-between items-center gap-3 relative overflow-hidden h-full">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-emerald-500 opacity-20 blur-xl"></div>
        
        {currItem ? (
          <>
            <div className="z-10 flex-1">
              <p className="text-[9px] font-black text-emerald-100 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-100 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span></span>
                ▶️ Sedang Jalan
              </p>
              <h1 className="text-base md:text-lg font-bold mb-1.5 leading-tight line-clamp-1">{currItem.namaPart}</h1>
              <div className="inline-flex items-center bg-emerald-800/60 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/30">
                {currItem.start} - {currItem.finish}
              </div>
            </div>
            <div className="flex gap-4 bg-emerald-900/40 px-4 py-2 rounded-lg border border-emerald-500/30 z-10 shrink-0">
              <div className="text-center">
                <p className="text-[9px] font-bold text-emerald-200 uppercase mb-0.5">Plan</p>
                <p className="text-xl font-black">{currItem.qty}</p>
              </div>
              <div className="w-px bg-emerald-500/30"></div>
              <div className="text-center">
                <p className="text-[9px] font-bold text-emerald-200 uppercase mb-0.5">Act</p>
                {/* INI ANGKA YANG MENYALA REAL-TIME DARI FIREBASE */}
                <p className="text-xl font-black">{actualHeader}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="z-10 flex flex-col items-center justify-center w-full text-center py-1">
            {(!prevItem && nextItem) ? (
               <>
                 <span className="text-2xl mb-0.5">⏳</span>
                 <h2 className="text-sm font-bold text-emerald-50 uppercase tracking-widest">MESIN STANDBY</h2>
                 <p className="text-[9px] text-emerald-200 mt-0.5">Menunggu jadwal pertama dimulai...</p>
               </>
            ) : (prevItem && !nextItem) ? (
               <>
                 <span className="text-2xl mb-0.5">✅</span>
                 <h2 className="text-sm font-bold text-emerald-50 uppercase tracking-widest">PRODUKSI SELESAI</h2>
                 <p className="text-[9px] text-emerald-200 mt-0.5">Seluruh jadwal untuk hari ini telah selesai.</p>
               </>
            ) : (prevItem && nextItem) ? (
               <>
                 <span className="text-2xl mb-0.5">🛠️</span>
                 <h2 className="text-sm font-bold text-emerald-50 uppercase tracking-widest">JOB CHANGE</h2>
                 <p className="text-[9px] text-emerald-200 mt-0.5">Persiapan pergantian part berikutnya...</p>
               </>
            ) : (
               <>
                 <span className="text-2xl mb-0.5">💤</span>
                 <h2 className="text-sm font-bold text-emerald-50 uppercase tracking-widest">MESIN OFF</h2>
                 <p className="text-[9px] text-emerald-200 mt-0.5">Tidak ada jadwal produksi hari ini.</p>
               </>
            )}
          </div>
        )}
      </div>

      {/* SELANJUTNYA */}
      <div className="bg-slate-800 text-white rounded-lg p-3 flex flex-col justify-center border border-slate-700 shadow-md h-full">
        <p className="text-[9px] font-black uppercase tracking-wider mb-0.5 text-slate-400">⏭️ Selanjutnya</p>
        <h3 className="text-xs font-bold leading-tight line-clamp-1">{nextItem ? nextItem.namaPart : "TIDAK ADA JADWAL"}</h3>
        {nextItem && (
          <div className="mt-1.5 text-[9px] font-bold bg-slate-700/80 text-slate-200 w-fit px-2 py-0.5 rounded flex items-center border border-slate-600/50">
            {nextItem.start} - {nextItem.finish}
          </div>
        )}
      </div>

    </div>
  );
}