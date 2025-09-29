import SummaryCard from '@/components/dashboard/SummaryCard';
import FinancialCharts from '@/components/charts/FinancialCharts';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Receipt, PiggyBank, Calculator } from 'lucide-react';

// TODO: remove mock functionality - replace with real calculations
const mockFinancialData = {
  worksCompleted: 127,
  incomeWithTax: 45620.50,
  incomeWithoutTax: 12340.75,
  totalPartsCost: 18450.25,
  otherExpenses: 8920.30,
  totalExpenses: 27370.55,
  profitBeforeTax: 30590.70,
  vatCollected: 10492.71,
  netProfit: 20097.99
};

interface SummaryPageProps {
  userRole: 'admin' | 'staff' | 'accountant';
}

export default function SummaryPage({ userRole }: SummaryPageProps) {
  const data = mockFinancialData;
  
  return (
    <div className="p-6 space-y-6" data-testid="page-summary">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Summary</h1>
          <p className="text-muted-foreground">Overview of business performance and metrics</p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Works Completed"
          value={data.worksCompleted}
          icon={BarChart3}
          description="Total jobs finished"
          trend={{ value: 12, label: 'from last month' }}
        />
        
        <SummaryCard
          title="Total Income"
          value={data.incomeWithTax + data.incomeWithoutTax}
          icon={TrendingUp}
          description="Revenue with & without tax"
          trend={{ value: 8.5, label: 'from last month' }}
        />
        
        <SummaryCard
          title="Total Expenses"
          value={data.totalExpenses}
          icon={TrendingDown}
          description="Parts + operational costs"
          trend={{ value: -2.1, label: 'from last month' }}
        />
        
        <SummaryCard
          title="Net Profit"
          value={data.netProfit}
          icon={PiggyBank}
          description="After VAT deduction"
          trend={{ value: 15.3, label: 'from last month' }}
        />
      </div>

      {/* Detailed Financial Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryCard
          title="Income (With Tax)"
          value={data.incomeWithTax}
          icon={DollarSign}
          description="Jobs with 23% VAT applied"
        />
        
        <SummaryCard
          title="Income (Without Tax)"
          value={data.incomeWithoutTax}
          icon={DollarSign}
          description="Jobs without VAT"
        />
        
        <SummaryCard
          title="Parts Cost"
          value={data.totalPartsCost}
          icon={Receipt}
          description="Total parts expenses"
        />
        
        <SummaryCard
          title="Other Expenses"
          value={data.otherExpenses}
          icon={Receipt}
          description="Fuel, tools, insurance, etc."
        />
        
        <SummaryCard
          title="Profit Before Tax"
          value={data.profitBeforeTax}
          icon={Calculator}
          description="Total income - total expenses"
        />
        
        <SummaryCard
          title="VAT Collected"
          value={data.vatCollected}
          icon={Calculator}
          description="23% VAT on applicable jobs"
        />
      </div>

      {/* Financial Charts */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Financial Analytics</h2>
        <FinancialCharts />
      </div>
    </div>
  );
}