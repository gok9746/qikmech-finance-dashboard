import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Expense = {
  id: string;
  date: string;
  category: string;
  amount_eur: number;
  note?: string | null;
};

type Job = {
  id: string;
  parts_cost_eur?: number;
  partsCost?: number;
};

const JOBS_KEY = "qm_jobs_v1";
const EXP_KEY = "qm_expenses_v1";

export default function SummaryPage() {
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [expenses, setExpenses] = React.useState<Expense[]>([]);

  const partsCostFromJobs = React.useMemo(() => {
    return jobs.reduce((sum, j) => {
      const v =
        typeof j.parts_cost_eur === "number"
          ? j.parts_cost_eur
          : typeof j.partsCost === "number"
          ? j.partsCost
          : 0;
      return sum + v;
    }, 0);
  }, [jobs]);

  const manualOtherExpenses = React.useMemo(() => {
    return expenses.reduce((sum, e) => sum + (Number(e.amount_eur) || 0), 0);
  }, [expenses]);

  const totalExpenses = partsCostFromJobs + manualOtherExpenses;

  function reloadFromStorage() {
    try {
      const r1 = localStorage.getItem(JOBS_KEY);
      if (r1) {
        const j = JSON.parse(r1);
        if (Array.isArray(j)) setJobs(j);
      }
    } catch {}

    try {
      const r2 = localStorage.getItem(EXP_KEY);
      if (r2) {
        const e = JSON.parse(r2);
        if (Array.isArray(e)) setExpenses(e);
      }
    } catch {}
  }

  React.useEffect(() => {
    // initial load
    reloadFromStorage();

    // cross-tab/native updates
    const storageHandler = (ev: StorageEvent) => {
      if (ev.key === JOBS_KEY || ev.key === EXP_KEY || ev.key === null) {
        reloadFromStorage();
      }
    };
    window.addEventListener("storage", storageHandler);

    // same-tab updates (fix)
    const sameTabHandler = () => reloadFromStorage();
    window.addEventListener("qm:data-updated", sameTabHandler);

    return () => {
      window.removeEventListener("storage", storageHandler);
      window.removeEventListener("qm:data-updated", sameTabHandler);
    };
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Summary</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Parts Cost from Jobs</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            € {partsCostFromJobs.toFixed(2)}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Other Expenses (Manual)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            € {manualOtherExpenses.toFixed(2)}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            € {totalExpenses.toFixed(2)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
