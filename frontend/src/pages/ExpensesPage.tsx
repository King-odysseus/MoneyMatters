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
    queryKey: ["expenses"],
    queryFn: () => api.get("/expenses/").then((r) => r.data),
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
        <h2 className="text-xl font-semibold text-gray-800">Recurring Expenses</h2>
        <div className="flex gap-2 items-center">
          <input type="number" value={activeYear} onChange={(e) => setActiveYear(Number(e.target.value))}
            className="w-20 px-2 py-1 border rounded text-sm text-center" />
          <button onClick={() => setShowAdd(!showAdd)}
            className="px-3 py-1.5 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 transition-colors">+ Add</button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border shadow-sm p-4 mb-4 flex gap-3 items-end flex-wrap">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
              className="px-2 py-1.5 border rounded text-sm w-40" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Amount</label>
            <input type="number" step="0.01" value={form.projected_amount} onChange={(e) => setForm({...form, projected_amount: e.target.value})}
              className="px-2 py-1.5 border rounded text-sm w-28" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Category</label>
            <input type="text" value={form.main_category} onChange={(e) => setForm({...form, main_category: e.target.value})}
              className="px-2 py-1.5 border rounded text-sm w-32" />
          </div>
          <button onClick={() => createExpense.mutate(form)} disabled={!form.name || !form.projected_amount}
            className="px-4 py-1.5 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 disabled:opacity-50">Save</button>
        </div>
      )}

      <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-2 font-medium text-gray-600">Expense</th>
              <th className="text-right px-3 py-2 font-medium text-gray-600 w-20">Amount</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600 w-24">Category</th>
              {Array.from({length:12}, (_,i) => (
                <th key={i} className="text-center px-1.5 py-2 font-medium text-gray-600 w-8 text-xs">{MONTHS[i]}</th>
              ))}
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {expenses?.map((exp) => (
              <tr key={exp.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{exp.name}</td>
                <td className="px-3 py-2 text-right">{exp.projected_amount}</td>
                <td className="px-3 py-2 text-xs text-gray-500">{exp.main_category}</td>
                {Array.from({length:12}, (_,i) => {
                  const month = i + 1;
                  const skipped = isSkipped(exp, month);
                  return (
                    <td key={i} className="text-center px-1.5 py-2">
                      <button onClick={() => toggleMonth.mutate({id: exp.id, monthYear: `${activeYear}-${String(month).padStart(2,"0")}-01`, active: skipped})}
                        className={`w-5 h-5 rounded text-xs ${skipped ? "bg-gray-200 text-gray-400 hover:bg-red-100" : "bg-primary-500 text-white hover:bg-primary-600"}`}>
                        {skipped ? "-" : "v"}
                      </button>
                    </td>
                  );
                })}
                <td className="px-2 py-2">
                  <button onClick={() => deleteExpense.mutate(exp.id)} className="text-red-400 hover:text-red-600 text-xs">x</button>
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-medium">
              <td className="px-4 py-2 text-xs text-gray-500" colSpan={2}>Monthly total</td>
              <td></td>
              {Array.from({length:12}, (_,i) => (
                <td key={i} className="text-center px-1.5 py-2 text-xs">{monthlyTotal(i + 1).toFixed(0)}</td>
              ))}
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
