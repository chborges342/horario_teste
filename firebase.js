import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { 
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection  // Adicionei collection que pode ser útil
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAXbpZb2J79z-jIGP4lQPgyZ9dG5Z6FkS0",
  authDomain: "sistema-horarios.firebaseapp.com",
  projectId: "sistema-horarios",
  storageBucket: "sistema-horarios.firebasestorage.app",
  messagingSenderId: "799603590846",
  appId: "1:799603590846:web:04e0222c93387b8e3180ef"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Exporte todas as funções que você vai usar
export { db, collection, doc, getDoc, setDoc, onSnapshot };
