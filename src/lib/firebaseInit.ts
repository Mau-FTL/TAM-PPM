
// src/lib/firebaseInit.ts
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getStorage, type FirebaseStorage } from 'firebase/storage'; // Added import
import { getDatabase, type FirebaseDatabase } from 'firebase/database'; // Import Realtime Database

let app: FirebaseApp | undefined;
let storage: FirebaseStorage | undefined; // Added storage variable
let database: FirebaseDatabase | undefined; // Add database variable

// Firebase configuration provided by the user
const firebaseConfig = {
  apiKey: "AIzaSyA6tItnRtV0kHjxFnkT_oW202SgeGhwWvw",
  authDomain: "tam-ppm.firebaseapp.com",
  databaseURL: "https://tam-ppm-default-rtdb.firebaseio.com",
  projectId: "tam-ppm",
  storageBucket: "tam-ppm.firebasestorage.app", // Corrected based on user input
  messagingSenderId: "548650461110",
  appId: "1:548650461110:web:4f85f05d54775c6a93c317"
};

// Check if all essential config values are present
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.warn(
    `WARNING: Firebase initialization skipped. Essential Firebase configuration values are missing or invalid in the hardcoded config. ` +
    "Please ensure they are correctly set."
  );
  // app and storage remain undefined
} else {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      if (app) { // Ensure app is initialized before getting storage
        storage = getStorage(app);
        database = getDatabase(app); // Initialize Realtime Database
      }
      console.log("Firebase initialized successfully with user-provided hardcoded config.");
    } catch (error) {
      console.error("Firebase initialization error with user-provided hardcoded config:", error);
      app = undefined;
      storage = undefined; // Ensure storage is undefined on error
      database = undefined; // Ensure database is undefined on error
    }
  } else {
    app = getApp();
    if (app) {
      // If app is already initialized, get the existing storage and database instances
      storage = getStorage(app);
      database = getDatabase(app);
    }
    if (app) { // Ensure app exists before getting storage
        storage = getStorage(app);
    }
    console.log("Firebase app already initialized (user-provided hardcoded config).");
  }
}

export { app, storage, database }; // Export app, storage, and database
