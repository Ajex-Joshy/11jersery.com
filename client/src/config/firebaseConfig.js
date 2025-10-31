import { getAuth } from "firebase/auth";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDwszOp0unpbSMsjn6h4-gGEqUNdfpSiMg",
  authDomain: "jersey-d0a02.firebaseapp.com",
  projectId: "jersey-d0a02",
  storageBucket: "jersey-d0a02.firebasestorage.app",
  messagingSenderId: "211871184785",
  appId: "1:211871184785:web:a602c83e741af763ad4c30",
  measurementId: "G-N1DBJ8L8Q1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth();
