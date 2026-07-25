import { ArrowRightIcon, ShieldIcon, UserIcon } from "lucide-react"
import LoginLeftSide from "../components/LoginLeftSide"
import { Link, Navigate } from "react-router-dom"

const LoginLanding = () => {
  const portalOptions = [
    {
      to: "/login/admin",
      title: "Admin Portal",
      description: "Manage employees, departments, payroll, and system configurations.",
      icon: ShieldIcon
    },
    {
      to: "/login/employee",
      title: "Employee Portal",
      description: "View your profile, track attendance, request time off, and access payslips.",
      icon: UserIcon
    }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <LoginLeftSide/>

      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 relative overflow-y-auto min-h-screen">
        <div className="w-full max-w-md animate-fade-in relative z-10">

          {/* Header */}
          <div className="mb-10 text-center md-text-left">
            <h2 className="text-3xl font-semibold text-slate-900">
              Welcome Back
            </h2>
            <p className="text-slate-500">
              Select your portal to securely access the system.
            </p>
          </div>

          {/* Portals List */}
          <div className="space-y-6">
            {portalOptions.map((portal) => {
              const Icon = portal.icon;

              return (
                <Link
                  key={portal.to}
                  to={portal.to}
                  className="group block bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6 transition-all duration-300 hover:border-brand-500 hover:bg-brand-50"
                >
                  <div className="relative z-10 flex items-center justify-between gap-4 sm:gap-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-brand-100 text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-slate-800 group-hover:text-brand-600 transition-colors">
                          {portal.title}
                        </h3>

                        <p className="text-sm text-slate-500 mt-0.5">
                          {portal.description}
                        </p>
                      </div>
                    </div>

                    <ArrowRightIcon className="w-5 h-5 text-slate-400 group-hover:text-brand-500 shrink-0 transition-all duration-300 group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-12 text-center md:text-left text-sm text-slate-400">
            <p>© {new Date().getFullYear()} OneCore. All rights reserved.</p>
          </div>

        </div>

      </div>

    </div>
  )
}

export default LoginLanding