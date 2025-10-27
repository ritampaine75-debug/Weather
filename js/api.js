// A utility function to map Weather Codes (WMO) to icons and descriptions
const getWeatherInfo = (code, isDay) => {
    const weatherMap = {
        0: { description: 'Clear sky', icon: '☀️' },
        1: { description: 'Mainly clear', icon: '🌤️' },
        2: { description: 'Partly cloudy', icon: '🌥️' },
        3: { description: 'Overcast', icon: '☁️' },
        45: { description: 'Fog', icon: '🌫️' },
        48: { description: 'Depositing rime fog', icon: '🌫️' },
        61: { description: 'Slight rain', icon: '🌧️' },
        63: { description: 'Moderate rain', icon: '🌧️' },
        65: { description: 'Heavy rain', icon: ' torrential rain' },
        80: { description: 'Slight rain showers', icon: '🌧️' },
        82: { description: 'Violent rain showers', icon: ' torrential rain' },
        95: { description: 'Thunderstorm', icon: '⛈️' },
    };
    const info = weatherMap[code] || { description: 'Unknown', icon: '🤷' };
    // Some icons can be different for day/night
    if (!isDay && info.icon === '☀️') info.icon = '🌙';
    if (!isDay && info.icon === '🌤️') info.icon = '☁️';
    return info;
};

// Fetches city suggestions from the Open-Meteo Geocoding API
const searchCities = async (query) => {
    if (query.length < 2) return [];
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5&language=en&format=json`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch cities.');
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error("City search error:", error);
        return [];
    }
};

// Fetches weather data for a given latitude and longitude
const getWeatherData = async (latitude, longitude) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch weather data.');
        const data = await response.json();
        return {
            current: {
                temperature: Math.round(data.current.temperature_2m),
                weatherCode: data.current.weather_code,
                windSpeed: data.current.wind_speed_10m.toFixed(1),
                humidity: data.current.relative_humidity_2m,
                isDay: data.current.is_day,
            },
            forecast: data.daily.time.slice(1, 6).map((date, index) => ({
                date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                maxTemp: Math.round(data.daily.temperature_2m_max[index + 1]),
                minTemp: Math.round(data.daily.temperature_2m_min[index + 1]),
                weatherCode: data.daily.weather_code[index + 1],
            })),
        };
    } catch (error) {
        console.error("Weather data fetch error:", error);
        throw error; // Re-throw the error to be caught by the caller
    }
};