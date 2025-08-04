import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, useMap, useMapEvents } from 'react-leaflet';
import { LatLng, Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import 'leaflet-draw';
import { usePolygonStore } from '../store/polygonStore';
import { Button } from './ui/button';
import { Pencil, RotateCcw } from 'lucide-react';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapEventHandler: React.FC = () => {
  const map = useMap();
  const { isDrawingMode, setDrawingMode, addPolygon } = usePolygonStore();
  const drawControlRef = useRef<L.Control.Draw | null>(null);

  // Handle zoom locking
  useMapEvents({
    zoomstart: () => {
      const currentZoom = map.getZoom();
      setTimeout(() => {
        if (map.getZoom() !== currentZoom) {
          map.setZoom(currentZoom);
        }
      }, 0);
    },
  });

  // Handle drawing controls
  useEffect(() => {
    if (!map) return;

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        polygon: isDrawingMode ? {
          allowIntersection: false,
          drawError: {
            color: '#e74c3c',
            message: 'Polygon cannot intersect itself!'
          },
          shapeOptions: {
            color: 'hsl(var(--primary))',
            fillColor: 'hsl(var(--primary))',
            fillOpacity: 0.3,
            weight: 2,
          }
        } : false,
        circle: false,
        rectangle: false,
        marker: false,
        circlemarker: false,
        polyline: false,
      },
      edit: {
        featureGroup: drawnItems,
        remove: false,
      }
    });

    if (isDrawingMode && !drawControlRef.current) {
      map.addControl(drawControl);
      drawControlRef.current = drawControl;
    } else if (!isDrawingMode && drawControlRef.current) {
      map.removeControl(drawControlRef.current);
      drawControlRef.current = null;
    }

    const onDrawCreated = (e: any) => {
      const layer = e.layer;
      const coords = layer.getLatLngs()[0].map((latlng: LatLng) => [latlng.lat, latlng.lng] as [number, number]);
      
      if (coords.length >= 3 && coords.length <= 12) {
        addPolygon(coords);
        drawnItems.addLayer(layer);
      } else {
        alert(`Polygon must have between 3 and 12 points. Current: ${coords.length}`);
      }
    };

    map.on(L.Draw.Event.CREATED, onDrawCreated);

    return () => {
      map.off(L.Draw.Event.CREATED, onDrawCreated);
      if (drawControlRef.current) {
        try {
          map.removeControl(drawControlRef.current);
          drawControlRef.current = null;
        } catch (e) {
          // Control might already be removed
        }
      }
    };
  }, [map, isDrawingMode, addPolygon]);

  return null;
};

const PolygonRenderer: React.FC = () => {
  const { polygons } = usePolygonStore();

  return (
    <>
      {polygons.map((polygon) => (
        <Polygon
          key={polygon.id}
          positions={polygon.coordinates}
          pathOptions={{
            color: 'hsl(var(--polygon-stroke))',
            fillColor: polygon.currentColor,
            fillOpacity: 0.6,
            weight: 2,
          }}
          eventHandlers={{
            click: () => {
              console.log(`Clicked polygon: ${polygon.name}`);
            },
          }}
        />
      ))}
    </>
  );
};

const WeatherMap: React.FC = () => {
  const defaultCenter: [number, number] = [52.52, 13.41]; // Berlin
  const defaultZoom = 13; // Fixed zoom for ~2 sq km
  const { isDrawingMode, setDrawingMode } = usePolygonStore();

  const toggleDrawing = () => {
    setDrawingMode(!isDrawingMode);
  };

  const resetView = (map: L.Map) => {
    map.setView([52.52, 13.41], 13);
  };

  return (
    <div className="relative h-full bg-background rounded-lg overflow-hidden shadow-[var(--shadow-map)]">
      {/* External Controls */}
      <div className="absolute top-4 left-4 z-[1000] space-y-2">
        <Button
          onClick={toggleDrawing}
          variant={isDrawingMode ? "default" : "secondary"}
          size="sm"
          className="shadow-lg"
        >
          <Pencil className="h-4 w-4 mr-2" />
          {isDrawingMode ? 'Stop Drawing' : 'Draw Polygon'}
        </Button>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        zoomControl={false}
        className="h-full w-full"
        maxZoom={defaultZoom}
        minZoom={defaultZoom}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEventHandler />
        <PolygonRenderer />
      </MapContainer>
    </div>
  );
};

export default WeatherMap;