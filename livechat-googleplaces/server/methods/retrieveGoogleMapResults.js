Meteor.methods({
	'masai:retrieveAPI2'() {
		return RocketChat.settings.get('Reisebuddy_GRANT_URL');
	},
	'masai:retrieveAPI'() {
		return RocketChat.settings.get('Reisebuddy_AWS_URL');
	},
	'masai:retrieveGoogleMapResults'(searchTerm) {
		const API_KEY = RocketChat.settings.get('Reisebuddy_Google_API');//'AIzaSyAZmcBtR0ktc8v7gaMjkZxPkz_Wut8RprQ'; //please fill in google API Key for google places
		console.log('retrieveGMR: ' + searchTerm);
		const myTerms = JSON.parse(searchTerm);

		if (myTerms.length == 0)
			return {};

		const google_maps_results = _dbs.google_map_results;

		function getPictureUrls(results, apiKey ) {
			var photoArray = [];
			Array.prototype.forEach.call(results, function (item) {
				var reference = item.photos[0].photo_reference;
				var location = HTTP.call("GET", 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=100&photo_reference=' + reference + '&key=' + apiKey, {
					followRedirects: false
				}).headers.location;

				photoArray.push(location);

			});
			return photoArray;
		}

		var googleMap = google_maps_results.findOne({_id: myTerms[0].servicename});

		if (!googleMap && Meteor.isServer) {
			console.log('new query, saving');
			console.log(myTerms);
			google_maps_results.insert({_id: myTerms[0].servicename}, myTerms[0]);
			console.log("fetching from db");
			googleMap = google_maps_results.findOne(myTerms[0].servicename);
			console.log(JSON.stringify(googleMap));
		}

		if (googleMap && googleMap.hasOwnProperty('originalresults') && googleMap.hasOwnProperty('photos')) {
			console.log('delivering search results from cache');
			if (googleMap.photos.length == 0) {
				googleMap.photos = getPictureUrls(googleMap.originalresults.results, API_KEY);
				google_maps_results.update({_id: googleMap._id}, googleMap);
			}
			return googleMap.photos.map(function (data, index) {
				return {'references': data, 'google_result': googleMap.originalresults.results[index]}
			});
		}

		console.log('making request');
		const google_maps_url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=';
		


		const query =encodeURI(google_maps_url + myTerms[0].searchterms.join('+') + '&key=' + API_KEY);
		console.log(query);

		const searchResults = HTTP.get(query);
		var placespictures = [];

		if (!searchResults.data.hasOwnProperty('error_message')) {
			searchResults.data.results.forEach(function (item) {
				if (item.photos) {
					var reference = item.photos[0].photo_reference;
					var location = HTTP.call("GET", 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=100&photo_reference=' + reference + '&key=' + API_KEY , {
						followRedirects: false
					}).headers.location;
					placespictures.push(location);
				}
				else placespictures.push('');

			});
		}
		googleMap.photos = placespictures;

		googleMap.originalresults = searchResults ? searchResults.data : null;

		google_maps_results.update({_id: googleMap._id}, googleMap);

		var mmap = googleMap.photos.map(function (data, index) {
			return {'references': data, 'google_result': googleMap.originalresults.results[index]}
		});
		mmap["api_url"] = RocketChat.settings.get('Reisebuddy_AWS_URL');
		console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
		console.log(mmap);
		console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
		return mmap;

		//	return { 'servicename' : googleMap.servicename, 'searchterms' : googleMap.searchterms, 'photos': googleMap.photos, 'originalresults': googleMap.originalresults};//results.data};

	}
});
