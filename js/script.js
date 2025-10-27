document.addEventListener('DOMContentLoaded', () => {
    // DOM Element References
    const searchInput = document.getElementById('searchInput');
    const suggestionsList = document.getElementById('suggestionsList');
    const weatherContainer = document.getElementById('weatherContainer');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const loader = document.getElementById('loader');
    const errorContainer = document.getElementById('error');
    
    // --- UI Update Functions ---

    const updateCurrentWeather = (data, cityName) => {
        const { description, icon } = getWeatherInfo(data.current.weatherCode, data.current.isDay);
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        
        document.getElementById('currentWeather').innerHTML = `
            <h2>${cityName}</h2>
            <p class="date">${today}</p>
            <div class="main-info">
                <span class="icon">${icon}</span>
                <h1 class="temp">${data.current.temperature}<sup>°C</sup></h1>
            </div>
            <p class="description">${description}</p>
        `;
    };
    
    const updateWeatherDetails = (data) => {
        document.getElementById('weatherDetails').innerHTML = `
            <div class="detail-item">
                <span>💨 Wind Speed</span>
                <p>${data.current.windSpeed} km/h</p>
            </div>
            <div class="detail-item">
                <span>💧 Humidity</span>
                <p>${data.current.humidity}%</p>
            </div>
        `;
    };

    const updateForecast = (data) => {
        const forecastGrid = document.getElementById('forecastGrid');
        forecastGrid.innerHTML = ''; // Clear previous forecast
        data.forecast.forEach(day => {
            const { icon } = getWeatherInfo(day.weatherCode, 1); // Assume day for forecast icon
            forecastGrid.innerHTML += `
                <div class="forecast-item">
                    <p>${day.date}</p>
                    <span class="icon">${icon}</span>
                    <p class="temp">${day.maxTemp}° / ${day.minTemp}°</p>
                </div>
            `;
        });
    };

    const updateGoogleLink = (cityName) => {
        const link = document.getElementById('googleWeatherLink');
        link.href = `https://www.google.com/search?q=weather+in+${encodeURIComponent(cityName)}`;
    };

    // --- State Management Functions ---

    const showLoading = () => {
        loader.classList.remove('hidden');
        errorContainer.classList.add('hidden');
        weatherContainer.classList.add('hidden');
        welcomeMessage.classList.add('hidden');
    };

    const showError = (message) => {
        loader.classList.add('hidden');
        errorContainer.textContent = message;
        errorContainer.classList.remove('hidden');
    };

    const showWeather = () => {
        loader.classList.add('hidden');
        weatherContainer.classList.remove('hidden');
    };

    // --- Event Handlers ---

    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        const query = searchInput.value;
        if (query.length < 2) {
            suggestionsList.innerHTML = '';
            return;
        }
        searchTimeout = setTimeout(async () => {
            const cities = await searchCities(query);
            suggestionsList.innerHTML = '';
            cities.forEach(city => {
                const li = document.createElement('li');
                li.textContent = `${city.name}, ${city.country}`;
                li.addEventListener('click', () => handleCitySelect(city));
                suggestionsList.appendChild(li);
            });
        }, 300); // Debounce to avoid too many API calls
    });

    const handleCitySelect = async (city) => {
        searchInput.value = '';
        suggestionsList.innerHTML = '';
        showLoading();

        try {
            const weatherData = await getWeatherData(city.latitude, city.longitude);
            updateCurrentWeather(weatherData, city.name);
            updateWeatherDetails(weatherData);
            updateForecast(weatherData);
            updateGoogleLink(city.name);
            showWeather();
        } catch (error) {
            showError('Could not fetch weather data. Please try again.');
        }
    };
});