import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Calendar } from "lucide-react";

type SeriesPoint = { month: string; income: number; expenses: number };
type PieSlice = { name: string; value: number };

function euro(n: number) {
  return `€${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
const chartColor = (i: number) => `hsl(var(--chart-${((i % 5) + 1) as 1 | 2 | 3 | 4 | 5}))`;

export default function FinancialCharts({
  series = [],
  pie = [],
}: {
  series?: SeriesPoint[];
  pie?: PieSlice[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Income vs Expenses Line Chart */}
      <Card className="hover-elevate" data-testid="chart-monthly-income">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Monthly Income vs Expenses</CardTitle>
              <CardDescription>Financial performance over the last 6 months</CardDescription>
            </div>
            <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Last 6 months
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {series.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  className="text-xs fill-muted-foreground"
                  tickFormatter={(v: number) => `€${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [euro(value), name === "income" ? "Income" : "Expenses"]}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke={chartColor(0)}
                  strokeWidth={2}
                  dot={{ fill: chartColor(0), strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke={chartColor(3)}
                  strokeWidth={2}
                  dot={{ fill: chartColor(3), strokeWidth: 2 }}
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Expense Breakdown Pie Chart */}
      <Card className="hover-elevate" data-testid="chart-expense-breakdown">
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>Distribution of business expenses by category</CardDescription>
        </CardHeader>
        <CardContent>
          {pie.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pie}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pie.map((_, i) => (
                    <Cell key={i} fill={chartColor(i)} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [euro(value), "Amount"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-[300px] grid place-items-center border border-dashed rounded-md text-sm text-muted-foreground">
      No data yet.
    </div>
  );
}
