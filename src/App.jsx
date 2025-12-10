// import React, { useState, useEffect } from "react";
// import * as XLSX from "xlsx";

// function App() {
//   const [dataMaterial, setDataMaterial] = useState([]);
//   const [printData, setPrintData] = useState(null);
//   const [isProcessing, setIsProcessing] = useState(false);

//   // Default: Hari Ini
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

//   // === 2. CORE LOGIC (FILL DOWN + SAK & KG CAPTURE) ===
//   const processSheet = (rows, sheetName, markers) => {
//     let headerRow = -1;
//     let colPartName = -1;
//     let colPartNo = -1;
//     let dateColIndex = -1;
//     let offsetSak = -1;
//     let offsetKg = -1;

//     // A. DETEKSI HEADER
//     for (let i = 0; i < Math.min(50, rows.length); i++) {
//       const row = rows[i];
//       row.forEach((cell, idx) => {
//         const val = String(cell).toUpperCase().trim();
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
//     if (offsetSak === -1 && offsetKg === -1) {
//       offsetKg = 2;
//       offsetSak = 3;
//     }

//     // B. EKSTRAKSI DATA (DENGAN FILL DOWN)
//     const results = [];
//     let currentPartName = null; // Penampung nama baris induk
//     let currentPartNo = "-";

//     for (let i = headerRow + 1; i < rows.length; i++) {
//       const row = rows[i];
//       if (!row) continue;

//       const cellPartName = String(row[colPartName] || "").trim();

//       // LOGIKA FILL DOWN:
//       // Jika ada nama baru -> Update current
//       if (
//         cellPartName &&
//         !["PART NAME", "TOTAL", "SUB TOTAL"].some((x) =>
//           cellPartName.toUpperCase().includes(x)
//         )
//       ) {
//         currentPartName = cellPartName;
//         currentPartNo = colPartNo !== -1 ? String(row[colPartNo] || "-") : "-";
//       }

//       // Jika cell kosong, kita pakai currentPartName yang lama (baris merged/bawahnya)
//       if (!currentPartName) continue;

//       // Skip baris ACTUAL
//       let isActualRow = false;
//       for (let c = 0; c < 10; c++) {
//         const cellVal = String(row[c]).toUpperCase().trim();
//         if (cellVal === "ACTUAL" || cellVal === "ACT") {
//           isActualRow = true;
//           break;
//         }
//       }
//       if (isActualRow) continue;

//       // --- AMBIL DATA ---
//       let finalSak = 0;
//       let displayKg = 0;

//       // Ambil KG
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

//       // Fallback SAK ambil dari KG jika kosong
//       if (finalSak === 0 && displayKg > 0) {
//         finalSak = displayKg;
//       }

//       // Simpan jika ada data (menggunakan currentPartName)
//       if (finalSak > 0) {
//         results.push({
//           machine: sheetName.replace(".csv", "").replace(".xlsx", "").trim(),
//           partName: currentPartName, // Pakai nama dari memori (fill down)
//           partNo: currentPartNo,
//           rawSak: finalSak,
//           rawKg: displayKg,
//         });
//       }
//     }
//     return results;
//   };

//   // === 3. AGGREGASI (JUMLAHKAN SAK & KG) ===
//   const aggregateData = (rawData) => {
//     const grouped = {};
//     rawData.forEach((item) => {
//       // Grouping Key: Mesin + PartName
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
//       // INI PROSES PENJUMLAHANNYA
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
//       };
//     });
//   };

//   // === 4. PRINT ENGINE ===
//   const handlePrint = (item) => {
//     const labels = [];
//     let remaining = item.totalQty;
//     let boxKe = 1;
//     const totalBox = item.jmlLabel;

//     while (remaining > 0) {
//       const isi = Math.min(13, remaining);
//       labels.push({
//         ...item,
//         currentQty: isi,
//         boxKe: boxKe,
//         totalBox: totalBox,
//       });
//       remaining -= isi;
//       boxKe++;
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
//       {/* HEADER FIXED */}
//       <div className="flex-none bg-white shadow-md z-20 print:hidden border-b border-gray-200">
//         <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 relative">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl shadow-blue-200 shadow-lg">
//               🖨️
//             </div>
//             <div>
//               <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none mx-auto">
//                 VUTEQ INDONESIA
//               </h1>
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

//           {/* Loading Bar */}
//           {isProcessing && (
//             <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100 overflow-hidden">
//               <div className="h-full bg-blue-500 animate-progress w-full origin-left"></div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* === DATA SCROLLABLE SECTION (GRID 2 KOLOM) === */}
//       <div className="flex-1 overflow-y-auto p-8 print:hidden">
//         <div className="max-w-[1600px] mx-auto">
//           <div className="flex justify-between items-end mb-6">
//             <div>
//               <h3 className="font-bold text-2xl text-slate-800">
//                 Data Material{" "}
//                 <span className="text-blue-600 text-2xl font-medium pb-1">
//                   {new Date(selectedDate).toLocaleDateString("id-ID", {
//                     day: "numeric",
//                     month: "long",
//                     year: "numeric",
//                   })}
//                 </span>
//               </h3>
//               <p className="text-sm text-slate-500 mt-1">
//                 Total 
//                 <span className="font-bold text-blue-600 mx-1">
//                 {dataMaterial.length}
//                 </span>
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
//               <p className="text-xs mt-1">
//                 Silakan pilih tanggal & upload file excel
//               </p>
//             </div>
//           ) : (
//             // GRID 2 KOLOM
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
//                           <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider w-[40%]">
//                             Part Name
//                           </th>
//                           <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider w-[20%] text-center text-gray-400">
//                             Total KG
//                           </th>
//                           <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider w-[20%] text-center">
//                             Qty Sak
//                           </th>
//                           <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider w-[20%] text-right">
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
//                             <td className="px-5 py-3">
//                               <div className="font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">
//                                 {item.partName}
//                               </div>
//                             </td>
//                             <td className="px-5 py-3 text-center">
//                               <span className="font-medium text-black bg-gray-50 px-2 py-1 rounded text-xs">
//                                 {item.inputKg > 0
//                                   ? item.inputKg.toLocaleString("id-ID", {
//                                       maximumFractionDigits: 1,
//                                     })
//                                   : "-"}
//                               </span>
//                             </td>
//                             <td className="px-5 py-3 text-center">
//                               <div className="inline-flex flex-col items-center">
//                                 <span className="text-lg font-bold text-slate-800">
//                                   {item.totalQty}
//                                 </span>
//                                 <span className="text-sm text-black font-medium">
//                                   (
//                                   {item.inputSak % 1 === 0
//                                     ? item.inputSak
//                                     : item.inputSak.toFixed(1)}
//                                   )
//                                 </span>
//                               </div>
//                             </td>
//                             <td className="px-5 py-3 text-right">
//                               <button
//                                 onClick={() => handlePrint(item)}
//                                 className="bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 text-xs font-bold py-1.5 px-4 rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-2 ml-auto"
//                               >
//                                 <span>🖨️</span> Print
//                                 <span className="bg-slate-100 group-hover:bg-emerald-100 px-1.5 rounded text-sm min-w-5 text-center">
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

//       {/* PRINT TEMPLATE */}
//       <div className="hidden print:grid print:grid-cols-2 print:grid-rows-3 print:gap-4 print:w-[210mm] print:h-[297mm] print:p-[10mm] bg-white text-black font-sans leading-none">
//         {printData &&
//           printData.map((lbl, idx) => (
//             <div
//               key={idx}
//               className="border-[2px] border-black flex flex-col h-full relative p-0 bg-white box-border"
//             >
//               <div className="h-[42px] border-b-2 border-black relative">
//                 <span className="absolute top-0 right-2 text-2xl font-black">
//                   50T
//                 </span>
//                 <div className="text-center font-bold text-base mt-2">
//                   REQUEST MATERIAL
//                 </div>
//                 <span className="absolute bottom-[1px] right-[2px] text-[8px] font-mono">
//                   PD-FR-K046
//                 </span>
//               </div>
//               <div className="grid grid-cols-2 border-b border-black text-[10px] h-[38px]">
//                 <div className="p-1 pl-2 flex flex-col justify-center">
//                   <span className="text-[9px]">PROSES:</span>
//                   <b className="text-sm">INJECTION</b>
//                 </div>
//                 <div className="p-1 border-l border-black flex flex-col justify-center items-center bg-gray-50">
//                   <span className="text-[9px]">MESIN:</span>
//                   <span className="font-bold text-lg">{lbl.machine}</span>
//                 </div>
//               </div>
//               <div className="px-2 py-2 border-b border-black text-[9px] space-y-1">
//                 <div className="flex">
//                   <span className="w-16">Part Name</span>
//                   <span className="font-bold uppercase">: {lbl.partName}</span>
//                 </div>
//                 <div className="flex">
//                   <span className="w-16">Part No</span>
//                   <span className="font-bold">: {lbl.partNo}</span>
//                 </div>
//               </div>
//               <div className="flex-grow p-1">
//                 <table className="w-full text-[10px] border-collapse">
//                   <thead>
//                     <tr className="border-b border-black">
//                       <th className="text-center w-[25%] pb-1 font-bold">
//                         ITEM
//                       </th>
//                       <th className="text-center w-[35%] pb-1 font-bold">
//                         STD MATERIAL
//                       </th>
//                       <th className="text-center pb-1 font-bold">
//                         ACTUAL MATERIAL
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="text-[10px]">
//                     <tr>
//                       <td className="py-2">PART NAME</td>
//                       <td className="py-2 font-bold pl-2">{lbl.partName}</td>
//                       <td className="py-2 border-b border-dotted border-black"></td>
//                     </tr>
//                     <tr>
//                       <td className="py-2">COLOUR</td>
//                       <td className="py-2 font-bold pl-2">BLACK</td>
//                       <td className="py-2 border-b border-dotted border-black"></td>
//                     </tr>
//                     <tr>
//                       <td className="py-2">QTY SAK</td>
//                       <td className="py-2 pl-2">
//                         <span className="text-sm font-bold">
//                           {lbl.currentQty}
//                         </span>{" "}
//                         / {lbl.totalQty}
//                       </td>
//                       <td className="py-2 border-b border-dotted border-black"></td>
//                     </tr>
//                     <tr>
//                       <td className="py-2">BOX KE</td>
//                       <td className="py-2 pl-2 font-bold">
//                         {lbl.boxKe} / {lbl.totalBox}
//                       </td>
//                       <td className="py-2 border-b border-dotted border-black"></td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//               <div className="text-[9px] p-1 border-t border-black mt-auto">
//                 <div className="flex justify-between border-b border-black pb-1 mb-1 items-end">
//                   <span>Waktu persiapan : 1 / 2 / 3</span>
//                   <span>
//                     Tgl:{" "}
//                     <b className="font-mono">
//                       {new Date().toLocaleDateString("id-ID")}
//                     </b>
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-end">
//                   <span>Waktu pemakaian : 1 / 2 / 3</span>
//                   <span>Tgl: ........................</span>
//                 </div>
//               </div>
//             </div>
//           ))}
//       </div>

//       <style>{`
//         @keyframes progress {
//           0% { transform: translateX(-100%); }
//           100% { transform: translateX(100%); }
//         }
//         .animate-progress {
//           animation: progress 1.5s infinite linear;
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
  const [isProcessing, setIsProcessing] = useState(false);

  // Default: Hari Ini
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );

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

  // === 2. CORE LOGIC (SUPER STRICT NAME FILTER) ===
  const processSheet = (rows, sheetName, markers) => {
    let headerRow = -1;
    let colPartName = -1;
    let colPartNo = -1;
    let dateColIndex = -1;
    let offsetSak = -1;
    let offsetKg = -1;

    for (let i = 0; i < Math.min(50, rows.length); i++) {
      const row = rows[i];
      row.forEach((cell, idx) => {
        const val = String(cell).toUpperCase().trim();
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

    for (let i = headerRow + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;

      let cellPartName = String(row[colPartName] || "").trim();

      // === VALIDASI NAMA PART (REVISI) ===

      // 1. Cek Part Number Nyasar (Ada Angka DAN Ada Strip)
      // Contoh: 86814/13-I7000, 72321-73R00
      const looksLikePartNo =
        /[0-9]/.test(cellPartName) && /-/.test(cellPartName);

      // 2. Cek Kode Model (Dalam kurung)
      // Contoh: (Y4L), (SU2ID)
      const isModelCode = /^\(.*\)$/.test(cellPartName);

      // 3. Cek Kode Pendek (<= 5 Huruf)
      // Contoh: Y4L, SU2ID, D03B. (Part Name asli biasanya > 5 huruf)
      const isShortCode = cellPartName.length <= 5;

      // 4. Cek Header Sampah
      const isHeader = ["PART NAME", "TOTAL", "SUB TOTAL", "MODEL"].some((x) =>
        cellPartName.toUpperCase().includes(x)
      );

      // KEPUTUSAN: Apakah ini Nama Valid?
      const isValidName =
        cellPartName &&
        !looksLikePartNo &&
        !isModelCode &&
        !isShortCode &&
        !isHeader;

      if (isValidName) {
        // UPDATE INDUK
        currentPartName = cellPartName;
        // Reset Part No jika ada nama baru
        const rawNo = String(row[colPartNo] || "").trim();
        if (rawNo.length > 3) currentPartNo = rawNo;
      }

      // Kalau nama tidak valid, kita skip update currentPartName
      // (Artinya kita pakai currentPartName dari baris atasnya/induk)

      if (!currentPartName) continue;

      let isActualRow = false;
      for (let c = 0; c < 10; c++) {
        const cellVal = String(row[c]).toUpperCase().trim();
        if (cellVal === "ACTUAL" || cellVal === "ACT") {
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

      if (finalSak === 0 && displayKg > 0) {
        finalSak = displayKg;
      }

      if (finalSak > 0) {
        results.push({
          machine: sheetName.replace(".csv", "").replace(".xlsx", "").trim(),
          partName: currentPartName,
          partNo: currentPartNo,
          rawSak: finalSak,
          rawKg: displayKg,
        });
      }
    }
    return results;
  };

  // === 3. AGGREGASI (TETAP) ===
  const aggregateData = (rawData) => {
    const grouped = {};
    rawData.forEach((item) => {
      const key = `${item.machine}__${item.partName}`;
      if (!grouped[key]) {
        grouped[key] = {
          machine: item.machine,
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

  // === 4. HANDLE RECYCLE (TETAP) ===
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

  // === 5. PRINT ENGINE (TETAP) ===
  const handlePrint = (item) => {
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
      if (currentRecycle > 0) {
        qtyDisplay = `${currentNet} + ${currentRecycle}`;
      }

      let totalDisplay = `${netRequest}`;
      if (totalRecycle > 0) {
        totalDisplay = `${netRequest} + ${totalRecycle}`;
      } else {
        totalDisplay = `${totalPlan}`;
      }

      labels.push({
        ...item,
        qtyDisplay: qtyDisplay,
        totalDisplay: totalDisplay,
        boxKe: i + 1,
        totalBox: totalBox,
      });

      remainingNet -= currentNet;
    }

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
      {/* HEADER FIXED */}
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
          </div>

          {isProcessing && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100 overflow-hidden">
              <div className="h-full bg-blue-500 animate-progress w-full origin-left"></div>
            </div>
          )}
        </div>
      </div>

      {/* DATA SCROLLABLE SECTION (GRID 2 KOLOM) */}
      <div className="flex-1 overflow-y-auto p-8 print:hidden">
        <div className="max-w-[1600px] mx-auto">
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
              <p className="text-xs mt-1">
                Silakan pilih tanggal & upload file excel
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
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider w-[35%]">
                            Part Name
                          </th>
                          <th className="px-2 py-3 font-semibold text-xs uppercase tracking-wider w-[15%] text-center text-gray-400">
                            Total KG
                          </th>
                          <th className="px-2 py-3 font-semibold text-xs uppercase tracking-wider w-[15%] text-center text-emerald-600">
                            Recycle
                          </th>
                          <th className="px-2 py-3 font-semibold text-xs uppercase tracking-wider w-[15%] text-center">
                            Total Sak
                          </th>
                          <th className="px-2 py-3 font-semibold text-xs uppercase tracking-wider w-[15%] text-right">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {groupedUI[machine].map((item, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-blue-50/50 transition-colors duration-150 group"
                          >
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">
                                {item.partName}
                              </div>
                            </td>
                            <td className="px-2 py-3 text-center">
                              <span className="font-medium text-black bg-gray-50 px-2 py-1 rounded text-xs">
                                {item.inputKg > 0
                                  ? item.inputKg.toLocaleString("id-ID", {
                                      maximumFractionDigits: 1,
                                    })
                                  : "-"}
                              </span>
                            </td>
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
                                  handleRecycleChange(item.id, e.target.value)
                                }
                              />
                            </td>
                            <td className="px-2 py-3 text-center">
                              <div className="inline-flex flex-col items-center">
                                <span className="text-lg font-bold text-slate-800">
                                  {item.totalQty}
                                </span>
                                <span className="text-[9px] text-slate-400 font-medium">
                                  (Raw:{" "}
                                  {item.inputSak % 1 === 0
                                    ? item.inputSak
                                    : item.inputSak.toFixed(1)}
                                  )
                                </span>
                              </div>
                            </td>
                            <td className="px-2 py-3 text-right">
                              <button
                                onClick={() => handlePrint(item)}
                                className="bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-2 ml-auto"
                              >
                                <span>🖨️</span> Print
                                <span className="bg-slate-100 group-hover:bg-emerald-100 px-1.5 rounded text-[10px] min-w-5 text-center">
                                  {item.jmlLabel}
                                </span>
                              </button>
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
        </div>
      </div>

      {/* PRINT TEMPLATE */}
      <div className="hidden print:grid print:grid-cols-3 print:gap-4 print:w-full print:p-4 bg-white text-black font-sans leading-none">
        {printData &&
          printData.map((lbl, idx) => (
            <div
              key={idx}
              className="border-2 border-black flex flex-col relative box-border p-2 bg-white break-inside-avoid"
              style={{ height: "95mm" }}
            >
              <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-1">
                <div className="text-xl font-black w-1/4 uppercase">
                  {lbl.machine}
                </div>
                <div className="text-sm font-bold underline text-center w-2/4">
                  PEMAKAIAN MATERIAL
                </div>
                <div className="w-1/4 text-[8px] text-right font-mono">
                  PD-FR-K046
                </div>
              </div>

              <div className="mb-2 text-[10px] font-bold space-y-0.5">
                <div className="flex justify-between">
                  <div className="flex">
                    <span className="w-16">PROSES</span>
                    <span>: INJECTION</span>
                  </div>
                  <div className="flex">
                    <span className="w-12">MODEL</span>
                    <span>: {lbl.machine}</span>
                  </div>
                </div>
                <div className="flex">
                  <span className="w-16">Part Name</span>
                  <span>: {lbl.partName}</span>
                </div>
                <div className="flex">
                  <span className="w-16">Part No</span>
                  <span>: {lbl.partNo}</span>
                </div>
              </div>

              <div className="grow">
                <table className="w-full text-[9px] border-collapse border border-black">
                  <thead>
                    <tr className="border-b border-black bg-gray-100">
                      <th className="border-r border-black p-1 w-[30%] text-left">
                        ITEM
                      </th>
                      <th className="border-r border-black p-1 w-[35%] text-left">
                        STANDARD MATERIAL
                      </th>
                      <th className="p-1 w-[35%] text-left">ACTUAL MATERIAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="border-r border-black p-1 font-bold">
                        PART NAME
                      </td>
                      <td className="border-r border-black p-1"></td>
                      <td className="p-1 text-center font-bold uppercase">
                        {lbl.partName}
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="border-r border-black p-1 font-bold">
                        PART NO
                      </td>
                      <td className="border-r border-black p-1"></td>
                      <td className="p-1 text-center font-bold">
                        {lbl.partNo}
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="border-r border-black p-1 font-bold">
                        COLOUR
                      </td>
                      <td className="border-r border-black p-1"></td>
                      <td className="p-1 text-center font-bold">BLACK</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="border-r border-black p-1 font-bold">
                        LOT NO
                      </td>
                      <td className="border-r border-black p-1"></td>
                      <td className="p-1 text-center"></td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="border-r border-black p-1 font-bold">
                        QTY MATERIAL
                      </td>
                      <td className="border-r border-black p-1"></td>
                      <td className="p-1 text-center font-bold text-sm">
                        {lbl.qtyDisplay} / {lbl.totalDisplay}
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="border-r border-black p-1 font-bold">
                        QTY BOX KE
                      </td>
                      <td className="border-r border-black p-1"></td>
                      <td className="p-1 text-center font-bold text-sm">
                        {lbl.boxKe} / {lbl.totalBox}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-1 text-[8px] space-y-1 font-medium">
                <div className="flex justify-between items-end border-b border-dotted border-black pb-0.5">
                  <span>waktu persiapan : 1/2/3</span>
                  <span>
                    Tgl:{" "}
                    <b>{new Date(selectedDate).toLocaleDateString("id-ID")}</b>
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <span>waktu pemakaian : 1/2/3</span>
                  <span>Tgl: ...................</span>
                </div>
              </div>
            </div>
          ))}
      </div>

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress {
          animation: progress 1.5s infinite linear;
        }
        @media print {
          @page {
            size: A4 landscape;
            margin: 5mm;
          }
          .print\\:grid-cols-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 5mm;
          }
        }
      `}</style>
    </div>
  );
}

export default App;