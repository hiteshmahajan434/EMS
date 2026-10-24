import { Loader2, Save, User, Building2 } from 'lucide-react';
import { useState } from 'react'
import api from '../api/axios';
import toast from 'react-hot-toast';
import { DEPARTMENTS, INDUSTRIES } from '../assets/assets';

const ReadOnlyField = ({ label, value }) => (
    <div>
        <label className='block text-sm font-medium text-slate-700 mb-2'>
            {label}
        </label>
        <input
            disabled
            value={value || ""}
            placeholder="Not provided"
            className='bg-slate-50 text-slate-500 cursor-not-allowed'
        />
    </div>
);

const EditableField = ({
    label,
    name,
    defaultValue = "",
    type = "text",
    disabled = false,
    required = false,
    min,
    step
}) => (
    <div>
        <label className='block text-sm font-medium text-slate-700 mb-2'>
            {label}
        </label>
        <input
            name={name}
            type={type}
            defaultValue={defaultValue}
            disabled={disabled}
            required={required}
            min={min}
            step={step}
            className={disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}
        />
    </div>
);

const normalizeFieldValue = (field, value) => {
    if (field === "basicSalary") {
        return value === "" || value == null ? "" : String(Number(value));
    }

    if (field === "joiningDate") {
        return value ? new Date(value).toISOString().slice(0, 10) : "";
    }

    return String(value ?? "");
};

const ProfileForm = ({ initialData, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const isAdmin = initialData.role === "admin";
    const organization = initialData.organization;

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        try {
            const form = e.currentTarget;
            const payload = {
                firstName: form.firstName.value,
                lastName: form.lastName.value,
                phone: form.phone.value,
                bio: form.bio.value
            };

            if (isAdmin) {
                payload.companyName = form.companyName.value;
                payload.companyPhone = form.companyPhone.value;
                payload.website = form.website.value;
                payload.address = form.address.value;
                payload.industry = form.industry.value;
            } else {
                payload.joiningDate = form.joiningDate.value;
                payload.department = form.department.value;
                payload.designation = form.designation.value;
                payload.basicSalary = form.basicSalary.value;
            }

            const originalValues = {
                firstName: initialData.firstName,
                lastName: initialData.lastName,
                phone: initialData.phone,
                bio: initialData.bio
            };

            if (isAdmin) {
                originalValues.companyName = organization?.companyName;
                originalValues.companyPhone = organization?.phone;
                originalValues.website = organization?.website;
                originalValues.address = organization?.address;
                originalValues.industry = organization?.industry;
            } else {
                originalValues.joiningDate = initialData.joiningDate;
                originalValues.department = initialData.department;
                originalValues.designation = initialData.designation;
                originalValues.basicSalary = initialData.basicSalary;
            }

            const changedPayload = Object.fromEntries(
                Object.entries(payload).filter(([field, value]) =>
                    normalizeFieldValue(field, value) !==
                    normalizeFieldValue(field, originalValues[field])
                )
            );

            if (Object.keys(changedPayload).length === 0) {
                toast("No changes to save");
                return;
            }

            setLoading(true);
            const { data } = await api.put("/profile", changedPayload);

            setMessage(data.message);

            toast.success(data.message);

            onSuccess?.();

        } catch (err) {
            const errorMessage =
                err.response?.data?.error ||
                "Failed to update profile";

            setError(errorMessage);

            toast.error(errorMessage);

        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit} className='card p-5 sm:p-6 mb-6'>
            <h2 className='text-base font-medium text-slate-900 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2'>
                <User className='w-5 h-5 text-slate-400' />
                Profile
            </h2>

            {/* {error && (
                <div className='bg-rose-50 text-rose-700 p-4 rounded-xl text-sm border border-rose-200 mb-6 flex items-start gap-3'>
                    <div className='w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0' />
                    {error}
                </div>
            )}

            {message && (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm border border-emerald-200 mb-6 flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    {message}
                </div>
            )} */}

            <div className='space-y-6'>
                <section>
                    <h3 className='text-sm font-semibold text-slate-800 mb-4'>
                        Personal Information
                    </h3>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <EditableField
                            label="First Name"
                            name="firstName"
                            defaultValue={initialData.firstName}
                            disabled={initialData.isDeleted}
                            required
                        />
                        <EditableField
                            label="Last Name"
                            name="lastName"
                            defaultValue={initialData.lastName}
                            disabled={initialData.isDeleted}
                            required
                        />
                        <ReadOnlyField label="Email" value={initialData.email} />
                        <EditableField
                            label="Phone Number"
                            name="phone"
                            defaultValue={initialData.phone}
                            disabled={initialData.isDeleted}
                        />

                        {!isAdmin && (
                            <>
                                <EditableField
                                    label="Join Date"
                                    name="joiningDate"
                                    type="date"
                                    defaultValue={initialData.joiningDate
                                        ? new Date(initialData.joiningDate).toISOString().slice(0, 10)
                                        : ""}
                                    disabled={initialData.isDeleted}
                                    required
                                />
                                <div>
                                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                                        Department
                                    </label>
                                    <select
                                        name="department"
                                        defaultValue={initialData.department || ""}
                                        disabled
                                        required
                                        className="bg-slate-50 text-slate-500 cursor-not-allowed"
                                    >
                                        <option value="" disabled>Select Department</option>
                                        {DEPARTMENTS.map((department) => (
                                            <option value={department} key={department}>
                                                {department}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <EditableField
                                    label="Position"
                                    name="designation"
                                    defaultValue={initialData.designation}
                                    disabled
                                />
                                <EditableField
                                    label="Basic Salary"
                                    name="basicSalary"
                                    type="number"
                                    defaultValue={initialData.basicSalary ?? ""}
                                    disabled
                                    min="0"
                                    step="0.01"
                                />
                            </>
                        )}
                    </div>
                </section>

                <div>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                        Bio
                    </label>
                    <textarea
                        disabled={initialData.isDeleted}
                        name="bio"
                        defaultValue={initialData.bio || ""}
                        placeholder='Write a brief bio...'
                        className={`resize-none ${initialData.isDeleted ? "bg-slate-50 text-slate-400 cursor-not-allowed" : ""}`}
                    />
                </div>

                {isAdmin && (
                    <section>
                        <h2 className='text-base font-medium text-slate-900 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2'>
                            <Building2 className='w-5 h-5 text-slate-400' />
                            Organization
                        </h2>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <EditableField
                                label="Company Name"
                                name="companyName"
                                defaultValue={organization?.companyName}
                                disabled={initialData.isDeleted}
                                required
                            />
                            <ReadOnlyField label="Company Email" value={organization?.companyEmail} />
                            <EditableField
                                label="Company Phone"
                                name="companyPhone"
                                defaultValue={organization?.phone}
                                disabled={initialData.isDeleted}
                                required
                            />
                            <EditableField
                                label="Website"
                                name="website"
                                defaultValue={organization?.website}
                                disabled={initialData.isDeleted}
                            />
                            <div className="sm:col-span-2">
                                <label className='block text-sm font-medium text-slate-700 mb-2'>
                                    Address
                                </label>
                                <textarea
                                    name="address"
                                    defaultValue={organization?.address || ""}
                                    disabled={initialData.isDeleted}
                                    className={initialData.isDeleted ? "bg-slate-50 text-slate-500 cursor-not-allowed" : ""}
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-slate-700 mb-2'>
                                    Industry
                                </label>
                                <select
                                    name="industry"
                                    defaultValue={organization?.industry || ""}
                                    disabled={initialData.isDeleted}
                                    required
                                >
                                    <option value="">
                                        Select Industry
                                    </option>
                                    {INDUSTRIES.map((industryOption) => (
                                        <option value={industryOption} key={industryOption}>
                                            {industryOption}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>
                )}

                {initialData.isDeleted ? (
                    <div className='pt-2'>
                        <div>
                            <p className='text-rose-600 font-medium tracking-tight'>Account Deactivated</p>
                            <p className='text-sm text-rose-500 mt-0.5'>You can no longer update your profile</p>
                        </div>
                    </div>
                ) : (
                    <div className='flex justify-end pt-2'>
                        <button type='submit' disabled={loading}
                            className='btn-primary flex items-center gap-2 justify-center w-full sm:w-auto'>
                            {loading ? <Loader2 className='w-4 h-4 animate-spin' />
                                : <Save className='w-4 h-4' />}
                            Save Changes
                        </button>
                    </div>
                )}
            </div>
        </form>
    )
}

export default ProfileForm