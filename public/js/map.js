document.addEventListener("DOMContentLoaded", function() {
    const mapDiv = document.getElementById("map");
    if(!mapDiv) return;
    
    const lat = parseFloat(mapDiv.dataset.lat);
    const lon = parseFloat(mapDiv.dataset.lon);
    const title = mapDiv.dataset.title;

    var map = L.map('map').setView([lat, lon], 10);
    
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    
    var redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    L.marker([lat, lon], {icon: redIcon}).addTo(map)
        .bindPopup(`<h6>${title}</h6><p>Exact Location will be provided after booking</p>`)
        
});