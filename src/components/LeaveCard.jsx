const LeaveCard = ({ title, value, accentClass, subtitle = "", icon = "" }) => {
  return (
    <article className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm animate-soft-pop">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-600">{title}</p>
        {icon ? (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500 text-sm">
            {icon}
          </span>
        ) : null}
      </div>
      <p className={`mt-3 text-3xl font-extrabold ${accentClass}`}>{value}</p>
      {subtitle ? <p className="mt-1 text-xs font-medium text-slate-500">{subtitle}</p> : null}
    </article>
  );
};

export default LeaveCard;
