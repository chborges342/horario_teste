// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// No seu firebase.js, verifique se a configuração está EXATAMENTE igual ao seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAppeJPEhGPSxqPsyeaWmA-i3mMJNS0SFI",
  authDomain: "gestao-horarios-62d90.firebaseapp.com",
  projectId: "gestao-horarios-62d90",
  storageBucket: "gestao-horarios-62d90.appspot.com", // Corrigi o domínio aqui
  messagingSenderId: "178826790802",
  appId: "1:178826790802:web:c2553cbda489c610cb234b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, doc, setDoc, getDoc, onSnapshot };
