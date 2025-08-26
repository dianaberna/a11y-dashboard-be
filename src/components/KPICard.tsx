import { Card, CardContent } from "./ui/card";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: 'default' | 'warning' | 'success' | 'info';
  className?: string;
}

const variantStyles = {
  default: 'text-gray-600',
  warning: 'text-yellow-600',
  success: 'text-green-600',
  info: 'text-blue-600'
};

export function KPICard({ title, value, icon: Icon, variant = 'default', className = '' }: KPICardProps) {
  return (
    <Card className={`${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {title}
            </p>
            <p className="text-3xl font-semibold" aria-label={`${title}: ${value}`}>
              {value}
            </p>
          </div>
          <div className={`p-3 rounded-lg bg-gray-50 ${variantStyles[variant]}`}>
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}