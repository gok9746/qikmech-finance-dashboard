import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type Expense = {
  id: string;
  date: string;        // YYYY-MM-DD
  category: string;    // Fuel, Tools, Insurance, Rent, Ads, Other, ...
  amount_eur: number;
  note?: string | null;
};

type ExpenseFormProps = {
  defaultValues?: Partial<Pick<Expense, "date" | "category" | "amount_eur" | "note">>;
  onSubmit: (payload: { date: string; category: string; amount_eur: number; notes?: string }) => void;
  onCancel?: () => void;
};

export default function ExpenseForm({ defaultValues, onSubmit, onCancel }: ExpenseFormProps) {
  const [date, setDate] = React.useState(
    defaultValues?.date ?? new Date().toISOString().slice(0, 10)
  );
  const [category, setCategory] = React.useState(defaultValues?.category ?? "");
  const [amount, setAmount] = React.useState<string>(
    defaultValues?.amount_eur != null ? String(defaultValues.amount_eur) : ""
  );
  const [notes, setNotes] = React.useState(defaultValues?.note ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("✅ ExpenseForm handleSubmit fired"); // debug log

    const amt = Number(amount);
    if (!date) return alert("Please choose a date.");
    if (!category.trim()) return alert("Please enter a category.");
    if (Number.isNaN(amt) || amt < 0) return alert("Please enter a valid amount.");

    onSubmit({
      date,
      category: category.trim(),
      amount_eur: amt,
      notes: notes?.toString() ?? "",
    });

    // reset form after save
    setCategory("");
    setAmount("");
    setNotes("");
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="exp-date">Date</Label>
        <Input
          id="exp-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="exp-category">Category</Label>
        <Input
          id="exp-category"
          placeholder="Fuel / Tools / Insurance / Rent / Ads / Other"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="exp-amount">Amount (€)</Label>
        <Input
          id="exp-amount"
          type="number"
          step="0.01"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="exp-notes">Notes (optional)</Label>
        <Input
          id="exp-notes"
          placeholder="Short note"
          value={notes ?? ""}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit" // 👈 explicitly submit
          onClick={() => console.log("🖱️ Save Expense button clicked")}
        >
          Save Expense
        </Button>
      </div>
    </form>
  );
}
