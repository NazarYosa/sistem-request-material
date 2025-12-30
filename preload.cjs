const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // 1. Dengar Data Excel
  onExcelUpdate: (callback) => {
    const subscription = (event, value) => callback(event, value);
    ipcRenderer.on("excel-update-otomatis", subscription);
    return () =>
      ipcRenderer.removeListener("excel-update-otomatis", subscription);
  },

  // === TAMBAHKAN 3 BARIS INI ===
  loadLocalDb: () => ipcRenderer.invoke("db-load"),
  saveLocalDb: (data) => ipcRenderer.invoke("db-save", data),
  importLocalDb: (data) => ipcRenderer.invoke("db-import", data),

  // 2. Dengar Info Path (Nama File yang sedang aktif saat start)
  onPathUpdate: (callback) => {
    const subscription = (event, value) => callback(event, value);
    ipcRenderer.on("info-path-update", subscription);
    return () => ipcRenderer.removeListener("info-path-update", subscription);
  },

  // 3. Minta Reload
  triggerReload: () => ipcRenderer.send("minta-reload-excel"),

  // 4. GANTI FILE (Updated: Kirim status saveAsDefault)
  changeSourceFile: (saveAsDefault) =>
    ipcRenderer.invoke("ganti-file-sumber", saveAsDefault),
});
