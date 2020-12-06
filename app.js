const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const opencage = require('opencage-api-client');
let coords = [];

// local "module"
const processing = require(__dirname + "/processing.js");

function geoFromAdr(address) {

  // Opencage geocode
  opencage.geocode({
    q: address
  }).then(data => {
    // console.log(JSON.stringify(data));
    if (data.status.code == 200) {

      if (data.results.length > 0) {

        var place = data.results[0];
        console.log("This is inside:", place.geometry);

        return place.geometry;
      }

    } else if (data.status.code == 402) {
      console.log('hit free trial daily limit');
      console.log('become a customer: https://opencagedata.com/pricing');

    } else {
      // other possible response codes:
      // https://opencagedata.com/api#codes
      console.log('error', data.status.message);
    }

  }).catch(error => {
    console.log('error', error.message);
  });
}

let app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

// When root of web app accessed send index.html
app.get("/", function(req, res) {
  // res.sendFile(__dirname + "/index.html");
  res.render("main");
})

app.post("/", function(req, res) {

  const city = req.body.cityInput; //address
  const unit = req.body.unitInput;

  // API key for Open Weather Api, CATION!!!! DO NOT store API keys like this,
  // this is only for show of concept, store your API key as an environment
  // variable or command line parameter that is set at the time the software is run.
  const apiKey = "your_open_weather_api_key";

  // Opencage geocode, get latitude and longitude from address
  let opencageOutput = opencage.geocode({q: 'Zagreb'}).then(data => {

    // On successful response
    if (data.status.code == 200) {

      // More than one answer is given, take the most relevant (first one)
      if (data.results.length > 0) {

        var place = data.results[0];

        // Return latitude and longitude
        return place.geometry;
      }

      // Reached FREE Account request limit
    } else if (data.status.code == 402) {
      console.log('hit free trial daily limit');
      console.log('become a customer: https://opencagedata.com/pricing');

    } else {
      // other possible response codes:
      // https://opencagedata.com/api#codes
      console.log('error', data.status.message);
    }
  }).catch(error => {
    console.log('error', error.message);
  });

// Open Weather, get daily weather data from latitude and longitude
opencageOutput.then(function(result) {

      const lat = result.lat;
      const lon = result.lng;

      // Open Weather API url
      const urlWeather = `https://api.openweathermap.org/data/2.5/onecall?appid=${apiKey}&exclude=minutely,hourly,alerts,current&units=${unit}&lat=${lat}&lon=${lon}`;

      // Open Weather API call with API key and dynamic unit, lat, lon parameters
      https.get(urlWeather, function(response) {

        response.on("data", function(dataOpenWeather) {

          const weatherData = JSON.parse(dataOpenWeather);

          res.render("test", {
            testVar: weatherData.daily[0]
          });

          console.log(weatherData.daily[0]);
        })

      })

  });

})

// Listens for changes on whatever port is assigned to by heroku, or port 3000
// for local testing
app.listen(process.env.PORT || 3000, function() {
  console.log("Server is up and running on port: " + 3000);
})
