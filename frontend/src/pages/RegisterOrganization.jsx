import React, { useState } from "react";
import LoginLeftSide from "../components/LoginLeftSide";
import RegisterHeader from "../components/register-organization/RegisterHeader";
import OrganizationForm from "../components/register-organization/OrganizationForm";
import AdminAccountForm from "../components/register-organization/AdminAccountForm";
import RegisterFooter from "../components/register-organization/RegisterFooter";
import { useNavigate } from "react-router-dom";

const RegisterOrganization = () => {
  const navigate = useNavigate();

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
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        companyName: formData.companyName,
        companyEmail: formData.companyEmail,
        phone: formData.phone,
        website: formData.website,
        industry: formData.industry,
        address: formData.address,

        admin: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        },
      };

      console.log(payload);

      // const { data } = await axios.post(
      //   "/api/auth/register-organization",
      //   payload
      // );

      // toast.success(data.message);
      // navigate("/login/admin");

    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to register organization."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <LoginLeftSide />

      <div className="flex-1 bg-slate-50 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 py-10">

          <RegisterHeader />

          {error && (
            <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6 animate-fade-in"
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
              onCancel={() => navigate("/login/admin")}
            />
          </form>

        </div>
      </div>
    </div>
  );
};

export default RegisterOrganization;