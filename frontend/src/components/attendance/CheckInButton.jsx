import { Loader2Icon, LogInIcon, LogOutIcon, CheckCircle2 } from 'lucide-react'
import { useState } from 'react';
import { format } from 'date-fns';

function CheckInButton({ todayRecord, onAction }) {
    const [loading, setLoading] = useState(false)

    const handleAttendance = async () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onAction();
        }, 1000);
    }

    const isCheckedIn = !!todayRecord?.checkIn;
    const isComplete = !!todayRecord?.checkOut;
    const now = format(new Date(), "hh:mm a");

    if (isComplete) {
        return (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-4 text-center sm:text-left">
                    <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600">
                        <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-slate-900">
                            Work day completed
                        </h3>
                        <p className="text-slate-500 text-sm mt-1">
                            Great job today — see you tomorrow!
                        </p>
                    </div>
                </div>

                <div className="text-sm text-slate-500 pr-6">
                    {todayRecord.checkIn && (
                        <p>
                            Checked in:{" "}
                            {format(new Date(todayRecord.checkIn), "hh:mm a")}
                        </p>
                    )}
                    {todayRecord.checkOut && (
                        <p>
                            Checked out:{" "}
                            {format(new Date(todayRecord.checkOut), "hh:mm a")}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        Today · {format(new Date(), "EEEE, MMM d")}
                    </p>

                    <h2 className="text-2xl font-semibold text-slate-800">
                        {isCheckedIn
                            ? "You're on the clock"
                            : "Ready to start your day?"}
                    </h2>

                    <p className="text-slate-500 mt-1 max-w-md">
                        {isCheckedIn
                            ? "Don't forget to clock out when you finish your shift."
                            : "Tap the button to record your check-in time."}
                    </p>

                    <p className="text-sm text-slate-400 mt-3">
                        Current time: {now}
                    </p>

                    {isCheckedIn && todayRecord.checkIn && (
                        <p className="text-sm text-indigo-500 mt-1 font-medium">
                            Checked in at{" "}
                            {format(new Date(todayRecord.checkIn), "hh:mm a")}
                        </p>
                    )}
                </div>

                <button
                    onClick={handleAttendance}
                    disabled={loading}
                    className={`flex items-center justify-center gap-4 px-8 py-4 rounded-2xl text-white font-medium text-lg shadow-md transition-all active:scale-[0.98] lg:min-w-[210px] ${
                        isCheckedIn
                            ? "bg-slate-600 hover:bg-slate-700"
                            : "bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/25"
                    }`}
                >
                    {loading ? (
                        <Loader2Icon className="size-7 animate-spin" />
                    ) : isCheckedIn ? (
                        <LogOutIcon className="size-7" />
                    ) : (
                        <LogInIcon className="size-7" />
                    )}

                    <div className="text-left">
                        <span className="block">
                            {loading
                                ? "Processing…"
                                : isCheckedIn
                                ? "Clock out"
                                : "Clock in"}
                        </span>

                        <span className="block text-xs font-normal opacity-80 mt-0.5">
                            {isCheckedIn
                                ? "End your shift"
                                : "Start your shift"}
                        </span>
                    </div>
                </button>
            </div>
        </div>
    );
}

export default CheckInButton;