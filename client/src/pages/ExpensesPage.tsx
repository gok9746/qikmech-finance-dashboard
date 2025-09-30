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

    try {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        alert("User not logged in!");
        setLoading(false);
        return;
      }

      const userId = userData.user.id;

      // Insert into DB
      const { error } = await supabase.from("expenses").insert([
        {
          user_id: userId,
          date,
          category,
          amount_eur: parseFloat(amount),
          note: note || null,
        },
      ]);

      if (error) {
        console.error("Insert failed:", error.message);
        alert("Failed to add expense: " + error.message);
      } else {
        // reset form
        setDate("");
        setCategory("");
        setAmount("");
        setNote("");
        if (onExpenseAdded) onExpenseAdded(); // refresh parent list
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Date</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>

      <div>
        <Label>Category</Label>
        <Input
          type="text"
          placeholder="Fuel, Tools, Insurance..."
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
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
        <Input
          type="text"
          placeholder="Optional note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Expense"}
      </Button>
    </form>
  );
}
