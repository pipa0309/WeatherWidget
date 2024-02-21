const KEY = "bc3e903e7afa4f1b69bd8cfa7a6e8bb2";

let sity = "";
let temperature = 0;
let iconWeather = "";
let descriptionWeather = 0;

getData();

function getData() {
  navigator.geolocation.getCurrentPosition((success) => {
    const { latitude, longitude } = success.coords;

    let apiUrl = `
    https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&exclude=minutly&appid=${KEY}
        `;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        const { name, main, weather } = data;

        weather.filter((element) => {
          iconWeather = element.icon;
          descriptionWeather = element.id;
        });

        renderDataToFront(name, main, iconWeather, descriptionWeather);
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  });
}

renderDataToFront = (name, main, iconWeather, descriptionWeather) => {
  sity = name;
  temperature = Math.trunc(main.temp - 273.15);

  document.getElementById("temperature").innerHTML =
    temperature + "<sup>o</sup>C";
  document.getElementById("sity-label").innerHTML = sity;

  let urlIcon = `https://openweathermap.org/img/wn/${iconWeather}@2x.png`;
  document.getElementById("icon-weather").setAttribute("src", urlIcon);

  generateRecomendateByConditions(
    descriptionWeather,
    getDescriptionByTemperature,
    temperature
  );
};

generateRecomendateByConditions = (
  descriptionWeather,
  getDescriptionByTemperature,
  temperature
) => {
  switch (descriptionWeather) {
    case descriptionWeather >= 200 && descriptionWeather < 300:
      document.getElementById("description").innerHTML =
        "Начинается гроза!" +
        "<br>" +
        "<br>" +
        getDescriptionByTemperature(temperature);
      break;
    case descriptionWeather >= 300 && descriptionWeather < 400:
      document.getElementById("description").innerHTML =
        "Морось. И этим все сказано!" +
        "<br>" +
        "<br>" +
        getDescriptionByTemperature(temperature);
      break;
    case descriptionWeather >= 500 && descriptionWeather < 600:
      document.getElementById("description").innerHTML =
        "Либо скоро пойдет дождь, либо уже!" +
        "<br>" +
        "<br>" +
        getDescriptionByTemperature(temperature);
      break;
    case descriptionWeather >= 600 && descriptionWeather < 700:
      document.getElementById("description").innerHTML =
        "Либо скоро пойдет снег, либо уже!" +
        "<br>" +
        "<br>" +
        getDescriptionByTemperature(temperature);
      break;
    case descriptionWeather >= 700 && descriptionWeather < 800:
      document.getElementById("description").innerHTML =
        "Атмосферные явления не исключены!" +
        "<br>" +
        "<br>" +
        getDescriptionByTemperature(temperature);
      break;
    default:
      document.getElementById("description").innerHTML =
        "Чистое небо над головой!" +
        "<br>" +
        "<br>" +
        getDescriptionByTemperature(temperature);
      break;
  }
};

getDescriptionByTemperature = (temperature) => {
  if (temperature <= -10) {
    return "Мороз. Наденьте перчатки!";
  } else if (temperature > -10 && temperature <= 0) {
    return "Холодно, но не мороз.";
  } else if (temperature > 0 && temperature < 10) {
    return "Прохладно.";
  } else {
    return "Жара. Намажтесь кремом.";
  }
};
