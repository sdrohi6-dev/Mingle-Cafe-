import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

/* CRITICAL: Must pass databaseId from config as instructed by Firebase skill */
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Custom parameters to always prompt account selector if needed
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Sole authorized admin email requested by user
export const ADMIN_EMAIL = 'roha005018@gmail.com';

/**
 * Validate connection to Firestore on initialization per Firebase skill
 */
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore notice: Client is offline or establishing initial link.');
    }
  }
}
testConnection();
