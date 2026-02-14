// src/components/Header.jsx
import React from "react";

const Header = ({
  viewMode,
  setViewMode,
  selectedDate,
  setSelectedDate,
  handlePrintAllRequest,
  handleFileUpload,
  isProcessing,
}) => {
  return (
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
          <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px]">
            <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
              {/* Spinner Bulat */}
              <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-sm font-bold text-slate-700 animate-pulse">
                Memproses Data Excel...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
