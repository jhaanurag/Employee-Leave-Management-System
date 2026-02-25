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
    <div className="px-4 pt-4 md:px-6 md:pt-6">
      <header className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">
              HR
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Leave Desk</h1>
          </div>
          <nav className="flex space-x-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive
                    ? "text-sm font-semibold text-brand-600 border-b-2 border-brand-600 pb-1"
                    : "text-sm font-medium text-slate-500 hover:text-slate-900 pb-1 transition-colors"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-900 truncate">{userName}</div>
            <div className="text-xs font-medium text-slate-500">{role}</div>
          </div>
          <button className="btn-secondary text-sm" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>
    </div>
  );
};

export default Sidebar;
