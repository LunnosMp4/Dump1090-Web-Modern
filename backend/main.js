// Copyright (c) 2022, Lunnos
// https://github.com/LunnosMp4/Dump1090-Web-Modern
// License: MIT

var fs = require('fs');
var request = require('request');
var moment = require('moment');
var __data_dirname = "data";
var __timeout = 86400000;

function Init() {
    if (!fs.existsSync(__data_dirname)) {
        fs.mkdirSync(__data_dirname);
    }
    UpdateTemp();
} 

function UpdateTemp() {
    
    var aircraft = fs.readFileSync('aircraft.json', 'utf8');
    var aircraft = JSON.parse(aircraft).aircraft;

    // Check if temp.json exists or is empty and if so init the file
    if (!fs.existsSync(__data_dirname + '/' + 'temp.json')) {
        fs.writeFileSync(__data_dirname + '/' + 'temp.json', JSON.stringify([]));
    } else if (fs.readFileSync(__data_dirname + '/' + 'temp.json', 'utf8').length == 0) {
        fs.writeFileSync(__data_dirname + '/' + 'temp.json', JSON.stringify([]));
    }

    var temp = JSON.parse(fs.readFileSync(__data_dirname + '/' + 'temp.json', 'utf8'));
    var newAircraft = [];

    for (var i = 0; i < aircraft.length; i++) {
        var found = false;
        for (var j = 0; j < temp.length; j++) {
            if (aircraft[i].hex == temp[j].hex) {
                found = true;
                break;
            }
        }
        if (!found) {
            newAircraft.push(aircraft[i]);
        }
    }
    temp = temp.concat(newAircraft);
    fs.writeFileSync(__data_dirname + '/' + 'temp.json', JSON.stringify(temp));
}

fs.watch('aircraft.json', function(event, filename) {
    if (event == 'change') {
        UpdateTemp();
    }
});

// every hour merge temp.json into aircraft<date>.json
setInterval(function() {
    // read temp.json and copy to aircraft<date>.json
    var temp = JSON.parse(fs.readFileSync(__data_dirname + '/' + 'temp.json', 'utf8'));
    var date = moment().format('YYYY-MM-DD');
    var filename = __data_dirname + '/' + 'aircraft' + date + '.json';
    fs.writeFileSync(filename, JSON.stringify(temp));
}, __timeout);

Init();