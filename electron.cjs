const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const chokidar = require("chokidar");
const fs = require("fs");

// --- LOKASI PENYIMPANAN CONFIG ---
// Ini akan membuat file 'config.json' di folder AppData user (Aman & Persisten)
const USER_DATA_PATH = app.getPath("userData");
const CONFIG_FILE = path.join(USER_DATA_PATH, "config.json");

// --- VARIABLE GLOBAL ---
let mainWindow;
let watcher = null;
let currentExcelPath = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  if (app.isPackaged) {
    // Mode EXE: Baca file hasil build
    mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
  } else {
    // Mode Coding: Baca localhost
    mainWindow.loadURL("http://localhost:5173");
  }

  // Saat aplikasi siap, Load Config dulu, baru baca file
  mainWindow.webContents.on("did-finish-load", () => {
    loadConfigAndStart();
  });
}



// === FUNGSI PENGENDALI WATCHER ===
function startWatchingFile(filePath) {
  // 1. Matikan watcher lama jika ada
  if (watcher) {
    watcher.close();
  }

  // === PERBAIKAN PENTING: CEK APAKAH PATH ADA ===
  // Kalau filePath masih null (User belum pilih file), stop disini. Jangan error.
  if (!filePath) {
     console.log("Menunggu user memilih file...");
     if (mainWindow) {
        // Kirim sinyal ke React supaya Header tulisannya "Belum Ada File"
        mainWindow.webContents.send("info-path-update", "Belum Ada File Dipilih");
     }
     return;
  }
  // ===============================================

  // 2. Cek file fisik ada atau tidak
  if (!fs.existsSync(filePath)) {
    console.error("File tidak ditemukan:", filePath);
    if (mainWindow) {
        mainWindow.webContents.send("excel-error", `File tidak ditemukan: ${filePath}`);
    }
    return;
  }

  // 3. Baca File & Kirim ke React (Initial Load)
  try {
    console.log(`Memulai memantau: ${filePath}`);
    const fileData = fs.readFileSync(filePath);
    if (mainWindow) {
      mainWindow.webContents.send("excel-update-otomatis", fileData);
      mainWindow.webContents.send("info-path-update", filePath);
    }
  } catch (err) {
    console.error("Gagal baca file:", err);
  }

  // 4. Pasang Watcher
  watcher = chokidar.watch(filePath, {
    persistent: true,
    usePolling: true,
    interval: 1000,
  });

  watcher.on("change", (path) => {
    console.log("File berubah! Mengirim update...");
    try {
      const fileData = fs.readFileSync(path);
      if (mainWindow) {
        mainWindow.webContents.send("excel-update-otomatis", fileData);
      }
    } catch (err) {
      console.error("Gagal baca update:", err);
    }
  });
}

// === FUNGSI: MEMBACA CONFIG DARI HARSDISK ===
function loadConfigAndStart() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const rawData = fs.readFileSync(CONFIG_FILE);
      const config = JSON.parse(rawData);

      // Jika ada path tersimpan, pakai itu!
      if (config.lastFilePath && fs.existsSync(config.lastFilePath)) {
        console.log("📂 Menggunakan Path dari Config:", config.lastFilePath);
        currentExcelPath = config.lastFilePath;
      }
    }
  } catch (error) {
    console.error("Gagal baca config, menggunakan default.", error);
  }

  // Mulai memantau file (entah dari config atau default)
  startWatchingFile(currentExcelPath);
}

// === FUNGSI: MENYIMPAN CONFIG KE HARDISK ===
function savePathToConfig(newPath) {
  try {
    const configData = { lastFilePath: newPath };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(configData, null, 2));
    console.log("💾 Path berhasil disimpan sebagai Default:", newPath);
  } catch (error) {
    console.error("Gagal menyimpan config:", error);
  }
}


app.whenReady().then(() => {
  createWindow();

  ipcMain.on("minta-reload-excel", () => {
    if (currentExcelPath && fs.existsSync(currentExcelPath)) {
      const fileData = fs.readFileSync(currentExcelPath);
      mainWindow.webContents.send("excel-update-otomatis", fileData);
    }
  });

  // === UPDATE LOGIC GANTI FILE ===
  // Menerima parameter 'saveAsDefault' dari React
  ipcMain.handle("ganti-file-sumber", async (event, saveAsDefault) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openFile"],
      filters: [{ name: "Excel Files", extensions: ["xlsx", "xls"] }],
    });

    if (result.canceled) {
      return { success: false, message: "Dibatalkan user" };
    }

    const newPath = result.filePaths[0];
    currentExcelPath = newPath;

    // LOGIC UTAMA: Simpan ke Config jika user minta
    if (saveAsDefault) {
      savePathToConfig(newPath);
    }

    startWatchingFile(newPath);

    return { success: true, path: newPath };
  });
});


// File akan disimpan di folder aman user (AppData)
const dbPath = path.join(app.getPath('userData'), 'vuteq_offline_db.json');

// 1. LOAD DATA (Saat aplikasi dibuka)
ipcMain.handle('db-load-local', async () => {
  try {
    // Kalau file belum ada, kita buat file kosong dulu
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify({}, null, 2), 'utf-8');
      return {};
    }
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Gagal load DB:", err);
    return {};
  }
});

// 2. SAVE DATA (Saat user simpan/hapus)
ipcMain.handle('db-save-local', async (event, data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  } catch (err) {
    console.error("Gagal save DB:", err);
    return { success: false, error: err.message };
  }
});

// 3. IMPORT DATA (Dari file JSON backup Firebase)
ipcMain.handle('db-import-local', async (event, importedData) => {
    try {
        // Timpa file lokal dengan data baru
        fs.writeFileSync(dbPath, JSON.stringify(importedData, null, 2), 'utf-8');
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
