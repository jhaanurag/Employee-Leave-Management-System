const fs = require('fs');
const file = './src/pages/ManagerDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add activeTab state
content = content.replace(
  'const [leaveQuery, setLeaveQuery] = useState("");',
  'const [leaveQuery, setLeaveQuery] = useState("");\n  const [activeTab, setActiveTab] = useState("Leaves");'
);

// Replace the main content structure
const mainStart = content.indexOf('<main className="page-content flex-1 mt-4">');
const mainEnd = content.lastIndexOf('</main>') + 7;

const newMain = `<main className="page-content flex-1 mt-4">
        <section className="card p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="page-kicker">Manager Dashboard</p>
              <h2 className="mt-2 page-title">Team Leave and Reimbursements</h2>
              <p className="mt-2 text-sm text-slate-600">
                Review pending requests and add context with remarks.
              </p>
            </div>
            <button className="btn-secondary" onClick={loadAllRequests} type="button">
              Refresh All
            </button>
          </div>

          <div className="mt-6 border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
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

        {activeTab === "Leaves" && (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <LeaveCard
                title="Pending Leaves"
                value={leaveSummary.Pending}
                accentClass="text-amber-600"
                subtitle="Needs action"
                icon="PL"
              />
              <LeaveCard
                title="Approved Leaves"
                value={leaveSummary.Approved}
                accentClass="text-emerald-600"
                subtitle="Reviewed"
                icon="AL"
              />
              <LeaveCard
                title="Rejected Leaves"
                value={leaveSummary.Rejected}
                accentClass="text-rose-600"
                subtitle="Reviewed"
                icon="RL"
              />
              <LeaveCard
                title="Cancelled Leaves"
                value={leaveSummary.Cancelled}
                accentClass="text-slate-700"
                subtitle="Withdrawn by employee"
                icon="CL"
              />
            </section>

            <section className="card p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2">
                  {statusFilters.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      className={
                        leaveStatusFilter === filter
                          ? "rounded-full bg-brand-500 px-3 py-1.5 text-xs font-bold text-white"
                          : "rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                      }
                      onClick={() => setLeaveStatusFilter(filter)}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  className="input-field md:max-w-xs"
                  placeholder="Search leave by employee or reason"
                  value={leaveQuery}
                  onChange={(event) => setLeaveQuery(event.target.value)}
                />
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-slate-900">Leave Request Queue</h3>
                <p className="text-xs font-semibold text-slate-500">
                  Showing {filteredLeaves.length} of {leaves.length} request(s)
                </p>
              </div>
              {loadingLeaves ? (
                <div className="card px-6 py-4 text-sm font-semibold text-slate-600">
                  Loading leave requests...
                </div>
              ) : (
                <LeaveTable
                  leaves={filteredLeaves}
                  showEmployee
                  actionable
                  remarksById={leaveRemarksById}
                  actionLoadingId={leaveActionLoadingId}
                  onRemarksChange={handleLeaveRemarksChange}
                  onAction={handleLeaveAction}
                />
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
                subtitle="Needs action"
                icon="PC"
              />
              <LeaveCard
                title="Approved Claims"
                value={reimbursementSummary.Approved}
                accentClass="text-emerald-600"
                subtitle="Reviewed"
                icon="AC"
              />
              <LeaveCard
                title="Rejected Claims"
                value={reimbursementSummary.Rejected}
                accentClass="text-rose-600"
                subtitle="Reviewed"
                icon="RC"
              />
              <LeaveCard
                title="Pending Amount"
                value={formatCurrency(reimbursementSummary.pendingAmount)}
                accentClass="text-brand-700"
                subtitle="Under review"
                icon="PA"
              />
            </section>

            <section className="card p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2">
                  {statusFilters.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      className={
                        reimbursementStatusFilter === filter
                          ? "rounded-full bg-brand-500 px-3 py-1.5 text-xs font-bold text-white"
                          : "rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                      }
                      onClick={() => setReimbursementStatusFilter(filter)}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  className="input-field md:max-w-xs"
                  placeholder="Search reimbursement"
                  value={reimbursementQuery}
                  onChange={(event) => setReimbursementQuery(event.target.value)}
                />
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-slate-900">
                  Reimbursement Request Queue
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  Showing {filteredReimbursements.length} of {reimbursements.length} claim(s)
                </p>
              </div>
              {loadingReimbursements ? (
                <div className="card px-6 py-4 text-sm font-semibold text-slate-600">
                  Loading reimbursement requests...
                </div>
              ) : (
                <ReimbursementTable
                  reimbursements={filteredReimbursements}
                  showEmployee
                  actionable
                  remarksById={reimbursementRemarksById}
                  actionLoadingId={reimbursementActionLoadingId}
                  onRemarksChange={handleReimbursementRemarksChange}
                  onAction={handleReimbursementAction}
                />
              )}
            </section>
          </>
        )}
      </main>`;

content = content.substring(0, mainStart) + newMain + content.substring(mainEnd);
fs.writeFileSync(file, content, 'utf8');
