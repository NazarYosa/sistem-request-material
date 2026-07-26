// src/components/dashboardUtils.js
// Helper khusus buat StockDashboardView, dipisah dari utils.js utama
// biar gak nabrak fungsi generateKey yang udah ada.
export const generateFirebaseKey = (excelPartName) => {
  if (!excelPartName) return "";
  let cleanName = excelPartName.toString().trim();
  cleanName = cleanName.replace(/\s+/g, " ");
  cleanName = cleanName.replace(/\s*\/\s*/g, "/");
  return cleanName.replace(/\//g, "_").toUpperCase();
};
