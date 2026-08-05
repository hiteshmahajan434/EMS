import React, { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const AdminAccountForm = ({ formData, handleChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="card p-5 sm:p-6">
      <h3 className="text-base font-medium text-slate-900 mb-6 pb-4 border-b border-slate-100">
        Administrator Account
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-slate-700">

        {/* First Name */}
        <div>
          <label className="block mb-2">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="John"
            required
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block mb-2">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Doe"
            required
          />
        </div>

        {/* Email */}
        <div className="sm:col-span-2">
          <label className="block mb-2">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="admin@company.com"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block mb-2">Password</label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="pr-11"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? (
                <EyeOffIcon size={18} />
              ) : (
                <EyeIcon size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block mb-2">Confirm Password</label>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="pr-11"
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword((prev) => !prev)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOffIcon size={18} />
              ) : (
                <EyeIcon size={18} />
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminAccountForm;