import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

function App() {
  const [dataMaterial, setDataMaterial] = useState([]);
  const [printData, setPrintData] = useState(null);
  const [logs, setLogs] = useState([]);

  // Fungsi Log Helper
  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString("id-ID", { hour12: false });
    setLogs((prev) => [`[${time}] ${msg}`, ...prev]);
  };

  // === 1. HANDLE UPLOAD ===
  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files.length) return;

    setDataMaterial([]);
    setLogs([]);
    addLog("🚀 Memulai proses scan file...");

    Array.from(files).forEach((file) => {
      addLog(`📄 Membaca file: ${file.name}`);
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);

      reader.onload = (evt) => {
        try {
          const bstr = evt.target.result;
          const workbook = XLSX.read(bstr, { type: "array" });

          let totalDataFound = 0;

          workbook.SheetNames.forEach((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];
            // defval: "" penting agar array tidak bolong-bolong
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              defval: "",
            });

            const result = processSheet(jsonData, file.name, sheetName);
            totalDataFound += result;
          });

          if (totalDataFound === 0) {
            addLog(
              `⚠️ File ${file.name} selesai diproses tapi TIDAK ADA data yang valid.`
            );
          } else {
            addLog(
              `✅ Selesai! Total ${totalDataFound} item siap diprint dari file ini.`
            );
          }
        } catch (error) {
          addLog(`❌ ERROR FATAL: ${error.message}`);
        }
      };
    });
  };

  // === 2. LOGIKA UTAMA (THE BRAIN) ===
  const processSheet = (rows, filename, sheetName) => {
    let headerRow = -1;
    let colPart = -1;
    let colSak = -1;

    // A. DETEKSI HEADER (Scanning 50 Baris Pertama)
    for (let i = 0; i < Math.min(50, rows.length); i++) {
      // Bersihkan row dari null/undefined
      const rowStr = rows[i]
        .map((c) => String(c).trim().toUpperCase())
        .join(" ");

      if (rowStr.includes("PART NAME")) {
        // Kandidat Header Ditemukan

        // 1. Cari Index Kolom PART NAME
        rows[i].forEach((cell, idx) => {
          if (String(cell).toUpperCase().includes("PART NAME")) colPart = idx;
        });

        // 2. Cari Index Kolom SAK (Cek Baris Ini + 3 Baris Bawahnya)
        // Ini untuk handle Header Bertingkat / Merged Cells
        for (let offset = 0; offset <= 3; offset++) {
          const targetRow = rows[i + offset];
          if (!targetRow) continue;

          targetRow.forEach((cell, idx) => {
            const val = String(cell).toUpperCase().trim();
            // List kata kunci yang mungkin dipakai user
            const keywords = ["SAK", "QTY SAK", "(SAK)", "SAK/BOX", "JML SAK"];

            // Cek match presisi atau contains
            if (
              keywords.includes(val) ||
              (val.includes("SAK") && val.length < 15)
            ) {
              if (colSak === -1) colSak = idx; // Ambil yang pertama ketemu
            }
          });

          if (colSak !== -1) break; // Kalau sudah ketemu, stop cari SAK
        }

        // Kalau Part Name & Sak ketemu, kunci baris ini sebagai Header Utama
        if (colPart !== -1 && colSak !== -1) {
          headerRow = i;
          addLog(
            `🔎 Sheet "${sheetName}": Tabel terdeteksi di Baris ${
              headerRow + 1
            }.`
          );
          addLog(
            `   👉 Kolom Part Name: ${colPart + 1} | Kolom SAK: ${colSak + 1}`
          );
          break;
        }
      }
    }

    if (headerRow === -1 || colSak === -1) {
      addLog(
        `⚠️ Sheet "${sheetName}" di-skip. (Header tidak lengkap/tidak ditemukan)`
      );
      return 0;
    }

    // B. EKSTRAKSI DATA
    const newData = [];

    // Mulai ambil data dari baris setelah Header
    for (let i = headerRow + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;

      const rawPart = row[colPart];
      const rawSak = row[colSak];

      // --- VALIDASI SUPER KETAT ---

      // 1. Cek Part Name
      if (!rawPart) continue;
      const partStr = String(rawPart).trim();
      // Skip jika ini judul header yang berulang atau sampah
      if (["PART NAME", "NO", "ITEM", "#N/A", "#REF!", ""].includes(partStr))
        continue;

      // 2. Cek Nilai SAK
      // Convert ke string dulu, ganti koma jadi titik (jika format indo), lalu float
      let sakStr = String(rawSak).replace(",", ".").trim();
      const sakVal = parseFloat(sakStr);

      // Pastikan angka valid & positif
      if (isNaN(sakVal) || sakVal <= 0) continue;

      // 3. Logic Bisnis
      const totalQty = Math.ceil(sakVal);
      const sumber = (filename + " " + sheetName).toUpperCase();
      const model = sumber.includes("KS") ? "KS" : "M2500";

      newData.push({
        id: Math.random().toString(36),
        partName: partStr,
        inputSak: sakVal,
        totalQty: totalQty,
        model: model,
        jmlLabel: Math.ceil(totalQty / 13),
      });
    }

    if (newData.length > 0) {
      setDataMaterial((prev) => [...prev, ...newData]);
      return newData.length;
    } else {
      addLog(`⚠️ Sheet "${sheetName}": Header ketemu, tapi isinya kosong.`);
      return 0;
    }
  };

  // === 3. PRINT ENGINE ===
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
    if (printData) {
      setTimeout(() => window.print(), 500);
    }
  }, [printData]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* === DASHBOARD === */}
      <div className="max-w-7xl mx-auto p-6 print:hidden">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Sistem Cetak Label <span className="text-blue-600">Vuteq</span>
            </h1>
            <p className="text-slate-500 mt-1">
              Versi Ultimate • Auto-Detect Multi Header
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border text-sm text-slate-500">
            📅{" "}
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Upload & Log */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Box */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-blue-500 border-dashed rounded-xl cursor-pointer bg-blue-50/50 hover:bg-blue-50 transition group">
                <div className="flex flex-col items-center justify-center">
                  <div className="p-3 bg-blue-100 rounded-full mb-3 group-hover:scale-110 transition">
                    <span className="text-2xl">📂</span>
                  </div>
                  <p className="text-sm font-semibold text-blue-700">
                    Upload Excel (.xlsx)
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Log Panel */}
            <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 overflow-hidden flex flex-col h-64">
              <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  System Activity
                </span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              </div>
              <div className="p-4 overflow-y-auto flex-1 font-mono text-xs space-y-2">
                {logs.length === 0 && (
                  <p className="text-slate-500 italic">Menunggu file...</p>
                )}
                {logs.map((log, i) => (
                  <div
                    key={i}
                    className={`border-l-2 pl-2 ${
                      log.includes("ERROR")
                        ? "border-red-500 text-red-400"
                        : log.includes("✅")
                        ? "border-green-500 text-green-400"
                        : "border-blue-500 text-slate-300"
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Data Table */}
          <div className="lg:col-span-2">
            {dataMaterial.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-700">
                    Daftar Material ({dataMaterial.length})
                  </h3>
                  <button
                    onClick={() => setDataMaterial([])}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Reset Data
                  </button>
                </div>
                <div className="overflow-x-auto max-h-[600px]">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-xs sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3">Model</th>
                        <th className="px-6 py-3">Part Name</th>
                        <th className="px-6 py-3">Qty (Sak)</th>
                        <th className="px-6 py-3 text-center">Label</th>
                        <th className="px-6 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dataMaterial.map((item, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-blue-50/30 transition group"
                        >
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                item.model === "KS"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {item.model}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-900">
                            {item.partName}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-700 text-lg">
                                {item.totalQty}
                              </span>
                              <span className="text-xs text-slate-400">
                                Input: {item.inputSak}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-slate-100 text-slate-600 py-1 px-3 rounded text-xs font-bold border border-slate-200">
                              {item.jmlLabel} Lembar
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handlePrint(item)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-5 rounded-lg shadow-sm shadow-emerald-200 transition active:scale-95 flex items-center gap-2 ml-auto"
                            >
                              <span>🖨️</span> Print
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200 p-10">
                <span className="text-5xl mb-4 opacity-30">📋</span>
                <p>Belum ada data material.</p>
                <p className="text-sm mt-2">
                  Silakan upload file Excel di sebelah kiri.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === PRINT TEMPLATE (Hidden on Screen) === */}
      <div className="hidden print:grid print:grid-cols-2 print:grid-rows-3 print:gap-4 print:w-[210mm] print:h-[297mm] print:p-[10mm] print:box-border bg-white text-black font-sans leading-none">
        {printData &&
          printData.map((lbl, idx) => (
            <div
              key={idx}
              className="border-[2px] border-black flex flex-col h-full relative box-border bg-white"
            >
              {/* Header */}
              <div className="h-[42px] border-b-2 border-black relative">
                <span className="absolute top-0 right-2 text-2xl font-black tracking-tighter">
                  50T
                </span>
                <div className="text-center font-bold text-base mt-2">
                  REQUEST MATERIAL
                </div>
                <span className="absolute bottom-[1px] right-[2px] text-[8px] font-mono">
                  PD-FR-K046
                </span>
              </div>

              {/* Info Box */}
              <div className="grid grid-cols-2 border-b border-black text-[10px] h-[38px]">
                <div className="p-1 pl-2 flex flex-col justify-center">
                  <span className="text-[9px]">PROSES:</span>
                  <b className="text-sm">INJECTION</b>
                </div>
                <div className="p-1 border-l border-black flex flex-col justify-center items-center bg-gray-50">
                  <span className="text-[9px]">MODEL:</span>
                  <span className="font-bold text-xl">{lbl.model}</span>
                </div>
              </div>

              {/* Part Static Info */}
              <div className="px-2 py-2 border-b border-black text-[9px] space-y-1">
                <div className="flex">
                  <span className="w-16">Part Name</span>
                  <span className="font-bold">: RETAINER BOOTS CVT LHD</span>
                </div>
                <div className="flex">
                  <span className="w-16">Part No</span>
                  <span className="font-bold">: H716-AH3-A810</span>
                </div>
              </div>

              {/* Main Table */}
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
                    {/* Row 1 */}
                    <tr>
                      <td className="py-2 align-bottom">PART NAME</td>
                      <td className="py-2 align-bottom font-bold pl-2">
                        {lbl.partName}
                      </td>
                      <td className="py-2 align-bottom border-b border-dotted border-black"></td>
                    </tr>
                    {/* Row 2 */}
                    <tr>
                      <td className="py-2 align-bottom">COLOUR</td>
                      <td className="py-2 align-bottom font-bold pl-2">
                        BLACK
                      </td>
                      <td className="py-2 align-bottom border-b border-dotted border-black"></td>
                    </tr>
                    {/* Row 3 - QTY */}
                    <tr>
                      <td className="py-2 align-bottom">QTY MATERIAL</td>
                      <td className="py-2 align-bottom pl-2">
                        <span className="text-sm font-bold">
                          {lbl.currentQty}
                        </span>{" "}
                        / {lbl.totalQty}
                      </td>
                      <td className="py-2 align-bottom border-b border-dotted border-black"></td>
                    </tr>
                    {/* Row 4 - BOX */}
                    <tr>
                      <td className="py-2 align-bottom">QTY BOX KE</td>
                      <td className="py-2 align-bottom pl-2 font-bold">
                        {lbl.boxKe} / {lbl.totalBox}
                      </td>
                      <td className="py-2 align-bottom border-b border-dotted border-black"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="text-[9px] p-1 border-t border-black mt-auto">
                <div className="flex justify-between border-b border-black pb-1 mb-1 items-end">
                  <span>Waktu persiapan : 1 / 2 / 3</span>
                  <span>
                    Tgl:{" "}
                    <b className="font-mono text-[10px]">
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
