import React, { useCallback, useEffect, useState } from "react";
import {
  Calendar1Icon,
  CheckCircle2Icon,
  Clock3Icon,
  FileTextIcon,
  XCircleIcon,
  SearchIcon,
  FilterIcon,
  XIcon
} from "lucide-react";
import Loading from "../../components/Loading";
import PageHero from "../../components/layout/PageHero";
import LeaveHistory from "../../components/leave/LeaveHistory";
import api from "../../api/axios";

const ManagerLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/leave", {
        params: {
          date: date || undefined,
          status: status || undefined
        }
      });

      setLeaves(data.data || []);
    } catch (error) {
      console.error("Failed to fetch employee leaves:", error);
      setLeaves([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [date, status]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  // if (loading) return <Loading />;

  const filteredLeaves = leaves.filter((leave) => {
    const name = `${leave.user?.firstName || ""} ${leave.user?.lastName || ""}`
      .toLowerCase();

    return name.includes(search.toLowerCase());
  });

  const totalRequests = filteredLeaves.length;

  const pendingCount = filteredLeaves.filter(
    (leave) => leave.status === "PENDING"
  ).length;

  const approvedCount = filteredLeaves.filter(
    (leave) => leave.status === "APPROVED"
  ).length;

  const rejectedCount = filteredLeaves.filter(
    (leave) => leave.status === "REJECTED"
  ).length;

  const leaveStats = [
    { label: "Total Requests",value: totalRequests,icon: FileTextIcon },
    { label: "Pending",value: pendingCount,icon: Clock3Icon },
    { label: "Approved",value: approvedCount,icon: CheckCircle2Icon },
    { label: "Rejected",value: rejectedCount,icon: XCircleIcon },
  ];

  if (initialLoading) {
    return <Loading />;
  }

  return (
    <div>
      <PageHero
        icon={Calendar1Icon}
        title="Employee Leave Requests"
        subtitle="Review, approve, and manage leave requests submitted by your team."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mb-8">
        {leaveStats.map((stat) => (
          <div
            key={stat.label}
            className="card card-hover p-5 sm:p-6 flex items-center gap-4 relative overflow-hidden group"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-slate-500/70 group-hover:bg-indigo-500/70" />

            <div className="p-3 bg-slate-100 rounded-lg group-hover:bg-indigo-50 transition-colors duration-200">
              <stat.icon className="w-5 h-5 text-slate-600 group-hover:text-indigo-600 transition-colors duration-200" />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                {stat.label}
              </p>

              <p className="text-2xl font-bold text-slate-900 tracking-tight">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 sm:p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search Employee */}
          <div className="relative flex-1">
            <SearchIcon
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"
            />

            <input
              placeholder="Search managers..."
              className="w-full pl-10!"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Date */}
          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="max-w-52"
            />
          </div>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="max-w-40"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

        </div>
      </div>

      <LeaveHistory
        leaves={filteredLeaves}
        isManagerAdmin={true}
        onUpdate={fetchLeaves}
        loading = {loading}
      />
    </div>
  );
};

export default ManagerLeaves;