$(document).ready(function(){

	$.ajax({

		// The 'type' property sets the HTTP method.
		// A value of 'PUT' or 'DELETE' will trigger a preflight request.
		type: 'GET',

		dataType: 'jsonp',

		// The URL to make the request to.
		url: "https://api.forecast.io/forecast/e27ae1f9f8be2c73c1648f94f81cf04a/45.513334,-122.653049",
		// url: "https://api.forecast.io/forecast/e27ae1f9f8be2c73c1648f94f81cf04a/43.0469,-76.1444",
		// url: "https://api.forecast.io/forecast/e27ae1f9f8be2c73c1648f94f81cf04a/40.4,-3.6833",

		success: function(data) {
		// Here's where you handle a successful response.
			format_data(data);
		},

		error: function() {
			console.log("AJAX request failed.");
		}
	});

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

		// ** HOURLY **
		for (var i=1; i < 3; i++) {
			var time = new Date(data['hourly']['data'][i]['time'] * 1000),
				temp = Math.round(data['hourly']['data'][i]['temperature']),
				summary = data['hourly']['data'][i]['summary'],
				icon = data['hourly']['data'][i]['icon'],
				precip = Math.round(data['hourly']['data'][i]['precipProbability'] * 100);

			var hour = time.getHours();
			var hour_suffix = hour >= 12 ? "pm" : "am";
			hour = ((hour + 11) % 12);
			console.log(hour + hour_suffix);

			console.log(icon);

			// time
			$('div[data-city="Portland, OR"] .hour' + [i] +'-time').html(hour + hour_suffix);

			// temp
			$('div[data-city="Portland, OR"] .hour' + [i] +'-temp').html(" " + temp);

			// summary
			$('div[data-city="Portland, OR"] .hour' + [i] +'-summary').html(summary);

			// icon
			add_icon_class(icon, '.hour' + [i] +'-icon1');

			// precip
			$('div[data-city="Portland, OR"] .hour' + [i] +'-precip').html(" " + precip);
		}



		// info about converting UNIX time: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
		var date = new Date(unix_time*1000);
		var date_display = date.getDate();
		var day = date.getDay();
		var month = date.getMonth();
		var year = date.getFullYear();
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var seconds = date.getSeconds();
	}

	function add_icon_class(weather, destination_class) {
		var icon_class;

		switch (weather) {
			case 'clear-day':
				icon_class = "wi-day-sunny";
				break;
			case 'clear-night':
				icon_class = "wi-stars";
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

	$('div[data-city="Portland, OR"]').delay(800).fadeIn(800);

});