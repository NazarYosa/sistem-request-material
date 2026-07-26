// src/components/StockDashboardView.jsx
import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { collection, onSnapshot } from "firebase/firestore";
import { generateFirebaseKey } from "./dashboardUtils";
import HeaderInfo from "./HeaderInfo";
import StockTable from "./StockTable";
import FooterNav from "./FooterNav";

const getKolomDariAngka = (angkaKolom) => {
  let columnLetter = "";
  let colNumber = angkaKolom;
  while (colNumber > 0) {
    let modulo = (colNumber - 1) % 26;
    columnLetter = String.fromCharCode(65 + modulo) + columnLetter;
    colNumber = Math.floor((colNumber - modulo) / 26);
  }
  return columnLetter;
};

const formatWaktuExcel = (nilaiExcel) => {
  if (nilaiExcel === undefined || nilaiExcel === null || nilaiExcel === "")
    return "-";
  if (typeof nilaiExcel === "string" && nilaiExcel.includes(":"))
    return nilaiExcel;
  const angka = Number(nilaiExcel);
  if (!isNaN(angka)) {
    const totalDetik = Math.round(angka * 24 * 60 * 60);
    const jam = Math.floor(totalDetik / 3600) % 24;
    const menit = Math.floor((totalDetik % 3600) / 60);
    return `${jam.toString().padStart(2, "0")}:${menit.toString().padStart(2, "0")}`;
  }
  return nilaiExcel;
};

const getTanggalProduksiSekarang = (waktuSaatIni = new Date()) => {
  const jam = waktuSaatIni.getHours();
  const menit = waktuSaatIni.getMinutes();
  if (jam < 7 || (jam === 7 && menit < 30)) {
    let kemarin = new Date(waktuSaatIni);
    kemarin.setDate(kemarin.getDate() - 1);
    return kemarin.getDate();
  }
  return waktuSaatIni.getDate();
};

const DAFTAR_MESIN = [
  "2500", "2000", "1800", "1600", "1300", "350 A", "350 B", "230", "50", "650",
];

// db & masterDb dikirim dari App.jsx (koneksi & cache yang sama, gak fetch ulang)
// kiosk = true -> mode TV/layar dedicated (full-screen, auto-refresh 07:30)
// kiosk = false -> mode biasa, tampil sebagai salah satu menu di Sidebar
export default function StockDashboardView({ db, masterDb, kiosk = false }) {
  const [activeMachine, setActiveMachine] = useState("2500");
  const [dataJadwalBulanan, setDataJadwalBulanan] = useState([]);
  const [liveStock, setLiveStock] = useState({});
  const [tanggalAktif] = useState(getTanggalProduksiSekarang());
  const [syncStatus, setSyncStatus] = useState("OFFLINE");

  // Ubah masterDb (object dari App.jsx) jadi array, format yang dipakai komponen dashboard
  const masterParts = useMemo(() => {
    return Object.entries(masterDb || {}).map(([id, data]) => ({
      id,
      ...data,
    }));
  }, [masterDb]);

  // AUTO REFRESH 07:30 — cuma aktif kalau ini mode kiosk/TV dedicated
  useEffect(() => {
    if (!kiosk) return;
    const calculateTimeToRefresh = () => {
      const now = new Date();
      const refreshTime = new Date();
      refreshTime.setHours(7, 30, 0, 0);
      if (now.getTime() > refreshTime.getTime()) {
        refreshTime.setDate(refreshTime.getDate() + 1);
      }
      return refreshTime.getTime() - now.getTime();
    };
    const timer = setTimeout(() => {
      window.location.reload();
    }, calculateTimeToRefresh());
    return () => clearTimeout(timer);
  }, [kiosk]);

  // PANTAU LIVE STOCK REAL-TIME (hanya aktif selama komponen ini mounted)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "live_stock"), (snapshot) => {
      const stockData = {};
      snapshot.forEach((doc) => {
        stockData[doc.id] = doc.data();
      });
      setLiveStock(stockData);
    });
    return () => unsub();
  }, [db]);

  const handleImportExcel = async () => {
    if (window.showOpenFilePicker) {
      try {
        const [handle] = await window.showOpenFilePicker({
          types: [
            {
              description: "Excel Files",
              accept: {
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                  [".xlsx"],
              },
            },
          ],
          multiple: false,
        });
        const file = await handle.getFile();
        setSyncStatus("UPLOADING");
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target.result;
            const workbook = XLSX.read(arrayBuffer, { type: "array" });
            let hasilFilterBersih = [];
            DAFTAR_MESIN.forEach((mesin) => {
              const sheet = workbook.Sheets[mesin];
              if (!sheet) return;
              const sheetData = XLSX.utils.sheet_to_json(sheet, {
                header: "A",
              });
              const bersihkanNama = (nama) =>
                nama
                  ? nama.toString().toUpperCase().replace(/[^A-Z0-9]/g, "")
                  : "";
              for (let tgl = 1; tgl <= 31; tgl++) {
                const baseCol = 19 + (tgl - 1) * 7;
                const colPlan = getKolomDariAngka(baseCol);
                const colNo = getKolomDariAngka(baseCol + 1);
                const colStart = getKolomDariAngka(baseCol + 3);
                const colFinish = getKolomDariAngka(baseCol + 6);
                for (let i = 8; i < sheetData.length; i += 6) {
                  const rowPart = sheetData[i];
                  if (!rowPart) break;
                  const namaPartAsli = rowPart["N"]
                    ? rowPart["N"].toString()
                    : "";
                  if (bersihkanNama(namaPartAsli) === "") break;
                  [{ r: i }, { r: i + 2 }, { r: i + 4 }].forEach((s) => {
                    const row = sheetData[s.r];
                    const qty =
                      row && row[colPlan]
                        ? row[colPlan].toString().trim()
                        : "";
                    const noUrut =
                      row && row[colNo] ? row[colNo].toString().trim() : "";
                    if (qty !== "" || noUrut !== "") {
                      hasilFilterBersih.push({
                        tanggal: tgl,
                        mesin,
                        namaPart: namaPartAsli,
                        noUtama: noUrut || "-",
                        qty: qty || "-",
                        start:
                          row && row[colStart] !== undefined
                            ? formatWaktuExcel(row[colStart])
                            : "-",
                        finish:
                          row && row[colFinish] !== undefined
                            ? formatWaktuExcel(row[colFinish])
                            : "-",
                      });
                    }
                  });
                }
              }
            });
            setDataJadwalBulanan(hasilFilterBersih);
            setSyncStatus("SUCCESS");
            setTimeout(() => setSyncStatus("OFFLINE"), 3000);
          } catch (err) {
            console.error(err);
            setSyncStatus("ERROR");
          }
        };
        reader.readAsArrayBuffer(file);
      } catch (err) {
        console.log("Batal.");
      }
    } else {
      alert("Browser tidak mendukung auto-sync file picker lokal.");
    }
  };

  const jadwalMesinAktif = useMemo(() => {
    const saring = dataJadwalBulanan.filter(
      (item) => item.tanggal === tanggalAktif && item.mesin === activeMachine,
    );
    saring.sort((a, b) => {
      const noA = parseInt(a.noUtama),
        noB = parseInt(b.noUtama);
      return !isNaN(noA) && !isNaN(noB) ? noA - noB : 0;
    });
    return saring;
  }, [dataJadwalBulanan, tanggalAktif, activeMachine]);

  const jadwalEnriched = useMemo(() => {
    return jadwalMesinAktif.map((excelItem) => {
      const searchKey = generateFirebaseKey(excelItem.namaPart);
      const matchedMasterData = masterParts.find((fb) => fb.id === searchKey);
      return { ...excelItem, firebaseData: matchedMasterData || null };
    });
  }, [jadwalMesinAktif, masterParts]);

  const stokMesinAktif = useMemo(() => {
    return masterParts
      .filter((part) => {
        const mesinPart = part.mesin ? part.mesin.toString() : "";
        const mesinAktif = activeMachine ? activeMachine.toString() : "";
        return mesinPart === mesinAktif;
      })
      .map((part) => {
        const actualStock = liveStock[part.id] || {};
        return {
          ...part,
          qtyActRight: actualStock.qtyActRight || 0,
          qtyActLeft: actualStock.qtyActLeft || 0,
          qtyActSingle: actualStock.qtyActSingle || 0,
        };
      });
  }, [masterParts, liveStock, activeMachine]);

  return (
    <div
      className={`w-full bg-slate-100 flex flex-col overflow-hidden font-sans text-slate-800 ${
        kiosk ? "h-screen" : "h-[calc(100vh-4rem)] md:h-screen"
      }`}
    >
      <div className="flex-none px-3 pt-3 pb-1">
        <HeaderInfo
          db={db}
          activeMachine={activeMachine}
          jadwalMesin={jadwalEnriched}
        />
      </div>

      <div className="flex-1 overflow-hidden px-3 pb-2 flex flex-col">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
          <div className="bg-slate-800 text-white px-4 py-1.5 flex justify-between items-center rounded-t-xl">
            <h2 className="text-sm font-bold tracking-wider">
              STATUS STOK TODAY
            </h2>
            <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full text-slate-200">
              Mesin {activeMachine}
            </span>
          </div>
          <div className="flex-1 overflow-hidden p-2">
            <StockTable data={stokMesinAktif} />
          </div>
        </div>
      </div>

      <div className="flex-none bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <FooterNav
          machines={DAFTAR_MESIN}
          activeMachine={activeMachine}
          setActiveMachine={setActiveMachine}
          onImportExcel={handleImportExcel}
          syncStatus={syncStatus}
        />
      </div>
    </div>
  );
}
