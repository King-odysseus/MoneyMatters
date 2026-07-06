import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RegisterPage() {
  const { user, register } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "", display_name: "", household_name: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  if (user) return <Navigate to="/" replace />;

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setError(""); setSubmitting(true);
    try { await register(form); }
    catch (err: any) {
      const msg = err.response?.data?.detail || Object.values(err.response?.data || {}).flat().join(" ") || "Registration failed.";
      setError(msg);
    } finally { setSubmitting(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-700 py-8">
      <div className="w-full max-w-sm card p-8">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <h1 className="text-xl font-bold text-gray-100">Create your household</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-sm text-red-400 bg-red-400/10 p-2 rounded-lg">{error}</p>}
          <input type="text" required value={form.household_name} onChange={update("household_name")} placeholder="Household name" className="input-field w-full" />
          <input type="text" required value={form.display_name} onChange={update("display_name")} placeholder="Your name" className="input-field w-full" />
          <input type="email" required value={form.email} onChange={update("email")} placeholder="Email" className="input-field w-full" />
          <input type="text" required value={form.username} onChange={update("username")} placeholder="Username" className="input-field w-full" />
          <input type="password" required value={form.password} onChange={update("password")} placeholder="Password (min 8 characters)" className="input-field w-full" />
          <button type="submit" disabled={submitting} className="btn-primary w-full">{submitting ? "Creating..." : "Create account"}</button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-500">
          Already have an account? <Link to="/login" className="text-primary-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
