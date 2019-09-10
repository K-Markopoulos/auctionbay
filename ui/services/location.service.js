import ApiService from './api.service';

let mymap;
const searchURL = 'https://nominatim.openstreetmap.org/search?format=json';

const LocationService = {
  createMap(id, coords) {
    mymap = L.map(id, {
      center: coords,
      zoom: 16,
      dragging: true,
      zoomControl: false
    });
    
    L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mymap);

    L.marker(coords).addTo(mymap);
  },
};

export default LocationService;