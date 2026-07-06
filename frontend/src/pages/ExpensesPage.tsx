import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../lib/api";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

interface Expense {
  id: number; name: string; projected_amount: string;
  owner: number; owner_name: string; main_category: string;
  skips: { id: number; month_year: string }[];
}

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", projected_amount: "", main_category: "" });
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());

  const { data: expenses } = useQuery<Expense[]>({
    queryKey: ["expenses"], queryFn: () => api.get("/expenses/").then((r) => r.data),
  });

  const createExpense = useMutation({
    mutationFn: (data: typeof form) => api.post("/expenses/", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["expenses"] }); setShowAdd(false); setForm({ name: "", projected_amount: "", main_category: "" }); },
  });
  const deleteExpense = useMutation({
    mutationFn: (id: number) => api.delete(`/expenses/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });
  const toggleMonth = useMutation({
    mutationFn: ({ id, monthYear, active }: { id: number; monthYear: string; active: boolean }) =>
      api.post(`/expenses/${id}/toggle_month/`, { month_year: monthYear, active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });

  const isSkipped = (expense: Expense, month: number) =>
    expense.skips.some((s) => s.month_year === `${activeYear}-${String(month).padStart(2, "0")}-01`);

  const monthlyTotal = (month: number) =>
    expenses?.filter((e) => !isSkipped(e, month)).reduce((s, e) => s + parseFloat(e.projected_amount || "0"), 0) ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-100">Recurring Expenses</h2>
        <div className="flex gap-2 items-center">
          <input type="number" value={activeYear} onChange={(e) => setActiveYear(Number(e.target.value))}
            className="w-20 input-field text-center" />
          <button onClick={() => setShowAdd(!showAdd)} className="btn-primary">+ Add</button>
        </div>
      </div>

      {showAdd && (
        <div className="card p-4 mb-4 flex gap-3 items-end flex-wrap">
          <div><label className="text-xs text-gray-500">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input-field w-40 block mt-1" /></div>
          <div><label className="text-xs text-gray-500">Amount</label>
            <input type="number" step="0.01" value={form.projected_amount} onChange={(e) => setForm({...form, projected_amount: e.target.value})} className="input-field w-28 block mt-1" /></div>
          <div><label className="text-xs text-gray-500">Category</label>
            <input type="text" value={form.main_category} onChange={(e) => setForm({...form, main_category: e.target.value})} className="input-field w-32 block mt-1" /></div>
          <button onClick={() => createExpense.mutate(form)} disabled={!form.name || !form.projected_amount} className="btn-primary">Save</button>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-500 bg-navy-800">
              <th className="text-left px-4 py-2 font-medium text-gray-400">Expense</th>
              <th className="text-right px-3 py-2 font-medium text-gray-400 w-20">Amount</th>
              <th className="text-left px-3 py-2 font-medium text-gray-400 w-24">Category</th>
              {Array.from({length:12}, (_,i) => (
                <th key={i} className="text-center px-1.5 py-2 font-medium text-gray-400 w-8 text-xs">{MONTHS[i]}</th>
              ))}
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {expenses?.map((exp) => (
              <tr key={exp.id} className="border-b border-navy-500 hover:bg-navy-800/50">
                <td className="px-4 py-2 text-gray-200">{exp.name}</td>
                <td className="px-3 py-2 text-right text-gray-300">{exp.projected_amount}</td>
                <td className="px-3 py-2 text-xs text-gray-500">{exp.main_category}</td>
                {Array.from({length:12}, (_,i) => {
                  const month = i + 1;
                  const skipped = isSkipped(exp, month);
                  return (
                    <td key={i} className="text-center px-1.5 py-2">
                      <button onClick={() => toggleMonth.mutate({id: exp.id, monthYear: `${activeYear}-${String(month).padStart(2,"0")}-01`, active: skipped})}
                        className={`w-5 h-5 rounded text-xs transition-colors ${skipped ? "bg-navy-700 text-gray-500 hover:bg-red-400/20" : "bg-primary-500 text-white hover:bg-primary-600"}`}>
                        {skipped ? "-" : "v"}
                      </button>
                    </td>
                  );
                })}
                <td className="px-2 py-2">
                  <button onClick={() => deleteExpense.mutate(exp.id)} className="text-gray-500 hover:text-red-400 text-xs">x</button>
                </td>
              </tr>
            ))}
            <tr className="bg-navy-800 font-medium">
              <td className="px-4 py-2 text-xs text-gray-500" colSpan={2}>Monthly total</td>
              <td></td>
              {Array.from({length:12}, (_,i) => (
                <td key={i} className="text-center px-1.5 py-2 text-xs text-gray-400">{monthlyTotal(i + 1).toFixed(0)}</td>
              ))}
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
