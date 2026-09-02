import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ClipboardCheck, Search } from "lucide-react";
import PageHero from "../../components/layout/PageHero";
import { DEPARTMENTS, getWorkingHoursDisplay } from "../../assets/assets";
import api from "../../api/axios";
import toast from "react-hot-toast";
import Loading from "../../components/Loading";

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState([]);

  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // =========================
  // Fetch Attendance
  // =========================
  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);

      const params = {};

      if (selectedRole) {
        params.filterRole = selectedRole;
      }

      if (selectedDept) {
        params.department = selectedDept;
      }

      if (selectedStatus) {
        params.status = selectedStatus;
      }

      if (selectedDate) {
        params.date = selectedDate;
      }

      const { data } = await api.get("/attendance/team", {
        params,
      });

      setAttendance(data);

    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch attendance"
      );

      setAttendance([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [
    selectedRole,
    selectedDept,
    selectedStatus,
    selectedDate,
  ]);

  // Fetch when filters change
  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);


  // =========================
  // Search
  // =========================
  const filteredAttendance = useMemo(() => {
    return attendance.filter((record) => {
      const user = record.userId;

      const fullName = `${user?.firstName || ""} ${
        user?.lastName || ""
      }`.toLowerCase();

      return fullName.includes(search.toLowerCase());
    });
  }, [attendance, search]);


  // =========================
  // Stats
  // =========================
  const presentCount = attendance.filter(
    (record) => record.status === "PRESENT"
  ).length;

  const lateCount = attendance.filter(
    (record) => record.status === "LATE"
  ).length;

  const workingCount = attendance.filter(
    (record) => !record.checkOut
  ).length;

  const absentCount = 0;

  const leaveCount = 0;

  if (initialLoading) return <Loading />;

  return (
    <div>

      {/* Hero */}
      <PageHero
        icon={ClipboardCheck}
        title="Employee Attendance"
        subtitle="Monitor today's attendance, working hours, and team availability."
        badge={`${filteredAttendance.length} Records`}
      />


      {/* =========================
          Stats
      ========================= */}
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
              Late
            </p>

            <p className="text-lg font-semibold text-amber-600 mt-0.5">
              {lateCount}
            </p>
          </div>
        </div>


        <div className="summary-pill">
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-wide font-medium">
              Records
            </p>

            <p className="text-lg font-semibold text-slate-700 mt-0.5">
              {attendance.length}
            </p>
          </div>
        </div>

      </div>


      {/* =========================
          Filters
      ========================= */}
      <div className="card p-5 mb-8">

        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <div className="relative flex-1">

            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            />

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
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>


          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="max-w-40"
          >
            <option value="">All Status</option>
            <option value="PRESENT">Present</option>
            <option value="LATE">Late</option>
          </select>

        </div>

      </div>


      {/* =========================
          Table
      ========================= */}
      <div className="card overflow-hidden">

        <div className="px-6 py-4 border-b border-slate-100">

          <h3 className="font-semibold text-slate-900">
            Attendance Records
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

              {loading ? (

                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12"
                  >
                    <div className="flex justify-center">
                      <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
                    </div>
                  </td>
                </tr>

              ) : filteredAttendance.length === 0 ? (

                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-slate-400"
                  >
                    No attendance records found
                  </td>
                </tr>

              ) : (

                filteredAttendance.map((record) => {

                  const user = record.userId;

                  return (
                    <tr key={record._id}>

                      {/* Employee */}
                      <td className="px-6 py-4 font-medium text-slate-900">

                        {user?.firstName || "-"}{" "}
                        {user?.lastName || ""}

                      </td>


                      {/* Role */}
                      <td className="px-6 py-4 text-slate-600 capitalize">

                        {user?.role || "-"}

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
                            record.status === "PRESENT"
                              ? "badge-success"
                              : record.status === "LATE"
                              ? "badge-warning"
                              : "badge-danger"
                          }`}
                        >
                          {record.status}

                        </span>

                      </td>

                    </tr>
                  );
                })

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default AdminAttendance;