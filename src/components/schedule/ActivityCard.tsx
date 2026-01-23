import { Activity, ActivityType } from '@/types/schedule';
import { UtensilsCrossed, Moon, Gamepad2, GraduationCap, Droplets } from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
  index: number;
}

const activityConfig: Record<ActivityType, { 
  icon: typeof UtensilsCrossed; 
  bgClass: string; 
  borderClass: string;
  iconClass: string;
  emoji: string;
}> = {
  meal: { 
    icon: UtensilsCrossed, 
    bgClass: 'bg-meal-light', 
    borderClass: 'border-l-meal',
    iconClass: 'text-meal-dark bg-meal/20',
    emoji: '🍽️'
  },
  nap: { 
    icon: Moon, 
    bgClass: 'bg-nap-light', 
    borderClass: 'border-l-nap',
    iconClass: 'text-nap-dark bg-nap/20',
    emoji: '😴'
  },
  play: { 
    icon: Gamepad2, 
    bgClass: 'bg-play-light', 
    borderClass: 'border-l-play',
    iconClass: 'text-play-dark bg-play/20',
    emoji: '🎮'
  },
  learn: { 
    icon: GraduationCap, 
    bgClass: 'bg-learn-light', 
    borderClass: 'border-l-learn',
    iconClass: 'text-learn-dark bg-learn/20',
    emoji: '📚'
  },
  hygiene: { 
    icon: Droplets, 
    bgClass: 'bg-hygiene-light', 
    borderClass: 'border-l-hygiene',
    iconClass: 'text-hygiene-dark bg-hygiene/20',
    emoji: '🧼'
  },
};

export function ActivityCard({ activity, index }: ActivityCardProps) {
  const config = activityConfig[activity.type];
  const Icon = config.icon;

  return (
    <div 
      className={`
        ${config.bgClass} ${config.borderClass}
        border-l-4 rounded-xl p-4 
        shadow-soft hover:shadow-card 
        transition-all duration-200 hover:scale-[1.02]
        animate-fade-in
      `}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className={`${config.iconClass} p-2.5 rounded-xl shrink-0`}>
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-bold text-foreground truncate">
              {activity.title}
            </h3>
            <span className="text-2xl shrink-0">{config.emoji}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span className="font-semibold text-foreground/80">
              {activity.time}
            </span>
            {activity.endTime && (
              <>
                <span>→</span>
                <span className="font-semibold text-foreground/80">
                  {activity.endTime}
                </span>
              </>
            )}
          </div>
          
          {activity.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {activity.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
