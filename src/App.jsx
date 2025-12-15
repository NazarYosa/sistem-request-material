// import React, { useState, useEffect } from "react";
// import * as XLSX from "xlsx";

// function App() {
//   const [dataMaterial, setDataMaterial] = useState([]);
//   const [printData, setPrintData] = useState(null);
//   const [isProcessing, setIsProcessing] = useState(false);

//   const [selectedDate, setSelectedDate] = useState(
//     new Date().toLocaleDateString("en-CA")
//   );

//   const getMarkersFromDate = (dateString) => {
//     const dateObj = new Date(dateString);
//     const day = dateObj.getDate();
//     const dayStr = String(day);
//     return { day, dayStr, fullDate: dateString };
//   };

//   // === 1. HANDLE UPLOAD ===
//   const handleFileUpload = (e) => {
//     const files = e.target.files;
//     if (!files.length) return;

//     const markers = getMarkersFromDate(selectedDate);
//     setDataMaterial([]);
//     setIsProcessing(true);

//     setTimeout(() => {
//       Array.from(files).forEach((file) => {
//         const reader = new FileReader();
//         reader.readAsArrayBuffer(file);

//         reader.onload = (evt) => {
//           try {
//             const bstr = evt.target.result;
//             const workbook = XLSX.read(bstr, { type: "array" });
//             let extractedData = [];

//             workbook.SheetNames.forEach((sheetName) => {
//               // Baca sheet yang berawalan "M" (Mesin)
//               if (sheetName.trim().toUpperCase().startsWith("M")) {
//                 const worksheet = workbook.Sheets[sheetName];
//                 const jsonData = XLSX.utils.sheet_to_json(worksheet, {
//                   header: 1,
//                   defval: "",
//                   raw: false,
//                 });

//                 const result = processSheet(jsonData, sheetName, markers);
//                 if (result.length > 0) {
//                   extractedData = [...extractedData, ...result];
//                 }
//               }
//             });

//             if (extractedData.length > 0) {
//               const aggregated = aggregateData(extractedData);
//               setDataMaterial((prev) => [...prev, ...aggregated]);
//             }
//           } catch (error) {
//             console.error(error);
//           } finally {
//             setIsProcessing(false);
//           }
//         };
//       });
//     }, 800);
//   };

//   // === 2. CORE LOGIC (PERBAIKAN BUG "TRIM" + SAK ONLY) ===
//   const processSheet = (rows, sheetName, markers) => {
//     let headerRow = -1;
//     let colNo = -1;
//     let colPartName = -1;
//     let colPartNo = -1;
//     let dateColIndex = -1;
//     let offsetSak = -1;
//     let offsetKg = -1;

//     // A. Deteksi Header
//     for (let i = 0; i < Math.min(50, rows.length); i++) {
//       const row = rows[i];
//       row.forEach((cell, idx) => {
//         const val = String(cell).toUpperCase().trim();
//         if (val === "NO" || val === "NO.") colNo = idx;
//         if (val.includes("PART NAME")) colPartName = idx;
//         if (val.includes("PART NO") || val.includes("PART NUMBER"))
//           colPartNo = idx;
//       });

//       row.forEach((cell, idx) => {
//         if (!cell) return;
//         const valStr = String(cell).trim();
//         const isDateMatch =
//           valStr === markers.dayStr ||
//           valStr === `0${markers.dayStr}` ||
//           valStr.includes(markers.fullDate);

//         if (isDateMatch) {
//           headerRow = i;
//           dateColIndex = idx;
//           // Cek sub-header untuk SAK / KG
//           for (let r = 1; r <= 2; r++) {
//             if (!rows[i + r]) continue;
//             for (let off = 0; off <= 4; off++) {
//               const subVal = String(rows[i + r][idx + off])
//                 .toUpperCase()
//                 .trim();
//               if (subVal.includes("SAK") || subVal === "SAK") offsetSak = off;
//               else if (subVal.includes("KG") || subVal.includes("MATERIAL"))
//                 offsetKg = off;
//             }
//           }
//         }
//       });
//       if (dateColIndex !== -1 && colPartName !== -1) break;
//     }

//     if (dateColIndex === -1 || colPartName === -1) return [];
//     // Fallback offset jika header tidak eksplisit
//     if (offsetSak === -1 && offsetKg === -1) {
//       offsetKg = 2;
//       offsetSak = 3;
//     }

//     // B. Ekstraksi Data
//     const results = [];
//     let currentPartName = null;
//     let currentPartNo = "-";

//     for (let i = headerRow + 1; i < rows.length; i++) {
//       const row = rows[i];
//       if (!row) continue;

//       // Bersihkan string nama dari karakter aneh
//       let rawName = String(row[colPartName] || "").trim();
//       let cellName = rawName.replace(/\s+/g, " ");

//       // === LOGIKA FILTER NAMA (SUPAYA "TRIM" LOLOS & "0" BISA JADI INDUK) ===
//       const isHeader = [
//         "PART NAME",
//         "TOTAL",
//         "SUB TOTAL",
//         "MODEL",
//         "ACTUAL",
//       ].some((x) => cellName.toUpperCase().includes(x));
//       const isModelCode = /^\(.*\)$/.test(cellName); // Contoh: (Y4L)

//       // Part Number Nyasar (Angka + Strip + Huruf), TAPI bukan TRIM QTR-UPPER
//       const looksLikePartNo =
//         /[0-9]/.test(cellName) && /-/.test(cellName) && !cellName.includes(" ");

//       // Nama Pendek dengan Angka (Kode) -> Dibuang
//       const isShortCodeWithNum = cellName.length <= 5 && /[0-9]/.test(cellName);

//       const isZero = cellName === "0";
//       const isTooShort = cellName.length < 2;

//       // Update Jangkar (Induk)
//       // 1. JANGKAR NOMOR
//       const cellNo = String(row[colNo] || "").trim();
//       const isNewNumber = cellNo.length > 0 && !isNaN(parseFloat(cellNo));

//       if (isNewNumber) {
//         // KASUS 1: Ada Nomor Baru (1, 2, 3...)
//         // Nama "0" atau "TRIM" akan masuk sini.
//         if (cellName && !isHeader && !isModelCode) {
//           currentPartName = cellName;
//           const rawNo = String(row[colPartNo] || "").trim();
//           if (rawNo.length > 3) currentPartNo = rawNo;
//           else currentPartNo = "-";
//         }
//       } else {
//         // KASUS 2: Tidak Ada Nomor (Baris Anak)
//         const isValidNameText =
//           cellName &&
//           !isHeader &&
//           !isModelCode &&
//           !looksLikePartNo &&
//           !isShortCodeWithNum &&
//           !isZero && // Kalau tidak ada nomor, "0" dianggap sampah
//           !isTooShort;

//         if (isValidNameText) {
//           // Punya nama sendiri (misal "TRIM" tanpa nomor) -> Pakai
//           currentPartName = cellName;
//           const rawNo = String(row[colPartNo] || "").trim();
//           if (rawNo.length > 3) currentPartNo = rawNo;
//         }
//         // Jika tidak valid -> Pakai Induk Lama (Fill Down)
//       }

//       if (!currentPartName) continue;

//       // Skip baris ACTUAL
//       let isActualRow = false;
//       for (let c = 0; c < 10; c++) {
//         const val = String(row[c]).toUpperCase().trim();
//         if (val === "ACTUAL" || val === "ACT") {
//           isActualRow = true;
//           break;
//         }
//       }
//       if (isActualRow) continue;

//       // --- AMBIL ANGKA (MODIFIKASI: STRICT SAK) ---
//       let finalSak = 0;
//       let displayKg = 0;

//       // Ambil KG hanya untuk display
//       if (offsetKg !== -1) {
//         let val = parseFloat(
//           String(row[dateColIndex + offsetKg]).replace(",", ".")
//         );
//         if (!isNaN(val) && val > 0) displayKg = val;
//       }

//       // Ambil SAK
//       if (offsetSak !== -1) {
//         let val = parseFloat(
//           String(row[dateColIndex + offsetSak]).replace(",", ".")
//         );
//         if (!isNaN(val) && val > 0) finalSak = val;
//       }

//       // HAPUS FALLBACK KG
//       // if (finalSak === 0 && displayKg > 0) finalSak = displayKg; <--- DIHAPUS

//       // HANYA MASUK JIKA SAK > 0
//       if (finalSak > 0) {
//         results.push({
//           machine: sheetName.replace(".csv", "").replace(".xlsx", "").trim(),
//           partName: currentPartName,
//           partNo: currentPartNo,
//           rawSak: finalSak,
//           rawKg: displayKg,
//         });
//       }
//     }
//     return results;
//   };

//   // === 3. AGGREGASI (AUTO SUM) ===
//   const aggregateData = (rawData) => {
//     const grouped = {};
//     rawData.forEach((item) => {
//       const key = `${item.machine}__${item.partName}`;
//       if (!grouped[key]) {
//         grouped[key] = {
//           machine: item.machine,
//           partName: item.partName,
//           partNo: item.partNo,
//           totalRawSak: 0,
//           totalRawKg: 0,
//         };
//       }
//       grouped[key].totalRawSak += item.rawSak;
//       grouped[key].totalRawKg += item.rawKg;
//     });

//     return Object.values(grouped).map((item) => {
//       const totalQty = Math.ceil(item.totalRawSak);
//       const jmlLabel = Math.ceil(totalQty / 13);
//       return {
//         id: Math.random().toString(36),
//         machine: item.machine,
//         partName: item.partName,
//         partNo: item.partNo,
//         inputSak: item.totalRawSak,
//         inputKg: item.totalRawKg,
//         totalQty: totalQty,
//         jmlLabel: jmlLabel,
//         recycleInput: 0,
//       };
//     });
//   };

//   // === 4. HANDLE RECYCLE ===
//   const handleRecycleChange = (id, val) => {
//     const newVal = Math.max(0, parseInt(val) || 0);
//     setDataMaterial((prev) =>
//       prev.map((item) => {
//         if (item.id === id) {
//           const netQty = Math.max(0, item.totalQty - newVal);
//           const newJmlLabel = Math.ceil(netQty / 13) || (newVal > 0 ? 1 : 0);
//           return { ...item, recycleInput: newVal, jmlLabel: newJmlLabel };
//         }
//         return item;
//       })
//     );
//   };

//   // === 5. PRINT ENGINE (11+1 FORMAT) ===
//   const handlePrint = (item) => {
//     const labels = [];
//     const totalPlan = item.totalQty;
//     const totalRecycle = item.recycleInput;
//     const netRequest = Math.max(0, totalPlan - totalRecycle);

//     let totalBox = Math.ceil(netRequest / 13);
//     if (totalBox === 0 && totalRecycle > 0) totalBox = 1;
//     if (totalBox === 0 && totalPlan > 0) totalBox = 1;

//     const recyclePerBox = Math.floor(totalRecycle / totalBox);
//     const recycleRemainder = totalRecycle % totalBox;

//     let remainingNet = netRequest;

//     for (let i = 0; i < totalBox; i++) {
//       const currentNet = Math.min(13, remainingNet);
//       const currentRecycle = recyclePerBox + (i < recycleRemainder ? 1 : 0);

//       let qtyDisplay = `${currentNet}`;
//       if (currentRecycle > 0) qtyDisplay = `${currentNet} + ${currentRecycle}`;

//       let totalDisplay = `${netRequest}`;
//       if (totalRecycle > 0) totalDisplay = `${netRequest} + ${totalRecycle}`;
//       else totalDisplay = `${totalPlan}`;

//       labels.push({
//         ...item,
//         qtyDisplay: qtyDisplay,
//         totalDisplay: totalDisplay,
//         boxKe: i + 1,
//         totalBox: totalBox,
//       });
//       remainingNet -= currentNet;
//     }
//     setPrintData(labels);
//   };

//   useEffect(() => {
//     if (printData) setTimeout(() => window.print(), 500);
//   }, [printData]);

//   const groupedUI = dataMaterial.reduce((acc, item) => {
//     if (!acc[item.machine]) acc[item.machine] = [];
//     acc[item.machine].push(item);
//     return acc;
//   }, {});

//   return (
//     <div className="h-screen flex flex-col bg-gray-50 text-slate-800 font-sans overflow-hidden">
//       {/* HEADER WEB */}
//       <div className="flex-none bg-white shadow-md z-20 print:hidden border-b border-gray-200">
//         <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 relative">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl shadow-blue-200 shadow-lg">
//               🖨️
//             </div>
//             <div>
//               <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">
//                 VUTEQ <span className="text-blue-600">LABEL SYSTEM</span>
//               </h1>
//               <p className="text-[10px] text-slate-400 font-medium tracking-widest mt-1 uppercase">
//                 Production Plan Reader
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center gap-4">
//             <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
//               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
//                 TGL:
//               </label>
//               <input
//                 type="date"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//                 className="text-sm font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
//               />
//             </div>
//             <label className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-lg cursor-pointer transition-all active:scale-95 shadow-sm gap-2">
//               <span>📂</span> Upload Excel
//               <input
//                 type="file"
//                 multiple
//                 accept=".xlsx, .xls"
//                 onChange={handleFileUpload}
//                 disabled={isProcessing}
//                 className="hidden"
//               />
//             </label>
//           </div>
//           {isProcessing && (
//             <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100 overflow-hidden">
//               <div className="h-full bg-blue-500 animate-progress w-full origin-left"></div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* BODY WEB */}
//       <div className="flex-1 overflow-y-auto p-8 print:hidden">
//         <div className="max-w-[1600px] mx-auto">
//           <div className="flex justify-between items-end mb-6">
//             <div>
//               <h3 className="font-bold text-2xl text-slate-800">
//                 Data Material{" "}
//                 <span className="text-blue-600 text-xl font-medium border-b-2 border-blue-200 pb-1">
//                   {new Date(selectedDate).toLocaleDateString("id-ID", {
//                     day: "numeric",
//                     month: "long",
//                     year: "numeric",
//                   })}
//                 </span>
//               </h3>
//               <p className="text-sm text-slate-500 mt-1">
//                 Total{" "}
//                 <span className="font-bold text-blue-600">
//                   {dataMaterial.length}
//                 </span>{" "}
//                 item material ditemukan.
//               </p>
//             </div>
//             {dataMaterial.length > 0 && (
//               <button
//                 onClick={() => setDataMaterial([])}
//                 className="text-xs text-red-500 hover:text-red-700 font-bold tracking-wide uppercase transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
//               >
//                 Reset Data
//               </button>
//             )}
//           </div>

//           {Object.keys(groupedUI).length === 0 ? (
//             <div className="flex flex-col items-center justify-center h-80 text-slate-400 border border-dashed border-slate-300 rounded-2xl bg-white shadow-sm">
//               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-3xl opacity-50">
//                 📊
//               </div>
//               <p className="font-medium text-slate-600">
//                 Belum ada data ditampilkan
//               </p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start pb-20">
//               {Object.keys(groupedUI).map((machine) => (
//                 <div
//                   key={machine}
//                   className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
//                 >
//                   <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
//                     <div className="flex items-center gap-2">
//                       <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
//                       <span className="font-bold text-slate-700 text-sm uppercase tracking-wide">
//                         Mesin: {machine}
//                       </span>
//                     </div>
//                     <span className="text-[10px] font-bold bg-white border border-gray-200 px-3 py-1 rounded-full text-slate-500">
//                       {groupedUI[machine].length} PARTS
//                     </span>
//                   </div>
//                   <div className="overflow-x-auto">
//                     <table className="w-full text-sm text-left">
//                       <thead className="bg-white text-slate-500 border-b border-gray-100">
//                         <tr>
//                           <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider w-[35%]">
//                             Part Name
//                           </th>
//                           <th className="px-2 py-3 font-semibold text-xs uppercase tracking-wider w-[15%] text-center text-gray-400">
//                             Total KG
//                           </th>
//                           <th className="px-2 py-3 font-semibold text-xs uppercase tracking-wider w-[15%] text-center text-emerald-600">
//                             Recycle
//                           </th>
//                           <th className="px-2 py-3 font-semibold text-xs uppercase tracking-wider w-[15%] text-center">
//                             Total Sak
//                           </th>
//                           <th className="px-2 py-3 font-semibold text-xs uppercase tracking-wider w-[15%] text-right">
//                             Action
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-gray-50">
//                         {groupedUI[machine].map((item, idx) => (
//                           <tr
//                             key={idx}
//                             className="hover:bg-blue-50/50 transition-colors duration-150 group"
//                           >
//                             <td className="px-4 py-3">
//                               <div className="font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">
//                                 {item.partName}
//                               </div>
//                             </td>
//                             <td className="px-2 py-3 text-center">
//                               <span className="font-medium text-black bg-gray-50 px-2 py-1 rounded text-xs">
//                                 {item.inputKg > 0
//                                   ? item.inputKg.toLocaleString("id-ID", {
//                                       maximumFractionDigits: 1,
//                                     })
//                                   : "-"}
//                               </span>
//                             </td>
//                             <td className="px-2 py-3 text-center">
//                               <input
//                                 type="number"
//                                 min="0"
//                                 className="w-12 text-center text-xs font-bold text-emerald-700 border border-emerald-200 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
//                                 value={
//                                   item.recycleInput === 0
//                                     ? ""
//                                     : item.recycleInput
//                                 }
//                                 placeholder="0"
//                                 onChange={(e) =>
//                                   handleRecycleChange(item.id, e.target.value)
//                                 }
//                               />
//                             </td>
//                             <td className="px-2 py-3 text-center">
//                               <div className="inline-flex flex-col items-center">
//                                 <span className="text-lg font-bold text-slate-800">
//                                   {item.totalQty}
//                                 </span>
//                                 <span className="text-[9px] text-slate-400 font-medium">
//                                   (Raw:{" "}
//                                   {item.inputSak % 1 === 0
//                                     ? item.inputSak
//                                     : item.inputSak.toFixed(1)}
//                                   )
//                                 </span>
//                               </div>
//                             </td>
//                             <td className="px-2 py-3 text-right">
//                               <button
//                                 onClick={() => handlePrint(item)}
//                                 className="bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-2 ml-auto"
//                               >
//                                 <span>🖨️</span> Print{" "}
//                                 <span className="bg-slate-100 group-hover:bg-emerald-100 px-1.5 rounded text-[10px] min-w-5 text-center">
//                                   {item.jmlLabel}
//                                 </span>
//                               </button>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//         {/* === PRINT TEMPLATE (LANDSCAPE: 3 KOLOM x 3 BARIS = 9 LABEL) === */}
//         <div className="hidden print:grid print:grid-cols-3 print:gap-2 print:w-full print:p-2 bg-white text-black font-sans leading-none">
//             {printData &&
//           printData.map((lbl, idx) => (
//             <div
//               key={idx}
//               // Layout Flex-col Justify-between agar Footer selalu di bawah
//               // pb-3 agar aman tidak menabrak garis bawah
//               className="border border-black flex flex-col h-[279px] justify-between relative box-border px-1.5 pt-1.5 pb-3 bg-white break-inside-avoid"
//             >
//               {/* === BAGIAN ATAS === */}
//               <div>
//                 {/* 1. HEADER */}
//                 <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-1">
//                   <div className="w-1/4 text-left font-bold text-sm uppercase leading-none">
//                     {lbl.machine}
//                   </div>
//                   <div className="w-2/4 text-center font-bold text-base uppercase leading-none transform translate-y-px">
//                     REQUEST MATERIAL
//                   </div>
//                   <div className="w-1/4 text-right text-[10px] font-normal leading-none text-black">
//                     PD-FR-K046
//                   </div>
//                 </div>

//                 {/* 2. PART INFO */}
//                 <div className="px-0.5 text-[9px] space-y-0.5 mb-1">
//                   <div className="flex">
//                     <div className="w-16 font-bold shrink-0">Part Name</div>
//                     <div className="w-2 text-center shrink-0">:</div>
//                     <div className="uppercase font-normal leading-tight flex-1">
//                       {lbl.partName}
//                     </div>
//                   </div>
//                   <div className="flex">
//                     <div className="w-16 font-bold shrink-0">Part No</div>
//                     <div className="w-2 text-center shrink-0">:</div>
//                     <div className="font-normal flex-1">{lbl.partNo}</div>
//                   </div>
//                   <div className="flex">
//                     <div className="w-16 font-bold shrink-0">Model</div>
//                     <div className="w-2 text-center shrink-0">:</div>
//                     <div className="font-normal flex-1"></div>
//                   </div>
//                 </div>

//                 {/* 3. TABEL UTAMA */}
//                 <div className="mt-0.5">
//                   <table className="w-full text-[9px] border-collapse border border-black font-sans">
//                     <thead>
//                       <tr className="border-b border-black bg-gray-200">
//                         <th className="border border-black p-0.5 w-[28%] text-left pl-2 font-bold">
//                           ITEM
//                         </th>
//                         <th className="border border-black p-0.5 w-[37%] text-left pl-2 font-bold">
//                           STANDARD MATERIAL
//                         </th>
//                         <th className="border border-black p-0.5 w-[35%] text-left pl-2 font-bold">
//                           ACTUAL MATERIAL
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {/* Part Name */}
//                       <tr className="border-b border-black">
//                         <td className="border-r border-black p-0.5 pl-2 font-bold">
//                           PART NAME
//                         </td>
//                         <td className="border-r border-black p-0.5 pl-2 font-normal uppercase leading-none">
//                           {lbl.partName}
//                         </td>
//                         <td className="p-0.5 pl-2 font-bold"></td>
//                       </tr>
//                       {/* Part No */}
//                       <tr className="border-b border-black">
//                         <td className="border-r border-black p-0.5 pl-2 font-bold">
//                           PART NO
//                         </td>
//                         <td className="border-r border-black p-0.5 pl-2 font-normal">
//                           {lbl.partNo}
//                         </td>
//                         <td className="p-0.5 pl-2 font-bold"></td>
//                       </tr>
//                       {/* Colour */}
//                       <tr className="border-b border-black">
//                         <td className="border-r border-black p-0.5 pl-2 font-bold">
//                           COLOUR
//                         </td>
//                         <td className="border-r border-black p-0.5 pl-2 font-normal">
//                           BLACK
//                         </td>
//                         <td className="p-0.5 pl-2 font-bold"></td>
//                       </tr>
//                       {/* Lot No (Merged) */}
//                       <tr className="border-b border-black">
//                         <td className="border-r border-black p-0.5 pl-2 font-bold">
//                           LOT NO
//                         </td>
//                         <td className="p-0.5 pl-2 font-bold" colSpan={2}>
//                           :
//                         </td>
//                       </tr>
//                       {/* Qty Material (Merged) */}
//                       <tr className="border-b border-black">
//                         <td className="border-r border-black p-0.5 pl-2 font-bold">
//                           QTY MATERIAL
//                         </td>
//                         <td
//                           className="p-0.5 pl-2 font-bold text-center text-xs"
//                           colSpan={2}
//                         >
//                           {lbl.qtyDisplay} / {lbl.totalDisplay}
//                         </td>
//                       </tr>
//                       {/* Qty Box Ke (Merged) */}
//                       <tr className="border-b border-black">
//                         <td className="border-r border-black p-0.5 pl-2 font-bold">
//                           QTY BOX KE
//                         </td>
//                         <td
//                           className="p-0.5 pl-2 font-bold text-center text-xs"
//                           colSpan={2}
//                         >
//                           {lbl.boxKe} / {lbl.totalBox}
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>
//               </div>

//               {/* === 4. FOOTER (BAGIAN TANGGAL DIPERBAIKI) === */}
//               <div className="w-full text-[8px] font-bold">
//                 {/* Baris 1: Waktu Persiapan */}
//                 <div className="flex justify-between items-end">
//                   <span>Waktu Persiapan: 1 / 2 / 3</span>

//                   {/* FIX: Dikasih width fix w-[90px] supaya "Tanggal" selalu start di posisi yang sama */}
//                   <span className="w-[90px] flex items-center">
//                     Tanggal:
//                     <span className="font-normal ml-1">
//                       {new Date(selectedDate).toLocaleDateString("id-ID")}
//                     </span>
//                   </span>
//                 </div>

//                 {/* Garis Putus-putus */}
//                 <div className="border-t-[1.5px] border-dotted border-black w-full my-1"></div>

//                 {/* Baris 2: Waktu Pemakaian */}
//                 <div className="flex justify-between items-end">
//                   <span>Waktu Pemakaian: 1 / 2 / 3</span>

//                   {/* FIX: Dikasih width fix w-[90px] sama seperti atas */}
//                   <span className="w-[90px] flex items-center">Tanggal:</span>
//                 </div>
//               </div>
//             </div>
//           ))}
//       </div>

//       <style>{`
//         @media print {
//           @page { size: A4 landscape; margin: 5mm; }
//           .print\\:grid-cols-3 { 
//             display: grid; 
//             grid-template-columns: repeat(3, 1fr);
//             gap: 5mm; 
//           }
//           body { -webkit-print-color-adjust: exact; }
//         }
//       `}</style>

//       <style>{`
//         @media print {
//           @page { size: A4 landscape; margin: 5mm; }
//           .print\\:grid-cols-3 { 
//             display: grid; 
//             grid-template-columns: repeat(3, 1fr);
//             gap: 5mm; 
//           }
//           body { -webkit-print-color-adjust: exact; }
//         }
//       `}</style>

//       <style>{`
//         @media print {
//           @page { size: A4 landscape; margin: 5mm; }
//           .print\\:grid-cols-3 { 
//             display: grid; 
//             grid-template-columns: repeat(3, 1fr);
//             gap: 5mm; 
//           }
//           body { -webkit-print-color-adjust: exact; }
//         }
//       `}</style>

//       <style>{`
//         @media print {
//           @page { size: A4 landscape; margin: 5mm; }
//           .print\\:grid-cols-3 { 
//             display: grid; 
//             grid-template-columns: repeat(3, 1fr);
//             gap: 5mm; 
//           }
//           body { -webkit-print-color-adjust: exact; }
//         }
//       `}</style>

//       <style>{`
//         @media print {
//           @page { size: A4 landscape; margin: 5mm; }
//           .print\\:grid-cols-3 { 
//             display: grid; 
//             grid-template-columns: repeat(3, 1fr);
//             gap: 5mm; 
//           }
//           body { -webkit-print-color-adjust: exact; }
//         }
//       `}</style>

//       {/* STYLE KHUSUS PRINT */}
//       <style>{`
//         @media print {
//           @page { size: A4 landscape; margin: 5mm; }
//           .print\\:grid-cols-3 { 
//             display: grid; 
//             grid-template-columns: repeat(3, 1fr);
//             gap: 5mm; 
//           }
//           body { -webkit-print-color-adjust: exact; }
//         }
//       `}</style>

//       {/* STYLE KHUSUS PRINT */}
//       <style>{`
//         @media print {
//           @page { size: A4 landscape; margin: 5mm; }
//           .print\\:grid-cols-3 { 
//             display: grid; 
//             grid-template-columns: repeat(3, 1fr);
//             gap: 5mm; 
//           }
//           body { -webkit-print-color-adjust: exact; }
//         }
//       `}</style>

//       {/* STYLE KHUSUS PRINT */}
//       <style>{`
//         @media print {
//           /* Landscape A4 */
//           @page { size: A4 landscape; margin: 5mm; }
          
//           /* Grid 3 Kolom agar lebar tidak gepeng */
//           .print\\:grid-cols-3 { 
//             display: grid; 
//             grid-template-columns: repeat(3, 1fr);
//             gap: 5mm; /* Jarak antar label */
//           }
          
//           body { -webkit-print-color-adjust: exact; }
//         }
//       `}</style>

//       {/* STYLE KHUSUS PRINT (LANDSCAPE 4 KOLOM) */}
//       <style>{`
//         @media print {
//           @page { size: A4 landscape; margin: 5mm; }
//           .print\\:grid-cols-4 { 
//             display: grid; 
//             grid-template-columns: repeat(4, 1fr);
//             gap: 8px;
//           }
//           body { -webkit-print-color-adjust: exact; }
//         }
//       `}</style>

//       {/* STYLE KHUSUS PRINT */}
//       <style>{`
//         @media print {
//           @page { size: A4 portrait; margin: 5mm; }
//           .print\\:grid-cols-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
//           body { -webkit-print-color-adjust: exact; }
//         }
//       `}</style>

//       {/* STYLE KHUSUS PRINT */}
//       <style>{`
//         @media print {
//           @page { size: A4 portrait; margin: 5mm; }
//           .print\\:grid-cols-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
//           body { -webkit-print-color-adjust: exact; }
//         }
//       `}</style>

//       <style>{`
//         @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
//         .animate-progress { animation: progress 1.5s infinite linear; }
//         @media print {
//           @page { size: A4 portrait; margin: 5mm; }
//           .print\\:grid-cols-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5mm; }
//           body { -webkit-print-color-adjust: exact; }
//         }
//       `}</style>
//     </div>
//   );
// }

// export default App;


import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

function App() {
  const [dataMaterial, setDataMaterial] = useState([]);
  const [printData, setPrintData] = useState(null);
  const [printType, setPrintType] = useState(null); // 'REQ' atau 'LABEL'
  const [isProcessing, setIsProcessing] = useState(false);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );

  // === STATE DATABASE INPUT ===
  const [masterDb, setMasterDb] = useState(() => {
    const saved = localStorage.getItem("master_part_db");
    return saved ? JSON.parse(saved) : {};
  });

  const [inputForm, setInputForm] = useState({
    partName: "",
    partNo: "",
    color: "",
    partNoHgs: "",
    finishGood: "",
    materialName: "",
    model: "",
  });

  useEffect(() => {
    localStorage.setItem("master_part_db", JSON.stringify(masterDb));
  }, [masterDb]);

  const [viewMode, setViewMode] = useState("scan"); // 'scan' | 'input'

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveInput = () => {
    if (!inputForm.partName) return alert("Part Name wajib diisi!");
    const key = inputForm.partName.trim().toUpperCase();
    setMasterDb((prev) => ({ ...prev, [key]: inputForm }));
    setInputForm({
      partName: "",
      partNo: "",
      color: "",
      partNoHgs: "",
      finishGood: "",
      materialName: "",
      model: "",
    });
    alert("Data tersimpan!");
  };

  const handleDeleteDb = (key) => {
    const newDb = { ...masterDb };
    delete newDb[key];
    setMasterDb(newDb);
  };

  const getMarkersFromDate = (dateString) => {
    const dateObj = new Date(dateString);
    const day = dateObj.getDate();
    const dayStr = String(day);
    return { day, dayStr, fullDate: dateString };
  };

  // === 1. HANDLE UPLOAD ===
  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files.length) return;

    const markers = getMarkersFromDate(selectedDate);
    setDataMaterial([]);
    setIsProcessing(true);

    setTimeout(() => {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = (evt) => {
          try {
            const bstr = evt.target.result;
            const workbook = XLSX.read(bstr, { type: "array" });
            let extractedData = [];

            workbook.SheetNames.forEach((sheetName) => {
              if (sheetName.trim().toUpperCase().startsWith("M")) {
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                  header: 1,
                  defval: "",
                  raw: false,
                });

                const result = processSheet(jsonData, sheetName, markers);
                if (result.length > 0) {
                  extractedData = [...extractedData, ...result];
                }
              }
            });

            if (extractedData.length > 0) {
              const aggregated = aggregateData(extractedData);
              setDataMaterial((prev) => [...prev, ...aggregated]);
            }
          } catch (error) {
            console.error(error);
          } finally {
            setIsProcessing(false);
          }
        };
      });
    }, 800);
  };

  // === 2. CORE LOGIC ===
  const processSheet = (rows, sheetName, markers) => {
    let headerRow = -1;
    let colNo = -1;
    let colPartName = -1;
    let colPartNo = -1;
    let dateColIndex = -1;
    let offsetSak = -1;
    let offsetKg = -1;

    for (let i = 0; i < Math.min(50, rows.length); i++) {
      const row = rows[i];
      row.forEach((cell, idx) => {
        const val = String(cell).toUpperCase().trim();
        if (val === "NO" || val === "NO.") colNo = idx;
        if (val.includes("PART NAME")) colPartName = idx;
        if (val.includes("PART NO") || val.includes("PART NUMBER"))
          colPartNo = idx;
      });

      row.forEach((cell, idx) => {
        if (!cell) return;
        const valStr = String(cell).trim();
        const isDateMatch =
          valStr === markers.dayStr ||
          valStr === `0${markers.dayStr}` ||
          valStr.includes(markers.fullDate);

        if (isDateMatch) {
          headerRow = i;
          dateColIndex = idx;
          for (let r = 1; r <= 2; r++) {
            if (!rows[i + r]) continue;
            for (let off = 0; off <= 4; off++) {
              const subVal = String(rows[i + r][idx + off])
                .toUpperCase()
                .trim();
              if (subVal.includes("SAK") || subVal === "SAK") offsetSak = off;
              else if (subVal.includes("KG") || subVal.includes("MATERIAL"))
                offsetKg = off;
            }
          }
        }
      });
      if (dateColIndex !== -1 && colPartName !== -1) break;
    }

    if (dateColIndex === -1 || colPartName === -1) return [];
    if (offsetSak === -1 && offsetKg === -1) {
      offsetKg = 2;
      offsetSak = 3;
    }

    const results = [];
    let currentPartName = null;
    let currentPartNo = "-";
    let currentNo = 9999;

    for (let i = headerRow + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;

      const cellNo = String(row[colNo] || "").trim();
      const isNewNumber = cellNo.length > 0 && !isNaN(parseFloat(cellNo));

      let cellName = String(row[colPartName] || "")
        .replace(/\s+/g, " ")
        .trim();
      const isHeader = [
        "PART NAME",
        "TOTAL",
        "SUB TOTAL",
        "MODEL",
        "ACTUAL",
      ].some((x) => cellName.toUpperCase().includes(x));
      const isModelCode = /^\(.*\)$/.test(cellName);
      const looksLikePartNo =
        /[0-9]/.test(cellName) && /-/.test(cellName) && !cellName.includes(" ");
      const isShortCodeWithNum = cellName.length <= 5 && /[0-9]/.test(cellName);
      const isTooShort = cellName.length < 2;
      const isZero = cellName === "0";

      const isValidName =
        cellName &&
        !isHeader &&
        !isModelCode &&
        !looksLikePartNo &&
        !isShortCodeWithNum &&
        !isTooShort &&
        !isZero;

      if (isNewNumber) {
        if (cellName && !isHeader && !isModelCode) {
          currentPartName = cellName;
          currentNo = parseFloat(cellNo);
          const rawNo = String(row[colPartNo] || "").trim();
          currentPartNo = rawNo.length > 3 ? rawNo : "-";
        }
      } else {
        if (isValidName) {
          currentPartName = cellName;
          const rawNo = String(row[colPartNo] || "").trim();
          if (rawNo.length > 3) currentPartNo = rawNo;
        }
      }

      if (!currentPartName) continue;

      let isActualRow = false;
      for (let c = 0; c < 10; c++) {
        const val = String(row[c]).toUpperCase().trim();
        if (val === "ACTUAL" || val === "ACT") {
          isActualRow = true;
          break;
        }
      }
      if (isActualRow) continue;

      let finalSak = 0;
      let displayKg = 0;

      if (offsetKg !== -1) {
        let val = parseFloat(
          String(row[dateColIndex + offsetKg]).replace(",", ".")
        );
        if (!isNaN(val) && val > 0) displayKg = val;
      }
      if (offsetSak !== -1) {
        let val = parseFloat(
          String(row[dateColIndex + offsetSak]).replace(",", ".")
        );
        if (!isNaN(val) && val > 0) finalSak = val;
      }

      if (finalSak > 0) {
        results.push({
          machine: sheetName.replace(".csv", "").replace(".xlsx", "").trim(),
          no: currentNo,
          partName: currentPartName,
          partNo: currentPartNo,
          rawSak: finalSak,
          rawKg: displayKg,
        });
      }
    }
    return results;
  };

  // === 3. AGGREGASI ===
  const aggregateData = (rawData) => {
    const grouped = {};
    rawData.forEach((item) => {
      const key = `${item.machine}__${item.partName}`;
      if (!grouped[key]) {
        grouped[key] = {
          machine: item.machine,
          no: item.no,
          partName: item.partName,
          partNo: item.partNo,
          totalRawSak: 0,
          totalRawKg: 0,
        };
      }
      grouped[key].totalRawSak += item.rawSak;
      grouped[key].totalRawKg += item.rawKg;
    });

    return Object.values(grouped).map((item) => {
      const totalQty = Math.ceil(item.totalRawSak);
      const jmlLabel = Math.ceil(totalQty / 13);
      return {
        id: Math.random().toString(36),
        machine: item.machine,
        no: item.no,
        partName: item.partName,
        partNo: item.partNo,
        inputSak: item.totalRawSak,
        inputKg: item.totalRawKg,
        totalQty: totalQty,
        jmlLabel: jmlLabel,
        recycleInput: 0,
      };
    });
  };

  const handleRecycleChange = (id, val) => {
    const newVal = Math.max(0, parseInt(val) || 0);
    setDataMaterial((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const netQty = Math.max(0, item.totalQty - newVal);
          const newJmlLabel = Math.ceil(netQty / 13) || (newVal > 0 ? 1 : 0);
          return { ...item, recycleInput: newVal, jmlLabel: newJmlLabel };
        }
        return item;
      })
    );
  };

  // === 5. PRINT ENGINE 1: REQUEST MATERIAL (KODE DARI MAS - PORTRAIT) ===
  const handlePrintRequest = (item) => {
    const labels = [];
    const totalPlan = item.totalQty;
    const totalRecycle = item.recycleInput;
    const netRequest = Math.max(0, totalPlan - totalRecycle);

    let totalBox = Math.ceil(netRequest / 13);
    if (totalBox === 0 && totalRecycle > 0) totalBox = 1;
    if (totalBox === 0 && totalPlan > 0) totalBox = 1;

    const recyclePerBox = Math.floor(totalRecycle / totalBox);
    const recycleRemainder = totalRecycle % totalBox;

    let remainingNet = netRequest;

    for (let i = 0; i < totalBox; i++) {
      const currentNet = Math.min(13, remainingNet);
      const currentRecycle = recyclePerBox + (i < recycleRemainder ? 1 : 0);

      let qtyDisplay = `${currentNet}`;
      if (currentRecycle > 0) qtyDisplay = `${currentNet} + ${currentRecycle}`;

      let totalDisplay = `${netRequest}`;
      if (totalRecycle > 0) totalDisplay = `${netRequest} + ${totalRecycle}`;
      else totalDisplay = `${totalPlan}`;

      labels.push({
        ...item,
        qtyDisplay: qtyDisplay,
        totalDisplay: totalDisplay,
        boxKe: i + 1,
        totalBox: totalBox,
      });
      remainingNet -= currentNet;
    }
    setPrintType("REQ");
    setPrintData(labels);
  };

  // === 6. PRINT ENGINE 2: LABEL (INPUT DB) ===
  const handlePrintLabel = (item) => {
    const dbKey = item.partName.trim().toUpperCase();
    const extraData = masterDb[dbKey];

    if (!extraData) {
      alert("Data Part ini belum diinput di menu INPUT! Silakan input dulu.");
      return;
    }

    const totalQty = item.totalQty;
    const totalBox = Math.ceil(totalQty / 13) || 1;
    const labels = [];
    let remaining = totalQty;

    for (let i = 1; i <= totalBox; i++) {
      const currentQty = Math.min(13, remaining);
      labels.push({
        machine: item.machine,
        partName: extraData.partName,
        partNo: extraData.partNo,
        color: extraData.color,
        hgs: extraData.partNoHgs,
        fg: extraData.finishGood,
        material: extraData.materialName,
        model: extraData.model,
        qty: currentQty,
        boxKe: i,
        totalBox: totalBox,
      });
      remaining -= currentQty;
    }

    setPrintType("LABEL");
    setPrintData(labels);
  };

  useEffect(() => {
    if (printData) setTimeout(() => window.print(), 500);
  }, [printData]);

  const groupedUI = dataMaterial.reduce((acc, item) => {
    if (!acc[item.machine]) acc[item.machine] = [];
    acc[item.machine].push(item);
    return acc;
  }, {});

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-slate-800 font-sans overflow-hidden">
      {/* HEADER */}
      <div className="flex-none bg-white shadow-md z-20 print:hidden border-b border-gray-200">
        <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl shadow-blue-200 shadow-lg">
              🖨️
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">
                VUTEQ <span className="text-blue-600">LABEL SYSTEM</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-widest mt-1 uppercase">
                Production Plan Reader
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("scan")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  viewMode === "scan"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                SCAN
              </button>
              <button
                onClick={() => setViewMode("input")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  viewMode === "input"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                INPUT DB
              </button>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                TGL:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-sm font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
              />
            </div>
            {viewMode === "scan" && (
              <label className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-lg cursor-pointer transition-all active:scale-95 shadow-sm gap-2">
                <span>📂</span> Upload Excel
                <input
                  type="file"
                  multiple
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="hidden"
                />
              </label>
            )}
          </div>
          {isProcessing && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100 overflow-hidden">
              <div className="h-full bg-blue-500 animate-progress w-full origin-left"></div>
            </div>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-8 print:hidden">
        <div className="w-full mx-auto">
          {/* VIEW INPUT */}
          {viewMode === "input" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-lg text-slate-700 mb-4 border-b pb-2">
                Input Master Data Part
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500">
                    Part Name (Kunci)
                  </label>
                  <input
                    name="partName"
                    value={inputForm.partName}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded text-sm font-bold bg-yellow-50"
                    placeholder="Copy Paste dari Excel..."
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">
                    Part No
                  </label>
                  <input
                    name="partNo"
                    value={inputForm.partNo}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">
                    Color
                  </label>
                  <input
                    name="color"
                    value={inputForm.color}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">
                    Part No HGS
                  </label>
                  <input
                    name="partNoHgs"
                    value={inputForm.partNoHgs}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">
                    Finish Good
                  </label>
                  <input
                    name="finishGood"
                    value={inputForm.finishGood}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">
                    Material
                  </label>
                  <input
                    name="materialName"
                    value={inputForm.materialName}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">
                    Model
                  </label>
                  <input
                    name="model"
                    value={inputForm.model}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded text-sm"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveInput}
                className="bg-emerald-600 text-white font-bold py-2 px-6 rounded hover:bg-emerald-700"
              >
                Simpan Database
              </button>
              <div className="mt-8">
                <h4 className="font-bold text-slate-700 mb-2">
                  Data Tersimpan ({Object.keys(masterDb).length})
                </h4>
                <div className="overflow-auto max-h-96 border rounded">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 font-bold text-slate-600">
                      <tr>
                        <th className="p-2">Part Name</th>
                        <th className="p-2">Part No</th>
                        <th className="p-2">HGS</th>
                        <th className="p-2">Material</th>
                        <th className="p-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(masterDb).map(([key, item]) => (
                        <tr key={key} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-bold">{item.partName}</td>
                          <td className="p-2">{item.partNo}</td>
                          <td className="p-2">{item.partNoHgs}</td>
                          <td className="p-2">{item.materialName}</td>
                          <td className="p-2">
                            <button
                              onClick={() => handleDeleteDb(key)}
                              className="text-red-500 text-xs font-bold"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW SCAN */}
          {viewMode === "scan" && (
            <>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="font-bold text-2xl text-slate-800">
                    Data Material{" "}
                    <span className="text-blue-600 text-xl font-medium border-b-2 border-blue-200 pb-1">
                      {new Date(selectedDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Total{" "}
                    <span className="font-bold text-blue-600">
                      {dataMaterial.length}
                    </span>{" "}
                    item material ditemukan.
                  </p>
                </div>
                {dataMaterial.length > 0 && (
                  <button
                    onClick={() => setDataMaterial([])}
                    className="text-xs text-red-500 hover:text-red-700 font-bold tracking-wide uppercase transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
                  >
                    Reset Data
                  </button>
                )}
              </div>

              {Object.keys(groupedUI).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-80 text-slate-400 border border-dashed border-slate-300 rounded-2xl bg-white shadow-sm">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-3xl opacity-50">
                    📊
                  </div>
                  <p className="font-medium text-slate-600">
                    Belum ada data ditampilkan
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start pb-20">
                  {Object.keys(groupedUI).map((machine) => (
                    <div
                      key={machine}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                      <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                          <span className="font-bold text-slate-700 text-sm uppercase tracking-wide">
                            Mesin: {machine}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold bg-white border border-gray-200 px-3 py-1 rounded-full text-slate-500">
                          {groupedUI[machine].length} PARTS
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-white text-slate-500 border-b border-gray-100">
                            <tr>
                              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider w-[30%]">
                                Part Name
                              </th>
                              {/* Header KG */}
                              <th className="px-2 py-3 font-semibold text-xs uppercase tracking-wider w-[15%] text-center text-gray-400">
                                Total KG
                              </th>
                              <th className="px-2 py-3 font-semibold text-xs uppercase tracking-wider w-[10%] text-center text-emerald-600">
                                Recycle
                              </th>
                              <th className="px-2 py-3 font-semibold text-xs uppercase tracking-wider w-[15%] text-center">
                                Total Sak
                              </th>
                              <th className="px-2 py-3 font-semibold text-xs uppercase tracking-wider w-[25%] text-right">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {groupedUI[machine]
                              .sort((a, b) => a.no - b.no)
                              .map((item, idx) => (
                                <tr
                                  key={idx}
                                  className="hover:bg-blue-50/50 transition-colors duration-150 group"
                                >
                                  {/* PART NAME */}
                                  <td className="px-4 py-3">
                                    <div className="font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">
                                      {item.partName}
                                    </div>
                                    {/* Indikator DB */}
                                    {masterDb[
                                      item.partName.trim().toUpperCase()
                                    ] && (
                                      <span className="text-[9px] bg-green-100 text-green-700 px-1.5 rounded ml-1">
                                        ✓ DB
                                      </span>
                                    )}
                                  </td>

                                  {/* === TAMBAHAN: TOTAL KG (Raw Data) === */}
                                  <td className="px-2 py-3 text-center">
                                    <span className="font-medium text-black bg-gray-100 px-2 py-1 rounded text-xs border border-gray-200">
                                      {item.inputKg > 0
                                        ? item.inputKg.toLocaleString("id-ID", {
                                            maximumFractionDigits: 2,
                                          }) + " Kg"
                                        : "-"}
                                    </span>
                                  </td>

                                  {/* RECYCLE INPUT */}
                                  <td className="px-2 py-3 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      className="w-12 text-center text-xs font-bold text-emerald-700 border border-emerald-200 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                                      value={
                                        item.recycleInput === 0
                                          ? ""
                                          : item.recycleInput
                                      }
                                      placeholder="0"
                                      onChange={(e) =>
                                        handleRecycleChange(
                                          item.id,
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>

                                  {/* TOTAL SAK (NET REQUEST & RAW INFO) */}
                                  <td className="px-2 py-3 text-center">
                                    <div className="inline-flex flex-col items-center">
                                      {/* Angka Utama (Net Request setelah Recycle) */}
                                      <span className="text-lg font-bold text-slate-800">
                                        {item.totalQty}
                                      </span>
                                      {/* === TAMBAHAN: RAW SAK ASLI === */}
                                      <span className="text-[10px] text-slate-400 font-medium italic">
                                        (Raw:{" "}
                                        {item.inputSak % 1 === 0
                                          ? item.inputSak
                                          : item.inputSak.toFixed(1)}
                                        )
                                      </span>
                                    </div>
                                  </td>

                                  {/* ACTION BUTTONS */}
                                  <td className="px-2 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                      <button
                                        onClick={() => handlePrintRequest(item)}
                                        className="bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 text-[10px] font-bold py-1.5 px-2 rounded shadow-sm flex items-center gap-1"
                                      >
                                        📄 REQ
                                      </button>
                                      <button
                                        onClick={() => handlePrintLabel(item)}
                                        className="bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-[10px] font-bold py-1.5 px-2 rounded shadow-sm flex items-center gap-1"
                                      >
                                        🏷️ LABEL
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ================= AREA PRINT ================= */}
      <div className="hidden print:block bg-white text-black font-sans leading-none">
        {/* === PRINT 1: REQUEST MATERIAL (KODE DARI MAS - PORTRAIT) === */}
        {printType === "REQ" && (
          <div className="grid grid-cols-3 gap-2 w-full p-2">
            {printData &&
              printData.map((lbl, idx) => (
                <div
                  key={idx}
                  className="border border-black flex flex-col h-[279px] justify-between relative box-border px-1.5 pt-1.5 pb-3 bg-white break-inside-avoid"
                >
                  <div>
                    <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-1">
                      <div className="w-1/4 text-left font-bold text-sm uppercase leading-none">
                        {lbl.machine}
                      </div>
                      <div className="w-2/4 text-center font-bold text-base uppercase leading-none transform translate-y-px">
                        REQUEST MATERIAL
                      </div>
                      <div className="w-1/4 text-right text-[10px] font-normal leading-none text-black">
                        PD-FR-K046
                      </div>
                    </div>
                    <div className="px-0.5 text-[9px] space-y-0.5 mb-1">
                      <div className="flex">
                        <div className="w-16 font-bold shrink-0">Part Name</div>
                        <div className="w-2 text-center shrink-0">:</div>
                        <div className="uppercase font-normal leading-tight flex-1">
                          {lbl.partName}
                        </div>
                      </div>
                      <div className="flex">
                        <div className="w-16 font-bold shrink-0">Part No</div>
                        <div className="w-2 text-center shrink-0">:</div>
                        <div className="font-normal flex-1">{lbl.partNo}</div>
                      </div>
                      <div className="flex">
                        <div className="w-16 font-bold shrink-0">Model</div>
                        <div className="w-2 text-center shrink-0">:</div>
                        <div className="font-normal flex-1"></div>
                      </div>
                    </div>
                    <div className="mt-0.5">
                      <table className="w-full text-[9px] border-collapse border border-black font-sans">
                        <thead>
                          <tr className="border-b border-black bg-gray-200">
                            <th className="border border-black p-0.5 w-[28%] text-left pl-2 font-bold">
                              ITEM
                            </th>
                            <th className="border border-black p-0.5 w-[37%] text-left pl-2 font-bold">
                              STANDARD MATERIAL
                            </th>
                            <th className="border border-black p-0.5 w-[35%] text-left pl-2 font-bold">
                              ACTUAL MATERIAL
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-black">
                            <td className="border-r border-black p-0.5 pl-2 font-bold">
                              PART NAME
                            </td>
                            <td className="border-r border-black p-0.5 pl-2 font-normal uppercase leading-none">
                              {lbl.partName}
                            </td>
                            <td className="p-0.5 pl-2 font-bold"></td>
                          </tr>
                          <tr className="border-b border-black">
                            <td className="border-r border-black p-0.5 pl-2 font-bold">
                              PART NO
                            </td>
                            <td className="border-r border-black p-0.5 pl-2 font-normal">
                              {lbl.partNo}
                            </td>
                            <td className="p-0.5 pl-2 font-bold"></td>
                          </tr>
                          <tr className="border-b border-black">
                            <td className="border-r border-black p-0.5 pl-2 font-bold">
                              COLOUR
                            </td>
                            <td className="border-r border-black p-0.5 pl-2 font-normal">
                              BLACK
                            </td>
                            <td className="p-0.5 pl-2 font-bold"></td>
                          </tr>
                          <tr className="border-b border-black">
                            <td className="border-r border-black p-0.5 pl-2 font-bold">
                              LOT NO
                            </td>
                            <td className="p-0.5 pl-2 font-bold" colSpan={2}>
                              :
                            </td>
                          </tr>
                          <tr className="border-b border-black">
                            <td className="border-r border-black p-0.5 pl-2 font-bold">
                              QTY MATERIAL
                            </td>
                            <td
                              className="p-0.5 pl-2 font-bold text-center text-xs"
                              colSpan={2}
                            >
                              {lbl.qtyDisplay} / {lbl.totalDisplay}
                            </td>
                          </tr>
                          <tr className="border-b border-black">
                            <td className="border-r border-black p-0.5 pl-2 font-bold">
                              QTY BOX KE
                            </td>
                            <td
                              className="p-0.5 pl-2 font-bold text-center text-xs"
                              colSpan={2}
                            >
                              {lbl.boxKe} / {lbl.totalBox}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="w-full text-[8px] font-bold">
                    <div className="flex justify-between items-end">
                      <span>Waktu Persiapan: 1 / 2 / 3</span>
                      <span className="w-[90px] flex items-center">
                        Tanggal:
                        <span className="font-normal ml-1">
                          {new Date(selectedDate).toLocaleDateString("id-ID")}
                        </span>
                      </span>
                    </div>
                    <div className="border-t-[1.5px] border-dotted border-black w-full my-1"></div>
                    <div className="flex justify-between items-end">
                      <span>Waktu Pemakaian: 1 / 2 / 3</span>
                      <span className="w-[90px] flex items-center">
                        Tanggal:
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* === PRINT 2: NEW LABEL (DARI DATA INPUT) === */}
        {printType === "LABEL" && (
          <div className="grid grid-cols-3 gap-4 w-full p-4">
            {printData &&
              printData.map((lbl, idx) => (
                <div
                  key={idx}
                  className="border-2 border-black flex flex-col relative box-border p-3 bg-white break-inside-avoid"
                  style={{ height: "95mm" }}
                >
                  <div className="text-center font-black text-xl border-b-2 border-black pb-2 mb-2 uppercase">
                    PART IDENTIFICATION
                  </div>
                  <table className="w-full text-xs border-collapse border border-black grow">
                    <tbody>
                      <tr className="border-b border-black">
                        <td className="border-r border-black p-2 font-bold w-[30%] bg-gray-100">
                          PART NAME
                        </td>
                        <td className="p-2 font-bold uppercase text-sm">
                          {lbl.partName}
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="border-r border-black p-2 font-bold bg-gray-100">
                          MODEL
                        </td>
                        <td className="p-2 font-bold">{lbl.model}</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="border-r border-black p-2 font-bold bg-gray-100">
                          PART NO
                        </td>
                        <td className="p-2 font-bold text-lg">{lbl.partNo}</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="border-r border-black p-2 font-bold bg-gray-100">
                          COLOR
                        </td>
                        <td className="p-2 font-bold">{lbl.color}</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="border-r border-black p-2 font-bold bg-gray-100">
                          HGS NO
                        </td>
                        <td className="p-2 font-bold">{lbl.hgs}</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="border-r border-black p-2 font-bold bg-gray-100">
                          MATERIAL
                        </td>
                        <td className="p-2 font-bold">{lbl.material}</td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="border-r border-black p-2 font-bold bg-gray-100">
                          FINISH GOOD
                        </td>
                        <td className="p-2 font-bold">{lbl.fg}</td>
                      </tr>
                      <tr>
                        <td className="border-r border-black p-2 font-bold bg-gray-100">
                          QTY / BOX
                        </td>
                        <td className="p-2 font-black text-lg">
                          {lbl.qty}{" "}
                          <span className="text-xs font-normal">
                            (Box {lbl.boxKe}/{lbl.totalBox})
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="text-[10px] text-right mt-2 italic">
                    Printed: {new Date().toLocaleString()}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-progress { animation: progress 1.5s infinite linear; }
        @media print {
          @page { size: A4 portrait; margin: 5mm; }
          .print\\:grid-cols-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5mm; }
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}

export default App;