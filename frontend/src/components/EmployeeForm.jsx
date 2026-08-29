import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DEPARTMENTS } from "../assets/assets";
import { Loader2Icon } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const EmployeeForm = ({
    initialData,
    onSuccess,
    onCancel,
    userType = "employee",
    readOnly = false
}) => {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isEditMode = !!initialData;

    const displayRole =
        userType === "manager"
            ? "Manager"
            : "Employee";

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (readOnly) {
            return;
        }

        setError("");

        const form = e.target;

        try {
            setLoading(true);

            /*
             * Backend field names
             *
             * Frontend          Backend
             * --------------------------------
             * joinDate          joiningDate
             * position          designation
             * employmentStatus  status
             */

            const payload = {
                firstName: form.firstName.value,
                lastName: form.lastName.value,
                email: form.email.value,
                phone: form.phone.value,
                role: userType,

                department: form.department.value,
                designation: form.position.value,

                joiningDate: form.joinDate.value,

                basicSalary: Number(form.basicSalary.value),

                bio: form.bio.value
            };

            /*
             * Password
             *
             * During creation it is required.
             * During edit it is optional.
             */
            if (form.password?.value) {
                payload.password = form.password.value;
            }

            /*
             * Status is only available while editing.
             */
            if (isEditMode && form.employmentStatus) {
                payload.status = form.employmentStatus.value;
            }

            /*
             * CREATE
             *
             * POST /api/users
             */
            if (!isEditMode) {

                const { data } = await api.post(
                    "/users",
                    payload
                );

                toast.success(
                    data.message ||
                    `${displayRole} created successfully`
                );

            }

            /*
             * UPDATE
             *
             * PUT /api/users/:id
             */
            else {

                const { data } = await api.put(
                    `/users/${initialData._id}`,
                    payload
                );

                toast.success(
                    data.message ||
                    `${displayRole} updated successfully`
                );
            }

            /*
             * Refresh parent page
             */
            onSuccess?.();

        } catch (err) {

            const errorMessage =
                err.response?.data?.error ||
                `Failed to ${isEditMode ? "update" : "create"} ${displayRole.toLowerCase()}`;

            setError(errorMessage);

            toast.error(errorMessage);

        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            className="space-y-6 max-w-3xl animate-fade-in"
            onSubmit={handleSubmit}
        >

            {/* =====================================================
                ERROR
            ===================================================== */}

            {error && (
                <div className="bg-rose-50 text-rose-700 p-4 rounded-xl text-sm border border-rose-200">
                    {error}
                </div>
            )}

            {/* =====================================================
                PERSONAL INFORMATION
            ===================================================== */}

            <div className="card p-5 sm:p-6">

                <h3 className="font-medium mb-6 pb-4 border-b border-slate-100">
                    Personal Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-slate-700">

                    {/* First Name */}

                    <div>
                        <label className="block mb-2">
                            First Name
                        </label>

                        <input
                            name="firstName"
                            required
                            defaultValue={initialData?.firstName || ""}
                            disabled={readOnly}
                        />
                    </div>

                    {/* Last Name */}

                    <div>
                        <label className="block mb-2">
                            Last Name
                        </label>

                        <input
                            name="lastName"
                            required
                            defaultValue={initialData?.lastName || ""}
                            disabled={readOnly}
                        />
                    </div>

                    {/* Phone */}

                    <div>
                        <label className="block mb-2">
                            Phone Number
                        </label>

                        <input
                            name="phone"
                            required
                            defaultValue={initialData?.phone || ""}
                            disabled={readOnly}
                        />
                    </div>

                    {/* Join Date */}

                    <div>
                        <label className="block mb-2">
                            Join Date
                        </label>

                        <input
                            type="date"
                            name="joinDate"
                            required
                            defaultValue={
                                initialData?.joiningDate
                                    ? new Date(initialData.joiningDate)
                                        .toISOString()
                                        .split("T")[0]
                                    : ""
                            }
                            disabled={readOnly}
                        />
                    </div>

                    {/* Bio */}

                    <div className="sm:col-span-2">

                        <label className="block mb-2">
                            Bio (Optional)
                        </label>

                        <textarea
                            name="bio"
                            defaultValue={initialData?.bio || ""}
                            rows={3}
                            className="resize-none"
                            placeholder="Brief description..."
                            disabled={readOnly}
                        />

                    </div>

                </div>

            </div>


            {/* =====================================================
                EMPLOYMENT DETAILS
            ===================================================== */}

            <div className="card p-5 sm:p-6">

                <h3 className="text-base font-medium text-slate-900 mb-6 pb-4 border-b border-slate-100">
                    Employment Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-slate-700">

                    {/* Department */}

                    <div>

                        <label className="block mb-2">
                            Department
                        </label>

                        <select
                            name="department"
                            required
                            defaultValue={
                                initialData?.department || ""
                            }
                            disabled={readOnly}
                        >

                            <option value="">
                                Select Department
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


                    {/* Position */}

                    <div>

                        <label className="block mb-2">
                            Position
                        </label>

                        <input
                            name="position"
                            required
                            defaultValue={
                                initialData?.designation ||
                                initialData?.position ||
                                ""
                            }
                            disabled={readOnly}
                        />

                    </div>


                    {/* Basic Salary */}

                    <div>

                        <label className="block mb-2">
                            Basic Salary
                        </label>

                        <input
                            type="number"
                            name="basicSalary"
                            required
                            min="0"
                            step="0.01"
                            defaultValue={
                                initialData?.basicSalary ?? 0
                            }
                            disabled={readOnly}
                        />

                    </div>


                    {/* Status */}

                    {isEditMode && (

                        <div>

                            <label className="block mb-2">
                                Status
                            </label>

                            <select
                                name="employmentStatus"
                                required
                                defaultValue={
                                    initialData?.status ||
                                    initialData?.employmentStatus ||
                                    "ACTIVE"
                                }
                                disabled={readOnly}
                            >

                                <option value="ACTIVE">
                                    Active
                                </option>

                                <option value="INACTIVE">
                                    Inactive
                                </option>

                            </select>

                        </div>

                    )}

                </div>

            </div>


            {/* =====================================================
                ACCOUNT SETUP
            ===================================================== */}

            <div className="card p-5 sm:p-6">

                <h3 className="text-base font-medium text-slate-900 mb-6 pb-4 border-b border-slate-100">
                    Account Setup
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-slate-700">

                    {/* Email */}

                    <div className="sm:col-span-2">

                        <label className="block mb-2">
                            Work Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            required
                            defaultValue={initialData?.email || ""}
                            disabled={readOnly}
                        />

                    </div>


                    {/* Password */}

                    {!isEditMode && !readOnly && (

                        <div>

                            <label className="block mb-2">
                                Temporary Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                required
                            />

                        </div>

                    )}


                    {isEditMode && !readOnly && (

                        <div>

                            <label className="block mb-2">
                                Change Password (Optional)
                            </label>

                            <input
                                type="password"
                                name="password"
                                placeholder="Leave blank to keep current"
                            />

                        </div>

                    )}


                    {/* System Role */}

                    <div>

                        <label className="block mb-2">
                            System Role
                        </label>

                        <input
                            value={displayRole}
                            disabled
                            readOnly
                        />

                    </div>

                </div>

            </div>


            {/* =====================================================
                BUTTONS
            ===================================================== */}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">

                <button
                    type="button"
                    className="btn-secondary"
                    onClick={() =>
                        onCancel
                            ? onCancel()
                            : navigate(-1)
                    }
                >
                    {readOnly ? "Close" : "Cancel"}
                </button>


                {!readOnly && (

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex items-center justify-center"
                    >

                        {loading && (
                            <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                        )}

                        {isEditMode
                            ? `Update ${displayRole}`
                            : `Create ${displayRole}`
                        }

                    </button>

                )}

            </div>

        </form>
    );
};

export default EmployeeForm;