import React from 'react'

const TodayAttendance = ({ todayAttendance }) => {
    return (
        <div className="card bg-white border border-slate-300 shadow-md rounded-2xl p-6">

            <h2 className="text-lg font-semibold mb-5">
                Today's Attendance
            </h2>

            <div className="grid grid-cols-2 gap-y-5 gap-x-10">

                <div>
                    <p className="text-sm text-slate-500">
                        Status
                    </p>

                    <span
                        className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold ${todayAttendance.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : todayAttendance.status === "Clocked In"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"
                            }`}
                    >
                        {todayAttendance.status}
                    </span>
                </div>

                <div>
                    <p className="text-sm text-slate-500">
                        Hours Worked
                    </p>

                    <p className="text-xl font-semibold mt-2">
                        {todayAttendance.totalHours || "--"}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-slate-500">
                        Check In
                    </p>

                    <p className="text-lg font-semibold mt-2">
                        {todayAttendance.checkIn
                            ? new Date(todayAttendance.checkIn).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                            : "--"}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-slate-500">
                        Check Out
                    </p>

                    <p className="text-lg font-semibold mt-2">
                        {todayAttendance.checkOut
                            ? new Date(todayAttendance.checkOut).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                            : "--"}
                    </p>
                </div>

            </div>

        </div>
    )
}

export default TodayAttendance