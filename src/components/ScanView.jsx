// // src/components/ScanView.jsx
// import React from "react";
// import { generateKey } from "../utils";

// const ScanView = ({
//   dataMaterial,
//   groupedUI,
//   selectedDate,
//   setDataMaterial,
//   handlePrintRequest,
//   setActiveDropdown,
//   handleRecycleChange,
//   masterDb,
//   toggleExcludePart, // <--- Terima props baru ini dari App.jsx
// }) => {
//   return (
//     <>
//       {/* HEADER UTAMA */}
//       <div className="flex justify-between items-center mb-6">
//         <div className="flex items-center gap-4">
//           <h3 className="font-bold text-2xl text-slate-800 flex items-center gap-2">
//             <span className="text-3xl">📅</span>
//             {new Date(selectedDate).toLocaleDateString("id-ID", {
//               weekday: "long",
//               day: "numeric",
//               month: "long",
//               year: "numeric",
//             })}
//           </h3>
//           <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm">
//             Total: {dataMaterial.length} Items
//           </span>
//         </div>
//         {dataMaterial.length > 0 && (
//           <button
//             onClick={() => setDataMaterial([])}
//             className="text-sm text-red-600 hover:text-red-800 font-bold hover:underline transition-all bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg"
//           >
//             RESET DATA
//           </button>
//         )}
//       </div>

//       {/* KONTEN UTAMA */}
//       {Object.keys(groupedUI).length === 0 ? (
//         <div className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50 text-slate-400">
//           <span className="text-6xl mb-4 opacity-50">📂</span>
//           <p className="text-lg font-medium text-slate-500">
//             Belum ada data. Upload Excel dulu ya!
//           </p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-24 w-full items-start">
//           {Object.keys(groupedUI).map((machine) => {
//             const machineItems = groupedUI[machine];
//             const totalPlanSak = machineItems.reduce(
//               (acc, curr) => acc + curr.totalQty,
//               0,
//             );
//             const totalPlanKg = machineItems.reduce(
//               (acc, curr) => acc + (curr.inputKg || 0),
//               0,
//             );
//             const machineNameClean = machine.replace(/^M/i, "");

//             return (
//               <div
//                 key={machine}
//                 className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col"
//               >
//                 <div className="bg-gray-100 px-5 py-4 border-b border-gray-300 flex justify-between items-center">
//                   <div className="flex items-center gap-3">
//                     <span className="font-black text-slate-800 text-3xl tracking-tighter">
//                       {machineNameClean}
//                     </span>
//                   </div>
//                   <div className="flex gap-4 text-xs">
//                     <div className="flex flex-col items-end">
//                       <span className="text-[10px] text-slate-400 font-bold uppercase">
//                         PLAN SAK
//                       </span>
//                       <span className="font-black text-blue-700 text-base leading-none">
//                         {totalPlanSak.toLocaleString()}
//                       </span>
//                     </div>
//                     <div className="w-px bg-slate-300 h-8"></div>
//                     <div className="flex flex-col items-end">
//                       <span className="text-[10px] text-slate-400 font-bold uppercase">
//                         BEBAN KG
//                       </span>
//                       <span className="font-black text-emerald-700 text-base leading-none">
//                         {totalPlanKg.toLocaleString("id-ID")}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="overflow-x-auto">
//                   <table className="w-full text-sm text-left border-collapse">
//                     <thead className="bg-slate-50 text-slate-600 font-extrabold border-b border-slate-200">
//                       <tr>
//                         <th className="px-4 py-3 w-[45%] uppercase text-xs">
//                           Part Name / Material
//                         </th>
//                         <th className="px-2 py-3 text-center border-l border-slate-200 w-[10%] uppercase text-xs text-blue-700">
//                           Plan
//                         </th>
//                         <th className="px-2 py-3 text-center border-l border-slate-200 w-[12%] uppercase text-xs text-slate-500">
//                           Kg
//                         </th>
//                         <th className="px-2 py-3 text-center border-l border-slate-200 w-[10%] uppercase text-xs bg-emerald-50 text-emerald-700">
//                           Rec
//                         </th>
//                         <th className="px-2 py-3 text-center border-l border-slate-200 w-[10%] uppercase text-xs">
//                           Total
//                         </th>
//                         <th className="px-4 py-3 text-right w-[13%] uppercase text-xs">
//                           Action
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-slate-100">
//                       {machineItems
//                         .sort((a, b) => a.no - b.no)
//                         .map((item, idx) => {
//                           const dbKey = generateKey(item.partName);
//                           const dbData = masterDb[dbKey];
//                           const isRegistered = !!dbData;

//                           return (
//                             <tr
//                               key={idx}
//                               className={`transition-all group relative ${item.isExcluded ? "bg-gray-100 opacity-50" : "hover:bg-blue-50"}`}
//                             >
//                               {/* 1. Part Details dengan Checkbox & Bar */}
//                               <td className="p-0 align-middle relative">
//                                 {/* INDICATOR BAR (Hanya muncul jika di DB dan BUKAN anomali) */}
//                                 {isRegistered && !item.isExcluded && (
//                                   <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 shadow-[2px_0_4px_rgba(16,185,129,0.2)]"></div>
//                                 )}

//                                 <div
//                                   className={`flex items-start gap-3 py-3 ${isRegistered && !item.isExcluded ? "pl-5" : "pl-4"} pr-4`}
//                                 >
//                                   {/* CHECKBOX ANOMALI */}
//                                   <div className="pt-1 shrink-0">
//                                     <input
//                                       type="checkbox"
//                                       checked={item.isExcluded || false}
//                                       onChange={() =>
//                                         toggleExcludePart(item.id)
//                                       }
//                                       className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
//                                       title="Ceklis jika part ini anomali (jangan diprint)"
//                                     />
//                                   </div>

//                                   <div className="flex flex-col gap-1 flex-1 min-w-0">
//                                     <span
//                                       className={`font-bold text-base break-words leading-tight transition-all ${item.isExcluded ? "text-slate-400 line-through" : "text-slate-800 group-hover:text-blue-700"}`}
//                                     >
//                                       {item.partName}
//                                       {item.isExcluded && (
//                                         <span className="ml-2 text-[9px] font-black text-red-500 uppercase tracking-tighter px-1.5 py-0.5 bg-red-50 rounded border border-red-100">
//                                           [ANOMALI]
//                                         </span>
//                                       )}
//                                     </span>

//                                     <div
//                                       className={`flex flex-col gap-1 w-full items-start transition-opacity ${item.isExcluded ? "opacity-30" : "opacity-100"}`}
//                                     >
//                                       {isRegistered ? (
//                                         <>
//                                           {dbData.materialName && (
//                                             <div className="w-fit bg-slate-100 border border-slate-200 rounded px-2 py-0.5 text-xs font-medium text-slate-700 leading-tight">
//                                               <span className="font-bold text-slate-400 mr-1 text-[10px]">
//                                                 M1:
//                                               </span>
//                                               {dbData.materialName}
//                                             </div>
//                                           )}
//                                           {dbData.materialName2 && (
//                                             <div className="w-fit bg-slate-100 border border-slate-200 rounded px-2 py-0.5 text-xs font-medium text-slate-700 leading-tight">
//                                               <span className="font-bold text-slate-400 mr-1 text-[10px]">
//                                                 M2:
//                                               </span>
//                                               {dbData.materialName2}
//                                             </div>
//                                           )}
//                                         </>
//                                       ) : (
//                                         !item.isExcluded && (
//                                           <span className="text-xs text-red-500 font-bold italic bg-red-50 px-2 py-0.5 rounded border border-red-100">
//                                             ⚠️ Missing DB
//                                           </span>
//                                         )
//                                       )}
//                                     </div>
//                                   </div>
//                                 </div>
//                               </td>

//                               <td className="px-2 py-3 text-center border-l border-slate-100 align-middle">
//                                 {item.inputPlan > 0 ? (
//                                   <span
//                                     className={`font-bold px-2 py-1 rounded text-sm ${item.isExcluded ? "text-slate-300" : "text-slate-700 bg-slate-100"}`}
//                                   >
//                                     {item.inputPlan}
//                                   </span>
//                                 ) : (
//                                   <span className="text-slate-300">-</span>
//                                 )}
//                               </td>

//                               <td className="px-2 py-3 text-center border-l border-slate-100 align-middle">
//                                 <span
//                                   className={`text-xs font-bold ${item.isExcluded ? "text-slate-300" : "text-slate-500"}`}
//                                 >
//                                   {item.inputKg > 0
//                                     ? item.inputKg.toLocaleString("id-ID", {
//                                         maximumFractionDigits: 1,
//                                       })
//                                     : "-"}
//                                 </span>
//                               </td>

//                               <td className="px-2 py-3 text-center border-l border-slate-100 align-middle bg-emerald-50/20">
//                                 <input
//                                   type="number"
//                                   disabled={item.isExcluded}
//                                   className={`w-12 text-center text-sm font-bold border-2 rounded-md py-1 outline-none transition-all bg-white ${item.isExcluded ? "border-gray-200 text-gray-300" : "text-emerald-700 border-emerald-100 focus:ring-2 focus:ring-emerald-500"}`}
//                                   value={
//                                     item.recycleInput === 0
//                                       ? ""
//                                       : item.recycleInput
//                                   }
//                                   placeholder="0"
//                                   onChange={(e) =>
//                                     handleRecycleChange(item.id, e.target.value)
//                                   }
//                                 />
//                               </td>

//                               <td className="px-2 py-3 text-center border-l border-slate-100 align-middle">
//                                 <span
//                                   className={`font-black text-lg ${item.isExcluded ? "text-slate-300" : "text-slate-900"}`}
//                                 >
//                                   {item.totalQty}
//                                 </span>
//                               </td>

//                               <td className="px-4 py-3 text-right align-middle">
//                                 <div className="flex flex-col gap-2 items-end">
//                                   <button
//                                     onClick={() => handlePrintRequest(item)}
//                                     className="bg-white border-2 border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-md shadow-sm w-full max-w-24 active:scale-95 transition-all"
//                                   >
//                                     📄 REQ
//                                   </button>
//                                   <button
//                                     onClick={() => setActiveDropdown(item.id)}
//                                     className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-md w-full max-w-24 active:scale-95 transition-all"
//                                   >
//                                     🏷️ LBL
//                                   </button>
//                                 </div>
//                               </td>
//                             </tr>
//                           );
//                         })}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </>
//   );
// };

// export default ScanView;


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
  toggleExcludePart, // <--- Props dari App.jsx
}) => {
  return (
    <>
      {/* HEADER UTAMA */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h3 className="font-bold text-2xl text-slate-800 flex items-center gap-2">
            <span className="text-3xl">📅</span>
            {new Date(selectedDate).toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h3>
          <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm">
            Total: {dataMaterial.length} Items
          </span>
        </div>
        {dataMaterial.length > 0 && (
          <button
            onClick={() => setDataMaterial([])}
            className="text-sm text-red-600 hover:text-red-800 font-bold hover:underline transition-all bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg"
          >
            RESET DATA
          </button>
        )}
      </div>

      {/* KONTEN UTAMA */}
      {Object.keys(groupedUI).length === 0 ? (
        <div className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50 text-slate-400">
          <span className="text-6xl mb-4 opacity-50">📂</span>
          <p className="text-lg font-medium text-slate-500">
            Belum ada data. Upload Excel dulu ya!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-24 w-full items-start">
          {Object.keys(groupedUI).map((machine) => {
            const machineItems = groupedUI[machine];
            const totalPlanSak = machineItems.reduce((acc, curr) => acc + curr.totalQty, 0);
            const totalPlanKg = machineItems.reduce((acc, curr) => acc + (curr.inputKg || 0), 0);
            const machineNameClean = machine.replace(/^M/i, "");

            return (
              <div
                key={machine}
                className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col"
              >
                {/* HEADER MESIN */}
                <div className="bg-gray-100 px-5 py-4 border-b border-gray-300 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-800 text-3xl tracking-tighter">
                      {machineNameClean}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">PLAN SAK</span>
                      <span className="font-black text-blue-700 text-base leading-none">{totalPlanSak.toLocaleString()}</span>
                    </div>
                    <div className="w-px bg-slate-300 h-8"></div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">BEBAN KG</span>
                      <span className="font-black text-emerald-700 text-base leading-none">{totalPlanKg.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-extrabold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 w-[45%] uppercase text-xs">Part Name / Material</th>
                        <th className="px-2 py-3 text-center border-l border-slate-200 w-[10%] uppercase text-xs text-blue-700">Plan</th>
                        <th className="px-2 py-3 text-center border-l border-slate-200 w-[12%] uppercase text-xs text-slate-500">Kg</th>
                        <th className="px-2 py-3 text-center border-l border-slate-200 w-[8%] uppercase text-xs bg-emerald-50 text-emerald-700">Rec</th>
                        <th className="px-2 py-3 text-center border-l border-slate-200 w-[8%] uppercase text-xs">Total</th>
                        {/* KOLOM BARU: SKIP / ANOMALI */}
                        <th className="px-2 py-3 text-center border-l border-slate-200 w-[5%] uppercase text-[9px] text-red-500">Skip</th>
                        <th className="px-4 py-3 text-right w-[12%] uppercase text-xs">Action</th>
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
                              className={`transition-all group relative ${item.isExcluded ? "bg-gray-50 opacity-40" : "hover:bg-blue-50"}`}
                            >
                              {/* 1. Part Details (Kembali Bersih) */}
                              <td className="p-0 align-middle relative">
                                {isRegistered && !item.isExcluded && (
                                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 shadow-[2px_0_4px_rgba(16,185,129,0.2)]"></div>
                                )}

                                <div className={`flex flex-col gap-1.5 py-3 ${isRegistered && !item.isExcluded ? "pl-5" : "pl-4"} pr-4`}>
                                  <span className={`font-bold text-base break-words leading-tight transition-all ${item.isExcluded ? 'text-slate-400 line-through' : 'text-slate-800 group-hover:text-blue-700'}`}>
                                    {item.partName}
                                  </span>

                                  <div className={`flex flex-col gap-1 w-full items-start ${item.isExcluded ? 'opacity-30' : 'opacity-100'}`}>
                                    {isRegistered ? (
                                      <>
                                        {dbData.materialName && (
                                          <div className="w-fit bg-slate-100 border border-slate-200 rounded px-2 py-0.5 text-xs font-medium text-slate-700 leading-tight">
                                            <span className="font-bold text-slate-400 mr-1 text-[10px]">M1:</span>
                                            {dbData.materialName}
                                          </div>
                                        )}
                                        {dbData.materialName2 && (
                                          <div className="w-fit bg-slate-100 border border-slate-200 rounded px-2 py-0.5 text-xs font-medium text-slate-700 leading-tight">
                                            <span className="font-bold text-slate-400 mr-1 text-[10px]">M2:</span>
                                            {dbData.materialName2}
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      !item.isExcluded && (
                                        <span className="text-xs text-red-500 font-bold italic bg-red-50 px-2 py-0.5 rounded border border-red-100">
                                          ⚠️ Missing DB
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Kolom Plan, Kg, Rec, Total (Sama) */}
                              <td className="px-2 py-3 text-center border-l border-slate-100 align-middle">
                                {item.inputPlan > 0 ? (
                                  <span className={`font-bold px-2 py-1 rounded text-sm ${item.isExcluded ? 'text-slate-300' : 'text-slate-700 bg-slate-100'}`}>
                                    {item.inputPlan}
                                  </span>
                                ) : <span className="text-slate-300">-</span>}
                              </td>

                              <td className="px-2 py-3 text-center border-l border-slate-100 align-middle">
                                <span className={`text-xs font-bold ${item.isExcluded ? 'text-slate-300' : 'text-slate-500'}`}>
                                  {item.inputKg > 0 ? item.inputKg.toLocaleString("id-ID", { maximumFractionDigits: 1 }) : "-"}
                                </span>
                              </td>

                              <td className="px-2 py-3 text-center border-l border-slate-100 align-middle bg-emerald-50/20">
                                <input
                                  type="number"
                                  disabled={item.isExcluded}
                                  className={`w-12 text-center text-sm font-bold border-2 rounded-md py-1 outline-none bg-white ${item.isExcluded ? 'border-gray-200 text-gray-300' : 'text-emerald-700 border-emerald-100 focus:ring-2 focus:ring-emerald-500'}`}
                                  value={item.recycleInput === 0 ? "" : item.recycleInput}
                                  placeholder="0"
                                  onChange={(e) => handleRecycleChange(item.id, e.target.value)}
                                />
                              </td>

                              <td className="px-2 py-3 text-center border-l border-slate-100 align-middle">
                                <span className={`font-black text-lg ${item.isExcluded ? 'text-slate-300' : 'text-slate-900'}`}>
                                  {item.totalQty}
                                </span>
                              </td>

                              {/* 5. CHECKBOX PINDAH DISINI (SETELAH TOTAL) */}
                              <td className="px-2 py-3 text-center border-l border-slate-100 align-middle">
                                <input 
                                  type="checkbox"
                                  checked={item.isExcluded || false}
                                  onChange={() => toggleExcludePart(item.id)}
                                  className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer shadow-sm transition-transform active:scale-125"
                                  title="Ceklis untuk melewati part ini saat Print All"
                                />
                              </td>

                              {/* 6. Action */}
                              <td className="px-4 py-3 text-right border-l border-slate-100 align-middle">
                                <div className="flex flex-col gap-1.5 items-end">
                                  <button
                                    onClick={() => handlePrintRequest(item)}
                                    className="bg-white border-2 border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm w-full max-w-20 active:scale-95 transition-all"
                                  >
                                    📄 REQ
                                  </button>
                                  <button
                                    onClick={() => setActiveDropdown(item.id)}
                                    className="bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md w-full max-w-20 active:scale-95 transition-all"
                                  >
                                    🏷️ LBL
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
    </>
  );
};

export default ScanView;