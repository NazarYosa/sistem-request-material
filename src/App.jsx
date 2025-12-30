import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { db } from "./firebase";
import jsQR from "jsqr";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

const scanQRCodeFromImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Ambil data pixel untuk dibaca jsQR
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        // Resolve teksnya kalau ketemu, atau null kalau gagal
        resolve(code ? code.data : null);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

const ImageDropZone = ({
  label,
  value,
  onUpload,
  onRemove,
  colorTheme = "gray",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [scannedText, setScannedText] = useState(null);

  // Mapping Warna Tema (Border, Background, Text)
  const themeClasses = {
    gray: {
      border: "border-gray-300",
      active: "border-gray-500 ring-gray-200",
      bg: "bg-gray-50",
      text: "text-gray-500",
      badge: "bg-gray-600",
    },
    orange: {
      border: "border-orange-300",
      active: "border-orange-500 ring-orange-200",
      bg: "bg-orange-50",
      text: "text-orange-600",
      badge: "bg-orange-600",
    },
    yellow: {
      border: "border-yellow-400",
      active: "border-yellow-600 ring-yellow-200",
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      badge: "bg-yellow-600",
    },
    sky: {
      border: "border-sky-300",
      active: "border-sky-500 ring-sky-200",
      bg: "bg-sky-50",
      text: "text-sky-600",
      badge: "bg-sky-600",
    },
  };

  const theme = themeClasses[colorTheme] || themeClasses.gray;

  // --- LOGIC HANDLE FILE ---
  const processFile = async (file) => {
    if (file && file.type.startsWith("image/")) {
      // 1. Scan QR dulu
      const resultText = await scanQRCodeFromImage(file);
      setScannedText(resultText); // Kalau null ya null, kalau teks ya teks

      // 2. Upload Gambar
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Hanya file gambar yang diperbolehkan!");
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let item of items) {
      if (item.type.indexOf("image") !== -1) {
        processFile(item.getAsFile());
        break;
      }
    }
  };

  const handleRemoveWrapper = () => {
    setScannedText(null);
    onRemove();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all h-32 w-full group cursor-pointer outline-none
        ${theme.bg} 
        ${isDragging ? "scale-105 shadow-lg border-solid " + theme.active : ""}
        ${value ? "border-solid border-gray-200" : theme.border}
        focus:ring-2 focus:border-solid ${theme.active} 
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      tabIndex="0"
      onPaste={handlePaste}
      onClick={() =>
        !value && document.getElementById(`file-${label}`)?.click()
      }
      title="Klik untuk upload atau Paste (Ctrl+V) gambar di sini"
    >
      {value ? (
        // TAMPILAN JIKA ADA GAMBAR
        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden rounded-xl bg-white p-1">
          {/* LOGIC CSS: 
             Jika scannedText ADA (QR) -> Tinggi Gambar 70% (Sisanya buat teks)
             Jika scannedText KOSONG (Foto Biasa) -> Tinggi Gambar 100% (Full)
          */}
          <img
            src={value}
            alt="Preview"
            className={`w-full object-contain ${
              scannedText ? "h-[70%]" : "h-full"
            }`}
          />

          {/* HASIL SCAN (Hanya Muncul Jika QR Terdeteksi) */}
          {scannedText && (
            <div className="h-[30%] w-full flex items-center justify-center bg-gray-50 border-t border-gray-100">
              <span
                className="text-xl font-mono font-bold text-emerald-600 truncate px-2"
                title={scannedText}
              >
                {scannedText}
              </span>
            </div>
          )}

          {/* Label Kecil di Pojok */}
          <div
            className={`absolute top-0 left-0 px-2 py-1 text-[9px] font-bold text-white rounded-br-lg opacity-90 shadow-sm ${theme.badge}`}
          >
            {label}
          </div>

          {/* Tombol Hapus */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveWrapper();
            }}
            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md transition-transform hover:scale-110 z-10"
          >
            ✕
          </button>
        </div>
      ) : (
        // TAMPILAN KOSONG (Placeholder)
        <>
          <div
            className={`text-2xl mb-1 ${theme.text} opacity-50 group-hover:scale-110 transition-transform`}
          >
            📷
          </div>
          <span
            className={`text-[10px] font-bold uppercase text-center px-2 ${theme.text}`}
          >
            {label}
          </span>
          <span className="text-[8px] text-gray-400 mt-1">
            Klik / Paste / Drag
          </span>
          <input
            id={`file-${label}`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => processFile(e.target.files[0])}
          />
        </>
      )}
    </div>
  );
};

function App() {
  const [dataMaterial, setDataMaterial] = useState([]);
  const [printData, setPrintData] = useState(null);
  const [printType, setPrintType] = useState(null); // 'REQ' atau 'LABEL'
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const inputFormRef = useRef(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [viewMode, setViewMode] = useState("scan");
  const [dbTableMode, setDbTableMode] = useState("REQ");
  const [orientation, setOrientation] = useState("PORTRAIT");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // "PORTRAIT" atau "LANDSCAPE"

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
    weight: "",
    stdQty: "",
    partNameHgs: "",
    partNoHgs: "",
    finishGood: "",

    // 1. General
    partAssyName: "", // Nama Assy Umum
    partAssyHgs: "", // No HGS Assy
    partAssyFg: "", // No FG Assy

    // 2. Left
    partAssyNameLeft: "", // Nama Assy Kiri
    partAssyHgsLeft: "", // No HGS Assy Kiri
    partAssyFgLeft: "", // No FG Assy Kiri

    // 3. Right
    partAssyNameRight: "", // Nama Assy Kanan
    partAssyHgsRight: "", // No HGS Assy Kanan
    partAssyFgRight: "", // No FG Assy Kanan

    // === DATA LEFT/KIRI (KUNING) ===
    partNoHgsLeft: "",
    partNameHgsLeft: "",
    finishGoodLeft: "",
    finishGoodNameLeft: "",

    // === DATA RIGHT/KANAN (BIRU MUDA) ===
    partNoHgsRight: "",
    partNameHgsRight: "",
    finishGoodRight: "",
    finishGoodNameRight: "",
    // ====================================

    color: "",
    weight: "",
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
        weight: "",
        stdQty: "",
        partNameHgs: "",
        partNoHgs: "",
        finishGood: "",
        // Reset Assy Lengkap
        partAssyName: "",
        partAssyHgs: "",
        partAssyFg: "",
        partAssyNameLeft: "",
        partAssyHgsLeft: "",
        partAssyFgLeft: "",
        partAssyNameRight: "",
        partAssyHgsRight: "",
        partAssyFgRight: "",
        partNoHgsLeft: "",
        partNameHgsLeft: "",
        finishGoodLeft: "",
        finishGoodNameLeft: "",
        partNoHgsRight: "",
        partNameHgsRight: "",
        finishGoodRight: "",
        finishGoodNameRight: "",
        color: "",
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
    // === AUTO SCROLL KE ATAS (FORM) ===
    if (inputFormRef.current) {
      inputFormRef.current.scrollIntoView({
        behavior: "smooth", // Gerakan halus
        block: "center", // Posisikan di tengah/atas layar
      });
    }
  };

  const handleCancelEdit = () => {
    setInputForm({
      partName: "",
      partNo: "",
      weight: "",
      stdQty: "",
      partNameHgs: "", // <--- Reset ini juga
      partNoHgs: "",
      finishGood: "",
      partAssyName: "",
      partAssyHgs: "",
      partAssyFg: "",
      partAssyNameLeft: "",
      partAssyHgsLeft: "",
      partAssyFgLeft: "",
      partAssyNameRight: "",
      partAssyHgsRight: "",
      partAssyFgRight: "",
      partNoHgsLeft: "",
      partNameHgsLeft: "",
      finishGoodLeft: "",
      finishGoodNameLeft: "",
      partNoHgsRight: "",
      partNameHgsRight: "",
      finishGoodRight: "",
      finishGoodNameRight: "",
      color: "",
      materialName: "",
      partNoMaterial: "",
      model: "",
      qrHgs: "",
      imgHgs: "",
      qrAssy: "",
      imgAssy: "",
      qrAssyL: "",
      imgAssyL: "",
      qrAssyR: "",
      imgAssyR: "",
      qrTagL: "",
      imgTagL: "",
      qrTagR: "",
      imgTagR: "",
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

  // === 3. AGGREGASI: (PLAN HITUNGAN + SAK BULAT KE ATAS) ===
  const aggregateData = (rawData) => {
    // A. Grouping Data
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

    // B. Mapping Data
    return Object.values(grouped).map((item) => {
      // 1. Ambil Data DB untuk Berat
      const dbKey = generateKey(item.partName);
      const extraData = masterDb[dbKey] || {};

      let rawWeight = extraData.weight;
      let stringWeight = String(rawWeight).replace(",", ".");
      let partWeight = parseFloat(stringWeight);
      let isValidWeight = !isNaN(partWeight) && partWeight > 0;

      // 2. Hitung Plan (KG / Berat)
      let calculatedPlan = 0;
      if (item.totalRawKg > 0 && isValidWeight) {
        calculatedPlan = Math.ceil(item.totalRawKg / partWeight);
      }

      // 3. Tentukan Total Sak (REQ)
      // Pakai Math.ceil() supaya 20.1 jadi 21
      const totalQty = Math.ceil(item.totalRawSak);

      // 4. Hitung Label (Background)
      const jmlLabel = Math.ceil(totalQty / 11);

      return {
        id: Math.random().toString(36),
        machine: item.machine,
        no: item.no,
        partName: item.partName,
        partNo: extraData.partNo || item.partNo,

        // Data Mentah (Tetap Koma) untuk info Raw
        inputSak: item.totalRawSak,
        inputKg: item.totalRawKg,

        // Data Plan Hasil Hitungan
        inputPlan: calculatedPlan,

        // Data Utama Sak (Sudah Bulat ke Atas)
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

  // === 5. PRINT ENGINE 1: REQUEST MATERIAL (PERBAIKAN BUG 12 PCS) ===
  const handlePrintRequest = (item) => {
    const dbKey = generateKey(item.partName);
    const extraData = masterDb[dbKey] || {};

    const labels = [];
    const totalPlan = item.totalQty;
    const totalRecycle = item.recycleInput;
    const netRequest = Math.max(0, totalPlan - totalRecycle);

    // === PERBAIKAN DISINI MAS ===
    // Dulu 13, ganti jadi 11 biar sinkron sama isi box yang cuma muat 11
    let totalBox = Math.ceil(totalPlan / 11);
    // ===========================

    if (totalBox === 0 && totalPlan > 0) totalBox = 1;

    const recyclePerBox = Math.floor(totalRecycle / totalBox);
    const recycleRemainder = totalRecycle % totalBox;

    let remainingPlan = totalPlan;

    for (let i = 0; i < totalBox; i++) {
      // Disini kan maksimal 11, jadi pembagi diatas wajib 11 juga
      const currentBoxTotal = Math.min(11, remainingPlan);

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

        // MATERIAL 2
        materialName2: extraData.materialName2 || "",
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

  // === 7. PRINT ALL ENGINE: ANTRIAN SAMBUNG (HEMAT KERTAS) ===
  const handlePrintAllRequest = () => {
    if (!window.confirm("Yakin ingin mencetak SEMUA data?")) return;

    let allLabelsAccumulated = [];

    // Loop dataMaterial (pastikan variabel ini sesuai state data Mas)
    dataMaterial.forEach((item) => {
      if (item.totalQty > 0) {
        const dbKey = generateKey(item.partName);
        const extraData = masterDb[dbKey] || {};

        const totalPlan = item.totalQty;
        const totalRecycle = item.recycleInput || 0;
        const netRequest = Math.max(0, totalPlan - totalRecycle);

        if (netRequest === 0 && totalRecycle === 0) return;

        let totalBox = Math.ceil(totalPlan / 11);
        if (totalBox === 0 && totalPlan > 0) totalBox = 1;

        const recyclePerBox = Math.floor(totalRecycle / totalBox);
        const recycleRemainder = totalRecycle % totalBox;
        let remainingPlan = totalPlan;

        for (let i = 0; i < totalBox; i++) {
          const currentBoxTotal = Math.min(11, remainingPlan);
          let currentRecycle = recyclePerBox + (i < recycleRemainder ? 1 : 0);
          if (currentRecycle > currentBoxTotal)
            currentRecycle = currentBoxTotal;
          const currentNet = currentBoxTotal - currentRecycle;

          let qtyDisplay = `${currentNet}`;
          if (currentRecycle > 0)
            qtyDisplay = `${currentNet} + ${currentRecycle}`;

          let totalDisplay = `${netRequest}`;
          if (totalRecycle > 0)
            totalDisplay = `${netRequest} + ${totalRecycle}`;
          else totalDisplay = `${totalPlan}`;

          allLabelsAccumulated.push({
            ...item,
            partNameExcel: item.partName,
            partNoMain: extraData.partNo || item.partNo,
            materialName: extraData.materialName || "-",
            partNoMaterial: extraData.partNoMaterial || "-",
            materialName2: extraData.materialName2 || "",
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
      }
    });

    if (allLabelsAccumulated.length === 0) {
      alert("Tidak ada data yang perlu di-print (Qty 0 semua).");
      return;
    }

    setPrintType("REQ");
    setPrintData(allLabelsAccumulated);
  };

  // === 6. PRINT ENGINE 2: LABEL (SELECTOR LOGIC - UPDATED IMAGE) ===
  const handlePrintLabel = (item, type) => {
    // 1. Cari Data DB
    const dbKey = generateKey(item.partName);
    const extraData = masterDb[dbKey];

    if (!extraData) {
      alert("Data Part ini belum diinput di menu INPUT! Silakan input dulu.");
      return;
    }

    // 2. Tentukan Data Berdasarkan Tipe Pilihan
    // Siapkan variable penampung (Text & Gambar)
    let targetName = "";
    let targetHgs = "";
    let targetFg = "";
    let targetQr = ""; // <--- VARIABLE BARU
    let targetImg = ""; // <--- VARIABLE BARU

    switch (type) {
      case "GEN": // Part Tag (General)
        targetName = extraData.partNameHgs;
        targetHgs = extraData.partNoHgs;
        targetFg = extraData.finishGood;
        // Ambil Gambar General / HGS
        targetQr = extraData.qrHgs;
        targetImg = extraData.imgHgs;
        break;

      case "ASSY_GEN": // Assy General
        targetName = extraData.partAssyName;
        targetHgs = extraData.partAssyHgs;
        targetFg = extraData.partAssyFg;
        // Ambil Gambar Assy Gen
        targetQr = extraData.qrAssy;
        targetImg = extraData.imgAssy;
        break;

      case "ASSY_L": // Assy Left
        targetName = extraData.partAssyNameLeft;
        targetHgs = extraData.partAssyHgsLeft;
        targetFg = extraData.partAssyFgLeft;
        // Ambil Gambar Assy Left
        targetQr = extraData.qrAssyL;
        targetImg = extraData.imgAssyL;
        break;

      case "ASSY_R": // Assy Right
        targetName = extraData.partAssyNameRight;
        targetHgs = extraData.partAssyHgsRight;
        targetFg = extraData.partAssyFgRight;
        // Ambil Gambar Assy Right
        targetQr = extraData.qrAssyR;
        targetImg = extraData.imgAssyR;
        break;

      case "TAG_L": // Tag Left
        targetName = extraData.partNameHgsLeft;
        targetHgs = extraData.partNoHgsLeft;
        targetFg = extraData.finishGoodLeft;
        // Ambil Gambar Tag Left
        targetQr = extraData.qrTagL;
        targetImg = extraData.imgTagL;
        break;

      case "TAG_R": // Tag Right
        targetName = extraData.partNameHgsRight;
        targetHgs = extraData.partNoHgsRight;
        targetFg = extraData.finishGoodRight;
        // Ambil Gambar Tag Right
        targetQr = extraData.qrTagR;
        targetImg = extraData.imgTagR;
        break;

      default:
        return;
    }

    // Validasi Sederhana
    if (!targetName && !targetHgs) {
      if (!window.confirm(`Data teks untuk tipe ${type} kosong. Tetap print?`))
        return;
    }

    // 3. Generate Labels (LOGIC: ALWAYS STD PACK)
    const totalQtyPlan = parseInt(item.inputPlan) || 0;
    const stdPack = parseInt(extraData.stdQty) || 1;
    const totalBox = Math.ceil(totalQtyPlan / stdPack) || 1;

    const labels = [];

    for (let i = 1; i <= totalBox; i++) {
      const currentQty = stdPack;

      labels.push({
        machine: item.machine,

        // Data Dinamis (Text & Gambar Sesuai Pilihan)
        partName: targetName || "-",
        hgs: targetHgs || "-",
        fg: targetFg || "-",
        qr: targetQr, // <--- Pakai QR hasil switch tadi
        img: targetImg, // <--- Pakai Img hasil switch tadi

        // Data Master (Tetap)
        partNo: extraData.partNo,
        model: extraData.model,

        // Data Hitungan
        qty: currentQty,
        boxKe: i,
        totalBox: totalBox,
      });
    }

    // 4. Tutup Dropdown & Set Print
    setActiveDropdown(null);
    setPrintType("LABEL");
    setPrintData(labels);
  };

  // === FUNGSI EXPORT FIREBASE (SIMPLE) ===
  const handleExportFirebase = async () => {
    // 1. Konfirmasi dulu
    setIsProcessing(true); // Munculkan loading biar user tau sistem bekerja

    try {
      // 2. Ambil data dari Firebase
      const querySnapshot = await getDocs(collection(db, "master_parts"));
      const allData = {};

      querySnapshot.forEach((doc) => {
        allData[doc.id] = doc.data();
      });

      // 3. Download jadi file JSON
      const jsonString = JSON.stringify(allData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Nama file ada tanggalnya biar rapi
      link.download = `VUTEQ_DB_BACKUP_${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert(`✅ Berhasil Export ${Object.keys(allData).length} Data!`);
    } catch (error) {
      console.error("Gagal export:", error);
      alert("Gagal koneksi ke Firebase.");
    } finally {
      setIsProcessing(false); // Matikan loading
    }
  };

  useEffect(() => {
    if (printData) setTimeout(() => window.print(), 500);
  }, [printData]);

  const groupedUI = dataMaterial.reduce((acc, item) => {
    if (!acc[item.machine]) acc[item.machine] = [];
    acc[item.machine].push(item);
    return acc;
  }, {});

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-slate-800 font-sans overflow-hidden print:h-auto print:overflow-visible">
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
            {/* Tombol Print All Baru */}
            <button
              onClick={handlePrintAllRequest}
              className="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700 font-bold flex items-center gap-2 transition-transform transform active:scale-95"
            >
              🖨️ PRINT ALL REQ
            </button>
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
          {viewMode === "input" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* HEADER INPUT + TOMBOL EXPORT */}
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="font-bold text-lg text-slate-700">
                  Input Master Data Part
                </h3>

                {/* TOMBOL EXPORT FIREBASE */}
                <button
                  onClick={handleExportFirebase}
                  className="flex items-center gap-2 bg-red-100 text-red-700 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-red-200"
                  title="Download semua data cloud ke komputer"
                >
                  🔥 Export Firebase
                </button>
              </div>

              {/* === FORM INPUT (UPDATED: TEXT FULL WIDTH + DASHBOARD IMAGE) === */}
              <div
                ref={inputFormRef}
                className="bg-gray-50/50 border border-gray-200 rounded-xl p-5 mb-8"
              >
                {/* BAGIAN A: INPUT TEKS (GABUNGAN KODE LAMA) */}
                {/* Note: Saya ubah col-span-9 jadi col-span-12 agar memenuhi lebar container */}
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 grid grid-cols-4 gap-4">
                    {/* BARIS 1: PART UTAMA (DEFAULT) */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                        Part Name (Utama)
                      </label>
                      <input
                        name="partName"
                        value={inputForm.partName}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                        placeholder="Nama Part Raw/Material..."
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                        Part No (Utama)
                      </label>
                      <input
                        name="partNo"
                        value={inputForm.partNo}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                        placeholder="No System/Material..."
                      />
                    </div>

                    {/* PEMISAH HGS GEN */}
                    <div className="col-span-4 border-t border-gray-300 my-1"></div>

                    {/* BARIS 2: PART TAG GENERAL (NETRAL / GRAY) */}
                    {/* 1. Nama HGS General (Lebar) */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                        Part Name HGS (Gen)
                      </label>
                      <input
                        name="partNameHgs"
                        value={inputForm.partNameHgs || ""}
                        onChange={handleInputChange}
                        className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-sm"
                        placeholder="Nama Part Label Umum..."
                      />
                    </div>

                    {/* 2. No HGS General */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                        Part No HGS (Gen)
                      </label>
                      <input
                        name="partNoHgs"
                        value={inputForm.partNoHgs || ""}
                        onChange={handleInputChange}
                        className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-sm"
                        placeholder="No HGS Umum..."
                      />
                    </div>

                    {/* 3. No FG General */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                        Part No FG (Gen)
                      </label>
                      <input
                        name="finishGood"
                        value={inputForm.finishGood || ""}
                        onChange={handleInputChange}
                        className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-sm"
                        placeholder="No FG Umum..."
                      />
                    </div>

                    {/* PEMISAH ASSY */}
                    <div className="col-span-4 border-t border-gray-200 my-1"></div>

                    {/* BARIS 3: ASSY GENERAL (DEFAULT) */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                        Assy Name (Gen)
                      </label>
                      <input
                        name="partAssyName"
                        value={inputForm.partAssyName || ""}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                        placeholder="Nama Assy Umum..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                        Assy HGS (Gen)
                      </label>
                      <input
                        name="partAssyHgs"
                        value={inputForm.partAssyHgs || ""}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                        placeholder="No HGS..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                        Assy FG (Gen)
                      </label>
                      <input
                        name="partAssyFg"
                        value={inputForm.partAssyFg || ""}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                        placeholder="No FG..."
                      />
                    </div>

                    {/* PEMISAH ASSY LEFT */}
                    <div className="col-span-4 border-t border-yellow-200 my-1"></div>

                    {/* BARIS 4: ASSY LEFT (KUNING) */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-yellow-700 uppercase mb-1">
                        Assy Name (Left)
                      </label>
                      <input
                        name="partAssyNameLeft"
                        value={inputForm.partAssyNameLeft || ""}
                        onChange={handleInputChange}
                        className="w-full border border-yellow-400 rounded-lg px-3 py-2 text-sm font-bold text-yellow-900 bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 shadow-sm placeholder:text-yellow-700/50"
                        placeholder="Assy Name (L)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-yellow-700 uppercase mb-1">
                        Assy HGS (Left)
                      </label>
                      <input
                        name="partAssyHgsLeft"
                        value={inputForm.partAssyHgsLeft || ""}
                        onChange={handleInputChange}
                        className="w-full border border-yellow-400 rounded-lg px-3 py-2 text-sm font-bold text-yellow-900 bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 shadow-sm placeholder:text-yellow-700/50"
                        placeholder="HGS No (L)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-yellow-700 uppercase mb-1">
                        Assy FG (Left)
                      </label>
                      <input
                        name="partAssyFgLeft"
                        value={inputForm.partAssyFgLeft || ""}
                        onChange={handleInputChange}
                        className="w-full border border-yellow-400 rounded-lg px-3 py-2 text-sm font-bold text-yellow-900 bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 shadow-sm placeholder:text-yellow-700/50"
                        placeholder="FG No (L)"
                      />
                    </div>

                    {/* BARIS 5: HGS/FG LEFT (KUNING) */}
                    <div>
                      <label className="block text-xs font-bold text-yellow-700 uppercase mb-1">
                        HGS No (Left)
                      </label>
                      <input
                        name="partNoHgsLeft"
                        value={inputForm.partNoHgsLeft || ""}
                        onChange={handleInputChange}
                        className="w-full border border-yellow-400 rounded-lg px-3 py-2 text-sm font-bold text-yellow-900 bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 shadow-sm placeholder:text-yellow-700/50"
                        placeholder="No HGS (L)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-yellow-700 uppercase mb-1">
                        HGS Name (Left)
                      </label>
                      <input
                        name="partNameHgsLeft"
                        value={inputForm.partNameHgsLeft || ""}
                        onChange={handleInputChange}
                        className="w-full border border-yellow-400 rounded-lg px-3 py-2 text-sm font-bold text-yellow-900 bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 shadow-sm placeholder:text-yellow-700/50"
                        placeholder="Nama HGS (L)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-yellow-700 uppercase mb-1">
                        FG No (Left)
                      </label>
                      <input
                        name="finishGoodLeft"
                        value={inputForm.finishGoodLeft || ""}
                        onChange={handleInputChange}
                        className="w-full border border-yellow-400 rounded-lg px-3 py-2 text-sm font-bold text-yellow-900 bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 shadow-sm placeholder:text-yellow-700/50"
                        placeholder="No FG (L)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-yellow-700 uppercase mb-1">
                        FG Name (Left)
                      </label>
                      <input
                        name="finishGoodNameLeft"
                        value={inputForm.finishGoodNameLeft || ""}
                        onChange={handleInputChange}
                        className="w-full border border-yellow-400 rounded-lg px-3 py-2 text-sm font-bold text-yellow-900 bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 shadow-sm placeholder:text-yellow-700/50"
                        placeholder="Nama FG (L)"
                      />
                    </div>

                    {/* PEMISAH ASSY RIGHT */}
                    <div className="col-span-4 border-t border-sky-200 my-1"></div>

                    {/* BARIS 6: ASSY RIGHT (BIRU MUDA/SKY) */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-sky-700 uppercase mb-1">
                        Assy Name (Right)
                      </label>
                      <input
                        name="partAssyNameRight"
                        value={inputForm.partAssyNameRight || ""}
                        onChange={handleInputChange}
                        className="w-full border border-sky-400 rounded-lg px-3 py-2 text-sm font-bold text-sky-900 bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm placeholder:text-sky-700/50"
                        placeholder="Assy Name (R)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-sky-700 uppercase mb-1">
                        Assy HGS (Right)
                      </label>
                      <input
                        name="partAssyHgsRight"
                        value={inputForm.partAssyHgsRight || ""}
                        onChange={handleInputChange}
                        className="w-full border border-sky-400 rounded-lg px-3 py-2 text-sm font-bold text-sky-900 bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm placeholder:text-sky-700/50"
                        placeholder="HGS No (R)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-sky-700 uppercase mb-1">
                        Assy FG (Right)
                      </label>
                      <input
                        name="partAssyFgRight"
                        value={inputForm.partAssyFgRight || ""}
                        onChange={handleInputChange}
                        className="w-full border border-sky-400 rounded-lg px-3 py-2 text-sm font-bold text-sky-900 bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm placeholder:text-sky-700/50"
                        placeholder="FG No (R)"
                      />
                    </div>

                    {/* BARIS 7: HGS/FG RIGHT (BIRU MUDA/SKY) */}
                    <div>
                      <label className="block text-xs font-bold text-sky-700 uppercase mb-1">
                        HGS No (Right)
                      </label>
                      <input
                        name="partNoHgsRight"
                        value={inputForm.partNoHgsRight || ""}
                        onChange={handleInputChange}
                        className="w-full border border-sky-400 rounded-lg px-3 py-2 text-sm font-bold text-sky-900 bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm placeholder:text-sky-700/50"
                        placeholder="No HGS (R)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-sky-700 uppercase mb-1">
                        HGS Name (Right)
                      </label>
                      <input
                        name="partNameHgsRight"
                        value={inputForm.partNameHgsRight || ""}
                        onChange={handleInputChange}
                        className="w-full border border-sky-400 rounded-lg px-3 py-2 text-sm font-bold text-sky-900 bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm placeholder:text-sky-700/50"
                        placeholder="Nama HGS (R)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-sky-700 uppercase mb-1">
                        FG No (Right)
                      </label>
                      <input
                        name="finishGoodRight"
                        value={inputForm.finishGoodRight || ""}
                        onChange={handleInputChange}
                        className="w-full border border-sky-400 rounded-lg px-3 py-2 text-sm font-bold text-sky-900 bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm placeholder:text-sky-700/50"
                        placeholder="No FG (R)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-sky-700 uppercase mb-1">
                        FG Name (Right)
                      </label>
                      <input
                        name="finishGoodNameRight"
                        value={inputForm.finishGoodNameRight || ""}
                        onChange={handleInputChange}
                        className="w-full border border-sky-400 rounded-lg px-3 py-2 text-sm font-bold text-sky-900 bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm placeholder:text-sky-700/50"
                        placeholder="Nama FG (R)"
                      />
                    </div>

                    {/* PEMISAH UMUM */}
                    <div className="col-span-4 border-t border-gray-200 my-1"></div>

                    {/* MATERIAL LAMA TETAP SAMA */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                        Mat. Name 1
                      </label>
                      <input
                        name="materialName"
                        value={inputForm.materialName}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                        Mat. No 1
                      </label>
                      <input
                        name="partNoMaterial"
                        value={inputForm.partNoMaterial}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                        Mat. Name 2
                      </label>
                      <input
                        name="materialName2"
                        value={inputForm.materialName2 || ""}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all placeholder:text-gray-300"
                        placeholder="Opsional"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                        Mat. No 2
                      </label>
                      <input
                        name="partNoMaterial2"
                        value={inputForm.partNoMaterial2 || ""}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all placeholder:text-gray-300"
                        placeholder="Opsional"
                      />
                    </div>

                    {/* BARIS 8: DETAIL LAIN (DEFAULT) */}
                    <div>
                      <label className="block text-xs font-bold text-emerald-700 uppercase mb-1">
                        Berat (Kg)
                      </label>
                      <input
                        name="weight"
                        type="number"
                        step="0.001"
                        value={inputForm.weight}
                        onChange={handleInputChange}
                        className="w-full border border-emerald-400 rounded-lg px-3 py-2 text-sm font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-indigo-700 uppercase mb-1">
                        Qty / Box (Std)
                      </label>
                      <input
                        name="stdQty"
                        type="number"
                        value={inputForm.stdQty || ""}
                        onChange={handleInputChange}
                        className="w-full border border-indigo-400 rounded-lg px-3 py-2 text-sm font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm"
                        placeholder="Cth: 45"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Model
                      </label>
                      <input
                        name="model"
                        value={inputForm.model}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Color
                      </label>
                      <input
                        name="color"
                        value={inputForm.color}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* BAGIAN B: DASHBOARD GAMBAR BARU (Di Bawah Teks) */}
                <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-200">
                  <h3 className="text-sm font-bold text-slate-700 uppercase mb-4 flex items-center gap-2">
                    <span>🖼️</span> Upload Gambar & QR (Drag & Drop / Ctrl+V
                    Supported)
                  </h3>

                  {/* --- ZONA 1: GENERAL (ABU-ABU) --- */}
                  <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 relative">
                    <div className="absolute -top-3 left-4 bg-slate-600 text-white px-3 py-1 text-[10px] font-bold rounded-full uppercase shadow-sm">
                      1. General / HGS
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <ImageDropZone
                        label="QR GENERAL"
                        colorTheme="gray"
                        value={inputForm.qrHgs}
                        onUpload={(v) =>
                          setInputForm((prev) => ({ ...prev, qrHgs: v }))
                        }
                        onRemove={() =>
                          setInputForm((prev) => ({ ...prev, qrHgs: "" }))
                        }
                      />
                      <ImageDropZone
                        label="FOTO PART GENERAL"
                        colorTheme="gray"
                        value={inputForm.imgHgs}
                        onUpload={(v) =>
                          setInputForm((prev) => ({ ...prev, imgHgs: v }))
                        }
                        onRemove={() =>
                          setInputForm((prev) => ({ ...prev, imgHgs: "" }))
                        }
                      />
                    </div>
                  </div>

                  {/* --- ZONA 2: ASSY GROUP (ORANGE) --- */}
                  <div className="mb-6 bg-orange-50 p-4 rounded-2xl border border-orange-200 relative">
                    <div className="absolute -top-3 left-4 bg-orange-600 text-white px-3 py-1 text-[10px] font-bold rounded-full uppercase shadow-sm">
                      2. Assy Group
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                      {/* Assy Gen */}
                      <div className="bg-white p-2 rounded-xl shadow-sm border border-orange-100">
                        <p className="text-[10px] font-bold text-center text-orange-800 mb-2 uppercase">
                          Assy General
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                          <ImageDropZone
                            label="QR ASSY GEN"
                            colorTheme="orange"
                            value={inputForm.qrAssy}
                            onUpload={(v) =>
                              setInputForm((p) => ({ ...p, qrAssy: v }))
                            }
                            onRemove={() =>
                              setInputForm((p) => ({ ...p, qrAssy: "" }))
                            }
                          />
                          <ImageDropZone
                            label="IMG ASSY GEN"
                            colorTheme="orange"
                            value={inputForm.imgAssy}
                            onUpload={(v) =>
                              setInputForm((p) => ({ ...p, imgAssy: v }))
                            }
                            onRemove={() =>
                              setInputForm((p) => ({ ...p, imgAssy: "" }))
                            }
                          />
                        </div>
                      </div>

                      {/* Assy Left */}
                      <div className="bg-white p-2 rounded-xl shadow-sm border border-orange-100">
                        <p className="text-[10px] font-bold text-center text-orange-800 mb-2 uppercase">
                          Assy Left (L)
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                          <ImageDropZone
                            label="QR ASSY L"
                            colorTheme="orange"
                            value={inputForm.qrAssyL}
                            onUpload={(v) =>
                              setInputForm((p) => ({ ...p, qrAssyL: v }))
                            }
                            onRemove={() =>
                              setInputForm((p) => ({ ...p, qrAssyL: "" }))
                            }
                          />
                          <ImageDropZone
                            label="IMG ASSY L"
                            colorTheme="orange"
                            value={inputForm.imgAssyL}
                            onUpload={(v) =>
                              setInputForm((p) => ({ ...p, imgAssyL: v }))
                            }
                            onRemove={() =>
                              setInputForm((p) => ({ ...p, imgAssyL: "" }))
                            }
                          />
                        </div>
                      </div>

                      {/* Assy Right */}
                      <div className="bg-white p-2 rounded-xl shadow-sm border border-orange-100">
                        <p className="text-[10px] font-bold text-center text-orange-800 mb-2 uppercase">
                          Assy Right (R)
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                          <ImageDropZone
                            label="QR ASSY R"
                            colorTheme="orange"
                            value={inputForm.qrAssyR}
                            onUpload={(v) =>
                              setInputForm((p) => ({ ...p, qrAssyR: v }))
                            }
                            onRemove={() =>
                              setInputForm((p) => ({ ...p, qrAssyR: "" }))
                            }
                          />
                          <ImageDropZone
                            label="IMG ASSY R"
                            colorTheme="orange"
                            value={inputForm.imgAssyR}
                            onUpload={(v) =>
                              setInputForm((p) => ({ ...p, imgAssyR: v }))
                            }
                            onRemove={() =>
                              setInputForm((p) => ({ ...p, imgAssyR: "" }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- ZONA 3: TAG GROUP (KUNING & BIRU) --- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                    {/* Tag Left */}
                    <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-200 relative pt-6">
                      <div className="absolute -top-3 left-4 bg-yellow-600 text-white px-3 py-1 text-[10px] font-bold rounded-full uppercase shadow-sm">
                        3. Tag Left (L)
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <ImageDropZone
                          label="QR TAG L"
                          colorTheme="yellow"
                          value={inputForm.qrTagL}
                          onUpload={(v) =>
                            setInputForm((p) => ({ ...p, qrTagL: v }))
                          }
                          onRemove={() =>
                            setInputForm((p) => ({ ...p, qrTagL: "" }))
                          }
                        />
                        <ImageDropZone
                          label="IMG TAG L"
                          colorTheme="yellow"
                          value={inputForm.imgTagL}
                          onUpload={(v) =>
                            setInputForm((p) => ({ ...p, imgTagL: v }))
                          }
                          onRemove={() =>
                            setInputForm((p) => ({ ...p, imgTagL: "" }))
                          }
                        />
                      </div>
                    </div>

                    {/* Tag Right */}
                    <div className="bg-sky-50 p-4 rounded-2xl border border-sky-200 relative pt-6">
                      <div className="absolute -top-3 left-4 bg-sky-600 text-white px-3 py-1 text-[10px] font-bold rounded-full uppercase shadow-sm">
                        4. Tag Right (R)
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <ImageDropZone
                          label="QR TAG R"
                          colorTheme="sky"
                          value={inputForm.qrTagR}
                          onUpload={(v) =>
                            setInputForm((p) => ({ ...p, qrTagR: v }))
                          }
                          onRemove={() =>
                            setInputForm((p) => ({ ...p, qrTagR: "" }))
                          }
                        />
                        <ImageDropZone
                          label="IMG TAG R"
                          colorTheme="sky"
                          value={inputForm.imgTagR}
                          onUpload={(v) =>
                            setInputForm((p) => ({ ...p, imgTagR: v }))
                          }
                          onRemove={() =>
                            setInputForm((p) => ({ ...p, imgTagR: "" }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* TOMBOL ACTION (TIDAK BERUBAH) */}
                <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-gray-200">
                  {editingKey && (
                    <button
                      onClick={handleCancelEdit}
                      className="text-slate-500 hover:text-slate-700 font-bold py-2 px-5 rounded-lg text-sm transition-all hover:bg-slate-100"
                    >
                      Batal
                    </button>
                  )}
                  <button
                    onClick={handleSaveInput}
                    className={`text-white font-bold py-2 px-8 rounded-lg text-sm shadow-md transition-transform transform active:scale-95 ${
                      editingKey
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-slate-800 hover:bg-slate-900"
                    }`}
                  >
                    {editingKey ? "Update Data" : "Simpan Data"}
                  </button>
                </div>
              </div>

              {/* === TOOLBAR (SWITCHER + INFO + SEARCH) - SEJAJAR === */}
              <div className="flex flex-col xl:flex-row items-center justify-between gap-4 mb-5 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                {/* 1. SWITCHER MODE TABEL (KIRI) - BLACK THEME */}
                <div className="flex flex-wrap gap-1 justify-center xl:justify-start">
                  {[
                    { id: "REQ", label: "📄 REQ MAT" },
                    { id: "LABEL_GEN", label: "🏷️ GEN" },
                    { id: "LABEL_ASSY_GEN", label: "📦 ASSY GEN" },
                    { id: "LABEL_ASSY_L", label: "⬅️ ASSY L" },
                    { id: "LABEL_ASSY_R", label: "➡️ ASSY R" },
                    { id: "LABEL_L", label: "🟡 TAG L" },
                    { id: "LABEL_R", label: "🔵 TAG R" },
                  ].map((btn) => {
                    const isActive = dbTableMode === btn.id;

                    return (
                      <button
                        key={btn.id}
                        onClick={() => setDbTableMode(btn.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all shadow-sm uppercase ${
                          isActive
                            ? "bg-black text-white border-black shadow-md scale-105" // Aktif: Hitam
                            : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300" // Tidak Aktif: Putih/Abu
                        }`}
                      >
                        {btn.label}
                      </button>
                    );
                  })}
                </div>

                {/* 2. TOTAL DATA (TENGAH) */}
                <div className="text-center shrink-0">
                  <span className="text-xs font-medium text-slate-500 px-3 py-1 rounded-full bg-slate-50 border border-slate-100">
                    TOTAL:{" "}
                    <strong className="text-slate-800">
                      {Object.keys(masterDb).length}
                    </strong>{" "}
                    ITEM
                  </span>
                </div>

                {/* 3. SEARCH INPUT (KANAN) */}
                <div className="relative w-full max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-sm">🔍</span>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-8 pr-8 py-1.5 border border-gray-300 rounded-lg text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                    placeholder="CARI PART..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-red-500 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Tabel Utama */}
              <div className="overflow-hidden border border-black/10 rounded-xl shadow-sm bg-white">
                {/* === TABEL INPUT MASTER (FULL VERSION WITH PAGINATION) === */}
                <div className="overflow-hidden border border-black/10 rounded-xl shadow-sm bg-white flex flex-col">
                  <div className="overflow-x-auto h-[600px] flex flex-col justify-between">
                    <table className="w-full text-sm text-left border-collapse whitespace-nowrap font-sans mb-0">
                      {/* === 1. HEADER TABEL === */}
                      <thead className="bg-white text-black sticky top-0 z-20 shadow-sm ring-1 ring-black/5">
                        <tr className="uppercase text-xs tracking-wider font-extrabold">
                          {/* KOLOM TETAP */}
                          <th className="px-4 py-4 w-12 text-center bg-gray-50 border-b border-gray-200">
                            No
                          </th>
                          <th className="px-4 py-4 min-w-[220px] bg-gray-50 border-b border-gray-200">
                            Part Name (Key)
                          </th>

                          {/* KOLOM KHUSUS REQ MATERIAL */}
                          {dbTableMode === "REQ" && (
                            <>
                              <th className="px-4 py-4 bg-gray-50 border-b border-gray-200">
                                Part No (Utama)
                              </th>
                              <th className="px-4 py-4 bg-gray-50 border-b border-l border-gray-200">
                                Material 1
                              </th>
                              <th className="px-4 py-4 bg-gray-50 border-b border-gray-200">
                                No. Mat 1
                              </th>
                              <th className="px-4 py-4 bg-gray-50 border-b border-l border-gray-200">
                                Material 2
                              </th>
                              <th className="px-4 py-4 bg-gray-50 border-b border-gray-200">
                                No. Mat 2
                              </th>
                              <th className="px-4 py-4 bg-gray-50 border-b text-center border-l border-gray-200">
                                Berat
                              </th>
                            </>
                          )}

                          {/* KOLOM KHUSUS LABEL GEN */}
                          {dbTableMode === "LABEL_GEN" && (
                            <>
                              <th className="px-4 py-4 bg-gray-50 border-b border-l border-gray-200">
                                Part Name HGS (Gen)
                              </th>
                              <th className="px-4 py-4 bg-gray-50 border-b border-l border-gray-200">
                                Part No HGS (Gen)
                              </th>
                              <th className="px-4 py-4 bg-gray-50 border-b border-l border-gray-200">
                                FG (Gen)
                              </th>
                            </>
                          )}

                          {/* KOLOM KHUSUS LABEL ASSY */}
                          {dbTableMode === "LABEL_ASSY_GEN" && (
                            <>
                              <th className="px-4 py-4 bg-orange-50 text-orange-900 border-b border-l border-orange-200">
                                Assy Name (Gen)
                              </th>
                              <th className="px-4 py-4 bg-orange-50 text-orange-900 border-b border-l border-orange-200">
                                Assy HGS (Gen)
                              </th>
                              <th className="px-4 py-4 bg-orange-50 text-orange-900 border-b border-l border-orange-200">
                                Assy FG (Gen)
                              </th>
                            </>
                          )}
                          {dbTableMode === "LABEL_ASSY_L" && (
                            <>
                              <th className="px-4 py-4 bg-orange-100 text-orange-900 border-b border-l border-orange-300">
                                Assy Name (L)
                              </th>
                              <th className="px-4 py-4 bg-orange-100 text-orange-900 border-b border-l border-orange-300">
                                Assy HGS (L)
                              </th>
                              <th className="px-4 py-4 bg-orange-100 text-orange-900 border-b border-l border-orange-300">
                                Assy FG (L)
                              </th>
                            </>
                          )}
                          {dbTableMode === "LABEL_ASSY_R" && (
                            <>
                              <th className="px-4 py-4 bg-orange-100 text-orange-900 border-b border-l border-orange-300">
                                Assy Name (R)
                              </th>
                              <th className="px-4 py-4 bg-orange-100 text-orange-900 border-b border-l border-orange-300">
                                Assy HGS (R)
                              </th>
                              <th className="px-4 py-4 bg-orange-100 text-orange-900 border-b border-l border-orange-300">
                                Assy FG (R)
                              </th>
                            </>
                          )}

                          {/* KOLOM KHUSUS LABEL TAG */}
                          {dbTableMode === "LABEL_L" && (
                            <>
                              <th className="px-4 py-4 bg-yellow-50 text-yellow-900 border-b border-l border-yellow-200">
                                HGS Name (Left)
                              </th>
                              <th className="px-4 py-4 bg-yellow-50 text-yellow-900 border-b border-l border-yellow-200">
                                HGS No (Left)
                              </th>
                              <th className="px-4 py-4 bg-yellow-50 text-yellow-900 border-b border-l border-yellow-200">
                                FG Name (Left)
                              </th>
                              <th className="px-4 py-4 bg-yellow-50 text-yellow-900 border-b border-l border-yellow-200">
                                FG No (Left)
                              </th>
                            </>
                          )}
                          {dbTableMode === "LABEL_R" && (
                            <>
                              <th className="px-4 py-4 bg-sky-50 text-sky-900 border-b border-l border-sky-200">
                                HGS Name (Right)
                              </th>
                              <th className="px-4 py-4 bg-sky-50 text-sky-900 border-b border-l border-sky-200">
                                HGS No (Right)
                              </th>
                              <th className="px-4 py-4 bg-sky-50 text-sky-900 border-b border-l border-sky-200">
                                FG Name (Right)
                              </th>
                              <th className="px-4 py-4 bg-sky-50 text-sky-900 border-b border-l border-sky-200">
                                FG No (Right)
                              </th>
                            </>
                          )}

                          {/* KOLOM UMUM (NON-REQ) */}
                          {dbTableMode !== "REQ" && (
                            <>
                              <th className="px-4 py-4 bg-indigo-50 text-indigo-900 border-b border-l border-indigo-200 text-center w-24">
                                Qty/Box
                              </th>
                              <th className="px-4 py-4 bg-gray-50 border-b text-center border-l border-gray-200">
                                Berat
                              </th>
                              <th className="px-4 py-4 bg-gray-50 border-b border-gray-200 text-center">
                                QR
                              </th>
                              <th className="px-4 py-4 bg-gray-50 border-b border-gray-200 text-center">
                                Foto
                              </th>
                            </>
                          )}

                          <th className="px-4 py-4 bg-gray-50 border-b border-gray-200 text-center sticky right-0 z-30 shadow-l">
                            Opsi
                          </th>
                        </tr>
                      </thead>

                      {/* === 2. BODY TABEL (LOGIC PAGINATION) === */}
                      <tbody className="divide-y divide-gray-200">
                        {(() => {
                          // A. Filter Search Global (VERSI SAKTI: BISA CARI APA SAJA)
                          const filteredData = Object.entries(masterDb)
                            .filter(([key, item]) => {
                              if (!searchTerm) return true; // Kalau search kosong, tampilkan semua
                              const q = searchTerm.toLowerCase();

                              // === LOGIC BARU ===
                              // Kita ambil SEMUA nilai yang ada di baris data itu (Nama, No, Berat, Model, Warna, dll)
                              // Kita gabung jadi satu kalimat panjang, lalu kita cari kata kuncinya disitu.
                              const allDataString = Object.values(item)
                                .map((val) => String(val || "").toLowerCase()) // Ubah semua jadi huruf kecil
                                .join(" "); // Gabung jadi satu spasi panjang

                              // Cek apakah kata kunci ada di dalam kalimat panjang itu?
                              return allDataString.includes(q);
                            })
                            .sort((a, b) =>
                              a[1].partName.localeCompare(b[1].partName)
                            );

                          // B. Logic Pagination
                          const indexOfLastItem = currentPage * itemsPerPage;
                          const indexOfFirstItem =
                            indexOfLastItem - itemsPerPage;
                          const currentItems = filteredData.slice(
                            indexOfFirstItem,
                            indexOfLastItem
                          );
                          const totalPages = Math.ceil(
                            filteredData.length / itemsPerPage
                          );

                          // C. Render Data Kosong
                          if (filteredData.length === 0) {
                            return (
                              <tr>
                                <td
                                  colSpan="100%"
                                  className="p-12 text-center text-black italic"
                                >
                                  <div className="mb-2 text-2xl">📂</div>
                                  {searchTerm
                                    ? "Tidak ada data yang cocok."
                                    : "Belum ada data part yang tersimpan."}
                                </td>
                              </tr>
                            );
                          }

                          // D. Render Items Per Halaman
                          return (
                            <>
                              {currentItems.map(([key, item], index) => {
                                // Hitung Nomor Urut Asli (Lanjut terus walau beda page)
                                const realIndex = indexOfFirstItem + index + 1;
                                const isOddRow = index % 2 !== 0;
                                const rowClass = isOddRow
                                  ? "bg-gray-100"
                                  : "bg-white";

                                // Logic Gambar Dinamis
                                let displayQr = "";
                                let displayImg = "";
                                switch (dbTableMode) {
                                  case "LABEL_GEN":
                                    displayQr = item.qrHgs;
                                    displayImg = item.imgHgs;
                                    break;
                                  case "LABEL_ASSY_GEN":
                                    displayQr = item.qrAssy;
                                    displayImg = item.imgAssy;
                                    break;
                                  case "LABEL_ASSY_L":
                                    displayQr = item.qrAssyL;
                                    displayImg = item.imgAssyL;
                                    break;
                                  case "LABEL_ASSY_R":
                                    displayQr = item.qrAssyR;
                                    displayImg = item.imgAssyR;
                                    break;
                                  case "LABEL_L":
                                    displayQr = item.qrTagL;
                                    displayImg = item.imgTagL;
                                    break;
                                  case "LABEL_R":
                                    displayQr = item.qrTagR;
                                    displayImg = item.imgTagR;
                                    break;
                                  default:
                                    displayQr = item.qrHgs;
                                    displayImg = item.imgHgs;
                                    break;
                                }

                                return (
                                  <tr
                                    key={key}
                                    className={`${rowClass} hover:bg-blue-100 transition-colors group`}
                                  >
                                    {/* 1. NO */}
                                    <td className="px-4 py-4 text-center text-black font-bold text-xs">
                                      {realIndex}
                                    </td>

                                    {/* 2. PART NAME UTAMA */}
                                    <td className="px-4 py-4 font-bold text-black">
                                      {item.partName}
                                    </td>

                                    {/* 3. ISI SESUAI MODE REQ */}
                                    {dbTableMode === "REQ" && (
                                      <>
                                        <td className="px-4 py-4 font-medium text-black">
                                          {item.partNo}
                                        </td>
                                        <td className="px-4 py-4 text-black border-l border-gray-200">
                                          {item.materialName || "-"}
                                        </td>
                                        <td className="px-4 py-4 text-black text-xs font-medium">
                                          {item.partNoMaterial || "-"}
                                        </td>
                                        <td className="px-4 py-4 text-black border-l border-gray-200">
                                          {item.materialName2 || "-"}
                                        </td>
                                        <td className="px-4 py-4 text-black text-xs font-medium">
                                          {item.partNoMaterial2 || "-"}
                                        </td>
                                        <td className="px-4 py-4 text-center font-bold text-black border-l border-gray-200">
                                          {item.weight || "-"}
                                        </td>
                                      </>
                                    )}

                                    {/* 4. ISI SESUAI MODE LABEL */}
                                    {dbTableMode === "LABEL_GEN" && (
                                      <>
                                        <td className="px-4 py-4 text-black border-l border-gray-200 font-bold">
                                          {item.partNameHgs || "-"}
                                        </td>
                                        <td className="px-4 py-4 text-black border-l border-gray-200">
                                          {item.partNoHgs || "-"}
                                        </td>
                                        <td className="px-4 py-4 text-black border-l border-gray-200">
                                          {item.finishGood || "-"}
                                        </td>
                                      </>
                                    )}
                                    {dbTableMode === "LABEL_ASSY_GEN" && (
                                      <>
                                        <td className="px-4 py-4 text-orange-700 font-bold border-l border-orange-100 bg-orange-50/30">
                                          {item.partAssyName || "-"}
                                        </td>
                                        <td className="px-4 py-4 text-orange-700 font-bold border-l border-orange-100 bg-orange-50/30">
                                          {item.partAssyHgs || "-"}
                                        </td>
                                        <td className="px-4 py-4 text-orange-700 font-bold border-l border-orange-100 bg-orange-50/30">
                                          {item.partAssyFg || "-"}
                                        </td>
                                      </>
                                    )}
                                    {dbTableMode === "LABEL_ASSY_L" && (
                                      <>
                                        <td className="px-4 py-4 text-orange-900 font-bold border-l border-orange-200 bg-orange-100/50">
                                          {item.partAssyNameLeft || "-"}
                                        </td>
                                        <td className="px-4 py-4 text-orange-900 font-bold border-l border-orange-200 bg-orange-100/50">
                                          {item.partAssyHgsLeft || "-"}
                                        </td>
                                        <td className="px-4 py-4 text-orange-900 font-bold border-l border-orange-200 bg-orange-100/50">
                                          {item.partAssyFgLeft || "-"}
                                        </td>
                                      </>
                                    )}
                                    {dbTableMode === "LABEL_ASSY_R" && (
                                      <>
                                        <td className="px-4 py-4 text-orange-900 font-bold border-l border-orange-200 bg-orange-100/50">
                                          {item.partAssyNameRight || "-"}
                                        </td>
                                        <td className="px-4 py-4 text-orange-900 font-bold border-l border-orange-200 bg-orange-100/50">
                                          {item.partAssyHgsRight || "-"}
                                        </td>
                                        <td className="px-4 py-4 text-orange-900 font-bold border-l border-orange-200 bg-orange-100/50">
                                          {item.partAssyFgRight || "-"}
                                        </td>
                                      </>
                                    )}
                                    {dbTableMode === "LABEL_L" && (
                                      <>
                                        <td className="px-4 py-4 text-yellow-800 font-bold border-l border-yellow-100 bg-yellow-50/30">
                                          {item.partNameHgsLeft || "-"}
                                        </td>
                                        <td className="px-4 py-4 text-yellow-800 font-bold border-l border-yellow-100 bg-yellow-50/30">
                                          {item.partNoHgsLeft || "-"}
                                        </td>
                                        <td className="px-4 py-4 text-black border-l border-yellow-100">
                                          {item.finishGoodNameLeft || "-"}
                                        </td>
                                        <td className="px-4 py-4 text-black border-l border-yellow-100">
                                          {item.finishGoodLeft || "-"}
                                        </td>
                                      </>
                                    )}
                                    {dbTableMode === "LABEL_R" && (
                                      <>
                                        <td className="px-4 py-4 text-sky-800 font-bold border-l border-sky-100 bg-sky-50/30">
                                          {item.partNameHgsRight || "-"}
                                        </td>
                                        <td className="px-4 py-4 text-sky-800 font-bold border-l border-sky-100 bg-sky-50/30">
                                          {item.partNoHgsRight || "-"}
                                        </td>
                                        <td className="px-4 py-4 text-black border-l border-sky-100">
                                          {item.finishGoodNameRight || "-"}
                                        </td>
                                        <td className="px-4 py-4 text-black border-l border-sky-100">
                                          {item.finishGoodRight || "-"}
                                        </td>
                                      </>
                                    )}

                                    {/* 5. GAMBAR PREVIEW (NON REQ) */}
                                    {dbTableMode !== "REQ" && (
                                      <>
                                        <td className="px-4 py-4 text-center font-black text-indigo-700 border-l border-indigo-100 bg-indigo-50/30 text-lg">
                                          {item.stdQty || "-"}
                                        </td>
                                        <td className="px-4 py-4 text-center font-bold text-black border-l border-gray-200">
                                          {item.weight || "-"}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                          <div className="flex justify-center">
                                            {displayQr ? (
                                              <img
                                                src={displayQr}
                                                alt="QR"
                                                className="h-10 w-10 object-contain border border-gray-300 rounded bg-white p-0.5 hover:scale-150 transition-transform shadow-sm"
                                              />
                                            ) : (
                                              <span className="text-gray-300 text-xs">
                                                -
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                          <div className="flex justify-center">
                                            {displayImg ? (
                                              <img
                                                src={displayImg}
                                                alt="Part"
                                                className="h-10 w-10 object-contain border border-gray-300 rounded bg-white p-0.5 hover:scale-150 transition-transform shadow-sm"
                                              />
                                            ) : (
                                              <span className="text-gray-300 text-xs">
                                                -
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                      </>
                                    )}

                                    {/* 6. TOMBOL AKSI */}
                                    <td
                                      className={`px-4 py-4 text-center sticky right-0 z-10 shadow-l ${rowClass} group-hover:bg-blue-100`}
                                    >
                                      <div className="flex justify-center gap-2">
                                        <button
                                          onClick={() => handleEditDb(key)}
                                          className="text-blue-600 hover:text-blue-800 transition-colors p-1 font-bold"
                                          title="Edit Data"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => handleDeleteDb(key)}
                                          className="text-red-600 hover:text-red-800 transition-colors p-1 font-bold"
                                          title="Hapus Data"
                                        >
                                          Hapus
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}

                              {/* === 3. PAGINATION CONTROLS (DI DALAM TABEL BAGIAN BAWAH) === */}
                              <tr className="bg-white sticky bottom-0 z-30 shadow-inner border-t-2 border-gray-100">
                                <td
                                  colSpan="100%"
                                  className="px-4 py-3 bg-gray-50/90 backdrop-blur-sm"
                                >
                                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    {/* Info Halaman */}
                                    <div className="text-xs text-gray-500 font-medium">
                                      Menampilkan{" "}
                                      <strong>{indexOfFirstItem + 1}</strong> -{" "}
                                      <strong>
                                        {Math.min(
                                          indexOfLastItem,
                                          filteredData.length
                                        )}
                                      </strong>{" "}
                                      dari{" "}
                                      <strong>{filteredData.length}</strong>{" "}
                                      data
                                    </div>

                                    {/* Tombol Kontrol */}
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center bg-white border border-gray-300 rounded-md overflow-hidden shadow-sm">
                                        <button
                                          onClick={() =>
                                            setCurrentPage((prev) =>
                                              Math.max(prev - 1, 1)
                                            )
                                          }
                                          disabled={currentPage === 1}
                                          className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed border-r border-gray-200 transition-colors"
                                        >
                                          ◀ Prev
                                        </button>
                                        <span className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50">
                                          {currentPage} / {totalPages}
                                        </span>
                                        <button
                                          onClick={() =>
                                            setCurrentPage((prev) =>
                                              Math.min(prev + 1, totalPages)
                                            )
                                          }
                                          disabled={currentPage === totalPages}
                                          className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed border-l border-gray-200 transition-colors"
                                        >
                                          Next ▶
                                        </button>
                                      </div>

                                      {/* Dropdown Jumlah Per Halaman */}
                                      <select
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                          setItemsPerPage(
                                            Number(e.target.value)
                                          );
                                          setCurrentPage(1); // Reset ke hal 1
                                        }}
                                        className="text-xs font-bold border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
                                      >
                                        <option value="5">5 baris</option>
                                        <option value="10">10 baris</option>
                                        <option value="20">20 baris</option>
                                        <option value="50">50 baris</option>
                                        <option value="100">100 baris</option>
                                      </select>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
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
                              <th className="px-2 py-3 font-semibold text-xs uppercase tracking-wider w-[10%] text-center text-blue-600">
                                Plan
                              </th>
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

                                  <td className="px-2 py-3 text-center">
                                    <span className="font-bold px-2 py-1 rounded text-xs border ">
                                      {/* Tampilkan Plan Hasil Hitung */}
                                      {item.inputPlan > 0
                                        ? item.inputPlan
                                        : "-"}
                                    </span>
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
                                      {/* === DROPDOWN PRINT LABEL (FIX Z-INDEX) === */}
                                      <div className="relative inline-block text-left">
                                        {/* === TOMBOL PEMBUKA MENU PRINT === */}
                                        <div className="flex justify-center">
                                          <button
                                            onClick={() =>
                                              setActiveDropdown(item.id)
                                            } // Simpan ID item yang diklik
                                            className="bg-blue-50 border border-blue-200 hover:bg-blue-600 hover:text-white text-blue-700 text-[10px] font-bold py-1.5 px-3 rounded shadow-sm flex items-center gap-1 transition-all"
                                          >
                                            🏷️ LABEL
                                          </button>
                                        </div>
                                      </div>
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
        {/* === PRINT 1: REQUEST MATERIAL (FINAL FIX: FLEX WRAP + PAGE BREAK) === */}
        {printType === "REQ" && (
          <div className="w-full flex flex-wrap content-start">
            {printData &&
              printData.map((lbl, idx) => (
                <div
                  key={idx}
                  // STYLE KHUSUS PRINT:
                  // 1. width: "33%" -> Agar pas 3 kolom.
                  // 2. breakInside: "avoid" -> JANGAN POTONG box ini.
                  // 3. pageBreakInside: "avoid" -> Support browser lama.
                  // 4. display: "flex" -> Biar isinya rapi.
                  style={{
                    width: "33%",
                    padding: "4px",
                    boxSizing: "border-box",
                    breakInside: "avoid",
                    pageBreakInside: "avoid",
                    pageBreakBefore: "auto",
                    pageBreakAfter: "auto",
                  }}
                >
                  <div
                    className={`border border-black flex flex-col justify-between relative box-border px-1.5 pt-1.5 pb-3 bg-white w-full ${
                      lbl.materialName2 ? "h-[325px]" : "h-[279px]"
                    }`}
                  >
                    {/* --- ISI KARTU --- */}
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
                          <div className="w-16 font-bold shrink-0">
                            Part Name
                          </div>
                          <div className="w-2 text-center shrink-0">:</div>
                          <div className="uppercase font-bold leading-tight flex-1">
                            {lbl.partNameExcel}
                          </div>
                        </div>
                        <div className="flex">
                          <div className="w-16 font-bold shrink-0">Part No</div>
                          <div className="w-2 text-center shrink-0">:</div>
                          <div className="font-bold flex-1">
                            {lbl.partNoMain}
                          </div>
                        </div>
                        <div className="flex">
                          <div className="w-16 font-bold shrink-0">Model</div>
                          <div className="w-2 text-center shrink-0">:</div>
                          <div className="font-bold flex-1">{lbl.model}</div>
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
                            {/* Logic Material 1 vs 2 */}
                            {lbl.materialName2 ? (
                              <>
                                <tr className="border-b border-black">
                                  <td
                                    className="border-r border-black p-1 pl-2 font-bold align-middle"
                                    rowSpan={2}
                                  >
                                    MAT. NAME
                                  </td>
                                  <td className="border-r border-black p-1 pl-2 font-bold uppercase leading-tight">
                                    1. {lbl.materialName}
                                  </td>
                                  <td className="p-1 pl-2 font-bold"></td>
                                </tr>
                                <tr className="border-b border-black">
                                  <td className="border-r border-black p-1 pl-2 font-bold uppercase leading-tight">
                                    2. {lbl.materialName2}
                                  </td>
                                  <td className="p-1 pl-2 font-bold"></td>
                                </tr>
                                <tr className="border-b border-black">
                                  <td
                                    className="border-r border-black p-1 pl-2 font-bold align-middle"
                                    rowSpan={2}
                                  >
                                    MAT. NO
                                  </td>
                                  <td className="border-r border-black p-1 pl-2 font-bold leading-tight">
                                    1. {lbl.partNoMaterial}
                                  </td>
                                  <td className="p-1 pl-2 font-bold"></td>
                                </tr>
                                <tr className="border-b border-black">
                                  <td className="border-r border-black p-1 pl-2 font-bold leading-tight">
                                    2. {lbl.partNoMaterial2}
                                  </td>
                                  <td className="p-1 pl-2 font-bold"></td>
                                </tr>
                              </>
                            ) : (
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

                            <tr className="border-b border-black">
                              <td className="border-r border-black p-1 pl-2 font-bold">
                                COLOUR
                              </td>
                              <td className="border-r border-black p-1 pl-2 font-bold">
                                {lbl.color}
                              </td>
                              <td className="p-1 pl-2 font-bold"></td>
                            </tr>
                            <tr className="border-b border-black">
                              <td className="border-r border-black p-1 pl-2 font-bold">
                                LOT NO
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
                        <span className="w-[150px] flex items-center">
                          Tanggal:
                          <span className="font-bold ml-1">
                            {new Date(selectedDate).toLocaleDateString("id-ID")}
                          </span>
                        </span>
                      </div>
                      <div className="border-t-[1.5px] border-dotted border-black w-full my-1"></div>
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-1">
                          <span>Waktu Pemakaian:</span>
                          <span className="ml-1">1 / 2 / 3</span>
                        </div>
                        <span className="w-[150px] flex items-center">
                          Tanggal:
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* === PRINT 2: LABEL 2x5 (PORTRAIT - CENTERED LABELS & FIXED HGS) === */}
        {printType === "LABEL" && (
          <div className="w-full h-full bg-white text-black font-sans leading-none">
            <div
              // LOGIC GRID: Kalau Portrait 2 Kolom, Kalau Landscape 3 Kolom
              className={`grid content-start ${
                orientation === "PORTRAIT" ? "grid-cols-2" : "grid-cols-3"
              }`}
              style={{
                // LOGIC UKURAN KERTAS (Kira-kira A4 margin aman)
                width: orientation === "PORTRAIT" ? "210mm" : "297mm",
                minHeight: orientation === "PORTRAIT" ? "297mm" : "210mm",
                padding: "5mm",
                gap: "3mm",
              }}
            >
              {printData.map((lbl, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-5 grid-rows-[1.4fr_1fr_1fr_1fr_1fr_1fr_1fr] border border-black box-border page-break-inside-avoid"
                  // LOGIC TINGGI KOTAK:
                  // Portrait: 54mm (muat 5 baris)
                  // Landscape: 65mm (muat 3 baris lebih lega)
                  style={{
                    width: "100%",
                    height: orientation === "PORTRAIT" ? "54mm" : "65mm",
                  }}
                >
                  {/* ================= BARIS 1 (Header - SUPER LEGA) ================= */}

                  {/* LOGO VUTEQ */}
                  <div className="col-start-1 row-start-1 border-r border-b border-black flex items-center justify-center p-0.5 overflow-hidden">
                    <img
                      src="/vuteq-logo.png"
                      alt="VuteQ Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* PART TAG */}
                  <div className="col-start-2 row-start-1 border-r border-b border-black flex items-center justify-center p-0.5">
                    {/* Saya besarkan font-nya dikit jadi text-[9px] biar imbang sama kotak yg gede */}
                    <span className="font-bold text-[9px] text-black px-1 py-0.5 text-center leading-tight">
                      PART TAG
                    </span>
                  </div>

                  {/* MODEL */}
                  <div className="col-start-3 col-span-2 row-start-1 border-r border-b border-black flex flex-col items-center justify-center p-0.5">
                    <span className="text-[7px] font-bold">MODEL</span>
                    {/* Font Model dibesarkan jadi text-base (16px) biar makin jelas */}
                    <span className="font-black text-base uppercase">
                      {lbl.model}
                    </span>
                  </div>

                  {/* QR / BOX (YANG JADI UTAMA) */}
                  <div className="col-start-5 row-start-1 border-b border-black flex items-center justify-center p-0 overflow-hidden bg-white">
                    {lbl.qr ? (
                      <img
                        src={lbl.qr}
                        alt="QR"
                        className="object-contain"
                        // Wajib 95% - 100% biar dia menuhin ruangan barunya yg lega
                        style={{
                          width: "95%",
                          height: "95%",
                        }}
                      />
                    ) : (
                      <span className="text-[10px]">-</span>
                    )}
                  </div>

                  {/* ================= BARIS 2-4 (Body Tengah) ================= */}

                  {/* FOTO PART */}
                  <div className="col-start-1 col-span-2 row-start-2 row-span-3 border-r border-b border-black p-1 flex items-center justify-center overflow-hidden relative">
                    {lbl.img ? (
                      <img
                        src={lbl.img}
                        alt="Part"
                        // Ganti Style jadi responsif
                        className="object-contain"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          width: "auto", // Lebar ngikutin rasio gambar
                          height: "110px", // Tinggi kita batasi (lebih kecil dari 153px tadi)
                        }}
                      />
                    ) : (
                      <span className="text-gray-300 font-bold text-[8px] text-center">
                        NO IMG
                      </span>
                    )}
                  </div>

                  {/* --- LABEL CENTERED --- */}

                  {/* Part Name (Centered) */}
                  <div className="col-start-3 row-start-2 border-r border-b border-black p-0.5 flex items-center justify-center bg-gray-50">
                    <span className="text-[6px] font-bold text-center">
                      PART NAME
                    </span>
                  </div>
                  <div className="col-start-4 col-span-2 row-start-2 border-b border-black p-0.5 flex items-center">
                    <span className="font-bold text-[9px] uppercase leading-none line-clamp-2">
                      {lbl.partName}
                    </span>
                  </div>

                  {/* Part No HGS (Centered) - AMBIL DARI lbl.hgs */}
                  <div className="col-start-3 row-start-3 border-r border-b border-black p-0.5 flex items-center justify-center bg-gray-50">
                    <span className="text-[6px] font-bold text-center">
                      PART NO HGS
                    </span>
                  </div>
                  <div className="col-start-4 col-span-2 row-start-3 border-b border-black p-0.5 flex items-center">
                    <span className="font-black text-xs uppercase">
                      {lbl.hgs}
                    </span>
                  </div>

                  {/* Part No FG (Centered) */}
                  <div className="col-start-3 row-start-4 border-r border-b border-black p-0.5 flex items-center justify-center bg-gray-50">
                    <span className="text-[6px] font-bold text-center">
                      PART NO FG
                    </span>
                  </div>
                  <div className="col-start-4 col-span-2 row-start-4 border-b border-black p-0.5 flex items-center">
                    <span className="font-bold text-[9px] uppercase">
                      {lbl.fg}
                    </span>
                  </div>

                  {/* ================= BARIS 5-7 (Footer) ================= */}

                  {/* QTY */}
                  <div className="col-start-1 row-start-5 border-r border-b border-black flex items-center justify-center bg-gray-100">
                    <span className="text-[8px] font-bold">QTY</span>
                  </div>
                  <div className="col-start-1 row-start-6 row-span-2 border-r border-black flex items-center justify-center">
                    <span className="text-3xl font-black">{lbl.qty}</span>
                  </div>

                  {/* --- TANGGAL CENTERED --- */}

                  {/* TGL PROD (Centered) */}
                  <div className="col-start-2 row-start-5 border-r border-b border-black p-0.5 flex items-center justify-center">
                    <span className="text-[6px] font-bold text-center">
                      TGL PROD
                    </span>
                  </div>
                  <div className="col-start-3 col-span-2 row-start-5 border-r border-b border-black p-0.5"></div>
                  <div className="col-start-5 row-start-5 border-b border-black p-0.5 relative">
                    <span className="absolute top-0.5 left-0.5 text-[7px] text-black font-bold">
                      PIC
                    </span>
                  </div>

                  {/* TGL ASSY (Centered) */}
                  <div className="col-start-2 row-start-6 border-r border-b border-black p-0.5 flex items-center justify-center">
                    <span className="text-[6px] font-bold text-center">
                      TGL ASSY
                    </span>
                  </div>
                  <div className="col-start-3 col-span-2 row-start-6 border-r border-b border-black p-0.5"></div>
                  <div className="col-start-5 row-start-6 border-b border-black p-0.5 relative">
                    <span className="absolute top-0.5 left-0.5 text-[7px] text-black font-bold">
                      PIC
                    </span>
                  </div>

                  {/* TGL DLV (Centered) */}
                  <div className="col-start-2 row-start-7 border-r border-black p-0.5 flex items-center justify-center">
                    <span className="text-[6px] font-bold text-center">
                      TGL DLV
                    </span>
                  </div>
                  <div className="col-start-3 col-span-2 row-start-7 border-r border-black p-0.5"></div>
                  <div className="col-start-5 row-start-7 p-0.5 relative">
                    <span className="absolute top-0.5 left-0.5 text-[7px] text-black font-bold">
                      PIC
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* === MODAL POPUP PRINT MENU (STRICT MODE & EMPTY STATE) === */}
      {activeDropdown &&
        (() => {
          // 1. Ambil Item
          const selectedItem = dataMaterial.find(
            (d) => d.id === activeDropdown
          );

          // 2. Ambil Data Master
          const dbKey = generateKey(selectedItem?.partName || "");
          const masterItem = masterDb[dbKey] || {};

          // 3. Helper Cek Data
          const hasData = (val) => val && val !== "" && val !== "-";

          // 4. Logic Visibility (Strict)

          // General: Muncul HANYA jika salah satu data general terisi
          const showGen =
            hasData(masterItem.partNameHgs) ||
            hasData(masterItem.partNoHgs) ||
            hasData(masterItem.finishGood);

          // Assy
          const showAssyGen =
            hasData(masterItem.partAssyName) || hasData(masterItem.partAssyHgs);
          const showAssyL =
            hasData(masterItem.partAssyNameLeft) ||
            hasData(masterItem.partAssyHgsLeft);
          const showAssyR =
            hasData(masterItem.partAssyNameRight) ||
            hasData(masterItem.partAssyHgsRight);
          const hasAnyAssy = showAssyGen || showAssyL || showAssyR;

          // Tag L/R
          const showTagL =
            hasData(masterItem.partNoHgsLeft) ||
            hasData(masterItem.finishGoodLeft);
          const showTagR =
            hasData(masterItem.partNoHgsRight) ||
            hasData(masterItem.finishGoodRight);
          const hasAnyTag = showTagL || showTagR;

          // 5. Cek Apakah KOSONG MELOMPONG (Tidak ada satu pun tombol yg bisa muncul)
          const isTotallyEmpty = !showGen && !hasAnyAssy && !hasAnyTag;

          return (
            <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 ring-1 ring-gray-200">
                {/* Header Menu */}
                <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      Pilih Tipe Label
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Part:{" "}
                      <span className="font-bold text-blue-600">
                        {selectedItem?.partName || "Item"}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveDropdown(null)}
                    className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* === TAMBAHAN 2: TOMBOL PILIH ORIENTASI === */}
                <div className="px-4 pt-3 pb-1">
                  <div className="bg-gray-100 p-1 rounded-lg flex w-full">
                    <button
                      onClick={() => setOrientation("PORTRAIT")}
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 ${
                        orientation === "PORTRAIT"
                          ? "bg-white shadow text-blue-600"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      <span className="text-sm">📄</span> Potrait (2x5)
                    </button>
                    <button
                      onClick={() => setOrientation("LANDSCAPE")}
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 ${
                        orientation === "LANDSCAPE"
                          ? "bg-white shadow text-purple-600"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      <span className="text-sm transform rotate-90">📄</span>{" "}
                      Landscape (3x3)
                    </button>
                  </div>
                </div>

                {/* Isi Menu */}
                <div className="p-2 grid gap-1 max-h-[60vh] overflow-y-auto min-h-[150px]">
                  {/* KONDISI 1: JIKA DATA KOSONG SEMUA */}
                  {isTotallyEmpty && (
                    <div className="flex flex-col items-center justify-center h-full py-8 text-center text-gray-400">
                      <span className="text-4xl mb-2">📭</span>
                      <p className="text-sm font-bold text-gray-600">
                        Data Label Belum Ada
                      </p>
                      <p className="text-[10px] max-w-[200px] mt-1">
                        Silakan lengkapi data Part Name/No di menu{" "}
                        <b>Input Master</b> terlebih dahulu.
                      </p>
                    </div>
                  )}

                  {/* KONDISI 2: TAMPILKAN TOMBOL YANG ADA SAJA */}

                  {/* 1. GENERAL (Hanya muncul jika showGen true) */}
                  {showGen && (
                    <button
                      onClick={() => handlePrintLabel(selectedItem, "GEN")}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-slate-50 rounded-xl group transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-lg group-hover:bg-white group-hover:shadow-sm">
                        🏷️
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-700">
                          Part Tag General
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Label standar
                        </div>
                      </div>
                    </button>
                  )}

                  {/* 2. ASSY GROUP */}
                  {hasAnyAssy && (
                    <>
                      {/* Divider hanya jika Gen ada, biar rapi */}
                      {showGen && (
                        <div className="border-t border-dashed border-slate-200 my-1 mx-4"></div>
                      )}

                      <div className="grid grid-cols-1 gap-1">
                        {showAssyGen && (
                          <button
                            onClick={() =>
                              handlePrintLabel(selectedItem, "ASSY_GEN")
                            }
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-orange-50 rounded-xl group transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">
                              📦
                            </div>
                            <div className="text-sm font-bold text-slate-700 group-hover:text-orange-700">
                              Assy General
                            </div>
                          </button>
                        )}

                        {(showAssyL || showAssyR) && (
                          <div className="grid grid-cols-2 gap-2 px-2 mt-1">
                            {showAssyL && (
                              <button
                                onClick={() =>
                                  handlePrintLabel(selectedItem, "ASSY_L")
                                }
                                className={`flex items-center justify-center gap-2 px-3 py-2 bg-orange-50/50 hover:bg-orange-100 text-orange-800 rounded-lg text-xs font-bold border border-orange-100 transition-colors ${
                                  !showAssyR ? "col-span-2" : ""
                                }`}
                              >
                                ⬅️ Assy Left
                              </button>
                            )}
                            {showAssyR && (
                              <button
                                onClick={() =>
                                  handlePrintLabel(selectedItem, "ASSY_R")
                                }
                                className={`flex items-center justify-center gap-2 px-3 py-2 bg-orange-50/50 hover:bg-orange-100 text-orange-800 rounded-lg text-xs font-bold border border-orange-100 transition-colors ${
                                  !showAssyL ? "col-span-2" : ""
                                }`}
                              >
                                Assy Right ➡️
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* 3. TAG SPECIFIC */}
                  {hasAnyTag && (
                    <>
                      {/* Divider logic */}
                      {(showGen || hasAnyAssy) && (
                        <div className="border-t border-dashed border-slate-200 my-1 mx-4"></div>
                      )}

                      <div className="grid grid-cols-2 gap-2 px-2 pb-2 mt-1">
                        {showTagL && (
                          <button
                            onClick={() =>
                              handlePrintLabel(selectedItem, "TAG_L")
                            }
                            className={`flex flex-col items-center justify-center gap-1 px-3 py-3 bg-yellow-50 hover:bg-yellow-100 hover:border-yellow-300 border border-transparent rounded-xl transition-all ${
                              !showTagR ? "col-span-2 flex-row gap-3" : ""
                            }`}
                          >
                            <span className="text-xl">🟡</span>
                            <span className="text-xs font-bold text-yellow-800">
                              Tag Left (L)
                            </span>
                          </button>
                        )}
                        {showTagR && (
                          <button
                            onClick={() =>
                              handlePrintLabel(selectedItem, "TAG_R")
                            }
                            className={`flex flex-col items-center justify-center gap-1 px-3 py-3 bg-sky-50 hover:bg-sky-100 hover:border-sky-300 border border-transparent rounded-xl transition-all ${
                              !showTagL ? "col-span-2 flex-row gap-3" : ""
                            }`}
                          >
                            <span className="text-xl">🔵</span>
                            <span className="text-xs font-bold text-sky-800">
                              Tag Right (R)
                            </span>
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

      <style>{`
        /* 1. IMPORT FONT WORK SANS (TETAP SAMA) */
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700;800&display=swap');
        
        body, html, .font-sans, table, th, td, button, input, h1, h2, h3, h4, span, div {
          font-family: 'Work Sans', sans-serif !important;
        }
        
        /* 2. ANIMASI LOADING (TETAP SAMA) */
        @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-progress { animation: progress 1.5s infinite linear; }
        
        div {
          float: none !important;
        }

        /* 3. SETTINGAN PRINT (UPDATE DINAMIS DISINI) */
        @media print {
          @page { 
            /* LOGIC BARU: 
               - Jika tipe REQ -> Selalu Landscape
               - Jika tipe LABEL -> Cek tombol pilihan (orientation): Portrait atau Landscape
            */
            size: A4 ${
              printType === "REQ" ||
              (printType === "LABEL" && orientation === "LANDSCAPE")
                ? "landscape"
                : "portrait"
            }; 
            
            margin: 5mm; 
          }
          
          body { -webkit-print-color-adjust: exact; }
          .page-break-inside-avoid { page-break-inside: avoid; }

          /* DEFINISI GRID MANUAL (Biar layout tetap rapi walau Tailwind gak ke-load saat print) */
          
          /* Untuk Portrait (2 Kolom) */
          .grid-cols-2 { 
             display: grid; 
             grid-template-columns: repeat(2, 1fr); 
             gap: 3mm; 
          }

          /* Untuk Landscape (3 Kolom) */
          .grid-cols-3 { 
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
