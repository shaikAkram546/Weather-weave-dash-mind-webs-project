import { create } from 'zustand';
import { addDays, subDays, startOfDay, addHours } from 'date-fns';

export interface TimelineState {
  // Timeline range (30 days: 15 before and after today)
  startDate: Date;
  endDate: Date;
  
  // Current selection
  selectedStartHour: number; // 0-719 (30 days * 24 hours)
  selectedEndHour: number;
  isRangeMode: boolean;
  
  // Actions
  setSelectedHour: (hour: number) => void;
  setSelectedRange: (startHour: number, endHour: number) => void;
  toggleRangeMode: () => void;
  getCurrentSelectedDates: () => { start: Date; end: Date };
}

const today = startOfDay(new Date());
const timelineStart = subDays(today, 15);
const timelineEnd = addDays(today, 15);

export const useTimelineStore = create<TimelineState>((set, get) => ({
  startDate: timelineStart,
  endDate: timelineEnd,
  selectedStartHour: 360, // Start at today (15 days * 24 hours)
  selectedEndHour: 360,
  isRangeMode: false,

  setSelectedHour: (hour: number) =>
    set({
      selectedStartHour: hour,
      selectedEndHour: hour,
      isRangeMode: false,
    }),

  setSelectedRange: (startHour: number, endHour: number) =>
    set({
      selectedStartHour: Math.min(startHour, endHour),
      selectedEndHour: Math.max(startHour, endHour),
      isRangeMode: true,
    }),

  toggleRangeMode: () =>
    set((state) => ({
      isRangeMode: !state.isRangeMode,
      selectedEndHour: state.isRangeMode ? state.selectedStartHour : state.selectedEndHour,
    })),

  getCurrentSelectedDates: () => {
    const state = get();
    const start = addHours(state.startDate, state.selectedStartHour);
    const end = addHours(state.startDate, state.selectedEndHour);
    return { start, end };
  },
}));