import React from "react";
import { QRCodeSVG } from "qrcode.react";
import ImageDropZone from "./ImageDropZone";
import MasterTable from "./MasterTable";

// Preview QR live (generate langsung dari teks, tidak disimpan ke Firebase).
// Tidak render apa-apa kalau field sumbernya masih kosong.
const QRAutoPreview = ({ label, data, colorTheme = "gray" }) => {
  const border = {
    gray: "border-slate-300",
    orange: "border-orange-300",
    yellow: "border-yellow-300",
    sky: "border-sky-300",
  }[colorTheme];

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-3 flex flex-col items-center justify-center gap-2 bg-slate-50 min-h-[140px] ${border}`}
    >
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
        {label}
      </span>
      {data ? (
        <>
          <div className="w-24 h-24 flex items-center justify-center bg-white p-1 rounded">
            <QRCodeSVG value={data} size={88} level="M" />
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-600 text-center break-all px-1">
            {data}
          </span>
        </>
      ) : (
        <span className="text-[10px] text-slate-300 text-center">
          Isi field FG terkait dulu
        </span>
      )}
    </div>
  );
};

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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 lg:p-8">
      {/* HEADER INPUT */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-slate-100 pb-4">
        <h3 className="font-extrabold text-2xl text-slate-800 tracking-tight">
          Input Master Data Part
        </h3>
        <button
          onClick={handleExportFirebase}
          className="flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border border-slate-200 shadow-sm"
        >
          EXPORT DATABASE
        </button>
      </div>

      {/* FORM AREA (Tanpa background tumpuk, cuma border tipis) */}
      <div
        ref={inputFormRef}
        className="border border-slate-200 rounded-2xl p-6 md:p-8 mb-10"
      >
        <div className="flex flex-col gap-10">
          
          {/* --- SECTION 1: UTAMA, MATERIAL & SPESIFIKASI --- */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-8 h-0.5 bg-slate-800"></span>
              Informasi Utama
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
              {/* Part Name & No Utama */}
              <div className="lg:col-span-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                  Part Name (Utama)
                </label>
                <input
                  name="partName"
                  value={inputForm.partName}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all"
                  placeholder="Nama Part Raw/Material..."
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                  Part No (Utama)
                </label>
                <input
                  name="partNo"
                  value={inputForm.partNo}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all"
                  placeholder="No System/Material..."
                />
              </div>

              {/* Material */}
              <div className="col-span-4 border-t border-slate-100 my-2"></div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                  Mat. Name 1
                </label>
                <input
                  name="materialName"
                  value={inputForm.materialName}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                  Mat. No 1
                </label>
                <input
                  name="partNoMaterial"
                  value={inputForm.partNoMaterial}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">
                  Mat. Name 2 <span className="font-normal normal-case text-slate-300">(Opsional)</span>
                </label>
                <input
                  name="materialName2"
                  value={inputForm.materialName2 || ""}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all"
                  placeholder="-"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">
                  Mat. No 2 <span className="font-normal normal-case text-slate-300">(Opsional)</span>
                </label>
                <input
                  name="partNoMaterial2"
                  value={inputForm.partNoMaterial2 || ""}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all"
                  placeholder="-"
                />
              </div>

              {/* Spesifikasi Fisik & Orientasi Cetak */}
              <div className="col-span-4 border-t border-slate-100 my-2"></div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-600 uppercase mb-1.5">
                  Berat (Kg)
                </label>
                <input
                  name="weight"
                  type="number"
                  step="0.001"
                  value={inputForm.weight}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-indigo-600 uppercase mb-1.5">
                  Qty / Box (Std)
                </label>
                <input
                  name="stdQty"
                  type="number"
                  value={inputForm.stdQty || ""}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                  Model
                </label>
                <input
                  name="model"
                  value={inputForm.model}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                  Color
                </label>
                <input
                  name="color"
                  value={inputForm.color}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all"
                />
              </div>

              {/* --- KODE TAMBAHAN: ORIENTASI KERTAS --- */}
              <div className="lg:col-span-2 mt-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">
                  Orientasi Kertas Part Tag (Default)
                </label>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 border-2 rounded-lg cursor-pointer transition-all ${
                    inputForm.printOrientation === 'PORTRAIT' 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                  }`}>
                    <input 
                      type="radio" 
                      name="printOrientation" 
                      value="PORTRAIT" 
                      checked={inputForm.printOrientation === 'PORTRAIT'} 
                      onChange={handleInputChange} 
                      className="hidden" 
                    />
                    📄 PORTRAIT ONLY
                  </label>
                  <label className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 border-2 rounded-lg cursor-pointer transition-all ${
                    inputForm.printOrientation === 'LANDSCAPE' 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                  }`}>
                    <input 
                      type="radio" 
                      name="printOrientation" 
                      value="LANDSCAPE" 
                      checked={inputForm.printOrientation === 'LANDSCAPE'} 
                      onChange={handleInputChange} 
                      className="hidden" 
                    />
                    🗂️ LANDSCAPE ONLY
                  </label>
                </div>
              </div>
              {/* --------------------------------------- */}

            </div>
          </div>

          {/* --- SECTION 2: IDENTIFIKASI GENERAL --- */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-8 h-0.5 bg-slate-400"></span>
              Identifikasi General (Tag & Assy)
            </h4>
            
            {/* Tanpa box wrapper, biarkan menyatu tapi dipisah jarak */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5 pl-4 border-l-4 border-slate-200">
              <div className="lg:col-span-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                  Part Name HGS (Gen)
                </label>
                <input
                  name="partNameHgs"
                  value={inputForm.partNameHgs || ""}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  placeholder="Nama Label..."
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                  Part No HGS (Gen)
                </label>
                <input
                  name="partNoHgs"
                  value={inputForm.partNoHgs || ""}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  placeholder="No HGS..."
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                  Part No FG (Gen)
                </label>
                <input
                  name="finishGood"
                  value={inputForm.finishGood || ""}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  placeholder="No FG..."
                />
              </div>
              
              <div className="col-span-full h-px bg-slate-100 my-1"></div>

              <div className="lg:col-span-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                  Assy Name (Gen)
                </label>
                <input
                  name="partAssyName"
                  value={inputForm.partAssyName || ""}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  placeholder="Nama Assy..."
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                  Assy HGS (Gen)
                </label>
                <input
                  name="partAssyHgs"
                  value={inputForm.partAssyHgs || ""}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  placeholder="No HGS..."
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                  Assy FG (Gen)
                </label>
                <input
                  name="partAssyFg"
                  value={inputForm.partAssyFg || ""}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  placeholder="No FG..."
                />
              </div>
            </div>
          </div>

          {/* --- SECTION 3 & 4: VARIAN LEFT & RIGHT --- */}
          <div>
             <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-8 h-0.5 bg-slate-800"></span>
              Varian Spesifik (Left / Right)
            </h4>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              
              {/* KIRI (LEFT) - Aksen Garis Samping Kuning */}
              <div className="pl-5 border-l-4 border-yellow-400">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-5">
                  🟡 Kiri (Left)
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Assy Name (Left)
                    </label>
                    <input
                      name="partAssyNameLeft"
                      value={inputForm.partAssyNameLeft || ""}
                      onChange={handleInputChange}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Assy HGS (Left)
                    </label>
                    <input
                      name="partAssyHgsLeft"
                      value={inputForm.partAssyHgsLeft || ""}
                      onChange={handleInputChange}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Assy FG (Left)
                    </label>
                    <input
                      name="partAssyFgLeft"
                      value={inputForm.partAssyFgLeft || ""}
                      onChange={handleInputChange}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      HGS No (Left)
                    </label>
                    <input
                      name="partNoHgsLeft"
                      value={inputForm.partNoHgsLeft || ""}
                      onChange={handleInputChange}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      HGS Name (Left)
                    </label>
                    <input
                      name="partNameHgsLeft"
                      value={inputForm.partNameHgsLeft || ""}
                      onChange={handleInputChange}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      FG No (Left)
                    </label>
                    <input
                      name="finishGoodLeft"
                      value={inputForm.finishGoodLeft || ""}
                      onChange={handleInputChange}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      FG Name (Left)
                    </label>
                    <input
                      name="finishGoodNameLeft"
                      value={inputForm.finishGoodNameLeft || ""}
                      onChange={handleInputChange}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* KANAN (RIGHT) - Aksen Garis Samping Biru */}
              <div className="pl-5 border-l-4 border-sky-400">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-5">
                  🔵 Kanan (Right)
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Assy Name (Right)
                    </label>
                    <input
                      name="partAssyNameRight"
                      value={inputForm.partAssyNameRight || ""}
                      onChange={handleInputChange}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Assy HGS (Right)
                    </label>
                    <input
                      name="partAssyHgsRight"
                      value={inputForm.partAssyHgsRight || ""}
                      onChange={handleInputChange}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Assy FG (Right)
                    </label>
                    <input
                      name="partAssyFgRight"
                      value={inputForm.partAssyFgRight || ""}
                      onChange={handleInputChange}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      HGS No (Right)
                    </label>
                    <input
                      name="partNoHgsRight"
                      value={inputForm.partNoHgsRight || ""}
                      onChange={handleInputChange}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      HGS Name (Right)
                    </label>
                    <input
                      name="partNameHgsRight"
                      value={inputForm.partNameHgsRight || ""}
                      onChange={handleInputChange}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      FG No (Right)
                    </label>
                    <input
                      name="finishGoodRight"
                      value={inputForm.finishGoodRight || ""}
                      onChange={handleInputChange}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      FG Name (Right)
                    </label>
                    <input
                      name="finishGoodNameRight"
                      value={inputForm.finishGoodNameRight || ""}
                      onChange={handleInputChange}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- BAGIAN B: UPLOAD GAMBAR & QR --- */}
        <div className="mt-14 pt-10 border-t border-slate-200">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-8 flex items-center gap-3">
            <span className="w-8 h-0.5 bg-slate-800"></span>
            Upload Gambar & QR
          </h4>

          {/* Zone 1: General (Abu-abu) - Background diminimalkan */}
          <div className="mb-8 p-5 rounded-xl border border-slate-200 bg-white relative">
            <div className="absolute -top-3 left-5 bg-white px-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              1. General / HGS
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              <QRAutoPreview
                label="QR GENERAL"
                colorTheme="gray"
                data={inputForm.finishGood}
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

          {/* Zone 2: Assy Group (Orange) - Background diminimalkan */}
          <div className="mb-8 p-5 rounded-xl border border-slate-200 bg-white relative">
            <div className="absolute -top-3 left-5 bg-white px-2 text-[11px] font-bold text-orange-600 uppercase tracking-wider">
              2. Assy Group
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
              {/* Assy Gen */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Assy General
                </p>
                <div className="grid grid-cols-1 gap-4">
                  <QRAutoPreview
                    label="QR ASSY GEN"
                    colorTheme="orange"
                    data={inputForm.partAssyFg}
                  />
                  <ImageDropZone
                    label="IMG ASSY GEN"
                    colorTheme="orange"
                    value={inputForm.imgAssy}
                    onUpload={(v) => setInputForm((p) => ({ ...p, imgAssy: v }))}
                    onRemove={() => setInputForm((p) => ({ ...p, imgAssy: "" }))}
                  />
                </div>
              </div>
              {/* Assy Left */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Assy Left (L)
                </p>
                <div className="grid grid-cols-1 gap-4">
                  <QRAutoPreview
                    label="QR ASSY L"
                    colorTheme="orange"
                    data={inputForm.partAssyFgLeft}
                  />
                  <ImageDropZone
                    label="IMG ASSY L"
                    colorTheme="orange"
                    value={inputForm.imgAssyL}
                    onUpload={(v) => setInputForm((p) => ({ ...p, imgAssyL: v }))}
                    onRemove={() => setInputForm((p) => ({ ...p, imgAssyL: "" }))}
                  />
                </div>
              </div>
              {/* Assy Right */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Assy Right (R)
                </p>
                <div className="grid grid-cols-1 gap-4">
                  <QRAutoPreview
                    label="QR ASSY R"
                    colorTheme="orange"
                    data={inputForm.partAssyFgRight}
                  />
                  <ImageDropZone
                    label="IMG ASSY R"
                    colorTheme="orange"
                    value={inputForm.imgAssyR}
                    onUpload={(v) => setInputForm((p) => ({ ...p, imgAssyR: v }))}
                    onRemove={() => setInputForm((p) => ({ ...p, imgAssyR: "" }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Zone 3: Tag Group (Kuning & Biru) - Background diminimalkan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            <div className="p-5 rounded-xl border border-slate-200 bg-white relative">
              <div className="absolute -top-3 left-5 bg-white px-2 text-[11px] font-bold text-yellow-600 uppercase tracking-wider">
                3. Tag Left (L)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
                <QRAutoPreview
                  label="QR TAG L"
                  colorTheme="yellow"
                  data={inputForm.finishGoodLeft}
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
            
            <div className="p-5 rounded-xl border border-slate-200 bg-white relative">
              <div className="absolute -top-3 left-5 bg-white px-2 text-[11px] font-bold text-sky-600 uppercase tracking-wider">
                4. Tag Right (R)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
                <QRAutoPreview
                  label="QR TAG R"
                  colorTheme="sky"
                  data={inputForm.finishGoodRight}
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
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 mt-12 pt-6 border-t border-slate-200">
          {editingKey && (
            <button
              onClick={handleCancelEdit}
              className="text-slate-600 font-bold py-3 px-6 rounded-xl text-sm transition-all bg-slate-100 hover:bg-slate-200"
            >
              Batal
            </button>
          )}
          <button
            onClick={handleSaveInput}
            className={`text-white font-bold py-3 px-10 rounded-xl text-sm transition-all transform active:scale-95 ${
              editingKey 
                ? "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20" 
                : "bg-slate-900 hover:bg-black shadow-lg shadow-slate-900/20"
            }`}
          >
            {editingKey ? "Update Data" : "Simpan Data"}
          </button>
        </div>
      </div>

      {/* --- TOOLBAR TABEL --- */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-5 mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Switcher */}
        <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
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
              className={`px-4 py-2.5 text-[11px] font-bold rounded-xl transition-all uppercase tracking-wider ${
                dbTableMode === btn.id
                  ? "bg-slate-900 text-white shadow-md scale-105"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
        
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-slate-400 text-sm">🔍</span>
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-10 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            placeholder="CARI PART..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-red-500 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* --- MASTER TABLE --- */}
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