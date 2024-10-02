import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBe6GqkiaH3G8k9EltS6YBHXYI3jXLKmbo",
  authDomain: "library-ea8e5.firebaseapp.com",
  databaseURL: "https://library-ea8e5-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "library-ea8e5",
  storageBucket: "library-ea8e5.appspot.com",
  messagingSenderId: "1093536576537",
  appId: "1:1093536576537:web:a8a9595678b90dac8e6688",
  measurementId: "G-PGS7Q9V9W9"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
