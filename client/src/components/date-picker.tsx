import { useState, useEffect, useRef } from "react";
import { format, addDays, startOfDay, isSameDay } from "date-fns";

interface DatePickerProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  className?: string;
}

export default function DatePicker({ selectedDate, onDateSelect, className = "" }: DatePickerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const today = startOfDay(new Date());
  
  // Generate 14 days: 7 days before today + today + 6 days after
  const dates = Array.from({ length: 14 }, (_, i) => {
    return addDays(today, i - 7);
  });

  const scrollToDate = (targetDate: Date) => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const dateIndex = dates.findIndex(date => isSameDay(date, targetDate));
    
    if (dateIndex !== -1) {
      // Each date button is approximately 64px wide (w-16 = 4rem = 64px)
      const scrollPosition = dateIndex * 64 - container.clientWidth / 2 + 32;
      container.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: 'smooth'
      });
    }
  };

  // Scroll to selected date when component mounts or selectedDate changes
  useEffect(() => {
    const timer = setTimeout(() => scrollToDate(selectedDate), 100);
    return () => clearTimeout(timer);
  }, [selectedDate]);

  const getDateTitle = (date: Date) => {
    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, addDays(today, -1))) return "Yesterday";
    if (isSameDay(date, addDays(today, 1))) return "Tomorrow";
    return format(date, "MMM d");
  };

  const getDayAbbreviation = (date: Date) => {
    return format(date, "EEE").toUpperCase().slice(0, 2);
  };

  const isToday = (date: Date) => isSameDay(date, today);
  const isSelected = (date: Date) => isSameDay(date, selectedDate);

  return (
    <div className={`w-full ${className}`}>
      {/* Scrollable Date Row */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide px-4 py-2 gap-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {dates.map((date, index) => {
          const selected = isSelected(date);
          const todayDate = isToday(date);
          
          return (
            <button
              key={index}
              onClick={() => onDateSelect(date)}
              className={`
                flex-shrink-0 w-16 h-16 flex flex-col items-center justify-center
                rounded-2xl transition-all duration-200 relative
                ${todayDate && !selected 
                  ? 'bg-gray-700 text-white' 
                  : selected 
                    ? 'bg-transparent text-white'
                    : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
              data-testid={`date-picker-${format(date, 'yyyy-MM-dd')}`}
            >
              {/* Day abbreviation */}
              <span className="text-xs font-medium mb-1">
                {getDayAbbreviation(date)}
              </span>
              
              {/* Date number */}
              <span className="text-sm font-bold">
                {format(date, "d")}
              </span>
              
              {/* Selected indicator - green circle */}
              {selected && (
                <div className="absolute inset-0 rounded-2xl border-2 border-[#D9FF00] bg-[#D9FF00]/10" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Hook to get the display title for the selected date
export function useDateTitle(selectedDate: Date): string {
  const today = startOfDay(new Date());
  
  if (isSameDay(selectedDate, today)) return "Today";
  if (isSameDay(selectedDate, addDays(today, -1))) return "Yesterday";
  if (isSameDay(selectedDate, addDays(today, 1))) return "Tomorrow";
  return format(selectedDate, "MMM d");
}