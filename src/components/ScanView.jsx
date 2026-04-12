// src/components/ScanView.jsx
import React from "react";
import { generateKey } from "../utils";

const ScanView = ({
  dataMaterial,
  groupedUI,
  selectedDate,
  setDataMaterial,
  handlePrintRequest,
  setActiveDropdown,
  handleRecycleChange,
  masterDb,
  toggleExcludePart,
  handlePrintAllRequest,
  handleFilePick,
  isAutoSyncing,
  handleResetData,
}) => {
  const isDataEmpty = dataMaterial.length === 0;

  // ====================================================================
  // LOGIKA SORTING & MASONRY KIRI-KANAN
  // ====================================================================
  // 1. Urutkan nama mesin berdasarkan angka terbesarnya (Descending)
  const sortedMachines = Object.keys(groupedUI).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, "")) || 0;
    const numB = parseInt(b.replace(/\D/g, "")) || 0;
    if (numA !== numB) return numB - numA;
    return a.localeCompare(b); // Jika angkanya sama, urutkan abjad
  });

  // 2. Pecah menjadi 2 kolom agar urutannya zig-zag (Kiri, Kanan, Kiri, Kanan)
  const leftColumnMachines = sortedMachines.filter(
    (_, index) => index % 2 === 0,
  );
  const rightColumnMachines = sortedMachines.filter(
    (_, index) => index % 2 !== 0,
  );

  // 3. Komponen Render Tabel Mesin agar kode tidak berulang (DRY)
  const renderMachineCard = (machine) => {
    const machineItems = groupedUI[machine];
    const totalPlanSak = machineItems.reduce(
      (acc, curr) => acc + curr.totalQty,
      0,
    );
    const totalPlanKg = machineItems.reduce(
      (acc, curr) => acc + (curr.inputKg || 0),
      0,
    );
    const machineNameClean = machine.replace(/^M/i, "");

    return (
      <div
        key={machine}
        className="bg-white rounded-xl border border-slate-300 overflow-hidden flex flex-col w-full shadow-sm"
      >
        {/* HEADER MESIN */}
        <div className="bg-slate-100/50 px-5 py-4 border-b border-slate-300 flex justify-between items-center">
          <span className="font-black text-slate-900 text-2xl">
            {machineNameClean} T
          </span>
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                Plan Sak:
              </span>
              <span className="font-black text-slate-900 text-lg">
                {totalPlanSak.toLocaleString()}
              </span>
            </div>
            <div className="w-px bg-slate-300 h-6 self-center"></div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                Beban Kg:
              </span>
              <span className="font-black text-slate-900 text-lg">
                {totalPlanKg.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-slate-500 border-b border-slate-300">
              <tr>
                <th className="px-4 py-3 w-[45%] font-extrabold uppercase text-xs tracking-wider">
                  Part Name / Material
                </th>
                <th className="px-2 py-3 text-center font-extrabold uppercase text-xs tracking-wider w-[10%]">
                  Plan
                </th>
                <th className="px-2 py-3 text-center font-extrabold uppercase text-xs tracking-wider w-[12%]">
                  Kg
                </th>
                <th className="px-2 py-3 text-center font-extrabold uppercase text-xs tracking-wider w-[8%]">
                  Rec
                </th>
                <th className="px-2 py-3 text-center font-extrabold uppercase text-xs tracking-wider w-[8%]">
                  SAK
                </th>
                <th className="px-2 py-3 text-center font-extrabold uppercase text-[9px] tracking-wider w-[5%]">
                  Skip
                </th>
                <th className="px-4 py-3 text-right font-extrabold uppercase text-xs tracking-wider w-[12%]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {machineItems
                .sort((a, b) => a.no - b.no)
                .map((item, idx) => {
                  const dbKey = generateKey(item.partName);
                  const dbData = masterDb[dbKey];
                  const isRegistered = !!dbData;

                  return (
                    <tr
                      key={idx}
                      className={`transition-colors ${item.isExcluded ? "bg-slate-50 opacity-40" : "hover:bg-slate-50"}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1.5">
                          <span
                            className={`font-semibold text-xl ${item.isExcluded ? "text-slate-400 line-through" : "text-slate-900"}`}
                          >
                            {item.partName}
                          </span>
                          <div className="flex flex-wrap gap-2 items-center mt-0.5">
                            {isRegistered ? (
                              <>
                                {dbData.materialName && (
                                  <span className=" text-slate-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                                    <span className="text-slate-400 text-[10px] tracking-widest">
                                      MAT:
                                    </span>
                                    {dbData.materialName}
                                  </span>
                                )}
                                {dbData.materialName2 && (
                                  <span className=" text-slate-700 px-2.5 py-1 rounded-md text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5">
                                    <span className="text-slate-400 text-[10px] tracking-widest">
                                      MAT2:
                                    </span>
                                    {dbData.materialName2}
                                  </span>
                                )}
                              </>
                            ) : (
                              !item.isExcluded && (
                                <span className="text-[10px] text-slate-500 font-bold uppercase bg-slate-100 px-2 py-1 rounded-md border border-slate-300 flex items-center gap-1">
                                  ⚠️ MISSING DB
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-3 text-center align-middle">
                        {item.inputPlan > 0 ? (
                          <span
                            className={`font-bold text-sm ${item.isExcluded ? "text-slate-300" : "text-slate-900"}`}
                          >
                            {item.inputPlan}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      <td className="px-2 py-3 text-center align-middle">
                        <span
                          className={`text-xs font-bold ${item.isExcluded ? "text-slate-300" : "text-slate-600"}`}
                        >
                          {item.inputKg > 0
                            ? item.inputKg.toLocaleString("id-ID", {
                                maximumFractionDigits: 1,
                              })
                            : "-"}
                        </span>
                      </td>

                      <td className="px-2 py-3 text-center align-middle">
                        <input
                          type="number"
                          disabled={item.isExcluded}
                          className={`w-12 text-center text-sm font-bold border rounded py-1 outline-none transition-all ${item.isExcluded ? "bg-slate-50 border-slate-200 text-slate-300" : "bg-white text-slate-900 border-slate-400 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 shadow-sm"}`}
                          value={
                            item.recycleInput === 0 ? "" : item.recycleInput
                          }
                          placeholder="0"
                          onChange={(e) =>
                            handleRecycleChange(item.id, e.target.value)
                          }
                        />
                      </td>

                      <td className="px-2 py-3 text-center align-middle">
                        <span
                          className={`font-bold text-base ${item.isExcluded ? "text-slate-300" : "text-slate-900"}`}
                        >
                          {item.totalQty}
                        </span>
                      </td>

                      <td className="px-2 py-3 text-center align-middle">
                        <input
                          type="checkbox"
                          checked={item.isExcluded || false}
                          onChange={() => toggleExcludePart(item.id)}
                          className="w-4 h-4 rounded border-slate-400 text-slate-800 focus:ring-slate-800 cursor-pointer transition-all"
                          title="Skip Part Ini"
                        />
                      </td>

                      <td className="px-4 py-3 text-right align-middle">
                        <div className="flex flex-col gap-1.5 items-end">
                          <button
                            onClick={() => handlePrintRequest(item)}
                            disabled={item.isExcluded}
                            className="bg-white border border-slate-300 hover:border-slate-800 hover:text-slate-900 text-slate-600 text-[10px] font-bold px-2 py-1 rounded w-full max-w-[70px] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                          >
                            REQ
                          </button>
                          <button
                            onClick={() => setActiveDropdown(item.id)}
                            disabled={item.isExcluded}
                            className="bg-slate-800 hover:bg-black text-white text-[10px] font-bold px-2 py-1 rounded w-full max-w-[70px] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                          >
                            PART TAG
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  // ====================================================================

  return (
    <div className="w-full flex flex-col gap-6">
      {/* HEADER SCAN VIEW */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-5 rounded-xl border border-slate-300 shadow-sm">
        <div className="flex items-center gap-4 mb-4 lg:mb-0">
          <div className="w-10 h-10 bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center text-xl border border-slate-300">
            📅
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-900 leading-tight uppercase">
              {new Date(selectedDate).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h3>
            <span className="text-slate-500 text-xs font-bold tracking-widest uppercase mt-0.5 block">
              Total: {dataMaterial.length} Items Terdeteksi
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            onClick={handleFilePick}
            className={`flex-1 lg:flex-none flex items-center justify-center text-sm font-bold py-2.5 px-6 rounded-lg cursor-pointer transition-all border ${
              isAutoSyncing
                ? "bg-slate-100 text-slate-900 border-slate-400"
                : "bg-white text-slate-800 hover:bg-slate-50 border-slate-300 active:scale-95 shadow-sm"
            }`}
          >
            <span className="text-base mr-2">
              {isAutoSyncing ? "🔄" : "📂"}
            </span>
            {isAutoSyncing ? "AUTO SYNC AKTIF" : "BUKA EXCEL"}
          </button>

          <button
            onClick={handlePrintAllRequest}
            disabled={isDataEmpty}
            className={`flex-1 lg:flex-none py-2.5 px-6 rounded-lg font-bold flex items-center justify-center transition-all text-sm border ${
              isDataEmpty
                ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                : "bg-slate-900 text-white hover:bg-black border-slate-900 active:scale-95 shadow-sm"
            }`}
          >
            <span className="text-base mr-2">🖨️</span> PRINT ALL REQ
          </button>

          <button
            onClick={handleResetData}
            disabled={isDataEmpty}
            className={`flex-1 lg:flex-none py-2.5 px-6 rounded-lg font-bold transition-all text-sm border ${
              isDataEmpty
                ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-slate-300 active:scale-95 shadow-sm"
            }`}
          >
            RESET DATA
          </button>
        </div>
      </div>

      {/* KONTEN UTAMA TABEL */}
      {isDataEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-300 rounded-xl text-slate-400 shadow-sm">
          <div className="text-5xl mb-4 opacity-40 grayscale">📂</div>
          <p className="text-lg font-black text-slate-600 uppercase tracking-wide">
            Belum Ada Data Part
          </p>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
            Silakan klik BUKA EXCEL untuk memulai
          </p>
        </div>
      ) : (
        <>
          {/* LAYOUT DESKTOP (2 KOLOM ZIG-ZAG) */}
          <div className="hidden xl:grid grid-cols-2 gap-6 items-start pb-20">
            <div className="flex flex-col gap-6">
              {leftColumnMachines.map(renderMachineCard)}
            </div>
            <div className="flex flex-col gap-6">
              {rightColumnMachines.map(renderMachineCard)}
            </div>
          </div>

          {/* LAYOUT MOBILE/TABLET (1 KOLOM URUT KE BAWAH) */}
          <div className="grid xl:hidden grid-cols-1 gap-6 items-start pb-20">
            {sortedMachines.map(renderMachineCard)}
          </div>
        </>
      )}
    </div>
  );
};

export default ScanView;
