/**
 * To find your Firebase config object:
 * 
 * 1. Go to your [Project settings in the Firebase console](https://console.firebase.google.com/project/_/settings/general/)
 * 2. In the "Your apps" card, select the nickname of the app for which you need a config object.
 * 3. Select Config from the Firebase SDK snippet pane.
 * 4. Copy the config object snippet, then add it here.
 */
const config = {
    apiKey: "AIzaSyA9wZ09uLOeZYKOBhBdTEkhPxuc4qfvwBA",
    authDomain: "uewp22.firebaseapp.com",
    projectId: "uewp22",
    storageBucket: "uewp22.appspot.com",
    messagingSenderId: "209374884917",
    appId: "1:209374884917:web:239eb5555f2fe5b0906d7c"
};

export function getFirebaseConfig() {
    if (!config || !config.apiKey) {
        throw new Error('No Firebase configuration object provided.' + '\n' +
            'Add your web app\'s configuration object to firebase-config.js');
    } else {
        return config;
    }
}