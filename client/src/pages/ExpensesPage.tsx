import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search } from "lucide-react";
import ExpenseForm, { Expense } from "@/components/expenses/ExpenseForm";
import { supabase } from "@/lib/supabaseClient";

type Role = "admin" | "staff" | "accountant";

interface ExpensesPageProps {
  userRole: Role;
}

export default function ExpensesPage({ userRole }: ExpensesPageProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  // ✅ Load expenses from Supabase on mount
  useEffect(() => {
    loadExpenses();
  }, []);

  async function loadExpenses() {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error loading expenses:", error.message);
      return;
    }
    setExpenses(data as Expense[]);
  }

  // ✅ Save expense to Supabase
  async function addExpense(payload: {
    date: string;
    category: string;
    amount_eur: number;
    notes?: string;
  }) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      alert("You must be logged in to add expenses");
      return;
    }

    const newExpense = {
      date: payload.date,
      category: payload.category.trim(),
      amount_eur: Number(payload.amount_eur),
      note: payload.notes?.trim() || null,
      user_id: user.id, // ✅ link to logged-in user
    };

    const { error } = await supabase.from("expenses").insert([newExpense]);

    if (error) {
      console.error("Insert error:", error.message);
      alert("Failed to save expense: " + error.message);
      return;
    }

    setOpen(false);
    await loadExpenses(); // refresh list
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

          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Expense Form Dialog */}
      {open && (
        <div className="border p-4 rounded-lg">
          <ExpenseForm
            onSubmit={addExpense}
            onCancel={() => setOpen(false)}
          />
        </div>
      )}

      {/* Expense list */}
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
