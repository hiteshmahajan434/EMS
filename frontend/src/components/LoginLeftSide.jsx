import { LayoutGrid } from "lucide-react";

const LoginLeftSide = () => {
  return (
    <div className="hidden md:flex w-1/2 bg-indigo-950 relative overflow-hidden border-r border-slate-200">

      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute top-12 left-12 w-32 h-32 border-2 border-white rounded-full" />

        <div className="absolute bottom-24 right-16 w-48 h-48 border-2 border-white rounded-2xl rotate-12" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-start justify-center p-12 lg:p-20 w-full h-full">

        {/* Icon */}
        <div className="mb-8 p-3 rounded-xl bg-indigo-500/15 border border-indigo-500/20">
          <LayoutGrid className="w-8 h-8 text-indigo-400" />
        </div>

        {/* Heading */}
        <h1 className="text-4xl lg:text-5xl font-semibold text-white mb-6 leading-tight tracking-tight">
          Employee <br />
          Management System
        </h1>

        {/* Description */}
        <p className="text-slate-400 text-lg max-w-md leading-relaxed">
          Streamline your workforce operations, track attendance, manage
          payroll, and empower your team securely.
        </p>

      </div>
    </div>
  );
};

export default LoginLeftSide;