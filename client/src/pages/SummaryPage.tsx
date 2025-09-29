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

type Expense = {
  id: string;
  date: string;        // YYYY-MM-DD
  category: string;
  amount_eur: number;
  note?: string | null;
};

const JOBS_KEY = "qm_jobs_v1";
const EXP_KEY  = "qm_expenses_v1";
const VAT_RATE = 0.23;

interface SummaryPageProps {
  userRole: "admin" | "staff" | "accountant";
}

export default function SummaryPage({ userRole }: SummaryPageProps) {
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [expenses, setExpenses] = React.useState<Expense[]>([]);

  React.useEffect(() => {
    try {
      const r1 = localStorage.getItem(JOBS_KEY);
      if (r1) {
        const j = JSON.parse(r1) as Job[];
        if (Array.isArray(j)) setJobs(j);
      }
    } catch {}
    try {
      const r2 = localStorage.getItem(EXP_KEY);
      if (r2) {
        const e = JSON.parse(r2) as Expense[];
        if (Array.isArray(e)) setExpenses(e);
      }
    } catch {}
  }, []);

  // KPIs
  const totalIncomeNet = jobs.reduce((s, j) => s + j.amount_eur, 0);
  const incomeWithTax = jobs.reduce(
    (s, j) => s + (j.tax_applied ? j.amount_eur * (1 + VAT_RATE) : j.amount_eur),
    0
  );
  const incomeWithoutTax = jobs.filter(j => !j.tax_applied).reduce((s, j) => s + j.amount_eur, 0);
  const partsCost = jobs.reduce((s, j) => s + j.parts_cost_eur, 0);
  const otherExpenses = expenses.reduce((s, e) => s + e.amount_eur, 0);
  const totalExpenses = partsCost + otherExpenses;
  const vatCollected = jobs.filter(j => j.tax_applied).reduce((s, j) => s + j.amount_eur * VAT_RATE, 0);
  const profitBeforeTax = totalIncomeNet - totalExpenses;
  const netProfit = profitBeforeTax - vatCollected;
  const worksCompleted = jobs.filter(j => j.status === "Completed").length;

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

  // Charts (last 6 months)
  const end = new Date();
  const start = new Date();
  start.setMonth(end.getMonth() - 5);

  const months: string[] = [];
  const cur = new Date(start);
  cur.setDate(1);
  while (cur <= end) {
    months.push(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}`);
    cur.setMonth(cur.getMonth() + 1);
  }

  const byMonth = new Map<string, { income: number; expenses: number }>();
  months.forEach((m) => byMonth.set(m, { income: 0, expenses: 0 }));

  for (const j of jobs) {
    const m = j.date.slice(0, 7);
    const row = byMonth.get(m);
    if (!row) continue;
    row.income += j.amount_eur;
    row.expenses += j.parts_cost_eur;
  }

  for (const e of expenses) {
    const m = e.date.slice(0, 7);
    const row = byMonth.get(m);
    if (!row) continue;
    row.expenses += e.amount_eur;
  }

  const series = months.map((m) => {
    const label = new Date(m + "-01").toLocaleString(undefined, { month: "short" });
    const row = byMonth.get(m)!;
    return { month: label, income: row.income, expenses: row.expenses };
  });

  const byCat = new Map<string, number>();
  for (const e of expenses) {
    byCat.set(e.category, (byCat.get(e.category) ?? 0) + e.amount_eur);
  }
  const pie = Array.from(byCat.entries()).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-6 space-y-6" data-testid="page-summary">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Summary</h1>
          <p className="text-muted-foreground">Overview of business performance and metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Works Completed" value={data.worksCompleted} icon={BarChart3} description="Total jobs finished" trend={{ value: 0, label: "from last month" }} />
        <SummaryCard title="Total Income" value={data.incomeWithTax + data.incomeWithoutTax} icon={TrendingUp} description="Revenue with & without tax" trend={{ value: 0, label: "from last month" }} />
        <SummaryCard title="Total Expenses" value={data.totalExpenses} icon={TrendingDown} description="Parts + operational costs" trend={{ value: 0, label: "from last month" }} />
        <SummaryCard title="Net Profit" value={data.netProfit} icon={PiggyBank} description="After VAT deduction" trend={{ value: 0, label: "from last month" }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryCard title="Income (With Tax)" value={data.incomeWithTax} icon={DollarSign} description="Jobs with 23% VAT applied" />
        <SummaryCard title="Income (Without Tax)" value={data.incomeWithoutTax} icon={DollarSign} description="Jobs without VAT" />
        <SummaryCard title="Parts Cost" value={data.totalPartsCost} icon={Receipt} description="Total parts expenses" />
        <SummaryCard title="Other Expenses" value={data.otherExpenses} icon={Receipt} description="Fuel, tools, insurance, etc." />
        <SummaryCard title="Profit Before Tax" value={data.profitBeforeTax} icon={Calculator} description="Total income - total expenses" />
        <SummaryCard title="VAT Collected" value={data.vatCollected} icon={Calculator} description="23% VAT on applicable jobs" />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Financial Analytics</h2>
        <FinancialCharts series={series} pie={pie} />
      </div>
    </div>
  );
}
