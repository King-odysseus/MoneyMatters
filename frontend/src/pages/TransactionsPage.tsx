import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../lib/api";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

interface Transaction {
  id: number; date: string; category: string; type: string;
  amount: string; notes: string; signed_amount: string; month_year: string;
  pot: number | null;
}

export default function TransactionsPage() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ date: "", category: "", type: "Expense", amount: "", notes: "", pot: "" });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: () => api.get("/transactions/").then((r) => r.data),
  });
  const { data: categories } = useQuery({
    queryKey: ["categories"], queryFn: () => api.get("/config/categories/").then(r => r.data),
  });
  const { data: pots } = useQuery({
    queryKey: ["pots"], queryFn: () => api.get("/config/pots/").then(r => r.data),
  });

  const createTxn = useMutation({
    mutationFn: (data: any) => api.post("/transactions/", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["transactions"] }); setShowAdd(false); setForm({ date: "", category: "", type: "Expense", amount: "", notes: "", pot: "" }); },
  });
  const deleteTxn = useMutation({
    mutationFn: (id: number) => api.delete(`/transactions/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });

  const grouped: Record<string, Transaction[]> = {};
  transactions?.forEach((t) => {
    const key = t.month_year?.slice(0, 7);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  });

  const needsPot = form.type.includes("Pot") || form.type.includes("pot");

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Transactions</h2>
        <button onClick={() => setShowAdd(!showAdd)}
          className="px-3 py-1.5 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 transition-colors">+ Add</button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-lg border shadow-sm p-4 mb-4">
          <div className="flex gap-3 items-end flex-wrap">
            <div><label className="block text-xs text-gray-500 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                className="px-2 py-1.5 border rounded text-sm" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="px-2 py-1.5 border rounded text-sm">
                <option>Expense</option><option>Refund</option>
                <option>Expense from Pot</option><option>Refund to Pot</option>
                <option>Interest earned to Pot</option><option>Interest earned main account</option>
              </select></div>
            <div><label className="block text-xs text-gray-500 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                className="px-2 py-1.5 border rounded text-sm">
                <option value="">--</option>
                {categories?.map((c: any) => <option key={c.id}>{c.name}</option>)}
              </select></div>
            <div><label className="block text-xs text-gray-500 mb-1">Amount</label>
              <input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
                className="px-2 py-1.5 border rounded text-sm w-28" /></div>
            {needsPot && (
              <div><label className="block text-xs text-gray-500 mb-1">Pot</label>
                <select value={form.pot} onChange={e => setForm({...form, pot: e.target.value})}
                  className="px-2 py-1.5 border rounded text-sm">
                  <option value="">--</option>
                  {pots?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select></div>
            )}
            <div><label className="block text-xs text-gray-500 mb-1">Notes</label>
              <input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                className="px-2 py-1.5 border rounded text-sm w-40" /></div>
            <button onClick={() => createTxn.mutate({...form, pot: form.pot || null})}
              disabled={!form.date || !form.amount}
              className="px-4 py-1.5 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 disabled:opacity-50">Save</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(grouped).sort(([a],[b]) => b.localeCompare(a)).map(([key, txns]) => {
          const d = new Date(key + "-01");
          const label = MONTHS[d.getMonth()] + " " + d.getFullYear();
          const monthTotal = txns.reduce((s, t) => s + parseFloat(t.signed_amount), 0);
          return (
            <div key={key} className="bg-white rounded-lg border shadow-sm">
              <div className="px-4 py-2 bg-gray-50 border-b flex justify-between items-center">
                <h3 className="font-medium text-sm">{label}</h3>
                <span className={`text-sm font-medium ${monthTotal < 0 ? "text-red-600" : "text-green-600"}`}>
                  Net: {monthTotal.toFixed(2)}
                </span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-gray-500">
                    <th className="px-4 py-1.5">Date</th><th className="px-4 py-1.5">Type</th>
                    <th className="px-4 py-1.5">Category</th><th className="px-4 py-1.5 text-right">Amount</th>
                    <th className="px-4 py-1.5">Notes</th><th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {txns.map((t) => (
                    <tr key={t.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-1.5 text-xs">{t.date}</td>
                      <td className="px-4 py-1.5 text-xs">{t.type}</td>
                      <td className="px-4 py-1.5 text-xs text-gray-500">{t.category}</td>
                      <td className={`px-4 py-1.5 text-xs text-right ${parseFloat(t.signed_amount) < 0 ? "text-red-600" : "text-gray-900"}`}>{t.amount}</td>
                      <td className="px-4 py-1.5 text-xs text-gray-400">{t.notes}</td>
                      <td className="px-2 py-1.5"><button onClick={() => deleteTxn.mutate(t.id)} className="text-red-400 hover:text-red-600 text-xs">x</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
        {Object.keys(grouped).length === 0 && (
          <div className="bg-white rounded-lg border p-8 text-gray-500 text-center">No transactions yet.</div>
        )}
      </div>
    </div>
  );
}
