import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";

type Expense = {
  id: string;
  date: string;       // YYYY-MM-DD
  category: string;
  amount_eur: number;
  note?: string | null;
  user_id?: string;   // returned by Supabase
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // ✅ Load from Supabase on mount
  useEffect(() => {
    loadExpenses();
  }, []);

  async function loadExpenses() {
    setLoading(true);
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("❌ Load expenses error:", error);
      alert("Failed to load expenses: " + error.message);
    } else {
      setExpenses((data ?? []) as Expense[]);
    }
    setLoading(false);
  }

  // ✅ Insert into Supabase with explicit user_id
  async function addExpense() {
    const trimmedCategory = category.trim();
    const amt = Number(amount);

    if (!trimmedCategory) return alert("Please enter a category.");
    if (!amount || Number.isNaN(amt) || amt < 0) return alert("Please enter a valid amount.");
    if (!date) return alert("Please choose a date.");

    const { data: userResp, error: userErr } = await supabase.auth.getUser();
    if (userErr) {
      console.error("❌ getUser error:", userErr);
      return alert("Auth error: " + userErr.message);
    }
    const user = userResp.user;
    if (!user) {
      return alert("You must be logged in to add expenses.");
    }

    const payload = {
      user_id: user.id,                // 🔑 required for RLS
      date,                            // YYYY-MM-DD
      category: trimmedCategory,
      amount_eur: amt,                 // numeric in DB
      note: note.trim() || null,
    };

    setLoading(true);
    const { data, error } = await supabase.from("expenses").insert([payload]).select("*");
    setLoading(false);

    if (error) {
      console.error("❌ Insert expense error:", error);
      return alert("Failed to save expense: " + error.message);
    }

    // Refresh list from DB to be certain
    await loadExpenses();

    // Reset form
    setCategory("");
    setAmount("");
    setNote("");
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Expenses</h1>
      <p className="text-sm text-muted-foreground">Track and manage business expenses</p>

      {/* Form */}
      <div className="grid gap-2 max-w-md">
        <Label>Date</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <Label>Category</Label>
        <Input
          placeholder="Fuel / Tools / Rent / Ads"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <Label>Amount (€)</Label>
        <Input
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <Label>Note (optional)</Label>
        <Input
          placeholder="Short note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <Button onClick={addExpense} disabled={loading}>
          {loading ? "Saving..." : "Save Expense"}
        </Button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {loading && expenses.length === 0 ? (
          <p>Loading…</p>
        ) : expenses.length === 0 ? (
          <p className="text-muted-foreground">No expenses yet.</p>
        ) : (
          expenses.map((e) => (
            <div key={e.id} className="border rounded-lg p-3 flex justify-between">
              <div>
                <strong>{e.category}</strong> — {e.date}
                <div className="text-sm opacity-70">{e.note || "-"}</div>
              </div>
              <div>€ {Number(e.amount_eur).toFixed(2)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
