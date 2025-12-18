import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

function App() {
  const [dataMaterial, setDataMaterial] = useState([]);
  const [printData, setPrintData] = useState(null);
  const [printType, setPrintType] = useState(null); // 'REQ' atau 'LABEL'
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );

  const [masterDb, setMasterDb] = useState({});
  const [isLoadingDb, setIsLoadingDb] = useState(false);

  // Refs untuk File Input
  const qrInputRef = useRef(null);
  const partImgInputRef = useRef(null);

  const [inputForm, setInputForm] = useState({
    partName: "",
    partNo: "",
    color: "",
    partNoHgs: "",
    finishGood: "",
    materialName: "",
    partNoMaterial: "",
    materialName2: "",
    partNoMaterial2: "",
    model: "",
    qrImage: "",
    partImage: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingDb(true);
      try {
        const querySnapshot = await getDocs(collection(db, "master_parts"));
        const data = {};
        querySnapshot.forEach((doc) => {
          // Key dokumen adalah Part Name Uppercase
          data[doc.id] = doc.data();
        });
        setMasterDb(data);
      } catch (error) {
        console.error("Error connecting to Firebase:", error);
        alert("Gagal mengambil data database! Cek internet.");
      } finally {
        setIsLoadingDb(false);
      }
    };

    fetchData();
  }, []);

  const [viewMode, setViewMode] = useState("scan");

  // === HELPER: BERSIHKAN KEY (Ganti / jadi _ agar Database terima) ===
  const generateKey = (name) => {
    if (!name) return "";
    // Ganti spasi ganda, huruf besar, dan ganti / jadi _
    return name.replace(/\s+/g, " ").trim().toUpperCase().replace(/\//g, "_");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputForm((prev) => ({ ...prev, [name]: value }));
  };

  // --- HANDLER GAMBAR (UPLOAD & PASTE) ---
  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputForm((prev) => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasteImage = (e, field) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        e.preventDefault();
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          setInputForm((prev) => ({ ...prev, [field]: event.target.result }));
        };
        reader.readAsDataURL(blob);
        return;
      }
    }
  };

  // --- FUNGSI HAPUS GAMBAR ---
  const handleRemoveImage = (e, field, ref) => {
    e.stopPropagation(); // Supaya tidak memicu klik upload
    setInputForm((prev) => ({ ...prev, [field]: "" })); // Hapus data gambar di state
    if (ref.current) ref.current.value = ""; // Reset input file
  };

  // --- SIMPAN KE FIREBASE ---
  // const handleSaveInput = async () => {
  //   if (!inputForm.partName) return alert("Part Name wajib diisi!");

  //   const newKey = inputForm.partName.trim().toUpperCase();

  //   try {
  //     // 1. Jika mode EDIT dan Nama Part diganti, hapus data lama di Firebase
  //     if (editingKey && editingKey !== newKey) {
  //       await deleteDoc(doc(db, "master_parts", editingKey));
  //       // Hapus juga di state lokal
  //       setMasterDb((prev) => {
  //         const temp = { ...prev };
  //         delete temp[editingKey];
  //         return temp;
  //       });
  //     }

  //     // 2. Simpan ke Firebase Firestore
  //     await setDoc(doc(db, "master_parts", newKey), inputForm);

  //     // 3. Update State Lokal (Biar gak perlu refresh page)
  //     setMasterDb((prev) => ({
  //       ...prev,
  //       [newKey]: inputForm,
  //     }));

  //     // 4. Reset Form
  //     setInputForm({
  //       partName: "",
  //       partNo: "",
  //       color: "",
  //       partNoHgs: "",
  //       finishGood: "",
  //       materialName: "",
  //       partNoMaterial: "",
  //       model: "",
  //       qrImage: "",
  //       partImage: "",
  //     });
  //     setEditingKey(null);
  //     alert("Data berhasil disimpan ke Cloud!");
  //   } catch (error) {
  //     console.error("Error saving: ", error);
  //     alert("Gagal menyimpan data.");
  //   }
  // };

  // --- SIMPAN KE FIREBASE (AUTO REPLACE / JADI _) ---
  const handleSaveInput = async () => {
    if (!inputForm.partName) return alert("Part Name wajib diisi!");

    // GENERATE KEY AMAN (CONTOH: "TRIM R/L" JADI "TRIM R_L")
    const newKey = generateKey(inputForm.partName);

    try {
      // 1. Jika mode EDIT dan Nama Part diganti, hapus data lama
      if (editingKey && editingKey !== newKey) {
        await deleteDoc(doc(db, "master_parts", editingKey));
        setMasterDb((prev) => {
          const temp = { ...prev };
          delete temp[editingKey];
          return temp;
        });
      }

      // 2. Simpan ke Firebase (ID pakai _, tapi isi inputForm tetap asli ada /)
      await setDoc(doc(db, "master_parts", newKey), inputForm);

      // 3. Update State Lokal
      setMasterDb((prev) => ({
        ...prev,
        [newKey]: inputForm,
      }));

      // 4. Reset Form
      setInputForm({
        partName: "",
        partNo: "",
        color: "",
        partNoHgs: "",
        finishGood: "",
        materialName: "",
        partNoMaterial: "",
        model: "",
        qrImage: "",
        partImage: "",
      });
      setEditingKey(null);
      alert("Data berhasil disimpan ke Cloud!");
    } catch (error) {
      console.error("Error saving: ", error);
      alert("Gagal menyimpan data.");
    }
  };

  const handleEditDb = (key) => {
    const data = masterDb[key];
    setInputForm(data); // Masukkan data ke form
    setEditingKey(key); // Set mode edit aktif
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll ke atas
  };

  const handleCancelEdit = () => {
    setInputForm({
      partName: "",
      partNo: "",
      color: "",
      partNoHgs: "",
      finishGood: "",
      materialName: "",
      partNoMaterial: "",
      model: "",
      qrImage: "",
      partImage: "",
    });
    setEditingKey(null);
  };

  // --- HAPUS DARI FIREBASE ---
  const handleDeleteDb = async (key) => {
    if (window.confirm("Hapus data ini permanen?")) {
      try {
        // Hapus di Cloud
        await deleteDoc(doc(db, "master_parts", key));

        // Hapus di Lokal
        setMasterDb((prev) => {
          const newDb = { ...prev };
          delete newDb[key];
          return newDb;
        });

        if (editingKey === key) handleCancelEdit();
      } catch (error) {
        console.error("Error deleting: ", error);
        alert("Gagal menghapus data.");
      }
    }
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

  // === 5. PRINT ENGINE 1: REQUEST MATERIAL (COCOK DATA EXCEL & DB) ===
  // const handlePrintRequest = (item) => {
  //   // Cari Data DB menggunakan Key yang sudah dibersihkan (_)
  //   // Contoh: Excel "TRIM R/L" -> Cari ID "TRIM R_L"
  //   const dbKey = generateKey(item.partName);
  //   const extraData = masterDb[dbKey] || {};

  //   const labels = [];
  //   const totalPlan = item.totalQty;
  //   const totalRecycle = item.recycleInput;
  //   const netRequest = Math.max(0, totalPlan - totalRecycle);

  //   let totalBox = Math.ceil(totalPlan / 13);
  //   if (totalBox === 0 && totalPlan > 0) totalBox = 1;

  //   const recyclePerBox = Math.floor(totalRecycle / totalBox);
  //   const recycleRemainder = totalRecycle % totalBox;

  //   let remainingPlan = totalPlan;

  //   for (let i = 0; i < totalBox; i++) {
  //     const currentBoxTotal = Math.min(13, remainingPlan);
  //     let currentRecycle = recyclePerBox + (i < recycleRemainder ? 1 : 0);
  //     if (currentRecycle > currentBoxTotal) currentRecycle = currentBoxTotal;
  //     const currentNet = currentBoxTotal - currentRecycle;

  //     let qtyDisplay = `${currentNet}`;
  //     if (currentRecycle > 0) qtyDisplay = `${currentNet} + ${currentRecycle}`;

  //     let totalDisplay = `${netRequest}`;
  //     if (totalRecycle > 0) totalDisplay = `${netRequest} + ${totalRecycle}`;
  //     else totalDisplay = `${totalPlan}`;

  //     labels.push({
  //       ...item,
  //       // Nama Part dari Excel (Masih asli ada /)
  //       partNameExcel: item.partName,

  //       // Data Tabel dari DB
  //       partNoMain: extraData.partNo || item.partNo,
  //       materialName: extraData.materialName || "-",
  //       partNoMaterial: extraData.partNoMaterial || "-",
  //       color: extraData.color,
  //       model: extraData.model || "-",

  //       qtyDisplay: qtyDisplay,
  //       totalDisplay: totalDisplay,
  //       boxKe: i + 1,
  //       totalBox: totalBox,
  //     });
  //     remainingPlan -= currentBoxTotal;
  //   }
  //   setPrintType("REQ");
  //   setPrintData(labels);
  // };

  // === 5. PRINT ENGINE 1: REQUEST MATERIAL (UPDATE: SUPPORT 2 MATERIAL) ===
  const handlePrintRequest = (item) => {
    const dbKey = generateKey(item.partName);
    const extraData = masterDb[dbKey] || {};

    const labels = [];
    const totalPlan = item.totalQty;
    const totalRecycle = item.recycleInput;
    const netRequest = Math.max(0, totalPlan - totalRecycle);

    let totalBox = Math.ceil(totalPlan / 13);
    if (totalBox === 0 && totalPlan > 0) totalBox = 1;

    const recyclePerBox = Math.floor(totalRecycle / totalBox);
    const recycleRemainder = totalRecycle % totalBox;

    let remainingPlan = totalPlan;

    for (let i = 0; i < totalBox; i++) {
      const currentBoxTotal = Math.min(13, remainingPlan);
      let currentRecycle = recyclePerBox + (i < recycleRemainder ? 1 : 0);
      if (currentRecycle > currentBoxTotal) currentRecycle = currentBoxTotal;
      const currentNet = currentBoxTotal - currentRecycle;

      let qtyDisplay = `${currentNet}`;
      if (currentRecycle > 0) qtyDisplay = `${currentNet} + ${currentRecycle}`;

      let totalDisplay = `${netRequest}`;
      if (totalRecycle > 0) totalDisplay = `${netRequest} + ${totalRecycle}`;
      else totalDisplay = `${totalPlan}`;

      labels.push({
        ...item,
        partNameExcel: item.partName,
        partNoMain: extraData.partNo || item.partNo,

        // MATERIAL 1
        materialName: extraData.materialName || "-",
        partNoMaterial: extraData.partNoMaterial || "-",

        // MATERIAL 2 (Opsional, ambil dari DB)
        materialName2: extraData.materialName2 || "", // Kalo kosong string kosong
        partNoMaterial2: extraData.partNoMaterial2 || "",

        color: extraData.color || "BLACK",
        model: extraData.model || "-",

        qtyDisplay: qtyDisplay,
        totalDisplay: totalDisplay,
        boxKe: i + 1,
        totalBox: totalBox,
      });
      remainingPlan -= currentBoxTotal;
    }
    setPrintType("REQ");
    setPrintData(labels);
  };

  // === 6. PRINT ENGINE 2: LABEL (INPUT DB) ===
  // const handlePrintLabel = (item) => {
  //   const dbKey = item.partName.trim().toUpperCase();
  //   const extraData = masterDb[dbKey];

  //   if (!extraData) {
  //     alert("Data Part ini belum diinput di menu INPUT! Silakan input dulu.");
  //     return;
  //   }

  //   const totalQty = item.totalQty;
  //   const totalBox = Math.ceil(totalQty / 13) || 1;
  //   const labels = [];
  //   let remaining = totalQty;

  //   for (let i = 1; i <= totalBox; i++) {
  //     const currentQty = Math.min(13, remaining);
  //     labels.push({
  //       machine: item.machine,
  //       partName: extraData.partName,
  //       partNo: extraData.partNo,
  //       color: extraData.color,
  //       hgs: extraData.partNoHgs,
  //       fg: extraData.finishGood,
  //       material: extraData.materialName,
  //       model: extraData.model,
  //       qty: currentQty,
  //       boxKe: i,
  //       totalBox: totalBox,
  //     });
  //     remaining -= currentQty;
  //   }

  //   setPrintType("LABEL");
  //   setPrintData(labels);
  // };

  // === 6. PRINT ENGINE 2: LABEL (INPUT DB) ===
  const handlePrintLabel = (item) => {
    // Cari Data DB pakai Key Aman (_)
    const dbKey = generateKey(item.partName);
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
        // Data dari DB (Masih asli ada /)
        partName: extraData.partName,
        partNo: extraData.partNo,
        color: extraData.color,
        hgs: extraData.partNoHgs,
        fg: extraData.finishGood,
        material: extraData.materialName,
        model: extraData.model,
        matNo: extraData.partNoMaterial,
        qr: extraData.qrImage,
        img: extraData.partImage,

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
          {/* === VIEW INPUT DATABASE (UPDATE FITUR PASTE GAMBAR) === */}
          {viewMode === "input" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-lg text-slate-700 mb-4 border-b pb-2">
                Input Master Data Part
              </h3>

              <div className="grid grid-cols-12 gap-4 mb-6">
                {/* KOLOM KIRI (TEKS) */}
                <div className="col-span-8 grid grid-cols-2 gap-4">
                  {/* === DATA UMUM PART === */}
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
                      Part No (Utama)
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
                      Model
                    </label>
                    <input
                      name="model"
                      value={inputForm.model}
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

                  {/* === DATA TAMBAHAN (HGS/FG) === */}
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

                  {/* === DATA MATERIAL 1 (UTAMA) === */}
                  <div className="col-span-2 border-t mt-2 pt-1 text-xs font-black text-slate-700 uppercase tracking-wider">
                    Data Material 1 (Wajib)
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500">
                      Nama Material 1
                    </label>
                    <input
                      name="materialName"
                      value={inputForm.materialName}
                      onChange={handleInputChange}
                      className="w-full border p-2 rounded text-sm border-slate-300"
                      placeholder="Contoh: PP RESIN..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500">
                      Part No Material 1
                    </label>
                    <input
                      name="partNoMaterial"
                      value={inputForm.partNoMaterial}
                      onChange={handleInputChange}
                      className="w-full border p-2 rounded text-sm border-slate-300"
                      placeholder="Contoh: 123-456..."
                    />
                  </div>

                  {/* === DATA MATERIAL 2 (OPSIONAL) === */}
                  <div className="col-span-2 border-t mt-2 pt-1 text-xs font-black text-blue-600 uppercase tracking-wider">
                    Data Material 2 (Opsional - Jika Double Material)
                  </div>
                  <div>
                    <label className="text-xs font-bold text-blue-500">
                      Nama Material 2
                    </label>
                    <input
                      name="materialName2"
                      value={inputForm.materialName2 || ""}
                      onChange={handleInputChange}
                      className="w-full border p-2 rounded text-sm bg-blue-50 border-blue-200"
                      placeholder="Kosongkan jika cuma 1 material"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-blue-500">
                      Part No Material 2
                    </label>
                    <input
                      name="partNoMaterial2"
                      value={inputForm.partNoMaterial2 || ""}
                      onChange={handleInputChange}
                      className="w-full border p-2 rounded text-sm bg-blue-50 border-blue-200"
                      placeholder="-"
                    />
                  </div>
                </div>

                {/* KOLOM KANAN (GAMBAR)*/}
                <div className="col-span-4 space-y-4">
                  {/* INPUT QR */}
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center hover:bg-gray-50 cursor-pointer relative h-32 flex flex-col items-center justify-center overflow-hidden group"
                    onPaste={(e) => handlePasteImage(e, "qrImage")}
                    onClick={() => qrInputRef.current.click()}
                  >
                    {inputForm.qrImage ? (
                      <div className="relative w-full h-full">
                        <img
                          src={inputForm.qrImage}
                          alt="QR"
                          className="h-full w-full object-contain"
                        />
                        <button
                          onClick={(e) =>
                            handleRemoveImage(e, "qrImage", qrInputRef)
                          }
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md hover:bg-red-600 transition-colors"
                          title="Hapus Gambar"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs">
                        <span className="text-2xl block">📷</span>Klik Upload /
                        Ctrl+V (QR)
                      </div>
                    )}
                    <input
                      type="file"
                      ref={qrInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "qrImage")}
                    />
                  </div>

                  {/* INPUT FOTO PART */}
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center hover:bg-gray-50 cursor-pointer relative h-32 flex flex-col items-center justify-center overflow-hidden group"
                    onPaste={(e) => handlePasteImage(e, "partImage")}
                    onClick={() => partImgInputRef.current.click()}
                  >
                    {inputForm.partImage ? (
                      <div className="relative w-full h-full">
                        <img
                          src={inputForm.partImage}
                          alt="Part"
                          className="h-full w-full object-contain"
                        />
                        <button
                          onClick={(e) =>
                            handleRemoveImage(e, "partImage", partImgInputRef)
                          }
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md hover:bg-red-600 transition-colors"
                          title="Hapus Gambar"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs">
                        <span className="text-2xl block">🖼️</span>Klik Upload /
                        Ctrl+V (Part)
                      </div>
                    )}
                    <input
                      type="file"
                      ref={partImgInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "partImage")}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveInput}
                  className={`text-white font-bold py-2 px-6 rounded shadow-sm transition-all ${
                    editingKey
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {editingKey ? "Update" : "Simpan"}
                </button>

                {editingKey && (
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded shadow-sm transition-all"
                  >
                    Batal
                  </button>
                )}
              </div>
              {/* LIST DATA (SCROLLABLE, STICKY HEADER & EMPTY STATE) */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-slate-700">
                    Data Tersimpan ({Object.keys(masterDb).length})
                  </h4>
                  <input
                    type="text"
                    placeholder="🔍 Cari Part Name / Part No..."
                    className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64 focus:outline-none focus:border-blue-500 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="overflow-y-auto h-[450px] border rounded-lg shadow-sm bg-white relative">
                  <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
                    <thead className="bg-gray-100 font-bold text-slate-700 sticky top-0 z-20 shadow-sm">
                      <tr>
                        <th className="p-3 border-b border-gray-200 bg-gray-100 min-w-[150px]">
                          Part Name
                        </th>
                        <th className="p-3 border-b border-gray-200 bg-gray-100">
                          Model
                        </th>
                        <th className="p-3 border-b border-gray-200 bg-gray-100">
                          Part No
                        </th>

                        {/* Header Material 1 (Biru Tipis) */}
                        <th className="p-3 border-b  bg-blue-50 text-blue-800 border-l border-blue-100">
                          Mat. Name 1
                        </th>
                        <th className="p-3 border-b  bg-blue-50 text-blue-800">
                          Mat. No 1
                        </th>

                        {/* Header Material 2 (Kuning Tipis) */}
                        <th className="p-3 border-b  bg-yellow-50 text-yellow-800 border-l border-yellow-100">
                          Mat. Name 2
                        </th>
                        <th className="p-3 border-b border-gray-200 bg-yellow-50 text-yellow-800">
                          Mat. No 2
                        </th>

                        <th className="p-3 border-b border-gray-200 bg-gray-100 border-l">
                          HGS
                        </th>
                        <th className="p-3 border-b border-gray-200 bg-gray-100">
                          FG
                        </th>
                        <th className="p-3 border-b border-gray-200 text-center w-20 bg-gray-100">
                          QR
                        </th>
                        <th className="p-3 border-b border-gray-200 text-center w-20 bg-gray-100">
                          Foto
                        </th>
                        <th className="p-3 border-b border-gray-200 text-center bg-gray-100 sticky right-0 z-30 shadow-l">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(() => {
                        const filteredData = Object.entries(masterDb)
                          .filter(([key, item]) => {
                            if (!searchTerm) return true;
                            const q = searchTerm.toLowerCase();
                            return (
                              item.partName.toLowerCase().includes(q) ||
                              item.partNo.toLowerCase().includes(q) ||
                              (item.materialName &&
                                item.materialName.toLowerCase().includes(q))
                            );
                          })
                          .sort((a, b) =>
                            a[1].partName.localeCompare(b[1].partName)
                          );

                        if (filteredData.length === 0) {
                          return (
                            <tr>
                              <td
                                colSpan="12"
                                className="p-10 text-center text-gray-400 italic bg-gray-50"
                              >
                                Data tidak ditemukan
                              </td>
                            </tr>
                          );
                        }

                        return filteredData.map(([key, item]) => (
                          <tr
                            key={key}
                            className={`hover:bg-gray-50 transition-colors ${
                              editingKey === key
                                ? "bg-blue-100 hover:bg-blue-200"
                                : ""
                            }`}
                          >
                            <td className="p-3 font-bold align-middle text-slate-700">
                              {item.partName}
                            </td>
                            <td className="p-3 align-middle">{item.model}</td>
                            <td className="p-3 align-middle font-mono text-xs">
                              {item.partNo}
                            </td>

                            {/* Kolom Material 1 */}
                            <td className="p-3 align-middle bg-blue-50/30 border-l border-blue-50 font-medium text-blue-900">
                              {item.materialName}
                            </td>
                            <td className="p-3 align-middle bg-blue-50/30 text-xs font-mono text-blue-800">
                              {item.partNoMaterial}
                            </td>

                            {/* Kolom Material 2 (Logika dash jika kosong) */}
                            <td className="p-3 align-middle bg-yellow-50/30 border-l border-yellow-50 font-medium text-yellow-900">
                              {item.materialName2 ? (
                                item.materialName2
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </td>
                            <td className="p-3 align-middle bg-yellow-50/30 text-xs font-mono text-yellow-800">
                              {item.partNoMaterial2 ? (
                                item.partNoMaterial2
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </td>

                            <td className="p-3 align-middle border-l">
                              {item.partNoHgs}
                            </td>
                            <td className="p-3 align-middle">
                              {item.finishGood}
                            </td>

                            <td className="p-3 text-center align-middle">
                              {item.qrImage ? (
                                <div className="flex justify-center group relative">
                                  <img
                                    src={item.qrImage}
                                    alt="QR"
                                    className="h-8 w-8 object-contain border bg-white rounded shadow-sm cursor-pointer"
                                  />
                                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-50 w-32 bg-white border shadow-lg rounded p-1">
                                    <img
                                      src={item.qrImage}
                                      className="w-full h-auto"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-300 text-[10px] italic">
                                  -
                                </span>
                              )}
                            </td>

                            <td className="p-3 text-center align-middle">
                              {item.partImage ? (
                                <div className="flex justify-center group relative">
                                  <img
                                    src={item.partImage}
                                    alt="Part"
                                    className="h-8 w-8 object-contain border bg-white rounded shadow-sm cursor-pointer"
                                  />
                                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-50 w-32 bg-white border shadow-lg rounded p-1">
                                    <img
                                      src={item.partImage}
                                      className="w-full h-auto"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-300 text-[10px] italic">
                                  -
                                </span>
                              )}
                            </td>

                            <td className="p-3 text-center align-middle sticky right-0 bg-white shadow-l z-10">
                              <div className="flex justify-center gap-1">
                                <button
                                  onClick={() => handleEditDb(key)}
                                  className="bg-blue-100 text-blue-600 p-1.5 rounded hover:bg-blue-200 transition-colors"
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteDb(key)}
                                  className="bg-red-100 text-red-600 p-1.5 rounded hover:bg-red-200 transition-colors"
                                  title="Hapus"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ));
                      })()}
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
                    Total
                    <span className="font-bold text-blue-600">
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
                                    {masterDb[generateKey(item.partName)] && (
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
                                        (Raw:
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
        {/* === PRINT 1: REQUEST MATERIAL (UPDATE: DATA DB) === */}
        {printType === "REQ" && (
          <div className="grid grid-cols-3 gap-2 w-full p-2">
            {printData &&
              printData.map((lbl, idx) => (
                <div
                  key={idx}
                  className={`border border-black flex flex-col justify-between relative box-border px-1.5 pt-1.5 pb-3 bg-white break-inside-avoid ${
                    lbl.materialName2 ? "h-[325px]" : "h-[276px]"
                  }`}
                >
                  <div>
                    {/* Header Judul */}
                    <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-1">
                      <div className="w-1/4 text-left font-bold text-sm uppercase leading-none">
                        {lbl.machine} T
                      </div>
                      <div className="w-2/4 text-center font-bold text-base uppercase leading-none transform translate-y-px">
                        REQUEST MATERIAL
                      </div>
                      <div className="w-1/4 text-right text-[10px] font-normal leading-none text-black">
                        PD-FR-K046
                      </div>
                    </div>

                    {/* Sub Header Info */}
                    <div className="px-0.5 text-[9px] space-y-0.5 mb-1">
                      <div className="flex">
                        <div className="w-16 font-bold shrink-0">Part Name</div>
                        <div className="w-2 text-center shrink-0">:</div>
                        <div className="uppercase font-bold leading-tight flex-1">
                          {lbl.partName} {/* DARI EXCEL */}
                        </div>
                      </div>
                      <div className="flex">
                        <div className="w-16 font-bold shrink-0">Part No</div>
                        <div className="w-2 text-center shrink-0">:</div>
                        <div className="font-bold flex-1">
                          {lbl.partNoMain} {/* DARI DB (Main Part No) */}
                        </div>
                      </div>
                      <div className="flex">
                        <div className="w-16 font-bold shrink-0">Model</div>
                        <div className="w-2 text-center shrink-0">:</div>
                        <div className="font-bold flex-1">
                          {lbl.model} {/* DARI DB */}
                        </div>
                      </div>
                    </div>

                    {/* Tabel Utama */}
                    <div className="mt-0.5">
                      <table className="w-full text-[9px] border-collapse border border-black font-sans">
                        <thead>
                          <tr className="border-b border-black bg-gray-200">
                            <th className="border border-black p-1 w-[28%] text-left pl-2 font-bold">
                              ITEM
                            </th>
                            <th className="border border-black p-1 w-[37%] text-left pl-2 font-bold">
                              STANDARD MATERIAL
                            </th>
                            <th className="border border-black p-1 w-[35%] text-left pl-2 font-bold">
                              ACTUAL MATERIAL
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* === LOGIKA TAMPILAN GANDA (MERGE HEADER KIRI) === */}
                          {lbl.materialName2 ? (
                            // === JIKA ADA 2 MATERIAL ===
                            <>
                              {/* --- BLOK 1: MATERIAL NAME --- */}
                              <tr className="border-b border-black">
                                {/* Header Kiri: MATERIAL NAME (Makan 2 Baris) */}
                                <td
                                  className="border-r border-black p-1 pl-2 font-bold align-middle"
                                  rowSpan={2}
                                >
                                  MAT. NAME
                                </td>
                                {/* Data Kanan: Material 1 */}
                                <td className="border-r border-black p-1 pl-2 font-bold uppercase leading-tight">
                                  1. {lbl.materialName}
                                </td>
                                <td className="p-1 pl-2 font-bold"></td>
                              </tr>
                              <tr className="border-b border-black">
                                {/* (Kolom Kiri dilewati karena rowspan) */}
                                {/* Data Kanan: Material 2 */}
                                <td className="border-r border-black p-1 pl-2 font-bold uppercase leading-tight">
                                  2. {lbl.materialName2}
                                </td>
                                <td className="p-1 pl-2 font-bold"></td>
                              </tr>

                              {/* --- BLOK 2: MATERIAL NO --- */}
                              <tr className="border-b border-black">
                                {/* Header Kiri: MATERIAL NO (Makan 2 Baris) */}
                                <td
                                  className="border-r border-black p-1 pl-2 font-bold align-middle"
                                  rowSpan={2}
                                >
                                  MAT. NO
                                </td>
                                {/* Data Kanan: No 1 */}
                                <td className="border-r border-black p-1 pl-2 font-bold leading-tight">
                                  1. {lbl.partNoMaterial}
                                </td>
                                <td className="p-1 pl-2 font-bold"></td>
                              </tr>
                              <tr className="border-b border-black">
                                {/* (Kolom Kiri dilewati karena rowspan) */}
                                {/* Data Kanan: No 2 */}
                                <td className="border-r border-black p-1 pl-2 font-bold leading-tight">
                                  2. {lbl.partNoMaterial2}
                                </td>
                                <td className="p-1 pl-2 font-bold"></td>
                              </tr>
                            </>
                          ) : (
                            // === JIKA CUMA 1 MATERIAL (Standar) ===
                            <>
                              <tr className="border-b border-black">
                                <td className="border-r border-black p-1 pl-2 font-bold">
                                  MAT. NAME
                                </td>
                                <td className="border-r border-black p-1 pl-2 font-bold uppercase leading-none">
                                  {lbl.materialName}
                                </td>
                                <td className="p-1 pl-2 font-bold"></td>
                              </tr>
                              <tr className="border-b border-black">
                                <td className="border-r border-black p-1 pl-2 font-bold">
                                  MAT. NO
                                </td>
                                <td className="border-r border-black p-1 pl-2 font-bold">
                                  {lbl.partNoMaterial}
                                </td>
                                <td className="p-1 pl-2 font-bold"></td>
                              </tr>
                            </>
                          )}

                          {/* === BAGIAN BAWAH (SAMA UNTUK KEDUANYA) === */}
                          <tr className="border-b border-black">
                            <td className="border-r border-black p-1 pl-2 font-bold">
                              COLOUR
                            </td>
                            <td className="border-r border-black p-1 pl-2 font-bold">
                              {lbl.color}
                            </td>
                            <td className="p-1 pl-2 font-bold"></td>
                          </tr>

                          {/* LOT NO MERGED */}
                          <tr className="border-b border-black">
                            <td className="border-r border-black p-1 pl-2 font-bold">
                              LOT NO
                            </td>
                            <td className="p-1 pl-2 font-bold" colSpan={2}>
                              :
                            </td>
                          </tr>

                          <tr className="border-b border-black">
                            <td className="border-r border-black p-1 pl-2 font-bold">
                              QTY MATERIAL
                            </td>
                            <td
                              className="p-1 pl-2 font-bold text-center text-xs"
                              colSpan={2}
                            >
                              {lbl.qtyDisplay} / {lbl.totalDisplay}
                            </td>
                          </tr>
                          <tr className="border-b border-black">
                            <td className="border-r border-black p-1 pl-2 font-bold">
                              QTY BOX KE
                            </td>
                            <td
                              className="p-1 pl-2 font-bold text-center text-xs"
                              colSpan={2}
                            >
                              {lbl.boxKe} / {lbl.totalBox}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="w-full text-[12px] font-bold">
                    <div className="flex justify-between items-end">
                      {/* === WAKTU PERSIAPAN (ANGKA 1 DILINGKARI) === */}
                      <div className="flex items-center gap-1">
                        <span>Waktu Persiapan:</span>
                        <div className="flex items-center gap-1 ml-1">
                          <span className="w-4 h-4 flex items-center justify-center border border-black rounded-full text-[10px] leading-none">
                            1
                          </span>
                          <span>/</span>
                          <span>2</span>
                          <span>/</span>
                          <span>3</span>
                        </div>
                      </div>

                      {/* TANGGAL */}
                      <span className="w-[150px] flex items-center">
                        Tanggal:
                        <span className="font-bold ml-1">
                          {new Date(selectedDate).toLocaleDateString("id-ID")}
                        </span>
                      </span>
                    </div>

                    <div className="border-t-[1.5px] border-dotted border-black w-full my-1"></div>

                    <div className="flex justify-between items-end">
                      {/* WAKTU PEMAKAIAN (BIASA) */}
                      <div className="flex items-center gap-1">
                        <span>Waktu Pemakaian:</span>
                        <span className="ml-1">1 / 2 / 3</span>
                      </div>

                      {/* TANGGAL KOSONG */}
                      <span className="w-[150px] flex items-center">
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
          @page { size: A4 landscape; margin: 5mm; }
          .print\\:grid-cols-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5mm; }
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}

export default App;
