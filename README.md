
1. Update Final package.json
Ini adalah jantung konfigurasi agar build Windows sukses. Pastikan isinya mengandung 3 poin kunci ini:

✅ Script dist: Biar bisa jalanin perintah build.

✅ Dependensi chokidar: Wajib di dependencies (bukan dev), biar aplikasi gak error pas dibuka.

✅ Config build: Settingan khusus biar jadi .exe (NSIS) dan hapus icon dulu biar gak rewel.

Copy-Paste bagian penting ini ke package.json:

JSON

{
  "name": "vuteq-label-system",
  "version": "1.0.0",
  "main": "electron.cjs", 
  
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "dist": "vite build && electron-builder"  // <--- 1. TAMBAHAN SCRIPT
  },

  "dependencies": {
    "react": "^18.2.0",
    "xlsx": "^0.18.5",
    "jsqr": "^1.4.2",
    "chokidar": "^3.5.3"  // <--- 2. WAJIB DISINI (JANGAN DI DEV)
  },

  "devDependencies": {
    "electron": "^25.3.0",
    "electron-builder": "^24.6.3",
    "vite": "^4.3.2"
  },

  // <--- 3. KONFIGURASI BUILD DI BAWAH SINI
  "build": {
    "appId": "com.vuteq.label",
    "productName": "Vuteq Label System",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron.cjs",
      "preload.cjs",
      "package.json"
    ],
    "win": {
      "target": "nsis"
      // Icon dihapus dulu biar lancar
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true
    }
  }
}

atau kalo chokidar biar gampang pindahnya "npm install chokidar --save-prod"
2. Update electron.cjs (Biar Windows Friendly)
Memastikan aplikasi bisa jalan baik saat mode coding maupun setelah jadi .exe.

Logic Path: Ubah path default jadi null (jangan hardcode path Linux).

Logic Window: Pakai app.isPackaged untuk membedakan load URL localhost vs file index.html.

JavaScript

// ...
let currentExcelPath = null; // <--- Path Default Kosong

function createWindow() {
  // ...
  if (app.isPackaged) {
    // Mode EXE: Baca file hasil build
    mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
  } else {
    // Mode Coding: Baca localhost
    mainWindow.loadURL("http://localhost:5173");
  }
}
// ...
3. Cara Eksekusi (The Golden Rule)
Ini langkah krusial yang mengatasi error Symbolic Link tadi:

Hapus Folder Lama: Hapus folder release dan dist secara manual biar bersih.

Run as Administrator:

Klik Kanan Terminal/VSCode -> "Run as Administrator"

Jalankan Perintah:
npm run dist