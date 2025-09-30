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
  date: string;
  customer: string;
  service_type: string;
  amount_eur: number;
  parts_cost_eur: number;
  status: JobStatus;
  tax_applied: boolean;
};

type Expense = {
  id: string;
  date: string;
  category: string;
  amount_eur: number | string; // can be number or string
  note?: string | null;
};

const JOBS_KEY = "qm_jobs_v1";
const EXP_KEY = "qm_expenses_v1";
const VAT_RATE = 0.23;

interface SummaryPageProps {
  userRole: "admin" | "staff" | "accountant";
}

export default function SummaryPage({ userRole }: SummaryPageProps) {
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [expenses, setExpenses] = React.useState<Expense[]>([]);

  function reloadFromStorage() {
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
  }

  React.useEffect(() => {
    reloadFromStorage();

    const storageHandler = (ev: StorageEvent) => {
      if (ev.key === JOBS_KEY || ev.key === EXP_KEY || ev.key === null) {
        reloadFromStorage();
      }
    };
    window.addEventListener("storage", storageHandler);

    const sameTabHandler = () => reloadFromStorage();
    window.addEventListener("qm:data-updated", sameTabHandler);

    return () => {
      window.removeEventListener("storage", storageHandler);
      window.removeEventListener("qm:data-updated", sameTabHandler);
    };
  }, []);

  // KPIs
  const totalIncomeNet = jobs.reduce((s, j) => s + j.amount_eur, 0);
  const incomeWithTax = jobs.reduce(
    (s, j) =>
      s + (j.tax_applied ? j.amount_eur * (1 + VAT_RATE) : j.amount_eur),
    0
  );
  const incomeWithoutTax = jobs
    .filter((j) => !j.tax_applied)
    .reduce((s, j) => s + j.amount_eur, 0);
  const partsCost = jobs.reduce((s, j) => s + j.parts_cost_eur, 0);

  const otherExpenses = expenses.reduce(
    (s, e) => s + Number(e.amount_eur || 0), // ✅ always number
    0
  );

  const totalExpenses = partsCost + otherExpenses;
  const vatCollected = jobs
    .filter((j) => j.tax_applied)
    .reduce((s, j) => s + j.amount_eur * VAT_RATE, 0);
  const profitBeforeTax = totalIncomeNet - totalExpenses;
  const netProfit = profitBeforeTax - vatCollected;
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

  return (
    <div className="p-6 space-y-6" data-testid="page-summary">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Financial Summary
          </h1>
          <p className="text-muted-foreground">
            Overview of business performance and metrics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Works Completed"
          value={data.worksCompleted}
          icon={BarChart3}
          description="Total jobs finished"
        />
        <SummaryCard
          title="Total Income"
          value={data.incomeWithTax + data.incomeWithoutTax}
          icon={TrendingUp}
          description="Revenue with & without tax"
        />
        <SummaryCard
          title="Total Expenses"
          value={data.totalExpenses}
          icon={TrendingDown}
          description="Parts + operational costs"
        />
        <SummaryCard
          title="Net Profit"
          value={data.netProfit}
          icon={PiggyBank}
          description="After VAT deduction"
        />
      </div>

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
    </div>
  );
}
