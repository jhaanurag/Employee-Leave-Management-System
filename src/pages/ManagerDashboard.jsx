import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LeaveCard from "../components/LeaveCard";
import LeaveTable from "../components/LeaveTable";
import ReimbursementTable from "../components/ReimbursementTable";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const statusFilters = ["All", "Pending", "Approved", "Rejected", "Cancelled"];

const emptySummary = {
  Pending: 0,
  Approved: 0,
  Rejected: 0,
  Cancelled: 0
};

const initialLeaveForm = {
  startDate: "",
  endDate: "",
  reason: ""
};

const defaultPolicy = {
  annualLimitDays: 24,
  maxRequestDays: 10,
  maxPendingRequests: 3
};

const defaultLeaveSummary = {
  year: new Date().getUTCFullYear(),
  approvedDays: 0,
  pendingDays: 0,
  bookedDays: 0,
  remainingDays: 24,
  approvedRequests: 0,
  pendingRequests: 0
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

const calculateDays = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return 0;
  }

  return Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(amount || 0));

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [leaves, setLeaves] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState(emptySummary);
  const [leaveRemarksById, setLeaveRemarksById] = useState({});
  const [loadingLeaves, setLoadingLeaves] = useState(true);
  const [leaveActionLoadingId, setLeaveActionLoadingId] = useState("");
  const [leaveStatusFilter, setLeaveStatusFilter] = useState("All");
  const [leaveQuery, setLeaveQuery] = useState("");
  const [myLeaves, setMyLeaves] = useState([]);
  const [myLeavePolicy, setMyLeavePolicy] = useState(defaultPolicy);
  const [myLeaveSummary, setMyLeaveSummary] = useState(defaultLeaveSummary);
  const [myLeaveForm, setMyLeaveForm] = useState(initialLeaveForm);
  const [myLeaveSubmitting, setMyLeaveSubmitting] = useState(false);
  const [myLeaveCancelLoadingId, setMyLeaveCancelLoadingId] = useState("");
  const [showMyLeaveForm, setShowMyLeaveForm] = useState(false);
  const [myLeaveError, setMyLeaveError] = useState("");
  const [myLeaveSuccess, setMyLeaveSuccess] = useState("");
  const [reimbursements, setReimbursements] = useState([]);
  const [reimbursementSummary, setReimbursementSummary] = useState(
    emptyReimbursementSummary
  );
  const [reimbursementRemarksById, setReimbursementRemarksById] = useState({});
  const [loadingReimbursements, setLoadingReimbursements] = useState(true);
  const [reimbursementActionLoadingId, setReimbursementActionLoadingId] =
    useState("");
  const [reimbursementStatusFilter, setReimbursementStatusFilter] =
    useState("All");
  const [reimbursementQuery, setReimbursementQuery] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadMyLeaves = async () => {
    try {
      const response = await api.get("/leaves/my");
      setMyLeaves(response.data.data || []);
      setMyLeavePolicy(response.data.meta?.policy || defaultPolicy);
      setMyLeaveSummary(response.data.meta?.summary || defaultLeaveSummary);
    } catch (requestError) {
      setMyLeaveError(
        requestError.response?.data?.message ||
          "Unable to load your leave records right now."
      );
    }
  };

  const loadLeaveRequests = async () => {
    setLoadingLeaves(true);

    try {
      const response = await api.get("/leaves/manager");
      setLeaves(response.data.data || []);
      setLeaveSummary(response.data.meta?.summary || emptySummary);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load leave requests right now."
      );
    } finally {
      setLoadingLeaves(false);
    }
  };

  const loadReimbursementRequests = async () => {
    setLoadingReimbursements(true);

    try {
      const response = await api.get("/reimbursements/manager");
      setReimbursements(response.data.data || []);
      setReimbursementSummary(
        response.data.meta?.summary || emptyReimbursementSummary
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load reimbursement requests right now."
      );
    } finally {
      setLoadingReimbursements(false);
    }
  };

  const loadAllRequests = async () => {
    setError("");
    await Promise.all([loadMyLeaves(), loadLeaveRequests(), loadReimbursementRequests()]);
  };

  useEffect(() => {
    loadAllRequests();
  }, []);

  const requestedDays = useMemo(
    () => calculateDays(myLeaveForm.startDate, myLeaveForm.endDate),
    [myLeaveForm.startDate, myLeaveForm.endDate]
  );

  const onMyLeaveChange = (event) => {
    const { name, value } = event.target;
    setMyLeaveForm((current) => ({ ...current, [name]: value }));
  };

  const onMyLeaveSubmit = async (event) => {
    event.preventDefault();
    setMyLeaveError("");
    setMyLeaveSuccess("");

    if (requestedDays === 0) {
      setMyLeaveError("Please select a valid leave duration.");
      return;
    }

    setMyLeaveSubmitting(true);
    try {
      await api.post("/leaves", myLeaveForm);
      setMyLeaveForm(initialLeaveForm);
      setShowMyLeaveForm(false);
      setMyLeaveSuccess("Leave request submitted to Admin.");
      await loadMyLeaves();
    } catch (requestError) {
      setMyLeaveError(
        requestError.response?.data?.message ||
          "Could not submit your leave request."
      );
    } finally {
      setMyLeaveSubmitting(false);
    }
  };

  const handleCancelMyLeave = async (leaveId) => {
    setMyLeaveCancelLoadingId(leaveId);
    setMyLeaveError("");
    setMyLeaveSuccess("");
    try {
      await api.patch(`/leaves/${leaveId}/cancel`);
      setMyLeaveSuccess("Leave request cancelled.");
      await loadMyLeaves();
    } catch (requestError) {
      setMyLeaveError(
        requestError.response?.data?.message ||
          "Could not cancel this leave request."
      );
    } finally {
      setMyLeaveCancelLoadingId("");
    }
  };

  const handleLeaveRemarksChange = (id, value) => {
    setLeaveRemarksById((current) => ({ ...current, [id]: value }));
  };

  const handleReimbursementRemarksChange = (id, value) => {
    setReimbursementRemarksById((current) => ({ ...current, [id]: value }));
  };

  const handleLeaveAction = async (id, status, remarks) => {
    setLeaveActionLoadingId(id);
    setError("");
    setSuccess("");

    try {
      await api.patch(`/leaves/${id}/review`, { status, remarks });
      await loadLeaveRequests();
      setSuccess(`Leave request ${status.toLowerCase()} successfully.`);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Failed to review leave request. Please retry."
      );
    } finally {
      setLeaveActionLoadingId("");
    }
  };

  const handleReimbursementAction = async (id, status, remarks) => {
    setReimbursementActionLoadingId(id);
    setError("");
    setSuccess("");

    try {
      await api.patch(`/reimbursements/${id}/review`, { status, remarks });
      await loadReimbursementRequests();
      setSuccess(`Reimbursement request ${status.toLowerCase()} successfully.`);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Failed to review reimbursement request. Please retry."
      );
    } finally {
      setReimbursementActionLoadingId("");
    }
  };

  const filteredLeaves = useMemo(() => {
    const normalizedQuery = leaveQuery.trim().toLowerCase();

    return leaves.filter((leave) => {
      const matchesStatus =
        leaveStatusFilter === "All" ? true : leave.status === leaveStatusFilter;

      const matchesQuery = normalizedQuery
        ? String(leave.employee?.name || "")
            .toLowerCase()
            .includes(normalizedQuery) ||
          String(leave.reason || "").toLowerCase().includes(normalizedQuery)
        : true;

      return matchesStatus && matchesQuery;
    });
  }, [leaveQuery, leaveStatusFilter, leaves]);

  const filteredReimbursements = useMemo(() => {
    const normalizedQuery = reimbursementQuery.trim().toLowerCase();

    return reimbursements.filter((claim) => {
      const matchesStatus =
        reimbursementStatusFilter === "All"
          ? true
          : claim.status === reimbursementStatusFilter;

      const matchesQuery = normalizedQuery
        ? String(claim.employee?.name || "")
            .toLowerCase()
            .includes(normalizedQuery) ||
          String(claim.title || "").toLowerCase().includes(normalizedQuery) ||
          String(claim.description || "").toLowerCase().includes(normalizedQuery)
        : true;

      return matchesStatus && matchesQuery;
    });
  }, [reimbursementQuery, reimbursementStatusFilter, reimbursements]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell flex-col gap-4">
      <Sidebar role={user.role} userName={user.name} onLogout={handleLogout} />

      <main className="page-content flex-1 mt-4">
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

          
        </section>

        <section className="section-shell section-leave mt-5 space-y-5">
          <div className="border-b border-rose-200 pb-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">My Leave Requests</h2>
            <p className="mt-1 text-sm text-slate-600">
              Managers can apply leave here. These requests are reviewed by Admin.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="btn-primary"
              type="button"
              onClick={() => setShowMyLeaveForm((current) => !current)}
            >
              {showMyLeaveForm ? "Close Leave Form" : "Apply Leave"}
            </button>
            <button className="btn-secondary" type="button" onClick={loadMyLeaves}>
              Refresh My Leaves
            </button>
          </div>
          {showMyLeaveForm ? (
            <form
              className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2"
              onSubmit={onMyLeaveSubmit}
            >
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  className="input-field"
                  value={myLeaveForm.startDate}
                  onChange={onMyLeaveChange}
                  min={new Date().toISOString().slice(0, 10)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  className="input-field"
                  value={myLeaveForm.endDate}
                  onChange={onMyLeaveChange}
                  min={myLeaveForm.startDate || new Date().toISOString().slice(0, 10)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Reason</label>
                <textarea
                  name="reason"
                  rows="3"
                  className="input-field"
                  value={myLeaveForm.reason}
                  onChange={onMyLeaveChange}
                  minLength={5}
                  maxLength={500}
                  required
                />
                <p className="mt-2 text-xs font-semibold text-slate-600">
                  Requested duration: {requestedDays || 0} day(s), Remaining: {myLeaveSummary.remainingDays}/
                  {myLeavePolicy.annualLimitDays}
                </p>
              </div>
              <div className="md:col-span-2">
                <button className="btn-primary" type="submit" disabled={myLeaveSubmitting}>
                  {myLeaveSubmitting ? "Submitting..." : "Submit to Admin"}
                </button>
              </div>
            </form>
          ) : null}

          {myLeaveSuccess ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {myLeaveSuccess}
            </div>
          ) : null}
          {myLeaveError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {myLeaveError}
            </div>
          ) : null}

          <LeaveTable
            leaves={myLeaves}
            canCancel
            cancelLoadingId={myLeaveCancelLoadingId}
            onCancel={handleCancelMyLeave}
          />
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

        <section className="section-shell section-leave mt-5 space-y-5">
          <div className="border-b border-rose-200 pb-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Leave Management</h2>
          </div>
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
        </section>

        <section className="section-shell section-reimbursement mt-6 space-y-5">
          <div className="border-b border-amber-200 pb-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Reimbursements</h2>
          </div>
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
        </section>
      </main>
    </div>
  );
};

export default ManagerDashboard;
