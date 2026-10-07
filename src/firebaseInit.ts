import { initializeApp } from 'firebase/app';
import {
  getMessaging,
  getToken as getFirebaseToken,
  onMessage,
  // MessagePayload,
} from 'firebase/messaging';

// Firebase configuration
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

// Initialize Messaging
const messaging = getMessaging(app);

const publicKey: string | undefined =
  'BBksD1xblgy02aJvV4eY199InnqVO5clqKAYeJRsJ1j0sZ09lSU6xILO6LV1vzhtaoKk023VC2oDTy30nGGKy_0';

if (!publicKey) {
  throw new Error(
    'VAPID key is missing. Please set REACT_APP_VAPID_KEY in your environment variables.',
  );
}

// Function to get the token
export const getToken = async (
  setTokenFound: (found: boolean) => void,
): Promise<string> => {
  let currentToken = '';

  try {
    currentToken = await getFirebaseToken(messaging, { vapidKey: publicKey });
    if (currentToken) {
      setTokenFound(true);
    } else {
      setTokenFound(false);
    }
  } catch (error) {
    console.error('An error occurred while retrieving token: ', error);
    setTokenFound(false);
  }

  return currentToken;
};

// Function to listen for incoming messages
export const onMessageListener = (callback: (payload: any) => void): void => {
  onMessage(messaging, (payload) => {
    callback(payload); // Execute callback on every message
  });
};
