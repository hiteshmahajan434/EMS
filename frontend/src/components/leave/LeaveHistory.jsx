import { Check, Loader2, X } from "lucide-react";
import React, { useState } from "react";
import { format } from "date-fns";
import api from "../../api/axios";
import Pagination from "../Pagination";
import usePagination from "../../hooks/usePagination";

const LeaveHistory = ({leaves, isManagerAdmin, onUpdate, loading, resetKey}) => {
    const [processing, setProcessing] = useState(null);
    const { pageItems, page, pageSize, totalItems, totalPages, setPage } =
        usePagination(leaves, resetKey ?? leaves);

    const handleStatusUpdate = async (id, status) => {
        try {
            setProcessing(id);

            await api.patch(`/leave/${id}`, {
                status
            });

            await onUpdate();
        } catch (error) {
            console.error("Failed to update leave status:", error);

            alert(
                error.response?.data?.error ||
                "Failed to update leave status"
            );
        } finally {
            setProcessing(null);
        }
    };

  return (
    <div className='card overflow-hidden'>
        <div className='px-6 py-4 border-b border-slate-100'>
            <h3 className='font-semibold text-slate-900'>Your Leave History</h3>
        </div>
        <div className='overflow-x-auto'>
            <table className='table-modern'>
                <thead>
                    <tr>
                        {isManagerAdmin && <th>Employee</th>}
                        <th>Type</th>
                        <th>Dates</th>
                        <th>Reason</th>
                        <th>Status</th>
                        {isManagerAdmin && 
                            <th className='text-center'>Actions</th>
                        }
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                        <td
                            colSpan={isManagerAdmin ? 6 : 4}
                            className="text-center py-12"
                        >
                            <div className="flex justify-center">
                            <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
                            </div>
                        </td>
                        </tr>
                    ) : leaves.length === 0 ?(
                        <tr>
                            <td 
                                className='text-center py-12 text-slate-400'
                                colSpan={isManagerAdmin ? 6 : 4}
                                >
                                No leave applications found
                            </td>
                        </tr>
                    ) : (
                        pageItems.map((leave) => {
                            return (
                                <tr key={leave._id || leave.id}>
                                    {isManagerAdmin && (
                                        <td className='text-slate-900'>
                                            {leave.user?.firstName} {" "}
                                            {leave.user?.lastName}
                                        </td>
                                    )}

                                    <td>
                                        <span className='badge bg-slate-100 text-slate-600'>
                                            {leave.type}
                                        </span>
                                    </td>

                                    <td className='text-xs text-slate-500'>
                                        {format(new Date(leave.startDate), "MMM dd")} - {format(new Date(leave.endDate), "MMM dd, yyyy")}
                                    </td>

                                    <td className='max-w-xs truncate text-slate-500'
                                        title={leave.reason}
                                    >
                                        {leave.reason}
                                    </td>

                                    <td>
                                        <span className={`badge ${leave.status === "APPROVED" ? "badge-success" : leave.status === "REJECTED" ? "badge-danger" : "badge-warning"}`}>
                                            {leave.status}
                                        </span>
                                    </td>

                                    {isManagerAdmin && (
                                        <td>
                                            {leave.status === "PENDING" && (
                                                <div className='flex justify-center gap-2'>
                                                    <button 
                                                        className='p-1.5 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors'
                                                        onClick={() => handleStatusUpdate(leave._id || leave.id, "APPROVED")}
                                                        disabled={!!processing}
                                                    >
                                                        {processing === (leave._id || leave.id) ? 
                                                            <Loader2 className='w-4 h-4 animate-spin'/>
                                                            : <Check className='w-4 h-4'/>
                                                        }
                                                    </button>

                                                    <button
                                                        className='p-1.5 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors'
                                                        onClick={() => handleStatusUpdate(leave._id || leave.id, "REJECTED")}
                                                        disabled={!!processing}
                                                    >
                                                        {processing === (leave._id || leave.id) ? 
                                                            <Loader2 className='w-4 h-4 animate-spin'/>
                                                            : <X className='w-4 h-4'/>
                                                        }
                                                    </button>
                                                    
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            )
                        })
                    )}
                </tbody>
            </table>
        </div>
        {!loading && (
            <Pagination
                page={page}
                pageSize={pageSize}
                totalItems={totalItems}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        )}
    </div>
  )
}

export default LeaveHistory