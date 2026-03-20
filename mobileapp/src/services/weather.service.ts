import { District, DISTRICT_COORDS } from '../config/districtCoords';
import { OpenMeteoResponse, WeatherVariables } from '../types/weather.types';

export async function fetchWeatherByDistrict(district: District): Promise<WeatherVariables> {
  try {
    const coords = DISTRICT_COORDS[district];
    const baseUrl = process.env.EXPO_PUBLIC_OPEN_METEO_URL;

    const url = `${baseUrl}?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,relative_humidity_2m,precipitation&timezone=Africa/Kigali`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Weather API request failed');
    }

    const data: OpenMeteoResponse = await response.json();

    return {
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      rainfall: data.current.precipitation,
      fetchedAt: data.current.time,
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch weather data');
  }
}
