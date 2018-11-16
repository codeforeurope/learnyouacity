function LMap(id) {
  var mapbox_token = 'pk.eyJ1IjoibWlibG9uIiwiYSI6ImNqYTlleHZ6dTBocjgzM25pOHhoNWlndWwifQ.yQd0SHT9J3gmTqmbx1amsg';
  var osmLayer = new L.TileLayer('https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=' +
    mapbox_token, {
      attribution: '© <a href="https://www.mapbox.com/feedback/">Mapbox</a>' +
        '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

  var map = new L.Map(id, {
    layers: [osmLayer],
    center: [12.1358, -68.9336],
    zoom: 16,
    zoomControl:false
  });
  var layer;
  var callback;

  // Public API
  return {
    // Allow the user to select a box using shift-click, call a callback with the bounds on success
    // center the map to the middle of the 'bounds' and zoom to the zoom level specified
    map: map,
    getBounds: function () {
      return map.getBounds();
    },
    callback,
    zoomTo: function (coords, zoom) {
      map.setView(coords, zoom);
    },
    getZoom: function () {
      return map.getZoom();
    },
    clickResult: function () {
      return street;
    },

    addLayer: function (data, callback) {
      if(layer){
        map.removeLayer(layer);
      }
      var noIcon = new L.Icon({
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        iconUrl: 'blank'
      });

      layer = L.geoJSON(data, {
        style: {
          "opacity": 0.2,
          "color": '#ffff00'
        },
        pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {
            icon: noIcon
          });
        },
        onEachFeature: function (feature, featureLayer) {
          featureLayer.on('click', function (e) {
            callback(e);
          });
        }
      });
      if(layer && !map.hasLayer(layer)){
        layer.addTo(map);
      }
    },
    toLatlng: function (lnglat) {
      return L.latLng(lnglat.lat, lnglat.lng);
    },
  };
};