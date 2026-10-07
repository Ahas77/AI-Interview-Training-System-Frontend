import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, push, onValue } from 'firebase/database';

// Your Firebase config object (replace with your actual config from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyB5etGxUcSlXZ0ayfCZX4uBd-yD_jO_rlU",
  authDomain: "filton-e17c7.firebaseapp.com",
  databaseURL: 'https://filton-e17c7-default-rtdb.firebaseio.com',
  projectId: "filton-e17c7",
  storageBucket: "filton-e17c7.firebasestorage.app",
  messagingSenderId: "396605911018",
  appId: "1:396605911018:web:2ecded6cb67481b9b54c93",
  measurementId: "G-F0223GZR29"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the Realtime Database
const database = getDatabase(app);

export { database, ref, set, push, onValue };
