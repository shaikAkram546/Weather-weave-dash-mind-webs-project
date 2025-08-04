import React from 'react';
import WeatherMap from '../components/WeatherMap';
import WeatherSidebar from '../components/WeatherSidebar';
import TimelineSlider from '../components/TimelineSlider';
import { useWeatherData } from '../hooks/useWeatherData';

const Index = () => {
  // Initialize weather data fetching
  useWeatherData();

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">Weather Data Dashboard</h1>
          <p className="text-sm opacity-90">
            Interactive weather visualization with timeline control and polygon analysis
          </p>
        </div>
      </header>

      {/* Timeline Control */}
      <div className="p-4 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <TimelineSlider />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <WeatherSidebar />
        <div className="flex-1 p-4">
          <WeatherMap />
        </div>
      </div>
    </div>
  );
};

export default Index;
