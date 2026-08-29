import { useCallback, useEffect, useState } from "react"
import Loading from "../../components/Loading";
import PayslipsList from "../../components/payslip/PayslipsList";
import GeneratePayslipForm from "../../components/payslip/GeneratePayslipForm";
import PageHero from "../../components/layout/PageHero";
import { Receipt, Search } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const AdminPayslips = () => {
  const [payslips, setPayslips] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const fetchPayslips = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/payslip", {
        params: {
          role: role || undefined,
          month: month || undefined,
          year: year || undefined,
        },
      });

      setPayslips(data.payslips || []);
      setUsers(data.users || []);
    } catch (error) {
      console.error("Failed to fetch payslips:", error);
      setPayslips([]);
    } finally {
      setLoading(false);
    }
  }, [role, month, year]);

  useEffect(() => {
    fetchPayslips();
  }, [fetchPayslips]);

  const filteredPayslips = payslips.filter((payslip) => {
    const name = `${payslip.userId?.firstName || ""} ${
      payslip.userId?.lastName || ""
    }`.toLowerCase();

    return name.includes(search.toLowerCase());
  });

  // if(loading) return <Loading/>

  return (
    <div className="animate-fade-in">

      <PageHero
        icon={Receipt}
        title="Payslips"
        subtitle="Generate payslips for your team and manage payroll records." 
      >
        {<GeneratePayslipForm employees={users} onSuccess={fetchPayslips}/>}
      </PageHero>

      {/* Search & Filters */}
      <div className="card p-4 sm:p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search Employee */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"
            />

            <input
              placeholder="Search employees..."
              className="w-full pl-10!"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Role */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="max-w-40"
          >
            <option value="">All Roles</option>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
          </select>

          {/* Month */}
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="max-w-40"
          >
            <option value="">All Months</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>

          {/* Year */}
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="max-w-32"
          >
            <option value="">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>

        </div>
      </div>

      <PayslipsList payslips={filteredPayslips} isAdmin={true} loading={loading} />
    </div>
  )
}

export default AdminPayslips