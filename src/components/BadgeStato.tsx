import { Badge } from "./ui/badge";
import { AlertCircle, CheckCircle, Users } from "lucide-react";

type StatoSegnalazione = 'non-risolto' | 'risolto' | 'community';

interface BadgeStatoProps {
  stato: StatoSegnalazione;
  className?: string;
}

const statoConfig = {
  'non-risolto': {
    label: 'Non risolto',
    icon: AlertCircle,
    style: 'bg-red-100 text-red-700 border-red-300' as const,
    ariaLabel: 'Stato segnalazione: Non risolto'
  },
  'risolto': {
    label: 'Risolto',
    icon: CheckCircle,
    style: 'bg-green-100 text-green-700 border-green-300' as const,
    ariaLabel: 'Stato segnalazione: Risolto'
  },
  'community': {
    label: 'Community',
    icon: Users,
    style: 'bg-purple-100 text-purple-700 border-purple-300' as const,
    ariaLabel: 'Stato segnalazione: Community'
  }
};

export function BadgeStato({ stato, className = '' }: BadgeStatoProps) {
  const config = statoConfig[stato];
  const Icon = config.icon;
  
  return (
    <Badge 
      variant="outline" 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border ${config.style} ${className}`}
      role="status"
      aria-label={config.ariaLabel}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span>{config.label}</span>
    </Badge>
  );
}