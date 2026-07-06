import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../lib/api";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"categories" | "pots" | "years" | "fx">("pots");
  const [newName, setNewName] = useState("");
  const [newYear, setNewYear] = useState(new Date().getFullYear());

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/config/categories/").then((r) => r.data),
  });
  const { data: pots } = useQuery({
    queryKey: ["pots"],
    queryFn: () => api.get("/config/pots/").then((r) => r.data),
  });
  const { data: years } = useQuery({
    queryKey: ["years"],
    queryFn: () => api.get("/config/years/").then((r) => r.data),
  });

  const createCategory = useMutation({
    mutationFn: (name: string) => api.post("/config/categories/", { name, display_order: 0 }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["categories"] }); setNewName(""); },
  });
  const createPot = useMutation({
    mutationFn: (name: string) => api.post("/config/pots/", { name, display_order: 0 }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["pots"] }); setNewName(""); },
  });
  const deleteCategory = useMutation({
    mutationFn: (id: number) => api.delete(`/config/categories/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
  const deletePot = useMutation({
    mutationFn: (id: number) => api.delete(`/config/pots/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pots"] }),
  });
  const createYear = useMutation({
    mutationFn: (year: number) => api.post("/config/years/", { year }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["years"] }); setNewYear(new Date().getFullYear()); },
  });

  const handleAdd = () => {
    if (!newName.trim()) return;
    if (activeTab === "categories") createCategory.mutate(newName.trim());
    else if (activeTab === "pots") createPot.mutate(newName.trim());
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Settings</h2>
      <div className="flex gap-2 mb-4">
        {(["pots", "categories", "years", "fx"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              activeTab === tab ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>
            {tab === "fx" ? "FX Rates" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border shadow-sm p-6">
        {(activeTab === "categories" || activeTab === "pots") && (
          <>
            <div className="flex gap-2 mb-4">
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder={activeTab === "pots" ? "New pot name" : "New category name"}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
              <button onClick={handleAdd}
                className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 transition-colors">
                Add
              </button>
            </div>
            <div className="space-y-1">
              {activeTab === "pots" && pots?.map((p: any) => (
                <div key={p.id} className="flex justify-between items-center px-3 py-2 rounded hover:bg-gray-50">
                  <span className="text-sm">{p.name}</span>
                  <button onClick={() => deletePot.mutate(p.id)}
                    className="text-red-500 text-xs hover:underline">Remove</button>
                </div>
              ))}
              {activeTab === "categories" && categories?.map((c: any) => (
                <div key={c.id} className="flex justify-between items-center px-3 py-2 rounded hover:bg-gray-50">
                  <span className="text-sm">{c.name}</span>
                  <button onClick={() => deleteCategory.mutate(c.id)}
                    className="text-red-500 text-xs hover:underline">Remove</button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "years" && (
          <>
            <div className="flex gap-2 mb-4">
              <input type="number" value={newYear} onChange={(e) => setNewYear(Number(e.target.value))}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <button onClick={() => createYear.mutate(newYear)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 transition-colors">
                Add Year
              </button>
            </div>
            <div className="space-y-1">
              {years?.map((y: any) => (
                <div key={y.id} className="flex justify-between items-center px-3 py-2 rounded hover:bg-gray-50">
                  <span className="text-sm">{y.year} {y.is_archived && "(archived)"}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "fx" && (
          <p className="text-sm text-gray-500">FX rate management coming soon.</p>
        )}
      </div>
    </div>
  );
}
