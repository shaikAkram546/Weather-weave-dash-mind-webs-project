import React from 'react';
import { Range } from 'react-range';
import { useTimelineStore } from '../store/timelineStore';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { format, addHours } from 'date-fns';

const TimelineSlider: React.FC = () => {
  const {
    startDate,
    selectedStartHour,
    selectedEndHour,
    isRangeMode,
    setSelectedHour,
    setSelectedRange,
    toggleRangeMode,
  } = useTimelineStore();

  const totalHours = 30 * 24; // 30 days * 24 hours

  const formatHourToDate = (hour: number): string => {
    const date = addHours(startDate, hour);
    return format(date, 'MMM dd, HH:mm');
  };

  const values = isRangeMode ? [selectedStartHour, selectedEndHour] : [selectedStartHour];

  const handleChange = (newValues: number[]) => {
    if (isRangeMode && newValues.length === 2) {
      setSelectedRange(newValues[0], newValues[1]);
    } else {
      setSelectedHour(newValues[0]);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-background to-secondary/50 border-primary/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Timeline Control</h3>
            <p className="text-sm text-muted-foreground">
              {isRangeMode ? 'Select time range' : 'Select single time point'}
            </p>
          </div>
          
          <ToggleGroup type="single" value={isRangeMode ? "range" : "single"}>
            <ToggleGroupItem 
              value="single" 
              onClick={() => !isRangeMode || toggleRangeMode()}
              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              Single Point
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="range" 
              onClick={() => isRangeMode || toggleRangeMode()}
              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              Range
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="space-y-3">
          <Range
            step={1}
            min={0}
            max={totalHours - 1}
            values={values}
            onChange={handleChange}
            allowOverlap={false}
            renderMark={({ props, index }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '4px',
                  width: '1px',
                  backgroundColor: index % 24 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                }}
              />
            )}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                className="h-2 bg-secondary rounded-full relative"
                style={{
                  ...props.style,
                }}
              >
                {children}
                {/* Active range highlight */}
                <div
                  className="absolute h-2 bg-primary rounded-full"
                  style={{
                    left: `${(Math.min(...values) / totalHours) * 100}%`,
                    width: `${((Math.max(...values) - Math.min(...values)) / totalHours) * 100}%`,
                  }}
                />
              </div>
            )}
            renderThumb={({ props, index, isDragged }) => (
              <div
                {...props}
                className={`
                  h-6 w-6 bg-primary border-2 border-background rounded-full shadow-lg
                  transition-all duration-200 ease-out
                  ${isDragged ? 'scale-125 shadow-xl' : 'hover:scale-110'}
                `}
                style={{
                  ...props.style,
                }}
              >
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded whitespace-nowrap">
                    {formatHourToDate(values[index])}
                  </div>
                </div>
              </div>
            )}
          />
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatHourToDate(0)}</span>
          <div className="text-center">
            <div className="font-medium text-foreground">
              {isRangeMode 
                ? `${formatHourToDate(selectedStartHour)} → ${formatHourToDate(selectedEndHour)}`
                : formatHourToDate(selectedStartHour)
              }
            </div>
            <div className="text-xs">
              {isRangeMode 
                ? `${selectedEndHour - selectedStartHour + 1} hours selected`
                : 'Single hour selected'
              }
            </div>
          </div>
          <span>{formatHourToDate(totalHours - 1)}</span>
        </div>
      </div>
    </Card>
  );
};

export default TimelineSlider;