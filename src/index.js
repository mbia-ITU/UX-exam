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
    if (document.getElementsByClassName('history-tag')[0]){
        document.getElementsByClassName('currentRideInfo')[0].innerHTML = `<h3>You do not have any current ride </h3>`;
        document.getElementsByClassName('previous-rides')[0].innerHTML = "<h5>Please log-in to see your previous rides or end a ride</h5>";
        document.getElementsByClassName('reserved-container')[0].setAttribute('hidden', 'true')
        document.getElementsByClassName('reserved-rides')[0].innerHTML = "";
    }
    else if (document.getElementsByClassName('profile-tag')[0]){
        document.getElementById('inputName').removeAttribute('value');
        document.getElementById('inputEmail').removeAttribute('value');
        document.getElementById('inputPhone').removeAttribute('value');
        document.getElementsByClassName('card-information-column')[0].setAttribute('hidden', 'true');
        document.getElementsByClassName('save-button')[0].setAttribute('hidden', 'true');
 
    }
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

function getUserID(){
    return getAuth().currentUser.uid
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
        var userEmail = getAuth().currentUser.email
        var userPhone = getAuth().currentUser.phoneNumber
        if (userPhone == null){
            userPhone = "12345678"
        }
        if (JSON.parse(sessionStorage.getItem(getUserID())) == null){
            var userCurrent = {UserName: userName, Email: userEmail, phone: userPhone, cards: [] , userHistory: [], currentRide: "", reservedCars: [], balance: 0}
            sessionStorage.setItem(getUserID(), JSON.stringify(userCurrent))
        } 
        initHistory()
        initProfile()
        if (document.getElementsByClassName('activeHome')[0]){
            checkIfCurrentIsEmpty(document.getElementById('confirmCarRentModal'));
        }

    } else {
        // User is signed out!
        // Hide user's profile and sign-out button.
        userNameElement.setAttribute('hidden', 'true')
        userPicElement.setAttribute('hidden', 'true')
        signOutButtonElement.setAttribute('hidden', 'true')

        // Show sign-in button.
        signInButtonElement.removeAttribute('hidden')

        if (document.getElementsByClassName('history-tag')[0]){
            document.getElementsByClassName('reserved-container')[0].setAttribute('hidden', 'true');
            document.getElementsByClassName('currentRideInfo')[0].innerHTML = `<h3>You do not have any current ride </h3>`;
            document.getElementsByClassName('previous-rides')[0].innerHTML = "<h5>Please log-in to see your previous rides or end a ride</h5>";
        }
        else if (document.getElementsByClassName('profile-tag')[0]){
            document.getElementsByClassName('card-information-column')[0].setAttribute('hidden', 'true');
            document.getElementsByClassName('save-button')[0].setAttribute('hidden', 'true');
        }
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
    var icon = L.MakiMarkers.icon({ icon: "circle", color: "#8f261e", size: "m" });
    L.marker([position.coords.latitude, position.coords.longitude], { icon: icon }).addTo(map);
    carMarkers(map, position);
    loadParkingAndCharging(map);

}

function carMarkers(map) {
    for (var key in cars) {
        if (cars[key].fuelType == 'Electric') {
            var iconCar = L.MakiMarkers.icon({ icon: "car", color: "#32a852", size: "m" });
        } else {
            var iconCar = L.MakiMarkers.icon({ icon: "car", color: "#4287f5", size: "m" });
        }
        var popUpContent = `
        <div class="d-flex align-items-center flex-column my-3 carInfoMarker">
            <img src="${cars[key].pictureUrl}" width="200" class="rounded picture-Url-popup"/>
            <h3 class="car-plate-popup" > <strong>Plate: ${cars[key].plate} </strong></h4>
            <h5 class="car-fuel-left-popup"> ${cars[key].fuelLeft} left </h5>
            <h5 class="car-brand-popup">${cars[key].carBrand} </h5>
            <h5 class="car-price-popup"> ${cars[key].price} kr.-/min </h5>
            <button type="button" class="btn btn-secondary btn-lg blueBottons m-1 rentCar rounded-pill shadow-sm" data-bs-toggle="modal" data-bs-target="#confirmCarRentModal">Rent Car</button>
            <button type="button" class="btn btn-secondary btn-lg blueBottons m-1 reserveCar rounded-pill shadow-sm" data-bs-toggle="modal" data-bs-target="#confirmCarReserveModal">Reserve Car</button>
        </div>
        `;
        var marker = L.marker([cars[key].lat, cars[key].lon], { icon: iconCar }).addTo(map);
        marker.bindPopup(popUpContent);
        marker.on('click', openPopUp);
        cars[key].marker = marker
    }
}

function openPopUp(e){
    var popup = e.target.getPopup();
    var content = popup.getContent();
    sessionStorage.setItem('content', content)
    document.getElementsByClassName('rentCar')[0].addEventListener('click', handleRentCar);
    document.getElementsByClassName('reserveCar')[0].addEventListener('click', handleReserveCar);
    
}

function handleReserveCar(){
    var tmp = document.createElement('div');
    tmp.innerHTML = sessionStorage.getItem('content');
    var reserveCarInfo = document.getElementsByClassName('carInfoReserve')[0];
    var pictureUrl = tmp.getElementsByClassName('picture-Url-popup')[0].src
    var carPlate = tmp.getElementsByClassName('car-plate-popup')[0].innerText
    var fuelLeft = tmp.getElementsByClassName('car-fuel-left-popup')[0].innerText
    var carBrand = tmp.getElementsByClassName('car-brand-popup')[0].innerText
    var carPrice = tmp.getElementsByClassName('car-price-popup')[0].innerText
    reserveCarInfo.innerHTML = `
    <div class="card w-80 my-3 border-0">
            <div class="row d-flex align-items-center flex-row g-0">
                <div class="col-md-6 d-flex justify-content-center justify-content-lg-start">
                    <img src="${pictureUrl}" class="img-fluid rounded-start picture-Url" style="height: 10rem;"/>
                </div>
                <div class="col-md-6">
                    <div class="card-body">
                        <h3 class="car-plate" ><strong>${carPlate} </strong></h4>
                        <h5 class="car-brand"> ${carBrand}</h5>
                        <h5 class="car-fuel-left">${fuelLeft} </h5>
                        <h5 class="car-price">${carPrice}</h5>      
                    </div>
                </div>                    
            </div>
        </div>
    `;
    document.getElementById('chosen-date-reserve').min = new Date().toLocaleDateString('en-ca');
}

function handleRentCar(){
    var tmp = document.createElement('div');
    tmp.innerHTML = sessionStorage.getItem('content');
    var rentCarInfo = document.getElementsByClassName('carInfoRent')[0];
    var pictureUrl = tmp.getElementsByClassName('picture-Url-popup')[0].src
    var carPlate = tmp.getElementsByClassName('car-plate-popup')[0].innerText
    var fuelLeft = tmp.getElementsByClassName('car-fuel-left-popup')[0].innerText
    var carBrand = tmp.getElementsByClassName('car-brand-popup')[0].innerText
    var carPrice = tmp.getElementsByClassName('car-price-popup')[0].innerText

    rentCarInfo.innerHTML = `
    <div class="card w-80 my-3 border-0">
            <div class="row d-flex align-items-center flex-row g-0">
                <div class="col-md-6 d-flex justify-content-center justify-content-lg-start">
                    <img src="${pictureUrl}" class="img-fluid rounded-start picture-Url" style="height: 10rem;"/>
                </div>
                <div class="col-md-6">
                    <div class="card-body">
                        <h3 class="car-plate" ><strong>${carPlate} </strong></h4>
                        <h5 class="car-brand"> ${carBrand}</h5>
                        <h5 class="car-fuel-left">${fuelLeft} </h5>
                        <h5 class="car-price">${carPrice}</h5>      
                    </div>
                </div>                    
            </div>
        </div>
    `;
}

var cars = {
    car1: { carBrand: 'Renault Zoe', fuelType: 'Electric', fuelLeft: '54% battery', plate: 'AB 12345', price: '4', pictureUrl: 'images/carPhoto.jpeg', lat: '55.66006357924885', lon: '12.591008245588563', marker: '' },
    car2: { carBrand: 'Renault Zoe', fuelType: 'Benzin', fuelLeft: '21 L', plate: 'QD 21435', price: '4', pictureUrl: 'images/carPhoto.jpeg', lat: '55.657880', lon: '12.593162', marker:''},
    car3: { carBrand: 'Renault Zoe', fuelType: 'Benzin', fuelLeft: '32 L', plate: 'XD 87695', price: '4', pictureUrl: 'images/carPhoto.jpeg', lat: '55.662045', lon: '12.592516', marker: ''},
    car4: { carBrand: 'Renault Zoe', fuelType: 'Electric', fuelLeft: '43% battery', plate: 'CD 54321', price: '4', pictureUrl: 'images/carPhoto.jpeg', lat: '55.661837', lon: '12.600712', marker:''},
    car5: { carBrand: 'Renault Zoe', fuelType: 'Benzin', fuelLeft: '10 L', plate: 'FH 54321', price: '4', pictureUrl: 'images/carPhoto.jpeg', lat: '55.682406', lon: '12.526697', marker:''},
    car6: { carBrand: 'Renault Zoe', fuelType: 'Electric', fuelLeft: '50% battery', plate: 'SF 54321', price: '4', pictureUrl: 'images/carPhoto.jpeg', lat: '55.69581767760228', lon: '12.56953104032246', marker:''},
    car7: { carBrand: 'Renault Zoe', fuelType: 'Electric', fuelLeft: '80% battery', plate: 'JK 54321', price: '4', pictureUrl: 'images/carPhoto.jpeg', lat: '55.702419746125706', lon: '12.55806952100423', marker:''},
    car8: { carBrand: 'Renault Zoe', fuelType: 'Electric', fuelLeft: '21% battery', plate: 'SA 54321', price: '4', pictureUrl: 'images/carPhoto.jpeg', lat: '55.65908977855216', lon: '12.615060442998073', marker:''}
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(initMap, showError);
    } else {
        alert("Could not get get location");
    }
}

function showError(error) {
    switch(error.code) {
      case error.PERMISSION_DENIED:
       console.log("User denied the request for Geolocation.")
        break;
      case error.POSITION_UNAVAILABLE:
        console.log("Location information is unavailable.")
        break;
      case error.TIMEOUT:
        console.log("The request to get user location timed out.")
        break;
      case error.UNKNOWN_ERROR:
        console.log("An unknown error occurred.")
        break;
    }
    var coords = {latitude: 55.65907282137402,longitude: 12.590892066064018}
    initMap({coords:coords})
}

window.onload = function() {
    if (document.getElementsByClassName('activeHome')[0]){
        getLocation();
        document.getElementsByClassName('btnConfirmRent')[0].addEventListener('click', handleConfirmRent);
        document.getElementsByClassName('btnConfirmReserve')[0].addEventListener('click', handleConfirmReserve);
        addEventListenerModal(document.getElementById('confirmCarReserveModal'));
        addEventListenerModal(document.getElementById('confirmCarRentModal'));
    } 
}

function initHistory(){
    if (document.getElementsByClassName('history-tag')[0]){
        if (checkSignedIn()){
            loadCurrentRide();
            if (JSON.parse(sessionStorage.getItem(getUserID())).userHistory.length != 0){
                document.getElementsByClassName('previous-rides')[0].innerHTML = "";
                var user = JSON.parse(sessionStorage.getItem(getUserID()));
                var previousRides = user.userHistory;
                for (var i = 0; i < previousRides.length; i++) {
                    createPreviousRidesContent(previousRides[i]);
                }
            } else {
                document.getElementsByClassName('previous-rides')[0].innerHTML = "<h5>Please log-in to see your previous rides or end a ride</h5>";
            }
            if (JSON.parse(sessionStorage.getItem(getUserID())).reservedCars.length =! 0){
                document.getElementsByClassName('reserved-container')[0].removeAttribute('hidden');
                var user = JSON.parse(sessionStorage.getItem(getUserID()));
                var reserved = user.reservedCars;
                for (var i = 0; i < reserved.length; i++) {
                    createReservedCars(reserved[i]);
                }
            }
            addEventListenerModal(document.getElementById('confirmEndRideModal'));
            document.getElementsByClassName('btnConfirmStartNow')[0].addEventListener('click', handleStartNowClicked);
            checkIfCurrentIsEmpty(document.getElementById('confirmRentModal'));
            document.getElementsByClassName('edit-reservation-btn')[0].addEventListener('click', handleEditReservation);
            document.getElementsByClassName('save-button')[0].addEventListener('click', handleSaveClickedReservation)
        }
    }
}

function initProfile(){
    if (document.getElementsByClassName('profile-tag')[0]){
        var user = JSON.parse(sessionStorage.getItem(getUserID()))
        document.getElementsByClassName('welcomeUser')[0].innerText = `Hi ${user.UserName}!`;
        document.getElementById('inputName').setAttribute('value', user.UserName)
        document.getElementById('inputEmail').setAttribute('value', user.Email)
        document.getElementById('inputPhone').setAttribute('value', user.phone)
        document.getElementById('current-balance').innerHTML = `Current balance: ${user.balance}kr.-`
        document.getElementsByClassName('addCardConfirm')[0].addEventListener('click', addCardClicked)
        document.getElementsByClassName('save-button')[0].addEventListener('click', saveButtonClicked)
        document.getElementsByClassName('updateBalanceButton')[0].addEventListener('click', handleUpdateBalance)
        document.getElementsByClassName('updateBalanceConfirmed')[0].addEventListener('click', handleBalanceConfirmed)
        document.getElementsByClassName('card-information-column')[0].removeAttribute('hidden')
        checkCards(updateBalanceModal)
        if (user.cards != []){
            loadCards()
        }
    }
    
}

function addEventListenerModal(modal){
    var bool = true
        modal.addEventListener('show.bs.modal', function(event) {
            if (checkSignedIn() != true) {
                bool = false
                alert('Please sign in!')
                return event.preventDefault()
            }
        })
}

function setCheckboxes(layers, map){
    var checkbox1 = document.getElementById('charging-stations');
    checkbox1.addEventListener('change', function() {
        if (checkbox1.checked == true){
            layers[0].addTo(map);
        } else {
            layers[0].remove(map);
        }
    });
    var checkbox2 = document.getElementById('parking-garages');
    checkbox2.addEventListener('change', function() {
        if (checkbox2.checked == true){
            layers[1].addTo(map);
        } else {
            layers[1].remove(map);
        }
    });
    var checkbox3 = document.getElementById('parking-spots');
    checkbox3.addEventListener('change', function() {
        if (checkbox3.checked == true){
            layers[2].addTo(map);
        } else {
            layers[2].remove(map);
        }
    });
}

function loadParkingAndCharging(map){
    var iconParkingGarage = L.MakiMarkers.icon({ icon: "parking-garage", color: "#0a0a0a", size: "m" });     
    var geojsonLayerGarage = new L.GeoJSON.AJAX(["geojson/parkingGarage.geojson"], {
        pointToLayer: function(geoJsonPoint, latlng) {
          return L.marker(latlng, { icon: iconParkingGarage });
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(`
                <div class="container">
                    <h3>Parking Garage</h3>
                    <p>Info: ${feature.properties.bemaerkning}</p>
                    <div>
                        <p>Address: ${feature.properties.vejnavn} ${feature.properties.husnr}</p>
                        <p>${feature.properties.postdistrikt}</p>
                    </div>
                    <p>Spaces: ${feature.properties.antal_pladser}</p>
                    <p>Type: ${feature.properties.type_beskrivelse}</p>
                </div>
            `);
          }
      });  
    geojsonLayerGarage.addTo(map);  
    var geojsonLayerSpots = new L.GeoJSON.AJAX(["geojson/parkingSpots.geojson"], {
        onEachFeature: function (feature, layer) {
            var restriction = '';
            if (feature.restriktion == 'ja'){
                restriction = `<p>Restriction: ${feature.properties.restriktionstype} ${feature.properties.restriktionstekst}`
            }
            var info = '';
            if (feature.properties.bemaerkning != null){
                info = `<p>Info: ${feature.properties.bemaerkning}</p>`
            }
            layer.bindPopup(`
                <div class="container">
                    <h3>Parking Spot</h3>
                    ${info}
                    <p>Address: ${feature.properties.vejnavn}</p>
                    <p>Spaces: ${feature.properties.antal_pladser}</p>
                    <p>Type: ${feature.properties.p_type}</p>
                    ${restriction}
                </div>
            `);
          }
      });  
      geojsonLayerSpots.addTo(map);

    var iconCharging = L.MakiMarkers.icon({ icon: "charging-station", color: "#113815", size: "s" });     
    var geojsonLayerCharging = new L.GeoJSON.AJAX(["geojson/elCharging.geojson"], {
        pointToLayer: function(geoJsonPoint, latlng) {
          return L.marker(latlng, {icon: iconCharging});
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(`
                <div class="container">
                    <h3>Charging</h3>
                    <p>Time Limit: ${feature.properties.tidsbegraensning}</p>
                    <div>
                        <p>Address: ${feature.properties.vejnavn} ${feature.properties.husnr}</p>
                    </div>
                    <p>Spaces: ${feature.properties.antal_udtag}</p>
                </div>
            `);
          }
      });  
      geojsonLayerCharging.addTo(map);
      setCheckboxes([geojsonLayerCharging, geojsonLayerGarage, geojsonLayerSpots], map) 
}

function loadCurrentRide(){
    var currentRideInfoLabel = document.getElementsByClassName('currentRideInfo')[0];
    var user = JSON.parse(sessionStorage.getItem(getUserID()))
    if (user.currentRide != "" ){
        currentRideInfoLabel.innerHTML = user.currentRide;
        document.getElementById('endRidebtn').addEventListener('click', handleEndRideClicked);
        startTimeCounter();        
    } else {
        currentRideInfoLabel.innerHTML = `<h3>You do not have any current ride </h3>
                                            <h5>Go to the front page to rent a car :)</h5>`
    }
    document.getElementById('btnConfirmEndedRide').addEventListener('click', handleEndRide);   
}

function saveButtonClicked(){
    var user = JSON.parse(sessionStorage.getItem(getUserID()))
    var userName = document.getElementById('inputName').value
    var email = document.getElementById('inputEmail').value
    var phone = document.getElementById('inputPhone').value
    if (userName != "" && userName != user.userName){
        user.userName = userName
    }
    if (email != "" && email != user.Email){
        user.Email = email
    }
    if (phone != "" && phone != user.phone){
        user.phone = phone
    }
    sessionStorage.setItem(getUserID(), JSON.stringify(user));
    alert('Profile updated!')

}

function addCardClicked(){
    var cardHolderName = document.getElementById('addCardNameHolder').value
    var cardNumber = document.getElementById('cardNumberAddCard').value
    var expireMonth = document.getElementById('expireMonthAddCard').value
    var expireYear = document.getElementById('expireYearAddCard').value
    var cvv = document.getElementById('cvvAddCard').value
    var radioButtons = document.getElementsByClassName('credit-card-radio')
    var selectedType;
    for (var i = 0; i < radioButtons.length; i++){
        if (radioButtons[i].checked) {
            selectedType = radioButtons[i].value;
        }
    };     
    var last4 = cardNumber.slice(cardNumber.length - 4);
    var expire = expireMonth + "/" + expireYear;
    var cardContainer = document.createElement('div');
    cardContainer.classList.add('w-100')
    cardContainer.classList.add('d-flex')
    cardContainer.classList.add('flex-column')          
    cardContainer.classList.add('flex-md-row') 
    cardContainer.classList.add('align-items-center')         
    var cardContent = `
            <div class="credit-card ${selectedType} selectable">
                <div hidden class="card-number">${cardNumber}
                </div>
                <div class="credit-card-last4">
                    ${last4}
                </div>
                <div class="credit-card-expiry">
                    ${expire}
                </div>
            </div>
            <div class="d-flex align-items-center">
                <button class="btn btn-danger button-remove-card rounded-pill shadow-sm" type="button">Remove</button>
            </div>`
    cardContainer.innerHTML = cardContent;
    document.getElementsByClassName('card-information')[0].append(cardContainer)
    cardContainer.getElementsByClassName('button-remove-card')[0].addEventListener('click', removeCard)
    var card = {cardHolderName: cardHolderName, cardNumber: cardNumber, expireMonth: expireMonth, expireYear: expireYear, cvv: cvv, selectedType: selectedType}
    var user = JSON.parse(sessionStorage.getItem(getUserID()));
    var cards = user.cards
    if (cards==null){
        user.cards = [card];
        sessionStorage.setItem(getUserID(), JSON.stringify(user));
    } else {
        var newArray = [card];
        var i;
        for (i = 0; i < cards.length; i++) {
            newArray.push(cards[i]);
        }
        user.cards = newArray;
        sessionStorage.setItem(getUserID(), JSON.stringify(user));
    }    
}

function removeCard(event){
    var button = event.target;
    var container = button.parentElement.parentElement;
    var user = JSON.parse(sessionStorage.getItem(getUserID()))
    var cards = user.cards;
    for(var i = 0; i < cards.length; i++){
        if (parseInt(cards[i].cardNumber) == parseInt(container.getElementsByClassName('card-number')[0].innerText)){
            cards.splice(i, 1);
            user.cards = cards;
        }
    }
    container.remove();
    sessionStorage.setItem(getUserID(), JSON.stringify(user));
}

function loadCards(){
    var user = JSON.parse(sessionStorage.getItem(getUserID()));
    var cards = user.cards
    for (var i = 0; i < cards.length; i++) {
            var last4 = cards[i].cardNumber.slice(cards[i].cardNumber.length - 4);
            var expire = cards[i].expireMonth + "/" + cards[i].expireYear;
            var cardContainer = document.createElement('div');
            cardContainer.classList.add('w-100')
            cardContainer.classList.add('d-flex')
            cardContainer.classList.add('flex-column')          
            cardContainer.classList.add('flex-md-row')              
            cardContainer.classList.add('align-items-center')          
            var cardContent = `
                <div class="credit-card ${cards[i].selectedType} selectable">
                    <div hidden class="card-number">${cards[i].cardNumber}
                    </div>
                    <div class="credit-card-last4">
                        ${last4}
                    </div>
                    <div class="credit-card-expiry">
                        ${expire}
                    </div>
                </div>
                <div class="d-flex align-items-center">
                    <button class="btn btn-danger button-remove-card rounded-pill shadow-sm" type="button">Remove</button>
                </div>`
            cardContainer.innerHTML = cardContent;
            document.getElementsByClassName('card-information')[0].append(cardContainer)
            cardContainer.getElementsByClassName('button-remove-card')[0].addEventListener('click', removeCard)
        
    }
}

function handleUpdateBalance(){
    var user = JSON.parse(sessionStorage.getItem(getUserID()));
    var cards = user.cards;
    document.getElementsByClassName('group-saved-creditcards')[0].innerHTML = '';
    if (cards.length != 0){
        for (var i = 0; i < cards.length; i++) {
            var last4 = cards[i].cardNumber.slice(cards[i].cardNumber.length - 4);
            var cardContainer = document.createElement('label');  
            cardContainer.classList.add('flex-row') 
            cardContainer.classList.add('d-flex') 
            cardContainer.classList.add('border')  
            cardContainer.classList.add('shadow-sm')  
            cardContainer.classList.add('rounded-pill')   
            cardContainer.classList.add('mb-3')    
            cardContainer.classList.add('py-3')   
            cardContainer.classList.add('px-4')        
            var cardContent =  `
                    <span><input type="radio" name="payment-source"></span>
                    <div id="saved-card">**** **** **** ${last4}</div>`
            cardContainer.innerHTML = cardContent;
            document.getElementsByClassName('group-saved-creditcards')[0].append(cardContainer)
        } 
    } else {
        document.getElementsByClassName('group-saved-creditcards')[0].parentElement.parentElement.classList.remove('border')
    }
}

function checkCards(modal){
    var bool = true;
        modal.addEventListener('show.bs.modal', function(event) {
            var user = JSON.parse(sessionStorage.getItem(getUserID()));
            if (user.cards.length == 0) {
                bool = false
                alert('Please add a card before updating your balance')
                return event.preventDefault()
                
            }
        });
}

function handleBalanceConfirmed(){
    var update = document.getElementById('updateBalanceAmount').value;
    updateBalance(update)
    var user = JSON.parse(sessionStorage.getItem(getUserID()));
    document.getElementById('current-balance').innerHTML = `Current balance: ${user.balance}kr.-`
}

function updateBalance(amount){
    var user = JSON.parse(sessionStorage.getItem(getUserID()));
    user.balance += parseInt(amount);
    sessionStorage.setItem(getUserID(), JSON.stringify(user));

}

function handleConfirmRent(event){
    var button = event.target;
    var carInfo = button.parentElement.parentElement;
    var pictureUrl = carInfo.getElementsByClassName('picture-Url')[0].src;
    var carBrand = carInfo.getElementsByClassName('car-brand')[0].innerText;
    var carPlate = carInfo.getElementsByClassName('car-plate')[0].innerText;
    var carPrice = carInfo.getElementsByClassName('car-price')[0].innerText;
    const currentDate = new Date()
    var timeDate = currentDate.getDate() + "/" + (currentDate.getMonth() + 1) + " " + checkTime(currentDate.getHours()) + ":" + checkTime(currentDate.getMinutes());
    var currentRideContent = `
        <div class="card w-80 rounded-3-card rounded-md-pill shadow-sm" >
            <div class="row d-flex align-items-center flex-row g-0 me-4">
                <div class="col-md-4 d-flex justify-content-center justify-content-lg-start mt-2 mt-md-0">
                    <img src="${pictureUrl}" class="img-fluid rounded-pill picture-Url" style="height: 15rem;"/>
                </div>
                <div class="col-md-8">
                    <div class="card-body d-flex flex-row row g-0">
                        <div class="col-md-8">
                            <h3 class="car-plate card-title" > <strong>${carPlate} </strong></h4>
                            <h5 class="car-brand card-text">${carBrand} </h5>  
                            <h4 class="card-text ride-date">${timeDate}</h5>
                            <h6 id="timerRented" class="card-text timerRented"></h6>
                            <h6 id="car-price-current" class="card-text car-price-current">Price: ${carPrice}</h6>
                            <h6 id="totalPriceCurrentRide" class="card-text totalPriceCurrentRide">Total: time*price</h6>
                        </div>
                        <div class="d-flex align-items-md-end align-items-center flex-column justify-content-evenly col-md-4 ps-3">
                            <button type="button" class="btn btn-primary float-end rounded-pill shadow-sm" id="endRidebtn" data-bs-toggle="modal" data-bs-target="#confirmEndRideModal">End ride</button>
                        </div>  
                    </div>
                </div>                     
            </div>
        </div>
    `;
    var user = JSON.parse(sessionStorage.getItem(getUserID()))
    user.currentRide = currentRideContent;
    sessionStorage.setItem(getUserID(), JSON.stringify(user));
    var startTimeCar = Math.floor(Date.now() / 1000);
    sessionStorage.setItem('startTime', startTimeCar);
}

function startTimeCounter() {
    var now = Math.floor(Date.now() / 1000); 
    var startTime = parseInt(sessionStorage.getItem('startTime'));
    var diff = now - startTime; 

    var h = Math.floor((diff/60)/60);
    var m = Math.floor(diff / 60);
    var s = Math.floor(diff % 60);

    h = checkTime(h);
    m = checkTime(m);
    s = checkTime(s);

    var timerString = "Time: " + h + ":" + m + ":" + s;
    document.getElementById("timerRented").innerHTML = timerString; 

    var t = setTimeout(startTimeCounter, 1000);
    sessionStorage.setItem('timeout', t);
    var priceElement = document.getElementById('car-price-current');
    var price = priceElement.innerText.replace('kr.-/min', '');
    var price = parseInt(price.replace('Price:', ''));
    document.getElementById('totalPriceCurrentRide').innerHTML = "Total: " + Math.floor((m * price) + 4) + "kr.-";
}

function checkTime(i) {
    if (i < 10) {i = "0" + i}; 
    return i;
}

function startCountDown(element, object) {
    var chosenDate = object.chosenDate;
    chosenDate = new Date(chosenDate);
    var chosenHour = object.chosenHour;
    var chosenMin = object.chosenMin;
    chosenDate.setHours(chosenHour);
    chosenDate.setMinutes(chosenMin);

    var x = setInterval(function() {
        var countDownDate = chosenDate.getTime();
        var now = new Date().getTime();
        var diff = countDownDate - now;

        var d = Math.floor(diff / (1000 * 60 * 60 * 24));
        var h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        var s = Math.floor((diff % (1000 * 60)) / 1000);

        d = checkTime(d);
        h = checkTime(h);
        m = checkTime(m);
        s = checkTime(s);

        element.getElementsByClassName('time-left-reserved')[0].innerHTML = `
        <div class="col">
            <h6>Time left:</h6>
        </div> 
        <div class="col">
            <div class="row">
                <h5 class="ms-2 time-left-info" style="word-spacing: 2.5em;">${d} ${h} ${m} ${s}</h5>
                <h6 style="word-spacing: 1.25em;">days hours minutes seconds</h6>
            </div>
        </div>`;
        if (diff < 0) {
            clearInterval(x);
            removeReservedCar(element);
        }
    }, 1000); 
}

function startCountDownViewRide(object){
    var chosenDate = object.chosenDate;
    chosenDate = new Date(chosenDate);
    var chosenHour = object.chosenHour;
    var chosenMin = object.chosenMin;
    chosenDate.setHours(chosenHour);
    chosenDate.setMinutes(chosenMin);
    var x = setInterval(function() {
        var countDownDate = chosenDate.getTime();
        var now = new Date().getTime();
        var diff = countDownDate - now;

        var d = Math.floor(diff / (1000 * 60 * 60 * 24));
        var h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        var s = Math.floor((diff % (1000 * 60)) / 1000);

        d = checkTime(d);
        h = checkTime(h);
        m = checkTime(m);
        s = checkTime(s);
    
        document.getElementsByClassName('time-left-reserved-view')[0].innerHTML = `
        <div class="col">
            <h6>Time left:</h6>
        </div> 
        <div class="col">
            <div class="row">
                <h5 class="ms-2 time-left-info" style="word-spacing: 2.5em;">${d} ${h} ${m} ${s}</h5>
                <h6 style="word-spacing: 1.25em;">days hours minutes seconds</h6>
            </div>
        </div>`
        if (diff < 0) {
            clearInterval(x);
            document.getElementsByClassName('time-left-reserved-view')[0].innerHTML = "EXPIRED";
        }
        
    }, 1000);
    sessionStorage.setItem('countDown', x) 
}

function handleConfirmReserve(event){
    var button = event.target;
    var carInfoReserve = button.parentElement.parentElement;
    var pictureUrl = carInfoReserve.getElementsByClassName('picture-Url')[0].src;
    var carBrand = carInfoReserve.getElementsByClassName('car-brand')[0].innerText;
    var carPlate = carInfoReserve.getElementsByClassName('car-plate')[0].innerText;
    var carPrice = carInfoReserve.getElementsByClassName('car-price')[0].innerText;
    var fuelLeft = carInfoReserve.getElementsByClassName('car-fuel-left')[0].innerText;
    var chosenDate = document.getElementById('chosen-date-reserve').value;
    var chosenHour = document.getElementById('chosen-hour-reserve').value;
    var chosenMin = document.getElementById('chosen-minute-reserve').value;
    var car = {pictureUrl: pictureUrl, carBrand: carBrand, carPlate: carPlate, carPrice: carPrice, chosenDate: chosenDate, chosenHour: chosenHour, chosenMin: chosenMin, fuelLeft: fuelLeft}
    var user = JSON.parse(sessionStorage.getItem(getUserID()));
    var reserved = user.reservedCars;
        if (reserved==null){
            user.reservedCars = [car];
            sessionStorage.setItem(getUserID(), JSON.stringify(user));
        } else {
            var newArray = [car];
            for (var i = 0; i < reserved.length; i++) {
                newArray.push(reserved[i]);
            }
            user.reservedCars = newArray;
            sessionStorage.setItem(getUserID(), JSON.stringify(user));
        }
}

function createReservedCars(object){
    var reservedRideContent = `
        <div class="card w-80 rounded-3-card rounded-md-pill shadow-sm" >
            <div class="row d-flex align-items-center flex-row g-0 me-4">
                <div class="col-md-4 d-flex justify-content-center justify-content-lg-start mt-2 mt-md-0">
                    <img src="${object.pictureUrl}" class="img-fluid rounded-pill picture-Url" style="height: 15rem;"/>
                </div>
                <div class="col-md-8">
                    <div class="card-body d-flex flex-row row g-0 ">
                        <div class="col-md-8">
                            <h4 class="car-plate card-title"> <strong>${object.carPlate} </strong></h4>
                            <h5 class="car-brand card-text" hidden>${object.carBrand} </h5>  
                            <h5 class="card-text ride-date">Reserved time: ${object.chosenDate} ${object.chosenHour}:${object.chosenMin}</h5>
                            <div class="time-left-reserved card-text">
                                <h6>Time left:  00 00 00 00</h6> 
                                <h6>days  hours  minutes  seconds </h6>
                            </div>
                            <h6 class="card-text car-fuel-left" hidden>${object.fuelLeft}</h6>
                            <h6 id="car-price" class="card-text car-price" hidden>Price: ${object.carPrice}</h6>
                        </div>
                        <div class="d-flex align-items-md-end align-items-center flex-column justify-content-evenly col-md-4">
                            <button type="button" class="btn btn-secondary rounded-pill startRidebtn shadow-sm mb-1" data-bs-toggle="modal" data-bs-target="#confirmRentModal">Start ride now</button>
                            <button type="button" class="btn btn-primary rounded-pill viewDetails shadow-sm mb-1" data-bs-toggle="modal" data-bs-target="#viewDetailsModal">View details</button>
                            <button type="button" class="btn btn-danger rounded-pill cancelReservedbtn shadow-sm mb-1" data-bs-toggle="modal" data-bs-target="#cancelReservedModal">Cancel</button>
                        </div>  
                    </div>
                </div>                      
            </div>
        </div>
    `;
        var element = document.getElementsByClassName('reserved-rides')[0]
        var reservedCar = document.createElement('div');
        reservedCar.classList.add('reserved-car');
        reservedCar.classList.add('mb-5');
        reservedCar.innerHTML = reservedRideContent;
        startCountDown(reservedCar, object);
        element.append(reservedCar);
        reservedCar.getElementsByClassName('cancelReservedbtn')[0].addEventListener('click', handleCancelClicked);
        reservedCar.getElementsByClassName('startRidebtn')[0].addEventListener('click', handleConfirmRentStartNow);
        reservedCar.getElementsByClassName('viewDetails')[0].addEventListener('click', handleViewDetails);
}

var viewDetailsElement

function handleViewDetails(event){
    var button = event.target;
        var carInfo = button.parentElement.parentElement.parentElement.parentElement;
        var pictureUrl = carInfo.getElementsByClassName('picture-Url')[0].src;
        var carBrand = carInfo.getElementsByClassName('car-brand')[0].innerText;
        var fuelLeft = carInfo.getElementsByClassName('car-fuel-left')[0].innerText;
        var carPlate = carInfo.getElementsByClassName('car-plate')[0].innerText;
        var carPrice = carInfo.getElementsByClassName('car-price')[0].innerText;
        var timeLeft = carInfo.getElementsByClassName('time-left-reserved')[0].innerHTML;
        var time = carInfo.getElementsByClassName('ride-date')[0].innerText;
        viewDetailsElement = carInfo;
        var content = `
        <div class="card w-80 my-5 border-0" >
            <div class="row d-flex align-items-center flex-row g-0">
                <div class="col-md-6 d-flex justify-content-center justify-content-lg-start">
                    <img src="${pictureUrl}" class="img-fluid rounded-start picture-Url" style="height: 10rem;"/>
                </div>
                <div class="col-md-6">
                    <div class="card-body">
                        <h3 class="car-plate" > <strong>${carPlate} </strong></h4>
                        <h5 class="car-brand">${carBrand} </h5>
                        <h5 class="car-price">${carPrice}</h5> 
                    </div>
                </div>                    
            </div>
            <div class="mt-3"
            <h5 class="car-fuel-left"> ${fuelLeft}</h5>
            <h5 class="ride-date">${time}</h5>
            <div class="time-left-reserved-view card-text"> ${timeLeft}
            </div>   
        </div>
        `;
        document.getElementsByClassName('viewDetailsInfo')[0].innerHTML = content;
        clearInterval(sessionStorage.getItem('countDown'));
        var str = time.replace('Reserved time: ', '').replace(':', ' ');
        var strArray = str.split(' ');
        var object = {chosenDate: strArray[0], chosenHour: strArray[1], chosenMin: strArray[2]};
        startCountDownViewRide(object);
}

function handleEditReservation(){
    document.getElementsByClassName('edit-reservation')[0].removeAttribute('hidden');
}

function handleSaveClickedReservation(event){
    var button = event.target;
    var newInfo = button.parentElement.parentElement.parentElement.parentElement;
    var chosenDate = document.getElementById('chosen-date-reserve').value;
    var chosenHour = document.getElementById('chosen-hour-reserve').value;
    var chosenMin = document.getElementById('chosen-minute-reserve').value;
    var prevId = newInfo.getElementsByClassName('ride-date')[0].innerText.replace('Reserved time: ', '').replaceAll(':', '').replaceAll('-', '').replaceAll(' ', '');
    var user = JSON.parse(sessionStorage.getItem(getUserID()));
    var reserved = user.reservedCars;
    newInfo.getElementsByClassName('ride-date')[0].innerHTML = `Reserved time: ${chosenDate} ${chosenHour}:${chosenMin}`;
    viewDetailsElement.getElementsByClassName('ride-date')[0].innerHTML = `Reserved time: ${chosenDate} ${chosenHour}:${chosenMin}`
        
    for(var i = 0; i < reserved.length; i++){
        var car = reserved[i];
        var currentId = (car.chosenDate + "" + car.chosenHour + "" + car.chosenMin).replaceAll('-', '');
        if (parseInt(currentId) == parseInt(prevId)) {
            car.chosenDate = chosenDate; 
            car.chosenHour = chosenHour;
            car.chosenMin = chosenMin;
            clearInterval(sessionStorage.getItem('countDown'));
            startCountDownViewRide(car);
        }
    }
    var reserved = user.reservedCars;
    document.getElementsByClassName('reserved-rides')[0].innerHTML = ''
    for (var i = 0; i < reserved.length; i++) {
        createReservedCars(reserved[i]);
    }
    sessionStorage.setItem(getUserID(), JSON.stringify(user));
    document.getElementsByClassName('edit-reservation')[0].setAttribute('hidden', 'true');

}

function checkIfCurrentIsEmpty(modal){
    var bool = true;
        modal.addEventListener('show.bs.modal', function(event) {
            var user = JSON.parse(sessionStorage.getItem(getUserID()));
            if (user.currentRide != '') {
                bool = false
                alert('Please end your current ride before starting a new')
                return event.preventDefault()
            }
        });
}

function handleConfirmRentStartNow(event){
    if (JSON.parse(sessionStorage.getItem(getUserID())).currentRide == ''){
        var button = event.target;
        var carInfo = button.parentElement.parentElement.parentElement.parentElement;
        var pictureUrl = carInfo.getElementsByClassName('picture-Url')[0].src;
        var carBrand = carInfo.getElementsByClassName('car-brand')[0].innerText;
        var fuelLeft = carInfo.getElementsByClassName('car-fuel-left')[0].innerText;
        var carPlate = carInfo.getElementsByClassName('car-plate')[0].innerText;
        var carPrice = carInfo.getElementsByClassName('car-price')[0].innerText;
        var time = carInfo.getElementsByClassName('ride-date')[0].innerText;
        var currentCarContent = `
        <div class="card w-80 my-5 border-0" >
            <div class="row d-flex align-items-center flex-row g-0">
                <div class="col-md-6 d-flex justify-content-center justify-content-lg-start">
                    <img src="${pictureUrl}" class="img-fluid rounded-start picture-Url" style="height: 10rem;"/>
                </div>
                <div class="col-md-6">
                    <div class="card-body">
                    <h3 class="car-plate" > <strong>${carPlate} </strong></h4>
                    <h5 class="car-fuel-left"> ${fuelLeft}</h5>
                    <h5 class="car-brand">${carBrand} </h5>
                    <h5 class="car-price">${carPrice}</h5> 
                    <h5 class="ride-date">${time}</h5>   
                    </div>
                </div>                    
            </div>
        </div>
        `;
        var rentCarInfo = document.getElementsByClassName('confirmStartNowInfo')[0];
        rentCarInfo.innerHTML = currentCarContent;
        startNowElement = carInfo.parentElement.parentElement.parentElement.parentElement;
        document.getElementsByClassName('btnConfirmStartNow')[0].addEventListener('click', removeReservedCar)
    }
}

var startNowElement

function handleStartNowClicked(event){
    var button = event.target;
    var carInfo = button.parentElement.parentElement;
    var pictureUrl = carInfo.getElementsByClassName('picture-Url')[0].src;
    var carBrand = carInfo.getElementsByClassName('car-brand')[0].innerText;
    var carPlate = carInfo.getElementsByClassName('car-plate')[0].innerText;
    var carPrice = carInfo.getElementsByClassName('car-price')[0].innerText.replace('Price: ', '' ).replace('%', '').replace('l', '');
    const currentDate = new Date()
    var timeDate = currentDate.getDate() + "/" + (currentDate.getMonth() + 1) + " " + checkTime(currentDate.getHours()) + ":" + checkTime(currentDate.getMinutes());
    var currentRideContent = `
    <div class="card w-80 rounded-3-card rounded-md-pill shadow-sm" >
        <div class="row d-flex align-items-center flex-row g-0 me-4">
                <div class="col-md-4 d-flex justify-content-center justify-content-lg-start mt-2 mt-md-0">
                    <img src="${pictureUrl}" class="img-fluid rounded-pill picture-Url" style="height: 15rem;"/>
                </div>
                <div class="col-md-8">
                    <div class="card-body d-flex flex-row row g-0">
                        <div class="col-md-8">
                            <h3 class="car-plate card-title" > <strong>${carPlate} </strong></h4>
                            <h5 class="car-brand card-text">${carBrand} </h5>  
                            <h4 class="card-text ride-date">${timeDate}</h5>
                            <h6 id="timerRented" class="card-text timerRented"></h6>
                            <h6 id="car-price-current" class="card-text car-price-current">Price: ${carPrice}</h6>
                            <h6 id="totalPriceCurrentRide" class="card-text totalPriceCurrentRide">Total: time*price</h6>
                        </div>
                        <div class="d-flex align-items-md-end align-items-center flex-column justify-content-evenly col-md-4 ps-3">
                            <button type="button" class="btn btn-primary float-end rounded-pill shadow-sm" id="endRidebtn" data-bs-toggle="modal" data-bs-target="#confirmEndRideModal">End ride</button>
                        </div>  
                    </div>
                </div>                      
            </div>
        </div>
    `;
    var user = JSON.parse(sessionStorage.getItem(getUserID()));
    user.currentRide = currentRideContent;
    sessionStorage.setItem(getUserID(), JSON.stringify(user));
    var startTimeCar = Math.floor(Date.now() / 1000);
    sessionStorage.setItem('startTime', startTimeCar);

    carInfo.parentElement.remove();
    loadCurrentRide();
}

function handleCancelClicked(event){
    var button = event.target;
    var parent = button.parentElement.parentElement.parentElement.parentElement;
    var pictureUrl = parent.getElementsByClassName('picture-Url')[0].src;
    var carBrand = parent.getElementsByClassName('car-brand')[0].innerText;
    var carPlate = parent.getElementsByClassName('car-plate')[0].innerText;
    var carPrice = parent.getElementsByClassName('car-price')[0].innerText;
    var chosenDate = parent.getElementsByClassName('ride-date')[0].innerText;
    var cancelContent = `
            <div class="card w-80 my-5 border-0" >
                <div class="row d-flex align-items-center flex-row g-0">
                    <div class="col-md-6 d-flex justify-content-center justify-content-lg-start">
                        <img src="${pictureUrl}" class="img-fluid rounded-start picture-Url" style="height: 10rem;"/>
                    </div>
                    <div class="col-md-6">
                        <div class="card-body">
                            <h3 class="car-plate" > <strong>${carPlate} </strong></h4>
                            <h5 class="ride-date"> ${chosenDate}</h5>
                            <h5 class="car-brand">${carBrand} </h5>
                            <h5 class="car-price">${carPrice}</h5>   
                        </div>
                    </div>                    
                </div>
            </div>
        `;
    cancelElement = button.parentElement.parentElement.parentElement.parentElement.parentElement;
    document.getElementsByClassName('cancelReservedInfo')[0].innerHTML = cancelContent;
    document.getElementsByClassName('btnConfirmCancelReserve')[0].addEventListener('click', removeReservedCar);
}
var cancelElement 

function removeReservedCar(event){
    var user = JSON.parse(sessionStorage.getItem(getUserID()))
    var reserved = user.reservedCars;
    var cancelId;
    if(event instanceof Event) {
        var button = event.target;
        var container = button.parentElement.parentElement;
        cancelId = container.getElementsByClassName('ride-date')[0].innerText.replace('Reserved time: ', '').replaceAll(':', '').replaceAll('-', '').replaceAll(' ', '');
    } else {
        cancelId = event.getElementsByClassName('ride-date')[0].innerText.replace('Reserved time: ', '').replaceAll(':', '').replaceAll('-', '').replaceAll(' ', '');
    }
    for(var i = 0; i < reserved.length; i++){
        var car = reserved[i];
        var currentId = (car.chosenDate + "" + car.chosenHour + "" + car.chosenMin).replaceAll('-', '');
        if (parseInt(currentId) == parseInt(cancelId)) {
            reserved.splice(i, 1);
            user.reservedCars = reserved;
        }
    }
    if (!cancelElement){
        cancelElement = startNowElement;
    }
    sessionStorage.setItem(getUserID(), JSON.stringify(user));
    var reserved = user.reservedCars;
    document.getElementsByClassName('reserved-rides')[0].innerHTML = ''
    for (var i = 0; i < reserved.length; i++) {
        createReservedCars(reserved[i]);
    }
}

function handleViewRide(event){
    var button = event.target;
    var viewButton = button.parentElement.parentElement;
    var recieptContent = viewButton.getElementsByClassName('recieptContent')[0].innerHTML;
    document.getElementsByClassName('recieptInfoContainer')[0].innerHTML = recieptContent;
}

function handleEndRideClicked(event){
    var button = event.target;
    carInfoEndRide = button.parentElement.parentElement.parentElement.parentElement;
    var pictureUrl = carInfoEndRide.getElementsByClassName('picture-Url')[0].src;
    var carBrand = carInfoEndRide.getElementsByClassName('car-brand')[0].innerText;
    var carPlate = carInfoEndRide.getElementsByClassName('car-plate')[0].innerText;
    var carPrice = carInfoEndRide.getElementsByClassName('car-price-current')[0].innerText;
    var carTotal = carInfoEndRide.getElementsByClassName('totalPriceCurrentRide')[0].innerText;

    document.getElementsByClassName('end-ride-info')[0].innerHTML = `
        <div class="card w-80 my-5 border-0" >
            <div class="row d-flex align-items-center flex-row g-0">
                <div class="col-md-6 d-flex justify-content-center justify-content-lg-start">
                    <img src="${pictureUrl}" class="img-fluid rounded-start picture-Url" style="height: 10rem;"/>
                </div>
                <div class="col-md-6">
                    <div class="card-body">
                        <h3 class="car-plate" > <strong>${carPlate} </strong></h4>
                        <h5 class="car-brand">${carBrand} </h5>
                        <h5 class="car-price">${carPrice}</h5>  
                        <h5 class="totalPriceCurrentRide">${carTotal}</h5>   
                    </div>
                </div>                    
            </div>
        </div>`
}

var carInfoEndRide

function handleEndRide(){
    if (carInfoEndRide != null){
        var pictureUrl = carInfoEndRide.getElementsByClassName('picture-Url')[0].src;
        var carBrand = carInfoEndRide.getElementsByClassName('car-brand')[0].innerText;
        var carPlate = carInfoEndRide.getElementsByClassName('car-plate')[0].innerText;
        var carPrice = carInfoEndRide.getElementsByClassName('car-price-current')[0].innerText;
        var carTotal = carInfoEndRide.getElementsByClassName('totalPriceCurrentRide')[0].innerText;
        var endTime = carInfoEndRide.getElementsByClassName('timerRented')[0].innerText;
        var date = carInfoEndRide.getElementsByClassName('ride-date')[0].innerText;
        var prevData = {pictureUrl: pictureUrl, carBrand: carBrand, carPlate: carPlate, carPrice: carPrice, carTotal: carTotal, endTime: endTime, date: date}
        var prevDataArray = [prevData];
        var user = JSON.parse(sessionStorage.getItem(getUserID()));
        var prevRides = user.userHistory;
        user.currentRide = "";
        if (prevRides==null){
            user.userHistory = prevDataArray;
            sessionStorage.setItem(getUserID(), JSON.stringify(user));
        } else {
            var newArray = [prevData];
            var i;
            for (i = 0; i < prevRides.length; i++) {
                newArray.push(prevRides[i]);
            }
            user.userHistory = newArray;
            sessionStorage.setItem(getUserID(), JSON.stringify(user));
        }
        clearTimeout(sessionStorage.getItem('timeout'));
        sessionStorage.setItem('timer', 0);
        var totalInt = carTotal.replace('kr.-', '').replace('Total: ', '');
        var priceInt = carPrice.replace('kr.-/min', '').replace('Price: ', '');
        var minutes = Math.floor(totalInt/priceInt);
        
        var recieptContent = `
            <div class="my-2 flex-column">
                <div class="my-2 text-center">
                    <p class="h3">Thank you for using our service!</p>
                    <p class="h3" id="purchase-user-name">${getUserName()}</p>
                    <p class="h5">${date}</p>
                </div>
            </div>
            <div class="card w-80 my-3 border-0" >
                <div class="row d-flex align-items-center flex-row g-0">
                    <div class="col-md-6 d-flex justify-content-center justify-content-lg-start">
                        <img src="${pictureUrl}" class="img-fluid rounded-start picture-Url" style="height: 10rem;"/>
                    </div>
                    <div class="col-md-6">
                        <div class="card-body">
                            <h3 class="car-plate card-title"> <strong>${carPlate} </strong></h4>
                            <h5 class="car-brand card-text">${carBrand} </h5>
                            <h5 class="car-price card-text">${carPrice} </h5>    
                        </div>
                    </div>                    
                </div>
            </div>
            <div class="container">
                <p class="h5" id="used-time">Time driven: ${endTime.replace('Time: ', '')}</p> 
            </div>
            <section class="container pb-5">
                <div class="row">
                    <div class="col-xl-10">
                    <p>Minutes</p>
                    </div>
                    <div class="col-xl-2">
                    <p class="float-end">${minutes}
                    </p>
                    </div>
                    <hr style="border: 2px solid black;">
                </div>
                <div class="row text-black">
                    <div class="col-xl-12">
                    <p class="float-end fw-bold">${carTotal}
                    </p>
                    </div>
                    <hr style="border: 2px solid black;">
                </div>
            </section>`;
        document.getElementsByClassName('recieptInfoContainer')[0].innerHTML = recieptContent;
        updateBalance(-parseInt(carTotal.replace('Total: ', '')))
        createPreviousRidesContent(prevData);
        document.getElementsByClassName('currentRideInfo')[0].innerHTML = `<h3>You do not have any current ride </h3>
        <h5>Go to the front page to rent a car :)</h5>`;

    }  
}

function createPreviousRidesContent(object){
    var totalInt = object.carTotal.replace('kr.-', '').replace('Total: ', '');
    var priceInt = object.carPrice.replace('kr.-/min', '').replace('Price: ', '');
    var minutes = Math.floor(totalInt/priceInt);
    
    var recieptContent = `
        <div class="my-2 flex-column">
            <div class="my-2 text-center">
                <p class="h3">Thank you for using our service!</p>
                <p class="h3" id="purchase-user-name">${getUserName()}</p>
                <p class="h5">${object.date}</p>
            </div>
        </div>
        <div class="card w-80 my-3 border-0" >
            <div class="row d-flex align-items-center flex-row g-0">
                <div class="col-md-6 d-flex justify-content-center justify-content-lg-start">
                    <img src="${object.pictureUrl}" class="img-fluid rounded-start picture-Url" style="height: 10rem;"/>
                </div>
                <div class="col-md-6">
                    <div class="card-body">
                        <h3 class="car-plate card-title"> <strong>${object.carPlate} </strong></h4>
                        <h5 class="car-brand card-text">${object.carBrand} </h5>
                        <h5 class="car-price card-text">${object.carPrice} </h5>    
                    </div>
                </div>                    
            </div>
        </div>
        <div class="container">
            <p class="h5" id="used-time">Time driven: ${object.endTime.replace('Time: ', '')}</p> 
        </div>
        <section class="container pb-5">
            <div class="row">
                <div class="col-xl-10">
                <p>Minutes</p>
                </div>
                <div class="col-xl-2">
                <p class="float-end">${minutes}
                </p>
                </div>
                <hr style="border: 2px solid black;">
            </div>
            <div class="row text-black">
                <div class="col-xl-12">
                <p class="float-end fw-bold">${object.carTotal}
                </p>
                </div>
                <hr style="border: 2px solid black;">
            </div>
        </section>`;
        var previousContent = `
            <div class="card w-80 rounded-3-card rounded-md-pill shadow-sm" >
                <div class="ms-3 me-4 my-2 row d-flex align-items-center flex-row g-0">
                    <div class="card-body d-flex flex-row row g-0">
                        <div class="col-md-8 d-flex align-items-center">
                            <div class="d-flex align-items-center me-4">
                                <span class="material-icons circle-icon-prev-ride">circle</span>
                            </div>
                            <div>
                                <h4 class="card-title">${object.date}</h5>
                                <h6>${object.endTime}</h6>
                                <h6>${object.carTotal}</h6>
                            </div>
                        </div>                            

                        <div class="d-flex align-items-md-end align-items-center flex-column justify-content-evenly col-md-4 ps-3">
                            <button type="button" class="btn btn-primary rounded-pill shadow-sm viewButton float-end" data-bs-toggle="modal" data-bs-target="#viewRecieptModal">View ride</button>
                        </div>  
                        <div hidden class="recieptContent">
                            ${recieptContent}
                        </div>
                    </div>
                </div>      
            </div>
            `;

        var previousRidesElement = document.getElementsByClassName('previous-rides')[0];
        var prevRide = document.createElement('div');
        prevRide.classList.add('prevRide');
        prevRide.classList.add('mb-5');
        prevRide.innerHTML = previousContent;
        previousRidesElement.append(prevRide);
        prevRide.getElementsByClassName('viewButton')[0].addEventListener('click', handleViewRide);
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