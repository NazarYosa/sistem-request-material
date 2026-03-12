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
} from "firebase/firestore";
import { generateKey, getMarkersFromDate } from "./utils";

// --- IMPORT KOMPONEN ---
import Header from "./components/Header";
import InputView from "./components/InputView";
import ScanView from "./components/ScanView";
import PrintLayout from "./components/PrintLayout";
import ModalMenu from "./components/ModalMenu";

function App() {
  // === 1. STATE MANAGEMENT ===
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

  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA"),
  );

  const [masterDb, setMasterDb] = useState({});
  const [isLoadingDb, setIsLoadingDb] = useState(false);

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

  // === 2. FETCH DATA FIREBASE ===
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

  // === 3. CRUD LOGIC ===
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
    if (inputFormRef.current) {
      inputFormRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
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

  // === 4. EXCEL PROCESSING LOGIC ===
  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;

    const markers = getMarkersFromDate(selectedDate);
    setDataMaterial([]);
    setIsProcessing(true);
    const fileInput = e.target;

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
                if (result.length > 0)
                  extractedData = [...extractedData, ...result];
              }
            });

            if (extractedData.length > 0) {
              const aggregated = aggregateData(extractedData);
              setDataMaterial((prev) => [...prev, ...aggregated]);
            }
          } catch (error) {
            console.error("Error parsing Excel:", error);
            alert("Gagal membaca file Excel. Pastikan format benar.");
          } finally {
            setIsProcessing(false);
            fileInput.value = "";
          }
        };
      });
    }, 800);
  };

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
      const extraData = masterDb[dbKey] || {};
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

  // === 5. PRINT ENGINE 1: REQUEST ===
  const handlePrintRequest = (item) => {
    const dbKey = generateKey(item.partName);
    const extraData = masterDb[dbKey] || {};
    const labels = [];
    const totalPlan = item.totalQty;
    const totalRecycle = item.recycleInput;
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
    setPrintType("REQ");
    setPrintData(labels);
  };

  // const handlePrintAllRequest = () => {
  //   if (!window.confirm("Yakin ingin mencetak SEMUA data?")) return;
  //   let allLabelsAccumulated = [];
  //   dataMaterial.forEach((item) => {
  //     if (item.totalQty > 0) {
  //       const dbKey = generateKey(item.partName);
  //       const extraData = masterDb[dbKey] || {};
  //       const totalPlan = item.totalQty;
  //       const totalRecycle = item.recycleInput || 0;
  //       const netRequest = Math.max(0, totalPlan - totalRecycle);
  //       if (netRequest === 0 && totalRecycle === 0) return;

  //       let totalBox = Math.ceil(totalPlan / 11);
  //       if (totalBox === 0 && totalPlan > 0) totalBox = 1;
  //       const recyclePerBox = Math.floor(totalRecycle / totalBox);
  //       const recycleRemainder = totalRecycle % totalBox;
  //       let remainingPlan = totalPlan;

  //       for (let i = 0; i < totalBox; i++) {
  //         const currentBoxTotal = Math.min(11, remainingPlan);
  //         let currentRecycle = recyclePerBox + (i < recycleRemainder ? 1 : 0);
  //         if (currentRecycle > currentBoxTotal)
  //           currentRecycle = currentBoxTotal;
  //         const currentNet = currentBoxTotal - currentRecycle;
  //         let qtyDisplay = `${currentNet}`;
  //         if (currentRecycle > 0)
  //           qtyDisplay = `${currentNet} + ${currentRecycle}`;
  //         let totalDisplay = `${netRequest}`;
  //         if (totalRecycle > 0)
  //           totalDisplay = `${netRequest} + ${totalRecycle}`;
  //         else totalDisplay = `${totalPlan}`;

  //         allLabelsAccumulated.push({
  //           ...item,
  //           partNameExcel: item.partName,
  //           partNoMain: extraData.partNo || item.partNo,
  //           materialName: extraData.materialName || "-",
  //           partNoMaterial: extraData.partNoMaterial || "-",
  //           materialName2: extraData.materialName2 || "",
  //           partNoMaterial2: extraData.partNoMaterial2 || "",
  //           color: extraData.color || "BLACK",
  //           model: extraData.model || "-",
  //           qtyDisplay: qtyDisplay,
  //           totalDisplay: totalDisplay,
  //           boxKe: i + 1,
  //           totalBox: totalBox,
  //         });
  //         remainingPlan -= currentBoxTotal;
  //       }
  //     }
  //   });

  //   if (allLabelsAccumulated.length === 0) {
  //     alert("Tidak ada data yang perlu di-print (Qty 0 semua).");
  //     return;
  //   }
  //   setPrintType("REQ");
  //   setPrintData(allLabelsAccumulated);
  // };



  // === 6. PRINT ENGINE 2: LABEL (Switch logic) ===
  
  const handlePrintAllRequest = () => {
    if (
      !window.confirm("Yakin ingin mencetak SEMUA data?")
    )
      return;

    let allLabelsAccumulated = [];

    dataMaterial.forEach((item) => {
      // TAMBAHKAN KONDISI: && !item.isExcluded
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
      }
    });

    if (allLabelsAccumulated.length === 0) {
      alert("Tidak ada data yang perlu di-print (semua anomali atau Qty 0).");
      return;
    }

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

  // Group Data untuk UI Dashboard
  const groupedUI = dataMaterial.reduce((acc, item) => {
    if (!acc[item.machine]) acc[item.machine] = [];
    acc[item.machine].push(item);
    return acc;
  }, {});

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-slate-800 font-sans overflow-hidden print:h-auto print:overflow-visible">
      {/* 1. HEADER UTAMA */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        handlePrintAllRequest={handlePrintAllRequest}
        handleFileUpload={handleFileUpload}
        isProcessing={isProcessing}
      />

      {/* 2. BODY UTAMA */}
      <div className="flex-1 overflow-y-auto print:hidden">
        <div className="w-full mx-auto">
          {viewMode === "input" && (
            <div className="p-8">
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
                dbTableMode={dbTableMode}
                setDbTableMode={setDbTableMode}
                handleExportFirebase={handleExportFirebase}
                inputFormRef={inputFormRef}
              />
            </div>
          )}

          {viewMode === "scan" && (
            <div className="w-full bg-slate-50 p-6">
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
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. AREA PRINTING (HIDDEN ON SCREEN) */}
      <PrintLayout
        printType={printType}
        printData={printData}
        orientation={orientation}
        selectedDate={selectedDate}
      />

      {/* 4. MODAL POPUP MENU */}
      <ModalMenu
        activeDropdown={activeDropdown}
        setActiveDropdown={setActiveDropdown}
        dataMaterial={dataMaterial}
        masterDb={masterDb}
        handlePrintLabel={handlePrintLabel}
        setOrientation={setOrientation}
        orientation={orientation}
      />

      {/* STYLE UTAMA (Font & Reset) */}
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
