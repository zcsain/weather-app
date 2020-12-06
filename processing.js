// THIS IS THE WAY
module.exports = {
  processData: processData
};

function processData(data) {

  return getDate(data);
}

function getWeekday(timestamp) {

  // Date string options
  const options = {
    weekday: "long"
  };

  // Transforms to miliseconds
  const date = new Date(timestamp * 1000);

  // Extracts/returns weekday from timestamp
  return date.toLocaleDateString("en-de", options);
}

function getDate(timestamp) {

  const options = {
    day: "numeric",
    month: "short"
  };

  const date = new Date(timestamp * 1000);

  return date.toLocaleDateString("en-de", options);
}

function extractDays(data) {

  /**
   * Takes in a JSON object with weather data for the selected city and extracts
   * the relevant weather data for "Morning" "Noon" and "Afternoon" and the
   * timestamp for each of the five days present in the JSON object.
   *
   * Returns object with weather data for each day.
   *
   * @param {JSON} data - JSON object
   */



}

function parseDMS(input) {

  // Takes in DMS formated latitude/longitude and splits it to degrees, minutes,
  // seconds, direction.

  const parts = input.split(/[^\d\w.]+/);

  const degrees = parseFloat(parts[0]);
  const minutes = parseFloat(parts[1]);
  const seconds = parseFloat(parts[2]);
  const direction = parts[3];

  return [degrees, minutes, seconds, direction];
}

function dmsToDD(input) {

  // Takes in degrees, minutes, seconds, direction from atitude/longitude append
  // transforms it to DD format.

  let [degrees, minutes, seconds, direction] = parseDMS(input);

  let dd = degrees + minutes / 60 + seconds / (60 * 60);

  if (direction == "S" || direction == "W") {
    dd = dd * -1;
  } // Don't do anything for N or E

  // Rounds number to 4 decimals, "+" removes any trailing zero
  dd = +dd.toFixed(4);

  return dd;
}
