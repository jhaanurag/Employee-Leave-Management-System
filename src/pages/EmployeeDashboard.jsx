import { useEffect, useMemo, useState } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import LeaveCard from "../components/LeaveCard";
import LeaveTable from "../components/LeaveTable";
import ReimbursementTable from "../components/ReimbursementTable";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const initialLeaveForm = {
  startDate: "",
  endDate: "",
  reason: ""
};

const initialReimbursementForm = {
  title: "",
  category: "Travel",
  amount: "",
  expenseDate: "",
  description: ""
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

const defaultReimbursementSummary = {
  Pending: 0,
  Approved: 0,
  Rejected: 0,
  Cancelled: 0,
  totalAmount: 0,
  approvedAmount: 0,
  pendingAmount: 0
};

const defaultReimbursementCategories = [
  "Travel",
  "Food",
  "Accommodation",
  "Medical",
  "Internet",
  "Other"
];

const statusFilters = ["All", "Pending", "Approved", "Rejected", "Cancelled"];
const dashboardTabs = ["Leaves", "Claims", "Analytics"];

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const calculateDays = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return 0;
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((end.getTime() - start.getTime()) / millisecondsPerDay) + 1;
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(amount || 0));

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [leaves, setLeaves] = useState([]);
  const [policy, setPolicy] = useState(defaultPolicy);
  const [leaveSummary, setLeaveSummary] = useState(defaultLeaveSummary);
  const [leaveLoading, setLeaveLoading] = useState(true);
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveCancelLoadingId, setLeaveCancelLoadingId] = useState("");
  const [leaveError, setLeaveError] = useState("");
  const [leaveSuccess, setLeaveSuccess] = useState("");
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState(initialLeaveForm);
  const [leaveStatusFilter, setLeaveStatusFilter] = useState("All");
  const [leaveQuery, setLeaveQuery] = useState("");
  const [reimbursements, setReimbursements] = useState([]);
  const [reimbursementSummary, setReimbursementSummary] = useState(
    defaultReimbursementSummary
  );
  const [reimbursementCategories, setReimbursementCategories] = useState(
    defaultReimbursementCategories
  );
  const [reimbursementLoading, setReimbursementLoading] = useState(true);
  const [reimbursementSubmitting, setReimbursementSubmitting] = useState(false);
  const [reimbursementCancelLoadingId, setReimbursementCancelLoadingId] =
    useState("");
  const [reimbursementError, setReimbursementError] = useState("");
  const [reimbursementSuccess, setReimbursementSuccess] = useState("");
  const [showReimbursementForm, setShowReimbursementForm] = useState(false);
  const [reimbursementForm, setReimbursementForm] = useState(
    initialReimbursementForm
  );
  const [reimbursementStatusFilter, setReimbursementStatusFilter] =
    useState("All");
  const [reimbursementQuery, setReimbursementQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Leaves");

  const loadLeaves = async () => {
    setLeaveLoading(true);
    setLeaveError("");

    try {
      const response = await api.get("/leaves/my");
      setLeaves(response.data.data || []);
      setPolicy(response.data.meta?.policy || defaultPolicy);
      setLeaveSummary(response.data.meta?.summary || defaultLeaveSummary);
    } catch (requestError) {
      setLeaveError(
        requestError.response?.data?.message ||
          "Failed to load leave history. Try again."
      );
    } finally {
      setLeaveLoading(false);
    }
  };

  const loadReimbursements = async () => {
    setReimbursementLoading(true);
    setReimbursementError("");

    try {
      const response = await api.get("/reimbursements/my");
      setReimbursements(response.data.data || []);
      setReimbursementSummary(
        response.data.meta?.summary || defaultReimbursementSummary
      );
      setReimbursementCategories(
        response.data.meta?.reimbursement?.categories ||
          defaultReimbursementCategories
      );
    } catch (requestError) {
      setReimbursementError(
        requestError.response?.data?.message ||
          "Failed to load reimbursements. Try again."
      );
    } finally {
      setReimbursementLoading(false);
    }
  };

  useEffect(() => {
    const loadEmployeeData = async () => {
      await Promise.all([loadLeaves(), loadReimbursements()]);
    };

    loadEmployeeData();
  }, []);

  const leaveRequestSummary = useMemo(() => {
    const pending = leaves.filter((leave) => leave.status === "Pending").length;
    const approved = leaves.filter((leave) => leave.status === "Approved").length;
    const rejected = leaves.filter((leave) => leave.status === "Rejected").length;
    const cancelled = leaves.filter((leave) => leave.status === "Cancelled").length;

    return {
      total: leaves.length,
      pending,
      approved,
      rejected,
      cancelled
    };
  }, [leaves]);

  const requestedDays = useMemo(
    () => calculateDays(leaveForm.startDate, leaveForm.endDate),
    [leaveForm.startDate, leaveForm.endDate]
  );

  const balanceUtilization = useMemo(() => {
    if (!policy.annualLimitDays) {
      return 0;
    }

    return Math.min(
      Math.round((leaveSummary.bookedDays / policy.annualLimitDays) * 100),
      100
    );
  }, [leaveSummary.bookedDays, policy.annualLimitDays]);

  const filteredLeaves = useMemo(() => {
    const normalizedQuery = leaveQuery.trim().toLowerCase();

    return leaves.filter((leave) => {
      const matchesStatus =
        leaveStatusFilter === "All" ? true : leave.status === leaveStatusFilter;

      const matchesQuery = normalizedQuery
        ? leave.reason.toLowerCase().includes(normalizedQuery)
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
        ? String(claim.title || "").toLowerCase().includes(normalizedQuery) ||
          String(claim.category || "").toLowerCase().includes(normalizedQuery) ||
          String(claim.description || "").toLowerCase().includes(normalizedQuery)
        : true;

      return matchesStatus && matchesQuery;
    });
  }, [reimbursementQuery, reimbursementStatusFilter, reimbursements]);

  const analyticsStatusData = useMemo(() => {
    const leave = {
      Pending: leaveRequestSummary.pending,
      Approved: leaveRequestSummary.approved,
      Rejected: leaveRequestSummary.rejected,
      Cancelled: leaveRequestSummary.cancelled
    };
    const claim = {
      Pending: reimbursementSummary.Pending || 0,
      Approved: reimbursementSummary.Approved || 0,
      Rejected: reimbursementSummary.Rejected || 0,
      Cancelled: reimbursementSummary.Cancelled || 0
    };
    return { leave, claim };
  }, [leaveRequestSummary, reimbursementSummary]);

  const trendChartData = useMemo(() => {
    const monthLabels = [];
    const leaveByMonth = {};
    const claimByMonth = {};
    const now = new Date();

    for (let offset = 5; offset >= 0; offset -= 1) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const key = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
      const label = monthDate.toLocaleDateString(undefined, { month: "short" });
      monthLabels.push(label);
      leaveByMonth[key] = 0;
      claimByMonth[key] = 0;
    }

    leaves.forEach((entry) => {
      const entryDate = new Date(entry.createdAt);
      if (Number.isNaN(entryDate.getTime())) {
        return;
      }
      const key = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, "0")}`;
      if (Object.prototype.hasOwnProperty.call(leaveByMonth, key)) {
        leaveByMonth[key] += 1;
      }
    });

    reimbursements.forEach((entry) => {
      const entryDate = new Date(entry.createdAt);
      if (Number.isNaN(entryDate.getTime())) {
        return;
      }
      const key = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, "0")}`;
      if (Object.prototype.hasOwnProperty.call(claimByMonth, key)) {
        claimByMonth[key] += 1;
      }
    });

    return {
      labels: monthLabels,
      leaveSeries: Object.values(leaveByMonth),
      claimSeries: Object.values(claimByMonth)
    };
  }, [leaves, reimbursements]);

  const onLeaveChange = (event) => {
    const { name, value } = event.target;
    setLeaveForm((current) => ({ ...current, [name]: value }));
  };

  const onReimbursementChange = (event) => {
    const { name, value } = event.target;
    setReimbursementForm((current) => ({ ...current, [name]: value }));
  };

  const onLeaveSubmit = async (event) => {
    event.preventDefault();
    setLeaveError("");
    setLeaveSuccess("");

    if (requestedDays === 0) {
      setLeaveError("Please select a valid leave duration.");
      return;
    }

    if (requestedDays > policy.maxRequestDays) {
      setLeaveError(`A request cannot exceed ${policy.maxRequestDays} day(s).`);
      return;
    }

    if (leaveSummary.pendingRequests >= policy.maxPendingRequests) {
      setLeaveError(
        `You already have ${policy.maxPendingRequests} pending request(s). Resolve one before applying again.`
      );
      return;
    }

    if (requestedDays > leaveSummary.remainingDays) {
      setLeaveError(
        `Insufficient leave balance. You have ${leaveSummary.remainingDays} day(s) remaining.`
      );
      return;
    }

    setLeaveSubmitting(true);

    try {
      await api.post("/leaves", leaveForm);
      setLeaveForm(initialLeaveForm);
      setShowLeaveForm(false);
      setLeaveSuccess("Leave request submitted successfully.");
      await loadLeaves();
    } catch (requestError) {
      setLeaveError(
        requestError.response?.data?.message ||
          "Could not submit leave request. Check your form and try again."
      );
    } finally {
      setLeaveSubmitting(false);
    }
  };

  const onReimbursementSubmit = async (event) => {
    event.preventDefault();
    setReimbursementError("");
    setReimbursementSuccess("");

    if (reimbursementForm.title.trim().length < 3) {
      setReimbursementError("Title must be at least 3 characters.");
      return;
    }

    const amount = Number(reimbursementForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setReimbursementError("Enter a valid amount greater than 0.");
      return;
    }

    if (!reimbursementForm.expenseDate) {
      setReimbursementError("Expense date is required.");
      return;
    }

    if (new Date(reimbursementForm.expenseDate).getTime() > new Date().getTime()) {
      setReimbursementError("Expense date cannot be in the future.");
      return;
    }

    if (reimbursementForm.description.trim().length < 5) {
      setReimbursementError("Description must be at least 5 characters.");
      return;
    }

    setReimbursementSubmitting(true);

    try {
      await api.post("/reimbursements", {
        ...reimbursementForm,
        title: reimbursementForm.title.trim(),
        amount,
        description: reimbursementForm.description.trim()
      });
      setReimbursementForm(initialReimbursementForm);
      setShowReimbursementForm(false);
      setReimbursementSuccess("Reimbursement request submitted successfully.");
      await loadReimbursements();
    } catch (requestError) {
      setReimbursementError(
        requestError.response?.data?.message ||
          "Could not submit reimbursement request. Check your form and try again."
      );
    } finally {
      setReimbursementSubmitting(false);
    }
  };

  const handleCancelLeaveRequest = async (leaveId) => {
    setLeaveCancelLoadingId(leaveId);
    setLeaveError("");
    setLeaveSuccess("");

    try {
      await api.patch(`/leaves/${leaveId}/cancel`);
      setLeaveSuccess("Leave request cancelled.");
      await loadLeaves();
    } catch (requestError) {
      setLeaveError(
        requestError.response?.data?.message ||
          "Could not cancel this leave request."
      );
    } finally {
      setLeaveCancelLoadingId("");
    }
  };

  const handleCancelReimbursementRequest = async (claimId) => {
    setReimbursementCancelLoadingId(claimId);
    setReimbursementError("");
    setReimbursementSuccess("");

    try {
      await api.patch(`/reimbursements/${claimId}/cancel`);
      setReimbursementSuccess("Reimbursement request cancelled.");
      await loadReimbursements();
    } catch (requestError) {
      setReimbursementError(
        requestError.response?.data?.message ||
          "Could not cancel this reimbursement request."
      );
    } finally {
      setReimbursementCancelLoadingId("");
    }
  };

  const handleRefreshAll = async () => {
    await Promise.all([loadLeaves(), loadReimbursements()]);
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
                  style={{ width: `${balanceUtilization}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Max {policy.maxRequestDays} day(s) per request, {policy.maxPendingRequests} pending request(s) allowed.
              </p>
            </div>
          </div>

          

          <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            {dashboardTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={
                  activeTab === tab
                    ? "rounded-full bg-brand-500 px-5 py-2.5 text-sm font-bold text-white"
                    : "rounded-full bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200"
                }
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {activeTab === "Leaves" ? (
              <button
                className="btn-primary"
                onClick={() => setShowLeaveForm((current) => !current)}
                type="button"
              >
                {showLeaveForm ? "Close Leave Form" : "Apply Leave"}
              </button>
            ) : null}
            {activeTab === "Claims" ? (
              <button
                className="btn-primary"
                onClick={() => setShowReimbursementForm((current) => !current)}
                type="button"
              >
                {showReimbursementForm ? "Close Claim Form" : "Create Claim"}
              </button>
            ) : null}
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

          {activeTab === "Claims" && showReimbursementForm ? (
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

          {activeTab === "Claims" && reimbursementSuccess ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {reimbursementSuccess}
            </div>
          ) : null}

          {activeTab === "Claims" && reimbursementError ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {reimbursementError}
            </div>
          ) : null}
        </section>

        {activeTab === "Leaves" ? (
        <section className="section-shell section-leave mt-5 space-y-5">
          <div className="border-b border-rose-200 pb-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Leave Management</h2>
          </div>
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
                subtitle={`${leaveSummary.approvedDays} approved day(s) this year`}
                icon="AP"
              />
              <LeaveCard
                title="Balance"
                value={leaveSummary.remainingDays}
                accentClass="text-brand-700"
                subtitle={`${policy.annualLimitDays} annual day(s)`}
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
        </section>
        ) : null}

        {activeTab === "Claims" ? (
        <section className="section-shell section-reimbursement mt-6 space-y-5">
          <div className="border-b border-amber-200 pb-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Claim Management</h2>
          </div>
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
        </section>
        ) : null}

        {activeTab === "Analytics" ? (
        <section className="section-shell mt-6 space-y-5 border-slate-200 bg-white/70">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Analytics</h2>
            <p className="mt-1 text-sm text-slate-600">
              Trends and status breakdown for your leave requests and claims.
            </p>
          </div>

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="card p-4">
              <h3 className="text-sm font-bold text-slate-900">Leave Status Mix</h3>
              <div className="mt-4 h-72">
                <Doughnut
                  data={{
                    labels: Object.keys(analyticsStatusData.leave),
                    datasets: [
                      {
                        data: Object.values(analyticsStatusData.leave),
                        backgroundColor: ["#f59e0b", "#34d399", "#fb7185", "#94a3b8"]
                      }
                    ]
                  }}
                  options={{ maintainAspectRatio: false }}
                />
              </div>
            </article>
            <article className="card p-4">
              <h3 className="text-sm font-bold text-slate-900">Claim Status Mix</h3>
              <div className="mt-4 h-72">
                <Doughnut
                  data={{
                    labels: Object.keys(analyticsStatusData.claim),
                    datasets: [
                      {
                        data: Object.values(analyticsStatusData.claim),
                        backgroundColor: ["#f59e0b", "#34d399", "#fb7185", "#94a3b8"]
                      }
                    ]
                  }}
                  options={{ maintainAspectRatio: false }}
                />
              </div>
            </article>
          </section>

          <article className="card p-4">
            <h3 className="text-sm font-bold text-slate-900">Last 6 Months Activity</h3>
            <div className="mt-4 h-80">
              <Bar
                data={{
                  labels: trendChartData.labels,
                  datasets: [
                    {
                      label: "Leaves",
                      data: trendChartData.leaveSeries,
                      backgroundColor: "#fda4af"
                    },
                    {
                      label: "Claims",
                      data: trendChartData.claimSeries,
                      backgroundColor: "#fdba74"
                    }
                  ]
                }}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 } }
                  }
                }}
              />
            </div>
          </article>
        </section>
        ) : null}
      </main>
    </div>
  );
};

export default EmployeeDashboard;
