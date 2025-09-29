import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import JobCard from '@/components/jobs/JobCard';
import { Search, Filter, Plus } from 'lucide-react';

// TODO: remove mock functionality
interface Job {
  id: string;
  date: string;
  customer: string;
  service_type: string;
  amount_eur: number;
  parts_cost_eur: number;
  status: 'Pending' | 'In Progress' | 'Completed';
  tax_applied: boolean;
}

const mockJobs: Job[] = [
  {
    id: '1',
    date: '2024-01-15',
    customer: 'Auto Service Center',
    service_type: 'Engine Diagnostics',
    amount_eur: 450.00,
    parts_cost_eur: 120.00,
    status: 'Completed',
    tax_applied: true
  },
  {
    id: '2',
    date: '2024-01-14',
    customer: 'Fleet Management Co',
    service_type: 'Brake Repair',
    amount_eur: 680.00,
    parts_cost_eur: 280.00,
    status: 'In Progress',
    tax_applied: true
  },
  {
    id: '3',
    date: '2024-01-13',
    customer: 'Private Vehicle Owner',
    service_type: 'Oil Change',
    amount_eur: 89.00,
    parts_cost_eur: 35.00,
    status: 'Pending',
    tax_applied: false
  },
];

interface JobsPageProps {
  userRole: 'admin' | 'staff' | 'accountant';
}

export default function JobsPage({ userRole }: JobsPageProps) {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.service_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (jobId: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: newStatus } : job
    ));
    console.log('Status changed:', { jobId, newStatus });
  };

  return (
    <div className="p-6 space-y-6" data-testid="page-jobs">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Jobs</h1>
          <p className="text-muted-foreground">Manage customer service requests</p>
        </div>
        {(userRole === 'admin' || userRole === 'staff') && (
          <Button onClick={() => setShowAddForm(!showAddForm)} data-testid="button-add-job">
            <Plus className="h-4 w-4 mr-2" />
            Add Job
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-jobs"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40" data-testid="select-status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredJobs.map(job => (
          <JobCard
            key={job.id}
            job={job}
            userRole={userRole}
            onStatusChange={handleStatusChange}
            onEdit={() => console.log('Edit job:', job.id)}
          />
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12 text-muted-foreground" data-testid="no-jobs-message">
          <p>No jobs found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}