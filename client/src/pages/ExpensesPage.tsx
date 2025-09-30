import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search } from "lucide-react";
import ExpenseForm, { Expense } from "@/components/expenses/ExpenseForm";

type Role = "admin" | "staff" | "accountant";

interface ExpensesPageProps {
  userRole: Role;
}

const STORAGE_KEY = "qm_expenses_v1";

export default function ExpensesPage({ userRole }: ExpensesPageProps) {
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setExpenses(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  function saveExpenses(next: Expense[]) {
    setExpenses(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    // Fire a SAME-TAB custom event so SummaryPage can refresh immediately
    window.dispatchEvent(new CustomEvent("qm:data-updated", { detail: { table: "expenses" } }));

    // (Optional) also fire a vanilla storage event for cross-tab (some browsers ignore synthetic)
    try {
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue: JSON.stringify(next) }));
    } catch {
      // Safari/others may block constructing StorageEvent; custom event above is what we rely on
    }
  }

  function addExpense(payload: { date: string; category: string; amount_eur: number; notes?: string }) {
    const e: Expense = {
      id: crypto.randomUUID(),
      date: payload.date,
      category: payload.category.trim(),
      amount_eur: Number(payload.amount_eur || 0),
      note: payload.notes?.trim() ? payload.notes.trim() : null,
    };
    const updated = [e, ...expenses];
    saveExpenses(updated);
    setOpen(false);
  }

  const filtered = React.useMemo(() => {
    if (!q.trim()) return expenses;
    const s = q.toLowerCase();
    return expenses.filter((e) =>
      [e.date, e.category, String(e.amount_eur), e.note ?? ""].some((v) =>
        String(v).toLowerCase().includes(s)
      )
    );
  }, [q, expenses]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
            <Input
              className="pl-8 w-64"
              placeholder="Search expenses..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Expense</DialogTitle>
              </DialogHeader>
              <ExpenseForm onSubmit={addExpense} onCancel={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Simple list (keep your existing table if you have one) */}
      <div className="rounded-2xl border p-4">
        {filtered.length === 0 ? (
          <p className="text-sm opacity-70">No expenses yet.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((e) => (
              <div
                key={e.id}
                className="grid grid-cols-2 md:grid-cols-4 gap-2 items-center p-3 rounded-xl border"
              >
                <div>
                  <Label className="opacity-60 text-xs">Date</Label>
                  <div>{e.date}</div>
                </div>
                <div>
                  <Label className="opacity-60 text-xs">Category</Label>
                  <div>{e.category}</div>
                </div>
                <div>
                  <Label className="opacity-60 text-xs">Amount (€)</Label>
                  <div>€ {e.amount_eur.toFixed(2)}</div>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <Label className="opacity-60 text-xs">Note</Label>
                  <div className="truncate">{e.note ?? "-"}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {userRole !== "staff" && (
        <p className="text-xs opacity-60">
          Tip: Make sure you view Summary on the <span className="font-medium">same domain</span> as
          here (localStorage is origin-scoped).
        </p>
      )}
    </div>
  );
}
