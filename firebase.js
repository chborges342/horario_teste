// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Sua configuração gerada
const firebaseConfig = {
  apiKey: "AIzaSyAg1DHApwNkcTJQl15oOviODtxFODoFZco",
  authDomain: "gestaohorarioseconomia.firebaseapp.com",
  projectId: "gestaohorarioseconomia",
  storageBucket: "gestaohorarioseconomia.appspot.com",
  messagingSenderId: "244016029039",
  appId: "1:244016029039:web:2064c0bbc46c0cf8ecdc9a"
};

// Inicializa o app Firebase
const app = initializeApp(firebaseConfig);

// Cria uma instância do Firestore
export const db = getFirestore(app);
