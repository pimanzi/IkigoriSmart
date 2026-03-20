// Raw response from Open-Meteo API
export interface OpenMeteoResponse {
  current: {
    time: string;
    temperature_2m: number; // °C
    relative_humidity_2m: number; // %
    precipitation: number; // mm
  };
}

// Cleaned weather variables used by the spread risk model
export interface WeatherVariables {
  temperature: number; // °C — maps to temperature_c in model
  humidity: number; // %  — maps to humidity_pct in model
  rainfall: number; // mm — maps to rainfall_mm in model
  fetchedAt: string; // ISO timestamp — for display purposes
}

// State of the weather fetch operation
export type WeatherFetchStatus = 'idle' | 'loading' | 'success' | 'error';
