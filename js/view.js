// In this example, we center the map, and add a marker, using a LatLng object
// literal instead of a google.maps.LatLng object. LatLng object literals are
// a convenient way to add a LatLng coordinate and, in most cases, can be used
// in place of a google.maps.LatLng object.
var map;
function initialize() {
  var mapOptions = {
    zoom: 17,
    center: {lat: 41.3242, lng: -74.8028}
  };
  map = new google.maps.Map(document.getElementById('map'),
      mapOptions);

  //Initial Marker for Milford 
  var marker = new google.maps.Marker({
    position: {lat: 41.3242, lng: -74.8028},
    map: map
  });

  var infowindow = new google.maps.InfoWindow({
    content: '<p>Milford, Pennsylvania' + '<br>' + 'A Borough of Pike County' + '</p>'
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(map, marker);
  });
}

google.maps.event.addDomListener(window, 'load', initialize);