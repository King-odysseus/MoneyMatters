import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../lib/api";

interface Pot { id: number; name: string; display_order: number; }
interface PotValue { id: number; pot: number; pot_name: string; amount: string; }
interface LedgerRow {
  id: number; year: number; year_label: number; month: number;
  joint_income: string; savings: string; monthly_expenses: string;
  pot_values: PotValue[];
}
interface Year { id: number; year: number; is_archived: boolean; }

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function LedgerPage() {
  const queryClient = useQueryClient();

  const { data: years } = useQuery<Year[]>({
    queryKey: ["years"], queryFn: () => api.get("/config/years/").then(r => r.data),
  });
  const { data: pots } = useQuery<Pot[]>({
    queryKey: ["pots"], queryFn: () => api.get("/config/pots/").then(r => r.data),
  });

  const [activeYearId, setActiveYearId] = useState<number | null>(null);

  // Auto-select first year
  if (years && years.length > 0 && !activeYearId) {
    setActiveYearId(years[0].id);
  }

  const { data: rows } = useQuery<LedgerRow[]>({
    queryKey: ["ledger", activeYearId],
    queryFn: () => api.get(`/ledger/rows/by_year/?year_id=${activeYearId}`).then(r => r.data),
    enabled: !!activeYearId,
  });

  const updateIncome = useMutation({
    mutationFn: ({ id, joint_income }: { id: number; joint_income: string }) =>
      api.patch(`/ledger/rows/${id}/`, { joint_income }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ledger", activeYearId] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Income & Savings Ledger</h2>
        {years && years.length > 0 && (
          <div className="flex gap-1">
            {years.map((y) => (
              <button key={y.id} onClick={() => setActiveYearId(y.id)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  y.id === activeYearId ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                {y.year}
              </button>
            ))}
          </div>
        )}
      </div>

      {!rows ? (
        <div className="bg-white rounded-lg border p-8 text-gray-500 text-center">
          {years?.length === 0 ? "Add a year in Settings to get started." : "Loading..."}
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-2 font-medium text-gray-600 w-16">Month</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600">Joint Income</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600">Expenses</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600">Savings</th>
                {pots?.map((pot) => (
                  <th key={pot.id} className="text-right px-4 py-2 font-medium text-gray-600">{pot.name}</th>
                ))}
                <th className="text-right px-4 py-2 font-medium text-gray-600">Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const potMap = Object.fromEntries(row.pot_values.map((pv) => [pv.pot, pv.amount]));
                const ytdSavings = rows
                  .filter((r) => r.month <= row.month)
                  .reduce((sum, r) => sum + parseFloat(r.savings || "0"), 0);

                return (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{MONTHS[row.month - 1]}</td>
                    <td className="px-4 py-2">
                      <input type="number" step="0.01" value={row.joint_income}
                        onChange={(e) => updateIncome.mutate({ id: row.id, joint_income: e.target.value })}
                        className="w-28 text-right px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-500" />
                    </td>
                    <td className="px-4 py-2 text-right text-gray-600">{row.monthly_expenses}</td>
                    <td className={`px-4 py-2 text-right ${parseFloat(row.savings) < 0 ? "text-red-600" : "text-gray-900"}`}>
                      {row.savings}
                    </td>
                    {pots?.map((pot) => (
                      <td key={pot.id} className={`px-4 py-2 text-right ${parseFloat(potMap[pot.id] || "0") < 0 ? "text-red-600" : "text-gray-600"}`}>
                        {potMap[pot.id] || "0.00"}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-right font-medium">{ytdSavings.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
