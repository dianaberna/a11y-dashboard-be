import { Badge } from "./ui/badge";
import { CircleCheck, Clock, AlertTriangle, XCircle } from "lucide-react";

type StatoTest = 'non-testato' | 'testato' | 'recheck' | 'completato';

interface ChipStatoTestProps {
  stato: StatoTest;
  className?: string;
}

const statoConfig = {
  'non-testato': {
    label: 'Non testato',
    icon: XCircle,
    style: 'bg-gray-100 text-gray-700 border-gray-300' as const,
    ariaLabel: 'Stato: Non testato'
  },
  'testato': {
    label: 'Testato',
    icon: Clock,
    style: 'bg-blue-100 text-blue-700 border-blue-300' as const,
    ariaLabel: 'Stato: Testato'
  },
  'recheck': {
    label: 'In recheck',
    icon: AlertTriangle,
    style: 'bg-yellow-100 text-yellow-700 border-yellow-300' as const,
    ariaLabel: 'Stato: In recheck'
  },
  'completato': {
    label: 'Completato',
    icon: CircleCheck,
    style: 'bg-green-100 text-green-700 border-green-300' as const,
    ariaLabel: 'Stato: Completato'
  }
};

export function ChipStatoTest({ stato, className = '' }: ChipStatoTestProps) {
  const config = statoConfig[stato];
  const Icon = config.icon;
  
  return (
    <Badge 
      variant="outline" 
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium border ${config.style} ${className}`}
      role="status"
      aria-label={config.ariaLabel}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{config.label}</span>
    </Badge>
  );
}