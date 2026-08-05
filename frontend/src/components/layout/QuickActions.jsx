import React from "react";
import { ArrowRightIcon, CalendarIcon, DollarSignIcon, FileTextIcon } from "lucide-react";
import { Link } from "react-router-dom";

const QuickActions = () => {
  const actions = [
    {
      title: "Mark Attendance",
      to: "/attendance",
      icon: CalendarIcon,
    },
    {
      title: "Apply Leave",
      to: "/leave",
      icon: FileTextIcon,
    },
    {
      title: "View Payslips",
      to: "/payslips",
      icon: DollarSignIcon,
    },
  ];

  return (
    <div className="card bg-white border border-slate-300 shadow-md rounded-2xl p-5 h-full">
      <h2 className="text-lg font-semibold mb-4">
        Quick Actions
      </h2>

      <div className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              to={action.to}
              className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-2.5 hover:bg-indigo-50 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <Icon className="size-5 text-indigo-600" />
                <span className="font-medium text-slate-800">
                  {action.title}
                </span>
              </div>

              <ArrowRightIcon className="size-4 text-slate-400" />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;