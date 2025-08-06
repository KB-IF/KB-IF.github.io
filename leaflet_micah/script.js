let map = L.map('map', { crs: L.CRS.EPSG2056 }).setView([1184616, 2660019], 15)

L.tileLayer.swiss().addTo(map);
;

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
//KB: modified structure of marker and polyline, the others are still the originals, but set to fals so they are not loaded

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
            featureType = "LineString";
            layer.getLatLngs().forEach(function (point) {
                  coordinates.push([point.lng,point.lat ]);
            });
      } else if (layer instanceof L.Marker) {
            featureType = "Marker"; 
            let latLng = layer.getLatLng();
            coordinates.push([latLng.lng, latLng.lat ])
      } else if (layer instanceof L.CircleMarker) {
            featureType = "CircleMarker";
            let latLng = layer.getLatLng();
            coordinates.push({ lat: latLng.lat, lng: latLng.lng })
      }

      let featureInfo = {
            type: "Feature",
			geometry: {
				type: featureType,
				coordinates: coordinates}
      }

      document.getElementById('coordinates').textContent = JSON.stringify(featureInfo, null, 2);
      console.log("Feature information:", featureInfo);
}

function CopyToClipboard(id){
    var r = document.createRange();
    r.selectNode(document.getElementById(id));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(r);
    try {
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
        console.log('Successfully copy text: hello world ' + r);
    } catch (err) {
        console.log('Unable to copy!');
    }
}

map.on('draw:created', function (event) {
      let layer = event.layer;
      drawItems.addLayer(layer);
      displayCoordinates(layer);
})
