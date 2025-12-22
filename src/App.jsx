import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { db } from "./firebase";
import vuteqlogo from "../public/vuteq-logo.png"
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

  const [viewMode, setViewMode] = useState("scan");
  const [dbTableMode, setDbTableMode] = useState("REQ");

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
    weight: "",
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
  // const aggregateData = (rawData) => {
  //   const grouped = {};
  //   rawData.forEach((item) => {
  //     const key = `${item.machine}__${item.partName}`;
  //     if (!grouped[key]) {
  //       grouped[key] = {
  //         machine: item.machine,
  //         no: item.no,
  //         partName: item.partName,
  //         partNo: item.partNo,
  //         totalRawSak: 0,
  //         totalRawKg: 0,
  //       };
  //     }
  //     grouped[key].totalRawSak += item.rawSak;
  //     grouped[key].totalRawKg += item.rawKg;
  //   });

  //   return Object.values(grouped).map((item) => {
  //     const totalQty = Math.ceil(item.totalRawSak);
  //     const jmlLabel = Math.ceil(totalQty / 13);
  //     return {
  //       id: Math.random().toString(36),
  //       machine: item.machine,
  //       no: item.no,
  //       partName: item.partName,
  //       partNo: item.partNo,
  //       inputSak: item.totalRawSak,
  //       inputKg: item.totalRawKg,
  //       totalQty: totalQty,
  //       jmlLabel: jmlLabel,
  //       recycleInput: 0,
  //     };
  //   });
  // };

  // === 3. AGGREGASI: FINAL (PLAN HITUNGAN + SAK BULAT KE ATAS) ===
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
      const jmlLabel = Math.ceil(totalQty / 13);

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
        hgs: extraData.partNo,
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
              <h3 className="font-bold text-lg text-slate-700 mb-4 border-b pb-2">
                Input Master Data Part
              </h3>

              {/* === FORM INPUT (COMPACT - SIZE ADJUSTED) === */}
              <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-5 mb-8">
                <div className="grid grid-cols-12 gap-6">
                  {/* --- KOLOM KIRI: DATA TEKS (Lebar 9/12) --- */}
                  <div className="col-span-9 grid grid-cols-4 gap-4">
                    {/* BARIS 1: IDENTITAS UTAMA */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                        Part Name
                      </label>
                      <input
                        name="partName"
                        value={inputForm.partName}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all shadow-sm"
                        placeholder="Paste Nama Part..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                        Part No (HGS)
                      </label>
                      <input
                        name="partNo"
                        value={inputForm.partNo}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all shadow-sm"
                        placeholder="No. Utama"
                      />
                    </div>
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
                        className="w-full border border-emerald-400 rounded-lg px-3 py-2 text-sm font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all shadow-sm placeholder:text-emerald-300"
                        placeholder="0.00"
                      />
                    </div>

                    {/* BARIS 2: DETAIL PART */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Model
                      </label>
                      <input
                        name="model"
                        value={inputForm.model}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all"
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
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Finish Good
                      </label>
                      <input
                        name="finishGood"
                        value={inputForm.finishGood}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all"
                      />
                    </div>
                    {/* PEMISAH TIPIS */}
                    <div className="col-span-4 border-t border-gray-200 my-1"></div>

                    {/* BARIS 3: MATERIAL 1 & 2 */}
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
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all placeholder:text-gray-300"
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
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all placeholder:text-gray-300"
                        placeholder="Opsional"
                      />
                    </div>
                  </div>

                  {/* --- KOLOM KANAN: GAMBAR (Lebar 3/12) --- */}
                  <div className="col-span-3 flex flex-col gap-3">
                    {/* QR Code */}
                    <div
                      className="flex-1 border-2 border-dashed border-gray-300 rounded-xl hover:bg-white hover:border-blue-400 cursor-pointer relative flex flex-col items-center justify-center transition-all bg-gray-50 min-h-[100px] group"
                      onClick={() => qrInputRef.current.click()}
                      onPaste={(e) => handlePasteImage(e, "qrImage")}
                    >
                      {inputForm.qrImage ? (
                        <div className="relative w-full h-full p-2 flex items-center justify-center">
                          <img
                            src={inputForm.qrImage}
                            className="max-h-[90px] object-contain"
                            alt="QR"
                          />
                          <button
                            onClick={(e) =>
                              handleRemoveImage(e, "qrImage", qrInputRef)
                            }
                            className="absolute top-1 right-1 bg-white text-red-500 rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md border hover:bg-red-50"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-xs text-center group-hover:text-blue-500 transition-colors">
                          <span className="text-2xl mb-1 block">📷</span> Upload
                          QR
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

                    {/* Foto Part */}
                    <div
                      className="flex-1 border-2 border-dashed border-gray-300 rounded-xl hover:bg-white hover:border-blue-400 cursor-pointer relative flex flex-col items-center justify-center transition-all bg-gray-50 min-h-[100px] group"
                      onClick={() => partImgInputRef.current.click()}
                      onPaste={(e) => handlePasteImage(e, "partImage")}
                    >
                      {inputForm.partImage ? (
                        <div className="relative w-full h-full p-2 flex items-center justify-center">
                          <img
                            src={inputForm.partImage}
                            className="max-h-[90px] object-contain rounded"
                            alt="Part"
                          />
                          <button
                            onClick={(e) =>
                              handleRemoveImage(e, "partImage", partImgInputRef)
                            }
                            className="absolute top-1 right-1 bg-white text-red-500 rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md border hover:bg-red-50"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-xs text-center group-hover:text-blue-500 transition-colors">
                          <span className="text-2xl mb-1 block">🖼️</span> Upload
                          Foto
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

                {/* TOMBOL ACTION */}
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

              {/* [INSERT TOMBOL DISINI] Tab Switcher */}
              <div className=" bg-slate-100 p-1.5 rounded-lg my-5 inline-flex border border-slate-200">
                <button
                  onClick={() => setDbTableMode("REQ")}
                  className={`px-5 py-2 text-xs font-bold rounded-md transition-all shadow-sm ${
                    dbTableMode === "REQ"
                      ? "bg-white text-slate-800 ring-1 ring-black/5"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 shadow-none"
                  }`}
                >
                  REQ MATERIAL
                </button>
                <button
                  onClick={() => setDbTableMode("LABEL")}
                  className={`px-5 py-2 text-xs font-bold rounded-md transition-all shadow-sm ${
                    dbTableMode === "LABEL"
                      ? "bg-white text-slate-800 ring-1 ring-black/5"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 shadow-none"
                  }`}
                >
                  Part Tag
                </button>
              </div>

              {/* 2. Tabel Utama */}
              <div className="overflow-hidden border border-black/10 rounded-xl shadow-sm bg-white">
                <div className="overflow-x-auto h-[500px]">
                  <table className="w-full text-sm text-left border-collapse whitespace-nowrap font-sans">
                    {/* HEADER (Teks Hitam) */}
                    <thead className="bg-white text-black sticky top-0 z-20 shadow-sm ring-1 ring-black/5">
                      <tr className="uppercase text-xs tracking-wider font-extrabold">
                        <th className="px-4 py-4 w-12 text-center bg-gray-50 border-b border-gray-200">
                          No
                        </th>
                        <th className="px-4 py-4 min-w-[220px] bg-gray-50 border-b border-gray-200">
                          Part Name
                        </th>
                        <th className="px-4 py-4 bg-gray-50 border-b border-gray-200">
                          Part No (HGS)
                        </th>
                        <th className="px-4 py-4 bg-gray-50 border-b border-gray-200">
                          Model
                        </th>

                        {/* MODE REQ */}
                        {dbTableMode === "REQ" && (
                          <>
                            <th className="px-4 py-4 bg-gray-50 border-b  border-l border-gray-200">
                              Material 1
                            </th>
                            <th className="px-4 py-4 bg-gray-50 border-b border-gray-200">
                              No. Mat 1
                            </th>
                            <th className="px-4 py-4 bg-gray-50 border-b  border-l border-gray-200">
                              Material 2
                            </th>
                            <th className="px-4 py-4 bg-gray-50 border-b border-gray-200">
                              No. Mat 2
                            </th>
                            <th className="px-4 py-4 bg-gray-50 border-b  text-center border-l border-gray-200">
                              Berat (Kg)
                            </th>
                          </>
                        )}

                        {/* MODE LABEL */}
                        {dbTableMode === "LABEL" && (
                          <>
                            <th className="px-4 py-4 bg-gray-50 border-b  border-l border-gray-200">
                              Part No FG
                            </th>
                            <th className="px-4 py-4 bg-gray-50 border-b  text-center border-l border-gray-200">
                              Berat (Kg)
                            </th>
                            <th className="px-4 py-4 bg-gray-50 border-b border-gray-200 text-center">
                              QR Code
                            </th>
                            <th className="px-4 py-4 bg-gray-50 border-b border-gray-200 text-center">
                              Foto Part
                            </th>
                          </>
                        )}

                        <th className="px-4 py-4 bg-gray-50 border-b border-gray-200 text-center sticky right-0 z-30 shadow-l">
                          Opsi
                        </th>
                      </tr>
                    </thead>

                    {/* BODY (Teks Hitam Semua) */}
                    <tbody className="divide-y divide-gray-200">
                      {(() => {
                        const filteredData = Object.entries(masterDb)
                          .filter(([key, item]) => {
                            if (!searchTerm) return true;
                            const q = searchTerm.toLowerCase();
                            return (
                              item.partName.toLowerCase().includes(q) ||
                              item.partNo.toLowerCase().includes(q)
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
                                className="p-12 text-center text-black italic"
                              >
                                <div className="mb-2 text-2xl">📂</div>
                                Belum ada data part yang tersimpan.
                              </td>
                            </tr>
                          );
                        }

                        return filteredData.map(([key, item], index) => {
                          // Zebra: Ganjil Abu-abu, Genap Putih
                          const isOddRow = index % 2 !== 0;
                          const rowClass = isOddRow
                            ? "bg-gray-100"
                            : "bg-white"; // Saya gelapkan dikit abunya (gray-100) biar kontras sama putih

                          return (
                            <tr
                              key={key}
                              className={`${rowClass} hover:bg-blue-100 transition-colors group`}
                            >
                              {/* NO */}
                              <td className="px-4 py-4 text-center text-black font-bold text-xs">
                                {index + 1}
                              </td>

                              {/* UMUM */}
                              <td className="px-4 py-4 font-bold text-black">
                                {item.partName}
                              </td>
                              <td className="px-4 py-4 font-medium text-black">
                                {item.partNo}
                              </td>
                              <td className="px-4 py-4 text-black">
                                {item.model}
                              </td>

                              {/* MODE REQ */}
                              {dbTableMode === "REQ" && (
                                <>
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
                                    {item.weight ? item.weight : "-"}
                                  </td>
                                </>
                              )}

                              {/* MODE LABEL */}
                              {dbTableMode === "LABEL" && (
                                <>
                                  <td className="px-4 py-4 text-black border-l border-gray-200">
                                    {item.finishGood || "-"}
                                  </td>
                                  <td className="px-4 py-4 text-center font-bold text-black border-l border-gray-200">
                                    {item.weight ? item.weight : "-"}
                                  </td>
                                  <td className="px-4 py-4 text-center">
                                    {item.qrImage ? (
                                      <div className="relative group/img inline-block">
                                        <div className="w-8 h-8 border border-black rounded bg-white p-0.5 cursor-pointer mx-auto">
                                          <img
                                            src={item.qrImage}
                                            className="w-full h-full object-contain"
                                          />
                                        </div>
                                        {/* Hover Preview */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/img:block z-50 w-32 bg-white border border-black rounded-lg shadow-xl p-2">
                                          <img
                                            src={item.qrImage}
                                            className="w-full"
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      "-"
                                    )}
                                  </td>
                                  <td className="px-4 py-4 text-center">
                                    {item.partImage ? (
                                      <div className="relative group/img inline-block">
                                        <div className="w-8 h-8 border border-black rounded bg-white p-0.5 cursor-pointer mx-auto">
                                          <img
                                            src={item.partImage}
                                            className="w-full h-full object-contain"
                                          />
                                        </div>
                                        {/* Hover Preview */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/img:block z-50 w-40 bg-white border border-black rounded-lg shadow-xl p-2">
                                          <img
                                            src={item.partImage}
                                            className="w-full rounded"
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      "-"
                                    )}
                                  </td>
                                </>
                              )}

                              {/* ACTION */}
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
                        });
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

        {/* === PRINT 2: LABEL 2x5 (PORTRAIT - LOGO VUTEQ IMAGE) === */}
        {printType === "LABEL" && (
          <div className="w-full h-full bg-white text-black font-sans leading-none">
            <div
              // Grid 2 Kolom, Konten Rata Atas (content-start), Gap 3mm
              className="grid grid-cols-2 content-start"
              style={{
                width: "210mm",
                minHeight: "297mm",
                padding: "5mm",
                gap: "3mm",
              }}
            >
              {printData.map((lbl, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-5 grid-rows-[0.6fr_1fr_1fr_1fr_1fr_1fr_1fr] border border-black box-border page-break-inside-avoid"
                  // Tinggi 54mm
                  style={{ width: "100%", height: "54mm" }}
                >
                  {/* ================= BARIS 1 (Header) ================= */}

                  {/* --- LOGO VUTEQ (GAMBAR) --- */}
                  <div className="col-start-1 row-start-1 border-r border-b border-black flex items-center justify-center p-0.5 overflow-hidden">
                    <img
                      // GANTI URL INI DENGAN PATH GAMBAR LOGO ASLI MAS
                      src={vuteqlogo}
                      alt="VuteQ Logo"
                      // w-full h-full: Memenuhi kotak
                      // object-contain: Menjaga rasio 768x249 agar tidak gepeng
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* PART TAG */}
                  <div className="col-start-2 row-start-1 border-r border-b border-black flex items-center justify-center p-0.5">
                    <span className="font-bold text-[8px] text-black px-1.5 py-0.5 rounded-sm">
                      PART TAG
                    </span>
                  </div>

                  {/* MODEL */}
                  <div className="col-start-3 col-span-2 row-start-1 border-r border-b border-black flex flex-col items-center justify-center p-0.5">
                    <span className="text-[6px] font-bold">MODEL</span>
                    <span className="font-black text-sm uppercase">
                      {lbl.model}
                    </span>
                  </div>

                  {/* QR / BOX */}
                  <div className="col-start-5 row-start-1 border-b border-black flex items-center justify-center p-0.5">
                    {lbl.qr ? (
                      <img
                        src={lbl.qr}
                        alt="QR"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <p>- </p>
                    )}
                  </div>

                  {/* ================= BARIS 2-4 (Body Tengah) ================= */}

                  {/* FOTO PART (Span 3 Baris) */}
                  <div className="col-start-1 col-span-2 row-start-2 row-span-3 border-r border-b border-black p-1 flex items-center justify-center overflow-hidden">
                    {lbl.img ? (
                      <img
                        src={lbl.img}
                        alt="Part"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-gray-300 font-bold text-[8px]">
                        NO IMG
                      </span>
                    )}
                  </div>

                  {/* Part Name */}
                  <div className="col-start-3 row-start-2 border-r border-b border-black p-0.5 flex items-center bg-gray-50">
                    <span className="text-[6px] font-bold">PART NAME</span>
                  </div>
                  <div className="col-start-4 col-span-2 row-start-2 border-b border-black p-0.5 flex items-center">
                    <span className="font-bold text-[9px] uppercase leading-none line-clamp-2">
                      {lbl.partName}
                    </span>
                  </div>

                  {/* Part No HGS */}
                  <div className="col-start-3 row-start-3 border-r border-b border-black p-0.5 flex items-center bg-gray-50">
                    <span className="text-[6px] font-bold">PART NO HGS</span>
                  </div>
                  <div className="col-start-4 col-span-2 row-start-3 border-b border-black p-0.5 flex items-center">
                    <span className="font-black text-xs uppercase">
                      {lbl.partNo}
                    </span>
                  </div>

                  {/* Part No FG */}
                  <div className="col-start-3 row-start-4 border-r border-b border-black p-0.5 flex items-center bg-gray-50">
                    <span className="text-[6px] font-bold">PART NO FG</span>
                  </div>
                  <div className="col-start-4 col-span-2 row-start-4 border-b border-black p-0.5 flex items-center">
                    <span className="font-bold text-[9px] uppercase">
                      {lbl.fg || "-"}
                    </span>
                  </div>

                  {/* ================= BARIS 5-7 (Footer) ================= */}

                  {/* QTY (Span 2 Baris) */}
                  <div className="col-start-1 row-start-5 border-r border-b border-black flex items-center justify-center bg-gray-100">
                    <span className="text-[8px] font-bold">QTY</span>
                  </div>
                  <div className="col-start-1 row-start-6 row-span-2 border-r border-black flex items-center justify-center">
                    <span className="text-3xl font-black">{lbl.qty}</span>
                  </div>

                  {/* Tabel Tanggal (Kanan Bawah) */}

                  {/* TGL PROD */}
                  <div className="col-start-2 row-start-5 border-r border-b border-black p-0.5 flex items-center">
                    <span className="text-[6px] font-bold">TGL PROD</span>
                  </div>
                  <div className="col-start-3 col-span-2 row-start-5 border-r border-b border-black p-0.5"></div>
                  <div className="col-start-5 row-start-5 border-b border-black p-0.5 relative">
                    <span className="absolute top-0 right-0.5 text-[5px] text-gray-400">
                      PIC
                    </span>
                  </div>

                  {/* TGL ASSY */}
                  <div className="col-start-2 row-start-6 border-r border-b border-black p-0.5 flex items-center">
                    <span className="text-[6px] font-bold">TGL ASSY</span>
                  </div>
                  <div className="col-start-3 col-span-2 row-start-6 border-r border-b border-black p-0.5"></div>
                  <div className="col-start-5 row-start-6 border-b border-black p-0.5 relative">
                    <span className="absolute top-0 right-0.5 text-[5px] text-gray-400">
                      PIC
                    </span>
                  </div>

                  {/* TGL DLV */}
                  <div className="col-start-2 row-start-7 border-r border-black p-0.5 flex items-center">
                    <span className="text-[6px] font-bold">TGL DLV</span>
                  </div>
                  <div className="col-start-3 col-span-2 row-start-7 border-r border-black p-0.5"></div>
                  <div className="col-start-5 row-start-7 p-0.5 relative">
                    <span className="absolute top-0 right-0.5 text-[5px] text-gray-400">
                      PIC
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
/* 1. IMPORT FONT WORK SANS DARI GOOGLE */
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700;800&display=swap');

        /* 2. TERAPKAN KE SELURUH ELEMEN APLIKASI */
        body, html, .font-sans, table, th, td, button, input, h1, h2, h3, h4, span, div {
          font-family: 'Work Sans', sans-serif !important;
        }
        @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-progress { animation: progress 1.5s infinite linear; }
        @media print {
          @page { size: A4 landscape; margin: 5mm; }
          .print\\:grid-cols-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5mm; }
          body { -webkit-print-color-adjust: exact; }
        }
          div {
            float: none !important;
          }


        @media print {
          /* Margin 5mm */
          @page { size: A4 portrait; margin: 5mm; } 
          
          /* Grid 2 Kolom dengan Gap 2mm */
          .print\\:grid-cols-2 { 
             display: grid; 
             grid-template-columns: repeat(2, 1fr); 
             gap: 2mm; /* Ini kuncinya */
          }
          
          body { -webkit-print-color-adjust: exact; }
          .page-break-inside-avoid { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}

export default App;
