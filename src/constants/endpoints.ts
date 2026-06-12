export const ENDPOINTS = {
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        REFRESH: '/auth/refresh',
        LOGOUT: '/auth/logout',
        PROFILE: '/auth/profile',
    },
    CUSTOMERS: {
        REGISTER: '/customers/register',
        LOGIN: '/customers/login',
        LOGOUT: '/customers/logout',
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
        BASE: '/loans',
        APPLY: '/loans/apply',
        REVIEW: (id: string | number) => `/loans/${id}/review`,
    },
    ASSET: {
        BASE: '/assets',
        UPLOAD: '/assets/upload',
        VALIDATE: '/assets/validate',
        IMPORT: '/assets/import',
        IMPORT_HISTORY: '/assets/import-history',
        EXPORT_ERRORS: '/assets/import-errors/export',
        ASSIGN: (id: string | number) => `/assets/${id}/assign`,
        UPDATE_STATUS: (id: string | number) => `/assets/${id}/status`,
    },
    ASSET_CATEGORY: {
        BASE: '/asset-categories',
    },
    ASSET_STATUS: {
        BASE: '/asset-statuses',
    },
    ASSET_MAPPING_TEMPLATE: {
        BASE: '/asset-mapping-templates',
    },
    NOTICE: {
        BASE: '/notices',
        STATS: '/notices/stats',
    },
    PAYROLL: {
        BASE: '/payroll',
        BATCHES: '/payroll/batches',
        RUN: '/payroll/run',
        PROCESS: (id: string | number) => `/payroll/${id}/process`,
        MY_PAYROLL: '/payroll/my-slips', // ESS Path
    },
    PROJECT: {
        BASE: '/projects',
        GET_BY_ID: (id: string | number) => `/projects/${id}`,
        UPDATE: (id: string | number) => `/projects/${id}`,
        DELETE: (id: string | number) => `/projects/${id}`,
    },
    TASK: {
        BY_PROJECT: (projectId: string | number) => `/tasks/project/${projectId}`,
        MOVE: (taskId: string | number) => `/tasks/${taskId}/move`,
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
    },
    INQUIRY: '/inquiry'
};