var allWays;

// Glue-ing everything together
function learnmeacity() {
  var map = new LMap('map');
  var overpassUrl = 'http://overpass-api.de/api/interpreter';
  // When starting out with a larger map getting the streets will be too slow
  var minimumInitialLevel = 13;
  var currentChallenge;
  var tries = 0;
  var finished = {};

  function randomElement(obj) {
    return obj[Math.floor(obj.length * Math.random())];
  }

  function invalidResponseReceived(street) {
    tries++;
    showMessage('No, that\'s not ' + currentChallenge + ', but ' + street + '. (' + tries + ' tries)');
    //map.highlight(currentChallenge.ways);
    //map.waitForClick(newChallenge);
  }

  function showButton(id, msg, onclick) {
    $(id)
      .show()
      .text(msg)
      .on('click', onclick);
  }

  function hideButton(id) {
    $(id).hide();
  }

  function showMessage(msg) {
    $('#challenge').hide();

    var box = $('#message');
    box.text(msg);
    box.show();
  }

  function validResponseReceived(e) {
    var msg = 'Congratulations! Successfully identified ' + e.target.feature.properties.tags.name;

    allWays = allWays.filter(function (item) {
      return item !== e.target.feature.properties.tags.name;
    });
    e.target.setStyle({
      color: '#00ff00',
      opacity: 0.8,
      weight: 3
    });
    finished['street'] = {
      tries: tries,
      feature: e.target.feature
    };

    if (allWays.length > 0) {
      showMessage(msg);
      hideButton('#reset-button');
      showButton('#next-button', 'Next', newChallenge);
    } else {
      showMessage(msg + '. All done. Press Start to start a new game.');
      hideButton('#reset-button');
      showButton('#start-button', 'Start', startGame);
    }

  }

  function receiveResponse(e) {
    if (e.target.feature.properties.tags.name !== currentChallenge) {
      invalidResponseReceived(e.target.feature.properties.tags.name);
    } else {
      validResponseReceived(e);
    }
  }

  function showChallenge(challenge) {
    currentChallenge = challenge;
    $('#challengeStreetName').text(challenge);
    $('#challenge').show();
    $('#message').hide();
  }

  function chooseNextChallenge() {
    return randomElement(allWays);
  }

  function newChallenge() {
    hideButton('#next-button');
    showButton('#reset-button', 'Reset', startGame);
    tries = 0;
    showChallenge(chooseNextChallenge());
  }

  function waysSelected(ways) {
    allWays = ways;
    newChallenge();
  }

  function citySelected(bounds) {
    showMessage("Loading streets, please wait...");
    ways(bounds, waysSelected);
  }

  function startGame() {
    var bounds = map.getBounds();
    var zoom = map.getZoom();
    if (zoom < minimumInitialLevel) {
      showMessage("Area too large - please zoom in further");
    } else {
      hideButton('#start-button');
      hideButton('#reset-button');
      citySelected(bounds);
    }
  }

  function selectPlayingField() {
    showMessage('Please zoom to the region you want to learn');
    showButton('#start-button', 'Start Game', startGame);
  }

  function ways(bounds, callback) {
    // bounds: left/bottom/right/top in lat/lon
    query = encodeURI('[out:json];way[name][highway](' + bounds.getSouth() + ',' + bounds.getWest() + ',' + bounds.getNorth() + ',' + bounds.getEast() + ');(._; >;);out;');
    var queryUrl = overpassUrl + '?data=' + query;
    $.ajax(queryUrl, {
        dataType: "json"
      })
      .done(function (data) {
        var geojson = osmtogeojson(data);
        var streets = [];
        geojson.features.forEach(function (element, idx) {
          if (element.properties.type === 'way') {
            streets.push(element.properties.tags.name);
          }
        });
        map.addLayer(geojson, receiveResponse);

        function array_unique(arr) {
          var result = [];
          for (var i = 0; i < arr.length; i++) {
            if (result.indexOf(arr[i]) == -1) {
              result.push(arr[i]);
            }
          }
          return result;
        }
        callback(array_unique(streets));
      })
      .fail(function (jqXhr, textStatus, errorThrown) {
        showMessage("Error, please try a smaller region? ");
        console.log(jqXhr);
        console.log(errorThrown);
      });
  }
  selectPlayingField();
}