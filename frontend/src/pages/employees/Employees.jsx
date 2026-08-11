import { useCallback, useEffect, useState } from "react";
import { dummyEmployeeData, DEPARTMENTS } from "../../assets/assets";
import { Plus, Search, Users, X } from "lucide-react";
import EmployeeCard from "../../components/EmployeeCard";
import EmployeeForm from "../../components/EmployeeForm";
import PageHero from "../../components/layout/PageHero";

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [selectedDept, setSelectedDept] = useState("");
    const [selectedManager, setSelectedManager] = useState("");

    const [editEmployee, setEditEmployee] = useState(null);
    const [viewEmployee, setViewEmployee] = useState(null);

    const [showCreateModal, setShowCreateModal] = useState(false);

    // Temporary role
    // Later this will come from Auth Context
    const role = "ADMIN";

    const fetchEmployees = useCallback(async () => {
        setLoading(true);

        setEmployees(
            dummyEmployeeData.filter((emp) =>
                selectedDept
                    ? emp.department === selectedDept
                    : true
            )
        );

        setLoading(false);
    }, [selectedDept]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    // Managers for Admin filter
    const managers = dummyEmployeeData.filter(
        (emp) => emp.role === "manager"
    );

    // Search + Manager filter
    const filtered = employees.filter((emp) => {
        const matchesSearch =
            `${emp.firstName} ${emp.lastName} ${emp.position}`
                .toLowerCase()
                .includes(search.toLowerCase());

        const matchesManager =
            role === "ADMIN" && selectedManager
                ? emp.managerId === selectedManager
                : true;

        return matchesSearch && matchesManager;
    });

    return (
        <div className="animate-fade-in">

            {/* Header */}
            <PageHero
                icon={Users}
                title="Employees"
                subtitle="Manage your employees, assign roles, and update information."
                badge={`${filtered.length} Employees`}
            >
                <button
                    className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
                    onClick={() => setShowCreateModal(true)}
                >
                    <Plus size={16} />
                    Add Employee
                </button>
            </PageHero>

            {/* Search and Filters */}
            <div className="card p-4 sm:p-5 mb-6">

                <div className="flex flex-col sm:flex-row gap-3">

                    {/* Search */}
                    <div className="relative flex-1">

                        <Search
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"
                        />

                        <input
                            placeholder="Search employees..."
                            className="w-full pl-10!"
                            onChange={(e) => setSearch(e.target.value)}
                            value={search}
                        />

                    </div>

                    {/* Manager Filter - Admin Only */}
                    {role === "ADMIN" && (
                        <select
                            value={selectedManager}
                            onChange={(e) =>
                                setSelectedManager(e.target.value)
                            }
                            className="max-w-40"
                        >
                            <option value="">
                                All Managers
                            </option>

                            {managers.map((manager) => (
                                <option
                                    value={manager.id}
                                    key={manager.id}
                                >
                                    {manager.firstName}{" "}
                                    {manager.lastName}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Department Filter */}
                    <select
                        value={selectedDept}
                        onChange={(e) =>
                            setSelectedDept(e.target.value)
                        }
                        className="max-w-40"
                    >
                        <option value="">
                            All Departments
                        </option>

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

            {/* Employee Cards */}
            {loading ? (
                <div className="flex justify-center">
                    <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">

                    {filtered.length === 0 ? (
                        <p className="col-span-full text-center py-16 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                            No employees found
                        </p>
                    ) : (
                        filtered.map((emp) => (
                            <EmployeeCard
                                key={emp.id}
                                employee={emp}
                                onDelete={fetchEmployees}
                                onEdit={(employee) =>
                                    setEditEmployee(employee)
                                }
                                onView={(employee) =>
                                    setViewEmployee(employee)
                                }
                            />
                        ))
                    )}

                </div>
            )}

            {/* =====================================================
                CREATE EMPLOYEE MODAL
            ===================================================== */}

            {showCreateModal && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-black/40 backdrop-blur-sm"
                    onClick={() =>
                        setShowCreateModal(false)
                    }
                >

                    <div
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 animate-fade-in"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* Header */}
                        <div className="flex items-center justify-between p-6 pb-0">

                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Add New Employee
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Create a user account and employee profile
                                </p>
                            </div>

                            <button
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                                onClick={() =>
                                    setShowCreateModal(false)
                                }
                            >
                                <X className="w-5 h-5" />
                            </button>

                        </div>

                        {/* Form */}
                        <div className="p-6">

                            <EmployeeForm
                                userType="employee"
                                onSuccess={() => {
                                    setShowCreateModal(false);
                                    fetchEmployees();
                                }}
                                onCancel={() => {
                                    setShowCreateModal(false);
                                }}
                            />

                        </div>

                    </div>

                </div>
            )}

            {/* =====================================================
                EDIT EMPLOYEE MODAL
            ===================================================== */}

            {editEmployee && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-black/40 backdrop-blur-sm"
                    onClick={() =>
                        setEditEmployee(null)
                    }
                >

                    <div
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 animate-fade-in"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* Header */}
                        <div className="flex items-center justify-between p-6 pb-0">

                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Edit Employee
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Update employee details
                                </p>
                            </div>

                            <button
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                                onClick={() =>
                                    setEditEmployee(null)
                                }
                            >
                                <X className="w-5 h-5" />
                            </button>

                        </div>

                        {/* Form */}
                        <div className="p-6">

                            <EmployeeForm
                                userType="employee"
                                initialData={editEmployee}
                                onSuccess={() => {
                                    setEditEmployee(null);
                                    fetchEmployees();
                                }}
                                onCancel={() => {
                                    setEditEmployee(null);
                                }}
                            />

                        </div>

                    </div>

                </div>
            )}

            {/* =====================================================
                VIEW EMPLOYEE MODAL
            ===================================================== */}

            {viewEmployee && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-black/40 backdrop-blur-sm"
                    onClick={() =>
                        setViewEmployee(null)
                    }
                >

                    <div
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 animate-fade-in"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* Header */}
                        <div className="flex items-center justify-between p-6 pb-0">

                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Employee Details
                                </h2>

                                <p className="text-sm text-slate-500">
                                    View employee information
                                </p>
                            </div>

                            <button
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                                onClick={() =>
                                    setViewEmployee(null)
                                }
                            >
                                <X className="w-5 h-5" />
                            </button>

                        </div>

                        {/* Read-only Employee Form */}
                        <div className="p-6">

                            <EmployeeForm
                                initialData={viewEmployee}
                                userType="employee"
                                readOnly={true}
                                onCancel={() =>
                                    setViewEmployee(null)
                                }
                            />

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
};

export default Employees;