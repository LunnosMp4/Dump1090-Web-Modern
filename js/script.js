// Copyright (c) 2022, Lunnos
// https://github.com/LunnosMp4/Dump1090-Web-Modern
// License: MIT
// PS: The plane Tracking and Path Drawing are based on 
//     the original script from: https://github.com/Slord6/

var map = L.map('map').setView([42.70, 2.90], 10);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var firstCircle = L.circle([42.7179093, 2.8223874], {
    color: '#5799cf57',
    fillColor: '#5799cf36',
    fillOpacity: 0.5,
    radius: 100000
}).addTo(map);


let markers = L.layerGroup().addTo(map);

let addPlanePath = (plane) => {
    plane.path = L.polyline([], {color: plane.hex + 'a1'}).addTo(map);
}

let LostTimeout = 1;
let planeTimeout = 60;
let activePlanes = {};

// Remove plane and panel from the system
let removePlane = (plane) => {
    if(plane.path) {
        map.removeLayer(plane.path);
    }
    if(document.querySelector('#plane-' + plane.hex)) {
        document.querySelector('#plane-' + plane.hex).remove();
    }
    delete activePlanes[plane.hex];
}

// Get Data from server
let getNewData = (cb) => {
    var xhr = new XMLHttpRequest();
    // var url = "http://192.168.1.37/tar1090/data/aircraft.json";
    var url = "./aircraft.json";
    xhr.open("GET", url);
    xhr.send();
    xhr.onreadystatechange=(res) => {
        cb(res, xhr)
    };
}

// Get Data from the Database
function loadDatabase() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "database/database.json", false);
    xhr.send();
    var json = xhr.responseText;
    database = JSON.parse(json).results;
    console.log(database);
    return database;
}

let planeToplaneGlobal = (plane) => {
    if (plane.seen > planeTimeout - 15) return 'Aircraft Lost';
    let planeGlobal = 'Flight : ' + plane.flight + '<br>';
    if(plane.alt_baro){
        planeGlobal += ' Alt: ' + plane.alt_baro + 'ft<br>';
    }
    if(plane.gs) {
        planeGlobal += ' Spd: ' + plane.gs + 'kts<br>';
    }
    return planeGlobal;
}

let updateRightPanel = (plane) => {
    let numPlanes = 0;
    let planeList = '';

    Object.values(activePlanes).forEach(plane => {
        if(plane.type == 'adsb_icao') {
            numPlanes++;
            planeList += '<div id="link"></div><li id="list-' + plane.hex + '">' + plane.shortName + ' - ' + plane.flight + '<br></li>';
        }
    });
    document.querySelector('#TotNumbers').innerHTML = Object.keys(activePlanes).length;
    document.querySelector('#TotPos').innerHTML = numPlanes;
    document.querySelector('#PlaneList').innerHTML = planeList;
}

// Check If User click on a plane and display the plane information in the right panel
document.addEventListener('click', function(e) {
    if (e.target.id.startsWith('list-')) {

        let hex = e.target.id.split('-')[1];
        let plane = activePlanes[hex];

        PlaneInfo = '<div class="title left-title" id="plane-' + hex + '"><h2>'+ plane.flight +'</h2></div>' +
                    '<div class="container flipped left-info">' + 
                        '<p>' + plane.gs + '</p>' +
                    '</div>'

        document.querySelector('#PlaneInfo').innerHTML = PlaneInfo;
    }
});

// Remove the plane from the right panel when the user click on the right panel
document.addEventListener('click', function(e) {
    if (e.target.className === 'container left-info') {
        document.querySelector('#PlaneInfo').innerHTML = '';
    }
});

// Update Map
let updateMap = (database) => {
    let drawMarkers = (activePlanes) => {
        markers.clearLayers();
        Object.values(activePlanes).forEach(plane => {
            if(plane.lat && plane.lon) {       
                addPlaneMarker(plane);
                addPathMarker(plane);
                updateRightPanel(plane);
            }
        });
    };

    let addPlaneMarker = (plane) => {
        let trueTrack = plane.track - 180;
        let newMarker = new L.Marker([plane.lat, plane.lon], {
        icon: new L.DivIcon({
            className: 'planeGlobal',
            html: '<div class="hitbox" style="transform: rotate(' + trueTrack + 'deg) translate(-10px, 10px)"><svg xmlns="http://www.w3.org/2000/svg" class="plane" version="1.0" width="32" height="32" viewBox="0 0 64.000000 64.000000"><g transform="matrix(1,0,0,-1,0,64)"><path d="m 32,5.8 0.1,0 0.2,0.1 0.4,0.3 0.5,0.8 0.7,1.7 0.5,2 0.2,2.6 0,9.9 0.6,0.8 4.1,2.8 -0.2,-1.1 0,-1.2 0.2,-1.1 0.1,-0.2 2.3,0 0.1,0.2 0.2,1.1 0,1.2 -0.2,1.2 -0.3,0 -0.1,1.2 15.9,11 0.3,0.5 0,1.5 -0.2,0.6 -8.4,-3.4 -0.1,0.4 -0.1,-0.5 -4.2,-1.4 -0.1,0.4 -0.1,-0.5 -4.4,-1.4 -1,-0.2 -0.2,0.5 -0.2,-0.5 -4,-0.4 0,8.3 -0.1,2.6 -0.4,3.8 0.5,0.7 7.5,5.8 0,1.9 -9.2,-2.4 -0.7,1.5 -0.1,1.3 -0.2,0 -0.1,-1.3 -0.7,-1.5 -9.2,2.4 0,-1.9 7.5,-5.8 0.5,-0.7 -0.4,-3.8 -0.1,-2.6 0,-8.3 -4,0.4 -0.2,0.5 -0.2,-0.5 -1,0.2 -4.4,1.4 -0.1,0.5 -0.1,-0.4 -4.2,1.4 -0.1,0.5 -0.1,-0.4 -8.4,3.4 -0.2,-0.6 0,-1.5 0.3,-0.5 15.9,-11 -0.1,-1.2 -0.3,0 -0.2,-1.2 0,-1.2 0.2,-1.1 0.1,-0.2 2.3,0 0.1,0.2 0.2,1.1 0,1.2 -0.2,1.1 4.1,-2.8 0.6,-0.8 0,-9.9 0.2,-2.6 0.5,-2 0.7,-1.7 0.5,-0.8 0.4,-0.3 0.2,-0.1 z" fill="#' + plane.hex + '"/></g></svg></div>' +
                  '<div class="plane-info">' + planeToplaneGlobal(plane) + '</div>'
            })
        });
        markers.addLayer(newMarker).addTo(map);
    }
    let addPathMarker = (plane) => {
        if(!plane.path) {
            addPlanePath(plane);
        }
        plane.path.addLatLng(L.latLng(plane.lat, plane.lon));
    };

     let updatePlanes = (res, http) => {
        if(!http.responseText) return;
        let newPlanes = JSON.parse(http.responseText).aircraft;
        newPlanes.forEach(newPlane => {
            if(!activePlanes[newPlane.hex]) {
                newPlane.new = true;
                newPlane.firstSeen = Date.now();
            } else {
                // Find Plane Info in the database (must be improved)
                newPlane.created = undefined;
                if (newPlane.created === undefined) {
                    for (var i = 0; i < database.length; i++) {
                        if (database[i].icao === newPlane.hex) {
                            console.log(database[i]);
                            newPlane.regid = database[i].regid;
                            newPlane.shortName = database[i].nameShort;
                            newPlane.longName = database[i].nameLong;
                            newPlane.operator = database[i].operator;
                            newPlane.created = true;
                        }
                    }
                    if (!newPlane.created) {
                        newPlane.created = false;
                    }
                }

                newPlane.new = false;
                let storedPlane = activePlanes[newPlane.hex];
                newPlane.firstSeen = storedPlane.firstSeen;
                if(!newPlane.lat || !newPlane.lon) {
                    newPlane.lat = storedPlane.lat;
                    newPlane.lon = storedPlane.lon;
                }
                if(!newPlane.track) {
                    newPlane.track = storedPlane.track;
                }
                if(!newPlane.alt_baro) {
                    newPlane.alt_baro = storedPlane.alt_baro;
                }
                if(!newPlane.flight) {
                    newPlane.flight = storedPlane.flight;
                }
                if(!newPlane.gs) {
                    newPlane.gs = storedPlane.gs;
                }
                newPlane.path = storedPlane.path;
            }
            activePlanes[newPlane.hex] = newPlane;
        });
        Object.values(newPlanes).forEach((plane, index) => {
            if(plane.seen > planeTimeout) {
                removePlane(plane);
            }
        });
        drawMarkers(activePlanes);
    };

    getNewData(updatePlanes);
    setInterval(getNewData.bind(this, updatePlanes), LostTimeout * 1000);
};

updateMap(loadDatabase());