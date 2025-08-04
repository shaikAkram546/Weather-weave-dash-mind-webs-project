import React, { useState } from 'react';
import { usePolygonStore, ColorRule } from '../store/polygonStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Trash2, Plus, Settings } from 'lucide-react';
import { temperatureColors } from '../utils/colorUtils';

const ColorRuleEditor: React.FC<{
  polygon: any;
  onUpdateRules: (rules: ColorRule[]) => void;
}> = ({ polygon, onUpdateRules }) => {
  const [rules, setRules] = useState<ColorRule[]>(polygon.colorRules);

  const addRule = () => {
    const newRule: ColorRule = {
      id: Date.now().toString(),
      condition: 'gte',
      value1: 0,
      color: temperatureColors.mild,
    };
    const newRules = [...rules, newRule];
    setRules(newRules);
    onUpdateRules(newRules);
  };

  const updateRule = (ruleId: string, updates: Partial<ColorRule>) => {
    const newRules = rules.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    );
    setRules(newRules);
    onUpdateRules(newRules);
  };

  const removeRule = (ruleId: string) => {
    const newRules = rules.filter(rule => rule.id !== ruleId);
    setRules(newRules);
    onUpdateRules(newRules);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Color Rules</Label>
        <Button onClick={addRule} size="sm" variant="outline">
          <Plus className="h-3 w-3 mr-1" />
          Add Rule
        </Button>
      </div>
      
      {rules.map((rule) => (
        <Card key={rule.id} className="p-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Select
                value={rule.condition}
                onValueChange={(value: 'lt' | 'gte' | 'between') => 
                  updateRule(rule.id, { condition: value })
                }
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lt">Less than</SelectItem>
                  <SelectItem value="gte">Greater than or equal</SelectItem>
                  <SelectItem value="between">Between</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                type="number"
                value={rule.value1}
                onChange={(e) => updateRule(rule.id, { value1: parseFloat(e.target.value) })}
                className="w-20"
                placeholder="Value"
              />
              
              {rule.condition === 'between' && (
                <>
                  <span className="text-xs text-muted-foreground">and</span>
                  <Input
                    type="number"
                    value={rule.value2 || ''}
                    onChange={(e) => updateRule(rule.id, { value2: parseFloat(e.target.value) })}
                    className="w-20"
                    placeholder="Value"
                  />
                </>
              )}
              
              <Input
                type="color"
                value={rule.color}
                onChange={(e) => updateRule(rule.id, { color: e.target.value })}
                className="w-16 h-8 p-1"
              />
              
              <Button
                onClick={() => removeRule(rule.id)}
                size="sm"
                variant="destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

const PolygonList: React.FC = () => {
  const { polygons, activePolygonId, setActivePolygon, removePolygon, updatePolygon } = usePolygonStore();

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Polygons ({polygons.length})</Label>
      {polygons.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No polygons yet. Start drawing on the map!
        </p>
      ) : (
        <div className="space-y-2">
          {polygons.map((polygon) => (
            <Card
              key={polygon.id}
              className={`p-3 cursor-pointer transition-colors ${
                activePolygonId === polygon.id 
                  ? 'border-primary bg-primary/5' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => setActivePolygon(polygon.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border-2"
                    style={{ backgroundColor: polygon.currentColor }}
                  />
                  <span className="text-sm font-medium">{polygon.name}</span>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePolygon(polygon.id);
                  }}
                  size="sm"
                  variant="ghost"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <div className="mt-2 flex gap-1 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {polygon.coordinates.length} points
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {polygon.dataField.replace('_', ' ')}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const WeatherSidebar: React.FC = () => {
  const { polygons, activePolygonId, updatePolygon } = usePolygonStore();
  const activePolygon = polygons.find(p => p.id === activePolygonId);

  return (
    <div className="w-80 bg-card border-r border-border h-full overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Weather Data Control
        </h2>
        <p className="text-sm text-muted-foreground">
          Configure data sources and visualization rules
        </p>
      </div>

      <div className="p-4 space-y-6">
        <PolygonList />

        {activePolygon && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configure: {activePolygon.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="polygon-name">Name</Label>
                <Input
                  id="polygon-name"
                  value={activePolygon.name}
                  onChange={(e) => updatePolygon(activePolygon.id, { name: e.target.value })}
                  placeholder="Polygon name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data-source">Data Source</Label>
                <Select
                  value={activePolygon.dataSource}
                  onValueChange={(value: 'open-meteo') => 
                    updatePolygon(activePolygon.id, { dataSource: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open-meteo">Open-Meteo Archive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data-field">Data Field</Label>
                <Select
                  value={activePolygon.dataField}
                  onValueChange={(value) => 
                    updatePolygon(activePolygon.id, { dataField: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temperature_2m">Temperature (2m)</SelectItem>
                    <SelectItem value="relative_humidity_2m">Humidity (2m)</SelectItem>
                    <SelectItem value="precipitation">Precipitation</SelectItem>
                    <SelectItem value="wind_speed_10m">Wind Speed (10m)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <ColorRuleEditor
                polygon={activePolygon}
                onUpdateRules={(rules) => updatePolygon(activePolygon.id, { colorRules: rules })}
              />

              {activePolygon.weatherData.length > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <Label className="text-sm font-medium">Latest Data</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activePolygon.weatherData.length} data points loaded
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last updated: {activePolygon.lastFetchedAt?.toLocaleTimeString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WeatherSidebar;