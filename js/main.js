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
		current_temp = Math.round(data['currently']['temperature']);
		current_status = data['currently']['summary'];
		current_icon = data['currently']['icon'];
		unix_time = data['currently']['time'];
		
		// humidity
		current_humidity = data['currently']['humidity'] * 100;
		$('div[data-city="Portland, OR"] .current-humidity').html(current_humidity);

		// summary
		current_summary = data['currently']['summary'];
		$('div[data-city="Portland, OR"] .current-summary').html(current_summary);

		// current temp
		$('div[data-city="Portland, OR"] .current-temp').html(current_temp);
		add_icon_class(current_icon);


		// ** ALERTS **
		try {
			alert_description = data['alerts'][0]['description'];
			alert_expires = data['alerts'][0]['expires'];
			alert_time = data['alerts'][0]['time'];
			alert_title = data['alerts'][0]['title'];

			post_alert(alert_title, alert_description);	
		} 
		catch(err) {
			console.log(err.message);
		}
		
		// ** DAILY **
		// Today's max/min temp
		today_max_temp = Math.round(data['daily']['data'][0]['temperatureMax']);
		today_min_temp = Math.round(data['daily']['data'][0]['temperatureMin']);
		$('div[data-city="Portland, OR"] .current-temp-wrapper .max-temp').html(today_max_temp);
		$('div[data-city="Portland, OR"] .current-temp-wrapper .min-temp').html(today_min_temp);

		// Sunrise/Sunset
		var sunrise = new Date(data['daily']['data'][0]['sunriseTime'] * 1000),
			sunset = new Date(data['daily']['data'][0]['sunsetTime'] * 1000);
		$('div[data-city="Portland, OR"] .current-temp-wrapper .today-sunrise').html(sunrise.toLocaleTimeString(navigator.language, {timeZone: data['timezone'], hour: '2-digit', minute:'2-digit'}));
		$('div[data-city="Portland, OR"] .current-temp-wrapper .today-sunset').html(sunset.toLocaleTimeString(navigator.language, {timeZone: data['timezone'], hour: '2-digit', minute:'2-digit'}));


		// ** HOURLY **

		// info about converting UNIX time: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
		var date = new Date(unix_time*1000);
		var date_display = date.getDate();
		var day = date.getDay();
		var month = date.getMonth();
		var year = date.getFullYear();
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var seconds = date.getSeconds();
		console.log(date.toDateString() + " at " + date.toLocaleTimeString());

	}

	function add_icon_class(weather) {
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
		$('div[data-city="Portland, OR"] .current-icon').addClass('wi ' + icon_class);
	}

	function post_alert(title, description) {
		$('div[data-city="Portland, OR"] .weather-alert').show();
		$('div[data-city="Portland, OR"] .alert-text').html(title);
	}

	$('div[data-city="Portland, OR"]').delay(800).fadeIn(800);

});