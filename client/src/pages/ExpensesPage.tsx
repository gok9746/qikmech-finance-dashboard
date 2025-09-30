import React, { useEffect, useState } from "react";
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

type Expense = {
  id: string;
  date: string;        // YYYY-MM-DD
  category: string;    // Fuel, Tools, Insurance, Rent, Ads, Other, ...
  amount_eur: number;
  note?: string | null;
};

interface ExpensesPageProps {
  userRole: "admin" | "staff" | "accountant";
}

const STORAGE_KEY = "qm_expenses_v1";

export default function ExpensesPage({ userRole }: ExpensesPageProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [q, setQ] = useState("");

  // Dialog state
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [note, setNote] = useState("");

  // Load on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Expense[];
        if (Array.isArray(parsed)) setExpenses(parsed);
      }
    } catch {}
  }, []);

  // Persist on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const reset = () => {
    setDate(new Date().toISOString().slice(0, 10));
    setCategory("");
    setAmount("");
    setNote("");
  };

  const addExpense = () => {
    if (!category.trim() || !date) return;
    const e: Expense = {
      id: crypto.randomUUID(),
      date,
      category: category.trim(),
      amount_eur: Number(amount || 0),
      note: note.trim() ? note.trim() : null,
    };

    const updated = [e, ...expenses];
    setExpenses(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // ✅ Manually trigger a storage event so SummaryPage updates in same tab
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));

    reset();
    setOpen(false);

    // 🔄 Later: replace with Supabase insert
    // await supabase.from("expenses").insert([e]);
  };

  const filtered = expenses.filter((e) => {
    const qq = q.toLowerCase();
    return (
      e.category.toLowerCase().includes(qq) ||
      (e.note?.toLowerCase().includes(qq) ?? false)
    );
  });

  const currency = (n: number) =>
    `€${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  const total = filtered.reduce((s, e) => s + e.amount_eur, 0);

  return (
    <div className="p-6 space-y-6" data-testid="page-expenses">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground">
            Track operational expenses (fuel, tools, insurance, etc.)
          </p>
        </div>

        {(userRole === "admin" || userRole === "accountant") && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button type="button">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Expense</DialogTitle>
              </DialogHeader>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Input
                    placeholder="Fuel / Tools / Insurance / Rent / Ads / Other"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Amount (EUR)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value === "" ? "" : +e.target.value)
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Note (optional)</Label>
                  <Input
                    placeholder="short note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      reset();
                      setOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={addExpense}>
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search category or note…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Total: <span className="font-medium">{currency(total)}</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          No expenses yet. Click{" "}
          <span className="font-medium">Add Expense</span> to create your first
          one.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Category</th>
                <th className="text-right p-3">Amount</th>
                <th className="text-left p-3">Note</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="p-3">
                    {new Date(e.date).toLocaleDateString()}
                  </td>
                  <td className="p-3">{e.category}</td>
                  <td className="p-3 text-right">{currency(e.amount_eur)}</td>
                  <td className="p-3">{e.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
