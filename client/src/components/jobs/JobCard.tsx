import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Euro, User, Wrench } from 'lucide-react';
import { format } from 'date-fns';

interface Job {
  id: string;
  date: string;
  customer: string;
  service_type: string;
  amount_eur: number;
  parts_cost_eur: number;
  status: 'Pending' | 'In Progress' | 'Completed';
  tax_applied: boolean;
  total_with_tax?: number;
}

interface JobCardProps {
  job: Job;
  userRole: 'admin' | 'staff' | 'accountant';
  onStatusChange: (jobId: string, status: 'Pending' | 'In Progress' | 'Completed') => void;
  onEdit?: (job: Job) => void;
}

export default function JobCard({ job, userRole, onStatusChange, onEdit }: JobCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-chart-1 text-white';
      case 'In Progress': return 'bg-chart-3 text-white';
      case 'Pending': return 'bg-chart-2 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const calculateTotal = () => {
    const base = Number(job.amount_eur);
    return job.tax_applied ? base * 1.23 : base;
  };

  const canEditStatus = userRole === 'admin' || userRole === 'staff';
  const canSeeFinancials = userRole === 'admin';

  return (
    <Card className="hover-elevate" data-testid={`card-job-${job.id}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle className="text-lg">{job.customer}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Clock className="h-4 w-4" />
            {format(new Date(job.date), 'MMM dd, yyyy')}
          </div>
        </div>
        <Badge className={getStatusColor(job.status)} data-testid={`status-${job.status.toLowerCase().replace(' ', '-')}`}>
          {job.status}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{job.service_type}</span>
        </div>
        
        {canSeeFinancials && (
          <div className="space-y-2 p-3 bg-muted/50 rounded-md">
            <div className="flex justify-between text-sm">
              <span>Service:</span>
              <span className="font-mono">€{Number(job.amount_eur).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Parts:</span>
              <span className="font-mono">€{Number(job.parts_cost_eur).toFixed(2)}</span>
            </div>
            {job.tax_applied && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>VAT (23%):</span>
                <span className="font-mono">€{(Number(job.amount_eur) * 0.23).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-medium pt-2 border-t">
              <span>Total:</span>
              <span className="font-mono">€{calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        )}

        {canEditStatus && (
          <div className="flex gap-2">
            {job.status !== 'Pending' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onStatusChange(job.id, 'Pending')}
                data-testid="button-status-pending"
              >
                Set Pending
              </Button>
            )}
            {job.status !== 'In Progress' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onStatusChange(job.id, 'In Progress')}
                data-testid="button-status-progress"
              >
                In Progress
              </Button>
            )}
            {job.status !== 'Completed' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onStatusChange(job.id, 'Completed')}
                data-testid="button-status-completed"
              >
                Complete
              </Button>
            )}
            {onEdit && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onEdit(job)}
                data-testid="button-edit-job"
              >
                Edit
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}