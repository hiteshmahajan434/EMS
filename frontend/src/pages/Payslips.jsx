import { useCallback, useEffect, useState } from "react"
import Loading from "../components/Loading";
import PayslipsList from "../components/payslip/PayslipsList";
import PageHero from "../components/layout/PageHero";
import { Receipt } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const Payslips = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayslips = useCallback(async () => {
    setLoading(true);

    try {
      const { data } = await api.get("/payslip");
      setPayslips(data.payslips);
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
        subtitle= "Access your payslips and download them whenever needed."
      >
      </PageHero>

      <PayslipsList payslips={payslips} isAdmin={false} />
    </div>
  )
}

export default Payslips