import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import DashboardPage from "../pages/DashboardPage";
import LedgerPage from "../pages/LedgerPage";

const navItems = [
  { path: "/", label: "Dashboard" },
  { path: "/ledger", label: "Ledger" },
  { path: "/expenses", label: "Expenses" },
  { path: "/transactions", label: "Transactions" },
  { path: "/mortgage", label: "Mortgage" },
  { path: "/config", label: "Settings" },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="flex h-screen">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-teal-700">Money Matters</h1>
          <p className="text-xs text-gray-500 mt-0.5">{user?.display_name || user?.username}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                location.pathname === item.path
                  ? "bg-teal-50 text-teal-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full px-3 py-2 text-sm text-left text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/ledger" element={<LedgerPage />} />
          <Route path="/expenses" element={<div className="p-8 text-gray-500">Expenses — coming soon</div>} />
          <Route path="/transactions" element={<div className="p-8 text-gray-500">Transactions — coming soon</div>} />
          <Route path="/mortgage" element={<div className="p-8 text-gray-500">Mortgage — coming soon</div>} />
          <Route path="/config" element={<div className="p-8 text-gray-500">Settings — coming soon</div>} />
        </Routes>
      </main>
    </div>
  );
}
