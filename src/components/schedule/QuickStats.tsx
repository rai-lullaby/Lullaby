import { Activity } from '@/types/schedule';
import { UtensilsCrossed, Moon, Gamepad2, Clock } from 'lucide-react';

interface QuickStatsProps {
  activities: Activity[];
}

export function QuickStats({ activities }: QuickStatsProps) {
  const meals = activities.filter(a => a.type === 'meal').length;
  const naps = activities.filter(a => a.type === 'nap').length;
  const playTime = activities.filter(a => a.type === 'play').length;
  
  const firstActivity = activities[0];
  const lastActivity = activities[activities.length - 1];

  if (activities.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl shadow-card p-4 animate-fade-in" style={{ animationDelay: '150ms' }}>
      <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-3">
        Resumo do Dia
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="flex items-center gap-2 bg-meal-light rounded-xl p-3">
          <UtensilsCrossed className="h-5 w-5 text-meal-dark" />
          <div>
            <p className="text-lg font-bold text-foreground">{meals}</p>
            <p className="text-xs text-muted-foreground">Refeições</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-nap-light rounded-xl p-3">
          <Moon className="h-5 w-5 text-nap-dark" />
          <div>
            <p className="text-lg font-bold text-foreground">{naps}</p>
            <p className="text-xs text-muted-foreground">Sonecas</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-play-light rounded-xl p-3">
          <Gamepad2 className="h-5 w-5 text-play-dark" />
          <div>
            <p className="text-lg font-bold text-foreground">{playTime}</p>
            <p className="text-xs text-muted-foreground">Brincadeiras</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-muted rounded-xl p-3">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-bold text-foreground">
              {firstActivity?.time} - {lastActivity?.endTime}
            </p>
            <p className="text-xs text-muted-foreground">Horário</p>
          </div>
        </div>
      </div>
    </div>
  );
}
