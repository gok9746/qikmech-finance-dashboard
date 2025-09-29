import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

const d = (x: Date) => x.toISOString().slice(0, 10);

export type Summary = {
  total_jobs_finished: number;
  income_without_tax: number;
  income_with_tax: number;
  parts_cost: number;
  other_expenses: number;
  vat_collected: number;
  profit_before_tax: number;
};

export function useDashboardSummary(from: Date, to: Date) {
  return useQuery({
    queryKey: ["dashboard_summary", d(from), d(to)],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("dashboard_summary", {
        p_from: d(from),
        p_to: d(to),
      });
      if (error) throw error;
      return (data?.[0] ?? {}) as Summary;
    },
  });
}

export type SeriesPoint = { month: string; income_without_tax: number; expenses_total: number };

export function useDashboardTimeseries(from: Date, to: Date) {
  return useQuery({
    queryKey: ["dashboard_timeseries", d(from), d(to)],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("dashboard_timeseries", {
        p_from: d(from),
        p_to: d(to),
      });
      if (error) throw error;
      return (data ?? []) as SeriesPoint[];
    },
  });
}

export type ExpenseSlice = { category: string; total: number };

export function useExpensesBreakdown(from: Date, to: Date) {
  return useQuery({
    queryKey: ["expenses_breakdown", d(from), d(to)],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("expenses_breakdown", {
        p_from: d(from),
        p_to: d(to),
      });
      if (error) throw error;
      return (data ?? []) as ExpenseSlice[];
    },
  });
}
