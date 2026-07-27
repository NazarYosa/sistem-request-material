// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";
// const firebaseConfig = {
//   apiKey: "AIzaSyAL9J2laUoh6HJ6BAo17drk7JwO54RLnDM",
//   authDomain: "vuteq-label-system-e1af9.firebaseapp.com",
//   projectId: "vuteq-label-system-e1af9",
//   storageBucket: "vuteq-label-system-e1af9.firebasestorage.app",
//   messagingSenderId: "353276547360",
//   appId: "1:353276547360:web:dc28871bcf5b9f577bc745",
// };

// const app = initializeApp(firebaseConfig);

import { initializeApp } from "firebase/app";
import {
  collection,
  getDocs,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore
} from "firebase/firestore";

// Konfigurasi Firebase dari project vuteq-label-system
const firebaseConfig = {
  apiKey: "AIzaSyAL9J2laUoh6HJ6BAo17drk7JwO54RLnDM",
  authDomain: "vuteq-label-system-e1af9.firebaseapp.com",
  projectId: "vuteq-label-system-e1af9",
  storageBucket: "vuteq-label-system-e1af9.firebasestorage.app",
  messagingSenderId: "353276547360",
  appId: "1:353276547360:web:dc28871bcf5b9f577bc745",
};

const firebaseConfigKedua = {
  apiKey: "AIzaSyDqLnOfdPpe3yHyFTBqUcbGBdM0EJc--fY",
  authDomain: "dashboard-monitoring-925ad.firebaseapp.com",
  projectId: "dashboard-monitoring-925ad",
  storageBucket: "dashboard-monitoring-925ad.firebasestorage.app",
  messagingSenderId: "652035675282",
  appId: "1:652035675282:web:4b2e6e145bd95c855b024b"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

const appKedua = initializeApp(firebaseConfigKedua, "AppLaporan");
export const dbKedua = getFirestore(appKedua);

// 🔥 CARA BARU MENGAKTIFKAN OFFLINE MODE PERMANEN
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// export const fetchAllMasterParts = async () => {
//   try {
//     const partsCollection = collection(db, "master_parts");
//     const snapshot = await getDocs(partsCollection);

//     return snapshot.docs.map((doc) => {
//       const data = doc.data();
//       return {
//         id: doc.id,
//         partAssyFgLeft: data.partAssyFgLeft ?? "",
//         partAssyFgRight: data.partAssyFgRight ?? "",
//         partAssyNameLeft: data.partAssyNameLeft ?? "",
//         partAssyNameRight: data.partAssyNameRight ?? "",
//         partAssyFg: data.partAssyFg ?? "",
//         partAssyName: data.partAssyName ?? "",
//         mesin: data.mesin ?? "",
//       };
//     });
//   } catch (error) {
//     console.error("Gagal menarik data dari Firebase:", error);
//     return [];
//   }
// };