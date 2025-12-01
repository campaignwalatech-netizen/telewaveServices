module.exports = {
    ROLES: {
        ADMIN: 'admin',
        TL: 'TL',
        USER: 'user'
    },
    
    PERMISSIONS: {
        // Admin permissions
        ADMIN: {
            MANAGE_USERS: 'manage_users',
            MANAGE_ROLES: 'manage_roles',
            MANAGE_LEADS: 'manage_leads',
            MANAGE_KYC: 'manage_kyc',
            MANAGE_WITHDRAWALS: 'manage_withdrawals',
            VIEW_REPORTS: 'view_reports',
            MANAGE_SYSTEM: 'manage_system'
        },
        
        // TL permissions
        TL: {
            VIEW_TEAM: 'view_team',
            MANAGE_TEAM: 'manage_team',
            ASSIGN_LEADS: 'assign_leads',
            APPROVE_LEADS: 'approve_leads',
            VIEW_TEAM_REPORTS: 'view_team_reports',
            MANAGE_TEAM_PERFORMANCE: 'manage_team_performance'
        },
        
        // User permissions
        USER: {
            VIEW_PROFILE: 'view_profile',
            UPDATE_PROFILE: 'update_profile',
            SUBMIT_KYC: 'submit_kyc',
            VIEW_LEADS: 'view_leads',
            SUBMIT_LEADS: 'submit_leads',
            VIEW_WALLET: 'view_wallet',
            REQUEST_WITHDRAWAL: 'request_withdrawal'
        }
    },
    
    KYC_STATUS: {
        PENDING: 'pending',
        APPROVED: 'approved',
        REJECTED: 'rejected',
        NOT_SUBMITTED: 'not_submitted'
    },
    
    LEAD_STATUS: {
        PENDING: 'pending',
        APPROVED: 'approved',
        REJECTED: 'rejected',
        COMPLETED: 'completed'
    },
    
    WITHDRAWAL_STATUS: {
        PENDING: 'pending',
        APPROVED: 'approved',
        REJECTED: 'rejected',
        PROCESSED: 'processed'
    }
};