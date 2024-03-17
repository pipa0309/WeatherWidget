(function (key, dataDescriptionFromId, dataDescriptionFromTemperature, host) {
  const DIFF_BETWEEN_CELS_AND_FAR = 273.15;

  function getDataFetchTransformedToJSON(pointApi) {
    return fetch(pointApi).then((response) => response.json());
  }

  function getPosition() {
    return new Promise((resolve, reject) => {
      if (navigator) {
        navigator.geolocation.getCurrentPosition((success) => {
          const { latitude, longitude } = success.coords;
          resolve({ latitude, longitude });
        });
      } else {
        reject(`Please provide navigator`);
      }
    });
  }

  function weatherDataAdapter(name, main, weather) {
    return {
      city: name,
      temperature: convertFarToCels(main.temp, DIFF_BETWEEN_CELS_AND_FAR),
      data: weather.map(({ icon, id }) => {
        return {
          iconUrl: getIconURLByID(icon),
          value: id,
        };
      }),
    };
  }

  function getWeatherData(latitude, longitude, key) {
    let apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&exclude=minutly&appid=${key}`;
    return new Promise((resolve, reject) => {
      if (latitude && longitude && key) {
        getDataFetchTransformedToJSON(apiUrl)
          .then((data) => {
            resolve(weatherDataAdapter(data.name, data.main, data.weather));
          })
          .catch(() => {
            reject(`Err: Please provide correct api`);
          });
      } else {
        reject(`Err: Please provide latitude && longitude && key`);
      }
    });
  }

  function getRecomendationData(pointApi) {
    return getDataFetchTransformedToJSON(pointApi);
  }

  function getTemperatureDescriptionsData(pointApi) {
    return getDataFetchTransformedToJSON(pointApi);
  }

  function displayer(selector, value) {
    const containers = document.querySelectorAll(selector);
    if (containers && containers.length > 0) {
      containers.forEach((container) => {
        container.innerHTML = value;
      });
    }
  }

  function createDataSelector(selector) {
    return `[data-container-id="${selector}"]`;
  }

  function getIconURLByID(iconId) {
    return `${host}/img/wn/${iconId}@2x.png`;
  }

  function convertFarToCels(temperatureInFar, diff) {
    return Math.trunc(temperatureInFar - diff);
  }

  function getTemperatureLabelMarkup(temperature) {
    return `<span>${temperature}</span><span><sup>o</sup>C</span>`;
  }

  function generateMarkupForDecription(
    selector,
    iconUrl,
    recomendationByCondition,
    recomentationByRTemperature
  ) {
    const nodeList = document.querySelectorAll(selector);
    const containers = [...nodeList];

    function getTagR(containers) {
      containers.forEach((node) => {
        if (node.getAttribute("id") !== null) {
          // console.log(node.getAttribute("id"));
          if (node.getAttribute("id") === "icon") {
            node.setAttribute("src", iconUrl);
          }
          if (node.getAttribute("id") === "decriptId") {
            node.innerHTML = recomendationByCondition;
          }
          if (node.getAttribute("id") === "decriptTemperature") {
            node.innerHTML = recomentationByRTemperature;
          }
        }

        if (node.children) {
          let newContainers = [...node.children];
          getTagR(newContainers);
        }
      });
    }
    getTagR(containers);
  }

  function getRecomendationMarkup(
    iconUrl,
    recomendationByCondition,
    recomentationByRTemperature
  ) {
    return generateMarkupForDecription(
      ".recomendation-description",
      iconUrl,
      recomendationByCondition,
      recomentationByRTemperature
    );
  }

  function getDataFromDiapazone(value, list) {
    const currentDiapazon = list.find(({ min, max }) => {
      return (
        value > (min !== null ? min : -Infinity) &&
        value <= (max !== null ? max : Infinity)
      );
    });

    return currentDiapazon ? currentDiapazon : null;
  }

  function getDescription(payload) {
    return payload?.description ? payload?.description : "Not Found";
  }

  function removeLoader(selector) {
    const loaderRef = document.querySelector(selector);
    if (loaderRef) {
      loaderRef.style.opacity = "0";
    }
  }

  function getWeatherDataQ() {
    return getPosition().then(({ latitude, longitude }) => {
      return getWeatherData(latitude, longitude, key);
    });
  }

  Promise.all([
    getRecomendationData(dataDescriptionFromId),
    getTemperatureDescriptionsData(dataDescriptionFromTemperature),
    getWeatherDataQ(),
  ])
    .then(([recomendations, temperatureRecomendations, weatherData]) => {
      return {
        weatherData,
        recomendations,
        temperatureRecomendations,
      };
    })
    .then(({ weatherData, recomendations, temperatureRecomendations }) => {
      const { city, temperature, data } = weatherData;

      displayer(createDataSelector("city"), city);

      displayer(
        createDataSelector("temperature"),
        getTemperatureLabelMarkup(temperature)
      );

      const recomendationsMarkupList = data
        .map(({ iconUrl, value }) => {
          return {
            iconUrl,
            recomendationDescription: getDescription(
              getDataFromDiapazone(value, recomendations)
            ),
            temperatureRecomendationsDescription: getDescription(
              getDataFromDiapazone(temperature, temperatureRecomendations)
            ),
          };
        })
        .map(
          ({
            iconUrl,
            recomendationDescription,
            temperatureRecomendationsDescription,
          }) => {
            return getRecomendationMarkup(
              iconUrl,
              recomendationDescription,
              temperatureRecomendationsDescription
            );
          }
        );

      displayer(
        createDataSelector("recomendations"),
        recomendationsMarkupList.join(" ")
      );
    })
    .catch((err) => {
      displayer(createDataSelector("error-container"), err);
    })
    .finally(() => {
      removeLoader(createDataSelector("loader"));
    });
})(
  "bc3e903e7afa4f1b69bd8cfa7a6e8bb2",
  "../mock_data/descriptions.json",
  "../mock_data/temperature_descriptions.json",
  "https://openweathermap.org"
);
