import React from "react";
import { useNavigate } from "react-router-dom";

import TeamAttendanceCard from "./managerDashboard/TeamAttendance";
import EmployeeLeaveRequests from "./managerDashboard/EmployeeLeaveRequests";

const ManagerDashboard = ({ data }) => {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TeamAttendanceCard
                stats={data.stats}
                onViewAll={() => navigate("/employees/attendance")}
            />

            <EmployeeLeaveRequests
                requests={data.pendingLeaveRequests}
                onViewAll={() => navigate("/employees/leaves")}
            />
        </div>
    );
};

export default ManagerDashboard;