import React, { useCallback, useEffect, useState } from "react";
import { Calendar1Icon, CheckCircle2Icon, Clock3Icon, FileTextIcon, XCircleIcon } from "lucide-react";
import { dummyLeaveData } from "../../assets/assets";
import Loading from "../../components/Loading";
import PageHero from "../../components/layout/PageHero";
import LeaveHistory from "../../components/leave/LeaveHistory";

const ManagerLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = useCallback(() => {
    setLeaves(dummyLeaveData);

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  if (loading) return <Loading />;

  const totalRequests = leaves.length;

  const pendingCount = leaves.filter(
    (leave) => leave.status === "PENDING"
  ).length;

  const approvedCount = leaves.filter(
    (leave) => leave.status === "APPROVED"
  ).length;

  const rejectedCount = leaves.filter(
    (leave) => leave.status === "REJECTED"
  ).length;

  const leaveStats = [
    { label: "Total Requests",value: totalRequests,icon: FileTextIcon },
    { label: "Pending",value: pendingCount,icon: Clock3Icon },
    { label: "Approved",value: approvedCount,icon: CheckCircle2Icon },
    { label: "Rejected",value: rejectedCount,icon: XCircleIcon },
  ];

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

      <LeaveHistory
        leaves={leaves}
        isManagerAdmin={true}
        onUpdate={fetchLeaves}
      />
    </div>
  );
};

export default ManagerLeaves;