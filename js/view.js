function appViewModel() {
  var self = this; 
  var map;
  var service;
  var infowindow;
  var lat = '';
  var lng = '';
//Lat and Lng of Milford Pennslyvania
  var Milford = new google.maps.LatLng(41.3242,-74.8028);
  var markersArray = [];  
// array to hold info for knockout
  self.allPlaces = ko.observableArray([]);
  self.foursquareInfo = '';
// Finds the center of the map to get lat and lng values
  function computeCenter() {
    var latAndLng = map.getCenter();
      lat = latAndLng.lat();
      lng = latAndLng.lng(); 
  };

//Loads Map, Search & List Locations
  function initialize() {
    map = new google.maps.Map(document.getElementById('map-canvas'), {
    center: Milford,    
    });
    getPlaces();
    computeCenter();       
//Shows list of locations with markers
    var list = (document.getElementById('list'));
    map.controls[google.maps.ControlPosition.LEFT_CENTER].push(list);
    var input = (document.getElementById('pac-input'));
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    var searchBox = new google.maps.places.SearchBox(
      (input));
    google.maps.event.addListener(searchBox, 'places_changed', function() {
      var places = searchBox.getPlaces();
      clearOverlays();
      self.allPlaces.removeAll();
      var bounds = new google.maps.LatLngBounds();  


      for(var i=0, place; i<10; i++){
        if (places[i] !== undefined){
          place = places[i];

          getAllPlaces(place);
          createMarker(place);
          bounds.extend(place.geometry.location);          
        };       
      };
      map.fitBounds(bounds); 
      computeCenter();                
    });
    google.maps.event.addListener(map, 'bounds_changed', function(){
      var bounds = map.getBounds();
      searchBox.setBounds(bounds);
    });      
  };

// Function to show markers on the map with place types created by google
  function getPlaces() {
    var request = {
      location: Milford,
      radius: 600,
      types: ['museum','library','bakery', 'bar']
    };

    infowindow = new google.maps.InfoWindow();
    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);    
  };

//Creates markers for locations
  function callback(results, status){
    if (status == google.maps.places.PlacesServiceStatus.OK){
      bounds = new google.maps.LatLngBounds();
      results.forEach(function (place){
        place.marker = createMarker(place);
        bounds.extend(new google.maps.LatLng(
          place.geometry.location.lat(),
          place.geometry.location.lng()));
      });
      map.fitBounds(bounds);
      results.forEach(getAllPlaces);                 
    };
  };


//Function to create a marker at each place.
  function createMarker(place) {
    var marker = new google.maps.Marker({
      map: map,
      name: place.name.toLowerCase(),
      position: place.geometry.location,
      place_id: place.place_id,
  // Added brief animation where markers drop onto map
      animation: google.maps.Animation.DROP
    });    
    var address;
    if (place.vicinity !== undefined) {
      address = place.vicinity;
    } else if (place.formatted_address !== undefined) {
      address = place.formatted_address;
    };     
    var contentString = '<div>' + place.name + '</div><div>' + address + '</div>' + self.foursquareInfo ;

    google.maps.event.addListener(marker, 'click', function() {      
      infowindow.setContent(contentString);      
      infowindow.open(map, this);
      map.panTo(marker.position); 
  // Added brief bounce to markers when clicked on map
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function(){marker.setAnimation(null);}, 1450);
    });

    markersArray.push(marker);
    return marker;
  };

  // Foursquare Credentials
  var clientID = 'UVSLUM00CXLUB1P0UKPJSLDTG0VVYQ2E20W1C045PBU1OJNZ';
  var clientSecret = 'JERNMOY0EUXF4LGZTWDLLJFR2CXWDSZWL1JU2W5CS1POPZBF';

  this.getFoursquareInfo = function(point) {
    // creats our foursquare URL
    var foursquareURL = 'https://api.foursquare.com/v2/venues/search?client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20150321' + '&ll=' +lat+ ',' +lng+ '&query=\'' +point.name +'\'&limit=1';
    
    $.getJSON(foursquareURL)
      .done(function(response) {
        self.foursquareInfo = '<p>Foursquare:<br>';
        var venue = response.response.venues[0];         
        // Name       
        var venueName = venue.name;
            if (venueName !== null && venueName !== undefined) {
                self.foursquareInfo += 'Name: ' +
                  venueName + '<br>';
            } else {
              self.foursquareInfo += 'Name: Not Found';
            }   
        // Phone Number     
        var phoneNum = venue.contact.formattedPhone;
            if (phoneNum !== null && phoneNum !== undefined) {
                self.foursquareInfo += 'Phone: ' +
                  phoneNum + '<br>';
            } else {
              self.foursquareInfo += 'Phone: Not Found';
            }
        // Twitter
        var twitterId = venue.contact.twitter;
            if (twitterId !== null && twitterId !== undefined) {
              self.foursquareInfo += 'twitter: @' +
                  twitterId + '<br>';
            } 
      });
  };  
   
  //Change position to center over active marker
  self.clickMarker = function(place) {
    var marker;

    for(var e = 0; e < markersArray.length; e++) {      
      if(place.place_id === markersArray[e].place_id) { 
        marker = markersArray[e];
      // Added brief bounce to markers when clicked in list
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){marker.setAnimation(null);}, 1450);
        break; 
      };
    } ;   
    self.getFoursquareInfo(place);      
    map.panTo(marker.position);        
  };


 //Collect information about Places
  function getAllPlaces(place){
    var myPlace = {};    
    myPlace.place_id = place.place_id;
    myPlace.position = place.geometry.location.toString();
    myPlace.name = place.name;

    var address;    
    if (place.vicinity !== undefined) {
      address = place.vicinity;
    } else if (place.formatted_address !== undefined) {
      address = place.formatted_address;
    };
    myPlace.address = address;
    
    self.allPlaces.push(myPlace);                
  };

  //ClearMap
  function clearOverlays() {
    for (var i = 0; i < markersArray.length; i++ ) {
     markersArray[i].setMap(null);
    };
    markersArray.length = 0;
  };

  google.maps.event.addDomListener(window, 'load', initialize);
};

$(function(){
ko.applyBindings(new appViewModel());
});