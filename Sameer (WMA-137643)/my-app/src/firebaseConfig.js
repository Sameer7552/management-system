// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDqqVTE-7qnLvrsNfzQ1FM9e9bFnC5uAEw",
  authDomain: "management-system-824af.firebaseapp.com",
  projectId: "management-system-824af",
  storageBucket: "management-system-824af.appspot.com",
  messagingSenderId: "239497836643",
  appId: "1:239497836643:web:c402241a5cbfe90c342056"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
