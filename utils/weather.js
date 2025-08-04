import { WEATHER_API_KEY } from '@env';
const API_KEY = WEATHER_API_KEY;

export async function getWeatherByCity(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error('City not found');
    }

    const data = await response.json();

    const weather = {
      city: data.name,
      description: data.weather[0].description,
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
    };

    return `${weather.city} is ${weather.description} with a temperature of ${weather.temperature}°C and a feels like temperature of ${weather.feelsLike}°C.`;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return `${error}`;
  }
}
