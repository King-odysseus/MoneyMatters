import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/ledger": "Income & Savings Ledger",
  "/checklist": "Monthly Checklist",
  "/expenses": "Recurring Expenses",
  "/transactions": "Transactions",
  "/mortgage": "Mortgage Tracker",
  "/config": "Settings",
};

export default function Header() {
  const location = useLocation();
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const title = pageTitles[location.pathname] || "Money Matters";

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-navy-800 dark:bg-white border-b border-navy-600 dark:border-gray-200 shrink-0">
      <div>
        <h2 className="text-lg font-bold text-gray-100 dark:text-gray-800">{title}</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.display_name || user?.username}</p>
      </div>
      <div className="flex items-center gap-3">
        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className="relative w-12 h-6 rounded-full bg-navy-600 dark:bg-gray-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white dark:bg-primary-600 shadow-sm transition-transform duration-300 flex items-center justify-center ${
              theme === "dark" ? "translate-x-0" : "translate-x-6"
            }`}
          >
            {theme === "dark" ? (
              <svg className="w-3 h-3 text-navy-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            ) : (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            )}
          </span>
        </button>
      </div>
    </header>
  );
}
