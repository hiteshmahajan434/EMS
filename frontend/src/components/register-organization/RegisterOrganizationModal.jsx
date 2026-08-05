import React, { useState } from "react";
import { X, ArrowLeftIcon } from "lucide-react";

import RegisterHeader from "./RegisterHeader";
import OrganizationForm from "./OrganizationForm";
import AdminAccountForm from "./AdminAccountForm";
import RegisterFooter from "./RegisterFooter";

const RegisterOrganizationModal = ({ open, onClose }) => {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        companyName: "",
        companyEmail: "",
        phone: "",
        website: "",
        industry: "",
        address: "",

        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    if (!open) return null;

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (formData.password !== formData.confirmPassword) {
            return setError("Passwords do not match.");
        }

        try {
            setLoading(true);

            const payload = {
                companyName: formData.companyName,
                companyEmail: formData.companyEmail,
                phone: formData.phone,
                website: formData.website,
                address: formData.address,
                industry: formData.industry,

                admin: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password,
                },
            };

            console.log(payload);

            // const {data} = await axios.post(
            //      "/api/auth/register-organization",
            //      payload
            // );

            // toast.success(data.message);
            // onClose();

        } catch (err) {
            setError(
                err.response?.data?.error ||
                "Failed to register organization."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">

            {/* Blur Background */}

            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}

            <div className="relative w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">

                <div className="max-h-[85vh] overflow-y-auto p-8">

                    <div className="flex items-start justify-between">

                        <RegisterHeader />

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-slate-100 transition"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>

                    </div>

                    {error && (
                        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >

                        <OrganizationForm
                            formData={formData}
                            handleChange={handleChange}
                        />

                        <AdminAccountForm
                            formData={formData}
                            handleChange={handleChange}
                        />

                        <RegisterFooter
                            loading={loading}
                            onCancel={onClose}
                            onClose={onClose}
                        />

                    </form>

                </div>

            </div>

        </div>
    );
};

export default RegisterOrganizationModal;