import { format } from 'date-fns'
import { Download } from 'lucide-react'

const PayslipsList = ({payslips, isAdmin, loading}) => {
  return (
    <div className='card overflow-hidden'>
        <div className='overflow-x-auto'>
            <table className='table-modern'>
                <thead>
                    <tr>
                        {isAdmin && <th>Employee</th>}
                        <th>Period</th>
                        <th>Basic Salary</th>
                        <th>Net Salary</th>
                        <th className='text-center'>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                        <td
                            colSpan={isAdmin ? 5 : 4}
                            className="text-center py-12"
                        >
                            <div className="flex justify-center">
                            <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
                            </div>
                        </td>
                        </tr>
                    ) : payslips.length === 0 ?(
                        <tr>
                            <td 
                                className='text-center py-12 text-slate-400'
                                colSpan={isAdmin ? 5 : 4}
                                >
                                No payslips found
                            </td>
                        </tr>
                    ) : (
                        payslips.map((payslip) => {
                            return (
                                <tr key={payslip._id || payslip.id}>
                                    {isAdmin && (
                                        <td className='text-slate-900'>
                                            {payslip.userId?.firstName} {payslip.userId?.lastName}
                                        </td>
                                    )}

                                    <td className='text-slate-500'>
                                        {format(new Date(payslip.year, payslip.month - 1), "MMMM yyyy")}
                                    </td>

                                    <td className='text-slate-500'>
                                        ${payslip.basicSalary?.toLocaleString()}
                                    </td>

                                    <td className='font-medium text-slate-800'>
                                        ${payslip.netSalary?.toLocaleString()}
                                    </td>


                                    <td className='text-center'>
                                        <button 
                                        className='inline-flex items-center px-3 py-1.5 text-xs font-medium rounded text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors ring-1 ring-blue-600/10'
                                        onClick={() => window.open(`/print/payslips/${payslip._id || payslip.id}`)}
                                        >
                                            <Download className='w-3 h-3 mr-1.5'/> Download
                                        </button>
                                    </td>

                                    
                                </tr>
                            )
                        })
                    )}
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default PayslipsList