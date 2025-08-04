// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyChr1TSTg97Ggxm-gHR6_QTX-w1CEvigds",
  authDomain: "saude-facil-99832.firebaseapp.com",
  projectId: "saude-facil-99832",
  storageBucket: "saude-facil-99832.firebasestorage.app",
  messagingSenderId: "455583316123",
  appId: "1:455583316123:web:a048e2629ded6a5712ee3e"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
