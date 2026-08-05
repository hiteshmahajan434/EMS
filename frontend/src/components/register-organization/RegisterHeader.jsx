import React from "react";
import { ArrowLeftIcon, Building2Icon } from "lucide-react";
import { Link } from "react-router-dom";

const RegisterHeader = () => {
  return (
    <>
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600">
          <Building2Icon size={24} />
        </div>

        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            Register Organization
          </h1>

          <p className="text-slate-500 mt-2 max-w-xl">
            Create your organization workspace and administrator account to
            start managing employees, attendance, payroll, and more.
          </p>
        </div>
      </div>
    </>
  );
};

export default RegisterHeader;