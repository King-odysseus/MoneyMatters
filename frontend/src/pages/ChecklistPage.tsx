import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../lib/api";

interface ChecklistItem {
  id: number; name: string; projected_amount: string;
  actual_amount: string | null; is_paid: boolean;
  paid_date: string | null; notes: string; display_order: number;
}
interface Checklist {
  id: number; month_year: string; month_label: string; items: ChecklistItem[];
}

export default function ChecklistPage() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState("");

  const { data: checklist, isLoading } = useQuery<Checklist>({
    queryKey: ["checklist"],
    queryFn: () => api.get("/checklist/lists/current/").then((r) => r.data),
  });

  const addItem = useMutation({
    mutationFn: (data: { checklist_id: number; name: string; projected_amount: string; display_order: number }) =>
      api.post("/checklist/items/", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist"] });
      setNewName(""); setNewAmount("");
    },
  });

  const togglePaid = useMutation({
    mutationFn: ({ id, actual_amount }: { id: number; actual_amount?: string }) =>
      api.post(`/checklist/items/${id}/toggle_paid/`, actual_amount ? { actual_amount } : {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["checklist"] }),
  });

  const deleteItem = useMutation({
    mutationFn: (id: number) => api.delete(`/checklist/items/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["checklist"] }),
  });

  const updateAmount = useMutation({
    mutationFn: ({ id, actual_amount }: { id: number; actual_amount: string }) =>
      api.patch(`/checklist/items/${id}/`, { actual_amount }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["checklist"] }); setEditItemId(null); },
  });

  const handleAdd = () => {
    if (!newName.trim() || !checklist) return;
    addItem.mutate({
      checklist_id: checklist.id,
      name: newName.trim(),
      projected_amount: newAmount || "0",
      display_order: checklist.items.length,
    });
  };

  if (isLoading) return <div className="p-8 text-gray-400">Loading...</div>;

  const totalProjected = checklist?.items.reduce((s, i) => s + parseFloat(i.projected_amount || "0"), 0) ?? 0;
  const totalPaid = checklist?.items.filter((i) => i.is_paid).reduce((s, i) => s + parseFloat(i.actual_amount || i.projected_amount || "0"), 0) ?? 0;
  const remaining = checklist?.items.filter((i) => !i.is_paid).length ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Monthly Checklist</h2>
          <p className="text-sm text-gray-400 mt-0.5">{checklist?.month_label}</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="text-center">
            <p className="text-xs text-gray-400 uppercase">Projected</p>
            <p className="font-semibold text-gray-700">GBP {totalProjected.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 uppercase">Paid</p>
            <p className="font-semibold text-emerald-600">GBP {totalPaid.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 uppercase">Remaining</p>
            <p className="font-semibold text-amber-600">{remaining} items</p>
          </div>
        </div>
      </div>

      {/* Add new item */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-400 mb-1">Item name</label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Electricity bill"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
          </div>
          <div className="w-32">
            <label className="block text-xs text-gray-400 mb-1">Amount</label>
            <input type="number" step="0.01" value={newAmount} onChange={(e) => setNewAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
          </div>
          <button onClick={handleAdd}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
            Add Item
          </button>
        </div>
      </div>

      {/* Checklist items */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {checklist?.items.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No items yet. Add your first bill above.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {checklist?.items.map((item) => {
              const actual = item.actual_amount ?? item.projected_amount;
              const diff = parseFloat(actual) - parseFloat(item.projected_amount);
              const hasAdjustment = item.actual_amount !== null && item.actual_amount !== item.projected_amount;

              return (
                <div key={item.id} className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${item.is_paid ? "bg-gray-50" : "hover:bg-gray-50"}`}>
                  {/* Checkbox */}
                  <button
                    onClick={() => togglePaid.mutate({ id: item.id })}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                      item.is_paid
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-gray-300 hover:border-teal-400"
                    }`}
                  >
                    {item.is_paid && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  {/* Item info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${item.is_paid ? "text-gray-400 line-through" : "text-gray-800"}`}>
                      {item.name}
                    </p>
                    {item.notes && <p className="text-xs text-gray-400 mt-0.5">{item.notes}</p>}
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0 w-24">
                    {editItemId === item.id ? (
                      <div className="flex gap-1">
                        <input
                          type="number" step="0.01"
                          defaultValue={actual}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-20 px-2 py-1 border rounded text-right text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") updateAmount.mutate({ id: item.id, actual_amount: editAmount || actual });
                            if (e.key === "Escape") setEditItemId(null);
                          }}
                        />
                      </div>
                    ) : (
                      <div>
                        <p className={`text-sm font-semibold ${item.is_paid ? "text-gray-500" : "text-gray-700"}`}>
                          GBP {parseFloat(actual).toFixed(2)}
                        </p>
                        {hasAdjustment && (
                          <p className={`text-xs ${diff > 0 ? "text-red-500" : "text-emerald-500"}`}>
                            {diff > 0 ? "+" : ""}{diff.toFixed(2)} vs projected
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!item.is_paid && (
                      <button
                        onClick={() => { setEditItemId(item.id); setEditAmount(actual); }}
                        className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Adjust actual amount"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => deleteItem.mutate(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
