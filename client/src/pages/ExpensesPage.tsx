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

  // Load from storage on mount
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setExpenses(parsed);
      }
    } catch (err) {
      console.error("❌ Failed to load expenses from localStorage", err);
    }
  }, []);

  function saveExpenses(next: Expense[]) {
    console.log("💾 Writing to localStorage:", STORAGE_KEY, next);
    setExpenses(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    // Fire SAME-TAB event
    window.dispatchEvent(
      new CustomEvent("qm:data-updated", { detail: { table: "expenses" } })
    );
  }

  function addExpense(payload: {
    date: string;
    category: string;
    amount_eur: number | string;
    notes?: string;
  }) {
    console.log("🟢 addExpense called with payload:", payload);

    const e: Expense = {
      id: crypto.randomUUID(),
      date: payload.date,
      category: payload.category.trim(),
      amount_eur: Number(payload.amount_eur || 0), // ✅ force number
      note: payload.notes?.trim() ? payload.notes.trim() : null,
    };

    console.log("💾 New expense object:", e);

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
              <ExpenseForm
                onSubmit={addExpense}
                onCancel={() => setOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
                  <div>€ {Number(e.amount_eur).toFixed(2)}</div>
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
    </div>
  );
}
