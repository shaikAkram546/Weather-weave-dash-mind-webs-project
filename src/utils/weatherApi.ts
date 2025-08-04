import { format } from 'date-fns';

export interface WeatherApiResponse {
  latitude: number;
  longitude: number;
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m?: number[];
    precipitation?: number[];
    wind_speed_10m?: number[];
  };
}

export const fetchWeatherData = async (
  latitude: number,
  longitude: number,
  startDate: Date,
  endDate: Date,
  variables: string[] = ['temperature_2m']
): Promise<WeatherApiResponse> => {
  const startDateStr = format(startDate, 'yyyy-MM-dd');
  const endDateStr = format(endDate, 'yyyy-MM-dd');
  const variablesStr = variables.join(',');
  

  //From this I am calling API provided.
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDateStr}&end_date=${endDateStr}&hourly=${variablesStr}&timezone=auto`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    throw error;
  }
};

export const getPolygonCenter = (coordinates: [number, number][]): [number, number] => {
  const latSum = coordinates.reduce((sum, [lat]) => sum + lat, 0);
  const lngSum = coordinates.reduce((sum, [, lng]) => sum + lng, 0);
  
  return [latSum / coordinates.length, lngSum / coordinates.length];
};