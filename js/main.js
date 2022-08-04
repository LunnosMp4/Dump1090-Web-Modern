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
    plane.path = L.polyline([], {color: '#' + plane.hex + 'a1'}).addTo(map);
}

let LostTimeout = 1;
let planeTimeout = 60;
let activePlanes = {};

// Remove plane and panel from the system
let removePlane = (plane) => {
    if (plane.path) {
        map.removeLayer(plane.path);
    }
    if (document.querySelector('#panel-' + plane.hex)) {
        document.querySelector('#panel-' + plane.hex).remove();
    }
    delete activePlanes[plane.hex];
}

// Get Data from server
let getNewData = (cb) => {
    var xhr = new XMLHttpRequest();
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
    xhr.open("GET", "database/aircraft-database.min.json", false);
    xhr.send();
    var json = xhr.responseText;
    database = JSON.parse(json);
    return database;
}

// Get Photo from https://www.jetphotos.com/
function getPhoto(regid) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://www.jetphotos.com/photo/keyword/" + regid, false);
    xhr.send();
    var response = xhr.responseText;
    return response;
}

let planeToplaneGlobal = (plane) => {
    if (plane.seen > planeTimeout - 15) return 'Aircraft Lost';
    let planeGlobal = 'Flight : ' + plane.flight + '<br>';
    if (plane.alt_baro){
        planeGlobal += ' Alt : ' + plane.alt_baro + 'ft<br>';
    }
    if (plane.gs) {
        planeGlobal += ' Spd : ' + plane.gs + 'kts<br>';
    }
    if (plane.shortName) {
        planeGlobal += ' Type : ' + plane.shortName + '<br>';
    }
    return planeGlobal;
}

let updateRightPanel = (plane) => {
    let numPlanes = 0;
    let planeList = '';

    Object.values(activePlanes).forEach(plane => {
        if (plane.type == 'adsb_icao') {
            numPlanes++;
            planeList += '<div id="link"></div><li id="list-' + plane.hex + '">' + plane.longName + ' - ' + plane.flight + '<br></li>';
        }
    });
    document.querySelector('#TotNumbers').innerHTML = Object.keys(activePlanes).length;
    document.querySelector('#TotPos').innerHTML = numPlanes;
    document.querySelector('#PlaneList').innerHTML = planeList;
}

function LeftPanelInfo(plane) {
    let data = "";
    if (plane.photo) {
        data += '<img src=' + plane.photo + '>';
    };

    if (plane.longName) {
        data += '<div class="value"><p id="title">Aircraft :</p>';
        data += '<p id="value">' + plane.longName + '</p></div>';
    }

    if (plane.regid) {
        data += '<div class="value"><p id="title">Registration :</p>';
        data += '<p id="value">' + plane.regid + '</p></div>';
    }

    if (plane.operatorName) {
        data += '<div class="value"><p id="title">Company :</p>';
        data += '<p id="value">' + plane.operatorName + '</p></div>';
    }

    if (plane.constmaj) {
        data += '<div class="value"><p id="title">Manufacturer  :</p>';
        data += '<p id="value">' + plane.constmaj + '</p></div>';
    }

    data += '<div id="sep"></div><h3>Speed</h3>';

    if (plane.ias) {
        data += '<div class="value"><p id="title">Air Speed :</p>';
        data += '<p id="value">' + plane.ias + ' knots</p></div>';
    }

    data += '<div class="value"><p id="title">Ground Speed :</p>';
    data += '<p id="value">' + plane.gs + ' knots</p></div>';
    
    if (plane.mach) {
        data += '<div class="value"><p id="title">Mach Speed :</p>';
        data += '<p id="value">' + plane.mach + ' mach</p></div>';
    }

    if (plane.alt_baro || plane.alt_geom || plane.baro_rate) {
        data += '<div id="sep"></div><h3>Altitude</h3>';
    }

    if (plane.alt_baro) {
        data += '<div class="value"><p id="title">Calibrate Altitude :</p>';
        data += '<p id="value">' + plane.alt_baro + ' ft</p></div>';
    }
    if (plane.alt_geom) {
        data += '<div class="value"><p id="title">Ground Altitude :</p>';
        data += '<p id="value">' + plane.alt_geom + ' ft</p></div>';
    }
    if (plane.baro_rate) {
        data += '<div class="value"><p id="title">Vertical Speed :</p>';
        data += '<p id="value">' + plane.baro_rate + ' ft/min</p></div>';
    }

    if (plane.track || plane.mag_heading || plane.true_heading) {
        data += '<div id="sep"></div><h3>Movement</h3>';
    }

    if (plane.track) {
        data += '<div class="value"><p id="title">Calibrate Track :</p>';
        data += '<p id="value">' + plane.track + '°</p></div>';
    }
    if (plane.mag_heading) {
        data += '<div class="value"><p id="title">Magnetic Heading :</p>';
        data += '<p id="value">' + plane.mag_heading + '°</p></div>';
    }
    if (plane.true_heading) {
        data += '<div class="value"><p id="title">True Heading :</p>';
        data += '<p id="value">' + plane.true_heading + '°</p></div>';
    }
    if (plane.roll) {
        data += '<div class="value"><p id="title">Roll Axis :</p>';
        data += '<p id="value">' + plane.roll + '°</p></div>';
    }
    if (plane.lat && plane.lon) {
        data += '<div class="value"><p id="title">Position :</p>';
        data += '<p id="value">{ ' + plane.lat + '°N, ' + plane.lon + '°E }</p></div>';
    }

    if (plane.oat || plane.nav_qnh) {
        data += '<div id="sep"></div><h3>Environement</h3>';
    }

    if (plane.oat) {
        data += '<div class="value"><p id="title">Air Temperature :</p>';
        data += '<p id="value">' + plane.oat + ' °C</p></div>';
    }
    if (plane.nav_qnh) {
        data += '<div class="value"><p id="title">QNH :</p>';
        data += '<p id="value">' + plane.nav_qnh + '</p></div>';
    }

    data += '<div id="sep"></div><h3>Other</h3>';

    if (plane.squawk) {
        data += '<div class="value"><p id="title">Squawk :</p>';
        data += '<p id="value">' + plane.squawk + '</p></div></br>';
    }

    if (plane.hex) {
        data += '<div class="value"><p id="title">ICAO :</p>';
        data += '<p id="value">' + (plane.hex).toUpperCase() + '</p></div>';
    }

    return data;
}

// Check If User click on a plane and display the plane information in the right panel
document.addEventListener('click', function(e) {
    if (e.target.id.startsWith('list-') || e.target.id.startsWith('marker-')) {

        let hex = e.target.id.split('-')[1];
        let plane = activePlanes[hex];

        if (!plane.lat && !plane.lon) {
            alert("This plane is not displayed on the map, must be lost.");
        }

        map.setView([plane.lat, plane.lon], 10);

        PlaneInfo = '<div class="title left-title" id="panel-' + hex + '"><h2> Flight ' + plane.flight +'</h2></div>' +
                    '<div class="container left-info">' + LeftPanelInfo(plane) + '</div>'

        document.querySelector('#PlaneInfo').innerHTML = PlaneInfo;
    }
});

// Remove the plane from the right panel when the user click on the right panel
document.addEventListener('click', function(e) {
    if (e.target.className === 'container left-info') {
        document.querySelector('#PlaneInfo').innerHTML = '';
    }
});

let updateMap = (database) => {
    let drawMarkers = (activePlanes) => {
        markers.clearLayers();
        Object.values(activePlanes).forEach(plane => {
            if (plane.lat && plane.lon) {       
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
            html: '<div class="hitbox" style="transform: rotate(' + trueTrack + 'deg) translate(-10px, 10px)"><svg xmlns="http://www.w3.org/2000/svg" class="plane" id="marker-' + plane.hex + '" version="1.0" width="32" height="32" viewBox="0 0 64.000000 64.000000"><g transform="matrix(1,0,0,-1,0,64)"><path d="m 32,5.8 0.1,0 0.2,0.1 0.4,0.3 0.5,0.8 0.7,1.7 0.5,2 0.2,2.6 0,9.9 0.6,0.8 4.1,2.8 -0.2,-1.1 0,-1.2 0.2,-1.1 0.1,-0.2 2.3,0 0.1,0.2 0.2,1.1 0,1.2 -0.2,1.2 -0.3,0 -0.1,1.2 15.9,11 0.3,0.5 0,1.5 -0.2,0.6 -8.4,-3.4 -0.1,0.4 -0.1,-0.5 -4.2,-1.4 -0.1,0.4 -0.1,-0.5 -4.4,-1.4 -1,-0.2 -0.2,0.5 -0.2,-0.5 -4,-0.4 0,8.3 -0.1,2.6 -0.4,3.8 0.5,0.7 7.5,5.8 0,1.9 -9.2,-2.4 -0.7,1.5 -0.1,1.3 -0.2,0 -0.1,-1.3 -0.7,-1.5 -9.2,2.4 0,-1.9 7.5,-5.8 0.5,-0.7 -0.4,-3.8 -0.1,-2.6 0,-8.3 -4,0.4 -0.2,0.5 -0.2,-0.5 -1,0.2 -4.4,1.4 -0.1,0.5 -0.1,-0.4 -4.2,1.4 -0.1,0.5 -0.1,-0.4 -8.4,3.4 -0.2,-0.6 0,-1.5 0.3,-0.5 15.9,-11 -0.1,-1.2 -0.3,0 -0.2,-1.2 0,-1.2 0.2,-1.1 0.1,-0.2 2.3,0 0.1,0.2 0.2,1.1 0,1.2 -0.2,1.1 4.1,-2.8 0.6,-0.8 0,-9.9 0.2,-2.6 0.5,-2 0.7,-1.7 0.5,-0.8 0.4,-0.3 0.2,-0.1 z" fill="#' + plane.hex + '"/></g></svg></div>' +
                  '<div class="plane-info" id="marker-' + plane.hex + '">' + planeToplaneGlobal(plane) + '</div>'
            })
        });
        
        markers.addLayer(newMarker).addTo(map);
    }
    let addPathMarker = (plane) => {
        if (!plane.path) {
            addPlanePath(plane);
        }
        plane.path.addLatLng(L.latLng(plane.lat, plane.lon));
    };

     let updatePlanes = (res, http) => {
        if (!http.responseText) return;
        let newPlanes = JSON.parse(http.responseText).aircraft;
        newPlanes.forEach(newPlane => {
            if (!activePlanes[newPlane.hex]) {
                newPlane.new = true;
                newPlane.firstSeen = Date.now();                
            } else {
                let storedPlane = activePlanes[newPlane.hex];
                newPlane.firstSeen = storedPlane.firstSeen;

                // All Data signification available here : https://github.com/Mictronics/readsb/blob/master/README-json.md

                //Plane Position
                if (!newPlane.lat || !newPlane.lon) {
                    newPlane.lat = storedPlane.lat;
                    newPlane.lon = storedPlane.lon;
                }
                if (!newPlane.roll) {
                    newPlane.roll = storedPlane.roll;
                }
                if (!newPlane.track) {
                    newPlane.track = storedPlane.track;
                }
                if (!newPlane.mag_heading) {
                    newPlane.mag_heading = storedPlane.mag_heading;
                }
                if (!newPlane.true_heading) {
                    newPlane.true_heading = storedPlane.true_heading;
                }

                //Plane Temperature
                if (!newPlane.oat) {
                    newPlane.oat = storedPlane.oat;
                }
                if (!newPlane.tat) {
                    newPlane.tat = storedPlane.tat;
                }

                //Plane Altitude
                if (!newPlane.alt_baro) {
                    newPlane.alt_baro = storedPlane.alt_baro;
                }
                if (!newPlane.alt_geom) {
                    newPlane.alt_geom = storedPlane.alt_geom;
                }
                if (!newPlane.baro_rate) {
                    newPlane.baro_rate = storedPlane.baro_rate;
                }
                if (!newPlane.geom_rate) {
                    newPlane.geom_rate = storedPlane.geom_rate;
                }
                if (!newPlane.nav_qnh) {
                    newPlane.nav_qnh = storedPlane.nav_qnh;
                }

                //Plane Speed
                if (!newPlane.gs) {
                    newPlane.gs = storedPlane.gs;
                }
                if (!newPlane.ias) {
                    newPlane.ias = storedPlane.ias;
                }
                if (!newPlane.tas) {
                    newPlane.tas = storedPlane.tas;
                }
                if (!newPlane.mach) {
                    newPlane.mach = storedPlane.mach;
                }

                // Other
                if (!newPlane.flight) {
                    newPlane.flight = storedPlane.flight;
                }
                if (!newPlane.regid) {
                    newPlane.regid = storedPlane.regid;
                }
                if (!newPlane.squawk) {
                    newPlane.squawk = storedPlane.squawk;
                }
                if (!newPlane.shortName) {
                    newPlane.shortName = storedPlane.shortName;
                }
                if (!newPlane.longName) {
                    newPlane.longName = storedPlane.longName;
                }
                if (!newPlane.operatorName) {
                    newPlane.operatorName = storedPlane.operatorName;
                }
                if (!newPlane.constmaj) {
                    newPlane.constmaj = storedPlane.constmaj;
                }
                if (!newPlane.photo) {
                    newPlane.photo = storedPlane.photo;
                }

                newPlane.path = storedPlane.path;
            } 
            if (newPlane.new) {
                for (var i = 0; i < database.length; i++) {
                    if (database[i].icao) {
                        if (database[i].icao === newPlane.hex) {
                            if (database[i].regid) {
                                newPlane.regid = database[i].regid;

                                // Get response from GetPhoto and srap the html to get the image url
                                var photo = getPhoto(newPlane.regid);
                                var img = photo.match(/<img src="\/\/cdn.jetphotos.com(.*?)"/g);
                                img = img[0].replace(/<img src="\/\//g, '').replace(/">/g, '');
                                newPlane.photo = 'https://' + img.substring(0, img.length - 1);
                            }
                            if (database[i].nameShort ) {
                                newPlane.shortName = database[i].nameShort;
                            }
                            if (database[i].nameLong) {
                                newPlane.longName = database[i].nameLong;
                            }
                            if (database[i].operatorName) {
                                newPlane.operatorName = database[i].operatorName;
                            }
                            if (database[i].constmaj) {
                                newPlane.constmaj = database[i].constmaj;
                            }
                        }
                    }
                }
            }
            activePlanes[newPlane.hex] = newPlane;
            
        });
        Object.values(newPlanes).forEach((plane, index) => {
            if (plane.seen > planeTimeout) {
                removePlane(plane);
            }
        });
        drawMarkers(activePlanes);
    };

    getNewData(updatePlanes);
    setInterval(getNewData.bind(this, updatePlanes), LostTimeout * 1000);
};

updateMap(loadDatabase());