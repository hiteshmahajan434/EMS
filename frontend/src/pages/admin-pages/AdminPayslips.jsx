import { useCallback, useEffect, useState } from "react"
import Loading from "../../components/Loading";
import PayslipsList from "../../components/payslip/PayslipsList";
import GeneratePayslipForm from "../../components/payslip/GeneratePayslipForm";
import PageHero from "../../components/layout/PageHero";
import { Receipt } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const AdminPayslips = () => {
  const [payslips, setPayslips] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayslips = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/payslip");
      setPayslips(data.payslips);
      setUsers(data.users);
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
        "Failed to load payslips"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayslips();
  }, [fetchPayslips]);

  if(loading) return <Loading/>

  return (
    <div className="animate-fade-in">

      <PageHero
        icon={Receipt}
        title="Payslips"
        subtitle="Generate payslips for your team and manage payroll records." 
      >
        {<GeneratePayslipForm employees={users} onSuccess={fetchPayslips}/>}
      </PageHero>

      <PayslipsList payslips={payslips} isAdmin={true} />
    </div>
  )
}

export default AdminPayslips