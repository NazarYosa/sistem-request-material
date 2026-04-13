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
      {/* HEADER SECTION - LEBIH SIMPLE */}
      <div className="mb-6 mt-4">
        <h2 className="font-black text-2xl text-slate-900 uppercase tracking-tight">
          Info Part & Material
        </h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">
          Cari Detail Part atau Lacak Material
        </p>
      </div>

      {/* SEARCH BAR - HEMAT TEMPAT */}
      <div className="relative mb-8 max-w-xl">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40">
          🔍
        </span>
        <input
          type="text"
          placeholder="Ketik Part Name, No, Material, atau Model..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-slate-900 focus:ring-2 focus:ring-slate-100 outline-none font-bold text-slate-900 transition-all shadow-sm"
        />
      </div>

      {/* HASIL PENCARIAN - GAYA BLOCK VERTIKAL */}
      {searchTerm && results.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-500 uppercase text-[10px] tracking-widest pb-1 border-b border-slate-200">
            Ditemukan {results.length} data terkait
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {results.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3"
              >
                {/* GROUP 1: UMUM (KEBAWAH) */}
                <div className="space-y-1">
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Part Name
                    </span>
                    <h4 className="font-black text-md text-slate-900 uppercase leading-snug">
                      {item.partName}
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Part No
                      </span>
                      <span className="font-bold text-sm text-slate-700">
                        {item.partNo || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Model
                      </span>
                      <span className="font-black text-sm text-blue-700 uppercase">
                        {item.model || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* GROUP 2: BAHAN BAKU (KEBAWAH) */}
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                    <span className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      Material
                    </span>
                    <span className="block font-black text-sm text-slate-800 uppercase leading-tight mt-0.5">
                      {item.materialName || "-"}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-medium">
                      No: {item.partNoMaterial || "-"}
                    </span>
                  </div>

                  {item.materialName2 && (
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                      <span className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        Material 2
                      </span>
                      <span className="block font-black text-sm text-slate-800 uppercase leading-tight mt-0.5">
                        {item.materialName2}
                      </span>
                      <span className="block text-[10px] text-slate-500 font-medium">
                        No: {item.partNoMaterial2 || "-"}
                      </span>
                    </div>
                  )}
                </div>

                {/* GROUP 3: FISIK (KEBAWAH) */}
                <div className="border-t border-slate-100 pt-3 flex items-center gap-4 text-center">
                  <div className="flex-1">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">
                      Berat
                    </span>
                    <span className="font-black text-sm text-slate-900">
                      {item.weight || "-"}{" "}
                      <span className="text-[10px] text-slate-500">KG</span>
                    </span>
                  </div>
                  <div className="flex-1">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">
                      Isi Box
                    </span>
                    <span className="font-black text-sm text-slate-900">
                      {item.stdQty || "-"}{" "}
                      <span className="text-[10px] text-slate-500">PCS</span>
                    </span>
                  </div>
                  <div className="flex-1">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">
                      Warna
                    </span>
                    <span className="font-black text-sm text-slate-900 uppercase">
                      {item.color || "-"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STATE KOSONG / AWAL - LEBIH RINGKAS */}
      {searchTerm && results.length === 0 && (
        <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-2xl mt-8">
          <span className="text-4xl mb-3 block opacity-20">📭</span>
          <h3 className="font-bold text-sm text-slate-700 uppercase">
            Tidak Ditemukan
          </h3>
          <p className="text-slate-500 font-medium text-xs mt-1">
            Coba kata kunci lain.
          </p>
        </div>
      )}
      {!searchTerm && (
        <div className="text-center py-20 opacity-20 mt-8 border-2 border-dashed border-slate-200 rounded-2xl">
          <span className="text-6xl mb-3 block">🔍</span>
          <h3 className="font-bold text-xl text-slate-800 uppercase tracking-widest">
            Cari Sesuatu
          </h3>
        </div>
      )}
    </div>
  );
};

export default PartInfoView;
