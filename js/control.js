document.addEventListener('keydown', function(e) {
    if(e.key == '+') {
        document.querySelector('.leaflet-control-zoom-in').style.background = '#8b8b8b50';
        document.querySelector('.leaflet-control-zoom-in').style.color = '#10121b66';

    }
    if(e.key == '-') {
        document.querySelector('.leaflet-control-zoom-out').style.background = '#8b8b8b50';
        document.querySelector('.leaflet-control-zoom-out').style.color = '#10121b66';
    }
});

document.addEventListener('keyup', function(e) {
    if(e.key == '+') {
        document.querySelector('.leaflet-control-zoom-in').style.background = '#10121b66';
        document.querySelector('.leaflet-control-zoom-in').style.color = '#f9fafbdd';

    }
    if(e.key == '-') {
        document.querySelector('.leaflet-control-zoom-out').style.background = '#10121b66';
        document.querySelector('.leaflet-control-zoom-out').style.color = '#f9fafbdd';
    }
});
