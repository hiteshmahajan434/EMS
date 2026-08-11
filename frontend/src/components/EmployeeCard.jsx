import {
    EyeIcon,
    PencilIcon,
    Trash2Icon
} from "lucide-react";
import React from "react";

const EmployeeCard = ({
    employee,
    onDelete,
    onEdit,
    onView
}) => {

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this employee?")) {
            return;
        }

        // Delete API will be added later
    };

    return (
        <div className="group relative card card-hover overflow-hidden">

            {/* Avatar */}
            <div className="relative aspect-4/3 w-full overflow-hidden bg-linear-to-br from-slate-100 to-slate-50">

                <div className="w-full h-full flex items-center justify-center">

                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-indigo-100 to-slate-100 flex items-center justify-center">

                        <span className="text-2xl font-medium text-indigo-400">
                            {employee.firstName[0]}
                            {employee.lastName[0]}
                        </span>

                    </div>

                </div>

            </div>

            {/* Department + Deleted Badge */}
            <div className="absolute top-3 left-3 flex gap-2">

                <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-slate-600 rounded-lg shadow-sm">
                    {employee.department || "Remote"}
                </span>

                {employee.isDeleted && (
                    <span className="bg-red-500/60 font-medium text-white px-2.5 py-1 text-xs rounded">
                        DELETED
                    </span>
                )}

            </div>

            {/* Hover Actions */}
            {!employee.isDeleted && (
                <div
                    className="
                        absolute inset-0
                        bg-linear-to-t
                        from-indigo-700/20
                        via-transparent
                        to-transparent

                        opacity-0
                        group-hover:opacity-100

                        transition-opacity
                        duration-200

                        flex items-end justify-end

                        pb-6 pr-5 gap-2
                    "
                >

                    {/* View */}
                    <button
                        type="button"
                        title="View Details"
                        onClick={() =>
                            onView(employee)
                        }
                        className="
                            p-2.5
                            bg-white/90
                            backdrop-blur-sm
                            text-slate-700
                            hover:text-blue-600
                            rounded-xl
                            shadow-lg
                            transition-all
                            duration-200
                        "
                    >
                        <EyeIcon className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                        type="button"
                        title="Edit Employee"
                        onClick={() =>
                            onEdit(employee)
                        }
                        className="
                            p-2.5
                            bg-white/90
                            backdrop-blur-sm
                            text-slate-700
                            hover:text-indigo-600
                            rounded-xl
                            shadow-lg
                            transition-all
                            duration-200
                            delay-75
                        "
                    >
                        <PencilIcon className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                        type="button"
                        title="Delete Employee"
                        onClick={handleDelete}
                        className="
                            p-2.5
                            bg-white/90
                            backdrop-blur-sm
                            text-slate-700
                            hover:text-rose-600
                            rounded-xl
                            shadow-lg
                            transition-all
                            duration-200
                            delay-100
                        "
                    >
                        <Trash2Icon className="w-4 h-4" />
                    </button>

                </div>
            )}

            {/* Employee Information */}
            <div className="p-5">

                <h3>
                    {employee.firstName}{" "}
                    {employee.lastName}
                </h3>

                <p className="text-xs text-slate-500">
                    {employee.position}
                </p>

            </div>

        </div>
    );
};

export default EmployeeCard;