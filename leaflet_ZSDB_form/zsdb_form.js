// Create map and attach id to element with id "mapid"
var map = L.map('mapid', {
    minZoom: 13,
    maxZoom: 28,
  // Use lv03 (EPSG:21781) projection
  crs: L.CRS.EPSG21781,
});

// Add Swiss layer with default options
L.tileLayer.swiss().addTo(map);

// Center the map on Switzerland
map.fitSwitzerland();

// Add a marker with a popup in Bern
//L.marker(L.CRS.EPSG21781.unproject(L.point(2600000, 1200000))).addTo(map)
//  .bindPopup('Bern')
//  .openPopup();


// PLUGIN HASH AND COORDINATES

'use strict';

var NARROW_NO_BREAK_SPACE = '\u202F';

// Initialize Leaflet-hash plugin which syncs map center/zoom with URL hash
var hash = L.hash(map);
hash.update();

if (map.getZoom() === undefined) {
  // Set default view if there was no URL hash
  map.setView(L.CRS.EPSG21781.unproject(L.point(600000, 200000)), 21);
}

// Add scale bar on the bottom left
L.control.scale({ imperial: false, maxWidth: 200 }).addTo(map);


//To stop popup from showing up when drawing on map.
var drawing = false;
map.on(L.Draw.Event.DRAWSTART, e => drawing = true);
map.on(L.Draw.Event.DRAWSTOP, e => drawing = false);

//console.log(L.Draw.Event);

addCoordinatesPopupOnClick(map);
addMouseMoveCoordinates(map);

function addCoordinatesPopupOnClick(map) {
  new ClipboardJS('button').on('success', function (e) {
    var element = e.trigger;
    element.classList.add('tooltipped', 'tooltipped-s', 'tooltipped-no-delay');
    element.setAttribute('aria-label', 'Copied!');
    var removeTooltip = function() {
      element.classList.remove('tooltipped', 'tooltipped-s', 'tooltipped-no-delay');
      element.removeAttribute('aria-label');
    };
    element.addEventListener('mouseleave', removeTooltip, { once: true });
    element.addEventListener('blur', removeTooltip, { once: true });
  });
  map.on('click', function (event) {
	if(drawing) return; //if drawing of polygons is active, do not produce popup
    var latlng = event.latlng;
    var popup = L.popup(latlng, {
      content: '<div style="width: 250px;">' +
        renderCoordinates({
          label: 'LV03 (E, N)',
          id: 'coordinates-LV03',
          displayText: formatLv03Coordinates(latlng, NARROW_NO_BREAK_SPACE),
          clipboardText: formatLv03Coordinates(latlng, '')
//        }) +
//        renderCoordinates({
//          label: 'WGS 84 (latitude, longitude)',
//          id: 'coordinates-wgs84',
//          displayText: formatWgs84Coordinates(latlng, true),
//          clipboardText: formatWgs84Coordinates(latlng, false)
        }) +
        '</div>'
    });
    popup.openOn(map);
  });
}

function renderCoordinates(options) {
  return '' +
    '<div class="form-group">' +
    '  <div class="form-group-header"><label for="' + options.id + '">' + options.label + '</label></div>' +
    '  <div class="form-group-body">' +
    '    <div class="input-group">' +
    '      <input type="text" readonly id="' + options.id + '" class="form-control" onfocus="replaceWithClipboardText(this)"' +
    '             value="' + options.displayText + '" data-clipboard-text="' + options.clipboardText + '">' +
    '      <span class="input-group-button">' +
    '        <button class="btn-octicon" data-clipboard-text="' + options.clipboardText + '" aria-label="Copy to clipboard">' +
    '          <img src="img/copy.svg" alt="Copy to clipboard">' +
    '        </button>' +
    '      </span>' +
    '    </div>' +
    '  </div>' +
    '</div>';
}

function replaceWithClipboardText(textInput) {
  var value = textInput.value;
  var clipboardText = textInput.dataset.clipboardText;
  if (clipboardText !== value) {
    textInput.value = clipboardText;
    textInput.select();
    textInput.addEventListener('blur', function() {
      textInput.value = value;
    }, { once: true });
  }
}

function addMouseMoveCoordinates(map) {
  var MouseMoveCoordinatesControl = L.Control.extend({
    onAdd: function (map) {
      var container = L.DomUtil.create('div', 'leaflet-control-mouse-move-coordinates');
      container.style.background = 'rgba(255, 255, 255, 0.9)';
      container.style.border = '2px solid #777';
      container.style.padding = '2px 4px';
      container.style.color = '#333';
      container.style.fontFeatureSettings = 'tnum';
      var updateCoordinates = function (latlng) {
        var formattedCoordinates = formatLv03Coordinates(latlng, NARROW_NO_BREAK_SPACE)
        container.innerHTML = '<b>LV03 Coordinates (E, N)</b><br>' + formattedCoordinates;
      };
      map.on('mousemove', function (event) {
        updateCoordinates(event.latlng);
      });
      updateCoordinates(map.getCenter());
      return container;
    }
  });

  new MouseMoveCoordinatesControl().addTo(map);
}

function formatLv03Coordinates(latlng, separator) {
  var EN = L.CRS.EPSG21781.project(latlng);
  var coordinates = [EN.x, EN.y];
  var formattedCoordinates = coordinates.map(function(coordinate) {
    var parts = [];
    coordinate = String(Math.round(coordinate));
    while (coordinate) {
      parts.unshift(coordinate.slice(-3));
      coordinate = coordinate.slice(0, -3);
    }
    return parts.join(separator);
  });
  return formattedCoordinates.join(', ');
}

//added old swiss coordinate system
function formatLv03Coordinates(latlng, separator) {
  var EN = L.CRS.EPSG21781.project(latlng);
  var coordinates = [EN.x, EN.y];
  var formattedCoordinates = coordinates.map(function(coordinate) {
    var parts = [];
    coordinate = String(Math.round(coordinate));
    while (coordinate) {
      parts.unshift(coordinate.slice(-3));
      coordinate = coordinate.slice(0, -3);
    }
    return parts.join(separator);
  });
  return formattedCoordinates.join(', ');
}

function formatWgs84Coordinates(latlng, addSuffix) {
  var coordinates = [latlng.lat, latlng.lng];
  var suffixes = ['°N', '°E'];
  var formattedCoordinates = coordinates.map(function(coordinate, i) {
    var formatted = coordinate.toFixed(5);
    if (addSuffix) {
      formatted += suffixes[i];
    }
    return formatted;
  });
  return formattedCoordinates.join(', ');
}

// GEOSERVER WMS, WFS

// Add geoserver layers - WMS
//var wmsLayer = L.Geoserver.wms("https://geo.infofauna.ch/geoserver/wms", {
//  layers: "zsdb:zsdb_sites_inactive",
//  maxNativeZoom: 25,
//  maxZoom: 28
//});
//wmsLayer.addTo(map);

/*Original wfs  
  var wfsLayer = L.Geoserver.wfs("https://geo.infofauna.ch/geoserver/wfs", {
  layers: "zsdb:ZSDB_bek_KS",
  style: {
	  color: "#A80000",
//	  fillOpacity: "0",
//	  opacity: "0.5",
	  fillColor: "#FF5500",
	  },
  onEachFeature: function (feature, layer){
	  layer.bindPopup("ZSDB site: " + feature.properties.Name);
}});
wfsLayer.addTo(map);
 */

// modified variable to allow for several WFS layers!
var wfsLayer = L.Geoserver.wfs("https://geo.infofauna.ch/geoserver/zsdb/wfs", {
  layers: "zsdb:ZSDB_cat_CONFIRMES,zsdb:ZSDB_cat_POTENTIELS,zsdb:ZSDB_cat_SALAMANDRE",
  style: feature => {
	  let layerID = feature.id.split(".")[0];
	  if(layerID == "ZSDB_cat_POTENTIELS")
	  {
		  return {
			color: "#FFDF20",
//	  		fillOpacity: "0",
//	  		opacity: "0.5",#FFDF20
			fillColor: "#FFDF20",
	    };
	  }
	  if(layerID == "ZSDB_cat_CONFIRMES") {
		  return {
			color: "#7CCF35",
//	  		fillOpacity: "0",
//	  		opacity: "0.5",
			fillColor: "#7CCF35",
		};
	  }
	  if(layerID == "ZSDB_cat_SALAMANDRE") {
		return {
		color: "#66ccff",
//	  	fillOpacity: "0",
//	  	opacity: "0.5",
		fillColor: "#66ccff",
		};
	  }
  },	  


  onEachFeature: function (feature, layer){
    let layerID = feature.id.split(".")[0];
	let preamble = layerID.split("_")[2];
	console.log(feature);
	layer.bindPopup(preamble + ": " + feature.properties.NAME);
}});
wfsLayer.addTo(map); 

// DRAW
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
            marker: false
      }
})
map.addControl(drawControl)

// function to display coordinates in JSON format 

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
				  let xy = L.CRS.EPSG21781.project(point);
                  coordinates.push([xy.x, xy.y]);
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
	  else {
		  console.log('Unknown layer type');
		  console.log(layer);
		  console.log(layer.constructor.name);
	  }

      let featureInfo = {
            type: "Feature",
			geometry: {
				type: featureType,
				coordinates: coordinates}
      }
	  
	  //changed from json to wkt string
	  var wkt_string = "LINESTRING (" + coordinates.map(c => (Math.round(c[0]) + " " + Math.round(c[1]))).join(", ") + ")";
	  document.getElementById('coordinates').textContent = wkt_string;
	  
//      document.getElementById('coordinates').textContent = JSON.stringify(featureInfo, null, 2);
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

map.on(L.Draw.Event.CREATED, function (event) {
	
    let layer = event.layer;
    drawItems.clearLayers(); //Ensures that only one drawing can exist on map
	drawItems.addLayer(layer);
    displayCoordinates(layer);
})

map.on(L.Draw.Event.EDITED, function (event) {
	event.layers.eachLayer(layer => displayCoordinates(layer));
})