import { UtensilsCrossed, Moon, Gamepad2, GraduationCap, Droplets } from 'lucide-react';

const legendItems = [
  { type: 'meal', label: 'Alimentação', icon: UtensilsCrossed, colorClass: 'bg-meal text-white' },
  { type: 'nap', label: 'Soneca', icon: Moon, colorClass: 'bg-nap text-white' },
  { type: 'play', label: 'Brincadeiras', icon: Gamepad2, colorClass: 'bg-play text-white' },
  { type: 'learn', label: 'Aprendizado', icon: GraduationCap, colorClass: 'bg-learn text-white' },
  { type: 'hygiene', label: 'Higiene', icon: Droplets, colorClass: 'bg-hygiene text-white' },
];

export function ActivityLegend() {
  return (
    <div className="bg-card rounded-2xl shadow-card p-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
      <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-3">
        Legenda
      </h3>
      <div className="flex flex-wrap gap-2">
        {legendItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.type}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/50"
            >
              <div className={`${item.colorClass} p-1 rounded-md`}>
                <Icon className="h-3 w-3" />
              </div>
              <span className="text-xs font-medium text-foreground">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
