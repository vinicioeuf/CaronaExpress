// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // 🔴 Importar Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqbT5AwhNbI03yW_oFcag9bWWGWi0wXAI",
  authDomain: "appcarona-9fdae.firebaseapp.com",
  projectId: "appcarona-9fdae",
  storageBucket: "appcarona-9fdae.firebasestorage.app",
  messagingSenderId: "147593288000",
  appId: "1:147593288000:web:5883543066ba6da9fd02a5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicializar autenticação e banco de dados
const auth = getAuth(app);
const db = getFirestore(app); // 🔴 Aqui

// Exportar ambos
export { auth, db };
