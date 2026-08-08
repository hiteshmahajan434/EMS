import React from "react";
import { ArrowRight, CalendarDays, FileText } from "lucide-react";
import { format } from "date-fns";

const EmployeeLeaveRequests = ({ requests = [], onViewAll }) => {
    const visibleRequests = requests.slice(0, 2);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        Employee Leave Requests
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                        Requests awaiting your approval
                    </p>
                </div>

                {requests.length > 0 && (
                    <button
                        onClick={onViewAll}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                        View all
                    </button>
                )}
            </div>

            {/* Requests */}
            {visibleRequests.length > 0 ? (
                <div className="space-y-4">
                    {visibleRequests.map((leave) => {
                        const employee = leave.userId;

                        const initials = employee
                            ? `${employee.firstName?.[0] || ""}${employee.lastName?.[0] || ""}`
                            : "U";

                        return (
                            <div
                                key={leave._id}
                                className="flex items-center gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                            >
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold text-sm shrink-0">
                                    {initials}
                                </div>

                                {/* Employee + Leave */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-900 truncate">
                                        {employee
                                            ? `${employee.firstName} ${employee.lastName}`
                                            : "Unknown Employee"}
                                    </p>

                                    <p className="text-sm text-slate-500">
                                        {leave.leaveType || "Leave Request"}
                                    </p>

                                    <div className="flex items-center gap-1.5 mt-1">
                                        <CalendarDays className="w-3.5 h-3.5 text-slate-400" />

                                        <span className="text-xs text-slate-500">
                                            {leave.startDate
                                                ? format(
                                                      new Date(leave.startDate),
                                                      "MMM d"
                                                  )
                                                : "--"}

                                            {" - "}

                                            {leave.endDate
                                                ? format(
                                                      new Date(leave.endDate),
                                                      "MMM d"
                                                  )
                                                : "--"}
                                        </span>
                                    </div>
                                </div>

                                {/* Status */}
                                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-medium shrink-0">
                                    Pending
                                </span>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                    </div>

                    <p className="text-sm font-medium text-slate-700">
                        No pending requests
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                        You're all caught up!
                    </p>
                </div>
            )}

            {/* Footer */}
            {requests.length > 0 && (
                <button
                    onClick={onViewAll}
                    className="w-full mt-5 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-indigo-200 text-indigo-600 font-medium hover:bg-indigo-50 transition"
                >
                    Review Leave Requests
                    <ArrowRight className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default EmployeeLeaveRequests;