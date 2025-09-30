import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
export const firebaseConfig = {
  apiKey: "AIzaSyDegk1oK0xV8TgrZcwbkRLA2VgzkGK_1MM",
  authDomain: "pmqrtabuk.firebaseapp.com",
  projectId: "pmqrtabuk",
  storageBucket: "pmqrtabuk.firebasestorage.app",
  messagingSenderId: "305570616285",
  appId: "1:305570616285:web:4f6839fd08b8b5aa131c34"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

