import { NavLink } from "react-router-dom";

const navByRole = {
  Employee: [{ label: "Leaves & Claims", to: "/employee" }],
  Manager: [{ label: "Team Requests", to: "/manager" }],
  Admin: [{ label: "Operations", to: "/admin" }]
};

// the component is still called Sidebar for backwards compatibility,
// but it now renders a top navigation bar so the layout is completely different.
const Sidebar = ({ role, userName, onLogout }) => {
  const navItems = navByRole[role] || [];

  return (
    <header className="card w-full px-4 py-3 md:px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-4 md:gap-8">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">
              HR
            </div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 md:text-xl">Leave Desk</h1>
          </div>
          <nav className="flex flex-wrap gap-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive
                    ? "rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-700"
                    : "rounded-full px-3 py-1 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center justify-between gap-4 md:justify-end">
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-900 truncate">{userName}</div>
            <div className="text-xs font-medium text-slate-500">{role}</div>
          </div>
          <button className="btn-secondary text-sm" onClick={onLogout} type="button">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Sidebar;
