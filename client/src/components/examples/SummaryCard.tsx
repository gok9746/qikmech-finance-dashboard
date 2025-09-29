import SummaryCard from '../dashboard/SummaryCard';
import { BarChart3 } from 'lucide-react';

export default function SummaryCardExample() {
  return (
    <div className="p-4">
      <SummaryCard
        title="Net Profit"
        value={25430.50}
        icon={BarChart3}
        description="After VAT deduction"
        trend={{ value: 15.3, label: 'from last month' }}
      />
    </div>
  );
}