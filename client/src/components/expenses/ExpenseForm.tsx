import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ExpenseForm({ onExpenseAdded }: { onExpenseAdded?: () => void }) {
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      alert("Not logged in!");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("expenses").insert([
      {
        user_id: userData.user.id,
        date,
        category,
        amount_eur: parseFloat(amount),
        note: note || null,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Error adding expense: " + error.message);
    } else {
      setDate("");
      setCategory("");
      setAmount("");
      setNote("");
      if (onExpenseAdded) onExpenseAdded();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Date</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>

      <div>
        <Label>Category</Label>
        <Input value={category} onChange={(e) => setCategory(e.target.value)} required />
      </div>

      <div>
        <Label>Amount (€)</Label>
        <Input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div>
        <Label>Note</Label>
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Expense"}
      </Button>
    </form>
  );
}
