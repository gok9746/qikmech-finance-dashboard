import React, { useEffect, useState } from "react";
import SummaryCard from "@/components/dashboard/SummaryCard";
import { BarChart3, TrendingUp, TrendingDown, PiggyBank, Calculator, DollarSign, Receipt } from "lucide-react";

type Job = {
  id: string;
  date: string;
  customer: string;
  service_type: string;
  amount_eur: number;
  parts_cost_eur: number;
  status: "Pending" | "In Progress" | "Completed";
  tax_applied: boolean;
};

type Expense = {
  id: string;
  date: string;
  category: string;
  amount_eur: number;
  note?: string | null;
};

const JOBS_KEY = "qm_jobs_v1";
const EXP_KEY = "qm_expenses_v1";
const VAT_RATE = 0.23;

export default function SummaryPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  function reload() {
    try {
      const r1 = localStorage.getItem(JOBS_KEY);
      if (r1) setJobs(JSON.parse(r1));
    } catch {}
    try {
      const r2 = localStorage.getItem(EXP_KEY);
      if (r2) setExpenses(JSON.parse(r2));
    } catch {}
  }

  useEffect(() => {
    reload();
    const handler = () => reload();
    window.addEventListener("storage", handler);
    window.addEventListener("qm:data-updated", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("qm:data-updated", handler);
    };
  }, []);

  // Totals
  const totalIncomeNet = jobs.reduce((s, j) => s + j.amount_eur, 0);
  const partsCost = jobs.reduce((s, j) => s + j.parts_cost_eur, 0);
  const otherExpenses = expenses.reduce((s, e) => s + Number(e.amount_eur || 0), 0);
  const totalExpenses = partsCost + otherExpenses;
  const vatCollected = jobs.filter(j => j.tax_applied).reduce((s, j) => s + j.amount_eur * VAT_RATE, 0);
  const profitBeforeTax = totalIncomeNet - totalExpenses;
  const netProfit = profitBeforeTax - vatCollected;
  const worksCompleted = jobs.filter(j => j.status === "Completed").length;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Financial Summary</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Works Completed" value={worksCompleted} icon={BarChart3} description="Jobs finished" />
        <SummaryCard title="Total Income" value={totalIncomeNet} icon={TrendingUp} description="Revenue" />
        <SummaryCard title="Total Expenses" value={totalExpenses} icon={TrendingDown} description="Parts + Expenses" />
        <SummaryCard title="Net Profit" value={netProfit} icon={PiggyBank} description="After VAT deduction" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryCard title="Parts Cost" value={partsCost} icon={Receipt} description="Total parts expenses" />
        <SummaryCard title="Other Expenses" value={otherExpenses} icon={Receipt} description="Manual expenses" />
        <SummaryCard title="Profit Before Tax" value={profitBeforeTax} icon={Calculator} description="Income - Expenses" />
        <SummaryCard title="VAT Collected" value={vatCollected} icon={Calculator} description="23% VAT" />
      </div>
    </div>
  );
}
