import SummaryCard from "@/components/dashboard/SummaryCard";
import FinancialCharts from "@/components/charts/FinancialCharts";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  PiggyBank,
  Calculator,
} from "lucide-react";
import React from "react";

type JobStatus = "Pending" | "In Progress" | "Completed";
type Job = {
  id: string;
  date: string;             // YYYY-MM-DD
  customer: string;
  service_type: string;
  amount_eur: number;       // net (before VAT)
  parts_cost_eur: number;
  status: JobStatus;
  tax_applied: boolean;
};

const STORAGE_KEY = "qm_jobs_v1";
const VAT_RATE = 0.23;

interface SummaryPageProps {
  userRole: "admin" | "staff" | "accountant";
}

export default function SummaryPage({ userRole }: SummaryPageProps) {
  const [jobs, setJobs] = React.useState<Job[]>([]);

  // Load jobs from localStorage on mount (SPA navigation triggers this)
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Job[];
        if (Array.isArray(parsed)) setJobs(parsed);
      }
    } catch {}
  }, []);

  // --- KPI calculations ---
  const totalIncomeNet = jobs.reduce((s, j) => s + j.amount_eur, 0);
  const incomeWithTax = jobs.reduce(
    (s, j) => s + (j.tax_applied ? j.amount_eur * (1 + VAT_RATE) : j.amount_eur),
    0
  );
  const incomeWithoutTax = jobs
    .filter((j) => !j.tax_applied)
    .reduce((s, j) => s + j.amount_eur, 0);

  const partsCost = jobs.reduce((s, j) => s + j.parts_cost_eur, 0);
  const otherExpenses = 0; // until we wire the Expenses page to a store/DB
  const totalExpenses = partsCost + otherExpenses;

  const vatCollected = jobs
    .filter((j) => j.tax_applied)
    .reduce((s, j) => s + j.amount_eur * VAT_RATE, 0);

  const profitBeforeTax = totalIncomeNet - totalExpenses;
  const netProfit = profitBeforeTax - vatCollected; // “after VAT deduction” like your tile subtitle

  const worksCompleted = jobs.filter((j) => j.status === "Completed").length;

  const data = {
    worksCompleted,
    incomeWithTax,
    incomeWithoutTax,
    totalPartsCost: partsCost,
    otherExpenses,
    totalExpenses,
    profitBeforeTax,
    vatCollected,
    netProfit,
  };

  // --- Chart data (last 6 months) ---
  const end = new Date();
  const start = new Date();
  start.setMonth(end.getMonth() - 5);

  // build YYYY-MM keys
  const months: string[] = [];
  const cursor = new Date(start);
  cursor.setDate(1);
  while (cursor <= end) {
    months.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`);
    cursor.setMonth(cursor.getMonth() + 1);
  }

  const byMonth = new Map<string, { income: number; expenses: number }>();
  months.forEach((m) => byMonth.set(m, { income: 0, expenses: 0 }));

  for (const j of jobs) {
    const m = j.date.slice(0, 7); // YYYY-MM
    if (!byMonth.has(m)) continue;
    // income = net amount
    byMonth.get(m)!.income += j.amount_eur;
    // expenses = parts (other expenses will be added later when wired)
    byMonth.get(m)!.expenses += j.parts_cost_eur;
  }

  const series = months.map((m) => {
    const label = new Date(m + "-01").toLocaleString(undefined, { month: "short" });
    const row = byMonth.get(m)!;
    return { month: label, income: row.income, expenses: row.expenses };
  });

  // Pie breakdown — only Parts for now
  const pie = partsCost > 0 ? [{ name: "Parts", value: partsCost }] : [];

  return (
    <div className="p-6 space-y-6" data-testid="page-summary">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Summary</h1>
          <p className="text-muted-foreground">Overview of business performance and metrics</p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Works Completed"
          value={data.worksCompleted}
          icon={BarChart3}
          description="Total jobs finished"
          trend={{ value: 0, label: "from last month" }}
        />

        <SummaryCard
          title="Total Income"
          value={data.incomeWithTax + data.incomeWithoutTax}
          icon={TrendingUp}
          description="Revenue with & without tax"
          trend={{ value: 0, label: "from last month" }}
        />

        <SummaryCard
          title="Total Expenses"
          value={data.totalExpenses}
          icon={TrendingDown}
          description="Parts + operational costs"
          trend={{ value: 0, label: "from last month" }}
        />

        <SummaryCard
          title="Net Profit"
          value={data.netProfit}
          icon={PiggyBank}
          description="After VAT deduction"
          trend={{ value: 0, label: "from last month" }}
        />
      </div>

      {/* Detailed Financial Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryCard
          title="Income (With Tax)"
          value={data.incomeWithTax}
          icon={DollarSign}
          description="Jobs with 23% VAT applied"
        />

        <SummaryCard
          title="Income (Without Tax)"
          value={data.incomeWithoutTax}
          icon={DollarSign}
          description="Jobs without VAT"
        />

        <SummaryCard
          title="Parts Cost"
          value={data.totalPartsCost}
          icon={Receipt}
          description="Total parts expenses"
        />

        <SummaryCard
          title="Other Expenses"
          value={data.otherExpenses}
          icon={Receipt}
          description="Fuel, tools, insurance, etc."
        />

        <SummaryCard
          title="Profit Before Tax"
          value={data.profitBeforeTax}
          icon={Calculator}
          description="Total income - total expenses"
        />

        <SummaryCard
          title="VAT Collected"
          value={data.vatCollected}
          icon={Calculator}
          description="23% VAT on applicable jobs"
        />
      </div>

      {/* Financial Charts */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Financial Analytics</h2>
        <FinancialCharts series={series} pie={pie} />
      </div>
    </div>
  );
}
