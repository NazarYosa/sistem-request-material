// // src/components/MasterTable.jsx
// import React, { useState } from "react";

// const MasterTable = ({
//   masterDb,
//   searchTerm,
//   dbTableMode,
//   handleEditDb,
//   handleDeleteDb,
// }) => {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);

//   // A. Filter Search Global
//   const filteredData = Object.entries(masterDb)
//     .filter(([key, item]) => {
//       if (!searchTerm) return true;
//       const q = searchTerm.toLowerCase();
//       const allDataString = Object.values(item)
//         .map((val) => String(val || "").toLowerCase())
//         .join(" ");
//       return allDataString.includes(q);
//     })
//     .sort((a, b) => a[1].partName.localeCompare(b[1].partName));

//   // B. Logic Pagination
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);

//   if (filteredData.length === 0) {
//     return (
//       <div className="p-12 text-center text-black italic bg-white border border-gray-200 rounded-xl">
//         <div className="mb-2 text-2xl">📂</div>
//         {searchTerm
//           ? "Tidak ada data yang cocok."
//           : "Belum ada data part yang tersimpan."}
//       </div>
//     );
//   }

//   return (
//     <div className="overflow-hidden border border-black/10 rounded-xl shadow-sm bg-white flex flex-col">
//       <div className="overflow-x-auto h-[600px] flex flex-col justify-between">
//         <table className="w-full text-sm text-left border-collapse whitespace-nowrap font-sans mb-0">
//           {/* HEADER TABEL */}
//           <thead className="bg-white text-black sticky top-0 z-20 shadow-sm ring-1 ring-black/5">
//             <tr className="uppercase text-xs tracking-wider font-extrabold">
//               <th className="px-4 py-4 w-12 text-center bg-gray-50 border-b border-gray-200">
//                 No
//               </th>
//               <th className="px-4 py-4 min-w-[220px] bg-gray-50 border-b border-gray-200">
//                 Part Name (Key)
//               </th>

//               {/* LOGIC KOLOM BERDASARKAN MODE */}
//               {dbTableMode === "REQ" && (
//                 <>
//                   <th className="px-4 py-4 bg-gray-50 border-b border-gray-200">
//                     Part No
//                   </th>
//                   <th className="px-4 py-4 bg-gray-50 border-b border-l border-gray-200">
//                     Mat 1
//                   </th>
//                   <th className="px-4 py-4 bg-gray-50 border-b border-gray-200">
//                     No. Mat 1
//                   </th>
//                   <th className="px-4 py-4 bg-gray-50 border-b border-l border-gray-200">
//                     Mat 2
//                   </th>
//                   <th className="px-4 py-4 bg-gray-50 border-b border-gray-200">
//                     No. Mat 2
//                   </th>
//                   <th className="px-4 py-4 bg-gray-50 border-b text-center border-l border-gray-200">
//                     Berat
//                   </th>
//                 </>
//               )}

//               {/* KOLOM LABEL GEN */}
//               {dbTableMode === "LABEL_GEN" && (
//                 <>
//                   <th className="px-4 py-4 bg-gray-50 border-b border-l border-gray-200">
//                     Part Name HGS (Gen)
//                   </th>
//                   <th className="px-4 py-4 bg-gray-50 border-b border-l border-gray-200">
//                     Part No HGS (Gen)
//                   </th>
//                   <th className="px-4 py-4 bg-gray-50 border-b border-l border-gray-200">
//                     FG (Gen)
//                   </th>
//                 </>
//               )}

//               {/* KOLOM LABEL ASSY */}
//               {dbTableMode === "LABEL_ASSY_GEN" && (
//                 <>
//                   <th className="px-4 py-4 bg-orange-50 text-orange-900 border-b border-l border-orange-200">
//                     Assy Name (Gen)
//                   </th>
//                   <th className="px-4 py-4 bg-orange-50 text-orange-900 border-b border-l border-orange-200">
//                     Assy HGS (Gen)
//                   </th>
//                   <th className="px-4 py-4 bg-orange-50 text-orange-900 border-b border-l border-orange-200">
//                     Assy FG (Gen)
//                   </th>
//                 </>
//               )}
//               {dbTableMode === "LABEL_ASSY_L" && (
//                 <>
//                   <th className="px-4 py-4 bg-orange-100 text-orange-900 border-b border-l border-orange-300">
//                     Assy Name (L)
//                   </th>
//                   <th className="px-4 py-4 bg-orange-100 text-orange-900 border-b border-l border-orange-300">
//                     Assy HGS (L)
//                   </th>
//                   <th className="px-4 py-4 bg-orange-100 text-orange-900 border-b border-l border-orange-300">
//                     Assy FG (L)
//                   </th>
//                 </>
//               )}
//               {dbTableMode === "LABEL_ASSY_R" && (
//                 <>
//                   <th className="px-4 py-4 bg-orange-100 text-orange-900 border-b border-l border-orange-300">
//                     Assy Name (R)
//                   </th>
//                   <th className="px-4 py-4 bg-orange-100 text-orange-900 border-b border-l border-orange-300">
//                     Assy HGS (R)
//                   </th>
//                   <th className="px-4 py-4 bg-orange-100 text-orange-900 border-b border-l border-orange-300">
//                     Assy FG (R)
//                   </th>
//                 </>
//               )}

//               {/* KOLOM LABEL TAG */}
//               {dbTableMode === "LABEL_L" && (
//                 <>
//                   <th className="px-4 py-4 bg-yellow-50 text-yellow-900 border-b border-l border-yellow-200">
//                     HGS Name (Left)
//                   </th>
//                   <th className="px-4 py-4 bg-yellow-50 text-yellow-900 border-b border-l border-yellow-200">
//                     HGS No (Left)
//                   </th>
//                   <th className="px-4 py-4 bg-yellow-50 text-yellow-900 border-b border-l border-yellow-200">
//                     FG Name (Left)
//                   </th>
//                   <th className="px-4 py-4 bg-yellow-50 text-yellow-900 border-b border-l border-yellow-200">
//                     FG No (Left)
//                   </th>
//                 </>
//               )}
//               {dbTableMode === "LABEL_R" && (
//                 <>
//                   <th className="px-4 py-4 bg-sky-50 text-sky-900 border-b border-l border-sky-200">
//                     HGS Name (Right)
//                   </th>
//                   <th className="px-4 py-4 bg-sky-50 text-sky-900 border-b border-l border-sky-200">
//                     HGS No (Right)
//                   </th>
//                   <th className="px-4 py-4 bg-sky-50 text-sky-900 border-b border-l border-sky-200">
//                     FG Name (Right)
//                   </th>
//                   <th className="px-4 py-4 bg-sky-50 text-sky-900 border-b border-l border-sky-200">
//                     FG No (Right)
//                   </th>
//                 </>
//               )}

//               {dbTableMode !== "REQ" && (
//                 <>
//                   <th className="px-4 py-4 bg-indigo-50 text-indigo-900 border-b border-l border-indigo-200 text-center w-24">
//                     Qty/Box
//                   </th>
//                   <th className="px-4 py-4 bg-gray-50 border-b text-center border-l border-gray-200">
//                     Berat
//                   </th>
//                   <th className="px-4 py-4 bg-gray-50 border-b border-gray-200 text-center">
//                     QR
//                   </th>
//                   <th className="px-4 py-4 bg-gray-50 border-b border-gray-200 text-center">
//                     Foto
//                   </th>
//                 </>
//               )}

//               <th className="px-4 py-4 bg-gray-50 border-b border-gray-200 text-center sticky right-0 z-30 shadow-l">
//                 Opsi
//               </th>
//             </tr>
//           </thead>

//           {/* BODY TABEL */}
//           <tbody className="divide-y divide-gray-200">
//             {currentItems.map(([key, item], index) => {
//               const realIndex = indexOfFirstItem + index + 1;
//               const isOddRow = index % 2 !== 0;
//               const rowClass = isOddRow ? "bg-gray-100" : "bg-white";

//               // Logic Gambar Dinamis
//               let displayQr = "";
//               let displayImg = "";
//               if (dbTableMode === "LABEL_GEN") {
//                 displayQr = item.qrHgs;
//                 displayImg = item.imgHgs;
//               } else if (dbTableMode === "LABEL_ASSY_GEN") {
//                 displayQr = item.qrAssy;
//                 displayImg = item.imgAssy;
//               } else if (dbTableMode === "LABEL_ASSY_L") {
//                 displayQr = item.qrAssyL;
//                 displayImg = item.imgAssyL;
//               } else if (dbTableMode === "LABEL_ASSY_R") {
//                 displayQr = item.qrAssyR;
//                 displayImg = item.imgAssyR;
//               } else if (dbTableMode === "LABEL_L") {
//                 displayQr = item.qrTagL;
//                 displayImg = item.imgTagL;
//               } else if (dbTableMode === "LABEL_R") {
//                 displayQr = item.qrTagR;
//                 displayImg = item.imgTagR;
//               } else {
//                 displayQr = item.qrHgs;
//                 displayImg = item.imgHgs;
//               }

//               return (
//                 <tr
//                   key={key}
//                   className={`${rowClass} hover:bg-blue-100 transition-colors group`}
//                 >
//                   <td className="px-4 py-4 text-center text-black font-bold text-xs">
//                     {realIndex}
//                   </td>
//                   <td className="px-4 py-4 font-bold text-black">
//                     {item.partName}
//                   </td>

//                   {/* ISI REQ */}
//                   {dbTableMode === "REQ" && (
//                     <>
//                       <td className="px-4 py-4 font-medium text-black">
//                         {item.partNo}
//                       </td>
//                       <td className="px-4 py-4 text-black border-l border-gray-200">
//                         {item.materialName || "-"}
//                       </td>
//                       <td className="px-4 py-4 text-black text-xs font-medium">
//                         {item.partNoMaterial || "-"}
//                       </td>
//                       <td className="px-4 py-4 text-black border-l border-gray-200">
//                         {item.materialName2 || "-"}
//                       </td>
//                       <td className="px-4 py-4 text-black text-xs font-medium">
//                         {item.partNoMaterial2 || "-"}
//                       </td>
//                       <td className="px-4 py-4 text-center font-bold text-black border-l border-gray-200">
//                         {item.weight || "-"}
//                       </td>
//                     </>
//                   )}

//                   {/* ISI LABEL GEN */}
//                   {dbTableMode === "LABEL_GEN" && (
//                     <>
//                       <td className="px-4 py-4 text-black border-l border-gray-200 font-bold">
//                         {item.partNameHgs || "-"}
//                       </td>
//                       <td className="px-4 py-4 text-black border-l border-gray-200">
//                         {item.partNoHgs || "-"}
//                       </td>
//                       <td className="px-4 py-4 text-black border-l border-gray-200">
//                         {item.finishGood || "-"}
//                       </td>
//                     </>
//                   )}

//                   {/* ISI LABEL ASSY */}
//                   {dbTableMode === "LABEL_ASSY_GEN" && (
//                     <>
//                       <td className="px-4 py-4 text-orange-700 font-bold border-l border-orange-100 bg-orange-50/30">
//                         {item.partAssyName || "-"}
//                       </td>
//                       <td className="px-4 py-4 text-orange-700 font-bold border-l border-orange-100 bg-orange-50/30">
//                         {item.partAssyHgs || "-"}
//                       </td>
//                       <td className="px-4 py-4 text-orange-700 font-bold border-l border-orange-100 bg-orange-50/30">
//                         {item.partAssyFg || "-"}
//                       </td>
//                     </>
//                   )}
//                   {dbTableMode === "LABEL_ASSY_L" && (
//                     <>
//                       <td className="px-4 py-4 text-orange-900 font-bold border-l border-orange-200 bg-orange-100/50">
//                         {item.partAssyNameLeft || "-"}
//                       </td>
//                       <td className="px-4 py-4 text-orange-900 font-bold border-l border-orange-200 bg-orange-100/50">
//                         {item.partAssyHgsLeft || "-"}
//                       </td>
//                       <td className="px-4 py-4 text-orange-900 font-bold border-l border-orange-200 bg-orange-100/50">
//                         {item.partAssyFgLeft || "-"}
//                       </td>
//                     </>
//                   )}
//                   {dbTableMode === "LABEL_ASSY_R" && (
//                     <>
//                       <td className="px-4 py-4 text-orange-900 font-bold border-l border-orange-200 bg-orange-100/50">
//                         {item.partAssyNameRight || "-"}
//                       </td>
//                       <td className="px-4 py-4 text-orange-900 font-bold border-l border-orange-200 bg-orange-100/50">
//                         {item.partAssyHgsRight || "-"}
//                       </td>
//                       <td className="px-4 py-4 text-orange-900 font-bold border-l border-orange-200 bg-orange-100/50">
//                         {item.partAssyFgRight || "-"}
//                       </td>
//                     </>
//                   )}

//                   {/* ISI LABEL TAG */}
//                   {dbTableMode === "LABEL_L" && (
//                     <>
//                       <td className="px-4 py-4 text-yellow-800 font-bold border-l border-yellow-100 bg-yellow-50/30">
//                         {item.partNameHgsLeft || "-"}
//                       </td>
//                       <td className="px-4 py-4 text-yellow-800 font-bold border-l border-yellow-100 bg-yellow-50/30">
//                         {item.partNoHgsLeft || "-"}
//                       </td>
//                       <td className="px-4 py-4 text-black border-l border-yellow-100">
//                         {item.finishGoodNameLeft || "-"}
//                       </td>
//                       <td className="px-4 py-4 text-black border-l border-yellow-100">
//                         {item.finishGoodLeft || "-"}
//                       </td>
//                     </>
//                   )}
//                   {dbTableMode === "LABEL_R" && (
//                     <>
//                       <td className="px-4 py-4 text-sky-800 font-bold border-l border-sky-100 bg-sky-50/30">
//                         {item.partNameHgsRight || "-"}
//                       </td>
//                       <td className="px-4 py-4 text-sky-800 font-bold border-l border-sky-100 bg-sky-50/30">
//                         {item.partNoHgsRight || "-"}
//                       </td>
//                       <td className="px-4 py-4 text-black border-l border-sky-100">
//                         {item.finishGoodNameRight || "-"}
//                       </td>
//                       <td className="px-4 py-4 text-black border-l border-sky-100">
//                         {item.finishGoodRight || "-"}
//                       </td>
//                     </>
//                   )}

//                   {dbTableMode !== "REQ" && (
//                     <>
//                       <td className="px-4 py-4 text-center font-black text-indigo-700 border-l border-indigo-100 bg-indigo-50/30 text-lg">
//                         {item.stdQty || "-"}
//                       </td>
//                       <td className="px-4 py-4 text-center font-bold text-black border-l border-gray-200">
//                         {item.weight || "-"}
//                       </td>
//                       <td className="px-4 py-4 text-center">
//                         <div className="flex justify-center">
//                           {displayQr ? (
//                             <img
//                               src={displayQr}
//                               alt="QR"
//                               className="h-10 w-10 object-contain border border-gray-300 rounded bg-white p-0.5"
//                             />
//                           ) : (
//                             <span className="text-gray-300 text-xs">-</span>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-4 py-4 text-center">
//                         <div className="flex justify-center">
//                           {displayImg ? (
//                             <img
//                               src={displayImg}
//                               alt="IMG"
//                               className="h-10 w-10 object-contain border border-gray-300 rounded bg-white p-0.5"
//                             />
//                           ) : (
//                             <span className="text-gray-300 text-xs">-</span>
//                           )}
//                         </div>
//                       </td>
//                     </>
//                   )}

//                   <td
//                     className={`px-4 py-4 text-center sticky right-0 z-10 shadow-l ${rowClass} group-hover:bg-blue-100`}
//                   >
//                     <div className="flex justify-center gap-2">
//                       <button
//                         onClick={() => handleEditDb(key)}
//                         className="text-blue-600 hover:text-blue-800 font-bold p-1"
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleDeleteDb(key)}
//                         className="text-red-600 hover:text-red-800 font-bold p-1"
//                       >
//                         Hapus
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       {/* PAGINATION CONTROLS */}
//       <div className="bg-white sticky bottom-0 z-30 shadow-inner border-t-2 border-gray-100 px-4 py-3">
//         <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//           <div className="text-xs text-gray-500 font-medium">
//             Menampilkan <strong>{indexOfFirstItem + 1}</strong> -{" "}
//             <strong>{Math.min(indexOfLastItem, filteredData.length)}</strong>{" "}
//             dari <strong>{filteredData.length}</strong> data
//           </div>
//           <div className="flex items-center gap-3">
//             <div className="flex items-center bg-white border border-gray-300 rounded-md overflow-hidden shadow-sm">
//               <button
//                 onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                 disabled={currentPage === 1}
//                 className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40 border-r border-gray-200"
//               >
//                 ◀ Prev
//               </button>
//               <span className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50">
//                 {currentPage} / {totalPages}
//               </span>
//               <button
//                 onClick={() =>
//                   setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//                 }
//                 disabled={currentPage === totalPages}
//                 className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40 border-l border-gray-200"
//               >
//                 Next ▶
//               </button>
//             </div>
//             <select
//               value={itemsPerPage}
//               onChange={(e) => {
//                 setItemsPerPage(Number(e.target.value));
//                 setCurrentPage(1);
//               }}
//               className="text-xs font-bold border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-700 cursor-pointer"
//             >
//               <option value="5">5 baris</option>
//               <option value="10">10 baris</option>
//               <option value="20">20 baris</option>
//               <option value="50">50 baris</option>
//               <option value="100">100 baris</option>
//             </select>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MasterTable;


// src/components/MasterTable.jsx
import React, { useState } from "react";

const MasterTable = ({
  masterDb,
  searchTerm,
  dbTableMode,
  handleEditDb,
  handleDeleteDb,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // A. Filter Search Global
  const filteredData = Object.entries(masterDb)
    .filter(([key, item]) => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      const allDataString = Object.values(item)
        .map((val) => String(val || "").toLowerCase())
        .join(" ");
      return allDataString.includes(q);
    })
    .sort((a, b) => a[1].partName.localeCompare(b[1].partName));

  // B. Logic Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  if (filteredData.length === 0) {
    return (
      <div className="p-12 text-center text-slate-800 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
        <div className="mb-3 text-4xl opacity-50 grayscale">📂</div>
        <p className="font-black uppercase tracking-widest text-sm">
          {searchTerm
            ? "Tidak ada data yang cocok"
            : "Belum ada data part tersimpan"}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-slate-200 rounded-xl shadow-sm bg-white flex flex-col mt-2">
      <div className="overflow-x-auto min-h-[400px] max-h-[600px] custom-scrollbar flex flex-col justify-between">
        <table className="w-full text-sm text-left border-collapse whitespace-nowrap mb-0">
          {/* HEADER TABEL */}
          <thead className="bg-slate-100 text-slate-600 sticky top-0 z-20 shadow-sm ring-1 ring-slate-200">
            <tr className="uppercase text-[10px] tracking-widest font-black">
              <th className="px-4 py-4 w-12 text-center border-b border-slate-300">
                No
              </th>
              <th className="px-4 py-4 min-w-[220px] border-b border-slate-300">
                Part Name (Key)
              </th>

              {/* LOGIC KOLOM BERDASARKAN MODE */}
              {dbTableMode === "REQ" && (
                <>
                  <th className="px-4 py-4 border-b border-slate-300">Part No</th>
                  <th className="px-4 py-4 border-b border-l border-slate-300">Mat 1</th>
                  <th className="px-4 py-4 border-b border-slate-300">No. Mat 1</th>
                  <th className="px-4 py-4 border-b border-l border-slate-300">Mat 2</th>
                  <th className="px-4 py-4 border-b border-slate-300">No. Mat 2</th>
                  <th className="px-4 py-4 border-b text-center border-l border-slate-300">Berat</th>
                </>
              )}

              {/* KOLOM LABEL GEN */}
              {dbTableMode === "LABEL_GEN" && (
                <>
                  <th className="px-4 py-4 border-b border-l border-slate-300">Part Name HGS (Gen)</th>
                  <th className="px-4 py-4 border-b border-l border-slate-300">Part No HGS (Gen)</th>
                  <th className="px-4 py-4 border-b border-l border-slate-300">FG (Gen)</th>
                </>
              )}

              {/* KOLOM LABEL ASSY */}
              {dbTableMode === "LABEL_ASSY_GEN" && (
                <>
                  <th className="px-4 py-4 bg-orange-100/80 text-orange-900 border-b border-l border-orange-200">Assy Name (Gen)</th>
                  <th className="px-4 py-4 bg-orange-100/80 text-orange-900 border-b border-l border-orange-200">Assy HGS (Gen)</th>
                  <th className="px-4 py-4 bg-orange-100/80 text-orange-900 border-b border-l border-orange-200">Assy FG (Gen)</th>
                </>
              )}
              {dbTableMode === "LABEL_ASSY_L" && (
                <>
                  <th className="px-4 py-4 bg-orange-100/80 text-orange-900 border-b border-l border-orange-300">Assy Name (L)</th>
                  <th className="px-4 py-4 bg-orange-100/80 text-orange-900 border-b border-l border-orange-300">Assy HGS (L)</th>
                  <th className="px-4 py-4 bg-orange-100/80 text-orange-900 border-b border-l border-orange-300">Assy FG (L)</th>
                </>
              )}
              {dbTableMode === "LABEL_ASSY_R" && (
                <>
                  <th className="px-4 py-4 bg-orange-100/80 text-orange-900 border-b border-l border-orange-300">Assy Name (R)</th>
                  <th className="px-4 py-4 bg-orange-100/80 text-orange-900 border-b border-l border-orange-300">Assy HGS (R)</th>
                  <th className="px-4 py-4 bg-orange-100/80 text-orange-900 border-b border-l border-orange-300">Assy FG (R)</th>
                </>
              )}

              {/* KOLOM LABEL TAG */}
              {dbTableMode === "LABEL_L" && (
                <>
                  <th className="px-4 py-4 bg-yellow-100/80 text-yellow-900 border-b border-l border-yellow-200">HGS Name (Left)</th>
                  <th className="px-4 py-4 bg-yellow-100/80 text-yellow-900 border-b border-l border-yellow-200">HGS No (Left)</th>
                  <th className="px-4 py-4 bg-yellow-100/80 text-yellow-900 border-b border-l border-yellow-200">FG Name (Left)</th>
                  <th className="px-4 py-4 bg-yellow-100/80 text-yellow-900 border-b border-l border-yellow-200">FG No (Left)</th>
                </>
              )}
              {dbTableMode === "LABEL_R" && (
                <>
                  <th className="px-4 py-4 bg-sky-100/80 text-sky-900 border-b border-l border-sky-200">HGS Name (Right)</th>
                  <th className="px-4 py-4 bg-sky-100/80 text-sky-900 border-b border-l border-sky-200">HGS No (Right)</th>
                  <th className="px-4 py-4 bg-sky-100/80 text-sky-900 border-b border-l border-sky-200">FG Name (Right)</th>
                  <th className="px-4 py-4 bg-sky-100/80 text-sky-900 border-b border-l border-sky-200">FG No (Right)</th>
                </>
              )}

              {dbTableMode !== "REQ" && (
                <>
                  <th className="px-4 py-4 bg-indigo-50 text-indigo-900 border-b border-l border-indigo-200 text-center w-24">Qty/Box</th>
                  <th className="px-4 py-4 border-b text-center border-l border-slate-300 bg-slate-100">Berat</th>
                  <th className="px-4 py-4 border-b border-slate-300 text-center bg-slate-100">QR</th>
                  <th className="px-4 py-4 border-b border-slate-300 text-center bg-slate-100">Foto</th>
                </>
              )}

              <th className="px-4 py-4 bg-slate-200 border-b border-slate-300 text-center sticky right-0 z-30 shadow-sm text-slate-800">
                Opsi
              </th>
            </tr>
          </thead>

          {/* BODY TABEL */}
          <tbody className="divide-y divide-slate-200 bg-white">
            {currentItems.map(([key, item], index) => {
              const realIndex = indexOfFirstItem + index + 1;
              const isOddRow = index % 2 !== 0;
              const rowClass = isOddRow ? "bg-slate-50/50" : "bg-white";

              // Logic Gambar Dinamis
              let displayQr = "";
              let displayImg = "";
              if (dbTableMode === "LABEL_GEN") {
                displayQr = item.qrHgs; displayImg = item.imgHgs;
              } else if (dbTableMode === "LABEL_ASSY_GEN") {
                displayQr = item.qrAssy; displayImg = item.imgAssy;
              } else if (dbTableMode === "LABEL_ASSY_L") {
                displayQr = item.qrAssyL; displayImg = item.imgAssyL;
              } else if (dbTableMode === "LABEL_ASSY_R") {
                displayQr = item.qrAssyR; displayImg = item.imgAssyR;
              } else if (dbTableMode === "LABEL_L") {
                displayQr = item.qrTagL; displayImg = item.imgTagL;
              } else if (dbTableMode === "LABEL_R") {
                displayQr = item.qrTagR; displayImg = item.imgTagR;
              } else {
                displayQr = item.qrHgs; displayImg = item.imgHgs;
              }

              return (
                <tr
                  key={key}
                  className={`${rowClass} hover:bg-slate-100 transition-colors group`}
                >
                  <td className="px-4 py-4 text-center text-slate-400 font-bold text-xs">
                    {realIndex}
                  </td>
                  <td className="px-4 py-4 font-black text-slate-900 uppercase">
                    {item.partName}
                  </td>

                  {/* ISI REQ */}
                  {dbTableMode === "REQ" && (
                    <>
                      <td className="px-4 py-4 font-bold text-slate-600">{item.partNo || "-"}</td>
                      <td className="px-4 py-4 text-slate-800 border-l border-slate-200 font-bold uppercase">{item.materialName || "-"}</td>
                      <td className="px-4 py-4 text-slate-600 text-xs font-bold">{item.partNoMaterial || "-"}</td>
                      <td className="px-4 py-4 text-slate-800 border-l border-slate-200 font-bold uppercase">{item.materialName2 || "-"}</td>
                      <td className="px-4 py-4 text-slate-600 text-xs font-bold">{item.partNoMaterial2 || "-"}</td>
                      <td className="px-4 py-4 text-center font-black text-slate-900 border-l border-slate-200">{item.weight || "-"}</td>
                    </>
                  )}

                  {/* ISI LABEL GEN */}
                  {dbTableMode === "LABEL_GEN" && (
                    <>
                      <td className="px-4 py-4 text-slate-800 border-l border-slate-200 font-bold uppercase">{item.partNameHgs || "-"}</td>
                      <td className="px-4 py-4 text-slate-800 border-l border-slate-200 font-bold uppercase">{item.partNoHgs || "-"}</td>
                      <td className="px-4 py-4 text-slate-800 border-l border-slate-200 font-bold uppercase">{item.finishGood || "-"}</td>
                    </>
                  )}

                  {/* ISI LABEL ASSY */}
                  {dbTableMode === "LABEL_ASSY_GEN" && (
                    <>
                      <td className="px-4 py-4 text-orange-900 font-bold border-l border-orange-100 bg-orange-50/50 uppercase">{item.partAssyName || "-"}</td>
                      <td className="px-4 py-4 text-orange-900 font-bold border-l border-orange-100 bg-orange-50/50 uppercase">{item.partAssyHgs || "-"}</td>
                      <td className="px-4 py-4 text-orange-900 font-bold border-l border-orange-100 bg-orange-50/50 uppercase">{item.partAssyFg || "-"}</td>
                    </>
                  )}
                  {dbTableMode === "LABEL_ASSY_L" && (
                    <>
                      <td className="px-4 py-4 text-orange-900 font-bold border-l border-orange-200 bg-orange-50/80 uppercase">{item.partAssyNameLeft || "-"}</td>
                      <td className="px-4 py-4 text-orange-900 font-bold border-l border-orange-200 bg-orange-50/80 uppercase">{item.partAssyHgsLeft || "-"}</td>
                      <td className="px-4 py-4 text-orange-900 font-bold border-l border-orange-200 bg-orange-50/80 uppercase">{item.partAssyFgLeft || "-"}</td>
                    </>
                  )}
                  {dbTableMode === "LABEL_ASSY_R" && (
                    <>
                      <td className="px-4 py-4 text-orange-900 font-bold border-l border-orange-200 bg-orange-50/80 uppercase">{item.partAssyNameRight || "-"}</td>
                      <td className="px-4 py-4 text-orange-900 font-bold border-l border-orange-200 bg-orange-50/80 uppercase">{item.partAssyHgsRight || "-"}</td>
                      <td className="px-4 py-4 text-orange-900 font-bold border-l border-orange-200 bg-orange-50/80 uppercase">{item.partAssyFgRight || "-"}</td>
                    </>
                  )}

                  {/* ISI LABEL TAG */}
                  {dbTableMode === "LABEL_L" && (
                    <>
                      <td className="px-4 py-4 text-yellow-900 font-bold border-l border-yellow-100 bg-yellow-50/50 uppercase">{item.partNameHgsLeft || "-"}</td>
                      <td className="px-4 py-4 text-yellow-900 font-bold border-l border-yellow-100 bg-yellow-50/50 uppercase">{item.partNoHgsLeft || "-"}</td>
                      <td className="px-4 py-4 text-slate-800 font-bold border-l border-yellow-100 uppercase">{item.finishGoodNameLeft || "-"}</td>
                      <td className="px-4 py-4 text-slate-800 font-bold border-l border-yellow-100 uppercase">{item.finishGoodLeft || "-"}</td>
                    </>
                  )}
                  {dbTableMode === "LABEL_R" && (
                    <>
                      <td className="px-4 py-4 text-sky-900 font-bold border-l border-sky-100 bg-sky-50/50 uppercase">{item.partNameHgsRight || "-"}</td>
                      <td className="px-4 py-4 text-sky-900 font-bold border-l border-sky-100 bg-sky-50/50 uppercase">{item.partNoHgsRight || "-"}</td>
                      <td className="px-4 py-4 text-slate-800 font-bold border-l border-sky-100 uppercase">{item.finishGoodNameRight || "-"}</td>
                      <td className="px-4 py-4 text-slate-800 font-bold border-l border-sky-100 uppercase">{item.finishGoodRight || "-"}</td>
                    </>
                  )}

                  {dbTableMode !== "REQ" && (
                    <>
                      <td className="px-4 py-4 text-center font-black text-indigo-700 border-l border-indigo-100 bg-indigo-50/30 text-lg">
                        {item.stdQty || "-"}
                      </td>
                      <td className="px-4 py-4 text-center font-black text-slate-900 border-l border-slate-200">
                        {item.weight || "-"}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center">
                          {displayQr ? (
                            <img src={displayQr} alt="QR" className="h-10 w-10 object-contain border border-slate-300 rounded bg-white p-0.5 shadow-sm" />
                          ) : (
                            <span className="text-slate-300 text-xs font-bold">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center">
                          {displayImg ? (
                            <img src={displayImg} alt="IMG" className="h-10 w-10 object-contain border border-slate-300 rounded bg-white p-0.5 shadow-sm" />
                          ) : (
                            <span className="text-slate-300 text-xs font-bold">-</span>
                          )}
                        </div>
                      </td>
                    </>
                  )}

                  <td className={`px-4 py-4 text-center sticky right-0 z-10 shadow-sm ${rowClass} group-hover:bg-slate-100 border-l border-slate-200`}>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEditDb(key)}
                        className="text-slate-700 bg-white border border-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-800 font-black text-[10px] uppercase px-3 py-1.5 rounded transition-all shadow-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDb(key)}
                        className="text-slate-500 bg-white border border-slate-300 hover:border-red-600 hover:text-red-600 font-black text-[10px] uppercase px-3 py-1.5 rounded transition-all shadow-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINATION CONTROLS */}
      <div className="bg-slate-50 sticky bottom-0 z-30 shadow-inner border-t border-slate-200 px-5 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-bold tracking-wide">
            Menampilkan <strong className="text-slate-900">{indexOfFirstItem + 1}</strong> -{" "}
            <strong className="text-slate-900">{Math.min(indexOfLastItem, filteredData.length)}</strong>{" "}
            dari <strong className="text-slate-900">{filteredData.length}</strong> data
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden shadow-sm">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 disabled:opacity-30 border-r border-slate-200 transition-colors"
              >
                Prev
              </button>
              <span className="px-4 py-2 text-xs font-black text-slate-900 bg-slate-100">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 disabled:opacity-30 border-l border-slate-200 transition-colors"
              >
                Next
              </button>
            </div>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-xs font-black uppercase tracking-widest border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 cursor-pointer shadow-sm outline-none focus:border-slate-900"
            >
              <option value="5">5 Baris</option>
              <option value="10">10 Baris</option>
              <option value="20">20 Baris</option>
              <option value="50">50 Baris</option>
              <option value="100">100 Baris</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterTable;