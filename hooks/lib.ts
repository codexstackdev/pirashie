
import { initializeApp } from "firebase/app";
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyB7sQO9br5Tc_azfwijb8ojUVwXn-STD_o",
  authDomain: "kenshiejee.firebaseapp.com",
  databaseURL: "https://kenshiejee-default-rtdb.firebaseio.com",
  projectId: "kenshiejee",
  storageBucket: "kenshiejee.firebasestorage.app",
  messagingSenderId: "577540243279",
  appId: "1:577540243279:web:f7ee55b19f433bd9040f3a"
};

const app = initializeApp(firebaseConfig);


export const database = getDatabase(app);