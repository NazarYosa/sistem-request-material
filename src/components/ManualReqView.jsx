// src/components/ManualReqView.jsx
import React, { useState, useRef, useEffect } from "react";
import PrintLayout from "./PrintLayout";
import { generateKey } from "../utils";

const ManualReqView = ({
  db,
  masterDb,
  setPrintType,
  setPrintData,
  setPendingHistory,
}) => {
  const now = new Date();

  const [formData, setFormData] = useState({
    partKey: "",
    machine: "",
    reqDate: now.toISOString().slice(0, 10),
    sak: "",
    kg: "",
    recycle: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const partsList = [];
  if (masterDb) {
    for (const key in masterDb) {
      if (Object.prototype.hasOwnProperty.call(masterDb, key)) {
        partsList.push({ key: key, ...masterDb[key] });
      }
    }
  }
  partsList.sort((a, b) => (a.partName || "").localeCompare(b.partName || ""));

  const filteredParts = partsList.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.partName && p.partName.toLowerCase().includes(q)) ||
      (p.partNo && p.partNo.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };

    if (name === "sak") {
      if (value === "" || value === "0") {
        newFormData.kg = value === "" ? "" : "0";
      } else {
        newFormData.kg = String(parseFloat(value) * 25);
      }
    }
    setFormData(newFormData);
  };

  const handleSelectPart = (part) => {
    setFormData({ ...formData, partKey: part.key });
    setSearchQuery(`${part.partName} (${part.partNo})`);
    setShowDropdown(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFormData({ ...formData, partKey: "" });
    setShowDropdown(true);
  };

  // === LOGIKA CERDAS: PEMBAGIAN BOX & RECYCLE ===
  const totalPlan = parseInt(formData.sak || 0);
  const totalRecycle = parseInt(formData.recycle || 0);
  const netRequest = Math.max(0, totalPlan - totalRecycle);

  let totalBox = Math.ceil(totalPlan / 11);
  if (totalBox === 0 && totalPlan > 0) totalBox = 1;

  const recyclePerBox = Math.floor(totalRecycle / totalBox);
  const recycleRemainder = totalRecycle % totalBox;
  let remainingPlan = totalPlan;

  const partData = formData.partKey ? masterDb[formData.partKey] : {};
  const generatedLabels = [];

  for (let i = 0; i < totalBox; i++) {
    const currentBoxTotal = Math.min(11, remainingPlan);
    let currentRecycle = recyclePerBox + (i < recycleRemainder ? 1 : 0);
    if (currentRecycle > currentBoxTotal) currentRecycle = currentBoxTotal;
    const currentNet = currentBoxTotal - currentRecycle;

    let qtyDisplay = `${currentNet}`;
    if (currentRecycle > 0) qtyDisplay = `${currentNet} + ${currentRecycle}`;

    let totalDisplay = `${netRequest}`;
    if (totalRecycle > 0) totalDisplay = `${netRequest} + ${totalRecycle}`;
    else totalDisplay = `${totalPlan}`;

    generatedLabels.push({
      machine: formData.machine ? formData.machine.toUpperCase() : "MESIN",
      partNameExcel: partData.partName || "NAMA PART",
      partNoMain: partData.partNo || "NOMOR PART",
      model: partData.model || "MODEL",
      materialName: partData.materialName || "MATERIAL UTAMA",
      materialName2: partData.materialName2 || "",
      partNoMaterial: partData.partNoMaterial || "-",
      partNoMaterial2: partData.partNoMaterial2 || "",
      color: partData.color || "BLACK",
      qtyDisplay: qtyDisplay,
      totalDisplay: totalDisplay,
      boxKe: i + 1,
      totalBox: totalBox,
    });

    remainingPlan -= currentBoxTotal;
  }

  if (generatedLabels.length === 0) {
    generatedLabels.push({
      machine: formData.machine ? formData.machine.toUpperCase() : "MESIN",
      partNameExcel: partData.partName || "NAMA PART",
      partNoMain: partData.partNo || "NOMOR PART",
      model: partData.model || "MODEL",
      materialName: partData.materialName || "MATERIAL UTAMA",
      materialName2: partData.materialName2 || "",
      partNoMaterial: partData.partNoMaterial || "-",
      partNoMaterial2: partData.partNoMaterial2 || "",
      color: partData.color || "BLACK",
      qtyDisplay: "0",
      totalDisplay: "0",
      boxKe: 1,
      totalBox: 1,
    });
  }

  // === FUNGSI PRINT ===
  const handlePrintSubmit = () => {
    if (!formData.partKey || !formData.sak || !formData.reqDate) {
      alert("Peringatan: Part Name, Jumlah SAK, dan Tanggal wajib diisi!");
      return;
    }

    const currentTime = new Date().toTimeString().slice(0, 5);
    const dateObj = new Date(`${formData.reqDate}T${currentTime}`);
    const monthYear = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;

    // 1. Simpan ke antrean konfirmasi di App.jsx (BUKAN LANGSUNG KE FIREBASE)
    const historyRecord = {
      printDate: dateObj.toISOString(),
      monthYear: monthYear,
      machine: formData.machine ? formData.machine.toUpperCase() : "-",
      partName: partData.partName || "PART MANUAL",
      partNo: partData.partNo || "-",
      totalSak: totalPlan,
      totalKg: parseFloat(formData.kg || 0),
      recycle: totalRecycle,
      printType: "MANUAL",
    };

    setPendingHistory([historyRecord]);

    // 2. Trigger Print (App.jsx akan otomatis memanggil window.print())
    setPrintType("REQ");
    setPrintData(generatedLabels);

    // Reset Form Input
    setFormData({ ...formData, sak: "", kg: "", recycle: "" });
  };

  return (
    <div className="max-w-[1400px] mx-auto mt-2 font-sans text-slate-800 pb-10">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4 print:hidden px-2">
        <div>
          <h2 className="font-black text-3xl text-slate-900 uppercase tracking-tight">
            Manual Request
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-bold uppercase tracking-widest">
            Print Stiker Baru & Catat ke History
          </p>
        </div>
        <button
          onClick={handlePrintSubmit}
          disabled={!formData.partKey || !formData.sak}
          className="bg-slate-900 text-white hover:bg-blue-600 font-black text-lg px-8 py-3 rounded-xl transition-all uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
        >
          🖨️ PRINT STIKER
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 px-2">
        {/* KIRI: FORM INPUT */}
        <div className="w-full xl:w-4/12 space-y-5 print:hidden shrink-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase mb-1.5">
                Tanggal Request
              </label>
              <input
                type="date"
                name="reqDate"
                value={formData.reqDate}
                onChange={handleChange}
                required
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold transition-all"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold text-slate-500 uppercase mb-1.5">
              Nama Mesin
            </label>
            <input
              type="text"
              name="machine"
              placeholder="CONTOH: 1000T A"
              value={formData.machine}
              onChange={handleChange}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold uppercase transition-all"
            />
          </div>
          <div className="relative flex flex-col" ref={dropdownRef}>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1.5">
              Cari & Pilih Part
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Ketik Part Name / No..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                  if (formData.partKey)
                    setFormData({ ...formData, partKey: "" });
                }}
                onFocus={(e) => {
                  setShowDropdown(true);
                  e.target.select();
                }}
                className="w-full pl-11 pr-10 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-bold uppercase shadow-sm transition-all"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded-full w-6 h-6 flex items-center justify-center font-bold transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
            {showDropdown && (
              <ul className="absolute z-50 w-full top-[100%] mt-2 bg-white border border-slate-200 rounded-xl max-h-60 overflow-y-auto shadow-xl divide-y divide-slate-100">
                {filteredParts.length > 0 ? (
                  filteredParts.map((p) => (
                    <li
                      key={p.key}
                      onClick={() => handleSelectPart(p)}
                      className="px-5 py-3 hover:bg-slate-50 cursor-pointer"
                    >
                      <div className="font-bold uppercase text-slate-800 text-sm">
                        {p.partName}
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">
                        {p.partNo} •{" "}
                        {p.materialName2
                          ? `${p.materialName} & ${p.materialName2}`
                          : p.materialName}
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-5 py-4 text-center text-sm font-bold text-slate-400 uppercase">
                    Part Tidak Ditemukan
                  </li>
                )}
              </ul>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-blue-600 uppercase mb-1.5 text-center">
                SAK
              </label>
              <input
                type="number"
                name="sak"
                value={formData.sak}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
                className="px-2 py-3 text-center text-3xl font-black text-blue-600 bg-blue-50/50 border border-blue-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-emerald-600 uppercase mb-1.5 text-center">
                KG
              </label>
              <input
                type="number"
                name="kg"
                value={formData.kg}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.1"
                required
                className="px-2 py-3 text-center text-3xl font-black text-emerald-600 bg-emerald-50/50 border border-emerald-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-orange-500 uppercase mb-1.5 text-center">
                REC (SAK)
              </label>
              <input
                type="number"
                name="recycle"
                value={formData.recycle}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="px-2 py-3 text-center text-3xl font-black text-orange-500 bg-orange-50/50 border border-orange-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* KANAN: LIVE PREVIEW */}
        <div className="w-full xl:w-8/12 flex flex-col print:hidden overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-400 text-sm uppercase tracking-widest">
              Live Preview Stiker
            </h3>
            <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-3 py-1.5 border border-blue-200 rounded-lg shadow-sm">
              {generatedLabels.length} Stiker
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto overflow-y-hidden shadow-inner p-4 md:p-6 custom-scrollbar">
            <div className="w-max min-w-full pointer-events-none pb-2">
              <div className="[&>div]:!block [&_.flex-wrap]:!flex-nowrap [&_.flex-wrap]:!w-max [&_.flex-wrap]:!gap-4 [&_.flex-wrap>div]:!w-[380px] [&_.flex-wrap>div]:!shrink-0 bg-white p-4 shadow-sm border border-slate-200 rounded-xl inline-block">
                <PrintLayout
                  printType="REQ"
                  printData={generatedLabels}
                  selectedDate={formData.reqDate}
                />
              </div>
            </div>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-3 uppercase font-bold tracking-widest flex items-center justify-center gap-3">
            <span className="text-lg">👈</span> Geser Kiri / Kanan untuk melihat
            semua stiker <span className="text-lg">👉</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManualReqView;
