
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "ai-powered-mock-intervie-46e91.firebaseapp.com",
  projectId: "ai-powered-mock-intervie-46e91",
  storageBucket: "ai-powered-mock-intervie-46e91.firebasestorage.app",
  messagingSenderId: "708807387683",
  appId: "1:708807387683:web:774adf180c6da20b315f96"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider()

export {auth , provider}