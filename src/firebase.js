import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyAL9J2laUoh6HJ6BAo17drk7JwO54RLnDM",
  authDomain: "vuteq-label-system-e1af9.firebaseapp.com",
  projectId: "vuteq-label-system-e1af9",
  storageBucket: "vuteq-label-system-e1af9.firebasestorage.app",
  messagingSenderId: "353276547360",
  appId: "1:353276547360:web:dc28871bcf5b9f577bc745",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
