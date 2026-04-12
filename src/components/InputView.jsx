// // src/components/InputView.jsx
// import React from "react";
// import ImageDropZone from "./ImageDropZone";
// import MasterTable from "./MasterTable";

// const InputView = ({
//   inputForm,
//   setInputForm,
//   handleInputChange,
//   handleSaveInput,
//   handleCancelEdit,
//   editingKey,
//   masterDb,
//   handleEditDb,
//   handleDeleteDb,
//   searchTerm,
//   setSearchTerm,
//   dbTableMode,
//   setDbTableMode,
//   handleExportFirebase,
//   inputFormRef,
// }) => {
//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//       {/* HEADER INPUT */}
//       <div className="flex justify-between items-center mb-4 border-b pb-2">
//         <h3 className="font-bold text-lg text-slate-700">
//           Input Master Data Part
//         </h3>
//         <button
//           onClick={handleExportFirebase}
//           className="flex items-center gap-2 bg-red-100 text-red-700 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-red-200"
//         >
//           🔥 Export Firebase
//         </button>
//       </div>

//       {/* FORM AREA */}
//       <div
//         ref={inputFormRef}
//         className="bg-gray-50/50 border border-gray-200 rounded-xl p-5 mb-8"
//       >
//         <div className="grid grid-cols-12 gap-6">
//           <div className="col-span-12 grid grid-cols-4 gap-4">
//             {/* BARIS 1: PART UTAMA (DEFAULT) */}
//             <div className="col-span-2">
//               <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
//                 Part Name (Utama)
//               </label>
//               <input
//                 name="partName"
//                 value={inputForm.partName}
//                 onChange={handleInputChange}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold shadow-sm bg-white"
//                 placeholder="Nama Part Raw/Material..."
//               />
//             </div>
//             <div className="col-span-2">
//               <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
//                 Part No (Utama)
//               </label>
//               <input
//                 name="partNo"
//                 value={inputForm.partNo}
//                 onChange={handleInputChange}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm bg-white"
//                 placeholder="No System/Material..."
//               />
//             </div>

//             <div className="col-span-4 border-t border-gray-300 my-1"></div>

//             {/* BARIS 2: PART TAG GENERAL (NETRAL / GRAY) */}
//             <div className="col-span-2">
//               <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
//                 Part Name HGS (Gen)
//               </label>
//               <input
//                 name="partNameHgs"
//                 value={inputForm.partNameHgs || ""}
//                 onChange={handleInputChange}
//                 className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm font-bold bg-gray-50 shadow-sm"
//                 placeholder="Nama Part Label Umum..."
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
//                 Part No HGS (Gen)
//               </label>
//               <input
//                 name="partNoHgs"
//                 value={inputForm.partNoHgs || ""}
//                 onChange={handleInputChange}
//                 className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm font-bold bg-gray-50 shadow-sm"
//                 placeholder="No HGS Umum..."
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
//                 Part No FG (Gen)
//               </label>
//               <input
//                 name="finishGood"
//                 value={inputForm.finishGood || ""}
//                 onChange={handleInputChange}
//                 className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm font-bold bg-gray-50 shadow-sm"
//                 placeholder="No FG Umum..."
//               />
//             </div>

//             <div className="col-span-4 border-t border-gray-200 my-1"></div>

//             {/* BARIS 3: ASSY GENERAL (DEFAULT) */}
//             <div className="col-span-2">
//               <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
//                 Assy Name (Gen)
//               </label>
//               <input
//                 name="partAssyName"
//                 value={inputForm.partAssyName || ""}
//                 onChange={handleInputChange}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold shadow-sm bg-white"
//                 placeholder="Nama Assy Umum..."
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
//                 Assy HGS (Gen)
//               </label>
//               <input
//                 name="partAssyHgs"
//                 value={inputForm.partAssyHgs || ""}
//                 onChange={handleInputChange}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold shadow-sm bg-white"
//                 placeholder="No HGS..."
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
//                 Assy FG (Gen)
//               </label>
//               <input
//                 name="partAssyFg"
//                 value={inputForm.partAssyFg || ""}
//                 onChange={handleInputChange}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold shadow-sm bg-white"
//                 placeholder="No FG..."
//               />
//             </div>

//             <div className="col-span-4 border-t border-yellow-200 my-1"></div>

//             {/* BARIS 4: ASSY LEFT (KUNING) */}
//             <div className="col-span-2">
//               <label className="block text-xs font-bold text-yellow-700 uppercase mb-1">
//                 Assy Name (Left)
//               </label>
//               <input
//                 name="partAssyNameLeft"
//                 value={inputForm.partAssyNameLeft || ""}
//                 onChange={handleInputChange}
//                 className="w-full border border-yellow-400 rounded-lg px-3 py-2 text-sm font-bold text-yellow-900 bg-yellow-50 shadow-sm placeholder:text-yellow-700/50"
//                 placeholder="Assy Name (L)"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-yellow-700 uppercase mb-1">
//                 Assy HGS (Left)
//               </label>
//               <input
//                 name="partAssyHgsLeft"
//                 value={inputForm.partAssyHgsLeft || ""}
//                 onChange={handleInputChange}
//                 className="w-full border border-yellow-400 rounded-lg px-3 py-2 text-sm font-bold text-yellow-900 bg-yellow-50 shadow-sm placeholder:text-yellow-700/50"
//                 placeholder="HGS No (L)"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-yellow-700 uppercase mb-1">
//                 Assy FG (Left)
//               </label>
//               <input
//                 name="partAssyFgLeft"
//                 value={inputForm.partAssyFgLeft || ""}
//                 onChange={handleInputChange}
//                 className="w-full border border-yellow-400 rounded-lg px-3 py-2 text-sm font-bold text-yellow-900 bg-yellow-50 shadow-sm placeholder:text-yellow-700/50"
//                 placeholder="FG No (L)"
//               />
//             </div>

//             {/* BARIS 5: HGS/FG LEFT (KUNING) */}
//             <div>
//               <label className="block text-xs font-bold text-yellow-700 uppercase mb-1">
//                 HGS No (Left)
//               </label>
//               <input
//                 name="partNoHgsLeft"
//                 value={inputForm.partNoHgsLeft || ""}
//                 onChange={handleInputChange}
//                 className="w-full border border-yellow-400 rounded-lg px-3 py-2 text-sm font-bold text-yellow-900 bg-yellow-50 shadow-sm placeholder:text-yellow-700/50"
//                 placeholder="No HGS (L)"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-yellow-700 uppercase mb-1">
//                 HGS Name (Left)
//               </label>
//               <input
//                 name="partNameHgsLeft"
//                 value={inputForm.partNameHgsLeft || ""}
//                 onChange={handleInputChange}
//                 className="w-full border border-yellow-400 rounded-lg px-3 py-2 text-sm font-bold text-yellow-900 bg-yellow-50 shadow-sm placeholder:text-yellow-700/50"
//                 placeholder="Nama HGS (L)"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-yellow-700 uppercase mb-1">
//                 FG No (Left)
//               </label>
//               <input
//                 name="finishGoodLeft"
//                 value={inputForm.finishGoodLeft || ""}
//                 onChange={handleInputChange}
//                 className="w-full border border-yellow-400 rounded-lg px-3 py-2 text-sm font-bold text-yellow-900 bg-yellow-50 shadow-sm placeholder:text-yellow-700/50"
//                 placeholder="No FG (L)"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-yellow-700 uppercase mb-1">
//                 FG Name (Left)
//               </label>
//               <input
//                 name="finishGoodNameLeft"
//                 value={inputForm.finishGoodNameLeft || ""}
//                 onChange={handleInputChange}
//                 className="w-full border border-yellow-400 rounded-lg px-3 py-2 text-sm font-bold text-yellow-900 bg-yellow-50 shadow-sm placeholder:text-yellow-700/50"
//                 placeholder="Nama FG (L)"
//               />
//             </div>

//             <div className="col-span-4 border-t border-sky-200 my-1"></div>

//             {/* BARIS 6: ASSY RIGHT (BIRU MUDA/SKY) */}
//             <div className="col-span-2">
//               <label className="block text-xs font-bold text-sky-700 uppercase mb-1">
//                 Assy Name (Right)
//               </label>
//               <input
//                 name="partAssyNameRight"
//                 value={inputForm.partAssyNameRight || ""}
//                 onChange={handleInputChange}
//                 className="w-full border border-sky-400 rounded-lg px-3 py-2 text-sm font-bold text-sky-900 bg-sky-50 shadow-sm placeholder:text-sky-700/50"
//                 placeholder="Assy Name (R)"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-sky-700 uppercase mb-1">
//                 Assy HGS (Right)
//               </label>
//               <input
//                 name="partAssyHgsRight"
//                 value={inputForm.partAssyHgsRight || ""}
//                 onChange={handleInputChange}
//                 className="w-full border border-sky-400 rounded-lg px-3 py-2 text-sm font-bold text-sky-900 bg-sky-50 shadow-sm placeholder:text-sky-700/50"
//                 placeholder="HGS No (R)"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-sky-700 uppercase mb-1">
//                 Assy FG (Right)
//               </label>
//               <input
//                 name="partAssyFgRight"
//                 value={inputForm.partAssyFgRight || ""}
//                 onChange={handleInputChange}
//                 className="w-full border border-sky-400 rounded-lg px-3 py-2 text-sm font-bold text-sky-900 bg-sky-50 shadow-sm placeholder:text-sky-700/50"
//                 placeholder="FG No (R)"
//               />
//             </div>

//             {/* BARIS 7: HGS/FG RIGHT (BIRU MUDA/SKY) */}
//             <div>
//               <label className="block text-xs font-bold text-sky-700 uppercase mb-1">
//                 HGS No (Right)
//               </label>
//               <input
//                 name="partNoHgsRight"
//                 value={inputForm.partNoHgsRight || ""}
//                 onChange={handleInputChange}
//                 className="w-full border border-sky-400 rounded-lg px-3 py-2 text-sm font-bold text-sky-900 bg-sky-50 shadow-sm placeholder:text-sky-700/50"
//                 placeholder="No HGS (R)"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-sky-700 uppercase mb-1">
//                 HGS Name (Right)
//               </label>
//               <input
//                 name="partNameHgsRight"
//                 value={inputForm.partNameHgsRight || ""}
//                 onChange={handleInputChange}
//                 className="w-full border border-sky-400 rounded-lg px-3 py-2 text-sm font-bold text-sky-900 bg-sky-50 shadow-sm placeholder:text-sky-700/50"
//                 placeholder="Nama HGS (R)"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-sky-700 uppercase mb-1">
//                 FG No (Right)
//               </label>
//               <input
//                 name="finishGoodRight"
//                 value={inputForm.finishGoodRight || ""}
//                 onChange={handleInputChange}
//                 className="w-full border border-sky-400 rounded-lg px-3 py-2 text-sm font-bold text-sky-900 bg-sky-50 shadow-sm placeholder:text-sky-700/50"
//                 placeholder="No FG (R)"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-sky-700 uppercase mb-1">
//                 FG Name (Right)
//               </label>
//               <input
//                 name="finishGoodNameRight"
//                 value={inputForm.finishGoodNameRight || ""}
//                 onChange={handleInputChange}
//                 className="w-full border border-sky-400 rounded-lg px-3 py-2 text-sm font-bold text-sky-900 bg-sky-50 shadow-sm placeholder:text-sky-700/50"
//                 placeholder="Nama FG (R)"
//               />
//             </div>

//             <div className="col-span-4 border-t border-gray-200 my-1"></div>

//             {/* MATERIAL LAMA TETAP SAMA */}
//             <div>
//               <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
//                 Mat. Name 1
//               </label>
//               <input
//                 name="materialName"
//                 value={inputForm.materialName}
//                 onChange={handleInputChange}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
//                 Mat. No 1
//               </label>
//               <input
//                 name="partNoMaterial"
//                 value={inputForm.partNoMaterial}
//                 onChange={handleInputChange}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
//                 Mat. Name 2
//               </label>
//               <input
//                 name="materialName2"
//                 value={inputForm.materialName2 || ""}
//                 onChange={handleInputChange}
//                 className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
//                 placeholder="Opsional"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
//                 Mat. No 2
//               </label>
//               <input
//                 name="partNoMaterial2"
//                 value={inputForm.partNoMaterial2 || ""}
//                 onChange={handleInputChange}
//                 className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
//                 placeholder="Opsional"
//               />
//             </div>

//             {/* DETAIL LAIN */}
//             <div>
//               <label className="block text-xs font-bold text-emerald-700 uppercase mb-1">
//                 Berat (Kg)
//               </label>
//               <input
//                 name="weight"
//                 type="number"
//                 step="0.001"
//                 value={inputForm.weight}
//                 onChange={handleInputChange}
//                 className="w-full border border-emerald-400 rounded-lg px-3 py-2 text-sm font-bold text-emerald-700 bg-white shadow-sm"
//                 placeholder="0.00"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-indigo-700 uppercase mb-1">
//                 Qty / Box (Std)
//               </label>
//               <input
//                 name="stdQty"
//                 type="number"
//                 value={inputForm.stdQty || ""}
//                 onChange={handleInputChange}
//                 className="w-full border border-indigo-400 rounded-lg px-3 py-2 text-sm font-bold text-indigo-700 bg-white shadow-sm"
//                 placeholder="45"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
//                 Model
//               </label>
//               <input
//                 name="model"
//                 value={inputForm.model}
//                 onChange={handleInputChange}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
//                 Color
//               </label>
//               <input
//                 name="color"
//                 value={inputForm.color}
//                 onChange={handleInputChange}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
//               />
//             </div>
//           </div>
//         </div>

//         {/* --- BAGIAN B: UPLOAD GAMBAR & QR --- */}
//         <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-200">
//           <h3 className="text-sm font-bold text-slate-700 uppercase mb-4 flex items-center gap-2">
//             <span>🖼️</span> Upload Gambar & QR (Drag & Drop / Ctrl+V Supported)
//           </h3>

//           {/* Zone 1: General (Abu-abu) */}
//           <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 relative">
//             <div className="absolute -top-3 left-4 bg-slate-600 text-white px-3 py-1 text-[10px] font-bold rounded-full uppercase shadow-sm">
//               1. General / HGS
//             </div>
//             <div className="grid grid-cols-2 gap-4 mt-2">
//               <ImageDropZone
//                 label="QR GENERAL"
//                 colorTheme="gray"
//                 value={inputForm.qrHgs}
//                 onUpload={(v) => setInputForm((p) => ({ ...p, qrHgs: v }))}
//                 onRemove={() => setInputForm((p) => ({ ...p, qrHgs: "" }))}
//               />
//               <ImageDropZone
//                 label="FOTO PART GENERAL"
//                 colorTheme="gray"
//                 value={inputForm.imgHgs}
//                 onUpload={(v) => setInputForm((p) => ({ ...p, imgHgs: v }))}
//                 onRemove={() => setInputForm((p) => ({ ...p, imgHgs: "" }))}
//               />
//             </div>
//           </div>

//           {/* Zone 2: Assy Group (Orange) */}
//           <div className="mb-6 bg-orange-50 p-4 rounded-2xl border border-orange-200 relative">
//             <div className="absolute -top-3 left-4 bg-orange-600 text-white px-3 py-1 text-[10px] font-bold rounded-full uppercase shadow-sm">
//               2. Assy Group
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
//               {/* Assy Gen */}
//               <div className="bg-white p-2 rounded-xl shadow-sm border border-orange-100">
//                 <p className="text-[10px] font-bold text-center text-orange-800 mb-2 uppercase">
//                   Assy General
//                 </p>
//                 <div className="grid grid-cols-1 gap-2">
//                   <ImageDropZone
//                     label="QR ASSY GEN"
//                     colorTheme="orange"
//                     value={inputForm.qrAssy}
//                     onUpload={(v) => setInputForm((p) => ({ ...p, qrAssy: v }))}
//                     onRemove={() => setInputForm((p) => ({ ...p, qrAssy: "" }))}
//                   />
//                   <ImageDropZone
//                     label="IMG ASSY GEN"
//                     colorTheme="orange"
//                     value={inputForm.imgAssy}
//                     onUpload={(v) =>
//                       setInputForm((p) => ({ ...p, imgAssy: v }))
//                     }
//                     onRemove={() =>
//                       setInputForm((p) => ({ ...p, imgAssy: "" }))
//                     }
//                   />
//                 </div>
//               </div>
//               {/* Assy Left */}
//               <div className="bg-white p-2 rounded-xl shadow-sm border border-orange-100">
//                 <p className="text-[10px] font-bold text-center text-orange-800 mb-2 uppercase">
//                   Assy Left (L)
//                 </p>
//                 <div className="grid grid-cols-1 gap-2">
//                   <ImageDropZone
//                     label="QR ASSY L"
//                     colorTheme="orange"
//                     value={inputForm.qrAssyL}
//                     onUpload={(v) =>
//                       setInputForm((p) => ({ ...p, qrAssyL: v }))
//                     }
//                     onRemove={() =>
//                       setInputForm((p) => ({ ...p, qrAssyL: "" }))
//                     }
//                   />
//                   <ImageDropZone
//                     label="IMG ASSY L"
//                     colorTheme="orange"
//                     value={inputForm.imgAssyL}
//                     onUpload={(v) =>
//                       setInputForm((p) => ({ ...p, imgAssyL: v }))
//                     }
//                     onRemove={() =>
//                       setInputForm((p) => ({ ...p, imgAssyL: "" }))
//                     }
//                   />
//                 </div>
//               </div>
//               {/* Assy Right */}
//               <div className="bg-white p-2 rounded-xl shadow-sm border border-orange-100">
//                 <p className="text-[10px] font-bold text-center text-orange-800 mb-2 uppercase">
//                   Assy Right (R)
//                 </p>
//                 <div className="grid grid-cols-1 gap-2">
//                   <ImageDropZone
//                     label="QR ASSY R"
//                     colorTheme="orange"
//                     value={inputForm.qrAssyR}
//                     onUpload={(v) =>
//                       setInputForm((p) => ({ ...p, qrAssyR: v }))
//                     }
//                     onRemove={() =>
//                       setInputForm((p) => ({ ...p, qrAssyR: "" }))
//                     }
//                   />
//                   <ImageDropZone
//                     label="IMG ASSY R"
//                     colorTheme="orange"
//                     value={inputForm.imgAssyR}
//                     onUpload={(v) =>
//                       setInputForm((p) => ({ ...p, imgAssyR: v }))
//                     }
//                     onRemove={() =>
//                       setInputForm((p) => ({ ...p, imgAssyR: "" }))
//                     }
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Zone 3: Tag Group (Kuning & Biru) */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
//             <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-200 relative pt-6">
//               <div className="absolute -top-3 left-4 bg-yellow-600 text-white px-3 py-1 text-[10px] font-bold rounded-full uppercase shadow-sm">
//                 3. Tag Left (L)
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <ImageDropZone
//                   label="QR TAG L"
//                   colorTheme="yellow"
//                   value={inputForm.qrTagL}
//                   onUpload={(v) => setInputForm((p) => ({ ...p, qrTagL: v }))}
//                   onRemove={() => setInputForm((p) => ({ ...p, qrTagL: "" }))}
//                 />
//                 <ImageDropZone
//                   label="IMG TAG L"
//                   colorTheme="yellow"
//                   value={inputForm.imgTagL}
//                   onUpload={(v) => setInputForm((p) => ({ ...p, imgTagL: v }))}
//                   onRemove={() => setInputForm((p) => ({ ...p, imgTagL: "" }))}
//                 />
//               </div>
//             </div>
//             <div className="bg-sky-50 p-4 rounded-2xl border border-sky-200 relative pt-6">
//               <div className="absolute -top-3 left-4 bg-sky-600 text-white px-3 py-1 text-[10px] font-bold rounded-full uppercase shadow-sm">
//                 4. Tag Right (R)
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <ImageDropZone
//                   label="QR TAG R"
//                   colorTheme="sky"
//                   value={inputForm.qrTagR}
//                   onUpload={(v) => setInputForm((p) => ({ ...p, qrTagR: v }))}
//                   onRemove={() => setInputForm((p) => ({ ...p, qrTagR: "" }))}
//                 />
//                 <ImageDropZone
//                   label="IMG TAG R"
//                   colorTheme="sky"
//                   value={inputForm.imgTagR}
//                   onUpload={(v) => setInputForm((p) => ({ ...p, imgTagR: v }))}
//                   onRemove={() => setInputForm((p) => ({ ...p, imgTagR: "" }))}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* BUTTON ACTIONS */}
//         <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-gray-200">
//           {editingKey && (
//             <button
//               onClick={handleCancelEdit}
//               className="text-slate-500 hover:text-slate-700 font-bold py-2 px-5 rounded-lg text-sm transition-all hover:bg-slate-100"
//             >
//               Batal
//             </button>
//           )}
//           <button
//             onClick={handleSaveInput}
//             className={`text-white font-bold py-2 px-8 rounded-lg text-sm shadow-md transition-transform transform active:scale-95 ${editingKey ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-800 hover:bg-slate-900"}`}
//           >
//             {editingKey ? "Update Data" : "Simpan Data"}
//           </button>
//         </div>
//       </div>

//       {/* --- TOOLBAR TABEL --- */}
//       <div className="flex flex-col xl:flex-row items-center justify-between gap-4 mb-5 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
//         {/* Switcher */}
//         <div className="flex flex-wrap gap-1 justify-center xl:justify-start">
//           {[
//             { id: "REQ", label: "📄 REQ MAT" },
//             { id: "LABEL_GEN", label: "🏷️ GEN" },
//             { id: "LABEL_ASSY_GEN", label: "📦 ASSY GEN" },
//             { id: "LABEL_ASSY_L", label: "⬅️ ASSY L" },
//             { id: "LABEL_ASSY_R", label: "➡️ ASSY R" },
//             { id: "LABEL_L", label: "🟡 TAG L" },
//             { id: "LABEL_R", label: "🔵 TAG R" },
//           ].map((btn) => (
//             <button
//               key={btn.id}
//               onClick={() => setDbTableMode(btn.id)}
//               className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all shadow-sm uppercase ${
//                 dbTableMode === btn.id
//                   ? "bg-black text-white border-black scale-105"
//                   : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
//               }`}
//             >
//               {btn.label}
//             </button>
//           ))}
//         </div>
//         {/* Search */}
//         <div className="relative w-full max-w-xs">
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <span className="text-gray-400 text-sm">🔍</span>
//           </div>
//           <input
//             type="text"
//             className="block w-full pl-8 pr-8 py-1.5 border border-gray-300 rounded-lg text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
//             placeholder="CARI PART..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           {searchTerm && (
//             <button
//               onClick={() => setSearchTerm("")}
//               className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-red-500 transition-colors"
//             >
//               ✕
//             </button>
//           )}
//         </div>
//       </div>

//       {/* --- MASTER TABLE (PASS PROPS) --- */}
//       <MasterTable
//         masterDb={masterDb}
//         searchTerm={searchTerm}
//         dbTableMode={dbTableMode}
//         handleEditDb={handleEditDb}
//         handleDeleteDb={handleDeleteDb}
//       />
//     </div>
//   );
// };

// export default InputView;




//version 2:

// src/components/InputView.jsx
import React from "react";
import ImageDropZone from "./ImageDropZone";
import MasterTable from "./MasterTable";

const InputView = ({
  inputForm,
  setInputForm,
  handleInputChange,
  handleSaveInput,
  handleCancelEdit,
  editingKey,
  masterDb,
  handleEditDb,
  handleDeleteDb,
  searchTerm,
  setSearchTerm,
  dbTableMode,
  setDbTableMode,
  handleExportFirebase,
  inputFormRef,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* HEADER INPUT */}
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h3 className="font-bold text-lg text-slate-700">
          Input Master Data Part
        </h3>
        <button
          onClick={handleExportFirebase}
          className="flex items-center gap-2 bg-red-100 text-red-700 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-red-200"
        >
          🔥 Export Firebase
        </button>
      </div>

      {/* FORM AREA */}
      <div
        ref={inputFormRef}
        className="bg-gray-50/50 border border-gray-200 rounded-xl p-5 mb-8"
      >
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold shadow-sm bg-white"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm bg-white"
                placeholder="No System/Material..."
              />
            </div>

            {/* --- MATERIAL PINDAH KESINI --- */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Mat. Name 1
              </label>
              <input
                name="materialName"
                value={inputForm.materialName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm"
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
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm"
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
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm"
                placeholder="Opsional"
              />
            </div>

            {/* --- SPESIFIKASI FISIK NAIK KESINI (BERAT, QTY, MODEL, WARNA) --- */}
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
                className="w-full border border-emerald-400 rounded-lg px-3 py-2 text-sm font-bold text-emerald-700 bg-white shadow-sm"
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
                className="w-full border border-indigo-400 rounded-lg px-3 py-2 text-sm font-bold text-indigo-700 bg-white shadow-sm"
                placeholder="45"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm"
              />
            </div>

            {/* PEMBATAS UNTUK BAGIAN LABELING */}
            <div className="col-span-4 border-t border-gray-300 my-1"></div>

            {/* BARIS 2: PART TAG GENERAL (NETRAL / GRAY) */}
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Part Name HGS (Gen)
              </label>
              <input
                name="partNameHgs"
                value={inputForm.partNameHgs || ""}
                onChange={handleInputChange}
                className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm font-bold bg-gray-50 shadow-sm"
                placeholder="Nama Part Label Umum..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Part No HGS (Gen)
              </label>
              <input
                name="partNoHgs"
                value={inputForm.partNoHgs || ""}
                onChange={handleInputChange}
                className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm font-bold bg-gray-50 shadow-sm"
                placeholder="No HGS Umum..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Part No FG (Gen)
              </label>
              <input
                name="finishGood"
                value={inputForm.finishGood || ""}
                onChange={handleInputChange}
                className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm font-bold bg-gray-50 shadow-sm"
                placeholder="No FG Umum..."
              />
            </div>

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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold shadow-sm bg-white"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold shadow-sm bg-white"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold shadow-sm bg-white"
                placeholder="No FG..."
              />
            </div>

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
                className="w-full border border-yellow-400 rounded-lg px-3 py-2 text-sm font-bold text-yellow-900 bg-yellow-50 shadow-sm placeholder:text-yellow-700/50"
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
                className="w-full border border-yellow-400 rounded-lg px-3 py-2 text-sm font-bold text-yellow-900 bg-yellow-50 shadow-sm placeholder:text-yellow-700/50"
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
                className="w-full border border-yellow-400 rounded-lg px-3 py-2 text-sm font-bold text-yellow-900 bg-yellow-50 shadow-sm placeholder:text-yellow-700/50"
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
                className="w-full border border-yellow-400 rounded-lg px-3 py-2 text-sm font-bold text-yellow-900 bg-yellow-50 shadow-sm placeholder:text-yellow-700/50"
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
                className="w-full border border-yellow-400 rounded-lg px-3 py-2 text-sm font-bold text-yellow-900 bg-yellow-50 shadow-sm placeholder:text-yellow-700/50"
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
                className="w-full border border-yellow-400 rounded-lg px-3 py-2 text-sm font-bold text-yellow-900 bg-yellow-50 shadow-sm placeholder:text-yellow-700/50"
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
                className="w-full border border-yellow-400 rounded-lg px-3 py-2 text-sm font-bold text-yellow-900 bg-yellow-50 shadow-sm placeholder:text-yellow-700/50"
                placeholder="Nama FG (L)"
              />
            </div>

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
                className="w-full border border-sky-400 rounded-lg px-3 py-2 text-sm font-bold text-sky-900 bg-sky-50 shadow-sm placeholder:text-sky-700/50"
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
                className="w-full border border-sky-400 rounded-lg px-3 py-2 text-sm font-bold text-sky-900 bg-sky-50 shadow-sm placeholder:text-sky-700/50"
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
                className="w-full border border-sky-400 rounded-lg px-3 py-2 text-sm font-bold text-sky-900 bg-sky-50 shadow-sm placeholder:text-sky-700/50"
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
                className="w-full border border-sky-400 rounded-lg px-3 py-2 text-sm font-bold text-sky-900 bg-sky-50 shadow-sm placeholder:text-sky-700/50"
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
                className="w-full border border-sky-400 rounded-lg px-3 py-2 text-sm font-bold text-sky-900 bg-sky-50 shadow-sm placeholder:text-sky-700/50"
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
                className="w-full border border-sky-400 rounded-lg px-3 py-2 text-sm font-bold text-sky-900 bg-sky-50 shadow-sm placeholder:text-sky-700/50"
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
                className="w-full border border-sky-400 rounded-lg px-3 py-2 text-sm font-bold text-sky-900 bg-sky-50 shadow-sm placeholder:text-sky-700/50"
                placeholder="Nama FG (R)"
              />
            </div>
          </div>
        </div>

        {/* --- BAGIAN B: UPLOAD GAMBAR & QR --- */}
        <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-200">
          <h3 className="text-sm font-bold text-slate-700 uppercase mb-4 flex items-center gap-2">
            <span>🖼️</span> Upload Gambar & QR (Drag & Drop / Ctrl+V Supported)
          </h3>

          {/* Zone 1: General (Abu-abu) */}
          <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 relative">
            <div className="absolute -top-3 left-4 bg-slate-600 text-white px-3 py-1 text-[10px] font-bold rounded-full uppercase shadow-sm">
              1. General / HGS
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <ImageDropZone
                label="QR GENERAL"
                colorTheme="gray"
                value={inputForm.qrHgs}
                onUpload={(v) => setInputForm((p) => ({ ...p, qrHgs: v }))}
                onRemove={() => setInputForm((p) => ({ ...p, qrHgs: "" }))}
              />
              <ImageDropZone
                label="FOTO PART GENERAL"
                colorTheme="gray"
                value={inputForm.imgHgs}
                onUpload={(v) => setInputForm((p) => ({ ...p, imgHgs: v }))}
                onRemove={() => setInputForm((p) => ({ ...p, imgHgs: "" }))}
              />
            </div>
          </div>

          {/* Zone 2: Assy Group (Orange) */}
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
                <div className="grid grid-cols-1 gap-2">
                  <ImageDropZone
                    label="QR ASSY GEN"
                    colorTheme="orange"
                    value={inputForm.qrAssy}
                    onUpload={(v) => setInputForm((p) => ({ ...p, qrAssy: v }))}
                    onRemove={() => setInputForm((p) => ({ ...p, qrAssy: "" }))}
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
                <div className="grid grid-cols-1 gap-2">
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
                <div className="grid grid-cols-1 gap-2">
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

          {/* Zone 3: Tag Group (Kuning & Biru) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-200 relative pt-6">
              <div className="absolute -top-3 left-4 bg-yellow-600 text-white px-3 py-1 text-[10px] font-bold rounded-full uppercase shadow-sm">
                3. Tag Left (L)
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ImageDropZone
                  label="QR TAG L"
                  colorTheme="yellow"
                  value={inputForm.qrTagL}
                  onUpload={(v) => setInputForm((p) => ({ ...p, qrTagL: v }))}
                  onRemove={() => setInputForm((p) => ({ ...p, qrTagL: "" }))}
                />
                <ImageDropZone
                  label="IMG TAG L"
                  colorTheme="yellow"
                  value={inputForm.imgTagL}
                  onUpload={(v) => setInputForm((p) => ({ ...p, imgTagL: v }))}
                  onRemove={() => setInputForm((p) => ({ ...p, imgTagL: "" }))}
                />
              </div>
            </div>
            <div className="bg-sky-50 p-4 rounded-2xl border border-sky-200 relative pt-6">
              <div className="absolute -top-3 left-4 bg-sky-600 text-white px-3 py-1 text-[10px] font-bold rounded-full uppercase shadow-sm">
                4. Tag Right (R)
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ImageDropZone
                  label="QR TAG R"
                  colorTheme="sky"
                  value={inputForm.qrTagR}
                  onUpload={(v) => setInputForm((p) => ({ ...p, qrTagR: v }))}
                  onRemove={() => setInputForm((p) => ({ ...p, qrTagR: "" }))}
                />
                <ImageDropZone
                  label="IMG TAG R"
                  colorTheme="sky"
                  value={inputForm.imgTagR}
                  onUpload={(v) => setInputForm((p) => ({ ...p, imgTagR: v }))}
                  onRemove={() => setInputForm((p) => ({ ...p, imgTagR: "" }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* BUTTON ACTIONS */}
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
            className={`text-white font-bold py-2 px-8 rounded-lg text-sm shadow-md transition-transform transform active:scale-95 ${editingKey ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-800 hover:bg-slate-900"}`}
          >
            {editingKey ? "Update Data" : "Simpan Data"}
          </button>
        </div>
      </div>

      {/* --- TOOLBAR TABEL --- */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-4 mb-5 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
        {/* Switcher */}
        <div className="flex flex-wrap gap-1 justify-center xl:justify-start">
          {[
            { id: "REQ", label: "📄 REQ MAT" },
            { id: "LABEL_GEN", label: "🏷️ GEN" },
            { id: "LABEL_ASSY_GEN", label: "📦 ASSY GEN" },
            { id: "LABEL_ASSY_L", label: "⬅️ ASSY L" },
            { id: "LABEL_ASSY_R", label: "➡️ ASSY R" },
            { id: "LABEL_L", label: "🟡 TAG L" },
            { id: "LABEL_R", label: "🔵 TAG R" },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setDbTableMode(btn.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all shadow-sm uppercase ${
                dbTableMode === btn.id
                  ? "bg-black text-white border-black scale-105"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
        {/* Search */}
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

      {/* --- MASTER TABLE (PASS PROPS) --- */}
      <MasterTable
        masterDb={masterDb}
        searchTerm={searchTerm}
        dbTableMode={dbTableMode}
        handleEditDb={handleEditDb}
        handleDeleteDb={handleDeleteDb}
      />
    </div>
  );
};

export default InputView;