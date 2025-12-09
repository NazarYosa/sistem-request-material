// import React, { useState, useEffect } from "react";
// import * as XLSX from "xlsx";

// function App() {
//   const [dataMaterial, setDataMaterial] = useState([]);
//   const [printData, setPrintData] = useState(null);
//   const [logs, setLogs] = useState([]);
//   const [isProcessing, setIsProcessing] = useState(false);

//   // Default: Hari Ini
//   const [selectedDate, setSelectedDate] = useState(
//     new Date().toLocaleDateString("en-CA")
//   );

//   const addLog = (msg) => {
//     const time = new Date().toLocaleTimeString("id-ID", { hour12: false });
//     setLogs((prev) => [`[${time}] ${msg}`, ...prev]);
//   };

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
//     setLogs([]);
//     setIsProcessing(true);
//     addLog(`📅 Memproses Tanggal: ${markers.fullDate}...`);

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
//                   addLog(`   ✅ ${sheetName}: ${result.length} baris data.`);
//                 }
//               }
//             });

//             if (extractedData.length === 0) {
//               addLog(`⚠️ File ${file.name}: Kosong di tgl tersebut.`);
//             } else {
//               // AGGREGATE (PENJUMLAHAN)
//               const aggregated = aggregateData(extractedData);
//               setDataMaterial((prev) => [...prev, ...aggregated]);
//               addLog(
//                 `🎉 Selesai! ${aggregated.length} Item Material (Setelah Dijumlah).`
//               );
//             }
//           } catch (error) {
//             addLog(`❌ ERROR: ${error.message}`);
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
//     <div className="h-screen flex flex-col bg-slate-100 text-slate-800 font-sans overflow-hidden">
//       {/* === HEADER FIXED === */}
//       <div className="flex-none bg-white shadow-sm z-20 print:hidden border-b border-slate-300">
//         <div className="px-6 py-3 flex justify-between items-center border-b border-slate-200">
//           <div>
//             <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
//               VUTEQ <span className="text-blue-600">LABEL SYSTEM</span>
//             </h1>
//           </div>

//           <div className="flex items-center gap-3">
//             <label className="text-xs font-bold text-slate-500 uppercase">
//               Pilih Tanggal:
//             </label>
//             <input
//               type="date"
//               value={selectedDate}
//               onChange={(e) => setSelectedDate(e.target.value)}
//               className="text-sm font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-12 gap-0 h-32">
//           <div className="col-span-5 p-3 border-r border-slate-200 bg-slate-50">
//             <label
//               className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-lg cursor-pointer transition-all ${
//                 isProcessing
//                   ? "bg-gray-100 border-gray-300"
//                   : "bg-white border-blue-400 hover:bg-blue-50"
//               }`}
//             >
//               <div className="flex flex-row items-center gap-3">
//                 <span className="text-2xl">{isProcessing ? "⏳" : "📥"}</span>
//                 <div className="text-left">
//                   <p className="text-sm font-bold text-slate-700">
//                     {isProcessing
//                       ? "Sedang Memproses..."
//                       : "Upload Excel Disini"}
//                   </p>
//                   <p className="text-[10px] text-slate-500">
//                     Format: Production Plan (.xlsx)
//                   </p>
//                 </div>
//               </div>
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

//           <div className="col-span-7 bg-slate-900 p-3 overflow-y-auto font-mono text-[11px] text-slate-300 scrollbar-thin scrollbar-thumb-slate-700">
//             {isProcessing && (
//               <div className="w-full bg-slate-700 rounded-full h-1 mb-2 overflow-hidden">
//                 <div className="bg-blue-500 h-1 rounded-full animate-progress w-full origin-left"></div>
//               </div>
//             )}
//             {logs.length === 0 ? (
//               <div className="h-full flex items-center justify-center text-slate-600 italic">
//                 Ready. Menunggu upload file...
//               </div>
//             ) : (
//               logs.map((log, i) => (
//                 <div
//                   key={i}
//                   className={`mb-0.5 break-words border-l-2 pl-2 ${
//                     log.includes("ERROR")
//                       ? "border-red-500 text-red-400"
//                       : log.includes("✅")
//                       ? "border-green-500 text-green-400"
//                       : "border-blue-500"
//                   }`}
//                 >
//                   {log}
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>

//       {/* === DATA SCROLLABLE === */}
//       <div className="flex-1 overflow-y-auto p-6 bg-slate-100 print:hidden">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="font-bold text-lg text-slate-700 flex items-center gap-2">
//             📋 Data Material
//             <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full border border-slate-300">
//               {dataMaterial.length} Items
//             </span>
//           </h3>
//           {dataMaterial.length > 0 && (
//             <button
//               onClick={() => {
//                 setDataMaterial([]);
//                 setLogs([]);
//               }}
//               className="text-xs text-red-600 hover:text-red-800 font-bold underline bg-white px-3 py-1 rounded border border-red-200"
//             >
//               RESET DATA
//             </button>
//           )}
//         </div>

//         {Object.keys(groupedUI).length === 0 ? (
//           <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-300 rounded-lg bg-white">
//             <p className="font-medium">Data Kosong</p>
//           </div>
//         ) : (
//           <div className="space-y-6 pb-10">
//             {Object.keys(groupedUI).map((machine) => (
//               <div
//                 key={machine}
//                 className="bg-white border border-slate-400 shadow-sm rounded-sm overflow-hidden"
//               >
//                 <div className="bg-slate-200 px-4 py-1.5 border-b border-slate-400 flex justify-between items-center">
//                   <span className="font-bold text-sm text-slate-800 uppercase">
//                     🏗️ {machine}
//                   </span>
//                 </div>

//                 {/* TABEL BARU: KG & SAK */}
//                 <table className="w-full text-sm text-left border-collapse border border-slate-400">
//                   <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-bold">
//                     <tr>
//                       <th className="px-3 py-2 border border-slate-400 w-[45%]">
//                         PART NAME
//                       </th>
//                       <th className="px-3 py-2 border border-slate-400 w-[15%] text-center">
//                         KG
//                       </th>
//                       <th className="px-3 py-2 border border-slate-400 w-[20%] text-center">
//                         QTY SAK
//                       </th>
//                       <th className="px-3 py-2 border border-slate-400 w-[20%] text-center">
//                         AKSI
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-slate-400">
//                     {groupedUI[machine].map((item, idx) => (
//                       <tr key={idx} className="hover:bg-yellow-50">
//                         <td className="px-3 py-2 border border-slate-400 font-medium text-slate-900">
//                           {item.partName}
//                         </td>
//                         <td className="px-3 py-2 border border-slate-400 text-center font-mono text-slate-600">
//                           {item.inputKg > 0 ? item.inputKg.toFixed(1) : "-"}
//                         </td>
//                         <td className="px-3 py-2 border border-slate-400 text-center bg-slate-50">
//                           <span className="text-base font-bold text-blue-800">
//                             {item.totalQty}
//                           </span>
//                           {/* Detail Asli (Pecahan) */}
//                           <span className="text-xs text-slate-500 ml-1">
//                             (
//                             {item.inputSak % 1 === 0
//                               ? item.inputSak
//                               : item.inputSak.toFixed(1)}
//                             )
//                           </span>
//                         </td>
//                         <td className="px-3 py-2 border border-slate-400 text-center">
//                           <button
//                             onClick={() => handlePrint(item)}
//                             className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1 px-3 rounded shadow-sm"
//                           >
//                             PRINT ({item.jmlLabel})
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* === PRINT TEMPLATE === */}
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

  // === 2. CORE LOGIC (FILL DOWN + SAK & KG CAPTURE) ===
  const processSheet = (rows, sheetName, markers) => {
    let headerRow = -1;
    let colPartName = -1;
    let colPartNo = -1;
    let dateColIndex = -1;
    let offsetSak = -1;
    let offsetKg = -1;

    // A. DETEKSI HEADER
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

    // B. EKSTRAKSI DATA (DENGAN FILL DOWN)
    const results = [];
    let currentPartName = null; // Penampung nama baris induk
    let currentPartNo = "-";

    for (let i = headerRow + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;

      const cellPartName = String(row[colPartName] || "").trim();

      // LOGIKA FILL DOWN:
      // Jika ada nama baru -> Update current
      if (
        cellPartName &&
        !["PART NAME", "TOTAL", "SUB TOTAL"].some((x) =>
          cellPartName.toUpperCase().includes(x)
        )
      ) {
        currentPartName = cellPartName;
        currentPartNo = colPartNo !== -1 ? String(row[colPartNo] || "-") : "-";
      }

      // Jika cell kosong, kita pakai currentPartName yang lama (baris merged/bawahnya)
      if (!currentPartName) continue;

      // Skip baris ACTUAL
      let isActualRow = false;
      for (let c = 0; c < 10; c++) {
        const cellVal = String(row[c]).toUpperCase().trim();
        if (cellVal === "ACTUAL" || cellVal === "ACT") {
          isActualRow = true;
          break;
        }
      }
      if (isActualRow) continue;

      // --- AMBIL DATA ---
      let finalSak = 0;
      let displayKg = 0;

      // Ambil KG
      if (offsetKg !== -1) {
        let val = parseFloat(
          String(row[dateColIndex + offsetKg]).replace(",", ".")
        );
        if (!isNaN(val) && val > 0) displayKg = val;
      }

      // Ambil SAK
      if (offsetSak !== -1) {
        let val = parseFloat(
          String(row[dateColIndex + offsetSak]).replace(",", ".")
        );
        if (!isNaN(val) && val > 0) finalSak = val;
      }

      // Fallback SAK ambil dari KG jika kosong
      if (finalSak === 0 && displayKg > 0) {
        finalSak = displayKg;
      }

      // Simpan jika ada data (menggunakan currentPartName)
      if (finalSak > 0) {
        results.push({
          machine: sheetName.replace(".csv", "").replace(".xlsx", "").trim(),
          partName: currentPartName, // Pakai nama dari memori (fill down)
          partNo: currentPartNo,
          rawSak: finalSak,
          rawKg: displayKg,
        });
      }
    }
    return results;
  };

  // === 3. AGGREGASI (JUMLAHKAN SAK & KG) ===
  const aggregateData = (rawData) => {
    const grouped = {};
    rawData.forEach((item) => {
      // Grouping Key: Mesin + PartName
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
      // INI PROSES PENJUMLAHANNYA
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
      };
    });
  };

  // === 4. PRINT ENGINE ===
  const handlePrint = (item) => {
    const labels = [];
    let remaining = item.totalQty;
    let boxKe = 1;
    const totalBox = item.jmlLabel;

    while (remaining > 0) {
      const isi = Math.min(13, remaining);
      labels.push({
        ...item,
        currentQty: isi,
        boxKe: boxKe,
        totalBox: totalBox,
      });
      remaining -= isi;
      boxKe++;
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
              <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none mx-auto">
                VUTEQ INDONESIA
              </h1>
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

          {/* Loading Bar */}
          {isProcessing && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100 overflow-hidden">
              <div className="h-full bg-blue-500 animate-progress w-full origin-left"></div>
            </div>
          )}
        </div>
      </div>

      {/* === DATA SCROLLABLE SECTION (GRID 2 KOLOM) === */}
      <div className="flex-1 overflow-y-auto p-8 print:hidden">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="font-bold text-2xl text-slate-800">
                Data Material{" "}
                <span className="text-blue-600 text-2xl font-medium pb-1">
                  {new Date(selectedDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Total 
                <span className="font-bold text-blue-600 mx-1">
                {dataMaterial.length}
                </span>
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
            // GRID 2 KOLOM
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
                          <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider w-[40%]">
                            Part Name
                          </th>
                          <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider w-[20%] text-center text-gray-400">
                            Total KG
                          </th>
                          <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider w-[20%] text-center">
                            Qty Sak
                          </th>
                          <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider w-[20%] text-right">
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
                            <td className="px-5 py-3">
                              <div className="font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">
                                {item.partName}
                              </div>
                            </td>
                            <td className="px-5 py-3 text-center">
                              <span className="font-medium text-black bg-gray-50 px-2 py-1 rounded text-xs">
                                {item.inputKg > 0
                                  ? item.inputKg.toLocaleString("id-ID", {
                                      maximumFractionDigits: 1,
                                    })
                                  : "-"}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-center">
                              <div className="inline-flex flex-col items-center">
                                <span className="text-lg font-bold text-slate-800">
                                  {item.totalQty}
                                </span>
                                <span className="text-sm text-black font-medium">
                                  (
                                  {item.inputSak % 1 === 0
                                    ? item.inputSak
                                    : item.inputSak.toFixed(1)}
                                  )
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-right">
                              <button
                                onClick={() => handlePrint(item)}
                                className="bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 text-xs font-bold py-1.5 px-4 rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-2 ml-auto"
                              >
                                <span>🖨️</span> Print
                                <span className="bg-slate-100 group-hover:bg-emerald-100 px-1.5 rounded text-sm min-w-5 text-center">
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
      <div className="hidden print:grid print:grid-cols-2 print:grid-rows-3 print:gap-4 print:w-[210mm] print:h-[297mm] print:p-[10mm] bg-white text-black font-sans leading-none">
        {printData &&
          printData.map((lbl, idx) => (
            <div
              key={idx}
              className="border-[2px] border-black flex flex-col h-full relative p-0 bg-white box-border"
            >
              <div className="h-[42px] border-b-2 border-black relative">
                <span className="absolute top-0 right-2 text-2xl font-black">
                  50T
                </span>
                <div className="text-center font-bold text-base mt-2">
                  REQUEST MATERIAL
                </div>
                <span className="absolute bottom-[1px] right-[2px] text-[8px] font-mono">
                  PD-FR-K046
                </span>
              </div>
              <div className="grid grid-cols-2 border-b border-black text-[10px] h-[38px]">
                <div className="p-1 pl-2 flex flex-col justify-center">
                  <span className="text-[9px]">PROSES:</span>
                  <b className="text-sm">INJECTION</b>
                </div>
                <div className="p-1 border-l border-black flex flex-col justify-center items-center bg-gray-50">
                  <span className="text-[9px]">MESIN:</span>
                  <span className="font-bold text-lg">{lbl.machine}</span>
                </div>
              </div>
              <div className="px-2 py-2 border-b border-black text-[9px] space-y-1">
                <div className="flex">
                  <span className="w-16">Part Name</span>
                  <span className="font-bold uppercase">: {lbl.partName}</span>
                </div>
                <div className="flex">
                  <span className="w-16">Part No</span>
                  <span className="font-bold">: {lbl.partNo}</span>
                </div>
              </div>
              <div className="flex-grow p-1">
                <table className="w-full text-[10px] border-collapse">
                  <thead>
                    <tr className="border-b border-black">
                      <th className="text-center w-[25%] pb-1 font-bold">
                        ITEM
                      </th>
                      <th className="text-center w-[35%] pb-1 font-bold">
                        STD MATERIAL
                      </th>
                      <th className="text-center pb-1 font-bold">
                        ACTUAL MATERIAL
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[10px]">
                    <tr>
                      <td className="py-2">PART NAME</td>
                      <td className="py-2 font-bold pl-2">{lbl.partName}</td>
                      <td className="py-2 border-b border-dotted border-black"></td>
                    </tr>
                    <tr>
                      <td className="py-2">COLOUR</td>
                      <td className="py-2 font-bold pl-2">BLACK</td>
                      <td className="py-2 border-b border-dotted border-black"></td>
                    </tr>
                    <tr>
                      <td className="py-2">QTY SAK</td>
                      <td className="py-2 pl-2">
                        <span className="text-sm font-bold">
                          {lbl.currentQty}
                        </span>{" "}
                        / {lbl.totalQty}
                      </td>
                      <td className="py-2 border-b border-dotted border-black"></td>
                    </tr>
                    <tr>
                      <td className="py-2">BOX KE</td>
                      <td className="py-2 pl-2 font-bold">
                        {lbl.boxKe} / {lbl.totalBox}
                      </td>
                      <td className="py-2 border-b border-dotted border-black"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="text-[9px] p-1 border-t border-black mt-auto">
                <div className="flex justify-between border-b border-black pb-1 mb-1 items-end">
                  <span>Waktu persiapan : 1 / 2 / 3</span>
                  <span>
                    Tgl:{" "}
                    <b className="font-mono">
                      {new Date().toLocaleDateString("id-ID")}
                    </b>
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <span>Waktu pemakaian : 1 / 2 / 3</span>
                  <span>Tgl: ........................</span>
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
      `}</style>
    </div>
  );
}

export default App;