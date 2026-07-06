import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RegisterPage() {
  const { user, register } = useAuth();
  const [form, setForm] = useState({
    username: "", email: "", password: "",
    display_name: "", household_name: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form);
    } catch (err: any) {
      const msg = err.response?.data?.detail || Object.values(err.response?.data || {}).flat().join(" ") || "Registration failed.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-8">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-sm border p-8">
        <h1 className="text-xl font-semibold text-center text-primary-700 mb-6">Create your household</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Household name</label>
            <input type="text" required value={form.household_name} onChange={update("household_name")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
            <input type="text" required value={form.display_name} onChange={update("display_name")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={form.email} onChange={update("email")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" required value={form.username} onChange={update("username")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required value={form.password} onChange={update("password")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full bg-primary-600 text-white py-2 rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
            {submitting ? "Creating..." : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-500">
          Already have an account? <Link to="/login" className="text-primary-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
