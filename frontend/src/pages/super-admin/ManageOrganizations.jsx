import { useEffect, useMemo, useState } from "react";
import { Search, ShieldCheck, ShieldX, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import PageHero from "../../components/layout/PageHero";
import Loading from "../../components/Loading";

const pageSize = 10;

const ManageOrganizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/super-admin/organizations", {
        params: {
          page,
          limit: pageSize,
          search,
          status: statusFilter === "all" ? undefined : statusFilter
        }
      });
      setOrganizations(data.organizations || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to load organizations");
      toast.error(error.response?.data?.error || "Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [page, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchOrganizations();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleStatusToggle = async (organization) => {
    const nextStatus = !organization.isActive;
    const confirmed = window.confirm(
      `Are you sure you want to ${nextStatus ? "activate" : "deactivate"} ${organization.companyName}?`
    );

    if (!confirmed) return;

    try {
      setTogglingId(organization._id);
      const { data } = await api.patch(`/super-admin/organizations/${organization._id}/status`, {
        isActive: nextStatus
      });
      toast.success(data.message || "Organization status updated");
      await fetchOrganizations();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update organization status");
    } finally {
      setTogglingId(null);
    }
  };

  const rows = useMemo(() => organizations, [organizations]);

  if (error && !loading && rows.length === 0) {
    return (
      <div className="card p-8 text-center text-slate-600">
        <p className="text-lg font-medium text-slate-800">Unable to load organizations</p>
        <p className="mt-2 text-sm text-slate-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHero
        icon={ShieldCheck}
        title="Manage Organizations"
        subtitle="Activate or deactivate organizations and keep platform access aligned with your policies."
      />

      <div className="card p-4 sm:p-5 mb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full pl-10!"
              placeholder="Search organizations by name or email"
            />
          </div>

          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="max-w-44">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Organization</th>
                <th>ID</th>
                <th>Registered</th>
                <th>Users</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-slate-500">Loading organizations...</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-slate-500">No organizations found</td>
                </tr>
              ) : (
                rows.map((organization) => (
                  <tr key={organization._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
                          {organization.companyName?.charAt(0)?.toUpperCase() || "O"}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{organization.companyName}</p>
                          <p className="text-xs text-slate-500">{organization.companyEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-600">{organization._id.slice(-8).toUpperCase()}</td>
                    <td className="text-slate-600">
                      {organization.createdAt ? new Date(organization.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      <div className="inline-flex items-center gap-2 text-slate-700">
                        <UserRound className="w-4 h-4 text-slate-400" />
                        {organization.userCount ?? 0}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${organization.isActive ? "badge-success" : "badge-danger"}`}>
                        {organization.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        disabled={togglingId === organization._id}
                        className={`px-3 py-2 text-sm rounded-md font-medium ${
                          organization.isActive
                            ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        } disabled:opacity-60`}
                        onClick={() => handleStatusToggle(organization)}
                      >
                        {togglingId === organization._id ? "Updating..." : organization.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1}>
            Previous
          </button>
          <button type="button" className="btn-primary" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageOrganizations;
