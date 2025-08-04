import { useEffect } from 'react';
import { usePolygonStore } from '../store/polygonStore';
import { useTimelineStore } from '../store/timelineStore';
import { fetchWeatherData, getPolygonCenter } from '../utils/weatherApi';
import { applyColorRules } from '../utils/colorUtils';
import { format, addHours } from 'date-fns';

export const useWeatherData = () => {
  const { polygons, updatePolygonWeatherData, updatePolygonColor } = usePolygonStore();
  const { selectedStartHour, selectedEndHour, isRangeMode, startDate } = useTimelineStore();

  const fetchDataForPolygon = async (polygonId: string) => {
    const polygon = polygons.find(p => p.id === polygonId);
    if (!polygon) return;

    try {
      const [lat, lng] = getPolygonCenter(polygon.coordinates);
      
      // Get current timeline dates
      const startHour = addHours(startDate, selectedStartHour);
      const endHour = addHours(startDate, isRangeMode ? selectedEndHour : selectedStartHour);
      
      // Extend range to cover the day to ensure we have data
      const fetchStart = new Date(startHour.getFullYear(), startHour.getMonth(), startHour.getDate());
      const fetchEnd = new Date(endHour.getFullYear(), endHour.getMonth(), endHour.getDate(), 23, 59, 59);

      const data = await fetchWeatherData(
        lat,
        lng,
        fetchStart,
        fetchEnd,
        [polygon.dataField]
      );

      // Process the data
      const timeData = data.hourly.time;
      const valueData = data.hourly[polygon.dataField as keyof typeof data.hourly] as number[];
      
      if (!valueData) {
        console.error(`No data found for field: ${polygon.dataField}`);
        return;
      }

      const weatherData = timeData.map((time, index) => ({
        datetime: time,
        value: valueData[index],
      }));

      updatePolygonWeatherData(polygonId, weatherData);

      // Calculate current value based on selected time
      let currentValue: number;
      
      if (isRangeMode) {
        // Average value over the selected range
        const selectedData = weatherData.filter(point => {
          const pointTime = new Date(point.datetime);
          const pointHour = (pointTime.getTime() - startDate.getTime()) / (1000 * 60 * 60);
          return pointHour >= selectedStartHour && pointHour <= selectedEndHour;
        });
        
        currentValue = selectedData.length > 0 
          ? selectedData.reduce((sum, point) => sum + point.value, 0) / selectedData.length
          : 0;
      } else {
        // Single point value
        const targetTime = addHours(startDate, selectedStartHour);
        const targetTimeStr = format(targetTime, "yyyy-MM-dd'T'HH:00");
        const targetPoint = weatherData.find(point => point.datetime.startsWith(targetTimeStr));
        currentValue = targetPoint?.value || 0;
      }

      // Apply color rules
      const color = applyColorRules(currentValue, polygon.colorRules);
      updatePolygonColor(polygonId, color);

    } catch (error) {
      console.error(`Failed to fetch weather data for polygon ${polygonId}:`, error);
    }
  };

  // Fetch data for all polygons when timeline changes
  useEffect(() => {
    polygons.forEach(polygon => {
      fetchDataForPolygon(polygon.id);
    });
  }, [selectedStartHour, selectedEndHour, isRangeMode, polygons.length]);

  return {
    fetchDataForPolygon,
  };
};