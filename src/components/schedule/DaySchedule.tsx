import { Activity } from '@/types/schedule';
import { ActivityCard } from './ActivityCard';
import { format, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarX, Sun } from 'lucide-react';

interface DayScheduleProps {
  date: Date;
  activities: Activity[];
}

export function DaySchedule({ date, activities }: DayScheduleProps) {
  const isWeekendDay = isWeekend(date);

  if (isWeekendDay) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
        <div className="bg-accent/50 rounded-full p-6 mb-4">
          <Sun className="h-12 w-12 text-accent-foreground" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          Fim de Semana! 🌈
        </h3>
        <p className="text-muted-foreground text-center max-w-xs">
          Aproveite o tempo em família. A creche estará fechada.
        </p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
        <div className="bg-muted rounded-full p-6 mb-4">
          <CalendarX className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          Sem atividades
        </h3>
        <p className="text-muted-foreground text-center max-w-xs">
          Não há atividades programadas para este dia.
        </p>
      </div>
    );
  }

  // Group activities by period
  const morning = activities.filter(a => {
    const hour = parseInt(a.time.split(':')[0]);
    return hour < 12;
  });
  
  const afternoon = activities.filter(a => {
    const hour = parseInt(a.time.split(':')[0]);
    return hour >= 12;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold capitalize">
          {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </h2>
      </div>

      {/* Morning activities */}
      {morning.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌅</span>
            <h3 className="font-semibold text-muted-foreground uppercase text-sm tracking-wide">
              Manhã
            </h3>
          </div>
          <div className="space-y-3">
            {morning.map((activity, index) => (
              <ActivityCard key={activity.id} activity={activity} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Afternoon activities */}
      {afternoon.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌤️</span>
            <h3 className="font-semibold text-muted-foreground uppercase text-sm tracking-wide">
              Tarde
            </h3>
          </div>
          <div className="space-y-3">
            {afternoon.map((activity, index) => (
              <ActivityCard key={activity.id} activity={activity} index={morning.length + index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
