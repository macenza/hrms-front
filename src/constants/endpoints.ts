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
    },

    LEAVE: {
        BASE: '/leaves', // GET (own requests) and POST (create)
        GET_BY_ID: (id: string | number) => `/leaves/${id}`,
        CANCEL: (id: string | number) => `/leaves/${id}/cancel`,
        STATS: '/leaves/stats',
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