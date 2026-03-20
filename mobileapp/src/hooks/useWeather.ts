import { useQuery } from '@tanstack/react-query';
import { District } from '../config/districtCoords';
import { WeatherVariables } from '../types/weather.types';
import { fetchWeatherByDistrict } from '../services/weather.service';

export const useWeather = (district: District | null) => {
  return useQuery<WeatherVariables, Error>({
    queryKey: ['weather', district],
    queryFn: () => fetchWeatherByDistrict(district!),
    enabled: district !== null,
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });
};
