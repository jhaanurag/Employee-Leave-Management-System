import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleRouteMap = {
  Admin: "/admin",
  Manager: "/manager",
  Employee: "/employee"
};

const Login = () => {
  const { isAuthenticated, defaultPath, login, register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated && user) {
    return <Navigate to={defaultPath} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const nextUser = isRegisterMode
        ? await register(form.name, form.email, form.password)
        : await login(form.email, form.password);

      const fallbackPath = roleRouteMap[nextUser.role] || "/login";
      const redirectPath = location.state?.from || fallbackPath;
      navigate(redirectPath, { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Authentication failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 md:px-6">
      <div className="grid w-full gap-5 md:grid-cols-[1.05fr_420px]">
        <section className="hidden overflow-hidden rounded-3xl border border-rose-200 bg-gradient-to-br from-brand-500 via-brand-600 to-rose-400 p-8 text-white shadow-xl shadow-rose-200/70 md:flex md:flex-col md:justify-between">
          <div className="max-w-md animate-fade-in-up">
            <p className="text-xs font-bold uppercase tracking-widest text-rose-100">Employee Leave Management</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight text-white">
              Faster leave approvals with cleaner operations.
            </h1>
            <p className="mt-4 text-sm leading-6 text-rose-50/95">
              One portal for employees, managers, and admins with policy-first workflows and complete request visibility.
            </p>
          </div>
          <div className="mt-8 grid gap-3">
            <div className="rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur-sm">
              <p className="text-sm font-semibold text-white">Role-aware dashboards</p>
              <p className="mt-1 text-xs text-rose-50/95">
                Screen access and actions change automatically based on role.
              </p>
            </div>
            <div className="rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur-sm">
              <p className="text-sm font-semibold text-white">Live request intelligence</p>
              <p className="mt-1 text-xs text-rose-50/95">
                Track leave balance, claims, and analytics in real time.
              </p>
            </div>
          </div>
        </section>

        <section className="card w-full rounded-3xl p-7 animate-soft-pop md:p-8">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-lg font-extrabold text-white shadow-lg shadow-brand-200/60">
              HR
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {isRegisterMode ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {isRegisterMode
                ? "Create your account to access the leave portal."
                : "Sign in to continue to your dashboard."}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegisterMode && (
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <input
                  className="input-field"
                  type="text"
                  name="name"
                  placeholder="John Carter"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                className="input-field"
                type="email"
                name="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  className="rounded-md px-2 py-1 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 hover:text-brand-600"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                className="input-field"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={handleChange}
                minLength={8}
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading
                ? "Please wait..."
                : isRegisterMode
                  ? "Create Account"
                  : "Sign In"}
            </button>
          </form>

          <button
            type="button"
            className="mt-4 w-full rounded-xl border border-brand-100 bg-brand-50/70 px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-100/80"
            onClick={() => setIsRegisterMode((current) => !current)}
          >
            {isRegisterMode
              ? "Already have an account? Sign In"
              : "New here? Register account"}
          </button>
        </section>
      </div>
    </div>
  );
};

export default Login;
