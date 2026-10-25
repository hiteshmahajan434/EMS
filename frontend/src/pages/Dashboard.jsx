import { useEffect, useState } from "react";

import Loading from "../components/Loading";
import EmployeeDashboard from "../components/EmployeeDashboard";
import AdminDashboard from "../components/AdminDashboard";
import ManagerDashboard from "../components/ManagerDashboard";
import SuperAdminDashboard from "./super-admin/SuperAdminDashboard";

import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import {toast} from "react-hot-toast"

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const {user, loading : authLoading} = useAuth();
    const role = user?.role; // "admin" | "manager" | "employee"

    useEffect(() => {
        if (authLoading || role === "superadmin") {
            if (!authLoading && role === "superadmin") {
                setLoading(false);
            }
            return;
        }

        if (!user) {
            setLoading(false);
            return;
        }
        
        const fetchDashboard = async () => {
            try {
                const res = await api.get("/dashboard");
                setData(res.data);
            } catch (err) {
                console.error("Dashboard Error:", err);
                toast.error(
                    err.response?.data?.error ||
                    err.message ||
                    "Failed to load dashboard data"
                );
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [authLoading, user, role]);

    if (loading) return <Loading />; 

    if (role === "superadmin") {
        return <SuperAdminDashboard />;
    }

    if (!data) {
        return (
            <p className="text-center text-slate-500 py-12">
                Failed to load dashboard
            </p>
        );
    }

    // Manager:
    // - EmployeeDashboard → manager's own data
    // - ManagerDashboard → team's data
    if (role === "manager") {
        return (
            <div className="space-y-6">
                <EmployeeDashboard data={data.employeeData} />

                <ManagerDashboard data={data.managerData} />
            </div>
        );
    }

    // Admin
    if (role === "admin") {
        return <AdminDashboard data={data} />;
    }

    // Employee
    if(role === "employee"){
        return <EmployeeDashboard data={data} />;
    }

    return (
        <p className="text-center text-slate-500 py-12">
            Invalid user role
        </p>
    );

};

export default Dashboard;