import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";

type Job = {
  id: string;
  date: string;
  customer: string;
  service_type: string;
  amount_eur: number;
  parts_cost_eur: number;
  status: string;
  tax_applied: boolean;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [customer, setCustomer] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [amount, setAmount] = useState("");
  const [partsCost, setPartsCost] = useState("");
  const [status, setStatus] = useState("Pending");

  // 🔹 Load Jobs
  async function loadJobs() {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("date", { ascending: false });
    if (error) console.error("Load jobs error:", error);
    else setJobs(data as Job[]);
  }

  useEffect(() => {
    loadJobs();
  }, []);

  // 🔹 Add Job
  async function addJob() {
    if (!customer.trim() || !serviceType.trim() || !amount) {
      return alert("Please fill customer, service and amount.");
    }

    const { data, error } = await supabase.from("jobs").insert([
      {
        date,
        customer: customer.trim(),
        service_type: serviceType.trim(),
        amount_eur: Number(amount),
        parts_cost_eur: Number(partsCost) || 0,
        status,
        tax_applied: true,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      },
    ]).select();

    if (error) {
      console.error("Insert job error:", error);
      alert("Failed to save job");
    } else {
      setJobs([...(data as Job[]), ...jobs]);
      setCustomer("");
      setServiceType("");
      setAmount("");
      setPartsCost("");
      setStatus("Pending");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Jobs</h1>

      {/* Job Form */}
      <div className="grid gap-2 max-w-md">
        <Label>Date</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <Label>Customer</Label>
        <Input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Customer name" />

        <Label>Service Type</Label>
        <Input value={serviceType} onChange={(e) => setServiceType(e.target.value)} placeholder="Service type" />

        <Label>Amount (€)</Label>
        <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />

        <Label>Parts Cost (€)</Label>
        <Input type="number" value={partsCost} onChange={(e) => setPartsCost(e.target.value)} placeholder="0.00" />

        <Label>Status</Label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded p-2">
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>

        <Button onClick={addJob}>Save Job</Button>
      </div>

      {/* Job List */}
      <div className="space-y-2">
        {jobs.length === 0 ? (
          <p>No jobs yet.</p>
        ) : (
          jobs.map((j) => (
            <div key={j.id} className="border rounded-lg p-3 flex justify-between">
              <div>
                <strong>{j.customer}</strong> — {j.service_type} <br />
                <span className="text-sm opacity-70">{j.status}</span>
              </div>
              <div>
                <div>€ {j.amount_eur.toFixed(2)}</div>
                <div className="text-xs opacity-60">Parts: € {j.parts_cost_eur.toFixed(2)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
