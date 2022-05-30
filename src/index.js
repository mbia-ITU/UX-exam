/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

import { initializeApp } from 'firebase/app';
import {
    getAuth,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
} from 'firebase/auth';

import { getFirebaseConfig } from './firebase-config.js';

// Firebase sign-in.
async function signIn() {
    // Sign in Firebase using popup auth and Google as the identity provider.
    var provider = new GoogleAuthProvider();
    await signInWithPopup(getAuth(), provider);
}

// Firebase sign-out.
function signOutUser() {
    // Sign out of Firebase.
    signOut(getAuth())
}

// Initiate firebase auth
function initFirebaseAuth() {
    // Listen to auth state changes.
    onAuthStateChanged(getAuth(), authStateObserver)
}

// Returns the signed-in user's profile Pic URL.
function getProfilePicUrl() {
    return getAuth().currentUser.photoURL || '/images/profile_placeholder.png'
}

// Returns the signed-in user's display name.
function getUserName() {
    return getAuth().currentUser.displayName
}

// Returns true if a user is signed-in.
function isUserSignedIn() {
    return !!getAuth().currentUser
}

// Triggers when the auth state change for instance when the user signs-in or signs-out.
function authStateObserver(user) {
    if (user) {
        // User is signed in!
        // Get the signed-in user's profile pic and name.
        var profilePicUrl = getProfilePicUrl()
        var userName = getUserName()

        // Set the user's profile pic and name.
        userPicElement.style.backgroundImage =
            'url(' + addSizeToGoogleProfilePic(profilePicUrl) + ')'
        userNameElement.textContent = userName

        // Show user's profile and sign-out button.
        userNameElement.removeAttribute('hidden')
        userPicElement.removeAttribute('hidden')
        signOutButtonElement.removeAttribute('hidden')

        // Hide sign-in button.
        signInButtonElement.setAttribute('hidden', 'true')

    } else {
        // User is signed out!
        // Hide user's profile and sign-out button.
        userNameElement.setAttribute('hidden', 'true')
        userPicElement.setAttribute('hidden', 'true')
        signOutButtonElement.setAttribute('hidden', 'true')

        // Show sign-in button.
        signInButtonElement.removeAttribute('hidden')
    }
}

// Returns true if user is signed-in.
function checkSignedIn() {
    // Return true if the user is signed in Firebase
    if (isUserSignedIn()) {
        return true;
    }
}

// Adds a size to Google Profile pics URLs.
function addSizeToGoogleProfilePic(url) {
    if (url.indexOf('googleusercontent.com') !== -1 && url.indexOf('?') === -1) {
        return url + '?sz=150'
    }
    return url;
}

L.MakiMarkers.accessToken = "pk.eyJ1IjoiYW1hbGllaG9sbSIsImEiOiJjbDNpb3NvNnIwMWszM2VvN3M3M21jZWtlIn0.JiznQK_c9HSqaW39rlZRiA";

function initMap(position) {
    var map = L.map('map').setView([position.coords.latitude, position.coords.longitude], 13);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW1hbGllaG9sbSIsImEiOiJjbDNpb3NvNnIwMWszM2VvN3M3M21jZWtlIn0.JiznQK_c9HSqaW39rlZRiA', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiYW1hbGllaG9sbSIsImEiOiJjbDNpb3NvNnIwMWszM2VvN3M3M21jZWtlIn0.JiznQK_c9HSqaW39rlZRiA'
    }).addTo(map);
    var icon = L.MakiMarkers.icon({ icon: "car", color: "#4287f5", size: "m" });
    L.marker([position.coords.latitude, position.coords.longitude], { icon: icon }).addTo(map);
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(initMap);
    } else {
        alert("Could not get get location")
    }
}

window.onload = function() {
    getLocation()
}



// Shortcuts to DOM Elements.
var userPicElement = document.getElementById('user-pic')
var userNameElement = document.getElementById('user-name')
var signInButtonElement = document.getElementById('sign-in')
var signOutButtonElement = document.getElementById('sign-out')

// Saves message on form submit.
signOutButtonElement.addEventListener('click', signOutUser)
signInButtonElement.addEventListener('click', signIn)

const firebaseAppConfig = getFirebaseConfig()
initializeApp(firebaseAppConfig)
initFirebaseAuth()