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
    }
    else if (document.getElementsByClassName('profile-tag')[0]){
        document.getElementById('inputName').removeAttribute('value');
        document.getElementById('inputEmail').removeAttribute('value');
        document.getElementById('inputPhone').removeAttribute('value');
        document.getElementsByClassName('card-information-column')[0].setAttribute('hidden', 'true');
        document.getElementsByClassName('save-button')[0].setAttribute('hidden', 'true');
        document.getElementsByClassName('reserved-rides')[0].innerHTML = "";
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
        //var profilePicUrl = getProfilePicUrl()
        var userName = getUserName()

        // Set the user's profile pic and name.
       // userPicElement.style.backgroundImage =
         //   'url(' + addSizeToGoogleProfilePic(profilePicUrl) + ')'
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
        if (sessionStorage.getItem(getUserID()) == null){
            var userCurrent = {UserName: userName, Email: userEmail, phone: userPhone, cards: [] , userHistory: [], currentRide: "", reservedCars: []}
            sessionStorage.setItem(getUserID(), JSON.stringify(userCurrent))
        } 
        initHistory()
        initProfile()

    } else {
        // User is signed out!
        // Hide user's profile and sign-out button.
        userNameElement.setAttribute('hidden', 'true')
        userPicElement.setAttribute('hidden', 'true')
        signOutButtonElement.setAttribute('hidden', 'true')

        // Show sign-in button.
        signInButtonElement.removeAttribute('hidden')

        if (document.getElementsByClassName('history-tag')[0]){
            document.getElementsByClassName('reserved-container').setAttribute('hidden', 'true')
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
            <h3 class="car-brand-popup" > <strong>${cars[key].carBrand} </strong></h4>
            <h5 class="car-fuel-left-popup"> ${cars[key].fuelLeft} left </h5>
            <h5 class="car-plate-popup"> Plate: ${cars[key].plate} </h5>
            <h5 class="car-price-popup"> ${cars[key].price} kr.-/min </h5>
            <button type="button" class="btn btn-secondary btn-lg blueBottons m-1 rounded-lg rentCar" onclick="handleRentCar()" data-bs-toggle="modal" data-bs-target="#confirmCarRentModal">Rent Car</button>
            <button type="button" class="btn btn-secondary btn-lg blueBottons m-1 rounded-lg reserveCar" onclick="handleReserveCar()" data-bs-toggle="modal" data-bs-target="#confirmCarReserveModal">Reserve Car</button>
        </div>
        `;
        cars[key].marker = L.marker([cars[key].lat, cars[key].lon], { icon: iconCar }).addTo(map).bindPopup(popUpContent).on('click', saveCurrentCar(key));
    }
}

function saveCurrentCar(key){
    var currentCarContent = `
    <div class="d-flex align-items-center flex-column my-3">
        <img src="${cars[key].pictureUrl}" width="200" class="rounded picture-Url"/>
        <h3 class="car-brand" > <strong>${cars[key].carBrand} </strong></h4>
        <h5 class="car-fuel-left"> ${cars[key].fuelLeft} left</h5>
        <h5 class="car-plate">Plate: ${cars[key].plate} </h5>
        <h5 class="car-price">${cars[key].price} kr.-/min</h5>            
    </div>
    `;
    sessionStorage.setItem('currentRidePopUp', currentCarContent);
}

var cars = {
    car1: { carBrand: 'Renault Zoe', fuelType: 'Electric', fuelLeft: '54% battery', plate: 'AB 12345', price: '4', pictureUrl: 'images/carPhoto.jpeg', lat: '55.66006357924885', lon: '12.591008245588563', marker: '' }
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(initMap);
    } else {
        alert("Could not get get location");
    }
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
                var user = JSON.parse(sessionStorage.getItem(getUserID()));
                var previousRides = user.userHistory;
                for (var i = 0; i < previousRides.length; i++) {
                    createPreviousRidesContent(previousRides[i]);
                }
            } else {
                document.getElementsByClassName('previous-rides')[0].innerHTML = "<h5>Please log-in to see your previous rides or end a ride</h5>";
                
            }
            console.log(JSON.parse(sessionStorage.getItem(getUserID())).reservedCars)
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
        }
    }
}

function initProfile(){
    if (document.getElementsByClassName('profile-tag')[0]){
        var user = JSON.parse(sessionStorage.getItem(getUserID()))
        document.getElementById('inputName').setAttribute('value', user.UserName)
        document.getElementById('inputEmail').setAttribute('value', user.Email)
        document.getElementById('inputPhone').setAttribute('value', user.phone)
        document.getElementsByClassName('addCardConfirm')[0].addEventListener('click', addCardClicked)
        document.getElementsByClassName('save-button')[0].addEventListener('click', saveButtonClicked)
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
    sessionStorage(getUserID(), JSON.stringify(user))

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
    cardContainer.classList.add('align-content-center')
    cardContainer.classList.add('flex-row')            
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
            <button class="btn btn-danger button-remove-card" type="button">Remove</button>
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
            cardContainer.classList.add('align-content-center')
            cardContainer.classList.add('flex-row')            
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
                    <button class="btn btn-danger button-remove-card" type="button">Remove</button>
                </div>`
            cardContainer.innerHTML = cardContent;
            document.getElementsByClassName('card-information')[0].append(cardContainer)
            cardContainer.getElementsByClassName('button-remove-card')[0].addEventListener('click', removeCard)
        
    }
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
        <div class="card w-80 current-ride-car">
            <div class="row g-0 d-flex align-items-center" >
                <div class="col-md-4">
                    <img src="${pictureUrl}" width="200px" class="rounded picture-Url img-fluid"/>
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                            <h3 class="car-brand card-title" > <strong>${carBrand} </strong></h4>
                            <h5 class="car-plate card-text">${carPlate} </h5>  
                            <h4 class="card-text ride-date">${timeDate}</h5>
                            <h6 id="timerRented" class="card-text timerRented"></h6>
                            <h6 id="car-price-current" class="card-text car-price-current">Price: ${carPrice}</h6>
                            <h6 id="totalPriceCurrentRide" class="card-text totalPriceCurrentRide">Total: time*price</h6>
                    </div>
                </div>
                <div class="container">
                     <a href="#" class="btn btn-danger float-end rounded" id="endRidebtn" data-bs-toggle="modal" data-bs-target="#confirmEndRideModal">End ride</a>
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
    var now = Math.floor(Date.now() / 1000); // get the time now
    var startTime = parseInt(sessionStorage.getItem('startTime'));
    var diff = now - startTime; // diff in seconds between now and start
    var h = Math.floor((diff/60)/60);
    var m = Math.floor(diff / 60);
    var s = Math.floor(diff % 60);
    h = checkTime(h);
    m = checkTime(m);
    s = checkTime(s);
    var timerString = "Time: " + h + ":" + m + ":" + s;
    document.getElementById("timerRented").innerHTML = timerString; // update the element 
    var t = setTimeout(startTimeCounter, 500); // set a timeout to update the timer
    sessionStorage.setItem('timeout', t);
    var priceElement = document.getElementById('car-price-current');
    var price = priceElement.innerText.replace('kr.-/min', '');
    var price = parseInt(price.replace('Price:', ''));
    document.getElementById('totalPriceCurrentRide').innerHTML = "Total: " + Math.floor((m * price) + 4) + "kr.-";
}

function checkTime(i) {
    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
}

function handleConfirmReserve(event){
    var button = event.target;
    var carInfo = button.parentElement;
    var pictureUrl = carInfo.getElementsByClassName('picture-Url')[0].src;
    var carBrand = carInfo.getElementsByClassName('car-brand')[0].innerText;
    var carPlate = carInfo.getElementsByClassName('car-plate')[0].innerText;
    var carPrice = carInfo.getElementsByClassName('car-price')[0].innerText;
    var chosenDate = document.getElementById('chosen-date-reserve').value;
    var chosenHour = document.getElementById('chosen-hour-reserve').value;
    var chosenMin = document.getElementById('chosen-minute-reserve').value;
    var car = {id: chosenDate + chosenHour + chosenMin, pictureUrl: pictureUrl, carBrand: carBrand, carPlate: carPlate, carPrice: carPrice, chosenDate: chosenDate, chosenHour: chosenHour, chosenMin: chosenMin}
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
    console.log(object)
    var reservedRideContent = `
        <div class="card w-80">
            <div class="row g-0 d-flex align-items-center" >
                <div class="col-md-4">
                    <img src="${object.pictureUrl}" width="200px" class="rounded picture-Url img-fluid"/>
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                            <h3 class="car-brand card-title" > <strong>${object.carBrand} </strong></h4>
                            <h5 class="car-plate card-text">${object.carPlate} </h5>  
                            <h4 class="card-text ride-date">Reserved time: ${object.chosenDate}-${object.chosenHour}:${object.chosenMin}</h5>
                            <h6 id="timerRented" class="card-text timerRented"></h6>
                            <h6 id="car-price" class="card-text car-price">Price: ${object.carPrice}</h6>
                    </div>
                </div>
                <div class="container">
                     <button type="button" class="btn btn-danger float-end rounded startRidebtn" data-bs-toggle="modal" data-bs-target="#confirmRentModal">Start ride now</button>
                     <button type="button" class="btn btn-danger float-end rounded cancelReservedbtn" data-bs-toggle="modal" data-bs-target="#cancelReservedModal">Cancel</button>
                </div>                       
            </div>
        </div>
    `;
        var element = document.getElementsByClassName('reserved-rides')[0]
        var reservedCar = document.createElement('div');
        reservedCar.classList.add('reserved-car');
        reservedCar.innerHTML = reservedRideContent;
        element.append(reservedCar);
        reservedCar.getElementsByClassName('cancelReservedbtn')[0].addEventListener('click', handleCancelClicked);
}

function handleStartNowClicked(event){
    var button = event.target;
    var carInfo = button.parentElement.parentElement;
    var pictureUrl = carInfo.getElementsByClassName('picture-Url')[0].src;
    var carBrand = carInfo.getElementsByClassName('car-brand')[0].innerText;
    var carPlate = carInfo.getElementsByClassName('car-plate')[0].innerText;
    var carPrice = carInfo.getElementsByClassName('car-price')[0].innerText;
    const currentDate = new Date()
    var timeDate = currentDate.getDate() + "/" + (currentDate.getMonth() + 1) + " " + checkTime(currentDate.getHours()) + ":" + checkTime(currentDate.getMinutes());
    var currentRideContent = `
        <div class="card w-80 current-ride-car">
            <div class="row g-0 d-flex align-items-center" >
                <div class="col-md-4">
                    <img src="${pictureUrl}" width="200px" class="rounded picture-Url img-fluid"/>
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                            <h3 class="car-brand card-title" > <strong>${carBrand} </strong></h4>
                            <h5 class="car-plate card-text">${carPlate} </h5>  
                            <h4 class="card-text ride-date">${timeDate}</h5>
                            <h6 id="timerRented" class="card-text timerRented"></h6>
                            <h6 id="car-price-current" class="card-text car-price-current">Price: ${carPrice}</h6>
                            <h6 id="totalPriceCurrentRide" class="card-text totalPriceCurrentRide">Total: time*price</h6>
                    </div>
                </div>
                <div class="container">
                     <a href="#" class="btn btn-danger float-end rounded" id="endRidebtn" data-bs-toggle="modal" data-bs-target="#confirmEndRideModal">End ride</a>
                </div>                       
            </div>
        </div>
    `;
    var user = JSON.parse(sessionStorage.getItem(getUserID()))
    user.currentRide = currentRideContent;
    sessionStorage.setItem(getUserID(), JSON.stringify(user));
    var startTimeCar = Math.floor(Date.now() / 1000);
    sessionStorage.setItem('startTime', startTimeCar);
    loadCurrentRide()
}

function handleCancelClicked(event){
    var button = event.target;
    var parent = button.parentElement;
    var pictureUrl = parent.getElementsByClassName('picture-Url')[0].src;
    var carBrand = parent.getElementsByClassName('car-brand')[0].innerText;
    var carPlate = parent.getElementsByClassName('car-plate')[0].innerText;
    var carPrice = parent.getElementsByClassName('car-price')[0].innerText;
    var chosenDate = parent.getElementById('ride-date').value;
    var cancelContent = `
    <div class="d-flex align-items-center flex-column my-3">
        <img src="${pictureUrl}" width="200" class="rounded picture-Url"/>
        <h3 class="car-brand" > <strong>${carBrand} </strong></h4>
        <h5 class="ride-date"> ${chosenDate} left</h5>
        <h5 class="car-plate">Plate: ${carPlate} </h5>
        <h5 class="car-price">${carPrice} kr.-/min</h5>            
    </div>
    `;
    document.getElementsByClassName('cancelReservedInfo')[0].innerHTML = cancelContent;
    document.getElementsByClassName('btnConfirmCancelReserve')[0].addEventListener('click', handleCancelClickedConfirm)
}

function handleCancelClickedConfirm(event){
    var button = event.target;
    var container = button.parentElement.parentElement;
    var user = JSON.parse(sessionStorage.getItem(getUserID()))
    var reserved = user.reservedCars;
    var cancelId = container.getElementsByClassName('chosen-date-reserve').value + document.getElementById('chosen-hour-reserve').value + document.getElementById('chosen-minute-reserve').value;
    for(var i = 0; i < reserved.length; i++){
        var car = reserved[i]
        var currentId = car.reserved[i].id;
        if (parseInt(currentId) == parseInt(cancelId)) {
            reserved.splice(i, 1);
            user.reservedCars = reserved;
        }
    }
    container.remove();
    sessionStorage.setItem(getUserID(), JSON.stringify(user));
}

function handleViewRide(event){
    var button = event.target;
    var viewButton = button.parentElement;
    var recieptContent = viewButton.getElementsByClassName('recieptContent')[0].innerHTML;
    document.getElementsByClassName('recieptInfoContainer')[0].innerHTML = recieptContent;
}

function handleEndRideClicked(event){
    var button = event.target;
    carInfoEndRide = button.parentElement.parentElement;
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
        if (prevRides==null){
            user.userHistory = prevDataArray;
            user.currentRide = ""
            sessionStorage.setItem(getUserID(), JSON.stringify(user));
        } else {
            var newArray = [prevData];
            var i;
            for (i = 0; i < prevRides.length; i++) {
                newArray.push(prevRides[i]);
            }
            user.userHistory = newArray;
            user.currentRide = ""
            sessionStorage.setItem(getUserID(), JSON.stringify(user));
        }
        clearTimeout(sessionStorage.getItem('timeout'));
        sessionStorage.setItem('timer', 0);
        var recieptContent = `
            <div class="my-5 d-flex align-items-center flex-column">
                <p class="h3">Thank you for using our service!</p>
                <p class="h3" id="purchase-user-name">${userNameElement.innerText}</p>
            </div>
            <div class="d-flex align-items-center flex-column my-3 border-bottom">
                <img src="${pictureUrl}" width="200" class="rounded picture-Url"/>
                <h3 class="car-brand" > <strong>${carBrand} </strong></h4>
                <h5 class="car-plate">${carPlate} </h5>
                <h5 class="car-price">${carPrice} </h5>   
            </div>
            <div class="d-flex align-items-center flex-column">
                <p class="h4">Time driven:</p>
                <p class="h4" id="used-time">${endTime}</p> 
            </div>
            <section class="container pb-5">
                <div class="row d-flex justify-content-evenly align-items-center border-bottom">
                    <div class="col">
                        <div class="float-end d-flex align-items-center flex-row">
                            <p class="h5 px-3">Total Cost: </p>
                            <p class="h5" id="totalPrice">${carTotal}</p>
                        </div>
                    </div>
                </div>
            </section>
            <button class="btn btn-secondary rounded okButton" type="button" data-bs-dismiss="modal">OK</button>
        `;
        document.getElementsByClassName('recieptInfoContainer')[0].innerHTML = recieptContent;
        createPreviousRidesContent(prevData);
        document.getElementsByClassName('currentRideInfo')[0].innerHTML = `<h3>You do not have any current ride </h3>
        <h5>Go to the front page to rent a car :)</h5>`;

    }  
}

function createPreviousRidesContent(object){
    var recieptContent = `
            <div class="my-5 d-flex align-items-center flex-column">
                <p class="h3">Thank you for using our service!</p>
                <p class="h3" id="purchase-user-name">${userNameElement.innerText}</p>
            </div>
            <div class="d-flex align-items-center flex-column my-3 border-bottom">
                <img src="${object.pictureUrl}" width="200" class="rounded picture-Url"/>
                <h3 class="car-brand" > <strong>${object.carBrand} </strong></h4>
                <h5 class="car-plate">${object.carPlate} </h5>
                <h5 class="car-price">${object.carPrice} </h5>   
            </div>
            <div class="d-flex align-items-center flex-column">
                <p class="h4">Time driven:</p>
                <p class="h4" id="used-time">${object.endTime}</p> 
            </div>
            <section class="container pb-5">
                <div class="row d-flex justify-content-evenly align-items-center border-bottom">
                    <div class="col">
                        <div class="float-end d-flex align-items-center flex-row">
                            <p class="h5 px-3">Total Cost: </p>
                            <p class="h5" id="totalPrice">${object.carTotal}</p>
                        </div>
                    </div>
                </div>
            </section>
            <button class="btn btn-secondary rounded okButton" type="button" data-bs-dismiss="modal">OK</button>
        `
        var previousContent = `
                <div class="card w-80" previous-rides>
                    <div class="card-body d-flex flex-row justify-content-evenly align-items-center">
                        <div class="container">
                            <h4 class="card-title">${object.date}</h5>
                            <h6>${object.endTime}</h6>
                            <h6>${object.carTotal}</h6>
                        </div>
                        <div class="container">
                            <div hidden class="recieptContent">
                            ${recieptContent}
                            </div>
                            <a href="#" class="btn btn-primary float-end rounded viewButton" data-bs-toggle="modal" data-bs-target="#viewRecieptModal">View ride</a>
                        </div>                           
                    </div>
                </div>`;

        var previousRidesElement = document.getElementsByClassName('previous-rides')[0];
        var prevRide = document.createElement('div');
        prevRide.classList.add('prevRide');
        prevRide.innerHTML = previousContent;
        previousRidesElement.append(prevRide);
        prevRide.getElementsByClassName('viewButton')[0].addEventListener('click', handleViewRide)
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