import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";

export type Expense = {
  id: string;
  date: string;
  category: string;
  amount_eur: number;
  note?: string | null;
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  // 🔹 Load from Supabase
  async function loadExpenses() {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false });
    if (error) {
      console.error("Load error:", error);
    } else {
      setExpenses(data as Expense[]);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  // 🔹 Add new expense
  async function addExpense() {
    if (!category.trim() || !amount) return alert("Fill category and amount");

    const { data, error } = await supabase.from("expenses").insert([
      {
        date,
        category: category.trim(),
        amount_eur: Number(amount),
        note: note.trim() || null,
        user_id: (await supabase.auth.getUser()).data.user?.id, // link to logged user
      },
    ]).select();

    if (error) {
      console.error("Insert error:", error);
      alert("Failed to save expense");
    } else {
      setExpenses([...(data as Expense[]), ...expenses]);
      setCategory("");
      setAmount("");
      setNote("");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Expenses</h1>

      {/* Form */}
      <div className="grid gap-2 max-w-md">
        <Label>Date</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <Label>Category</Label>
        <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Fuel / Rent / Ads" />

        <Label>Amount (€)</Label>
        <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />

        <Label>Note</Label>
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />

        <Button onClick={addExpense}>Save Expense</Button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {expenses.length === 0 ? (
          <p>No expenses yet.</p>
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
