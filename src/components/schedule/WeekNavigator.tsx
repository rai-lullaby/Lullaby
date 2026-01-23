import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addDays, startOfWeek, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WeekNavigatorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  weekStart: Date;
  onWeekChange: (direction: 'prev' | 'next') => void;
}

export function WeekNavigator({ selectedDate, onDateChange, weekStart, onWeekChange }: WeekNavigatorProps) {
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  const formatDayName = (date: Date) => {
    return format(date, 'EEE', { locale: ptBR }).toUpperCase();
  };

  return (
    <div className="bg-card rounded-2xl shadow-card p-4 animate-fade-in">
      {/* Month and year header */}
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onWeekChange('prev')}
          className="h-9 w-9 rounded-xl hover:bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <span className="font-bold text-lg capitalize">
            {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
          </span>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onWeekChange('next')}
          className="h-9 w-9 rounded-xl hover:bg-muted"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateChange(day)}
              className={`
                flex flex-col items-center py-2 px-1 sm:px-3 rounded-xl transition-all duration-200
                ${isSelected 
                  ? 'bg-primary text-primary-foreground shadow-soft scale-105' 
                  : isTodayDate 
                    ? 'bg-accent text-accent-foreground' 
                    : isWeekend 
                      ? 'text-muted-foreground hover:bg-muted/50' 
                      : 'hover:bg-muted'
                }
              `}
            >
              <span className={`text-[10px] sm:text-xs font-medium ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {formatDayName(day)}
              </span>
              <span className={`text-lg sm:text-xl font-bold ${isSelected ? '' : ''}`}>
                {format(day, 'd')}
              </span>
              {isTodayDate && !isSelected && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
