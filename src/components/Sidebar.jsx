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
    <header className="w-full bg-gradient-to-r from-purple-800 to-indigo-600 p-4 text-white flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <h1 className="text-2xl font-bold tracking-tight">Leave Desk</h1>
        <nav className="flex space-x-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive
                  ? "underline text-white"
                  : "text-gray-200 hover:text-white"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <div className="font-semibold text-gray-200 truncate">{userName}</div>
          <div className="text-xs text-gray-400">{role}</div>
        </div>
        <button className="btn-ghost text-white" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Sidebar;
