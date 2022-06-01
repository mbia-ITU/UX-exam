// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

/**
 * To find your Firebase config object:
 * 
 * 1. Go to your [Project settings in the Firebase console](https://console.firebase.google.com/project/_/settings/general/)
 * 2. In the "Your apps" card, select the nickname of the app for which you need a config object.
 * 3. Select Config from the Firebase SDK snippet pane.
 * 4. Copy the config object snippet, then add it here.
 */

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDnF2BO12sJ1IaMzM0dYUB8UrE0iCLpfwU",
  authDomain: "examsproject-cefb2.firebaseapp.com",
  projectId: "examsproject-cefb2",
  storageBucket: "examsproject-cefb2.appspot.com",
  messagingSenderId: "303301852782",
  appId: "1:303301852782:web:366ed95c4f98b3e285f07f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export function getFirebaseConfig() {
    if (!config || !config.apiKey) {
        throw new Error('No Firebase configuration object provided.' + '\n' +
            'Add your web app\'s configuration object to firebase-config.js');
    } else {
        return config;
    }
}