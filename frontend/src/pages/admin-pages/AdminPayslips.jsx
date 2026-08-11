import { useCallback, useEffect, useState } from "react"
import { dummyEmployeeData, dummyPayslipData } from "../../assets/assets";
import Loading from "../../components/Loading";
import PayslipsList from "../../components/payslip/PayslipsList";
import GeneratePayslipForm from "../../components/payslip/GeneratePayslipForm";
import PageHero from "../../components/layout/PageHero";
import { Receipt } from "lucide-react";


const AdminPayslips = () => {
  const [payslips, setPayslips] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = true;

  const fetchPayslips = useCallback(async () => {
    setPayslips(dummyPayslipData);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    fetchPayslips();
  }, [fetchPayslips]);

  useEffect(() => {
    if(isAdmin) setEmployees(dummyEmployeeData);
  }, [isAdmin]);

  if(loading) return <Loading/>

  return (
    <div className="animate-fade-in">

      <PageHero
        icon={Receipt}
        title="Payslips"
        subtitle={isAdmin ? "Generate payslips for your team and manage payroll records." 
          : "Access your payslips and download them whenever needed."
        }
      >
        {isAdmin && <GeneratePayslipForm employees={employees} onSuccess={fetchPayslips}/>}
      </PageHero>

      <PayslipsList payslips={payslips} isAdmin={isAdmin} />
    </div>
  )
}

export default AdminPayslips