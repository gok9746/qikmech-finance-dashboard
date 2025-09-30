import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type Expense = {
  id: string;
  date: string;       // YYYY-MM-DD
  category: string;   // Fuel, Tools, Insurance, etc.
  amount_eur: number;
  note?: string | null;
};

const STORAGE_KEY = "qm_expenses_v1";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  // Load from storage on first render
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setExpenses(JSON.parse(raw));
    } catch {}
  }, []);

  function saveExpenses(next: Expense[]) {
    setExpenses(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("qm:data-updated", { detail: { table: "expenses" } }));
  }

  function addExpense() {
    if (!category.trim() || !amount) return alert("Fill category and amount");

    const e: Expense = {
      id: crypto.randomUUID(),
      date,
      category: category.trim(),
      amount_eur: Number(amount),
      note: note.trim() || null,
    };

    saveExpenses([e, ...expenses]);

    // Reset form
    setCategory("");
    setAmount("");
    setNote("");
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Expenses</h1>

      {/* Add Expense Form */}
      <div className="grid gap-2 max-w-md">
        <Label>Date</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <Label>Category</Label>
        <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Fuel / Tools / Rent" />

        <Label>Amount (€)</Label>
        <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />

        <Label>Note</Label>
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />

        <Button onClick={addExpense}>Save Expense</Button>
      </div>

      {/* Expense List */}
      <div className="space-y-2">
        {expenses.length === 0 ? (
          <p className="text-muted-foreground">No expenses yet.</p>
        ) : (
          expenses.map((e) => (
            <div key={e.id} className="border rounded-lg p-3 flex justify-between">
              <div>
                <strong>{e.category}</strong> — {e.date}
                <div className="text-sm opacity-70">{e.note || "-"}</div>
              </div>
              <div>€ {e.amount_eur.toFixed(2)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
