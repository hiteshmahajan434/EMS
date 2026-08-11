import { CalendarIcon, ClockIcon, UserCheckIcon, UsersIcon, User } from 'lucide-react'
import React from 'react'
import PageHero from './layout/PageHero'

const AdminDashboard = ({data}) => {
    const stats = [
        {
            icon: UsersIcon,
            value: data.totalEmployees,
            label: "Total Employees",
            description: "Active workforce"
        },
        {
            icon: UserCheckIcon,
            value: data.presentToday,
            label: "Today's Attendance",
            description: "Checked in today"
        },
        {
            icon: CalendarIcon,
            value: data.onLeave,
            label: "On Leave",
            description: "Not available"
        },
        {
            icon: ClockIcon,
            value: data.pendingManagerLeaves,
            label: "Pending Leaves",
            description: "Manager's awaiting approval"
        },
    ]

    return (
        <div className='animate-fade-in'>
            <PageHero
                icon={User}
                title={"Welcome back, Admin!"}
                subtitle={"Here's your work summary for today."}
            />

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8'>
                {stats.map((s) => (
                    <div 
                        key={s.label} 
                        className="card card-hover p-5 sm:p-6 relative overflow-hidden group flex items-center justify-between"
                    >
                        <div>
                            <div className='absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-slate-500/70 group-hover:bg-indigo-500/7' />
                            <p className='text-sm font-medium text-slate-700'>
                                {s.label}
                            </p>
                            <p className='text-2xl font-bold text-slate-900'>
                                {s.value}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                {s.description}
                            </p>
                        </div>
                        <s.icon className='size-10 p-2.5 rounded-lg bg-slate-100  text-slate-600 group-hover:bg-indigo-50  group-hover:text-indigo-600 transition-colors duration-200'/>
                    </div>
                ))}
            </div>
        </div>
    )
} 

export default AdminDashboard