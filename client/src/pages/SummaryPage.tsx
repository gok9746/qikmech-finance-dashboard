import React, { useEffect, useState } from "react";
import SummaryCard from "@/components/dashboard/SummaryCard";
import { supabase } from "@/lib/supabaseClient";
import { BarChart3, TrendingUp, TrendingDown, PiggyBank, Calculator, Receipt } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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
  date: string;
  category: string;
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

  // ===== Calculations =====
  const totalIncomeNet = jobs.reduce((s, j) => s + j.amount_eur, 0);
  const partsCost = jobs.reduce((s, j) => s + j.parts_cost_eur, 0);
  const vatCollected = jobs.filter(j => j.tax_applied).reduce((s, j) => s + j.amount_eur * VAT_RATE, 0);
  const otherExpenses = expenses.reduce((s, e) => s + e.amount_eur, 0);
  const totalExpenses = partsCost + otherExpenses;
  const profitBeforeTax = totalIncomeNet - totalExpenses;
  const netProfit = profitBeforeTax - vatCollected;

  // ===== Chart Data =====
  const jobChartData = [
    { name: "Income", value: totalIncomeNet },
    { name: "Parts Cost", value: partsCost },
    { name: "VAT", value: vatCollected },
  ];

  // Group expenses by category
  const expenseByCategory: Record<string, number> = {};
  expenses.forEach(e => {
    expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount_eur;
  });
  const expenseChartData = Object.entries(expenseByCategory).map(([cat, value]) => ({
    name: cat,
    value,
  }));

  const COLORS = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28", "#AA66CC"];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Total Income" value={totalIncomeNet} icon={TrendingUp} description="Revenue" />
        <SummaryCard title="Parts Cost" value={partsCost} icon={Receipt} description="Total parts expenses" />
        <SummaryCard title="Other Expenses" value={otherExpenses} icon={Receipt} description="Manual expenses" />
        <SummaryCard title="Net Profit" value={netProfit} icon={PiggyBank} description="After VAT deduction" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="bg-white shadow rounded-2xl p-4">
          <h2 className="text-xl font-semibold mb-4">Jobs Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={jobChartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-white shadow rounded-2xl p-4">
          <h2 className="text-xl font-semibold mb-4">Expenses by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseChartData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                dataKey="value"
                label
              >
                {expenseChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
