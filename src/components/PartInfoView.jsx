// src/components/PartInfoView.jsx
import React, { useState, useMemo } from "react";

const PartInfoView = ({ masterDb }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const dbArray = useMemo(() => {
    return Object.values(masterDb || {});
  }, [masterDb]);

  const results = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const q = searchTerm.toLowerCase();
    return dbArray.filter((item) => {
      const allText = [
        item.partName,
        item.partNo,
        item.model,
        item.color,
        item.materialName,
        item.partNoMaterial,
        item.materialName2,
        item.partNoMaterial2,
      ]
        .join(" ")
        .toLowerCase();
      return allText.includes(q);
    });
  }, [searchTerm, dbArray]);

  return (
    <div className="max-w-[1400px] mx-auto mt-2 font-sans text-slate-800 pb-10 px-3">
      {/* HEADER SECTION */}
      <div className="mb-6 mt-4">
        <h2 className="font-extrabold text-2xl text-slate-800 uppercase tracking-tight">
          Info Part & Material
        </h2>
        <p className="text-slate-500 font-semibold uppercase tracking-widest text-[10px] mt-1">
          Cari Detail Part atau Lacak Material
        </p>
      </div>

      {/* SEARCH BAR */}
      <div className="relative mb-8 max-w-xl">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40">
          🔍
        </span>
        <input
          type="text"
          placeholder="Ketik Part Name, No, Material, atau Model..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none font-medium text-slate-800 transition-all shadow-sm placeholder:font-normal"
        />
      </div>

      {/* HASIL PENCARIAN */}
      {searchTerm && results.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-400 uppercase text-[10px] tracking-widest pb-2 border-b border-slate-100">
            Ditemukan {results.length} data terkait
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {results.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                {/* GROUP 1: UMUM */}
                <div className="space-y-2">
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                      Part Name
                    </span>
                    <h4 className="font-bold text-base text-slate-800 uppercase leading-snug">
                      {item.partName}
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                        Part No
                      </span>
                      <span className="font-semibold text-sm text-slate-700">
                        {item.partNo || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                        Model
                      </span>
                      <span className="font-bold text-sm text-blue-600 uppercase">
                        {item.model || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* GROUP 2: BAHAN BAKU */}
                <div className="border-t border-slate-100 pt-4 space-y-2.5">
                  <div className="bg-slate-50/70 border border-slate-100 p-3 rounded-lg">
                    <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Material 1
                    </span>
                    <span className="block font-bold text-sm text-slate-700 uppercase leading-tight">
                      {item.materialName || "-"}
                    </span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">
                      No:{" "}
                      <span className="font-medium">
                        {item.partNoMaterial || "-"}
                      </span>
                    </span>
                  </div>

                  {item.materialName2 && (
                    <div className="bg-slate-50/70 border border-slate-100 p-3 rounded-lg">
                      <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Material 2
                      </span>
                      <span className="block font-bold text-sm text-slate-700 uppercase leading-tight">
                        {item.materialName2}
                      </span>
                      <span className="block text-[11px] text-slate-500 mt-0.5">
                        No:{" "}
                        <span className="font-medium">
                          {item.partNoMaterial2 || "-"}
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                {/* GROUP 3: FISIK */}
                <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-center gap-2">
                  <div className="flex-1 bg-white border border-slate-50 py-2 rounded-lg">
                    <span className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Berat
                    </span>
                    <span className="font-bold text-sm text-slate-800">
                      {item.weight || "-"}{" "}
                      <span className="text-[10px] font-medium text-slate-500">
                        KG
                      </span>
                    </span>
                  </div>
                  <div className="flex-1 bg-white border border-slate-50 py-2 rounded-lg">
                    <span className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Isi Box
                    </span>
                    <span className="font-bold text-sm text-slate-800">
                      {item.stdQty || "-"}{" "}
                      <span className="text-[10px] font-medium text-slate-500">
                        PCS
                      </span>
                    </span>
                  </div>
                  <div className="flex-1 bg-white border border-slate-50 py-2 rounded-lg">
                    <span className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Warna
                    </span>
                    <span className="font-bold text-sm text-slate-800 uppercase">
                      {item.color || "-"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STATE KOSONG / AWAL */}
      {searchTerm && results.length === 0 && (
        <div className="text-center py-12 bg-slate-50/50 border border-slate-200 rounded-2xl mt-8">
          <span className="text-4xl mb-3 block opacity-40">📭</span>
          <h3 className="font-semibold text-sm text-slate-600 uppercase tracking-wide">
            Tidak Ditemukan
          </h3>
          <p className="text-slate-500 text-xs mt-1">
            Coba gunakan kata kunci pencarian yang lain.
          </p>
        </div>
      )}
      {!searchTerm && (
        <div className="text-center py-20 opacity-40 mt-8 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/30">
          <span className="text-5xl mb-4 block">🔍</span>
          <h3 className="font-semibold text-lg text-slate-700 uppercase tracking-widest">
            Ketik untuk Mencari
          </h3>
        </div>
      )}
    </div>
  );
};

export default PartInfoView;
