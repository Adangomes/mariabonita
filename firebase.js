 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    collection 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCNGQDQ2LbVcebYwDEOgu7P5sKnGxP-ous",
    authDomain: "maria-7830.firebaseapp.com",
    projectId: "maria-7830",
    storageBucket: "maria-7830.appspot.com",
    messagingSenderId: "965687947792",
    appId: "1:965687947792:web:dd462ce0e7bd6c2fb29095"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const colProdutos = collection(db, "produtos");
export const colVendas = collection(db, "vendas");
export const colReservas = collection(db, "reservas");
