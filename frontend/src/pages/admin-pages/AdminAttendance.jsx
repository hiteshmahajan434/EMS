import { useState } from "react";
import { format } from "date-fns";
import { ClipboardCheck, Search } from "lucide-react";
import PageHero from "../../components/layout/PageHero";
import {
  dummyEmployeeAttendance,
  DEPARTMENTS,
  getWorkingHoursDisplay,
} from "../../assets/assets";

const AdminAttendance = () => {
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Stats
  const presentCount = dummyEmployeeAttendance.filter(
    (emp) => emp.status === "Present"
  ).length;

  const workingCount = dummyEmployeeAttendance.filter(
    (emp) => emp.status === "Working"
  ).length;

  const absentCount = dummyEmployeeAttendance.filter(
    (emp) => emp.status === "Absent"
  ).length;

  const leaveCount = dummyEmployeeAttendance.filter(
    (emp) => emp.status === "On Leave"
  ).length;

  // Filters
  const filteredAttendance = dummyEmployeeAttendance.filter((record) => {
    const matchesSearch = `${record.firstName} ${record.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesRole =
      selectedRole === "" || record.role === selectedRole;

    const matchesDept =
      selectedDept === "" || record.department === selectedDept;

    const matchesStatus =
      selectedStatus === "" || record.status === selectedStatus;

    const matchesDate =
      selectedDate === "" ||
      record.date.slice(0, 10) === selectedDate;

    return (
      matchesSearch &&
      matchesRole &&
      matchesDept &&
      matchesStatus &&
      matchesDate
    );
  });

  return (
    <div>
      {/* Hero */}
      <PageHero
        icon={ClipboardCheck}
        title="Employee Attendance"
        subtitle="Monitor today's attendance, working hours, and team availability."
        badge={`${filteredAttendance.length} Records`}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="summary-pill">
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-wide font-medium">
              Present
            </p>

            <p className="text-lg font-semibold text-emerald-600 mt-0.5">
              {presentCount}
            </p>
          </div>
        </div>

        <div className="summary-pill">
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-wide font-medium">
              Working
            </p>

            <p className="text-lg font-semibold text-blue-600 mt-0.5">
              {workingCount}
            </p>
          </div>
        </div>

        <div className="summary-pill">
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-wide font-medium">
              Absent
            </p>

            <p className="text-lg font-semibold text-rose-600 mt-0.5">
              {absentCount}
            </p>
          </div>
        </div>

        <div className="summary-pill">
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-wide font-medium">
              On Leave
            </p>

            <p className="text-lg font-semibold text-amber-900 mt-0.5">
              {leaveCount}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-5 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              type="text"
              placeholder="Search employee..."
              className="w-full pl-10!"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Date */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="max-w-44"
          />

          {/* Role */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="max-w-40"
          >
            <option value="">All Roles</option>
            <option value="employee">Employees</option>
            <option value="manager">Managers</option>
          </select>

          {/* Department */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="max-w-44"
          >
            <option value="">All Departments</option>

            {DEPARTMENTS.map((dept) => (
              <option key={dept}>{dept}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="max-w-40"
          >
            <option value="">All Status</option>
            <option>Present</option>
            <option>Working</option>
            <option>Absent</option>
            <option>On Leave</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">
            Today's Attendance
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Working Hours</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-slate-400"
                  >
                    No attendance records found
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((record) => (
                  <tr key={record.id || record._id}>

                    {/* Employee */}
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {record.firstName} {record.lastName}
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4 text-slate-600 capitalize">
                      {record.role || "-"}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-slate-600">
                      {format(
                        new Date(record.date),
                        "MMM dd, yyyy"
                      )}
                    </td>

                    {/* Check In */}
                    <td className="px-6 py-4 text-slate-600">
                      {record.checkIn
                        ? format(
                            new Date(record.checkIn),
                            "hh:mm a"
                          )
                        : "-"}
                    </td>

                    {/* Check Out */}
                    <td className="px-6 py-4 text-slate-600">
                      {record.checkOut
                        ? format(
                            new Date(record.checkOut),
                            "hh:mm a"
                          )
                        : "-"}
                    </td>

                    {/* Working Hours */}
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {getWorkingHoursDisplay(record)}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`badge ${
                          record.status === "Present"
                            ? "badge-success"
                            : record.status === "Working"
                            ? "badge-info"
                            : record.status === "On Leave"
                            ? "badge-warning"
                            : "badge-danger"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendance;