const fs = require('fs');
const file = './src/pages/EmployeeDashboard.jsx';
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
          <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="page-kicker">Employee Dashboard</p>
              <h2 className="mt-2 page-title">Welcome back, {user.name}</h2>
              <p className="mt-2 text-sm text-slate-600">
                Manage leave requests and reimbursement claims from one workspace.
              </p>
            </div>

            <div className="card-muted p-4">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-slate-600">
                  Annual Leave Balance ({leaveSummary.year})
                </span>
                <span className="text-slate-900">
                  {leaveSummary.remainingDays}/{policy.annualLimitDays} days left
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-brand-500 transition-all duration-300"
                  style={{ width: \`\${balanceUtilization}%\` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Max {policy.maxRequestDays} day(s) per request, {policy.maxPendingRequests} pending request(s) allowed.
              </p>
            </div>
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

          <div className="mt-5 flex flex-wrap gap-3">
            {activeTab === "Leaves" && (
              <button
                className="btn-primary"
                onClick={() => setShowLeaveForm((current) => !current)}
                type="button"
              >
                {showLeaveForm ? "Close Leave Form" : "Apply Leave"}
              </button>
            )}
            {activeTab === "Reimbursements" && (
              <button
                className="btn-primary"
                onClick={() => setShowReimbursementForm((current) => !current)}
                type="button"
              >
                {showReimbursementForm ? "Close Reimbursement Form" : "Claim Reimbursement"}
              </button>
            )}
            <button className="btn-secondary" onClick={handleRefreshAll} type="button">
              Refresh All
            </button>
          </div>

          {activeTab === "Leaves" && showLeaveForm ? (
            <form
              className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2"
              onSubmit={onLeaveSubmit}
            >
              <div className="md:col-span-2">
                <h3 className="text-base font-bold text-slate-900">New Leave Request</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Tip: apply early to get quicker approval.
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  className="input-field"
                  value={leaveForm.startDate}
                  onChange={onLeaveChange}
                  min={new Date().toISOString().slice(0, 10)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  className="input-field"
                  value={leaveForm.endDate}
                  onChange={onLeaveChange}
                  min={leaveForm.startDate || new Date().toISOString().slice(0, 10)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Reason
                </label>
                <textarea
                  name="reason"
                  rows="3"
                  className="input-field"
                  placeholder="Explain the leave request reason..."
                  value={leaveForm.reason}
                  onChange={onLeaveChange}
                  minLength={5}
                  maxLength={500}
                  required
                />
                <p className="mt-2 text-xs font-semibold text-slate-600">
                  Requested duration: {requestedDays || 0} day(s)
                </p>
              </div>
              <div className="md:col-span-2">
                <button className="btn-primary" type="submit" disabled={leaveSubmitting}>
                  {leaveSubmitting ? "Submitting..." : "Submit Leave Request"}
                </button>
              </div>
            </form>
          ) : null}

          {activeTab === "Reimbursements" && showReimbursementForm ? (
            <form
              className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2"
              onSubmit={onReimbursementSubmit}
            >
              <div className="md:col-span-2">
                <h3 className="text-base font-bold text-slate-900">New Reimbursement Claim</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Submit your expense details for manager review.
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  className="input-field"
                  placeholder="Cab fare to client site"
                  value={reimbursementForm.title}
                  onChange={onReimbursementChange}
                  minLength={3}
                  maxLength={120}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Category
                </label>
                <select
                  name="category"
                  className="input-field"
                  value={reimbursementForm.category}
                  onChange={onReimbursementChange}
                >
                  {reimbursementCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  className="input-field"
                  placeholder="₹0.00"
                  value={reimbursementForm.amount}
                  onChange={onReimbursementChange}
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Expense Date
                </label>
                <input
                  type="date"
                  name="expenseDate"
                  className="input-field"
                  value={reimbursementForm.expenseDate}
                  onChange={onReimbursementChange}
                  max={new Date().toISOString().slice(0, 10)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  className="input-field"
                  placeholder="Add details for this expense..."
                  value={reimbursementForm.description}
                  onChange={onReimbursementChange}
                  minLength={5}
                  maxLength={500}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <button
                  className="btn-primary"
                  type="submit"
                  disabled={reimbursementSubmitting}
                >
                  {reimbursementSubmitting ? "Submitting..." : "Submit Reimbursement"}
                </button>
              </div>
            </form>
          ) : null}

          {activeTab === "Leaves" && leaveSuccess ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {leaveSuccess}
            </div>
          ) : null}

          {activeTab === "Leaves" && leaveError ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {leaveError}
            </div>
          ) : null}

          {activeTab === "Reimbursements" && reimbursementSuccess ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {reimbursementSuccess}
            </div>
          ) : null}

          {activeTab === "Reimbursements" && reimbursementError ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {reimbursementError}
            </div>
          ) : null}
        </section>

        {activeTab === "Leaves" && (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <LeaveCard
                title="Total Requests"
                value={leaveRequestSummary.total}
                accentClass="text-slate-900"
                subtitle="All time"
                icon="TR"
              />
              <LeaveCard
                title="Pending"
                value={leaveRequestSummary.pending}
                accentClass="text-amber-600"
                subtitle="Awaiting review"
                icon="PD"
              />
              <LeaveCard
                title="Approved"
                value={leaveRequestSummary.approved}
                accentClass="text-emerald-600"
                subtitle={\`\${leaveSummary.approvedDays} approved day(s) this year\`}
                icon="AP"
              />
              <LeaveCard
                title="Balance"
                value={leaveSummary.remainingDays}
                accentClass="text-brand-700"
                subtitle={\`\${policy.annualLimitDays} annual day(s)\`}
                icon="BL"
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
                  placeholder="Search leave by reason"
                  value={leaveQuery}
                  onChange={(event) => setLeaveQuery(event.target.value)}
                />
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-slate-900">Leave History</h3>
                <p className="text-xs font-semibold text-slate-500">
                  Showing {filteredLeaves.length} of {leaves.length} request(s)
                </p>
              </div>
              {leaveLoading ? (
                <div className="card px-6 py-4 text-sm font-semibold text-slate-600">
                  Loading leave records...
                </div>
              ) : (
                <LeaveTable
                  leaves={filteredLeaves}
                  canCancel
                  cancelLoadingId={leaveCancelLoadingId}
                  onCancel={handleCancelLeaveRequest}
                />
              )}
            </section>
          </>
        )}

        {activeTab === "Reimbursements" && (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <LeaveCard
                title="Reimbursement Claims"
                value={reimbursements.length}
                accentClass="text-slate-900"
                subtitle="All time"
                icon="RC"
              />
              <LeaveCard
                title="Pending Claims"
                value={reimbursementSummary.Pending}
                accentClass="text-amber-600"
                subtitle="Awaiting manager review"
                icon="PC"
              />
              <LeaveCard
                title="Approved Amount"
                value={formatCurrency(reimbursementSummary.approvedAmount)}
                accentClass="text-emerald-600"
                subtitle="Total approved"
                icon="AA"
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
                <h3 className="text-lg font-extrabold text-slate-900">Reimbursement History</h3>
                <p className="text-xs font-semibold text-slate-500">
                  Showing {filteredReimbursements.length} of {reimbursements.length} claim(s)
                </p>
              </div>
              {reimbursementLoading ? (
                <div className="card px-6 py-4 text-sm font-semibold text-slate-600">
                  Loading reimbursement records...
                </div>
              ) : (
                <ReimbursementTable
                  reimbursements={filteredReimbursements}
                  canCancel
                  cancelLoadingId={reimbursementCancelLoadingId}
                  onCancel={handleCancelReimbursementRequest}
                />
              )}
            </section>
          </>
        )}
      </main>`;

content = content.substring(0, mainStart) + newMain + content.substring(mainEnd);
fs.writeFileSync(file, content, 'utf8');
