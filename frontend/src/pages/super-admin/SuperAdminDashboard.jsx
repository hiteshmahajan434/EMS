import { useEffect, useState } from "react";
import { Building2, BriefcaseBusiness, RefreshCcw, ShieldCheck, Users2 } from "lucide-react";
import { BarChart, Bar, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PageHero from "../../components/layout/PageHero";
import api from "../../api/axios";
import toast from "react-hot-toast";
import Loading from "../../components/Loading";

const cardConfig = [
  { key: "totalOrganizations", label: "Total Organizations", icon: Building2 },
  { key: "activeOrganizations", label: "Active Organizations", icon: ShieldCheck },
  { key: "inactiveOrganizations", label: "Inactive Organizations", icon: BriefcaseBusiness },
  { key: "totalUsers", label: "Total Users Across All Organizations", icon: Users2 }
];

const COLORS = ["#6366f1", "#e2e8f0"];

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/super-admin/dashboard");
      setStats(data);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to load dashboard data");
      toast.error(error.response?.data?.error || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (!stats) {
    return (
      <div className="card p-8 text-center text-slate-600">
        <p className="text-lg font-medium text-slate-800">Unable to load dashboard</p>
        <p className="mt-2 text-sm text-slate-500">{error || "No data is available right now."}</p>
      </div>
    );
  }

  const summary = stats.summary || {};
  const monthlyBarData = (stats.monthlyOrganizationStats || []).map((item) => ({
    ...item,
    month: item.month?.slice(5) || item.month
  }));

  const donutData = (stats.activeInactiveBreakdown || []).map((item) => ({
    name: item.name,
    value: Number(item.value || 0)
  }));

  const userDistributionData = (stats.userDistribution || []).map((item) => ({
    name: item.name || "Unknown",
    users: Number(item.users || 0)
  }));

  const growthData = (stats.organizationGrowth || []).map((item) => ({
    month: item.month?.slice(5) || item.month,
    organizations: Number(item.organizations || 0)
  }));

  return (
    <div className="animate-fade-in space-y-6">
      <PageHero
        icon={Building2}
        title="Super Admin Dashboard"
        subtitle="Monitor organizations, users, and platform health across the ecosystem."
      >
        <button className="btn-secondary flex items-center gap-2" onClick={fetchDashboard} type="button">
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </button>
      </PageHero>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {cardConfig.map(({ key, label, icon: Icon }) => (
          <div key={key} className="card card-hover p-5 sm:p-6 relative overflow-hidden group flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">{label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{summary[key] ?? 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Organizations created per month</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyBarData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="organizations" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Active vs. inactive organizations</h2>
          </div>
          <div className="h-72">
            {donutData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-500">No status data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={2}>
                    {donutData.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">User distribution across organizations</h2>
          </div>
          <div className="h-72">
            {userDistributionData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-500">No user distribution available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userDistributionData} layout="vertical" margin={{ left: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip />
                  <Bar dataKey="users" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Organization growth over time</h2>
          </div>
          <div className="h-72">
            {growthData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-500">No growth history available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="organizations" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
