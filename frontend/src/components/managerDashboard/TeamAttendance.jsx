import React from "react";
import { ArrowRight, CalendarCheck, Clock3, Users } from "lucide-react";

const TeamAttendanceCard = ({ stats, onViewAll }) => {
    const {
        teamMembers = 0,
        presentToday = 0,
        onLeave = 0,
        lateToday = 0,
    } = stats || {};

    const attendancePercentage = teamMembers
        ? Math.round((presentToday / teamMembers) * 100)
        : 0;

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        Today's Team Attendance
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Your team's attendance today
                    </p>
                </div>

                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <CalendarCheck className="w-5 h-5 text-indigo-600" />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {/* Present */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-sm text-slate-500">
                            Present
                        </span>
                    </div>

                    <p className="text-2xl font-semibold text-slate-900">
                        {presentToday}
                    </p>
                </div>

                {/* On Leave */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-sm text-slate-500">
                            On Leave
                        </span>
                    </div>

                    <p className="text-2xl font-semibold text-slate-900">
                        {onLeave}
                    </p>
                </div>

                {/* Late */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-sm text-slate-500">
                            Late
                        </span>
                    </div>

                    <p className="text-2xl font-semibold text-slate-900">
                        {lateToday}
                    </p>
                </div>
            </div>

            {/* Progress */}
            <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">
                        Team attendance
                    </span>

                    <span className="text-sm font-medium text-slate-700">
                        {presentToday} / {teamMembers}
                    </span>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                        style={{
                            width: `${attendancePercentage}%`,
                        }}
                    />
                </div>
            </div>

            {/* Footer */}
            <button
                onClick={onViewAll}
                className="w-full mt-6 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-indigo-200 text-indigo-600 font-medium hover:bg-indigo-50 transition"
            >
                View Team Attendance
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    );
};

export default TeamAttendanceCard;