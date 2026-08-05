import React from "react";

const OrganizationForm = ({ formData, handleChange }) => {
  return (
    <div className="card p-5 sm:p-6">
      <h3 className="text-base font-medium text-slate-900 mb-6 pb-4 border-b border-slate-100">
        Organization Information
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-slate-700">

        {/* Company Name */}
        <div>
          <label className="block mb-2">Company Name</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="OneCore Pvt. Ltd."
            required
          />
        </div>

        {/* Company Email */}
        <div>
          <label className="block mb-2">Company Email</label>
          <input
            type="email"
            name="companyEmail"
            value={formData.companyEmail}
            onChange={handleChange}
            placeholder="company@example.com"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block mb-2">Phone Number</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 9876543210"
            required
          />
        </div>

        {/* Website */}
        <div>
          <label className="block mb-2">Website</label>
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://company.com"
          />
        </div>

        {/* Industry */}
        <div>
          <label className="block mb-2">Industry</label>
          <select
            name="industry"
            value={formData.industry}
            onChange={handleChange}
          >
            <option value="">Select Industry</option>
            <option value="Technology">Technology</option>
            <option value="Finance">Finance</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Retail">Retail</option>
            <option value="Construction">Construction</option>
            <option value="Hospitality">Hospitality</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Address */}
        <div className="sm:col-span-2">
          <label className="block mb-2">Address</label>
          <textarea
            rows={3}
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter organization address..."
            className="resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default OrganizationForm;