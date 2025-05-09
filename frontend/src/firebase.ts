import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use

const firebaseConfig = {
  apiKey: "AIzaSyCrTJGoWtxAg4imbz9Mz1Xvzvfvy61tZbE",
  authDomain: "nmct-futurehub.firebaseapp.com",
  projectId: "nmct-futurehub",
  storageBucket: "nmct-futurehub.firebasestorage.app",
  messagingSenderId: "720477633222",
  appId: "1:720477633222:web:5347c4d6e14e90df98b5c7",
  measurementId: "G-ER8M2MJW0M",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
