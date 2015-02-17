var latitude, longitude, formatted_search_input;

$(document).ready(function(){

	$('#search-field').keypress(function(e) {
		if (e.which == 13) {
			var search_input = $(this).val();
			$(this).val("");
			// console.log(search_input.trim().replace(' ','+').replace(',',''));
			formatted_search_input = search_input.trim().replace(' ','+').replace(',','');
			get_coordinates(formatted_search_input);
		}
	});

	function get_coordinates(location_name) {

		$.ajax({

			// The 'type' property sets the HTTP method.
			// A value of 'PUT' or 'DELETE' will trigger a preflight request.
			type: 'GET',

			// google map API doesn't support JSONP format
			dataType: 'json',

			// The URL to make the request to.
			// url: "https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=AIzaSyBsQg7uGxTdAUNaGVw4qWQ1wiYkfoPx6HQ",
			// url: "https://maps.googleapis.com/maps/api/geocode/json?address=manlius+ny&key=AIzaSyBsQg7uGxTdAUNaGVw4qWQ1wiYkfoPx6HQ",
			url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + location_name + "&key=AIzaSyBsQg7uGxTdAUNaGVw4qWQ1wiYkfoPx6HQ",

			success: function(data) {
				try {
					latitude = data['results'][0]['geometry']['location']['lat'];
					longitude = data['results'][0]['geometry']['location']['lng'];
					console.log(data);
					get_weather();		
				}
				catch(err) {
					console.log("Invalid location.");
					$('.container.panel-primary').hide();
				}
				
			},

			error: function() {
				console.log("AJAX request for Geocode API failed.");
			},

			async: false,
		});

	}
	
	console.log(latitude + " " + longitude + "!");

	function get_weather() {
		$.ajax({

			// The 'type' property sets the HTTP method.
			// A value of 'PUT' or 'DELETE' will trigger a preflight request.
			type: 'GET',

			dataType: 'jsonp',

			// The URL to make the request to.
			url: "https://api.forecast.io/forecast/e27ae1f9f8be2c73c1648f94f81cf04a/" + latitude + "," + longitude,
			// url: "https://api.forecast.io/forecast/e27ae1f9f8be2c73c1648f94f81cf04a/43.0469,-76.1444",
			// url: "https://api.forecast.io/forecast/e27ae1f9f8be2c73c1648f94f81cf04a/40.4,-3.6833",

			success: function(data) {
				// Here's where you handle a successful response.
				format_data(data);
			},

			error: function() {
				console.log("AJAX request for Weather IO API failed.");
			},

		});
	}

	function format_data(data) {

		console.log(data);


		// ** CURRENTLY **
		
		// time
		var unix_time = data['currently']['time'];
		
		// humidity
		var current_humidity = Math.round(data['currently']['humidity'] * 100);
		$('div[data-city="Portland, OR"] .current-humidity').html(current_humidity);

		// summary
		var current_summary = data['currently']['summary'];
		$('div[data-city="Portland, OR"] .current-summary').html(current_summary);

		// temp
		var current_temp = Math.round(data['currently']['temperature']);
		$('div[data-city="Portland, OR"] .current-temp').html(current_temp);

		// icon
		var current_icon = data['currently']['icon'];
		add_icon_class(current_icon, ".current-icon");

		// precip chance
		var current_precip = data['currently']['precipProbability'] * 100;
		$('div[data-city="Portland, OR"] .current-precip').html(current_precip);


		// ** ALERTS **
		try {
			var alert_description = data['alerts'][0]['description'];
			var alert_expires = data['alerts'][0]['expires'];
			var alert_time = data['alerts'][0]['time'];
			var alert_title = data['alerts'][0]['title'];

			post_alert(alert_title, alert_description);	
		} 
		catch(err) {
			console.log("No current alerts.");
		}
		
		// ** DAILY **
		// Today's max/min temp
		var today_max_temp = Math.round(data['daily']['data'][0]['temperatureMax']);
		var today_min_temp = Math.round(data['daily']['data'][0]['temperatureMin']);
		$('div[data-city="Portland, OR"] .current-temp-wrapper .max-temp').html(today_max_temp);
		$('div[data-city="Portland, OR"] .current-temp-wrapper .min-temp').html(today_min_temp);

		// Sunrise/Sunset
		var sunrise = new Date(data['daily']['data'][0]['sunriseTime'] * 1000),
			sunset = new Date(data['daily']['data'][0]['sunsetTime'] * 1000);
		$('div[data-city="Portland, OR"] .current-temp-wrapper .today-sunrise').html(sunrise.toLocaleTimeString(navigator.language, {timeZone: data['timezone'], hour: '2-digit', minute:'2-digit'}));
		$('div[data-city="Portland, OR"] .current-temp-wrapper .today-sunset').html(sunset.toLocaleTimeString(navigator.language, {timeZone: data['timezone'], hour: '2-digit', minute:'2-digit'}));


		// ** LATER ** 

		// temp
		var later_temp = Math.round(data['hourly']['data'][6]['temperature']);
		$('div[data-city="Portland, OR"] .later-temp').html(later_temp);

		// temp change
		var later_temp_change = later_temp - current_temp;
		if (later_temp_change > 0) {
			later_temp_change = "+" + later_temp_change;
		}
		$('div[data-city="Portland, OR"] .later-temp-change').html(later_temp_change);

		// icon
		var later_icon = data['hourly']['data'][6]['icon'];
		add_icon_class(later_icon, ".later-icon");

		// summary
		var later_status = data['hourly']['data'][6]['summary'];
		$('div[data-city="Portland, OR"] .later-summary').html(later_status);

		// humidity 
		var later_humidity = Math.round(data['hourly']['data'][6]['humidity'] * 100);
		$('div[data-city="Portland, OR"] .later-humidity').html(later_humidity);

		// precip chance
		var later_precip = data['hourly']['data'][6]['precipProbability'] * 100;
		$('div[data-city="Portland, OR"] .later-precip').html(later_precip);


		// ** HOURLY **
		for (var i=0; i < 12; i++) {
			var time = new Date(data['hourly']['data'][i]['time'] * 1000),
				temp = Math.round(data['hourly']['data'][i]['temperature']),
				summary = data['hourly']['data'][i]['summary'],
				icon = data['hourly']['data'][i]['icon'],
				precip = Math.round(data['hourly']['data'][i]['precipProbability'] * 100);

			var hour = time.toLocaleTimeString(navigator.language, {timeZone: data['timezone'], hour: 'numeric'});

			// time
			$('div[data-city="Portland, OR"] .hour' + [i+1] +'-time').html(hour);

			// temp
			$('div[data-city="Portland, OR"] .hour' + [i+1] +'-temp').html(" " + temp);

			// summary
			$('div[data-city="Portland, OR"] .hour' + [i+1] +'-summary').html(summary);

			// icon
			add_icon_class(icon, '.hour' + [i+1] +'-icon');

			// precip
			$('div[data-city="Portland, OR"] .hour' + [i+1] +'-precip').html(" " + precip);
		}


		// ** FORECAST ** 

		for (var i = 1; i < 7; i++) {
			var time = new Date(data['daily']['data'][i]['time'] * 1000),
				temp_min = Math.round(data['daily']['data'][i]['temperatureMin']),
				temp_max = Math.round(data['daily']['data'][i]['temperatureMax']),
				summary = (data['daily']['data'][i]['summary']).slice(0,-1),
				precip = Math.round(data['daily']['data'][i]['precipProbability'] * 100),
				icon = data['daily']['data'][i]['icon'];

			var day = (time.toLocaleTimeString(navigator.language, {timeZone: data['timezone'], weekday:'long'}).slice(0,-12));

			// temp
			$('div[data-city="Portland, OR"] .forecast' + [i] +'-temp-max').html(" " + temp_max);
			$('div[data-city="Portland, OR"] .forecast' + [i] +'-temp-min').html(" " + temp_min);

			// summary
			$('div[data-city="Portland, OR"] .forecast' + [i] +'-summary').html(" " + summary);

			// icon
			add_icon_class(icon, '.forecast' + [i] +'-icon');

			// weekday
			$('div[data-city="Portland, OR"] .forecast' + [i] +'-day').html(" " + day);

			// precip
			$('div[data-city="Portland, OR"] .forecast' + [i] +'-precip').html(" " + precip);	
		}

	}


	function add_icon_class(weather, destination_class) {
		var icon_class;

		switch (weather) {
			case 'clear-day':
				icon_class = "wi-day-sunny";
				break;
			case 'clear-night':
				icon_class = "wi-night-clear";
				break;
			case 'rain':
				icon_class = "wi-rain";
				break;
			case 'snow':
				icon_class = "wi-snow";
				break;
			case 'sleet':
				icon_class = "wi-sleet";
				break;
			case 'wind':
				icon_class = "wi-strong-wind";
				break;
			case 'fog':
				icon_class = "wi-fog";
				break;
			case 'cloudy':
				icon_class = "wi-cloudy";
				break;
			case 'partly-cloudy-day':
				icon_class = "wi-day-cloudy";
				break;
			case 'partly-cloudy-night':
				icon_class = "wi-night-cloudy";
				break;
			default:
				icon_class = "wi-alien";
				break;
		}
		$('div[data-city="Portland, OR"] ' + destination_class).addClass('wi ' + icon_class);
	}


	function post_alert(title, description) {
		$('div[data-city="Portland, OR"] .weather-alert').show();
		$('div[data-city="Portland, OR"] .alert-text').html(title);
	}

	// delays displaying the whole screen to give ajax request some breathing room
	$('div[data-city="Portland, OR"]').delay(800).fadeIn(800);

	// minimize buttons
	$('button.minimize').on('click', function(){
		// traverses out of button, to parent, then to next (panel header --> panel body), then toggles it
		$(this).parent().next().slideToggle(500);

		// changes button text depending on what it currently is
		$(this).html($(this).html() === "Expand" ? "Minimize" : "Expand");
	});

});




