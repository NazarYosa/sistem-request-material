// src/components/ModalMenu.jsx
import React from "react";
import { generateKey } from "../utils";

const ModalMenu = ({
  activeDropdown,
  setActiveDropdown,
  dataMaterial,
  masterDb,
  handlePrintLabel,
  setOrientation,
  orientation,
}) => {
  if (!activeDropdown) return null;

  // 1. Ambil Item & Data Master
  const selectedItem = dataMaterial.find((d) => d.id === activeDropdown);
  const dbKey = generateKey(selectedItem?.partName || "");
  const masterItem = masterDb[dbKey] || {};

  // 2. Helper Cek Data
  const hasData = (val) => val && val !== "" && val !== "-";

  // 3. Logic Visibility (Strict)
  const showGen =
    hasData(masterItem.partNameHgs) ||
    hasData(masterItem.partNoHgs) ||
    hasData(masterItem.finishGood);
  const showAssyGen =
    hasData(masterItem.partAssyName) || hasData(masterItem.partAssyHgs);
  const showAssyL =
    hasData(masterItem.partAssyNameLeft) || hasData(masterItem.partAssyHgsLeft);
  const showAssyR =
    hasData(masterItem.partAssyNameRight) ||
    hasData(masterItem.partAssyHgsRight);
  const hasAnyAssy = showAssyGen || showAssyL || showAssyR;
  const showTagL =
    hasData(masterItem.partNoHgsLeft) || hasData(masterItem.finishGoodLeft);
  const showTagR =
    hasData(masterItem.partNoHgsRight) || hasData(masterItem.finishGoodRight);
  const hasAnyTag = showTagL || showTagR;

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

        {/* Option: Orientation */}
        <div className="px-4 pt-3 pb-1">
          <div className="bg-gray-100 p-1 rounded-lg flex w-full">
            <button
              onClick={() => setOrientation("PORTRAIT")}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 ${orientation === "PORTRAIT" ? "bg-white shadow text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
            >
              <span className="text-sm">📄</span> Potrait (2x5)
            </button>
            <button
              onClick={() => setOrientation("LANDSCAPE")}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1 ${orientation === "LANDSCAPE" ? "bg-white shadow text-purple-600" : "text-gray-400 hover:text-gray-600"}`}
            >
              <span className="text-sm transform rotate-90">📄</span> Landscape
              (3x3)
            </button>
          </div>
        </div>

        {/* Isi Menu */}
        <div className="p-2 grid gap-1 max-h-[60vh] overflow-y-auto min-h-[150px]">
          {isTotallyEmpty && (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center text-gray-400">
              <span className="text-4xl mb-2">📭</span>
              <p className="text-sm font-bold text-gray-600">
                Data Label Belum Ada
              </p>
              <p className="text-[10px] max-w-[200px] mt-1">
                Silakan lengkapi data Part Name/No di menu <b>Input Master</b>{" "}
                terlebih dahulu.
              </p>
            </div>
          )}

          {/* 1. GENERAL */}
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
                <div className="text-[10px] text-slate-400">Label standar</div>
              </div>
            </button>
          )}

          {/* 2. ASSY */}
          {hasAnyAssy && (
            <>
              {showGen && (
                <div className="border-t border-dashed border-slate-200 my-1 mx-4"></div>
              )}
              <div className="grid grid-cols-1 gap-1">
                {showAssyGen && (
                  <button
                    onClick={() => handlePrintLabel(selectedItem, "ASSY_GEN")}
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
                        onClick={() => handlePrintLabel(selectedItem, "ASSY_L")}
                        className={`flex items-center justify-center gap-2 px-3 py-2 bg-orange-50/50 hover:bg-orange-100 text-orange-800 rounded-lg text-xs font-bold border border-orange-100 transition-colors ${!showAssyR ? "col-span-2" : ""}`}
                      >
                        ⬅️ Assy Left
                      </button>
                    )}
                    {showAssyR && (
                      <button
                        onClick={() => handlePrintLabel(selectedItem, "ASSY_R")}
                        className={`flex items-center justify-center gap-2 px-3 py-2 bg-orange-50/50 hover:bg-orange-100 text-orange-800 rounded-lg text-xs font-bold border border-orange-100 transition-colors ${!showAssyL ? "col-span-2" : ""}`}
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
              {(showGen || hasAnyAssy) && (
                <div className="border-t border-dashed border-slate-200 my-1 mx-4"></div>
              )}
              <div className="grid grid-cols-2 gap-2 px-2 pb-2 mt-1">
                {showTagL && (
                  <button
                    onClick={() => handlePrintLabel(selectedItem, "TAG_L")}
                    className={`flex flex-col items-center justify-center gap-1 px-3 py-3 bg-yellow-50 hover:bg-yellow-100 hover:border-yellow-300 border border-transparent rounded-xl transition-all ${!showTagR ? "col-span-2 flex-row gap-3" : ""}`}
                  >
                    <span className="text-xl">🟡</span>
                    <span className="text-xs font-bold text-yellow-800">
                      Tag Left (L)
                    </span>
                  </button>
                )}
                {showTagR && (
                  <button
                    onClick={() => handlePrintLabel(selectedItem, "TAG_R")}
                    className={`flex flex-col items-center justify-center gap-1 px-3 py-3 bg-sky-50 hover:bg-sky-100 hover:border-sky-300 border border-transparent rounded-xl transition-all ${!showTagL ? "col-span-2 flex-row gap-3" : ""}`}
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
};

export default ModalMenu;
