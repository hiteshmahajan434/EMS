import { ArrowRightIcon, CalendarIcon, DollarSignIcon, FileTextIcon, User } from "lucide-react";
import { Link } from "react-router-dom";
import PageHero from "./layout/PageHero";
import TodayAttendance from "./layout/TodayAttendance";
import QuickActions from "./layout/QuickActions";

const EmployeeDashboard = ({ data }) => {
    const cards = [
        {
            icon: CalendarIcon,
            value: data.presentDays,
            title: "Days Present",
            subtitle: "This month",
        },
        {
            icon: FileTextIcon,
            value: data.pendingLeaves,
            title: "Pending Leaves",
            subtitle: "Awaiting approval",
        },
        {
            icon: DollarSignIcon,
            value: data.latestPayslip
                ? `₹${data.latestPayslip.netSalary.toLocaleString()}`
                : "N/A",
            title: "Latest Payslip",
            subtitle: data.latestPayslip
                ? `${data.latestPayslip.month}/${data.latestPayslip.year}`
                : "No Payslip",
        },
    ];

    const emp = data.employee;

    return (
        <div className="animate-fade-in">
            <PageHero
                icon={User}
                title={`Welcome back, ${emp.firstName || "Employee"}!`}
                badge={emp.department || "Team member"}
                subtitle={"Here's your work summary for today."}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-8">
                {cards.map((card, index) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={index}
                            className="card card-hover bg-white border border-slate-300 shadow-md rounded-2xl p-5 sm:p-6 relative overflow-hidden group flex items-center justify-between"
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-slate-500/70 group-hover:bg-indigo-500/70 transition-colors" />

                            <div>
                                <p className="text-sm font-medium text-slate-700">
                                    {card.title}
                                </p>

                                <p className="text-2xl font-bold text-slate-900 mt-1">
                                    {card.value}
                                </p>

                                <p className="text-xs text-slate-500 mt-1">
                                    {card.subtitle}
                                </p>
                            </div>

                            <Icon className="size-10 p-2.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors duration-200" />
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">

                {/* Today's Attendance */}

                <TodayAttendance todayAttendance={data.todayAttendance} />

                {/* Quick Actions */}

                <QuickActions />

            </div>
        </div>
    );
};

export default EmployeeDashboard;