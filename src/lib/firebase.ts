
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD2rS6vZEJ_jaiC_3CoqVPeB9i4d_KBpTM",
  authDomain: "kathmandureview-b49b1.firebaseapp.com",
  projectId: "kathmandureview-b49b1",
  storageBucket: "kathmandureview-b49b1.appspot.com",
  messagingSenderId: "97079237546",
  appId: "1:97079237546:web:287ac09cd9aa73e45ca9d3",
  measurementId: "G-3G6RS9DXPT"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider };
