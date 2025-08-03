// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "apiKey": "SECRET_API_KEY",
  "authDomain": "saude-b4594.firebaseapp.com",
  "projectId": "saude-b4594",
  "storageBucket": "saude-b4594.appspot.com",
  "messagingSenderId": "1057457784013",
  "appId": "1:1057457784013:web:71e9882269a23d38703a55"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
