import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  LineChart, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area, ComposedChart, Legend,
} from "recharts";
import api from "../lib/api";

interface KpiCard {
  id: number; name: string; ytd_total: string; color: string;
  monthly_data: { month: number; month_label: string; amount: string }[];
}
interface TrendPoint {
  month: number; month_label: string; income: string; expenses: string;
  savings: string; cumulative_savings: string;
}
interface RecentTxn {
  id: number; date: string; type: string; category: string;
  amount: string; signed_amount: string; notes: string;
}
interface DashboardData {
  kpi_cards: KpiCard[];
  total_income_ytd: string; total_expenses_ytd: string;
  total_savings_ytd: string; net_cashflow_ytd: string;
  monthly_trend: TrendPoint[];
  recent_transactions: RecentTxn[];
  available_years: number[];
  current_year: number;
}

type Period = "year" | "month" | "week" | "day";

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("year");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard", period, selectedYear],
    queryFn: () => api.get("/dashboard/", {
      params: { period, year: selectedYear },
    }).then((r) => r.data),
  });

  if (!selectedYear && data?.current_year) setSelectedYear(data.current_year);
  if (isLoading || !data) return (
    <div className="flex items-center justify-center h-64 text-gray-400">Loading dashboard...</div>
  );

  const summaryCards = [
    { label: "Total Income", value: data.total_income_ytd, color: "bg-primary-500", ring: "ring-primary-500" },
    { label: "Total Expenses", value: data.total_expenses_ytd, color: "bg-red-500", ring: "ring-red-500" },
    { label: "Net Cashflow", value: data.net_cashflow_ytd, color: "bg-emerald-500", ring: "ring-emerald-500" },
    { label: "Total Savings", value: data.total_savings_ytd, color: "bg-violet-500", ring: "ring-violet-500" },
  ];

  const trendData = data.monthly_trend.map((t) => ({
    ...t,
    income: parseFloat(t.income),
    expenses: parseFloat(t.expenses),
    savings: parseFloat(t.savings),
  }));

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <div className="flex items-center gap-3">
          {/* Year selector */}
          <select
            value={selectedYear ?? ""}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {data.available_years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {/* Period filter */}
          <div className="flex rounded-lg border border-gray-200 bg-white p-0.5">
            {(["year", "month", "week", "day"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                  period === p ? "bg-primary-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">GBP {parseFloat(card.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <div className={`mt-3 h-1 rounded-full ${card.color} w-full`} />
          </div>
        ))}
      </div>

      {/* Pot Performance Cards */}
      {data.kpi_cards.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Savings Pots</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.kpi_cards.map((pot) => {
              const sparkData = pot.monthly_data.map((m) => ({
                month: m.month_label,
                amount: parseFloat(m.amount),
              }));
              return (
                <div key={pot.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{pot.name}</span>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pot.color }} />
                  </div>
                  <p className="text-xl font-bold text-gray-900">GBP {parseFloat(pot.ytd_total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  <div className="mt-3 h-16">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`grad-${pot.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={pot.color} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={pot.color} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="amount" stroke={pot.color} fill={`url(#grad-${pot.id})`} strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Charts + Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Income vs Expenses Chart */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Income vs Expenses</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month_label" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                <Line type="monotone" dataKey="savings" name="Savings" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: "#10b981" }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="lg:col-span-2 space-y-4">
          {/* Pot Distribution */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Pot Distribution</h3>
            <div className="space-y-3">
              {data.kpi_cards.map((pot) => {
                const maxVal = Math.max(...data.kpi_cards.map((p) => Math.abs(parseFloat(p.ytd_total))), 1);
                const pct = (Math.abs(parseFloat(pot.ytd_total)) / maxVal) * 100;
                return (
                  <div key={pot.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">{pot.name}</span>
                      <span className="font-medium">GBP {parseFloat(pot.ytd_total).toFixed(0)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: pot.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {data.recent_transactions.slice(0, 6).map((txn) => (
                <div key={txn.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{txn.type}</p>
                    <p className="text-xs text-gray-400">{txn.date} {txn.notes && `- ${txn.notes}`}</p>
                  </div>
                  <span className={`text-xs font-semibold ml-2 ${parseFloat(txn.signed_amount) < 0 ? "text-red-500" : "text-emerald-500"}`}>
                    {parseFloat(txn.signed_amount) < 0 ? "-" : "+"}GBP {Math.abs(parseFloat(txn.amount)).toFixed(2)}
                  </span>
                </div>
              ))}
              {data.recent_transactions.length === 0 && (
                <p className="text-xs text-gray-400 py-2">No transactions yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pot Trend Charts */}
      {data.kpi_cards.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Pot Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month_label" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                  allowDuplicatedCategory={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                <Legend />
                {data.kpi_cards.map((pot) => (
                  <Line key={pot.id} data={pot.monthly_data.map((m) => ({ month_label: m.month_label, amount: parseFloat(m.amount) }))}
                    type="monotone" dataKey="amount" name={pot.name} stroke={pot.color} strokeWidth={2}
                    dot={{ r: 3 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
