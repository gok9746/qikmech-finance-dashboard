// client/src/pages/JobsPage.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import JobCard from "@/components/jobs/JobCard";
import { Search, Filter, Plus } from "lucide-react";

interface Job {
  id: string;
  date: string;
  customer: string;
  service_type: string;
  amount_eur: number;
  parts_cost_eur: number;
  status: "Pending" | "In Progress" | "Completed";
  tax_applied: boolean;
}

interface JobsPageProps {
  userRole: "admin" | "staff" | "accountant";
}

export default function JobsPage({ userRole }: JobsPageProps) {
  // ✅ fresh start — no demo values
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Add Job dialog state + fields
  const [open, setOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState("");
  const [newService, setNewService] = useState("");
  const [newDate, setNewDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [newAmount, setNewAmount] = useState<number | "">("");
  const [newParts, setNewParts] = useState<number | "">("");
  const [newTax, setNewTax] = useState(false);

  const resetForm = () => {
    setNewCustomer("");
    setNewService("");
    setNewDate(new Date().toISOString().slice(0, 10));
    setNewAmount("");
    setNewParts("");
    setNewTax(false);
  };

  const createJobLocal = () => {
    // basic validation
    if (!newCustomer.trim() || !newService.trim() || !newDate) return;

    const job: Job = {
      id: crypto.randomUUID(),
      customer: newCustomer.trim(),
      service_type: newService.trim(),
      date: newDate,
      amount_eur: Number(newAmount || 0),
      parts_cost_eur: Number(newParts || 0),
      status: "Pending",
      tax_applied: !!newTax,
    };

    setJobs((prev) => [job, ...prev]);
    resetForm();
    setOpen(false);

    // 🔄 When ready to save to Supabase, replace the two lines above with:
    // const { error } = await supabase.from("jobs").insert([job]);
    // if (!error) { setJobs((p)=>[job,...p]); setOpen(false); resetForm(); }
  };

  const filteredJobs = jobs.filter((job) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      job.customer.toLowerCase().includes(q) ||
      job.service_type.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (
    jobId: string,
    newStatus: "Pending" | "In Progress" | "Completed"
  ) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === jobId ? { ...job, status: newStatus } : job))
    );
    // console.log('Status changed:', { jobId, newStatus });
  };

  return (
    <div className="p-6 space-y-6" data-testid="page-jobs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Jobs</h1>
          <p className="text-muted-foreground">
            Manage customer service requests
          </p>
        </div>

        {(userRole === "admin" || userRole === "staff") && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              {/* type="button" so clicks aren't swallowed by forms */}
              <Button type="button" data-testid="button-add-job">
                <Plus className="h-4 w-4 mr-2" />
                Add Job
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Job</DialogTitle>
              </DialogHeader>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Customer</Label>
                  <Input
                    placeholder="ACME Ltd"
                    value={newCustomer}
                    onChange={(e) => setNewCustomer(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Service</Label>
                  <Input
                    placeholder="Engine Diagnostics"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Amount (EUR, net)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newAmount}
                      onChange={(e) =>
                        setNewAmount(e.target.value === "" ? "" : +e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Parts Cost (EUR)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newParts}
                      onChange={(e) =>
                        setNewParts(e.target.value === "" ? "" : +e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="tax"
                    checked={newTax}
                    onCheckedChange={(v) => setNewTax(Boolean(v))}
                  />
                  <Label htmlFor="tax">Apply 23% VAT</Label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      resetForm();
                      setOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={createJobLocal}>
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
              <SelectValue placeholder="All Status" />
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

      {/* Grid */}
      {filteredJobs.length === 0 ? (
        <div
          className="rounded-xl border border-dashed p-10 text-center text-muted-foreground"
          data-testid="no-jobs-message"
        >
          No jobs yet. Click <span className="font-medium">Add Job</span> to
          create your first one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              userRole={userRole}
              onStatusChange={handleStatusChange}
              onEdit={() => {
                // placeholder for future edit modal
                // console.log('Edit job:', job.id)
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
