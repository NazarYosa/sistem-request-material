// src/utils.js
import jsQR from "jsqr";

// Helper: Scan QR dari Gambar
export const scanQRCodeFromImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        resolve(code ? code.data : null);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

// Helper: Generate Key untuk Database (Bersihkan karakter aneh)
export const generateKey = (name) => {
  if (!name) return "";
  return name.replace(/\s+/g, " ").trim().toUpperCase().replace(/\//g, "_");
};

// Helper: Ambil Marker Tanggal untuk Excel
export const getMarkersFromDate = (dateString) => {
  const dateObj = new Date(dateString);
  const day = dateObj.getDate();
  const dayStr = String(day);
  return { day, dayStr, fullDate: dateString };
};