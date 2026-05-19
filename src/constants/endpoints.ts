export const ENDPOINTS = {
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        REFRESH: '/auth/refresh',
        LOGOUT: '/auth/logout',
        PROFILE: '/auth/profile',
    },
    DASHBOARD: {
        STATS: '/dashboard/stats',
        ATTENDANCE: '/dashboard/attendance',
    },
    EMPLOYEE: {
        BASE: '/employees', // GET (list) and POST (create)
        GET_BY_ID: (id: string | number) => `/employees/${id}`,
        UPDATE: (id: string | number) => `/employees/${id}`,
        DOCUMENTS: (id: string | number) => `/employees/${id}/documents`, // For Multer uploads
        NOTES: (id: string | number) => `/employees/${id}/notes`,
    },
    ATTENDANCE: {
        CLOCK_IN: '/attendance/clock-in',
        CLOCK_OUT: '/attendance/clock-out',
        DASHBOARD: '/attendance/dashboard',
        DAILY: '/attendance/daily', // Used for filtering by ?date=YYYY-MM-DD
        BY_EMPLOYEE: (id: string | number) => `/attendance/employee/${id}`,
    },
    LEAVE: {
        BASE: '/leaves', // GET (own requests) and POST (create)
        GET_BY_ID: (id: string | number) => `/leaves/${id}`,
        CANCEL: (id: string | number) => `/leaves/${id}/cancel`,
        STATS: '/leaves/stats',
    },
    LOAN: {
        BASE: '/loans', // GET Dashboard data
        APPLY: '/loans/apply', // POST
        REVIEW: (id: string | number) => `/loans/${id}/review`, // PUT (Admin/HR approve/reject)
    },
    ASSET: {
        BASE: '/assets', // GET list and POST create
        ASSIGN: (id: string | number) => `/assets/${id}/assign`, // PUT
        UPDATE_STATUS: (id: string | number) => `/assets/${id}/status`, // PUT
    },
    NOTICE: {
        BASE: '/notices', // GET feed and POST create
        STATS: '/notices/stats',
    },
    PAYROLL: {
        BASE: '/payroll', // GET dashboard data
        RUN: '/payroll/run', // POST batch execution
    },
    PROJECT: {
        BASE: '/projects', // GET list and POST create
        GET_BY_ID: (id: string | number) => `/projects/${id}`,
        UPDATE: (id: string | number) => `/projects/${id}`, // PUT
        DELETE: (id: string | number) => `/projects/${id}`, // DELETE
    },
    TASK: {
        BY_PROJECT: (projectId: string | number) => `/tasks/project/${projectId}`, // GET & POST
        MOVE: (taskId: string | number) => `/tasks/${taskId}/move`, // PUT (Drag and Drop Engine)
    },
    SETTINGS: {
        COMPANY: '/settings/company', // GET & PUT (Global Engine Rules)
        NOTIFICATIONS: '/settings/notifications', // GET & PUT (Personal Prefs)
    },
    HR: {
        EMPLOYEES: {
            BASE: '/hr/employees', // GET (all active) and POST (create)
            GET_BY_ID: (id: string | number) => `/hr/employees/${id}`,
            UPDATE: (id: string | number) => `/hr/employees/${id}`,
            DEACTIVATE: (id: string | number) => `/hr/employees/${id}/deactivate`,
            ACTIVATE: (id: string | number) => `/hr/employees/${id}/activate`,
        },
        TEAMS: {
            GET_EMPLOYEES: (team: string) => `/hr/teams/${team}/employees`,
        },
        LEAVES: {
            BASE: '/hr/leaves', // GET all leave requests
            GET_BY_ID: (id: string | number) => `/hr/leaves/${id}`,
            APPROVE: (id: string | number) => `/hr/leaves/${id}/approve`,
            REJECT: (id: string | number) => `/hr/leaves/${id}/reject`,
            BY_EMPLOYEE: (userId: string | number) => `/hr/leaves/employee/${userId}`,
            STATS: '/hr/leaves/stats',
            UPCOMING: '/hr/leaves/upcoming',
        }
    },
    ADMIN: {
        USERS: {
            BASE: '/admin/users', // GET (all users) and POST (create)
            GET_BY_ID: (id: string | number) => `/admin/users/${id}`,
            UPDATE: (id: string | number) => `/admin/users/${id}`,
            DELETE: (id: string | number) => `/admin/users/${id}`,
            DEACTIVATE: (id: string | number) => `/admin/users/${id}/deactivate`,
            ACTIVATE: (id: string | number) => `/admin/users/${id}/activate`,
            UPDATE_PASSWORD: (id: string | number) => `/admin/users/${id}/password`,
        },
        STATS: '/admin/stats',
        LEAVES: {
            BASE: '/admin/leaves', // GET all leave requests
            HR_LEAVES: '/admin/leaves/hr',
            GET_BY_ID: (id: string | number) => `/admin/leaves/${id}`,
            APPROVE: (id: string | number) => `/admin/leaves/${id}/approve`,
            REJECT: (id: string | number) => `/admin/leaves/${id}/reject`,
            BY_EMPLOYEE: (userId: string | number) => `/admin/leaves/employee/${userId}`,
            STATS: '/admin/leaves/stats',
            UPCOMING: '/admin/leaves/upcoming',
        }
    }
};