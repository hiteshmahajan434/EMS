import { useEffect, useState } from "react";
import { dummyAdminDashboardData, dummyEmployeeDashboardData, dummyManagerDashboardData } from "../assets/assets";
import Loading from "../components/Loading";
import EmployeeDashboard from "../components/EmployeeDashboard";
import AdminDashboard from "../components/AdminDashboard";
import ManagerDashboard from "../components/ManagerDashboard";

const Dashboard = () => {
    const [employeeData, setEmployeeData] = useState(null);
    const [managerData, setManagerData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // For testing manager dashboard
        // setEmployeeData({
        //     ...dummyEmployeeDashboardData,
        //     role: "MANAGER",
        // });
        // setManagerData(dummyManagerDashboardData);
        setEmployeeData(dummyAdminDashboardData);

        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }, []);

    if (loading) return <Loading />; 

    if (!employeeData) {
        return (
            <p className="text-center text-slate-500 py-12">
                Failed to load dashboard
            </p>
        );
    }

    // Manager:
    // - EmployeeDashboard → manager's own data
    // - ManagerDashboard → team's data
    if (employeeData.role === "MANAGER") {
        return (
            <div className="space-y-6">
                <EmployeeDashboard data={employeeData} />

                <ManagerDashboard data={managerData} />
            </div>
        );
    }

    // Admin
    if (employeeData.role === "ADMIN") {
        return <AdminDashboard data={employeeData} />;
    }

    // Employee
    return <EmployeeDashboard data={employeeData} />;
};

export default Dashboard;