import { format } from "date-fns";

function PageHero({ icon: Icon, title, subtitle, badge }) {
  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <div className="card p-6 sm:p-7 mb-8 bg-white border border-slate-300 shadow-md">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-5">
          {Icon && (
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 border border-slate-300">
              <Icon className="w-8 h-8" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
                {title}
              </h1>

              {badge && (
                <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold border border-slate-300">
                  {badge}
                </span>
              )}
            </div>

            {subtitle && (
              <p className="text-slate-600 mt-2">
                {subtitle}
              </p>
            )}

            <p className="text-xs text-slate-500 mt-4">
              {today}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageHero;