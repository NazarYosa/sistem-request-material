// src/App.jsx
import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { generateKey, getMarkersFromDate } from "./utils";

// --- IMPORT KOMPONEN ---
import Header from "./components/Header";
import InputView from "./components/InputView";
import ScanView from "./components/ScanView";
import PrintLayout from "./components/PrintLayout";
import ModalMenu from "./components/ModalMenu";
import HistoryView from "./components/HistoryView";
import ManualReqView from "./components/ManualReqView";

function App() {
  // === 1. STATE MANAGEMENT ===
  const [dataMaterial, setDataMaterial] = useState([]);
  const [printData, setPrintData] = useState(null);
  const [printType, setPrintType] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const inputFormRef = useRef(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [viewMode, setViewMode] = useState("scan");
  const [dbTableMode, setDbTableMode] = useState("REQ");
  const [orientation, setOrientation] = useState("PORTRAIT");

  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA"),
  );

  const [masterDb, setMasterDb] = useState({});
  const [isLoadingDb, setIsLoadingDb] = useState(false);

  // STATE: HISTORY & CUSTOM POPUP
  const [pendingHistory, setPendingHistory] = useState(null);
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [isSavingHistory, setIsSavingHistory] = useState(false);

  const [inputForm, setInputForm] = useState({
    partName: "",
    partNo: "",
    weight: "",
    stdQty: "",
    partNameHgs: "",
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
    materialName2: "",
    partNoMaterial2: "",
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

  // ========================================================================
  // SISTEM AUTO-SYNC EXCEL (FILE SYSTEM ACCESS API)
  // ========================================================================
  const fileHandleRef = useRef(null);
  const lastModifiedRef = useRef(0);
  const selectedDateRef = useRef(selectedDate);
  const masterDbRef = useRef(masterDb);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);

  // 1. Ekstraksi Data dari Excel
  const processSheet = (rows, sheetName, markers) => {
    let headerRow = -1,
      colNo = -1,
      colPartName = -1,
      colPartNo = -1,
      dateColIndex = -1,
      offsetSak = -1,
      offsetKg = -1;

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
        if (!cell || dateColIndex !== -1) return;
        const valStr = String(cell).trim();
        const isDateMatch =
          valStr === markers.dayStr ||
          valStr === `0${markers.dayStr}` ||
          valStr.includes(markers.fullDate);

        if (isDateMatch) {
          const nextDayStr = String(parseInt(markers.dayStr) + 1);
          if (rows[i + 1] && String(rows[i + 1][idx]).trim() === nextDayStr)
            return;

          let isHorizontalSequence = false;
          if (row[idx + 1]) {
            const valRight = String(row[idx + 1]).trim();
            if (valRight === nextDayStr || valRight.includes(nextDayStr))
              isHorizontalSequence = true;
          }

          let foundSak = -1,
            foundPlan = -1,
            foundKg = -1;
          for (let r = 0; r <= 8; r++) {
            if (!rows[i + r]) continue;
            for (let off = -1; off <= 5; off++) {
              const checkIdx = idx + off;
              if (checkIdx < 0 || !rows[i + r][checkIdx]) continue;
              const subVal = String(rows[i + r][checkIdx])
                .toUpperCase()
                .trim();
              if (["SAK", "BOX", "PACK"].some((k) => subVal.includes(k))) {
                if (foundSak === -1) foundSak = off;
              } else if (
                ["PLAN", "QTY", "PCS", "PROD", "TARGET"].some((k) =>
                  subVal.includes(k),
                )
              ) {
                if (foundPlan === -1) foundPlan = off;
              } else if (
                ["KG", "BERAT", "MAT", "WEIGHT"].some((k) => subVal.includes(k))
              ) {
                foundKg = off;
              }
            }
          }

          if (
            foundSak !== -1 ||
            foundPlan !== -1 ||
            foundKg !== -1 ||
            isHorizontalSequence ||
            valStr.length > 5 ||
            valStr.includes("-")
          ) {
            headerRow = i;
            dateColIndex = idx;
            if (foundSak !== -1) offsetSak = foundSak;
            else if (foundPlan !== -1) offsetSak = foundPlan;
            else offsetSak = 0;
            offsetKg = foundKg !== -1 ? foundKg : -1;
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
    let currentPartName = null,
      currentPartNo = "-",
      currentNo = 9999;

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
        if (
          String(row[c]).toUpperCase().trim() === "ACTUAL" ||
          String(row[c]).toUpperCase().trim() === "ACT"
        ) {
          isActualRow = true;
          break;
        }
      }
      if (isActualRow) continue;

      let finalSak = 0,
        displayKg = 0;
      if (offsetKg !== -1) {
        let val = parseFloat(
          String(row[dateColIndex + offsetKg]).replace(",", "."),
        );
        if (!isNaN(val) && val > 0) displayKg = val;
      }
      if (offsetSak !== -1) {
        let val = parseFloat(
          String(row[dateColIndex + offsetSak]).replace(",", "."),
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
      const dbKey = generateKey(item.partName);
      const extraData = masterDbRef.current[dbKey] || {};
      let rawWeight = extraData.weight;
      let partWeight = parseFloat(String(rawWeight).replace(",", "."));
      let isValidWeight = !isNaN(partWeight) && partWeight > 0;
      let calculatedPlan = 0;
      if (item.totalRawKg > 0 && isValidWeight)
        calculatedPlan = Math.ceil(item.totalRawKg / partWeight);
      const totalQty = Math.ceil(item.totalRawSak);
      const jmlLabel = Math.ceil(totalQty / 11);

      return {
        id: Math.random().toString(36),
        machine: item.machine,
        no: item.no,
        partName: item.partName,
        partNo: extraData.partNo || item.partNo,
        inputSak: item.totalRawSak,
        inputKg: item.totalRawKg,
        inputPlan: calculatedPlan,
        totalQty: totalQty,
        jmlLabel: jmlLabel,
        recycleInput: 0,
        isExcluded: false,
      };
    });
  };

  // 2. Fungsi Pembaca File Utama
  const processFileFromHandle = async () => {
    if (!fileHandleRef.current) return;

    try {
      const file = await fileHandleRef.current.getFile();

      // Cek jika file tidak berubah, hentikan proses (hemat resource)
      if (file.lastModified === lastModifiedRef.current) return;

      lastModifiedRef.current = file.lastModified;
      setIsProcessing(true);

      const markers = getMarkersFromDate(selectedDateRef.current);
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
              if (result.length > 0)
                extractedData = [...extractedData, ...result];
            }
          });

          if (extractedData.length > 0) {
            const aggregated = aggregateData(extractedData);
            setDataMaterial(aggregated);
          } else {
            setDataMaterial([]);
          }
        } catch (error) {
          console.error("Error parsing Excel:", error);
        } finally {
          setIsProcessing(false);
        }
      };
    } catch (err) {
      console.error("Auto-sync read error:", err);
      setIsProcessing(false);
    }
  };

  const handleFilePick = async () => {
    try {
      if (!window.showOpenFilePicker) {
        alert(
          "Browser Anda tidak mendukung fitur Live Auto-Sync! Gunakan Chrome atau Edge versi Desktop.",
        );
        return;
      }

      const [handle] = await window.showOpenFilePicker({
        types: [
          {
            description: "Excel Files",
            accept: {
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                [".xlsx"],
              "application/vnd.ms-excel": [".xls"],
            },
          },
        ],
        multiple: false,
      });

      fileHandleRef.current = handle;
      lastModifiedRef.current = 0; // Force read pertama kali
      setIsAutoSyncing(true);
      await processFileFromHandle();
    } catch (err) {
      if (err.name !== "AbortError") console.error("File Picker Error:", err);
    }
  };

  const handleResetData = () => {
    setDataMaterial([]);
    setIsAutoSyncing(false);
    fileHandleRef.current = null;
    lastModifiedRef.current = 0;
  };

  // 3. Efek Sinkronisasi Master DB
  useEffect(() => {
    masterDbRef.current = masterDb;
  }, [masterDb]);

  // 4. EFEK CERDAS: DETEKSI PERUBAHAN TANGGAL
  useEffect(() => {
    selectedDateRef.current = selectedDate;
    // Jika user mengganti tanggal dan file sudah pernah dipilih, paksa baca ulang
    if (fileHandleRef.current) {
      lastModifiedRef.current = 0; // Reset cache modifikasi
      processFileFromHandle(); // Tarik data dengan tanggal baru
    }
  }, [selectedDate]);

  // 5. Interval Mesin Pencari Auto Sync (Setiap 2 Detik)
  useEffect(() => {
    let interval;
    if (isAutoSyncing) {
      interval = setInterval(() => {
        processFileFromHandle();
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isAutoSyncing]);

  // ========================================================================

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingDb(true);
      try {
        const querySnapshot = await getDocs(collection(db, "master_parts"));
        const data = {};
        querySnapshot.forEach((doc) => {
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

  useEffect(() => {
    const handleAfterPrint = () => {
      if (pendingHistory && pendingHistory.length > 0) {
        setTimeout(() => {
          setShowPrintConfirm(true);
        }, 500);
      }
    };
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, [pendingHistory]);

  const handleConfirmHistory = async () => {
    setIsSavingHistory(true);
    try {
      const historyRef = collection(db, "print_history");
      for (let item of pendingHistory) {
        await addDoc(historyRef, item);
      }
      console.log("Berhasil disimpan ke History!");
    } catch (error) {
      console.error("Gagal save history:", error);
      alert("Gagal mencatat ke History. Cek koneksi Anda.");
    } finally {
      setIsSavingHistory(false);
      setPendingHistory(null);
      setShowPrintConfirm(false);
    }
  };

  const handleCancelHistory = () => {
    setPendingHistory(null);
    setShowPrintConfirm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveInput = async () => {
    if (!inputForm.partName) return alert("Part Name wajib diisi!");
    const newKey = generateKey(inputForm.partName);

    try {
      if (editingKey && editingKey !== newKey) {
        await deleteDoc(doc(db, "master_parts", editingKey));
        setMasterDb((prev) => {
          const temp = { ...prev };
          delete temp[editingKey];
          return temp;
        });
      }
      await setDoc(doc(db, "master_parts", newKey), inputForm);
      setMasterDb((prev) => ({ ...prev, [newKey]: inputForm }));
      setInputForm({
        partName: "",
        partNo: "",
        weight: "",
        stdQty: "",
        partNameHgs: "",
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
        materialName2: "",
        partNoMaterial2: "",
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
      alert("Data berhasil disimpan ke Cloud!");
    } catch (error) {
      console.error("Error saving: ", error);
      alert("Gagal menyimpan data.");
    }
  };

  const handleEditDb = (key) => {
    const data = masterDb[key];
    setInputForm(data);
    setEditingKey(key);
    if (inputFormRef.current)
      inputFormRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  };

  const handleCancelEdit = () => {
    setInputForm({
      partName: "",
      partNo: "",
      weight: "",
      stdQty: "",
      partNameHgs: "",
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
      materialName2: "",
      partNoMaterial2: "",
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

  const handleDeleteDb = async (key) => {
    if (window.confirm("Hapus data ini permanen?")) {
      try {
        await deleteDoc(doc(db, "master_parts", key));
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

  const toggleExcludePart = (id) => {
    setDataMaterial((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isExcluded: !item.isExcluded } : item,
      ),
    );
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
      }),
    );
  };

  const handlePrintRequest = (item) => {
    const dbKey = generateKey(item.partName);
    const extraData = masterDb[dbKey] || {};
    const labels = [];
    const totalPlan = item.totalQty;
    const totalRecycle = item.recycleInput || 0;
    const netRequest = Math.max(0, totalPlan - totalRecycle);
    let totalBox = Math.ceil(totalPlan / 11);
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

    const dateObj = new Date();
    const monthYear = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
    const historyItem = {
      printDate: dateObj.toISOString(),
      monthYear: monthYear,
      machine: item.machine ? item.machine.toUpperCase() : "-",
      partName: item.partName || "-",
      partNo: extraData.partNo || item.partNo || "-",
      totalSak: parseInt(item.totalQty || 0),
      totalKg: parseFloat(item.inputKg || 0),
      recycle: parseFloat(item.recycleInput || 0),
      printType: "SCAN_SATUAN",
    };

    setPendingHistory([historyItem]);
    setPrintType("REQ");
    setPrintData(labels);
  };

  const handlePrintAllRequest = () => {
    if (!window.confirm("Yakin ingin mencetak SEMUA data?")) return;

    let allLabelsAccumulated = [];
    let historyRecords = [];
    const dateObj = new Date();
    const monthYear = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;

    dataMaterial.forEach((item) => {
      if (item.totalQty > 0 && !item.isExcluded) {
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

        historyRecords.push({
          printDate: dateObj.toISOString(),
          monthYear: monthYear,
          machine: item.machine ? item.machine.toUpperCase() : "-",
          partName: item.partName || "-",
          partNo: extraData.partNo || item.partNo || "-",
          totalSak: parseInt(item.totalQty || 0),
          totalKg: parseFloat(item.inputKg || 0),
          recycle: parseFloat(item.recycleInput || 0),
          printType: "SCAN_ALL",
        });
      }
    });

    if (allLabelsAccumulated.length === 0) {
      alert("Tidak ada data yang perlu di-print (semua anomali atau Qty 0).");
      return;
    }

    setPendingHistory(historyRecords);
    setPrintType("REQ");
    setPrintData(allLabelsAccumulated);
  };

  const handlePrintLabel = (item, type) => {
    const dbKey = generateKey(item.partName);
    const extraData = masterDb[dbKey];
    if (!extraData) {
      alert("Data Part ini belum diinput di menu INPUT! Silakan input dulu.");
      return;
    }

    let targetName = "",
      targetHgs = "",
      targetFg = "",
      targetQr = "",
      targetImg = "";
    switch (type) {
      case "GEN":
        targetName = extraData.partNameHgs;
        targetHgs = extraData.partNoHgs;
        targetFg = extraData.finishGood;
        targetQr = extraData.qrHgs;
        targetImg = extraData.imgHgs;
        break;
      case "ASSY_GEN":
        targetName = extraData.partAssyName;
        targetHgs = extraData.partAssyHgs;
        targetFg = extraData.partAssyFg;
        targetQr = extraData.qrAssy;
        targetImg = extraData.imgAssy;
        break;
      case "ASSY_L":
        targetName = extraData.partAssyNameLeft;
        targetHgs = extraData.partAssyHgsLeft;
        targetFg = extraData.partAssyFgLeft;
        targetQr = extraData.qrAssyL;
        targetImg = extraData.imgAssyL;
        break;
      case "ASSY_R":
        targetName = extraData.partAssyNameRight;
        targetHgs = extraData.partAssyHgsRight;
        targetFg = extraData.partAssyFgRight;
        targetQr = extraData.qrAssyR;
        targetImg = extraData.imgAssyR;
        break;
      case "TAG_L":
        targetName = extraData.partNameHgsLeft;
        targetHgs = extraData.partNoHgsLeft;
        targetFg = extraData.finishGoodLeft;
        targetQr = extraData.qrTagL;
        targetImg = extraData.imgTagL;
        break;
      case "TAG_R":
        targetName = extraData.partNameHgsRight;
        targetHgs = extraData.partNoHgsRight;
        targetFg = extraData.finishGoodRight;
        targetQr = extraData.qrTagR;
        targetImg = extraData.imgTagR;
        break;
      default:
        return;
    }

    if (!targetName && !targetHgs) {
      if (!window.confirm(`Data teks untuk tipe ${type} kosong. Tetap print?`))
        return;
    }

    const totalQtyPlan = parseInt(item.inputPlan) || 0;
    const stdPack = parseInt(extraData.stdQty) || 1;
    const totalBox = Math.ceil(totalQtyPlan / stdPack) || 1;
    const labels = [];
    for (let i = 1; i <= totalBox; i++) {
      labels.push({
        machine: item.machine,
        partName: targetName || "-",
        hgs: targetHgs || "-",
        fg: targetFg || "-",
        qr: targetQr,
        img: targetImg,
        partNo: extraData.partNo,
        model: extraData.model,
        qty: stdPack,
        boxKe: i,
        totalBox: totalBox,
      });
    }

    setActiveDropdown(null);
    setPrintType("LABEL");
    setPrintData(labels);
  };

  const handleExportFirebase = async () => {
    setIsProcessing(true);
    try {
      const querySnapshot = await getDocs(collection(db, "master_parts"));
      const allData = {};
      querySnapshot.forEach((doc) => {
        allData[doc.id] = doc.data();
      });
      const jsonString = JSON.stringify(allData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `VUTEQ_DB_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert(`✅ Berhasil Export ${Object.keys(allData).length} Data!`);
    } catch (error) {
      console.error("Gagal export:", error);
      alert("Gagal koneksi ke Firebase.");
    } finally {
      setIsProcessing(false);
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

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-slate-800 font-sans overflow-hidden print:h-auto print:overflow-visible">
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      <div className="flex-1 overflow-y-auto print:hidden">
        <div className="w-full mx-auto">
          {viewMode === "input" && (
            <div className="p-8 w-full">
              <InputView
                inputForm={inputForm}
                setInputForm={setInputForm}
                handleInputChange={handleInputChange}
                handleSaveInput={handleSaveInput}
                handleCancelEdit={handleCancelEdit}
                editingKey={editingKey}
                masterDb={masterDb}
                handleEditDb={handleEditDb}
                handleDeleteDb={handleDeleteDb}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                handleExportFirebase={handleExportFirebase}
                inputFormRef={inputFormRef}
              />
            </div>
          )}

          {viewMode === "scan" && (
            <div className="w-full bg-slate-50 p-4 md:p-6 lg:px-8">
              <ScanView
                dataMaterial={dataMaterial}
                groupedUI={groupedUI}
                selectedDate={selectedDate}
                setDataMaterial={setDataMaterial}
                handlePrintRequest={handlePrintRequest}
                setActiveDropdown={setActiveDropdown}
                handleRecycleChange={handleRecycleChange}
                masterDb={masterDb}
                toggleExcludePart={toggleExcludePart}
                handlePrintAllRequest={handlePrintAllRequest}
                handleFilePick={handleFilePick}
                isAutoSyncing={isAutoSyncing}
                handleResetData={handleResetData}
              />
            </div>
          )}

          {viewMode === "history" && (
            <div className="p-4 md:p-8">
              <HistoryView db={db} masterDb={masterDb} />
            </div>
          )}

          {viewMode === "manual" && (
            <div className="p-4 md:p-8">
              <ManualReqView
                db={db}
                masterDb={masterDb}
                setPrintType={setPrintType}
                setPrintData={setPrintData}
                setPendingHistory={setPendingHistory}
              />
            </div>
          )}
        </div>
      </div>

      {/* OVERLAY PROCESSING */}
      {isProcessing && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-5">
            <div className="w-14 h-14 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-base font-black text-slate-700 animate-pulse tracking-wide">
              {isAutoSyncing
                ? "SYNC DATA TANGGAL BARU..."
                : "MEMPROSES DATA..."}
            </span>
          </div>
        </div>
      )}

      {/* POPUP CONFIRM HISTORY */}
      {showPrintConfirm && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 print:hidden animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-4">
                🖨️
              </div>
              <h3 className="font-black text-2xl text-slate-800 tracking-tight">
                Status Print?
              </h3>
              <p className="text-slate-500 text-sm mt-2 font-medium leading-relaxed">
                Apakah stiker tadi berhasil di-print atau di-save?
              </p>
              <div className="mt-5 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <span className="text-emerald-500 text-lg leading-none">
                    ✅
                  </span>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Klik <span className="text-emerald-600">SAVE</span>
                    <br />
                    <span className="text-[10px] text-slate-500 normal-case font-medium">
                      Data pemakaian akan masuk ke History.
                    </span>
                  </p>
                </div>
                <div className="flex items-start gap-3 pt-3 border-t border-slate-200">
                  <span className="text-red-500 text-lg leading-none">❌</span>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Klik <span className="text-red-600">CANCEL</span>
                    <br />
                    <span className="text-[10px] text-slate-500 normal-case font-medium">
                      Data dibuang & tidak masuk History.
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={handleCancelHistory}
                disabled={isSavingHistory}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-white border-2 border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmHistory}
                disabled={isSavingHistory}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-blue-600 border-2 border-blue-600 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {isSavingHistory ? "SAVING..." : "SAVE"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTING & MODALS */}
      <PrintLayout
        printType={printType}
        printData={printData}
        orientation={orientation}
        selectedDate={selectedDate}
      />
      <ModalMenu
        activeDropdown={activeDropdown}
        setActiveDropdown={setActiveDropdown}
        dataMaterial={dataMaterial}
        masterDb={masterDb}
        handlePrintLabel={handlePrintLabel}
        setOrientation={setOrientation}
        orientation={orientation}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700;800&display=swap');
        body, html, .font-sans, table, th, td, button, input, h1, h2, h3, h4, span, div { font-family: 'Work Sans', sans-serif !important; }
        @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-progress { animation: progress 1.5s infinite linear; }
        div { float: none !important; }
        @media print {
          @page { size: A4 ${printType === "REQ" || (printType === "LABEL" && orientation === "LANDSCAPE") ? "landscape" : "portrait"}; margin: 5mm; }
          body { -webkit-print-color-adjust: exact; }
          .page-break-inside-avoid { page-break-inside: avoid; }
          .grid-cols-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 3mm; }
          .grid-cols-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5mm; }
        }
      `}</style>
    </div>
  );
}

export default App;
