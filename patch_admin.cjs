const fs = require('fs');
const file = './src/pages/AdminPanel.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add activeTab state
content = content.replace(
  'const [searchQuery, setSearchQuery] = useState("");',
  'const [searchQuery, setSearchQuery] = useState("");\n  const [activeTab, setActiveTab] = useState("Users");'
);

// Replace the main content structure
const mainStart = content.indexOf('<main className="page-content flex-1 mt-4">');
const mainEnd = content.lastIndexOf('</main>') + 7;

const newMain = `<main className="page-content flex-1 mt-4">
        <section className="card p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="page-kicker">Admin Panel</p>
              <h2 className="mt-2 page-title">System Operations</h2>
              <p className="mt-2 text-sm text-slate-600">
                Manage users and monitor system-wide leave and reimbursement analytics.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                className="btn-primary"
                onClick={() => {
                  setUpdatingId("");
                  setUserForm(emptyUserForm);
                  setShowCreateModal(true);
                }}
                type="button"
              >
                Add User
              </button>
              <button className="btn-secondary" onClick={loadAllData} type="button">
                Refresh All
              </button>
            </div>
          </div>

          <div className="mt-6 border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("Users")}
                className={\`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium \${
                  activeTab === "Users"
                    ? "border-brand-500 text-brand-600"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }\`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab("Leaves")}
                className={\`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium \${
                  activeTab === "Leaves"
                    ? "border-brand-500 text-brand-600"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }\`}
              >
                Leaves
              </button>
              <button
                onClick={() => setActiveTab("Reimbursements")}
                className={\`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium \${
                  activeTab === "Reimbursements"
                    ? "border-brand-500 text-brand-600"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }\`}
              >
                Reimbursements
              </button>
            </nav>
          </div>
        </section>

        {success ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {success}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        {activeTab === "Users" && (
          <>
            <section className="card p-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <article className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500">Admins</p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-900">
                    {roleCount.Admin}
                  </p>
                </article>
                <article className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500">Managers</p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-900">
                    {roleCount.Manager}
                  </p>
                </article>
                <article className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500">Employees</p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-900">
                    {roleCount.Employee}
                  </p>
                </article>
              </div>
            </section>

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
                          : "rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
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
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <h3 className="text-base font-extrabold text-slate-900">Users</h3>
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
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr
                          key={u.id}
                          className="cursor-pointer transition hover:bg-slate-50"
                          onClick={() => handleEditUser(u)}
                        >
                          <td className="table-cell font-semibold text-slate-900">
                            {u.name}
                          </td>
                          <td className="table-cell">{u.email}</td>
                          <td className="table-cell">
                            <span className="status-pill bg-slate-100 text-slate-700">
                              {u.role}
                            </span>
                          </td>
                          <td className="table-cell">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {activeTab === "Leaves" && (
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

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-slate-900">Recent Leave Requests</h3>
              </div>
              {loadingLeaves ? (
                <div className="card px-6 py-4 text-sm font-semibold text-slate-600">
                  Loading leave records...
                </div>
              ) : (
                <LeaveTable leaves={recentLeaves} showEmployee />
              )}
            </section>
          </>
        )}

        {activeTab === "Reimbursements" && (
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

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-slate-900">
                  Recent Reimbursement Claims
                </h3>
              </div>
              {loadingReimbursements ? (
                <div className="card px-6 py-4 text-sm font-semibold text-slate-600">
                  Loading reimbursement records...
                </div>
              ) : (
                <ReimbursementTable reimbursements={recentReimbursements} showEmployee />
              )}
            </section>
          </>
        )}
      </main>`;

content = content.substring(0, mainStart) + newMain + content.substring(mainEnd);
fs.writeFileSync(file, content, 'utf8');
