import { useCallback, useEffect, useState } from "react"
import Loading from "../components/Loading";
import CheckInButton from "../components/attendance/CheckInButton";
import AttendanceStats from "../components/attendance/AttendanceStats";
import { AttendanceHistory } from "../components/attendance/AttendanceHistory";
import { CalendarClock } from "lucide-react";
import PageHero from "../components/layout/PageHero";
import api from "../api/axios";
import toast from "react-hot-toast";

const Attendance = () => {
  const [summary, setSummary] = useState(null);
  const [todayRecord, setTodayRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [isDeleted, setIsDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchData = useCallback(async () => {
      setLoading(true);

      try {
          const { data } = await api.get("/attendance/my");
          setSummary(data.summary);
          setTodayRecord(data.todayRecord);
          setHistory(data.attendance);
          setIsDeleted(data.user.isDeleted);
      } catch (err) {
          toast.error(err.response?.data?.error || "Failed to load attendance");
      } finally {
          setLoading(false);
          setInitialLoading(false);
      }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
    if(initialLoading) return <Loading/>;

return (
    <div className="animate-fade-in space-y-8">
        <PageHero
            icon={CalendarClock}
            title="Attendance"
            subtitle="Track your work hours, check in daily, and review your attendance history."
        />

        {isDeleted ? (
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center">
                <p className="text-rose-600">
                    You can no longer clock in or out because your employee
                    records have been marked as deleted.
                </p>
            </div>
        ) : (
            <CheckInButton
                todayRecord={todayRecord}
                onAction={fetchData}
            />
        )}

        <AttendanceStats summary={summary} />

        <AttendanceHistory history={history} />
    </div>
);
}

export default Attendance