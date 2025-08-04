import { ColorRule } from '../store/polygonStore';

export const applyColorRules = (value: number, rules: ColorRule[]): string => {
  // Sort rules by priority (most specific first)
  const sortedRules = [...rules].sort((a, b) => {
    if (a.condition === 'between' && b.condition !== 'between') return -1;
    if (a.condition !== 'between' && b.condition === 'between') return 1;
    return 0;
  });

  for (const rule of sortedRules) {
    if (matchesRule(value, rule)) {
      return rule.color;
    }
  }
  
  // Default color if no rules match
  return '#6b7280';
};

const matchesRule = (value: number, rule: ColorRule): boolean => {
  switch (rule.condition) {
    case 'lt':
      return value < rule.value1;
    case 'gte':
      return value >= rule.value1;
    case 'between':
      return rule.value2 !== undefined && 
             value >= rule.value1 && 
             value <= rule.value2;
    default:
      return false;
  }
};

export const getDefaultColorRules = (): ColorRule[] => [
  { id: '1', condition: 'lt', value1: 0, color: '#3b82f6' }, // Blue for cold
  { id: '2', condition: 'between', value1: 0, value2: 10, color: '#06b6d4' }, // Cyan for cool
  { id: '3', condition: 'between', value1: 10, value2: 20, color: '#10b981' }, // Green for mild
  { id: '4', condition: 'between', value1: 20, value2: 30, color: '#f59e0b' }, // Amber for warm
  { id: '5', condition: 'gte', value1: 30, color: '#ef4444' }, // Red for hot
];

export const temperatureColors = {
  cold: '#3b82f6',
  cool: '#06b6d4', 
  mild: '#10b981',
  warm: '#f59e0b',
  hot: '#ef4444',
};