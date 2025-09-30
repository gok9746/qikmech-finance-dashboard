import React, { useEffect, useState } from "react";
import SummaryCard from "@/components/dashboard/SummaryCard";
import { supabase } from "@/lib/supabaseClient";
import { BarChart3, TrendingUp, TrendingDown, PiggyBank, Calculator, DollarSign, Receipt } from "lucide-react";

type Job = {
  id: string;
  date: string;
  amount_eur: number;
  parts_cost_eur: number;
  status: string;
  tax_applied: boolean;
};

type Expense = {
  id: string;
  amount_eur: number;
};

const VAT_RATE = 0.23;

export default function SummaryPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  async function loadData() {
    const { data: jobsData } = await supabase.from("jobs").select("*");
    const { data: expensesData } = await supabase.from("expenses").select("*");
    setJobs((jobsData as Job[]) || []);
    setExpenses((expensesData as Expense[]) || []);
  }

  useEffect(() => {
    loadData();
  }, []);

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
