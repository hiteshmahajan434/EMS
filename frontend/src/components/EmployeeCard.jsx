import {
    EyeIcon,
    PencilIcon,
    Trash2Icon
} from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const EmployeeCard = ({ employee, onDelete, onEdit, onView }) => {

    const handleDelete = async () => {
        if (
            !confirm(
                `Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`
            )
        ) {
            return;
        }

        try {
            const { data } = await api.delete(
                `/users/${employee._id}`
            );

            toast.success(
                data.message || "Employee deleted successfully"
            );

            onDelete?.();

        } catch (err) {
            toast.error(
                err.response?.data?.error ||
                "Failed to delete employee"
            );
        }
    };

    return (
        <div className="group relative card card-hover overflow-hidden">

            {/* Avatar */}
            <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">

                <div className="w-full h-full flex items-center justify-center">

                    <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">

                        <span className="text-xl font-semibold text-indigo-700">
                            {employee.firstName?.charAt(0)}
                            {employee.lastName?.charAt(0)}
                        </span>

                    </div>

                </div>

            </div>

            {/* Department + Deleted Badge */}
            <div className="absolute top-1 left-0 m-2 flex gap-2">

                <span className="bg-white/95 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-slate-600 rounded-lg shadow-sm">
                    {employee.department || "Remote"}
                </span>

                {employee.isDeleted && (
                    <span className="bg-rose-500 font-medium text-white px-2.5 py-1 text-xs rounded-lg">
                        DELETED
                    </span>
                )}

            </div>

            {/* Hover Actions */}
            {!employee.isDeleted && (
                <div
                    className="
                        absolute inset-0
                        bg-slate-900/0
                        group-hover:bg-slate-900/5
                        transition-colors
                        flex items-end justify-end
                        pb-6
                        gap-2.5
                        px-2.5
                        opacity-0
                        group-hover:opacity-100
                    "
                >

                    {/* View */}
                    <button
                        type="button"
                        title="View Details"
                        onClick={() => onView?.(employee)}
                        className="
                            p-2.5
                            bg-white
                            rounded-xl
                            hover:bg-indigo-50
                            transition-all
                            text-slate-700
                            hover:text-indigo-600
                            shadow-lg
                            hover:scale-105
                        "
                    >
                        <EyeIcon className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                        type="button"
                        title="Edit Employee"
                        onClick={() => onEdit?.(employee)}
                        className="
                            p-2.5
                            bg-white
                            rounded-xl
                            hover:bg-indigo-50
                            transition-all
                            text-slate-700
                            hover:text-indigo-600
                            shadow-lg
                            hover:scale-105
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
                            bg-white
                            rounded-xl
                            hover:bg-rose-50
                            transition-all
                            text-slate-700
                            hover:text-rose-600
                            shadow-lg
                            hover:scale-105
                        "
                    >
                        <Trash2Icon className="w-4 h-4" />
                    </button>

                </div>
            )}

            {/* Employee Information */}
            <div className="p-5">

                <h3 className="text-slate-900 font-medium">
                    {employee.firstName}{" "}
                    {employee.lastName}
                </h3>

                <p className="text-xs text-slate-500 mt-0.5">
                    {employee.designation}
                </p>

            </div>

        </div>
    );
};

export default EmployeeCard;