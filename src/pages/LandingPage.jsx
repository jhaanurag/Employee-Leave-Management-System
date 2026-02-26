import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LandingPage = () => {
  const { isAuthenticated, defaultPath, user } = useAuth();

  if (isAuthenticated && user) {
    return <Navigate to={defaultPath} replace />;
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-rose-50 via-white to-amber-50">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700">
              Employee Leave Management
            </p>
            <p className="text-sm font-semibold text-slate-700">ELMS Portal</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-secondary px-4 py-2 text-sm">
              Sign In
            </Link>
            <Link to="/login" className="btn-primary px-4 py-2 text-sm">
              Register
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-20 md:px-6 md:py-28">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-600">
            Modern HR Workflows
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight text-slate-900 md:text-6xl">
            Leave approvals and reimbursements, handled in one place.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            A clean workflow for employees, managers, and admins to submit,
            review, and track requests with full transparency.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
