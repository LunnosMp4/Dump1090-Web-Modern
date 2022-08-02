window.planeAnnouncements = [];

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

// Heatmap setup
let heat = L.heatLayer([]).addTo(map);

let addPlanePath = (plane) => {
    plane.path = L.polyline([], {color: 'black'}).addTo(map);
}

// === End map setup ===

// === Settings ===
// Time between data fetches in seconds
let dataFetchBreakTime = 1;
// How long to wait until we remove planes from the map (seconds)
let planeTimeout = 60;
// In-mem plane storage
let activePlanes = {};
// On/off toggle for heatmap
let heatMapActive = true;
// === End Settings

/**
 * Remove plane from the system
 * @param {*} plane 
 */
let removePlane = (plane) => {
    if(plane.path) {
        map.removeLayer(plane.path);
    }
    delete activePlanes[plane.hex];
}

/**
 * Fetch new data from the server
 * @param {Function} cb Called with state change and XMLHttpRequest
 */
let getNewData = (cb) => {
    const Http = new XMLHttpRequest();
    const url='./aircraft.json'; // dump1090 server
    Http.open("GET", url);
    Http.send();
    Http.onreadystatechange=(res) => {
        cb(res, Http)
    };
}

/**
 * Takes server-returned plane object and converts to HTML info text
 * @param {*} plane 
 */
let planeToplaneGlobal = (plane) => {
    if (plane.seen > planeTimeout - 10) return 'Lost'; // 10 seconds before removal, flag as being lost
    let planeGlobal = 'Flight : ' + plane.flight + '<br>';
    if(plane.alt_baro){
        planeGlobal += ' Alt: ' + plane.alt_baro + 'ft<br>';
    }
    if(plane.gs) {
        planeGlobal += ' Spd: ' + plane.gs + 'kts<br>';
    }
    return planeGlobal;
}

let announceCurrentPlanes = () => {
    window.planeAnnouncements.forEach(cb => cb(activePlanes));
};


/**
 * Call this once to trigger the map continuous update
 */
let updateMap = () => {
    /**
     * Remove and re-add plane markers and info
     * @param {*} activePlanes Our plane repository
     */
    let drawMarkers = (activePlanes) => {
        // clear map markers
        markers.clearLayers();
        Object.values(activePlanes).forEach(plane => {
            if(plane.lat && plane.lon) {       
                addPlaneMarker(plane);
                updateHeatmapLayer(plane);
                addPathMarker(plane);
                addGlobalPanel(plane);
            }
        });
    };
    /**
     * Update the heatmap with the location of a plane
     * Assumes valid coordinates
     * Ignores if plane has not been seen in 
     * @param {*} plane 
     */
    let updateHeatmapLayer = (plane) => {
        // Add heatmap markers for recent positions
        if(heatMapActive && plane.seen < dataFetchBreakTime + 1) {
            heat.addLatLng([plane.lat, plane.lon]);
        }
        removeGlobalPanel(plane);
    }

    let addGlobalPanel = (plane) => {
        let planeGlobal = planeToplaneGlobal(plane);
        let planeGlobalDiv = document.createElement('div');
        planeGlobalDiv.className = 'container full-info';
        planeGlobalDiv.innerHTML = planeGlobal;
        planeGlobalDiv.id = 'plane-global-' + plane.hex;
        document.getElementById('map').appendChild(planeGlobalDiv);
    }
    // remove global panel
    let removeGlobalPanel = (plane) => {
        let planeGlobalDiv = document.getElementById('plane-global-' + plane.hex);
        if(planeGlobalDiv) {
            document.getElementById('map').removeChild(planeGlobalDiv);
        }
    }

    /**
     * Add a plane icon and hover info panel
     * @param {*} plane 
     */
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
    /**
     * Used as callback for getNewData
     * Updates our in-mem plane repository including removing old planes
     * @param {*} res 
     * @param {*} http 
     */
     let updatePlanes = (res, http) => {
        if(!http.responseText) return;
        let newPlanes = JSON.parse(http.responseText).aircraft;
        // Add/update with returned planes
        newPlanes.forEach(newPlane => {
            if(!activePlanes[newPlane.hex]) {
                newPlane.new = true;
                newPlane.firstSeen = Date.now();
            } else {
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
            // Add or override
            activePlanes[newPlane.hex] = newPlane;
        });
        // include out of date planes in our update
        announceCurrentPlanes();
        // Remove out of date planes
        Object.values(newPlanes).forEach((plane, index) => {
            if(plane.seen > planeTimeout){
                removePlane(plane);
                removeGlobalPanel(plane);
            }
        });
        drawMarkers(activePlanes);
    };

    getNewData(updatePlanes);
    setInterval(getNewData.bind(this, updatePlanes), dataFetchBreakTime * 1000);
};

updateMap();