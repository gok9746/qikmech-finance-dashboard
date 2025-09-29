import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// TODO: remove mock functionality - replace with real data
const mockMonthlyData = [
  { month: 'Jan', income: 12500, expenses: 8200 },
  { month: 'Feb', income: 14200, expenses: 9100 },
  { month: 'Mar', income: 11800, expenses: 7800 },
  { month: 'Apr', income: 16400, expenses: 10200 },
  { month: 'May', income: 18900, expenses: 11500 },
  { month: 'Jun', income: 15600, expenses: 9800 },
];

const mockExpenseData = [
  { name: 'Fuel', value: 3200, color: '#3b82f6' },
  { name: 'Tools', value: 2800, color: '#ef4444' },
  { name: 'Insurance', value: 1200, color: '#f59e0b' },
  { name: 'Parts', value: 4500, color: '#10b981' },
  { name: 'Other', value: 900, color: '#8b5cf6' },
];

export default function FinancialCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Income vs Expenses Line Chart */}
      <Card className="hover-elevate" data-testid="chart-monthly-income">
        <CardHeader>
          <CardTitle>Monthly Income vs Expenses</CardTitle>
          <CardDescription>Financial performance over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockMonthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                className="text-xs fill-muted-foreground"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-xs fill-muted-foreground"
                tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [`€${value.toLocaleString()}`, name === 'income' ? 'Income' : 'Expenses']}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="hsl(var(--chart-4))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-4))', strokeWidth: 2 }}
              />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Expense Breakdown Pie Chart */}
      <Card className="hover-elevate" data-testid="chart-expense-breakdown">
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>Distribution of business expenses by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockExpenseData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {mockExpenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`€${value.toLocaleString()}`, 'Amount']}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}