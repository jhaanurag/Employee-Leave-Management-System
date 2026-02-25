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

  const [activeSection, setActiveSection] = useState("leave");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    await Promise.all([loadLeaveRequests(), loadReimbursementRequests()]);
  };

  useEffect(() => {
    loadAllRequests();
  }, []);

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
              <p className="mt-2 text-sm text-gray-400">
                Review pending requests and add context with remarks.
              </p>
            </div>
            <button className="btn-secondary" onClick={loadAllRequests} type="button">
              Refresh All
            </button>
          </div>
        </section>

        {/* tabs for manager view */}
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
              {statusFilters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={
                    leaveStatusFilter === filter
                      ? "rounded-full bg-brand-500 px-3 py-1.5 text-xs font-bold text-white"
                      : "rounded-full bg-gray-700 px-3 py-1.5 text-xs font-bold text-gray-300 hover:bg-gray-600"
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
            <h3 className="text-lg font-extrabold text-gray-100">Leave Request Queue</h3>
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
                      : "rounded-full bg-gray-700 px-3 py-1.5 text-xs font-bold text-gray-300 hover:bg-gray-600"
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
            <h3 className="text-lg font-extrabold text-gray-100">
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
      </main>
    </div>
  );
};

export default ManagerDashboard;
