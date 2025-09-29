import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface ExpenseFormProps {
  onSubmit: (expense: {
    date: string;
    category: string;
    amount_eur: number;
    notes: string;
  }) => void;
}

const EXPENSE_CATEGORIES = ['Fuel', 'Tools', 'Insurance', 'Ads', 'Office Supplies', 'Utilities', 'Other'];

export default function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    amount_eur: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.amount_eur) return;
    
    setIsSubmitting(true);
    
    // TODO: remove mock functionality
    setTimeout(() => {
      onSubmit({
        ...formData,
        amount_eur: parseFloat(formData.amount_eur)
      });
      console.log('Expense submitted', formData);
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: '',
        amount_eur: '',
        notes: ''
      });
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <Card className="hover-elevate" data-testid="form-expense">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Expense
        </CardTitle>
        <CardDescription>Record a business expense for tracking</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                data-testid="input-expense-date"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger data-testid="select-expense-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (€)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.amount_eur}
              onChange={(e) => setFormData(prev => ({ ...prev, amount_eur: e.target.value }))}
              data-testid="input-expense-amount"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional details about this expense..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              data-testid="input-expense-notes"
              rows={3}
            />
          </div>
          
          <Button type="submit" disabled={isSubmitting} className="w-full" data-testid="button-submit-expense">
            {isSubmitting ? 'Adding Expense...' : 'Add Expense'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}