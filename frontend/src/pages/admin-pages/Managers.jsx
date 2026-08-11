import { useCallback, useEffect, useState } from "react";
import { dummyEmployeeData, DEPARTMENTS } from "../../assets/assets";
import { Plus, Search, Users, X } from "lucide-react";
import EmployeeCard from "../../components/EmployeeCard";
import EmployeeForm from "../../components/EmployeeForm";
import PageHero from "../../components/layout/PageHero";

const Managers = () => {
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedDept, setSelectedDept] = useState("");
    const [editManager, setEditManager] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const fetchManagers = useCallback(async () => {
        setLoading(true);

        // Temporary dummy data
        // Later we will replace this with GET /api/users?role=manager
        setManagers(
            dummyEmployeeData.filter((user) =>
                selectedDept
                    ? user.department === selectedDept
                    : true
            )
        );

        setLoading(false);
    }, [selectedDept]);

    useEffect(() => {
        fetchManagers();
    }, [fetchManagers]);

    const filtered = managers.filter((manager) =>
        `${manager.firstName} ${manager.lastName} ${manager.position}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div className="animate-fade-in">

            {/* Header */}
            <PageHero
                icon={Users}
                title="Managers"
                subtitle="Manage your managers and update their information."
                badge={`${filtered.length} Managers`}
            >
                <button
                    className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
                    onClick={() => setShowCreateModal(true)}
                >
                    <Plus size={16} />
                    Add Manager
                </button>
            </PageHero>

            {/* Search & Filter */}
            <div className="card p-4 sm:p-5 mb-6">
                <div className="flex flex-col sm:flex-row gap-3">

                    <div className="relative flex-1">
                        <Search
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"
                        />

                        <input
                            placeholder="Search managers..."
                            className="w-full pl-10!"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="max-w-40"
                    >
                        <option value="">All Departments</option>

                        {DEPARTMENTS.map((deptName) => (
                            <option
                                value={deptName}
                                key={deptName}
                            >
                                {deptName}
                            </option>
                        ))}
                    </select>

                </div>
            </div>

            {/* Manager Cards */}
            {loading ? (
                <div className="flex justify-center">
                    <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">

                    {filtered.length === 0 ? (
                        <p className="col-span-full text-center py-16 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                            No managers found
                        </p>
                    ) : (
                        filtered.map((manager) => (
                            <EmployeeCard
                                key={manager.id}
                                employee={manager}
                                onDelete={fetchManagers}
                                onEdit={(manager) =>
                                    setEditManager(manager)
                                }
                            />
                        ))
                    )}

                </div>
            )}

            {/* Create Manager Modal */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-black/40 backdrop-blur-sm"
                    onClick={() => setShowCreateModal(false)}
                >
                    <div
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 animate-fade-in"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="flex items-center justify-between p-6 pb-0">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Add New Manager
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Create a manager account and profile
                                </p>
                            </div>

                            <button
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                                onClick={() => setShowCreateModal(false)}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <EmployeeForm
                                onSuccess={() => {
                                    setShowCreateModal(false);
                                    fetchManagers();
                                }}
                                onCancel={() => {
                                    setShowCreateModal(false);
                                }}
                            />
                        </div>

                    </div>
                </div>
            )}

            {/* Edit Manager Modal */}
            {editManager && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-black/40 backdrop-blur-sm"
                    onClick={() => setEditManager(null)}
                >
                    <div
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 animate-fade-in"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="flex items-center justify-between p-6 pb-0">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Edit Manager
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Update manager details
                                </p>
                            </div>

                            <button
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                                onClick={() => setEditManager(null)}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <EmployeeForm
                                initialData={editManager}
                                onSuccess={() => {
                                    setEditManager(null);
                                    fetchManagers();
                                }}
                                onCancel={() => {
                                    setEditManager(null);
                                }}
                            />
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default Managers;