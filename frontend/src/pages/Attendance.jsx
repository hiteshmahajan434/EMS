import { useCallback, useEffect, useState } from "react"
import { dummyAttendanceData } from "../assets/assets";
import Loading from "../components/Loading";
import CheckInButton from "../components/attendance/CheckInButton";
import AttendanceStats from "../components/attendance/AttendanceStats";
import { AttendanceHistory } from "../components/attendance/AttendanceHistory";
import { CalendarClock } from "lucide-react";
import PageHero from "../components/layout/PageHero";

const Attendance = () => {
  const [summary, setSummary] = useState(null);
  const [todayRecord, setTodayRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [isDeleted, setIsDeleted] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
      setLoading(true);

      // Later replace this with axios.get(...)
      const response = dummyAttendanceData;

      setSummary(response.summary);
      setTodayRecord(response.todayRecord);
      setHistory(response.attendanceHistory);
      setIsDeleted(response.user.isDeleted);

      setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  if(loading) return <Loading/>;

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