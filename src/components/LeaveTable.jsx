const statusClassMap = {
  Pending: "border border-amber-300 bg-amber-100 text-amber-800",
  Approved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-rose-100 text-rose-700",
  Cancelled: "bg-slate-100 text-slate-700"
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

const LeaveTable = ({
  leaves,
  showEmployee = false,
  actionable = false,
  canCancel = false,
  actionLoadingId = "",
  cancelLoadingId = "",
  remarksById = {},
  onRemarksChange = () => {},
  onAction = () => {},
  onCancel = () => {}
}) => {
  if (leaves.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No leave records found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {leaves.map((leave) => (
        <div
          key={leave.id}
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition hover:shadow-md"
        >
          <div className="flex justify-between">
            <div className="space-y-1">
              {showEmployee && (
                <p className="font-semibold text-slate-900">
                  {leave.employee?.name || "-"}
                </p>
              )}
              <p className="text-sm text-slate-600">
                {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
              </p>
              <p className="text-sm text-slate-600">Days: {leave.days}</p>
              <p className="text-sm text-slate-600">Reason: {leave.reason}</p>
            </div>
            <span
              className={`status-pill ${
                statusClassMap[leave.status] || "bg-slate-50 text-slate-700"
              }`}
            >
              {leave.status}
            </span>
          </div>

          {(actionable || (canCancel && leave.status === "Pending")) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {actionable && leave.status === "Pending" && (
                <>
                  <button
                    className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                    disabled={actionLoadingId === leave.id}
                    onClick={() =>
                      onAction(leave.id, "Approved", remarksById[leave.id] || "")
                    }
                  >
                    Approve
                  </button>
                  <button
                    className="rounded-lg bg-rose-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-600 disabled:opacity-50"
                    disabled={actionLoadingId === leave.id}
                    onClick={() =>
                      onAction(leave.id, "Rejected", remarksById[leave.id] || "")
                    }
                  >
                    Reject
                  </button>
                </>
              )}
              {canCancel && leave.status === "Pending" && !actionable && (
                <button
                  className="rounded-lg border border-rose-400 bg-rose-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-60"
                  disabled={cancelLoadingId === leave.id}
                  onClick={() => onCancel(leave.id)}
                >
                  {cancelLoadingId === leave.id ? "Cancelling..." : "Cancel"}
                </button>
              )}
            </div>
          )}

          {actionable && leave.status === "Pending" && (
            <div className="mt-2">
              <input
                type="text"
                value={remarksById[leave.id] || ""}
                onChange={(event) =>
                  onRemarksChange(leave.id, event.target.value)
                }
                placeholder="Optional remarks"
                className="input-field py-2"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LeaveTable;
