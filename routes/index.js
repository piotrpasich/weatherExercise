var express = require("express");
var router = express.Router();
var request = require("request");
var moment = require('moment');

var apiKey = 'a74289eb1383fa0e57264af1b7f50051';

router.get("/", function (req, res) {
    res.render("index", {
        weather: null,
        city: null,
        country: null,
        currTemp: null,
        tempLow: null,
        tempHigh: null,
        currWeather: null,
        currWind: null,
        currHumid: null,
        windShort: null,
        currPressure: null,
        currCloud: null,
        currCompass: null,
        currDegree: null,
        visibility: null,
        icon: null,
        code: null,
        time: null,
        sunrise: null,
        sunset: null,
        forecast: [],
    });
});

router.post("/", function (req, res) {
    var city = req.body.city;
    var url = 'http://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + apiKey + '&units=metric';
    console.log(url)
    request(url, function (err, response, body) {
        if (err) {
            console.log(err);
            res.render("index", {weather: null, error: 'Error, please try again'});
        } else {
            var weather = JSON.parse(body);
            var currWeather = [];

            currWeather['currCity'] = weather.name;
            currWeather['currCountry'] = weather.sys.country;
            currWeather['currTime'] = weather.dt;
            currWeather['currTime'] = moment.unix(currWeather['currTime']).format("DD-MM-YYYY HH:mm:ss");
            currWeather['sunrise'] = weather.sys.sunrise;
            currWeather['sunrise'] = moment.unix(currWeather['sunrise']).format("HH:mm:ss");
            currWeather['sunset'] = weather.sys.sunset;
            currWeather['sunset'] = moment.unix(currWeather['sunset']).format("HH:mm:ss");
            currWeather['currTemp'] = Math.round(weather.main.temp);
            currWeather['description'] = weather.weather[0].description;
            currWeather['highTemp'] = Math.round(weather.main.temp_max);
            currWeather['lowTemp'] = Math.round(weather.main.temp_min);
            currWeather['humidity'] = Math.round(weather.main.humidity);
            currWeather['visibility'] = weather.visibility;
            currWeather['pressure'] = weather.main.pressure * 0.02961339710085;
            currWeather['pressure'] = currWeather['pressure'].toFixed(2);
            currWeather['icon'] = "http://openweathermap.org/img/w/" + weather.weather[0].icon + ".png";
            currWeather['code'] = weather.weather[0].id;
            currWeather['cloudiness'] = weather.clouds.all;
            currWeather['windSpeed'] = Math.round(weather.wind.speed);
            currWeather['windDegree'] = weather.wind.deg;
            currWeather['windCompass'] = Math.round((currWeather['windDegree'] - 11.25) / 22.5);

            // array of direction (compass) names
            var windNames = new Array("North", "North Northeast", "Northeast", "East Northeast", "East", "East Southeast",
                "Southeast", "South Southeast", "South", "South Southwest", "Southwest",
                "West Southwest", "West", "West Northwest", "Northwest", "North Northwest");
            // array of abbreviated (compass) names
            var windShortNames = new Array("N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW");
            // convert degrees and find wind direction name
            currWeather['windDirection'] = windNames[currWeather['windCompass']];

            // current temperature
            var response = "Current Weather: " + currWeather['currTemp'] + "\xB0 and " + currWeather['description'];
            if (currWeather['windSpeed'] > 0) {// if there's wind, add a wind description to the response
                response = response + " with winds out of the " + windShortNames[currWeather['windCompass']] + " at " + currWeather['windSpeed'] + " miles per hour";
            }

            var forecast = [];
            var url = 'http://api.openweathermap.org/data/2.5/forecast/daily?q=' + city + '&appid=' + apiKey + '&units=metric';
            request(url, function (err, response, body) {
                if (err) {
                    console.log(err);
                    res.render("index", {weather: null, error: 'Error, please try again'});
                } else {
                    var forecastResponse = JSON.parse(body)
                    console.log(forecastResponse.list)
                    forecast = forecastResponse.list.map(item => ({
                        speed: item.speed,
                        deg: item.deg,
                        clouds: item.clouds,
                        humidity: item.humidity,
                        pressure: item.pressure,
                        tempDay: item.temp.day,
                        tempMin: item.temp.min,
                        tempMax: item.temp.max,
                        pop: item.pop || 0,
                        dt: moment.unix(item.dt).format("DD-MM-YYYY"),
                        snow: item.snow || 0,
                    }))
                    console.log(forecast)
                }

                res.render("index", {
                    weather: response,
                    city: currWeather['currCity'],
                    country: currWeather['currCountry'],
                    currTemp: currWeather['currTemp'] + "\xB0",
                    tempLow: currWeather['lowTemp'] + "\xB0",
                    tempHigh: currWeather['highTemp'] + "\xB0",
                    currWeather: currWeather['description'],
                    currWind: currWeather['windSpeed'],
                    currHumid: currWeather['humidity'],
                    windShort: windShortNames[currWeather['windCompass']],
                    currPressure: currWeather['pressure'],
                    currCloud: currWeather['cloudiness'],
                    currCompass: currWeather['windCompass'],
                    currDegree: currWeather['windDegree'],
                    visibility: currWeather['visibility'],
                    icon: currWeather['icon'],
                    time: currWeather['currTime'],
                    code: currWeather['code'],
                    sunrise: currWeather['sunrise'],
                    sunset: currWeather['sunset'],
                    forecast
                });
            })
        }
    });
});
module.exports = router;
