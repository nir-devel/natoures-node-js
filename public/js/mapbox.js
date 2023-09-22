console.log('HELLO FROM THE CLIENT SIDE');
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

//this.#map = L.map('map').setView(coords, 13);
var map = L.map('map', { zoomControl: false }); //to disable + - zoom
// var map = L.map('map', { zoomControl: false }).setView([31.111745, -118.113491], );

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  crossOrigin: '',
}).addTo(map);

const points = [];
locations.forEach((loc) => {
  points.push([loc.coordinates[1], loc.coordinates[0]]);
  L.marker([loc.coordinates[1], loc.coordinates[0]])
    .addTo(map)
    .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, {
      autoClose: false,
    })
    .openPopup();
});

/**
 * IMPORTANT: the bounds variable - is the area which will be displayed on the map
 * PUT ALL LOCATOIN POINTS FOR A GIVEN TOUR ON THE MAP AND LET THE MAP TO FIGURE OUT  
    WHICH PORTION OF THE MAP IT SHOULD DISPLAY!
    IN ORDER TO FIT ALL THE POINTS CORRECTLRY 
 */
const bounds = L.latLngBounds(points).pad(0.5);

/**Loop over all the locations and add a marker on each of them */
locations.forEach((loc) => {
  const el = document.createElement('div');
  el.className = 'marker';

  //Create a new marker in leaflet
});

map.fitBounds(bounds);

//this.#map = L.map('map').setView(coords, 13);

map.scrollWheelZoom.disable(); //to disable zoom by mouse wheel
