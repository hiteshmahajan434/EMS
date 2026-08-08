export const DEPARTMENTS = ["Engineering", "Human Resources", "Marketing", "Sales", "Finance", "Operations", "IT Support", "Customer Success", "Product Management", "Design"];

export const dummyAdminDashboardData = {
    role: "ADMIN",
    totalEmployees: 3,
    totalDepartments: 10,
    todayAttendance: 1,
    pendingLeaves: 1,
};

export const dummyEmployeeDashboardData = {
    role: "EMPLOYEE",

    todayAttendance: {
        checkIn: "2026-08-05T09:12:00.000Z",
        checkOut: null,
        totalHours: "7h 18m",
        status: "Clocked In",
    },

    presentDays: 18,

    pendingLeaves: 2,

    latestPayslip: {
        month: 7,
        year: 2026,
        netSalary: 48500,
    },

    employee: {
        firstName: "John",
        lastName: "Doe",
        position: "Software Engineer",
        department: "Engineering",
    },
};

export const dummyProfileData = {
    _id: "69b411e6f8a807df391d7b13",
    firstName: "John",
    lastName: "Doe",
    email: "johndoe@example.com",
    image: null,
    bio: "Dummy bio"
};

export const dummyEmployeeData = [
    {
        _id: "69b414a7f8a807df391d7b58",
        userId: {
            _id: "69b414a7f8a807df391d7b56",
            email: "david@example.com",
            role: "EMPLOYEE",
        },
        department: "IT Support",
        firstName: "David",
        lastName: "Michael",
        email: "david@example.com",
        phone: "9000000001",
        position: "Associate Business Support",
        basicSalary: 1000,
        allowances: 100,
        deductions: 9.98,
        employmentStatus: "ACTIVE",
        joinDate: "2000-01-20T00:00:00.000Z",
        image: null,
        isDeleted: false,
        bio: "",
        createdAt: "2026-03-13T13:44:07.806Z",
        updatedAt: "2026-03-13T13:44:07.806Z",
        id: "69b414a7f8a807df391d7b58",
        user: {
            email: "david@example.com",
            role: "EMPLOYEE",
        },
    },
    {
        _id: "69b41439f8a807df391d7b52",
        userId: {
            _id: "69b41439f8a807df391d7b50",
            email: "alex@example.com",
            role: "EMPLOYEE",
        },
        department: "Engineering",
        firstName: "Alex",
        lastName: "Matthew",
        email: "alex@example.com",
        phone: "9000000001",
        position: "Software Developer",
        basicSalary: 2000,
        allowances: 100,
        deductions: 20,
        employmentStatus: "ACTIVE",
        joinDate: "2000-01-20T00:00:00.000Z",
        image: null,
        isDeleted: false,
        bio: "",
        createdAt: "2026-03-13T13:42:17.589Z",
        updatedAt: "2026-03-13T13:42:17.589Z",
        id: "69b41439f8a807df391d7b52",
        user: {
            email: "alex@example.com",
            role: "EMPLOYEE",
        },
    },
    {
        _id: "69b411e6f8a807df391d7b13",
        userId: {
            _id: "69b411e5f8a807df391d7b11",
            email: "johndoe@example.com",
            role: "EMPLOYEE",
        },
        department: "Engineering",
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        phone: "9000000001",
        position: "Senior Software Developer",
        basicSalary: 40000,
        allowances: 10000,
        deductions: 2000,
        employmentStatus: "ACTIVE",
        joinDate: "2000-01-20T00:00:00.000Z",
        image: null,
        isDeleted: false,
        bio: "Hi, I am dev a full stack web developer",
        createdAt: "2026-03-13T13:32:22.013Z",
        updatedAt: "2026-03-13T13:33:20.498Z",
        id: "69b411e6f8a807df391d7b13",
        user: {
            email: "johndoe@example.com",
            role: "EMPLOYEE",
        },
    },
];

export const dummyLeaveData = [
    {
        _id: "69b4165af8a807df391d7bfd",
        employeeId: "69b41439f8a807df391d7b52",
        type: "ANNUAL",
        startDate: "2026-03-27T00:00:00.000Z",
        endDate: "2026-03-29T00:00:00.000Z",
        reason: "Out for a trip",
        status: "APPROVED",
        createdAt: "2026-03-13T13:51:22.716Z",
        updatedAt: "2026-03-13T13:51:43.139Z",
        id: "69b4165af8a807df391d7bfd",
        employee: dummyEmployeeData[0],
    },
    {
        _id: "69b4163cf8a807df391d7bf8",
        employeeId: "69b41439f8a807df391d7b52",
        type: "CASUAL",
        startDate: "2026-03-23T00:00:00.000Z",
        endDate: "2026-03-24T00:00:00.000Z",
        reason: "Going For Vacations ",
        status: "REJECTED",
        createdAt: "2026-03-13T13:50:52.117Z",
        updatedAt: "2026-03-13T13:51:46.450Z",
        id: "69b4163cf8a807df391d7bf8",
        employee: dummyEmployeeData[1],
    },
    {
        _id: "69b415fcf8a807df391d7be0",
        employeeId: "69b411e6f8a807df391d7b13",
        type: "CASUAL",
        startDate: "2026-03-27T00:00:00.000Z",
        endDate: "2026-03-28T00:00:00.000Z",
        reason: "Going to visit a temple",
        status: "PENDING",
        createdAt: "2026-03-13T13:49:48.618Z",
        updatedAt: "2026-03-13T13:51:44.251Z",
        id: "69b415fcf8a807df391d7be0",
        employee: [dummyEmployeeData[2]],
    },
    {
        _id: "69b415dff8a807df391d7bdb",
        employeeId: "69b411e6f8a807df391d7b13",
        type: "SICK",
        startDate: "2026-03-15T00:00:00.000Z",
        endDate: "2026-03-16T00:00:00.000Z",
        reason: "I had a fracture on leg",
        status: "APPROVED",
        createdAt: "2026-03-13T13:49:19.204Z",
        updatedAt: "2026-03-13T13:51:45.418Z",
        id: "69b415dff8a807df391d7bdb",
        employee: dummyEmployeeData[0],
    },
];

export const dummyPayslipData = [
    {
        _id: "69b41595f8a807df391d7baa",
        employeeId: "69b411e6f8a807df391d7b13",
        month: 2,
        year: 2026,
        basicSalary: 2000,
        allowances: 200,
        deductions: 20,
        netSalary: 2180,
        createdAt: "2026-03-13T13:48:05.653Z",
        updatedAt: "2026-03-13T13:48:05.653Z",
        id: "69b41595f8a807df391d7baa",
        employee: dummyEmployeeData[0],
    },
    {
        _id: "69b41536f8a807df391d7b9c",
        employeeId: "69b41439f8a807df391d7b52",
        month: 2,
        year: 2026,
        basicSalary: 2000,
        allowances: 200,
        deductions: 20,
        netSalary: 2180,
        createdAt: "2026-03-13T13:46:30.804Z",
        updatedAt: "2026-03-13T13:46:30.804Z",
        id: "69b41536f8a807df391d7b9c",
        employee: dummyEmployeeData[1],
    },
    {
        _id: "69b41526f8a807df391d7b98",
        employeeId: "69b414a7f8a807df391d7b58",
        month: 2,
        year: 2026,
        basicSalary: 1000,
        allowances: 100,
        deductions: 10,
        netSalary: 1090,
        createdAt: "2026-03-13T13:46:14.884Z",
        updatedAt: "2026-03-13T13:46:14.884Z",
        id: "69b41526f8a807df391d7b98",
        employee: dummyEmployeeData[2],
    },
    {
        _id: "69b41515f8a807df391d7b94",
        employeeId: "69b411e6f8a807df391d7b13",
        month: 1,
        year: 2026,
        basicSalary: 1000,
        allowances: 200,
        deductions: 20,
        netSalary: 1180,
        createdAt: "2026-03-13T13:45:57.132Z",
        updatedAt: "2026-03-13T13:45:57.132Z",
        id: "69b41515f8a807df391d7b94",
        employee: dummyEmployeeData[0],
    },
    {
        _id: "69b414fbf8a807df391d7b90",
        employeeId: "69b41439f8a807df391d7b52",
        month: 1,
        year: 2026,
        basicSalary: 2000,
        allowances: 100,
        deductions: 10,
        netSalary: 2090,
        createdAt: "2026-03-13T13:45:31.899Z",
        updatedAt: "2026-03-13T13:45:31.899Z",
        id: "69b414fbf8a807df391d7b90",
        employee: dummyEmployeeData[1],
    },
    {
        _id: "69b414e5f8a807df391d7b8c",
        employeeId: "69b414a7f8a807df391d7b58",
        month: 1,
        year: 2026,
        basicSalary: 2000,
        allowances: 100,
        deductions: 10,
        netSalary: 2090,
        createdAt: "2026-03-13T13:45:09.169Z",
        updatedAt: "2026-03-13T13:45:09.169Z",
        id: "69b414e5f8a807df391d7b8c",
        employee: dummyEmployeeData[2],
    },
];

export const dummyAttendanceData = {
    success: true,

    summary: {
        workingDays: 22,
        daysPresent: 18,
        lateArrivals: 2,
        averageWorkingHours: 8.3
    },

    todayRecord: {
        checkIn: "2026-08-06T09:07:00.000Z",
        // checkIn: null,
        // checkOut: null,
        checkOut: "2026-08-06T09:07:00.000Z",
    },

    attendanceHistory: [
        {
            _id: "1",
            date: "2026-08-06T00:00:00.000Z",
            checkIn: "2026-08-06T09:07:00.000Z",
            checkOut: null,
            workingHours: 0,
            dayType: null,
            status: "LATE"
        },
        {
            _id: "2",
            date: "2026-08-05T00:00:00.000Z",
            checkIn: "2026-08-05T08:56:00.000Z",
            checkOut: "2026-08-05T17:18:00.000Z",
            workingHours: 8.37,
            dayType: "Full Day",
            status: "PRESENT"
        },
        {
            _id: "3",
            date: "2026-08-04T00:00:00.000Z",
            checkIn: "2026-08-04T09:12:00.000Z",
            checkOut: "2026-08-04T17:06:00.000Z",
            workingHours: 7.9,
            dayType: "Three Quarter Day",
            status: "LATE"
        },
        {
            _id: "4",
            date: "2026-08-03T00:00:00.000Z",
            checkIn: "2026-08-03T08:50:00.000Z",
            checkOut: "2026-08-03T17:11:00.000Z",
            workingHours: 8.35,
            dayType: "Full Day",
            status: "PRESENT"
        },
        {
            _id: "5",
            date: "2026-08-02T00:00:00.000Z",
            checkIn: "2026-08-02T08:58:00.000Z",
            checkOut: "2026-08-02T17:04:00.000Z",
            workingHours: 8.1,
            dayType: "Full Day",
            status: "PRESENT"
        }
    ],

    user: {
        isDeleted: false
    }
};


export function getWorkingHoursDisplay(record) {
  if (!record.checkIn) { return "—"; }

  const start = new Date(record.checkIn);
  const end = record.checkOut
    ? new Date(record.checkOut)
    : new Date();

  const totalMinutes = Math.floor((end - start) / (1000 * 60));

  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return record.checkOut
    ? `${hrs}h ${mins}m`
    : `${hrs}h ${mins}m (ongoing)`;
}

export function getDayTypeDisplay(record) {
    if (record.dayType) {
        const map = {
            "Full Day": "badge-success",
            "Three Quarter Day": "bg-blue-100 text-blue-700",
            "Half Day": "badge-warning",
            "Short Day": "badge-danger",
        };
        return {
            label: record.dayType,
            className: map[record.dayType] || "bg-slate-100 text-slate-600",
        };
    }
    if (record.checkIn && !record.checkOut) {
        return { label: "In Progress", className: "bg-indigo-100 text-indigo-700" };
    }
    return { label: "—", className: "" };
}

export const dummyEmployeeAttendance = [
  {
    id: 1,
    employeeId: "EMP001",
    firstName: "John",
    lastName: "Doe",
    department: "Engineering",
    date: "2026-08-07T00:00:00.000Z",
    checkIn: "2026-08-07T09:02:15.347Z",
    checkOut: "2026-08-07T18:14:40.122Z",
    status: "Present",
  },
  {
    id: 2,
    employeeId: "EMP002",
    firstName: "Rahul",
    lastName: "Sharma",
    department: "Engineering",
    date: "2026-08-07T00:00:00.000Z",
    checkIn: "2026-08-07T09:18:32.541Z",
    checkOut: null,
    status: "Working",
  },
  {
    id: 3,
    employeeId: "EMP003",
    firstName: "Priya",
    lastName: "Patil",
    department: "Human Resources",
    date: "2026-08-07T00:00:00.000Z",
    checkIn: null,
    checkOut: null,
    status: "Absent",
  },
  {
    id: 4,
    employeeId: "EMP004",
    firstName: "Amit",
    lastName: "Joshi",
    department: "Finance",
    date: "2026-08-07T00:00:00.000Z",
    checkIn: null,
    checkOut: null,
    status: "On Leave",
  },
  {
    id: 5,
    employeeId: "EMP005",
    firstName: "Sneha",
    lastName: "Kulkarni",
    department: "Marketing",
    date: "2026-08-07T00:00:00.000Z",
    checkIn: "2026-08-07T08:56:11.128Z",
    checkOut: "2026-08-07T17:47:53.002Z",
    status: "Present",
  },
  {
    id: 6,
    employeeId: "EMP006",
    firstName: "Karan",
    lastName: "Mehta",
    department: "Sales",
    date: "2026-08-07T00:00:00.000Z",
    checkIn: "2026-08-07T09:11:46.934Z",
    checkOut: "2026-08-07T18:05:18.451Z",
    status: "Present",
  },
  {
    id: 7,
    employeeId: "EMP007",
    firstName: "Neha",
    lastName: "Gupta",
    department: "Engineering",
    date: "2026-08-07T00:00:00.000Z",
    checkIn: "2026-08-07T09:25:03.618Z",
    checkOut: null,
    status: "Working",
  },
  {
    id: 8,
    employeeId: "EMP008",
    firstName: "Arjun",
    lastName: "Patel",
    department: "Support",
    date: "2026-08-07T00:00:00.000Z",
    checkIn: null,
    checkOut: null,
    status: "Absent",
  },
];

export const dummyManagerDashboardData = {
    stats: {
        teamMembers: 14,
        presentToday: 11,
        onLeave: 2,
        lateToday: 1,
        pendingLeaves: 3,
    },

    pendingLeaveRequests: [
        {
            _id: "leave001",
            userId: {
                _id: "emp001",
                firstName: "Rahul",
                lastName: "Sharma",
            },
            leaveType: "Casual Leave",
            startDate: "2026-08-10T00:00:00.000Z",
            endDate: "2026-08-11T00:00:00.000Z",
            status: "PENDING",
        },

        {
            _id: "leave002",
            userId: {
                _id: "emp002",
                firstName: "Amit",
                lastName: "Patil",
            },
            leaveType: "Sick Leave",
            startDate: "2026-08-12T00:00:00.000Z",
            endDate: "2026-08-12T00:00:00.000Z",
            status: "PENDING",
        },

        {
            _id: "leave003",
            userId: {
                _id: "emp003",
                firstName: "Sneha",
                lastName: "Kulkarni",
            },
            leaveType: "Earned Leave",
            startDate: "2026-08-15T00:00:00.000Z",
            endDate: "2026-08-17T00:00:00.000Z",
            status: "PENDING",
        },
    ],
};