const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const chokidar = require("chokidar");
const fs = require("fs");

// --- LOKASI PENYIMPANAN DATA AMAN (AppData) ---
const USER_DATA_PATH = app.getPath("userData");
const CONFIG_FILE = path.join(USER_DATA_PATH, "config.json");
const DB_FILE = path.join(USER_DATA_PATH, "local_db_vuteq.json"); // File Database Offline
 
// 🔥 TAMBAHKAN INI BIAR MUNCUL DI TERMINAL 🔥
console.log("=================================================");
console.log("📂 LOKASI DATABASE ADA DI SINI:");
console.log(DB_FILE);
console.log("=================================================");

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
    // Mode EXE
    mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
  } else {
    // Mode Dev
    mainWindow.loadURL("http://localhost:5173");
  }

  // Saat aplikasi siap, Load Config dulu untuk cari path Excel terakhir
  mainWindow.webContents.on("did-finish-load", () => {
    loadConfigAndStart();
  });
}

// ==========================================
// 1. FUNGSI PENGENDALI WATCHER EXCEL
// ==========================================
function startWatchingFile(filePath) {
  // Matikan watcher lama jika ada
  if (watcher) watcher.close();

  // Jika belum ada file dipilih
  if (!filePath) {
    console.log("Menunggu user memilih file...");
    if (mainWindow)
      mainWindow.webContents.send("info-path-update", "Belum Ada File Dipilih");
    return;
  }

  // Cek fisik file
  if (!fs.existsSync(filePath)) {
    console.error("File tidak ditemukan:", filePath);
    if (mainWindow)
      mainWindow.webContents.send(
        "excel-error",
        `File tidak ditemukan: ${filePath}`
      );
    return;
  }

  // Baca File Pertama Kali
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

  // Pasang Watcher (Auto Reload)
  watcher = chokidar.watch(filePath, {
    persistent: true,
    usePolling: true,
    interval: 1000,
  });

  watcher.on("change", (path) => {
    console.log("File berubah! Mengirim update...");
    try {
      const fileData = fs.readFileSync(path);
      if (mainWindow)
        mainWindow.webContents.send("excel-update-otomatis", fileData);
    } catch (err) {
      console.error("Gagal baca update:", err);
    }
  });
}

// ==========================================
// 2. CONFIG LOAD/SAVE (Path Excel)
// ==========================================
function loadConfigAndStart() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE));
      if (config.lastFilePath && fs.existsSync(config.lastFilePath)) {
        console.log("📂 Menggunakan Path dari Config:", config.lastFilePath);
        currentExcelPath = config.lastFilePath;
      }
    }
  } catch (error) {
    console.error("Gagal baca config:", error);
  }

  // Jalanin watcher (entah pathnya ada atau null)
  startWatchingFile(currentExcelPath);
}

function savePathToConfig(newPath) {
  try {
    fs.writeFileSync(
      CONFIG_FILE,
      JSON.stringify({ lastFilePath: newPath }, null, 2)
    );
    console.log("💾 Path disimpan:", newPath);
  } catch (error) {
    console.error("Gagal simpan config:", error);
  }
}

// ==========================================
// 3. DATABASE LOKAL HANDLERS (OFFLINE)
// ==========================================

// Handler A: LOAD DATABASE
ipcMain.handle("db-load", async () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      // Bikin file kosong kalau belum ada
      fs.writeFileSync(DB_FILE, JSON.stringify({}, null, 2), "utf-8");
      return {};
    }
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  } catch (err) {
    console.error("Gagal load DB:", err);
    return {};
  }
});

// Handler B: SAVE DATABASE
ipcMain.handle("db-save", async (event, data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Handler C: IMPORT DATABASE (Dari Backup)
ipcMain.handle("db-import", async (event, importedData) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(importedData, null, 2), "utf-8");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ==========================================
// 4. MAIN APP LISTENERS
// ==========================================
app.whenReady().then(() => {
  createWindow();

  // Listener: Reload Excel Manual
  ipcMain.on("minta-reload-excel", () => {
    if (currentExcelPath && fs.existsSync(currentExcelPath)) {
      const fileData = fs.readFileSync(currentExcelPath);
      mainWindow.webContents.send("excel-update-otomatis", fileData);
    }
  });

  // Listener: Ganti File Sumber
  ipcMain.handle("ganti-file-sumber", async (event, saveAsDefault) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openFile"],
      filters: [{ name: "Excel Files", extensions: ["xlsx", "xls"] }],
    });

    if (result.canceled) return { success: false, message: "Dibatalkan user" };

    const newPath = result.filePaths[0];
    currentExcelPath = newPath;

    if (saveAsDefault) savePathToConfig(newPath);
    startWatchingFile(newPath);

    return { success: true, path: newPath };
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
