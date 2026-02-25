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
    <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 md:px-6">
      <div className="grid w-full gap-4 md:grid-cols-[1fr_420px]">
        <section className="card hidden p-8 md:block">
          <div className="max-w-md animate-fade-in-up">
            <p className="page-kicker">Employee Leave Management</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight text-gray-100">
              A cleaner way to manage leave workflows.
            </h1>
            <p className="mt-4 text-sm leading-6 text-gray-300">
              Apply, review, and manage leave requests with role-based dashboards and policy-driven controls.
            </p>
            <div className="mt-8 space-y-3">
              <div className="card-muted p-3">
                <p className="text-sm font-semibold text-gray-300">Role-aware access</p>
                <p className="mt-1 text-xs text-gray-300">
                  Admin, manager, and employee experiences are separated by policy.
                </p>
              </div>
              <div className="card-muted p-3">
                <p className="text-sm font-semibold text-gray-300">Live leave balance</p>
                <p className="mt-1 text-xs text-gray-300">
                  Employees see remaining balance and request limits before applying.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="card w-full p-8 animate-soft-pop">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-lg font-extrabold text-white shadow-surface">
              HR
            </div>
            <h2 className="text-2xl font-extrabold text-gray-100">
              {isRegisterMode ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              {isRegisterMode
                ? "Create your account to access the leave portal."
                : "Sign in to continue to your dashboard."}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-rose-600 bg-rose-800 px-4 py-3 text-sm font-semibold text-rose-100">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegisterMode && (
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-300">
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
              <label className="mb-1 block text-sm font-semibold text-gray-300">
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
                  className="text-xs font-semibold text-brand-700 hover:text-brand-600"
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
                  : "Login"}
            </button>
          </form>

          <button
            type="button"
            className="mt-4 w-full text-sm font-semibold text-brand-700 hover:text-brand-600"
            onClick={() => setIsRegisterMode((current) => !current)}
          >
            {isRegisterMode
              ? "Already have an account? Login"
              : "New here? Register account"}
          </button>

          <p className="mt-6 text-center text-xs text-slate-500">

          </p>
        </section>
      </div>
    </div>
  );
};

export default Login;
