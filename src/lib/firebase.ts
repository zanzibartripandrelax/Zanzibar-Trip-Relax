import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const dbId = (firebaseConfig as any).firestoreDatabaseId;
export const db = dbId ? getFirestore(app, dbId) : getFirestore(app);
export const auth = getAuth(app);

export default app;
