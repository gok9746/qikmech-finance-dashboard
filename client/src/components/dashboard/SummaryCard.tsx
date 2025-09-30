import { useState } from "react";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import SummaryCard from "@/components/summary/SummaryCard";
import { CreditCard, Briefcase, TrendingUp } from "lucide-react";

export default function SummaryPage() {
  // store jobs + expenses in state (UI-only version)
  const [jobs, setJobs] = useState<
    { id: string; price: number; partsCost: number }[]
  >([]);
  const [expenses, setExpenses] = useState<
    { date: string; category: string; amount_eur: number; notes: string }[]
  >([]);

  // add expense handler
  const handleAddExpense = (expense: {
    date: string;
    category: string;
    amount_eur: number;
    notes: string;
  }) => {
    setExpenses((prev) => [...prev, expense]);
  };

  // calculations
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount_eur, 0);
  const totalJobs = jobs.length;
  const totalIncome = jobs.reduce((sum, j) => sum + j.price, 0);
  const netProfit = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Works Completed"
          value={totalJobs}
          icon={Briefcase}
          description="Total jobs finished"
        />
        <SummaryCard
          title="Total Income"
          value={totalIncome}
          icon={TrendingUp}
          description="Revenue with & without tax"
        />
        <SummaryCard
          title="Total Expenses"
          value={totalExpenses}
          icon={CreditCard}
          description="Parts + operational costs"
        />
        <SummaryCard
          title="Net Profit"
          value={netProfit}
          icon={TrendingUp}
          description="After expenses deduction"
        />
      </div>

      {/* Expense Form */}
      <div className="col-span-3">
        <ExpenseForm onSubmit={handleAddExpense} />
      </div>
    </div>
  );
}
