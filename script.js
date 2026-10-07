// ==========================================
// WEATHER APP
// ==========================================

// API endpoints
const GEOCODING_API =
    "https://geocoding-api.open-meteo.com/v1/search";

const WEATHER_API =
    "https://api.open-meteo.com/v1/forecast";

// State
let currentUnit = "C";

let currentWeatherData = null;

let currentLocation = null;


// ==========================================
// DOM ELEMENTS
// ==========================================

const cityInput = document.getElementById("cityInput");

const searchBtn = document.getElementById("searchBtn");

const locationBtn = document.getElementById("locationBtn");

const unitToggle = document.getElementById("unitToggle");

const weatherContainer =
    document.getElementById("weatherContainer");

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("errorMessage");

const cityName =
    document.getElementById("cityName");

const country =
    document.getElementById("country");

const dateTime =
    document.getElementById("dateTime");

const weatherIcon =
    document.getElementById("weatherIcon");

const temperature =
    document.getElementById("temperature");

const feelsLike =
    document.getElementById("feelsLike");

const weatherDescription =
    document.getElementById("weatherDescription");

const humidity =
    document.getElementById("humidity");

const windSpeed =
    document.getElementById("windSpeed");

const pressure =
    document.getElementById("pressure");

const cloudCover =
    document.getElementById("cloudCover");

const sunrise =
    document.getElementById("sunrise");

const sunset =
    document.getElementById("sunset");

const forecast =
    document.getElementById("forecast");

const recentSearches =
    document.getElementById("recentSearches");

const clearHistory =
    document.getElementById("clearHistory");


// ==========================================
// WEATHER CODE INFORMATION
// ==========================================

function getWeatherInfo(code) {

    const weatherCodes = {

        0: {
            description: "Clear Sky",
            icon: "☀️",
            type: "clear"
        },

        1: {
            description: "Mainly Clear",
            icon: "🌤️",
            type: "clear"
        },

        2: {
            description: "Partly Cloudy",
            icon: "⛅",
            type: "cloudy"
        },

        3: {
            description: "Overcast",
            icon: "☁️",
            type: "cloudy"
        },

        45: {
            description: "Foggy",
            icon: "🌫️",
            type: "cloudy"
        },

        48: {
            description: "Rime Fog",
            icon: "🌫️",
            type: "cloudy"
        },

        51: {
            description: "Light Drizzle",
            icon: "🌦️",
            type: "rain"
        },

        53: {
            description: "Drizzle",
            icon: "🌦️",
            type: "rain"
        },

        55: {
            description: "Heavy Drizzle",
            icon: "🌧️",
            type: "rain"
        },

        61: {
            description: "Light Rain",
            icon: "🌦️",
            type: "rain"
        },

        63: {
            description: "Moderate Rain",
            icon: "🌧️",
            type: "rain"
        },

        65: {
            description: "Heavy Rain",
            icon: "🌧️",
            type: "rain"
        },

        71: {
            description: "Light Snow",
            icon: "🌨️",
            type: "snow"
        },

        73: {
            description: "Moderate Snow",
            icon: "❄️",
            type: "snow"
        },

        75: {
            description: "Heavy Snow",
            icon: "❄️",
            type: "snow"
        },

        80: {
            description: "Rain Showers",
            icon: "🌦️",
            type: "rain"
        },

        81: {
            description: "Heavy Rain Showers",
            icon: "🌧️",
            type: "rain"
        },

        82: {
            description: "Violent Rain Showers",
            icon: "⛈️",
            type: "rain"
        },

        95: {
            description: "Thunderstorm",
            icon: "⛈️",
            type: "rain"
        },

        96: {
            description: "Thunderstorm + Hail",
            icon: "⛈️",
            type: "rain"
        },

        99: {
            description: "Heavy Thunderstorm",
            icon: "⛈️",
            type: "rain"
        }

    };

    return weatherCodes[code] || {
        description: "Unknown",
        icon: "🌍",
        type: "clear"
    };
}


// ==========================================
// SEARCH CITY
// ==========================================

async function searchCity(city) {

    if (!city.trim()) {

        showError("Please enter a city name.");

        return;
    }

    showLoading();

    try {

        const url =
            `${GEOCODING_API}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Unable to search city.");
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {

            throw new Error(
                "City not found. Please check the spelling."
            );
        }

        const location = data.results[0];

        await getWeather(
            location.latitude,
            location.longitude,
            location.name,
            location.country,
            location.timezone
        );

        saveRecentSearch(location.name);

    } catch (error) {

        showError(error.message);

        hideLoading();
    }
}


// ==========================================
// GET WEATHER
// ==========================================

async function getWeather(
    latitude,
    longitude,
    name,
    countryName,
    timezone
) {

    showLoading();

    try {

        const url =
            `${WEATHER_API}?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,pressure_msl,wind_speed_10m,is_day` +
            `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset` +
            `&timezone=auto` +
            `&forecast_days=5`;

        const response = await fetch(url);

        if (!response.ok) {

            throw new Error(
                "Unable to get weather information."
            );
        }

        const data = await response.json();

        currentWeatherData = {
            data,
            latitude,
            longitude,
            name,
            countryName,
            timezone
        };

        currentLocation = {
            latitude,
            longitude,
            name,
            countryName,
            timezone
        };

        displayWeather();

    } catch (error) {

        showError(error.message);

    } finally {

        hideLoading();

    }
}


// ==========================================
// DISPLAY WEATHER
// ==========================================

function displayWeather() {

    if (!currentWeatherData) return;

    const {
        data,
        name,
        countryName
    } = currentWeatherData;

    const current = data.current;

    const info = getWeatherInfo(
        current.weather_code
    );

    // Location
    cityName.textContent = name;

    country.textContent = countryName;

    // Weather
    weatherIcon.textContent = info.icon;

    weatherDescription.textContent =
        info.description;

    // Temperature
    temperature.textContent =
        convertTemperature(
            current.temperature_2m
        );

    feelsLike.textContent =
        convertTemperature(
            current.apparent_temperature
        );

    // Details
    humidity.textContent =
        current.relative_humidity_2m;

    windSpeed.textContent =
        Math.round(current.wind_speed_10m);

    pressure.textContent =
        Math.round(current.pressure_msl);

    cloudCover.textContent =
        current.cloud_cover;

    // Sunrise / Sunset
    sunrise.textContent =
        formatTime(
            data.daily.sunrise[0]
        );

    sunset.textContent =
        formatTime(
            data.daily.sunset[0]
        );

    // Date
    dateTime.textContent =
        formatDate(
            current.time
        );

    // Forecast
    displayForecast(data.daily);

    // Background
    changeBackground(
        info.type,
        current.is_day
    );

    // Show app
    weatherContainer.classList.add("show");

    errorMessage.classList.remove("show");
}


// ==========================================
// FORECAST
// ==========================================

function displayForecast(daily) {

    forecast.innerHTML = "";

    for (let i = 0; i < daily.time.length; i++) {

        const code =
            daily.weather_code[i];

        const info =
            getWeatherInfo(code);

        const max =
            convertTemperature(
                daily.temperature_2m_max[i]
            );

        const min =
            convertTemperature(
                daily.temperature_2m_min[i]
            );

        const day =
            formatDay(
                daily.time[i]
            );

        const card =
            document.createElement("div");

        card.className =
            "forecast-card";

        card.innerHTML = `
            <div class="forecast-day">
                ${day}
            </div>

            <div class="forecast-icon">
                ${info.icon}
            </div>

            <div class="forecast-temp">
                ${max}°
            </div>

            <div class="forecast-min">
                ${min}°
            </div>

            <div class="forecast-description">
                ${info.description}
            </div>
        `;

        forecast.appendChild(card);
    }
}


// ==========================================
// TEMPERATURE CONVERSION
// ==========================================

function convertTemperature(celsius) {

    if (currentUnit === "C") {

        return Math.round(celsius);

    }

    return Math.round(
        (celsius * 9 / 5) + 32
    );
}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(dateString) {

    const date =
        new Date(dateString);

    return date.toLocaleString(
        "en-US",
        {
            weekday: "long",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );
}


// ==========================================
// FORMAT DAY
// ==========================================

function formatDay(dateString) {

    const date =
        new Date(dateString + "T12:00:00");

    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "short"
        }
    );
}


// ==========================================
// FORMAT TIME
// ==========================================

function formatTime(dateString) {

    const date =
        new Date(dateString);

    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );
}


// ==========================================
// BACKGROUND
// ==========================================

function changeBackground(type, isDay) {

    document.body.classList.remove(
        "rainy",
        "night"
    );

    if (!isDay) {

        document.body.classList.add("night");

        return;
    }

    if (type === "rain") {

        document.body.classList.add("rainy");
    }
}


// ==========================================
// GEOLOCATION
// ==========================================

function getCurrentLocation() {

    if (!navigator.geolocation) {

        showError(
            "Geolocation is not supported by your browser."
        );

        return;
    }

    showLoading();

    navigator.geolocation.getCurrentPosition(
        async (position) => {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            try {

                // Reverse geocoding
                const url =
                    `${GEOCODING_API}?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`;

                const response =
                    await fetch(url);

                const data =
                    await response.json();

                const location =
                    data.results?.[0];

                const name =
                    location?.name ||
                    "Your Location";

                const countryName =
                    location?.country ||
                    "";

                await getWeather(
                    latitude,
                    longitude,
                    name,
                    countryName,
                    "auto"
                );

                saveRecentSearch(name);

            } catch (error) {

                showError(
                    "Unable to determine your location."
                );

                hideLoading();
            }
        },

        () => {

            showError(
                "Location permission was denied. Please search for a city instead."
            );

            hideLoading();
        }
    );
}


// ==========================================
// RECENT SEARCHES
// ==========================================

function saveRecentSearch(city) {

    let searches =
        JSON.parse(
            localStorage.getItem(
                "weatherSearches"
            )
        ) || [];

    searches =
        searches.filter(
            item =>
                item.toLowerCase() !==
                city.toLowerCase()
        );

    searches.unshift(city);

    searches =
        searches.slice(0, 6);

    localStorage.setItem(
        "weatherSearches",
        JSON.stringify(searches)
    );

    displayRecentSearches();
}


function displayRecentSearches() {

    const searches =
        JSON.parse(
            localStorage.getItem(
                "weatherSearches"
            )
        ) || [];

    recentSearches.innerHTML = "";

    if (searches.length === 0) {

        recentSearches.innerHTML =
            "<p>No recent searches.</p>";

        return;
    }

    searches.forEach(city => {

        const button =
            document.createElement("button");

        button.className =
            "recent-city";

        button.textContent =
            city;

        button.addEventListener(
            "click",
            () => {

                cityInput.value = city;

                searchCity(city);
            }
        );

        recentSearches.appendChild(button);

    });
}


// ==========================================
// CLEAR SEARCH HISTORY
// ==========================================

clearHistory.addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            "weatherSearches"
        );

        displayRecentSearches();
    }
);


// ==========================================
// UNIT TOGGLE
// ==========================================

unitToggle.addEventListener(
    "click",
    () => {

        currentUnit =
            currentUnit === "C"
                ? "F"
                : "C";

        unitToggle.textContent =
            `°${currentUnit}`;

        if (currentWeatherData) {

            displayWeather();
        }
    }
);


// ==========================================
// SEARCH EVENTS
// ==========================================

searchBtn.addEventListener(
    "click",
    () => {

        searchCity(
            cityInput.value
        );
    }
);


cityInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            searchCity(
                cityInput.value
            );
        }
    }
);


// ==========================================
// LOCATION EVENT
// ==========================================

locationBtn.addEventListener(
    "click",
    getCurrentLocation
);


// ==========================================
// UI HELPERS
// ==========================================

function showLoading() {

    loading.classList.add("show");

    weatherContainer.classList.remove(
        "show"
    );

    errorMessage.classList.remove(
        "show"
    );
}


function hideLoading() {

    loading.classList.remove(
        "show"
    );
}


function showError(message) {

    errorMessage.textContent =
        message;

    errorMessage.classList.add(
        "show"
    );

    weatherContainer.classList.remove(
        "show"
    );
}


// ==========================================
// INITIALIZATION
// ==========================================

displayRecentSearches();


// Load Chennai as default
searchCity("Chennai");
