import { create } from 'zustand';

export interface ColorRule {
  id: string;
  condition: 'lt' | 'gte' | 'between';
  value1: number;
  value2?: number; // for between condition
  color: string;
}

export interface WeatherDataPoint {
  datetime: string;
  value: number;
}

export interface Polygon {
  id: string;
  name: string;
  coordinates: [number, number][]; // [lat, lng]
  dataSource: 'open-meteo';
  dataField: string; // e.g., 'temperature_2m'
  colorRules: ColorRule[];
  currentColor: string;
  weatherData: WeatherDataPoint[];
  lastFetchedAt?: Date;
}

export interface PolygonState {
  polygons: Polygon[];
  activePolygonId: string | null;
  isDrawingMode: boolean;
  
  // Actions
  addPolygon: (coordinates: [number, number][]) => void;
  removePolygon: (id: string) => void;
  updatePolygon: (id: string, updates: Partial<Polygon>) => void;
  setActivePolygon: (id: string | null) => void;
  setDrawingMode: (isDrawing: boolean) => void;
  updatePolygonWeatherData: (id: string, data: WeatherDataPoint[]) => void;
  updatePolygonColor: (id: string, color: string) => void;
}

export const usePolygonStore = create<PolygonState>((set, get) => ({
  polygons: [],
  activePolygonId: null,
  isDrawingMode: false,

  addPolygon: (coordinates: [number, number][]) => {
    const newPolygon: Polygon = {
      id: `polygon-${Date.now()}`,
      name: `Polygon ${get().polygons.length + 1}`,
      coordinates,
      dataSource: 'open-meteo',
      dataField: 'temperature_2m',
      colorRules: [
        { id: '1', condition: 'lt', value1: 0, color: '#3b82f6' }, // Blue for cold
        { id: '2', condition: 'between', value1: 0, value2: 20, color: '#10b981' }, // Green for mild
        { id: '3', condition: 'gte', value1: 20, color: '#f59e0b' }, // Yellow for warm
      ],
      currentColor: '#6b7280', // Default gray
      weatherData: [],
    };
    
    set((state) => ({
      polygons: [...state.polygons, newPolygon],
      activePolygonId: newPolygon.id,
      isDrawingMode: false,
    }));
  },

  removePolygon: (id: string) =>
    set((state) => ({
      polygons: state.polygons.filter((p) => p.id !== id),
      activePolygonId: state.activePolygonId === id ? null : state.activePolygonId,
    })),

  updatePolygon: (id: string, updates: Partial<Polygon>) =>
    set((state) => ({
      polygons: state.polygons.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  setActivePolygon: (id: string | null) =>
    set({ activePolygonId: id }),

  setDrawingMode: (isDrawing: boolean) =>
    set({ isDrawingMode: isDrawing }),

  updatePolygonWeatherData: (id: string, data: WeatherDataPoint[]) =>
    set((state) => ({
      polygons: state.polygons.map((p) =>
        p.id === id 
          ? { ...p, weatherData: data, lastFetchedAt: new Date() }
          : p
      ),
    })),

  updatePolygonColor: (id: string, color: string) =>
    set((state) => ({
      polygons: state.polygons.map((p) =>
        p.id === id ? { ...p, currentColor: color } : p
      ),
    })),
}));