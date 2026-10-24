import { Loader2, Plus, X } from 'lucide-react';
import { useState } from 'react'
import api from '../../api/axios';
import toast from 'react-hot-toast';

const GeneratePayslipForm = ({ employees, onSuccess }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [basicSalary, setBasicSalary] = useState("");

    if (!isOpen) return (
        <button className='btn-primary flex items-center gap-2'
            onClick={() => setIsOpen(true)}>
            <Plus className='h-4 w-4' />
            Generate Payslip
        </button>
    )

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            userId: selectedEmployeeId,
            month: e.target.month.value,
            year: e.target.year.value,
            allowances: e.target.allowances.value,
            deductions: e.target.deductions.value,
        };

        try {
            setLoading(true);
            await api.post("/payslip", payload);
            toast.success("Payslip generated");
            setIsOpen(false);
            onSuccess?.();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to generate payslip");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
            <div className='card max-w-lg w-full p-6 animate-slide-up'>
                <div className='flex justify-between items-center mb-6'>
                    <h3 className='text-lg font-bold text-slate-900'>Generate Monthly Payslip</h3>
                    <button className='text-slate-400 hover:text-slate-600 p-1'
                        onClick={() => setIsOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    {/* select employee */}
                    <div>
                        <label className='block text-sm font-medium text-slate-700 mb-2'>
                            Employee/Manager
                        </label>
                        <select
                            name="employeeId"
                            value={selectedEmployeeId}
                            onChange={(e) => {
                                const employeeId = e.target.value;

                                const employee = employees.find(
                                    (item) => item._id === employeeId
                                );

                                setSelectedEmployeeId(employeeId);
                                setBasicSalary(employee?.basicSalary ?? "");
                            }}
                            required
                        >
                            <option value="" disabled>
                                Select employee or manager
                            </option>

                            {employees.map((employee) => (
                                <option value={employee._id} key={employee._id}>
                                    {employee.firstName} {employee.lastName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* select month and year */}
                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <label className='block text-sm font-medium text-slate-700 mb-2'>
                                Month
                            </label>
                            <select name="month">
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(
                                    (m) => (
                                        <option value={m} key={m}>
                                            {m}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-slate-700 mb-2'>
                                Year
                            </label>
                            <input type="number" name='year' defaultValue={new Date().getFullYear()} />
                        </div>
                    </div>

                    {/* Basic salary */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Basic Salary
                        </label>

                        <input
                            type="number"
                            name="basicSalary"
                            value={basicSalary}
                            readOnly
                            required
                            placeholder="Select an employee first"
                            className="w-full cursor-not-allowed bg-slate-100"
                        />
                    </div>

                    {/* Allowances and deductions */}
                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <label className='block text-sm font-medium text-slate-700 mb-2'>
                                Allowances
                            </label>
                            <input type="number" name='allowances' defaultValue='0' />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-slate-700 mb-2'>
                                Deductions
                            </label>
                            <input type="number" name='deductions' defaultValue='0' />
                        </div>
                    </div>

                    {/* buttons */}
                    <div className='flex justify-end gap-3 pt-2'>
                        <button className='btn-secondary' type='button' onClick={() => setIsOpen(false)}>
                            Cancel
                        </button>
                        <button className='btn-primary flex items-center' type='submit' disabled={loading}>
                            {loading && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
                            Generate
                        </button>
                    </div>

                </form>

            </div>
        </div>
    )
}

export default GeneratePayslipForm