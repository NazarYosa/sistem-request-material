// src/components/HistoryView.jsx
import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { generateKey } from "../utils";

const HistoryView = ({ db, masterDb }) => {
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("SEMUA");

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "print_history"));
        const data = [];
        querySnapshot.forEach((docSnap) => {
          data.push({ id: docSnap.id, ...docSnap.data() });
        });

        data.sort((a, b) => new Date(b.printDate) - new Date(a.printDate));
        setHistoryData(data);
      } catch (error) {
        console.error("Error mengambil history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [db]);

  const handleDeleteHistory = async (id) => {
    const confirmDelete = window.confirm(
      "Yakin ingin menghapus riwayat ini secara permanen?",
    );
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "print_history", id));
        setHistoryData((prevData) => prevData.filter((item) => item.id !== id));
      } catch (error) {
        alert("Gagal menghapus riwayat.");
      }
    }
  };

  const handleDeleteAllHistory = async () => {
    if (historyData.length === 0) return alert("Tidak ada data untuk dihapus.");
    const confirmDelete = window.confirm(
      "PERINGATAN!\n\nApakah Anda YAKIN ingin menghapus SEMUA riwayat cetak?",
    );
    if (confirmDelete) {
      setIsLoading(true);
      try {
        for (const item of historyData) {
          await deleteDoc(doc(db, "print_history", item.id));
        }
        setHistoryData([]);
        alert("Semua riwayat telah dihapus.");
      } catch (error) {
        alert("Gagal menghapus semua riwayat.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleMonth = (month) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [month]: prev[month] === undefined ? false : !prev[month],
    }));
  };

  const formatMonthYear = (my) => {
    if (!my) return "-";
    const [year, month] = my.split("-");
    const date = new Date(year, month - 1);
    return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  };

  const getMaterialName = (item) => {
    const dbKey = generateKey(item.partName);
    const matData = masterDb ? masterDb[dbKey] : undefined;
    if (matData) {
      if (matData.materialName && matData.materialName2) {
        return `${matData.materialName} & ${matData.materialName2}`;
      }
      if (matData.materialName) return matData.materialName;
    }
    return "MATERIAL TIDAK DIKETAHUI";
  };

  const searchFilteredData = historyData.filter((item) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    const materialName = getMaterialName(item).toLowerCase();
    return (
      materialName.includes(q) ||
      (item.partName && item.partName.toLowerCase().includes(q)) ||
      (item.machine && item.machine.toLowerCase().includes(q))
    );
  });

  const uniqueMaterialsList = Array.from(
    new Set(searchFilteredData.map((item) => getMaterialName(item))),
  ).sort();

  const finalFilteredData = searchFilteredData.filter((item) => {
    if (selectedMaterial === "SEMUA") return true;
    return getMaterialName(item) === selectedMaterial;
  });

  const groupedByMonth = finalFilteredData.reduce((acc, curr) => {
    const key = curr.monthYear || "Lainnya";
    if (!acc[key]) acc[key] = [];
    acc[key].push(curr);
    return acc;
  }, {});

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-8 font-sans text-slate-800">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-6 gap-4">
        <div>
          <h2 className="font-black text-3xl text-slate-900 uppercase tracking-tight">
            History Cetak
          </h2>
          <p className="text-slate-500 text-base mt-1 font-medium tracking-wide">
            Rekapitulasi Pemakaian Material
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-2 w-full lg:w-auto">
          <input
            type="text"
            placeholder="CARI PART / MESIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-72 px-4 py-2.5 text-base bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase"
          />
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 md:flex-none bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold px-5 py-2.5 text-base rounded-lg transition-all uppercase"
            >
              REFRESH
            </button>
            <button
              onClick={handleDeleteAllHistory}
              disabled={historyData.length === 0 || isLoading}
              className="flex-1 md:flex-none bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-bold px-5 py-2.5 text-base rounded-lg border border-red-200 hover:border-transparent transition-all uppercase disabled:opacity-50"
            >
              HAPUS SEMUA
            </button>
          </div>
        </div>
      </div>

      {/* DAFTAR FILTER MATERIAL */}
      {!isLoading && uniqueMaterialsList.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">
            FILTER MATERIAL
          </h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedMaterial("SEMUA")}
              className={`px-4 py-2 text-sm font-bold rounded-full transition-all uppercase ${
                selectedMaterial === "SEMUA"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              SEMUA
            </button>
            {uniqueMaterialsList.map((mat) => (
              <button
                key={mat}
                onClick={() => setSelectedMaterial(mat)}
                className={`px-4 py-2 text-sm font-bold rounded-full transition-all uppercase ${
                  selectedMaterial === mat
                    ? "bg-slate-800 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {mat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CONTENT SECTION */}
      {isLoading ? (
        <div className="text-center py-16">
          <p className="text-slate-500 text-xl font-bold uppercase animate-pulse">
            Memuat Data...
          </p>
        </div>
      ) : Object.keys(groupedByMonth).length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-400 text-xl font-bold uppercase">
            Tidak Ada Riwayat Ditemukan
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(groupedByMonth)
            .sort((a, b) => b.localeCompare(a))
            .map((month) => {
              const monthRecords = groupedByMonth[month];
              const isExpanded = expandedMonths[month] !== false;

              const totalSakBulan = monthRecords.reduce(
                (sum, r) => sum + (r.totalSak || 0),
                0,
              );
              const totalKgBulan = monthRecords.reduce(
                (sum, r) => sum + (r.totalKg || 0),
                0,
              );
              const totalTonBulan = totalKgBulan / 1000;

              const groupedByMaterial = monthRecords.reduce((acc, record) => {
                const materialName = getMaterialName(record);
                if (!acc[materialName]) acc[materialName] = [];
                acc[materialName].push(record);
                return acc;
              }, {});

              return (
                <div
                  key={month}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                >
                  {/* HEADER BULAN */}
                  <div
                    onClick={() => toggleMonth(month)}
                    className="bg-slate-50 hover:bg-slate-100 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer transition-colors border-b border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-black text-slate-400">
                        {isExpanded ? "-" : "+"}
                      </span>
                      <h4 className="font-black text-2xl text-slate-800 uppercase tracking-tight">
                        {formatMonthYear(month)}
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-6 text-base mt-2 md:mt-0">
                      <div className="flex flex-col">
                        <span className="text-slate-400 text-xs font-bold uppercase">
                          Total Sak
                        </span>
                        <span className="text-blue-600 font-black text-xl">
                          {totalSakBulan.toLocaleString("id-ID")} SAK
                        </span>
                      </div>
                      <div className="flex flex-col border-l border-slate-200 pl-6">
                        <span className="text-slate-400 text-xs font-bold uppercase">
                          Total Beban
                        </span>
                        <span className="text-emerald-600 font-black text-xl">
                          {totalKgBulan.toLocaleString("id-ID", {
                            maximumFractionDigits: 1,
                          })}{" "}
                          KG
                          <span className="text-emerald-600/70 text-sm ml-2 font-bold">
                            (
                            {totalTonBulan.toLocaleString("id-ID", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            TON)
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* KONTEN BULAN */}
                  {isExpanded && (
                    <div className="p-6 space-y-8">
                      {Object.keys(groupedByMaterial)
                        .sort()
                        .map((material) => {
                          const matRecords = groupedByMaterial[material];

                          const totalSakMat = matRecords.reduce(
                            (sum, r) => sum + (r.totalSak || 0),
                            0,
                          );
                          const totalKgMat = matRecords.reduce(
                            (sum, r) => sum + (r.totalKg || 0),
                            0,
                          );
                          const totalTonMat = totalKgMat / 1000;

                          return (
                            <div
                              key={material}
                              className="border-b border-slate-200 pb-6 last:border-0 last:pb-0"
                            >
                              {/* HEADER MATERIAL: SIMPLE, NO BG, BIG NUMBERS */}
                              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-4 gap-4">
                                <div>
                                  <span className="text-slate-400 text-xs font-bold tracking-widest uppercase block mb-0.5">
                                    MATERIAL
                                  </span>
                                  <h5 className="font-black text-xl text-slate-800 uppercase tracking-wide">
                                    {material}
                                  </h5>
                                </div>
                                <div className="flex gap-6 items-end">
                                  <div className="flex flex-col items-start lg:items-end">
                                    <span className="text-slate-400 text-xs font-bold uppercase">
                                      Pemakaian
                                    </span>
                                    <span className="font-black text-2xl text-blue-600 leading-none mt-1">
                                      {totalSakMat}{" "}
                                      <span className="text-lg">SAK</span>
                                    </span>
                                  </div>
                                  <div className="flex flex-col items-start lg:items-end border-l border-slate-200 pl-6">
                                    <span className="text-slate-400 text-xs font-bold uppercase">
                                      Beban
                                    </span>
                                    <div className="flex items-baseline gap-2 mt-1">
                                      <span className="font-black text-2xl text-emerald-600 leading-none">
                                        {totalKgMat.toLocaleString("id-ID", {
                                          maximumFractionDigits: 1,
                                        })}{" "}
                                        KG
                                      </span>
                                      <span className="text-emerald-600/70 text-sm font-bold">
                                        (
                                        {totalTonMat.toLocaleString("id-ID", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}{" "}
                                        TON)
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* TABEL CLEAN */}
                              <div className="overflow-x-auto">
                                <table className="w-full text-base text-left">
                                  <thead>
                                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-xs">
                                      <th className="py-3 font-bold w-1/6">
                                        Tgl & Waktu
                                      </th>
                                      <th className="py-3 font-bold w-1/12">
                                        Mesin
                                      </th>
                                      <th className="py-3 font-bold w-2/5">
                                        Part Name & No
                                      </th>
                                      <th className="py-3 font-bold w-1/12 text-center text-blue-500">
                                        SAK
                                      </th>
                                      <th className="py-3 font-bold w-1/6 text-center text-emerald-500">
                                        KG (TON)
                                      </th>
                                      <th className="py-3 font-bold w-1/12 text-center text-orange-400">
                                        REC
                                      </th>
                                      <th className="py-3 font-bold w-1/12 text-right">
                                        AKSI
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {matRecords.map((row) => {
                                      const rowTon = (row.totalKg || 0) / 1000;
                                      return (
                                        <tr
                                          key={row.id}
                                          className="hover:bg-slate-50 transition-colors"
                                        >
                                          <td className="py-3 text-slate-500 whitespace-nowrap text-sm">
                                            {new Date(
                                              row.printDate,
                                            ).toLocaleString("id-ID", {
                                              day: "numeric",
                                              month: "short",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </td>
                                          <td className="py-3 font-black text-slate-700 text-base">
                                            {row.machine}
                                          </td>
                                          <td className="py-3 pr-4">
                                            <div className="font-black text-slate-800 text-base">
                                              {row.partName}
                                            </div>
                                            <div className="text-slate-500 font-medium text-xs mt-0.5">
                                              {row.partNo}
                                            </div>
                                          </td>
                                          <td className="py-3 text-center">
                                            <span className="font-black text-xl text-blue-600">
                                              {row.totalSak}
                                            </span>
                                          </td>
                                          <td className="py-3 text-center">
                                            <div className="font-bold text-emerald-600 text-base">
                                              {row.totalKg.toLocaleString(
                                                "id-ID",
                                                { maximumFractionDigits: 1 },
                                              )}
                                            </div>
                                            <div className="text-slate-400 text-[10px] font-bold">
                                              {rowTon.toLocaleString("id-ID", {
                                                minimumFractionDigits: 3,
                                                maximumFractionDigits: 3,
                                              })}{" "}
                                              t
                                            </div>
                                          </td>
                                          <td className="py-3 text-center font-bold text-orange-500 text-base">
                                            {row.recycle > 0
                                              ? row.recycle
                                              : "-"}
                                          </td>
                                          <td className="py-3 text-right">
                                            <button
                                              onClick={() =>
                                                handleDeleteHistory(row.id)
                                              }
                                              className="text-slate-400 hover:text-red-500 font-bold text-xs uppercase px-2 py-1 rounded hover:bg-red-50 transition-all"
                                            >
                                              HAPUS
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
