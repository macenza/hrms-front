import React from 'react'
import { BarChart2 } from 'lucide-react'
import { ATTENDANCE_LIST, AVATAR_COLORS } from '@/lib/data'

interface AttendanceListProps {
    isDark?: boolean;
}

const AttendanceList = ({ isDark = false }: AttendanceListProps) => {
    return (
        <div className={`rounded-2xl p-5 flex flex-col gap-4 transition-colors duration-300 ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white"}`}>

            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                    300 Attendance
                </h3>
                <button className="text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors">
                    See All
                </button>
            </div>

            {/* Column Headers */}
            <div className={`grid grid-cols-4 text-xs font-medium pb-1 border-b
            ${isDark ? "text-gray-400 border-gray-700" : "text-gray-400 border-gray-100"}
        `}>
                <span>Employee Shift</span>
                <span className='text-center'>Clock IN</span>
                <span className='text-center'>Clock OUT</span>
                <span className='text-center'>Report</span>
            </div>

            {/* Rows */}
            <div className='flex flex-col gap-2'>
                {ATTENDANCE_LIST.map((row) => (
                    <div
                        key={row.id}
                        className={`grid grid-cols-4 items-center py-2 rounded-xl px-1 transition-colors duration-150 ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}
                    >
                        {/* Employee */}
                        <div className="flex items-center gap-2.5">
                            <div
                                className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                    text-xs font-semibold shrink-0
                    ${AVATAR_COLORS[row.avatar] ?? "bg-gray-200 text-gray-600"}
                `}
                            >
                                {row.avatar}
                            </div>
                            <span
                                className={`text-sm font-medium ${isDark ? "text-gray-100" : "text-gray-700"}`}
                            >
                                {row.name}
                            </span>
                        </div>
                        {/* Clock In */}
                        <span
                            className={`text-sm text-center ${isDark ? "text-gray-300" : "text-gray-600"}`}
                        >
                            {row.clockIn}
                        </span>

                        {/* Clock Out */}
                        <span
                            className={`text-sm text-center ${isDark ? "text-gray-300" : "text-gray-600"}`}
                        >
                            {row.clockOut}
                        </span>

                        {/* Report Icon */}
                        <div className="flex justify-center">
                            <button
                                className={`
                    w-7 h-7 rounded-lg flex items-center justify-center transition-colors
                    ${isDark
                                        ? "bg-gray-700 text-green-400 hover:bg-gray-600"
                                        : "bg-green-50 text-green-500 hover:bg-green-100"
                                    }
                `}
                                aria-label={`View report for ${row.name}`}
                            >
                                <BarChart2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

            </div>

        </div>
    )
}

export default AttendanceList