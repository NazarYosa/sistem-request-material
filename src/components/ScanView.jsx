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

  return (
    <div className="w-full flex flex-col gap-6">
      {/* HEADER SCAN VIEW (SIMPLE & CLEAN) */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-5 rounded-xl border border-slate-200">
        {/* Info Tanggal & Total */}
        <div className="flex items-center gap-4 mb-4 lg:mb-0">
          <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center text-xl border border-slate-200">
            📅
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800 leading-tight uppercase">
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

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Tombol File Picker (Auto Sync) */}
          <button
            onClick={handleFilePick}
            className={`flex-1 lg:flex-none flex items-center justify-center text-sm font-bold py-2.5 px-6 rounded-lg cursor-pointer transition-all border ${
              isAutoSyncing
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 active:scale-95"
            }`}
          >
            <span className="text-base mr-2">
              {isAutoSyncing ? "🟢" : "📂"}
            </span>
            {isAutoSyncing ? "AUTO SYNC AKTIF" : "BUKA EXCEL"}
          </button>

          {/* Tombol Print All */}
          <button
            onClick={handlePrintAllRequest}
            disabled={isDataEmpty}
            className={`flex-1 lg:flex-none py-2.5 px-6 rounded-lg font-bold flex items-center justify-center transition-all text-sm border ${
              isDataEmpty
                ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                : "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200 active:scale-95"
            }`}
          >
            <span className="text-base mr-2">🖨️</span> PRINT ALL REQ
          </button>

          {/* Tombol Reset (Mematikan Auto Sync) */}
          <button
            onClick={handleResetData}
            disabled={isDataEmpty}
            className={`flex-1 lg:flex-none py-2.5 px-6 rounded-lg font-bold transition-all text-sm border ${
              isDataEmpty
                ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                : "bg-red-50 text-red-600 hover:bg-red-100 border-red-200 active:scale-95"
            }`}
          >
            RESET DATA
          </button>
        </div>
      </div>

      {/* KONTEN UTAMA TABEL */}
      {isDataEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200 rounded-xl text-slate-400">
          <div className="text-5xl mb-4 opacity-50">📂</div>
          <p className="text-lg font-bold text-slate-500 uppercase tracking-wide">
            Belum Ada Data Part
          </p>
          <p className="text-xs font-medium text-slate-400 mt-1 uppercase">
            Silakan klik BUKA EXCEL untuk memulai
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start pb-20">
          {Object.keys(groupedUI).map((machine) => {
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
                className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col"
              >
                {/* HEADER MESIN */}
                <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                  <span className="font-black text-slate-700 text-2xl">
                    {machineNameClean}
                  </span>
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-bold uppercase">
                        Plan Sak:
                      </span>
                      <span className="font-black text-blue-600 text-lg">
                        {totalPlanSak.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-px bg-slate-200 h-6 self-center"></div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-bold uppercase">
                        Beban Kg:
                      </span>
                      <span className="font-black text-emerald-600 text-lg">
                        {totalPlanKg.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-white text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 w-[45%] font-bold uppercase text-xs">
                          Part Name / Material
                        </th>
                        <th className="px-2 py-3 text-center font-bold uppercase text-xs text-blue-500 w-[10%]">
                          Plan
                        </th>
                        <th className="px-2 py-3 text-center font-bold uppercase text-xs text-slate-400 w-[12%]">
                          Kg
                        </th>
                        <th className="px-2 py-3 text-center font-bold uppercase text-xs text-orange-500 w-[8%]">
                          Rec
                        </th>
                        <th className="px-2 py-3 text-center font-bold uppercase text-xs text-slate-700 w-[8%]">
                          Tot
                        </th>
                        <th className="px-2 py-3 text-center font-bold uppercase text-[9px] text-red-400 w-[5%]">
                          Skip
                        </th>
                        <th className="px-4 py-3 text-right font-bold uppercase text-xs w-[12%]">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {machineItems
                        .sort((a, b) => a.no - b.no)
                        .map((item, idx) => {
                          const dbKey = generateKey(item.partName);
                          const dbData = masterDb[dbKey];
                          const isRegistered = !!dbData;

                          return (
                            <tr
                              key={idx}
                              className={`transition-colors ${item.isExcluded ? "bg-slate-50 opacity-50" : "hover:bg-slate-50"}`}
                            >
                              <td className="px-4 py-3">
                                <div className="flex flex-col gap-1.5">
                                  <span
                                    className={`font-bold text-sm ${item.isExcluded ? "text-slate-400 line-through" : "text-slate-800"}`}
                                  >
                                    {item.partName}
                                  </span>
                                  <div className="flex flex-wrap gap-2 items-center mt-0.5">
                                    {isRegistered ? (
                                      <>
                                        {dbData.materialName && (
                                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-md text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5">
                                            <span className="text-indigo-400 text-[10px] tracking-widest">
                                              MAT:
                                            </span>
                                            {dbData.materialName}
                                          </span>
                                        )}
                                        {dbData.materialName2 && (
                                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-md text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5">
                                            <span className="text-indigo-400 text-[10px] tracking-widest">
                                              MAT2:
                                            </span>
                                            {dbData.materialName2}
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      !item.isExcluded && (
                                        <span className="text-[10px] text-red-600 font-bold uppercase bg-red-50 px-2 py-1 rounded-md border border-red-200 flex items-center gap-1">
                                          ⚠️ Missing DB
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="px-2 py-3 text-center align-middle">
                                {item.inputPlan > 0 ? (
                                  <span
                                    className={`font-bold text-sm ${item.isExcluded ? "text-slate-300" : "text-blue-600"}`}
                                  >
                                    {item.inputPlan}
                                  </span>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>

                              <td className="px-2 py-3 text-center align-middle">
                                <span
                                  className={`text-xs font-bold ${item.isExcluded ? "text-slate-300" : "text-emerald-600"}`}
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
                                  className={`w-12 text-center text-sm font-bold border rounded py-1 outline-none transition-all ${item.isExcluded ? "bg-slate-50 border-slate-200 text-slate-300" : "bg-white text-orange-600 border-slate-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-400"}`}
                                  value={
                                    item.recycleInput === 0
                                      ? ""
                                      : item.recycleInput
                                  }
                                  placeholder="0"
                                  onChange={(e) =>
                                    handleRecycleChange(item.id, e.target.value)
                                  }
                                />
                              </td>

                              <td className="px-2 py-3 text-center align-middle">
                                <span
                                  className={`font-black text-base ${item.isExcluded ? "text-slate-300" : "text-slate-800"}`}
                                >
                                  {item.totalQty}
                                </span>
                              </td>

                              <td className="px-2 py-3 text-center align-middle">
                                <input
                                  type="checkbox"
                                  checked={item.isExcluded || false}
                                  onChange={() => toggleExcludePart(item.id)}
                                  className="w-4 h-4 rounded border-slate-300 text-slate-400 focus:ring-0 cursor-pointer transition-all"
                                  title="Skip Part Ini"
                                />
                              </td>

                              <td className="px-4 py-3 text-right align-middle">
                                <div className="flex flex-col gap-1.5 items-end">
                                  <button
                                    onClick={() => handlePrintRequest(item)}
                                    disabled={item.isExcluded}
                                    className="bg-white border border-slate-300 hover:border-blue-400 hover:text-blue-600 text-slate-600 text-[10px] font-bold px-2 py-1 rounded w-full max-w-[70px] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    REQ
                                  </button>
                                  <button
                                    onClick={() => setActiveDropdown(item.id)}
                                    disabled={item.isExcluded}
                                    className="bg-slate-700 hover:bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded w-full max-w-[70px] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    LBL
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
          })}
        </div>
      )}
    </div>
  );
};

export default ScanView;
