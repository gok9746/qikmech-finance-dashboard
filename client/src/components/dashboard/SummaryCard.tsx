import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export default function SummaryCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend,
  className = '' 
}: SummaryCardProps) {
  return (
    <Card className={`hover-elevate ${className}`} data-testid={`card-summary-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {typeof value === 'number' && title.toLowerCase().includes('profit') || title.toLowerCase().includes('income') || title.toLowerCase().includes('expense') ? 
            `€${value.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
            value
          }
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center text-xs mt-1">
            <span className={trend.value >= 0 ? 'text-chart-1' : 'text-destructive'}>
              {trend.value >= 0 ? '+' : ''}{trend.value}%
            </span>
            <span className="text-muted-foreground ml-1">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}