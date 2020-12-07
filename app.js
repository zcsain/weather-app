const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const opencage = require('opencage-api-client');
let status = "hidden";

// For some reson ejs did not evaluate the if statments correctly in main.ejs
// so this is a temporary workaround until i find out whats wrong, brain be mush
let temp = {
  weekday: 0,
  date: 0,
  morning: {
    temp: 0,
    feels: 0
  },
  day: {
    temp: 0,
    feels: 0
  },
  night: {
    temp: 0,
    feels: 0
  },
  weather: {
    description: 0,
    iconUrl: 0
  }
};
let daysList = [temp, temp, temp, temp, temp, temp, temp, temp];

let selector1 = "selected";
let selector2 = "";
let selector3 = "";

// local "module"
const processing = require(__dirname + "/processing.js");

// Setup express app
let app = express();

// Set render engine to ejs
app.set("view engine", "ejs");

// Use body-parser in the app
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

// When root of web app accessed send index.html
app.get("/", function(req, res) {
  // res.sendFile(__dirname + "/index.html");
  res.render("main", {
    containerVis: status,
    daysList: daysList,
    selector1: selector1,
    selector2: selector2,
    selector3: selector3
  });
  // reset visibility marker
  status = "hidden";
  // reset default units
  selector1 = "selected";
  selector2 = "";
  selector3 = "";
})

app.post("/", function(req, res) {

  const city = req.body.cityInput; //address
  const unit = req.body.unitInput;

  // Change default selected unit based on selection
  switch (unit) {
    case "metric":
      selector1 = "selected";
      selector2 = "";
      selector3 = "";
      break;
    case "imperial":
      selector1 = "";
      selector2 = "selected";
      selector3 = "";
      break;
    case "kelvin":
      selector1 = "";
      selector2 = "";
      selector3 = "selected";
      break;
  }

  // API key for Open Weather Api, CATION!!!! DO NOT store API keys like this,
  // this is only for show of concept, store your API key as an environment
  // variable or command line parameter that is set at the time the software is run.
  const apiKey = "your_open_weather_api_key";

  // Opencage geocode, get latitude and longitude from address
  let opencageOutput = opencage.geocode({
    q: city
  }).then(data => {

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
      res.render("fail");

    } else {
      // other possible response codes:
      // https://opencagedata.com/api#codes
      console.log('error', data.status.message);
      res.render("fail");
    }
  }).catch(error => {
    console.log('error', error.message);
    res.render("fail");
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

        // Set content-container visibility after request was sent
        status = "show";

        daysList = processing.extractDays(weatherData);
        // console.log(daysList);

        if (daysList.length !== 8) {
          res.render("fail");
        } else {
          res.redirect("/");
        }
      })

    })

  });

})

// Listens for changes on whatever port is assigned to by heroku, or port 3000
// for local testing
app.listen(process.env.PORT || 3000, function() {
  console.log("Server is up and running on port: " + 3000);
})
