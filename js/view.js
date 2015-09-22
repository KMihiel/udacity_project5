"use strict";
//Start of models
var model = {
	//My chosen locations of interest for markers
	myLocs : [
	{
		name : "Grey Towers",
		lat : "41.322316",
		lng : "-74.802388",
		formatted_address : "122 Old Owego Turnpike Milford, PA 18337",
		content : "Home of Gifford Pinchot, founder of the Forestry Movement",
	},
	{
		name : "Kitatinny Canoes",
		lat : "41.343152",
		lng : "-74.759904",
		formatted_address : "378 US-6 Milford, PA 18337",
		content : "Go for a scenic boat trip down the Delaware River",
	},
	{
		name : "Hotel Fauchere",
		lat : "41.323639",
		lng : "-74.801177",
		formatted_address : "401 Broad St, Milford, PA 18337",
		content : "The Best Hotel in Milford!",
	},
	{
		name : "Waterwheel Cafe",
		lat : "41.323920",
		lng : "-74.809835",
		formatted_address : "150 Water St Milford, PA 18337",
		content : "Unique and Exciting Dining Experience",
	},
	{
		name : "The Columns Museum",
		lat : "41.326136",
		lng : "-74.799191",
		formatted_address : "608 Broad Street, Milford, PA 18337",
		content : "A small town histroic museum featuring American artifacts.",
	}
	],
	// initial marker for Milford PA
	mapOptions : {
    	zoom: 12,
    	center: new google.maps.LatLng(41.3242,-74.8028)
  	},

  	defaultBounds : new google.maps.LatLngBounds(
			new google.maps.LatLng(41.36, -74.84),
			new google.maps.LatLng(41.29, -74.74)),

  	screenwidth : $(window).width(),

	resultsWidth : $("#search-results").width(),

	searchMarkers : []
};

var viewModel = {
	getBounds : model.defaultBounds,

	getMapOptions : this.mapOptions,

	myLocs : model.myLocs,

};

var koViewModel = {
	searchResults : ko.observableArray([]),
	initialResults : ko.observableArray([]),
	haveSearchResults : ko.observable(false),

	clearResults : function() {
		this.searchResults.removeAll();
		//hide search results box
		this.haveSearchResults(false);
	},

	resultClick : function(result) {
		var address, setLat, setLon, searchLat, searchLon, request_url, lat, lon, streetWide, streetHeight;

		address = result.formatted_address;
		//Lat & lon from my points of interest
		setLat = result.lat;
		setLon = result.lng;
		//Lat & Lon from searched locations
		searchLat = (typeof result.geometry) === "undefined" ? "undefined" : result.geometry.location.A;
		searchLon = (typeof result.geometry) === "undefined" ? "undefined" : result.geometry.location.F;
		//Setting lat and lon
		lat = searchLat !== "undefined" ? searchLat : setLat;
		lon =  searchLon !== "undefined" ? searchLon : setLon;		
	},

	//click event for selecting markers on map
	selectMarker : function(result){
		var clickedMarker = model.searchMarkers[result.clickId];
		google.maps.event.trigger(clickedMarker, 'click');
	},
};
ko.applyBindings(koViewModel);


var mapView = {
	init : function () {
		//Map location
		var markers = [];
	  	var map = new google.maps.Map(document.getElementById('map-canvas'), viewModel.getMapOptions);

		//Search box start
		var defaultBounds = viewModel.getBounds;
		map.fitBounds(defaultBounds);

		// Create the search box and link it to the UI element.
		var input = /** @type {HTMLInputElement} */(
		  document.getElementById('search-input'));
		map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

		var searchBox = new google.maps.places.SearchBox(
		(input));

		// find info related to search item
		google.maps.event.addListener(searchBox, 'places_changed', function() {
			model.searchMarkers = [];
			var places = searchBox.getPlaces();



			var placesLength = places.length;

			for(var i = 0; i < placesLength; i++){
				places[i].clickId = [i];
				koViewModel.searchResults.push(places[i]);

				koViewModel.initialResults(koViewModel.searchResults.slice(0));
			}

			koViewModel.haveSearchResults(true);
			$("#left-info").removeClass("results-hide");

			if (placesLength === 0) {
				return;
			}

			for (var i = 0; i < markers.length; i++) {
				marker.setMap(null);
			}

			var bounds = new google.maps.LatLngBounds();
			markers = [];

			for (var i = 0, place; place = places[i]; i++) {
				var image = {
			    	url: place.icon,
			    	size: new google.maps.Size(71, 71),
			    	origin: new google.maps.Point(0, 0),
			    	anchor: new google.maps.Point(17, 34),
			    	scaledSize: new google.maps.Size(25, 25)
			  	};

				// Create a marker point for each location.
				var marker = new google.maps.Marker({
				    map: map,
				    icon: image,
				    name: place.name,
				    position: place.geometry.location,
				    id: [i]
				});

				markers.push(marker);
				model.searchMarkers = markers;

				//Custom infobox with class for css and id for javascript
				var boxText = '<div id="infobox" class="infobox-outer"><div class="infobox-inner">';
	        		boxText += place.name + "<br/>" + place.formatted_address;
	        		boxText += '</div></div>';

				var infoboxOptions = {
					content : boxText,
					disableAutoPan: false,
					maxWidth: 0,
					pixelOffset: new google.maps.Size(-145, -10),
					zIndex: null,
					boxStyle: {
						opacity: 1,
						width: "280px",
					},
					closeBoxMargin: "10px 2px 2px 2px",
					infoBoxClearance: new google.maps.Size(1, 1),
					isHidden: false,
					pane: "floatPane"
				};

				//Add listener for marker click events
				google.maps.event.addListener(marker, 'click',(function(marker, i) {

					var infobox = new InfoBox(infoboxOptions);

					return function(){
						//Remove old infobox if any
						$('#infobox').remove();
						//Add new infobox for new item
						infobox.open(map, marker);
						koViewModel.resultClick(places[i]);
						//Center the map on chosen location
						var latLng = marker.getPosition();
						map.setCenter(latLng);
					};
				})(marker, i));

				bounds.extend(place.geometry.location);
			}

		map.fitBounds(bounds);
		});

		google.maps.event.addListener(map, 'bounds_changed', function() {
			var bounds = map.getBounds();
			searchBox.setBounds(bounds);
		});
		mapView.setMarkers(map, viewModel.myLocs);
	},

	//Add my points of interest markers to the map when the page originally loads 
	setMarkers : function(map, locations) {

		var myLocLength = viewModel.myLocs.length;

		for(var i = 0; i < myLocLength; i++){

			//Create map marker 
			var marker = new google.maps.Marker({
		    	position: new google.maps.LatLng( viewModel.myLocs[i].lat , viewModel.myLocs[i].lng ),
		    	map: map,
		    	name: viewModel.myLocs[i].name
			});

			//Custom infobox for styling 
	        var boxText = '<div id="infobox" class="infobox-outer"><div class="infobox-inner">';
	        	boxText += viewModel.myLocs[i].name + "<br/>" + viewModel.myLocs[i].formatted_address + "<br/>" + viewModel.myLocs[i].content;
	        	boxText += '</div></div>';

			var infoboxOptions = {
		            content : boxText,
		            disableAutoPan: false,
		            maxWidth: 0,
		            pixelOffset: new google.maps.Size(-140, 0),
		            zIndex: null,
		            boxStyle: {
                		opacity: 1,
                		width: "280px",
            		},
		 			closeBoxMargin: "10px 2px 2px 2px",
		 			infoBoxClearance: new google.maps.Size(1, 1),
		 			isHidden: false,
		 			pane: "floatPane"
		        };

			//Add event listener for marker click events
			google.maps.event.addListener(marker, 'click', (function(marker, i) {
				//Create marker info window
				var infobox = new InfoBox(infoboxOptions);

				return function(){
					//Remove old infobox if any
					$('#infobox').remove();
					//Add new infobox
					infobox.open(map, marker);
					//Un-hide results window and display results
					koViewModel.resultClick(viewModel.myLocs[i]);
					$("#left-info").removeClass("results-hide");
					//Center the map on clicked marker
					var latLng = marker.getPosition();
					map.setCenter(latLng);
					console.log(marker);
				};

			})(marker, i));
		}
	}
};
google.maps.event.addDomListener(window, 'load', mapView.init);
