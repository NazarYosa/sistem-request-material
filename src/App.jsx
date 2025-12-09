import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

function App() {
  const [dataMaterial, setDataMaterial] = useState([]);
  const [printData, setPrintData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetDateInfo, setTargetDateInfo] = useState("");

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString("id-ID", { hour12: false });
    setLogs((prev) => [`[${time}] ${msg}`, ...prev]);
  };

  const getTomorrowMarkers = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const day = tomorrow.getDate();
    const dayStr = String(day);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const fullDate = `${year}-${month}-${String(day).padStart(2, "0")}`;

    return { day, dayStr, fullDate };
  };

  // === 1. HANDLE UPLOAD ===
  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files.length) return;

    const markers = getTomorrowMarkers();
    setTargetDateInfo(`Target H+1: Tgl ${markers.day} (${markers.fullDate})`);

    setDataMaterial([]);
    setLogs([]);
    setIsProcessing(true);
    addLog(`📅 Scan H+1 (Tgl ${markers.day}) - Mode Strict Row...`);

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
                addLog(
                  `   ✅ ${sheetName}: Dapat ${result.length} baris valid.`
                );
              }
            }
          });

          if (extractedData.length === 0) {
            addLog(`⚠️ File ${file.name}: Data kosong/tidak ditemukan.`);
          } else {
            // === LOGIKA PENJUMLAHAN (AGGREGATION) TETAP ADA ===
            // Jika ada Part Name sama di baris berbeda, tetap dijumlahkan
            const aggregated = aggregateData(extractedData);
            setDataMaterial((prev) => [...prev, ...aggregated]);
            addLog(
              `🎉 Selesai! Total ${aggregated.length} Part Unik (Siap Print).`
            );
          }
        } catch (error) {
          addLog(`❌ ERROR: ${error.message}`);
        } finally {
          setIsProcessing(false);
        }
      };
    });
  };

  // === 2. CORE LOGIC (REVISI: STRICT ROW) ===
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

      // Cari Tanggal Target
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

          // Cek sub-header (Sak/Kg)
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

    // Fallback Offset
    if (offsetSak === -1 && offsetKg === -1) {
      offsetKg = 2;
      offsetSak = 3;
    }

    // B. EKSTRAKSI DATA (STRICT ONE ROW)
    const results = [];

    // Kita hapus logika "currentPartName" (Fill Down)
    // Sekarang setiap baris dicek mandiri

    for (let i = headerRow + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;

      // 1. AMBIL PART NAME LANGSUNG DARI BARIS INI
      const cellPartName = String(row[colPartName] || "").trim();

      // REVISI USER: "Pengambilan nama tuh yang satu baris aja sama angka"
      // Artinya: Kalau di baris ini Nama KOSONG -> SKIP (Jangan pakai nama atasnya)
      if (
        !cellPartName ||
        ["PART NAME", "TOTAL", "SUB TOTAL"].some((x) =>
          cellPartName.toUpperCase().includes(x)
        )
      ) {
        continue;
      }

      // 2. CEK APAKAH INI BARIS ACTUAL? (Skip Actual)
      let isActualRow = false;
      for (let c = 0; c < 10; c++) {
        const cellVal = String(row[c]).toUpperCase().trim();
        if (cellVal === "ACTUAL" || cellVal === "ACT") {
          isActualRow = true;
          break;
        }
      }
      if (isActualRow) continue;

      // 3. AMBIL DATA SAK
      let finalSak = 0;

      // Prioritas 1: Kolom SAK
      if (offsetSak !== -1) {
        let val = parseFloat(
          String(row[dateColIndex + offsetSak]).replace(",", ".")
        );
        if (!isNaN(val) && val > 0) finalSak = val;
      }
      // Prioritas 2: Kolom KG
      if (finalSak === 0 && offsetKg !== -1) {
        let val = parseFloat(
          String(row[dateColIndex + offsetKg]).replace(",", ".")
        );
        if (!isNaN(val) && val > 0) finalSak = val;
      }

      // 4. SIMPAN DATA
      // Syarat: Ada Nama DAN Ada Angka di baris yang sama
      if (finalSak > 0) {
        const partNo = colPartNo !== -1 ? String(row[colPartNo] || "-") : "-";

        results.push({
          machine: sheetName.replace(".csv", "").replace(".xlsx", "").trim(),
          partName: cellPartName, // Nama dari baris ini juga
          partNo: partNo,
          rawSak: finalSak,
        });
      }
    }

    return results;
  };

  // === 3. AGREGASI DATA (Sum jika ada nama kembar) ===
  const aggregateData = (rawData) => {
    const grouped = {};

    rawData.forEach((item) => {
      // Key: Mesin + PartName
      const key = `${item.machine}__${item.partName}`;

      if (!grouped[key]) {
        grouped[key] = {
          machine: item.machine,
          partName: item.partName,
          partNo: item.partNo,
          totalRawSak: 0,
        };
      }
      grouped[key].totalRawSak += item.rawSak;
    });

    return Object.values(grouped).map((item) => {
      // Pembulatan ke atas (13.1 -> 14)
      const totalQty = Math.ceil(item.totalRawSak);
      // 1 Label = 13 Sak
      const jmlLabel = Math.ceil(totalQty / 13);

      return {
        id: Math.random().toString(36),
        machine: item.machine,
        partName: item.partName,
        partNo: item.partNo,
        inputSak: item.totalRawSak,
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

  // Grouping UI
  const groupedUI = dataMaterial.reduce((acc, item) => {
    if (!acc[item.machine]) acc[item.machine] = [];
    acc[item.machine].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto p-6 print:hidden">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Sistem Cetak Label <span className="text-blue-600">Vuteq</span>
            </h1>
            <p className="text-slate-500 mt-1">
              {targetDateInfo || "Silakan Upload File Production Plan"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <label
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition ${
                  isProcessing
                    ? "bg-gray-100"
                    : "bg-blue-50 hover:bg-blue-100 border-blue-400"
                }`}
              >
                <div className="flex flex-col items-center justify-center">
                  <span className="text-3xl mb-2">
                    {isProcessing ? "⏳" : "📂"}
                  </span>
                  <p className="text-sm font-semibold text-blue-700">
                    Upload Prod Plan
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="hidden"
                />
              </label>
              <div className="mt-4 text-xs text-slate-400 bg-slate-50 p-3 rounded">
                💡 <b>Mode Strict Row:</b>
                <br />
                Hanya membaca data jika baris tersebut memiliki <b>
                  Nama Part
                </b>{" "}
                dan <b>Angka (Sak)</b> sekaligus.
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 overflow-hidden flex flex-col h-[400px]">
              <div className="px-4 py-2 bg-slate-800 border-b border-slate-700">
                <span className="text-xs font-bold text-slate-300">
                  SYSTEM LOG
                </span>
              </div>
              <div className="p-4 overflow-y-auto flex-1 font-mono text-xs space-y-2">
                {logs.map((log, i) => (
                  <div
                    key={i}
                    className="text-slate-300 border-l-2 border-blue-500 pl-2"
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-700">
                Request Material (H+1)
              </h3>
              <button
                onClick={() => setDataMaterial([])}
                className="text-xs text-red-500 font-bold hover:underline"
              >
                RESET DATA
              </button>
            </div>

            {Object.keys(groupedUI).length === 0 && (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                <span className="text-4xl mb-2">📋</span>
                <p>Data kosong. Silakan upload file.</p>
              </div>
            )}

            {Object.keys(groupedUI).map((machine) => (
              <div
                key={machine}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
              >
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between">
                  <span className="font-bold text-sm text-slate-700">
                    🏗️ {machine}
                  </span>
                  <span className="text-xs bg-white border px-2 rounded-full font-mono">
                    {groupedUI[machine].length} Parts
                  </span>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] uppercase text-slate-500 bg-slate-50 border-b">
                    <tr>
                      <th className="px-4 py-2">Part Name / No</th>
                      <th className="px-4 py-2 text-center">Total Sak</th>
                      <th className="px-4 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {groupedUI[machine].map((item, idx) => (
                      <tr key={idx} className="hover:bg-blue-50">
                        <td className="px-4 py-2">
                          <div className="font-bold text-slate-700">
                            {item.partName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {item.partNo}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {item.totalQty}{" "}
                            <span className="text-xs text-slate-400 font-normal">
                              Sak
                            </span>
                          </div>
                          <div className="text-[9px] text-slate-400">
                            (Total Raw: {item.inputSak.toFixed(2)})
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            onClick={() => handlePrint(item)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-1.5 px-3 rounded shadow-sm"
                          >
                            🖨️ Label ({item.jmlLabel})
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRINT TEMPLATE */}
      <div className="hidden print:grid print:grid-cols-2 print:grid-rows-3 print:gap-4 print:w-[210mm] print:h-[297mm] print:p-[10mm] bg-white text-black font-sans leading-none">
        {printData &&
          printData.map((lbl, idx) => (
            <div
              key={idx}
              className="border-2 border-black flex flex-col h-full relative p-0 bg-white box-border"
            >
              <div className="h-[42px] border-b-2 border-black relative">
                <span className="absolute top-0 right-2 text-2xl font-black">
                  50T
                </span>
                <div className="text-center font-bold text-base mt-2">
                  REQUEST MATERIAL
                </div>
                <span className="absolute bottom-px right-0.5 text-[8px] font-mono">
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
              <div className="grow p-1">
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
    </div>
  );
}

export default App;
