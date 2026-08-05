import React from "react";
import { Loader2Icon } from "lucide-react";
import { Link } from "react-router-dom";

const RegisterFooter = ({
  loading,
  onCancel,
  buttonText = "Create Organization",
  onClose
}) => {
  return (
    <>
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
        <button
          type="button"
          className="btn-secondary"
          onClick={onCancel}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex items-center justify-center"
        >
          {loading && (
            <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
          )}

          {buttonText}
        </button>
      </div>

      <div className="mt-8 border-t border-slate-200 pt-6 text-center">
        <p className="text-sm text-slate-500">
          Already have an organization?
        </p>

        <button
            type="button"
            onClick={onClose}
            className="mt-2 font-medium text-brand-600 hover:underline"
        >
            Back to Login
        </button>
      </div>
    </>
  );
};

export default RegisterFooter;