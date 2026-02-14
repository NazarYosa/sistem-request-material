// src/components/ImageDropZone.jsx
import React, { useState } from "react";
import { scanQRCodeFromImage } from "../utils"; // Import dari utils yang kita buat tadi

const ImageDropZone = ({
  label,
  value,
  onUpload,
  onRemove,
  colorTheme = "gray",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [scannedText, setScannedText] = useState(null);

  const themeClasses = {
    gray: {
      border: "border-gray-300",
      active: "border-gray-500 ring-gray-200",
      bg: "bg-gray-50",
      text: "text-gray-500",
      badge: "bg-gray-600",
    },
    orange: {
      border: "border-orange-300",
      active: "border-orange-500 ring-orange-200",
      bg: "bg-orange-50",
      text: "text-orange-600",
      badge: "bg-orange-600",
    },
    yellow: {
      border: "border-yellow-400",
      active: "border-yellow-600 ring-yellow-200",
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      badge: "bg-yellow-600",
    },
    sky: {
      border: "border-sky-300",
      active: "border-sky-500 ring-sky-200",
      bg: "bg-sky-50",
      text: "text-sky-600",
      badge: "bg-sky-600",
    },
  };

  const theme = themeClasses[colorTheme] || themeClasses.gray;

  const processFile = async (file) => {
    if (file && file.type.startsWith("image/")) {
      const resultText = await scanQRCodeFromImage(file);
      setScannedText(resultText);

      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Hanya file gambar yang diperbolehkan!");
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let item of items) {
      if (item.type.indexOf("image") !== -1) {
        processFile(item.getAsFile());
        break;
      }
    }
  };

  const handleRemoveWrapper = () => {
    setScannedText(null);
    onRemove();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all h-32 w-full group cursor-pointer outline-none
        ${theme.bg} 
        ${isDragging ? "scale-105 shadow-lg border-solid " + theme.active : ""}
        ${value ? "border-solid border-gray-200" : theme.border}
        focus:ring-2 focus:border-solid ${theme.active} 
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      tabIndex="0"
      onPaste={handlePaste}
      onClick={() =>
        !value && document.getElementById(`file-${label}`)?.click()
      }
      title="Klik untuk upload atau Paste (Ctrl+V) gambar di sini"
    >
      {value ? (
        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden rounded-xl bg-white p-1">
          <img
            src={value}
            alt="Preview"
            className={`w-full object-contain ${
              scannedText ? "h-[70%]" : "h-full"
            }`}
          />
          {scannedText && (
            <div className="h-[30%] w-full flex items-center justify-center bg-gray-50 border-t border-gray-100">
              <span
                className="text-xl font-mono font-bold text-emerald-600 truncate px-2"
                title={scannedText}
              >
                {scannedText}
              </span>
            </div>
          )}
          <div
            className={`absolute top-0 left-0 px-2 py-1 text-[9px] font-bold text-white rounded-br-lg opacity-90 shadow-sm ${theme.badge}`}
          >
            {label}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveWrapper();
            }}
            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md transition-transform hover:scale-110 z-10"
          >
            ✕
          </button>
        </div>
      ) : (
        <>
          <div
            className={`text-2xl mb-1 ${theme.text} opacity-50 group-hover:scale-110 transition-transform`}
          >
            📷
          </div>
          <span
            className={`text-[10px] font-bold uppercase text-center px-2 ${theme.text}`}
          >
            {label}
          </span>
          <span className="text-[8px] text-gray-400 mt-1">
            Klik / Paste / Drag
          </span>
          <input
            id={`file-${label}`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => processFile(e.target.files[0])}
          />
        </>
      )}
    </div>
  );
};

export default ImageDropZone;
