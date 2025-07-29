let map = L.map('map').setView([46.8, 8.2], 8)

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let drawItems = new L.FeatureGroup();
map.addLayer(drawItems);

// initialize the draw control

let drawControl = new L.Control.Draw({
      edit: {
            featureGroup: drawItems
      },
      draw: {
            polygon: false,
            polyline: true,
            rectangle: false,
			circle: false,
            circlemarker: false,
            marker: true
      }
})
map.addControl(drawControl)

// function to display coordinates in JSON format 
//KB: modified structure

function displayCoordinates(layer) {
      let coordinates = [];
      let featureType = "";

      if (layer instanceof L.Polygon) {
            featureType = "Polygon";
            layer.getLatLngs()[0].forEach(function (point) {
                  coordinates.push({ lat: point.lat, lng: point.lng });
            })
      } else if (layer instanceof L.Circle) {
            featureType = "Circle";
            let latLng = layer.getLatLng();
            coordinates.push({ lat: latLng.lat, lng: latLng.lng });
      } else if (layer instanceof L.Rectangle) {
            featureType = "Rectangle";
            layer.getLatLngs()[0].forEach(function (point) {
                  coordinates.push({ lat: point.lat, lng: point.lng });
            })
      } else if (layer instanceof L.Polyline) {
            featureType = "Polyline";
            layer.getLatLngs().forEach(function (point) {
                  coordinates.push({ lat: point.lat, lng: point.lng });
            });
      } else if (layer instanceof L.Marker) {
            featureType = "Marker";
            let latLng = layer.getLatLng();
            coordinates.push({ lat: latLng.lat, lng: latLng.lng })
      } else if (layer instanceof L.CircleMarker) {
            featureType = "CircleMarker";
            let latLng = layer.getLatLng();
            coordinates.push({ lat: latLng.lat, lng: latLng.lng })
      }

      let featureInfo = {
            type: featureType,
            coordinates: coordinates
      }

      document.getElementById('coordinates').textContent = JSON.stringify(featureInfo, null, 2);
      console.log("Feature information:", featureInfo);
}

map.on('draw:created', function (event) {
      let layer = event.layer;
      drawItems.addLayer(layer);
      displayCoordinates(layer);
})
