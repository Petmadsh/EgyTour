
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBUlMNPHpgOMrrUp8VjjdWaybbtG9364cA",
    authDomain: "visit-egypt-a2516.firebaseapp.com",
    projectId: "visit-egypt-a2516",
    storageBucket: "visit-egypt-a2516.appspot.com",
    messagingSenderId: "468633162217",
    appId: "1:468633162217:web:3cc60e92abcc094a4fbb78",
    measurementId: "G-ZG9P0318YE"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);