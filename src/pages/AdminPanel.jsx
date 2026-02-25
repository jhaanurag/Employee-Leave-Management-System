import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LeaveCard from "../components/LeaveCard";
import LeaveTable from "../components/LeaveTable";
import ReimbursementTable from "../components/ReimbursementTable";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const roleOptions = ["Admin", "Manager", "Employee"];
const roleFilters = ["All", ...roleOptions];

const emptyUserForm = {
  name: "",
  email: "",
  password: "",
  role: "Employee"
};

const emptyLeaveSummary = {
  Pending: 0,
  Approved: 0,
  Rejected: 0,
  Cancelled: 0
};

const emptyReimbursementSummary = {
  Pending: 0,
  Approved: 0,
  Rejected: 0,
  Cancelled: 0,
  totalAmount: 0,
  approvedAmount: 0,
  pendingAmount: 0
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(amount || 0));

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [reimbursements, setReimbursements] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingLeaves, setLoadingLeaves] = useState(true);
  const [loadingReimbursements, setLoadingReimbursements] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [leaveSummary, setLeaveSummary] = useState(emptyLeaveSummary);
  const [reimbursementSummary, setReimbursementSummary] = useState(
    emptyReimbursementSummary
  );

  const [activeSection, setActiveSection] = useState("leave");

  const roleCount = useMemo(
    () =>
      users.reduce(
        (acc, current) => {
          acc[current.role] = (acc[current.role] || 0) + 1;
          return acc;
        },
        { Admin: 0, Manager: 0, Employee: 0 }
      ),
    [users]
  );

  const filteredUsers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return users.filter((tableUser) => {
      const matchesRole =
        selectedRole === "All" ? true : tableUser.role === selectedRole;
      const matchesQuery = normalizedQuery
        ? tableUser.name.toLowerCase().includes(normalizedQuery) ||
          tableUser.email.toLowerCase().includes(normalizedQuery)
        : true;

      return matchesRole && matchesQuery;
    });
  }, [searchQuery, selectedRole, users]);

  const recentLeaves = useMemo(() => leaves.slice(0, 6), [leaves]);
  const recentReimbursements = useMemo(
    () => reimbursements.slice(0, 6),
    [reimbursements]
  );

  const loadUsers = async () => {
    setLoadingUsers(true);
    setError("");

    try {
      const response = await api.get("/users");
      setUsers(response.data.data || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to fetch users. Please retry."
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadLeaves = async () => {
    setLoadingLeaves(true);

    try {
      const response = await api.get("/leaves/admin");
      setLeaves(response.data.data || []);
      setLeaveSummary(response.data.meta?.summary || emptyLeaveSummary);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to fetch leave analytics."
      );
    } finally {
      setLoadingLeaves(false);
    }
  };

  const loadReimbursements = async () => {
    setLoadingReimbursements(true);

    try {
      const response = await api.get("/reimbursements/admin");
      setReimbursements(response.data.data || []);
      setReimbursementSummary(
        response.data.meta?.summary || emptyReimbursementSummary
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to fetch reimbursement analytics."
      );
    } finally {
      setLoadingReimbursements(false);
    }
  };

  const refreshAnalytics = async () => {
    setError("");
    await Promise.all([loadLeaves(), loadReimbursements()]);
  };

  useEffect(() => {
    const loadPanelData = async () => {
      await Promise.all([loadUsers(), loadLeaves(), loadReimbursements()]);
    };

    loadPanelData();
  }, []);

  const onFormChange = (event) => {
    const { name, value } = event.target;
    setUserForm((current) => ({ ...current, [name]: value }));
  };

  const onCreateUser = async (event) => {
    event.preventDefault();
    setCreating(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/users", userForm);
      setUserForm(emptyUserForm);
      setShowCreateModal(false);
      setSuccess("User created successfully.");
      await loadUsers();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Failed to create user. Check inputs."
      );
    } finally {
      setCreating(false);
    }
  };

  const onUpdateRole = async (id, role) => {
    setUpdatingId(id);
    setError("");
    setSuccess("");

    try {
      await api.patch(`/users/${id}/role`, { role });
      setSuccess("User role updated.");
      await loadUsers();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Role update failed. Please try again."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell flex-col gap-4">
      <Sidebar role={user.role} userName={user.name} onLogout={handleLogout} />

      <main className="page-content flex-1 mt-4">
        <section className="card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="page-kicker">Admin Panel</p>
              <h2 className="mt-2 page-title">User, Leave and Reimbursement Operations</h2>
              <p className="mt-2 text-sm text-gray-400">
                Manage accounts and monitor organization-wide requests.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary" onClick={refreshAnalytics}>
                Refresh Analytics
              </button>
              <button
                className="btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                Create User
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <article className="rounded-xl bg-canvas-100 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Admins</p>
              <p className="mt-1 text-2xl font-extrabold text-gray-100">
                {roleCount.Admin}
              </p>
            </article>
            <article className="rounded-xl bg-canvas-100 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Managers</p>
              <p className="mt-1 text-2xl font-extrabold text-gray-100">
                {roleCount.Manager}
              </p>
            </article>
            <article className="rounded-xl bg-canvas-100 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Employees</p>
              <p className="mt-1 text-2xl font-extrabold text-gray-100">
                {roleCount.Employee}
              </p>
            </article>
          </div>
        </section>

        {/* section tabs */}
        <section className="card p-4">
          <div className="flex gap-4">
            <button
              className={activeSection === "leave" ? "btn-primary" : "btn-secondary"}
              onClick={() => setActiveSection("leave")}
              type="button"
            >
              Leaves
            </button>
            <button
              className={activeSection === "reimbursement" ? "btn-primary" : "btn-secondary"}
              onClick={() => setActiveSection("reimbursement")}
              type="button"
            >
              Reimbursements
            </button>
          </div>
        </section>

        {activeSection === "leave" && (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <LeaveCard
                title="Pending Leaves"
            value={leaveSummary.Pending}
            accentClass="text-amber-600"
            subtitle="Awaiting manager review"
            icon="PL"
          />
          <LeaveCard
            title="Approved Leaves"
            value={leaveSummary.Approved}
            accentClass="text-emerald-600"
            subtitle="Processed requests"
            icon="AL"
          />
          <LeaveCard
            title="Rejected Leaves"
            value={leaveSummary.Rejected}
            accentClass="text-rose-600"
            subtitle="Processed requests"
            icon="RL"
          />
          <LeaveCard
            title="Cancelled Leaves"
            value={leaveSummary.Cancelled}
            accentClass="text-slate-700"
            subtitle="Withdrawn by employees"
            icon="CL"
          />
        </section>

        </section>
          </>
        )}
        {activeSection === "reimbursement" && (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <LeaveCard
                title="Pending Claims"
            value={reimbursementSummary.Pending}
            accentClass="text-amber-600"
            subtitle="Awaiting manager review"
            icon="PC"
          />
          <LeaveCard
            title="Approved Claims"
            value={reimbursementSummary.Approved}
            accentClass="text-emerald-600"
            subtitle="Processed requests"
            icon="AC"
          />
          <LeaveCard
            title="Rejected Claims"
            value={reimbursementSummary.Rejected}
            accentClass="text-rose-600"
            subtitle="Processed requests"
            icon="RC"
          />
          <LeaveCard
            title="Total Claimed"
            value={formatCurrency(reimbursementSummary.totalAmount)}
            accentClass="text-brand-700"
            subtitle="All submitted claims"
            icon="TC"
          />
        </section>
          </>
        )}

        {success ? (
          <div className="rounded-xl border border-emerald-600 bg-emerald-800 px-4 py-3 text-sm font-semibold text-emerald-100">
            {success}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-rose-600 bg-rose-800 px-4 py-3 text-sm font-semibold text-rose-100">
            {error}
          </div>
        ) : null}

        <section className="card p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {roleFilters.map((role) => (
                <button
                  key={role}
                  type="button"
                  className={
                    selectedRole === role
                      ? "rounded-full bg-brand-500 px-3 py-1.5 text-xs font-bold text-white"
                      : "rounded-full bg-gray-700 px-3 py-1.5 text-xs font-bold text-gray-300 hover:bg-gray-600"
                  }
                  onClick={() => setSelectedRole(role)}
                >
                  {role}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="input-field md:max-w-xs"
              placeholder="Search user by name or email"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </section>

        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-600 px-4 py-3">
            <h3 className="text-base font-extrabold text-gray-100">Users</h3>
            <p className="text-xs font-semibold text-slate-500">
              Showing {filteredUsers.length} of {users.length}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr>
                  <th className="table-head px-4 py-3">Name</th>
                  <th className="table-head px-4 py-3">Email</th>
                  <th className="table-head px-4 py-3">Role</th>
                  <th className="table-head px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loadingUsers ? (
                  <tr>
                    <td
                      className="px-4 py-5 text-center font-semibold text-slate-500"
                      colSpan={4}
                    >
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-5 text-center font-semibold text-slate-500"
                      colSpan={4}
                    >
                      No users match this filter.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((tableUser) => (
                    <tr key={tableUser.id}>
                      <td className="table-cell font-semibold text-slate-800">
                        {tableUser.name}
                      </td>
                      <td className="table-cell">{tableUser.email}</td>
                      <td className="table-cell">
                        <select
                          className="input-field py-2"
                          value={tableUser.role}
                          disabled={updatingId === tableUser.id}
                          onChange={(event) =>
                            onUpdateRole(tableUser.id, event.target.value)
                          }
                        >
                          {roleOptions.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="table-cell">
                        {new Date(tableUser.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-gray-100">Recent Leave Activity</h3>
            <p className="text-xs font-semibold text-slate-500">
              {loadingLeaves ? "Loading..." : `${recentLeaves.length} latest request(s)`}
            </p>
          </div>
          {loadingLeaves ? (
            <div className="card px-6 py-4 text-sm font-semibold text-slate-600">
              Loading leave analytics...
            </div>
          ) : (
            <LeaveTable leaves={recentLeaves} showEmployee />
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-gray-100">
              Recent Reimbursement Activity
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              {loadingReimbursements
                ? "Loading..."
                : `${recentReimbursements.length} latest claim(s)`}
            </p>
          </div>
          {loadingReimbursements ? (
            <div className="card px-6 py-4 text-sm font-semibold text-slate-600">
              Loading reimbursement analytics...
            </div>
          ) : (
            <ReimbursementTable
              reimbursements={recentReimbursements}
              showEmployee
            />
          )}
        </section>
      </main>

      {showCreateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="card w-full max-w-md p-6">
            <h3 className="text-lg font-extrabold text-gray-100">Create New User</h3>
            <p className="mt-1 text-sm text-gray-400">
              Add a new user and assign a role.
            </p>

            <form className="mt-5 space-y-4" onSubmit={onCreateUser}>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  name="name"
                  value={userForm.name}
                  onChange={onFormChange}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  className="input-field"
                  name="email"
                  value={userForm.email}
                  onChange={onFormChange}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  className="input-field"
                  name="password"
                  minLength={8}
                  value={userForm.password}
                  onChange={onFormChange}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Role
                </label>
                <select
                  className="input-field"
                  name="role"
                  value={userForm.role}
                  onChange={onFormChange}
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  className="btn-secondary flex-1"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1" disabled={creating}>
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminPanel;
