import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBCgs9N9SQgEuSEGFP4EDwdFFvP0rDVq6E",
  authDomain: "points-golf.firebaseapp.com",
  projectId: "points-golf",
  storageBucket: "points-golf.firebasestorage.app",
  messagingSenderId: "81598997907",
  appId: "1:81598997907:web:8e59b0346b1868c5117466",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);