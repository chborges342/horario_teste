// firebase.js
// Este arquivo é um módulo, por isso precisa das importações


// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
  import { getDatabase, ref, push, set, onValue, remove, update } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";



// TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyBKVphDXSCKgJ0onyebhD2FQ_gK5fALQhg",
    authDomain: "sistemahorarios-de981.firebaseapp.com",
    projectId: "sistemahorarios-de981",
    storageBucket: "sistemahorarios-de981.firebasestorage.app",
    messagingSenderId: "647390917543",
    appId: "1:647390917543:web:848a6f24bf012260407c82"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

// Obtém uma referência para o Realtime Database
const database = getDatabase(app);

// Para o timestamp do servidor no Realtime Database, usa-se este objeto literal especial
const ServerValueTimestamp = { ".sv": "timestamp" };

// Torna as funções e a instância do database acessíveis globalmente
// para que o script.js possa utilizá-los sem precisar importá-los novamente.
// Isso simplifica a interconexão entre este módulo e o script.js
window.firebaseDB = database;
window.dbRef = ref;
window.dbPush = push;
window.dbSet = set;
window.dbOnValue = onValue;
window.dbRemove = remove;     // Expondo para futuras operações de exclusão (se precisar)
window.dbUpdate = update;     // Expondo para futuras operações de atualização (se precisar)
window.dbServerTimestamp = ServerValueTimestamp;

console.log("Firebase Database inicializado e funções exportadas para 'window'.");
