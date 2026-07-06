import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

interface DashboardData {
  total_income_ytd: string;
  total_expenses_ytd: string;
  total_savings_ytd: string;
  net_cashflow_ytd: string;
  joint_account_balance: string;
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/dashboard/").then((r) => r.data),
  });

  if (isLoading) return <div className="p-8 text-gray-500">Loading dashboard...</div>;

  const cards = [
    { label: "Total Income (YTD)", value: data?.total_income_ytd || "0.00" },
    { label: "Total Expenses (YTD)", value: data?.total_expenses_ytd || "0.00" },
    { label: "Total Savings (YTD)", value: data?.total_savings_ytd || "0.00" },
    { label: "Net Cashflow (YTD)", value: data?.net_cashflow_ytd || "0.00" },
    { label: "Joint Account Balance", value: data?.joint_account_balance || "0.00" },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg border p-4 shadow-sm">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">GBP {card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
