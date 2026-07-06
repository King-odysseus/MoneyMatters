import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../lib/api";

interface Pot { id: number; name: string; }
interface PotValue { id: number; pot: number; pot_name: string; amount: string; }
interface LedgerRow {
  id: number; year: number; year_label: number; month: number;
  joint_income: string; savings: string; monthly_expenses: string;
  pot_values: PotValue[];
}
interface Year { id: number; year: number; }

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function LedgerPage() {
  const queryClient = useQueryClient();
  const { data: years } = useQuery<Year[]>({ queryKey: ["years"], queryFn: () => api.get("/config/years/").then(r => r.data) });
  const { data: pots } = useQuery<Pot[]>({ queryKey: ["pots"], queryFn: () => api.get("/config/pots/").then(r => r.data) });
  const [activeYearId, setActiveYearId] = useState<number | null>(null);
  if (years && years.length > 0 && !activeYearId) setActiveYearId(years[0].id);

  const { data: rows } = useQuery<LedgerRow[]>({
    queryKey: ["ledger", activeYearId],
    queryFn: () => api.get(`/ledger/rows/by_year/?year_id=${activeYearId}`).then(r => r.data),
    enabled: !!activeYearId,
  });

  const updateIncome = useMutation({
    mutationFn: ({ id, joint_income }: { id: number; joint_income: string }) => api.patch(`/ledger/rows/${id}/`, { joint_income }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ledger", activeYearId] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-100">Income & Savings Ledger</h2>
        <div className="flex gap-1">
          {years?.map((y) => (
            <button key={y.id} onClick={() => setActiveYearId(y.id)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                y.id === activeYearId ? "bg-primary-600 text-white" : "bg-navy-800 text-gray-400 hover:bg-navy-600"
              }`}>{y.year}</button>
          ))}
        </div>
      </div>

      {!rows ? (
        <div className="card p-8 text-gray-500 text-center">
          {years?.length === 0 ? "Add a year in Settings to get started." : "Loading..."}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-500 bg-navy-800">
                <th className="text-left px-4 py-2 font-medium text-gray-400 w-16">Month</th>
                <th className="text-right px-4 py-2 font-medium text-gray-400">Joint Income</th>
                <th className="text-right px-4 py-2 font-medium text-gray-400">Expenses</th>
                <th className="text-right px-4 py-2 font-medium text-gray-400">Savings</th>
                {pots?.map((pot) => (
                  <th key={pot.id} className="text-right px-4 py-2 font-medium text-gray-400">{pot.name}</th>
                ))}
                <th className="text-right px-4 py-2 font-medium text-gray-400">Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const potMap = Object.fromEntries(row.pot_values.map((pv) => [pv.pot, pv.amount]));
                const ytdSavings = rows.filter((r) => r.month <= row.month).reduce((sum, r) => sum + parseFloat(r.savings || "0"), 0);
                return (
                  <tr key={row.id} className="border-b border-navy-500 hover:bg-navy-800/50">
                    <td className="px-4 py-2 font-medium text-gray-300">{MONTHS[row.month - 1]}</td>
                    <td className="px-4 py-2">
                      <input type="number" step="0.01" value={row.joint_income}
                        onChange={(e) => updateIncome.mutate({ id: row.id, joint_income: e.target.value })}
                        className="w-28 text-right input-field" />
                    </td>
                    <td className="px-4 py-2 text-right text-gray-400">{row.monthly_expenses}</td>
                    <td className={`px-4 py-2 text-right ${parseFloat(row.savings) < 0 ? "text-red-400" : "text-gray-200"}`}>{row.savings}</td>
                    {pots?.map((pot) => (
                      <td key={pot.id} className={`px-4 py-2 text-right ${parseFloat(potMap[pot.id] || "0") < 0 ? "text-red-400" : "text-gray-400"}`}>
                        {potMap[pot.id] || "0.00"}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-right font-medium text-gray-200">{ytdSavings.toFixed(2)}</td>
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
