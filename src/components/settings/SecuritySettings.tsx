'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
    ShieldCheck, 
    Key, 
    Save, 
    Lock, 
    ShieldAlert, 
    Loader2, 
    Laptop, 
    Smartphone, 
    Globe, 
    Search, 
    X, 
    Check, 
    AlertCircle, 
    Eye, 
    EyeOff,
    UserCheck,
    LogOut,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button'; 
import { Input } from '@/components/ui/Input'; 
import { Badge } from '@/components/ui/Badge'; 
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';
import { 
    useActiveSessions, 
    useRevokeOtherSessions, 
    useSearchEmployees, 
    useAdminPasswordOverride 
} from '@/hooks/api/useSettings';

export interface SecurityPreferences {
    is2FAEnabled: boolean;
    lastPasswordChange?: string; 
}

interface SecuritySettingsProps {
    initialData?: SecurityPreferences | null;
    onPasswordUpdate?: (currentPass: string, newPass: string) => Promise<boolean>; 
}

export default function SecuritySettings({
    onPasswordUpdate
}: SecuritySettingsProps) {
    const { user } = useAppSelector((state) => state.auth);
    const isAdmin = user?.role?.toLowerCase() === 'admin';
    const userRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Account';
    
    // --- State: Personal Password Change ---
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: '',
    });
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // --- State: Active Sessions ---
    const { data: sessions, isLoading: isLoadingSessions, refetch: refetchSessions } = useActiveSessions();
    const revokeOtherSessionsMutation = useRevokeOtherSessions();
    const [isRevoking, setIsRevoking] = useState(false);
    const [confirmRevoke, setConfirmRevoke] = useState(false);

    // --- State: Admin Password Override ---
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [overridePassword, setOverridePassword] = useState('');
    const [showOverridePass, setShowOverridePass] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    const adminOverrideMutation = useAdminPasswordOverride();

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Handle clicking outside of the search dropdown to close it
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const { data: searchResults, isLoading: isSearching } = useSearchEmployees(debouncedQuery);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswords((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            toast.error("Passwords don't match!");
            return;
        }

        // Validate strength
        const metCriteria = checkPasswordStrength(passwords.new);
        if (!metCriteria.isStrong) {
            toast.error("Password does not meet the security criteria!");
            return;
        }
        
        setIsUpdatingPassword(true);
        try {
            if (onPasswordUpdate) {
                const success = await onPasswordUpdate(passwords.current, passwords.new);
                if (success) {
                    setPasswords({ current: '', new: '', confirm: '' });
                }
            }
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleRevokeOthers = async () => {
        setIsRevoking(true);
        try {
            await revokeOtherSessionsMutation.mutateAsync();
            toast.success("Successfully logged out all other sessions.");
            setConfirmRevoke(false);
            refetchSessions();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to revoke other sessions.");
        } finally {
            setIsRevoking(false);
        }
    };

    const handleAdminOverrideSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmployee) {
            toast.error("Please select an employee first.");
            return;
        }

        const metCriteria = checkPasswordStrength(overridePassword);
        if (!metCriteria.isStrong) {
            toast.error("Override password does not meet the security criteria!");
            return;
        }

        try {
            await adminOverrideMutation.mutateAsync({
                targetUserId: selectedEmployee._id,
                newPassword: overridePassword
            });
            toast.success(`Successfully updated password for ${selectedEmployee.name}`);
            setOverridePassword('');
            setSelectedEmployee(null);
            setSearchQuery('');
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update employee's password.");
        }
    };

    // Password strength rules
    const checkPasswordStrength = (password: string) => {
        const minLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);
        const count = [minLength, hasUppercase, hasSpecial].filter(Boolean).length;
        
        return {
            minLength,
            hasUppercase,
            hasSpecial,
            score: count, // 0 to 3
            isStrong: count === 3
        };
    };

    const ownStrength = checkPasswordStrength(passwords.new);
    const canSubmitPassword = passwords.current && passwords.new && passwords.confirm && ownStrength.isStrong;

    const overrideStrength = checkPasswordStrength(overridePassword);
    const canSubmitOverride = selectedEmployee && overrideStrength.isStrong;

    return (
        <div className="animate-in fade-in duration-300 max-w-4xl space-y-10">
            
            {/* Change Password Section */}
            <section className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 transition-colors shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                    <Key size={18} className="text-blue-500 dark:text-blue-400 transition-colors" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">Change Password</h2>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium transition-colors">
                    Ensure your account is using a long, random password to stay secure.
                </p>

                <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                        <div className="space-y-1.5 md:col-span-2 relative">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">Current Password</label>
                            <div className="relative">
                                <Input
                                    type={showCurrentPass ? "text" : "password"}
                                    name="current"
                                    value={passwords.current}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    disabled={isUpdatingPassword}
                                    className="text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-900/50 disabled:text-gray-500 dark:disabled:text-gray-400 transition-colors pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">New Password</label>
                            <div className="relative">
                                <Input
                                    type={showNewPass ? "text" : "password"}
                                    name="new"
                                    value={passwords.new}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    disabled={isUpdatingPassword}
                                    className="text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-900/50 disabled:text-gray-500 dark:disabled:text-gray-400 transition-colors pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPass(!showNewPass)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            {/* Password Strength Checklist and Bar */}
                            {passwords.new && (
                                <div className="mt-2.5 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <div className="flex gap-1 h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div className={cn(
                                            "h-full rounded-full transition-all duration-300",
                                            ownStrength.score === 1 && "bg-rose-500 w-1/3",
                                            ownStrength.score === 2 && "bg-amber-500 w-2/3",
                                            ownStrength.score === 3 && "bg-emerald-500 w-full"
                                        )} />
                                    </div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Strength: {' '}
                                        <span className={cn(
                                            ownStrength.score === 1 && "text-rose-500",
                                            ownStrength.score === 2 && "text-amber-500",
                                            ownStrength.score === 3 && "text-emerald-500"
                                        )}>
                                            {ownStrength.score === 1 && "Weak"}
                                            {ownStrength.score === 2 && "Medium"}
                                            {ownStrength.score === 3 && "Strong"}
                                        </span>
                                    </p>
                                    <ul className="text-[11px] font-medium text-gray-600 dark:text-gray-400 space-y-1 mt-1.5">
                                        <li className="flex items-center gap-1.5">
                                            {ownStrength.minLength ? (
                                                <Check size={12} className="text-emerald-500 shrink-0" />
                                            ) : (
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0 ml-1 mr-1" />
                                            )}
                                            <span className={cn(ownStrength.minLength && "text-emerald-600 dark:text-emerald-400")}>At least 8 characters</span>
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            {ownStrength.hasUppercase ? (
                                                <Check size={12} className="text-emerald-500 shrink-0" />
                                            ) : (
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0 ml-1 mr-1" />
                                            )}
                                            <span className={cn(ownStrength.hasUppercase && "text-emerald-600 dark:text-emerald-400")}>At least 1 uppercase letter</span>
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            {ownStrength.hasSpecial ? (
                                                <Check size={12} className="text-emerald-500 shrink-0" />
                                            ) : (
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0 ml-1 mr-1" />
                                            )}
                                            <span className={cn(ownStrength.hasSpecial && "text-emerald-600 dark:text-emerald-400")}>At least 1 special character</span>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">Confirm New Password</label>
                            <div className="relative">
                                <Input
                                    type={showConfirmPass ? "text" : "password"}
                                    name="confirm"
                                    value={passwords.confirm}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    disabled={isUpdatingPassword}
                                    className="text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-900/50 disabled:text-gray-500 dark:disabled:text-gray-400 transition-colors pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end border-t border-gray-100 dark:border-gray-800 pt-6 transition-colors">
                        <Button
                            type="submit"
                            variant="primary"
                            className="gap-2 shadow-sm min-w-[160px] font-semibold"
                            disabled={!canSubmitPassword || isUpdatingPassword}
                        >
                            {isUpdatingPassword ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Update Password
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </section>

            {/* Active Login Sessions Section */}
            <section className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 transition-colors shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={18} className="text-blue-500 dark:text-blue-400 transition-colors" />
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">Active Sessions</h2>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors">
                            Manage your active login sessions across devices and browsers.
                        </p>
                    </div>
                    
                    {sessions && sessions.length > 1 && (
                        <div className="flex shrink-0">
                            {confirmRevoke ? (
                                <div className="flex items-center gap-2 animate-in fade-in duration-200">
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={handleRevokeOthers}
                                        disabled={isRevoking}
                                        className="gap-1 font-bold text-xs"
                                    >
                                        {isRevoking ? <Loader2 size={12} className="animate-spin" /> : <LogOut size={12} />}
                                        Confirm Logout
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setConfirmRevoke(false)}
                                        className="text-xs bg-white dark:bg-gray-900"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setConfirmRevoke(true)}
                                    className="border-red-200 dark:border-red-950 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold gap-1 bg-white dark:bg-gray-900"
                                >
                                    <LogOut size={12} />
                                    Revoke Other Sessions
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {isLoadingSessions ? (
                    <div className="py-12 flex justify-center items-center">
                        <Loader2 className="animate-spin text-primary" size={24} />
                    </div>
                ) : sessions && sessions.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50/20 dark:bg-gray-950/10">
                        {sessions.map((session: any) => {
                            const isMobile = session.device.toLowerCase().includes('mobile');
                            const DeviceIcon = isMobile ? Smartphone : Laptop;

                            return (
                                <div key={session.id} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all">
                                    <div className="p-2.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl text-gray-500 dark:text-gray-400 shrink-0">
                                        <DeviceIcon size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">{session.device}</span>
                                            {session.isCurrent && (
                                                <Badge variant="success" className="text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wider flex items-center gap-0.5">
                                                    <CheckCircle2 size={10} /> Current Session
                                                </Badge>
                                            )}
                                        </div>
                                        
                                        <div className="mt-1 flex items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 font-medium flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <Globe size={12} className="text-gray-400" />
                                                {session.browser}
                                            </span>
                                            <span>•</span>
                                            <span>IP: {session.ipAddress}</span>
                                            <span>•</span>
                                            <span>Location: {session.location}</span>
                                        </div>

                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                            First authenticated on {new Date(session.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        No active sessions identified.
                    </div>
                )}
            </section>

            {/* Exclusive Admin Password Override Section */}
            {isAdmin && (
                <section className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 transition-colors shadow-sm animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2 mb-1">
                        <Lock size={18} className="text-amber-500 dark:text-amber-400 transition-colors" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">Admin Password Override</h2>
                        <Badge variant="default" className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 uppercase tracking-widest text-[9px] font-bold">
                            Audited Access Only
                        </Badge>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium transition-colors">
                        Force-reset the password of any active employee. This action generates a permanent ledger in the `AuditLog` database.
                    </p>

                    <form onSubmit={handleAdminOverrideSubmit} className="space-y-6 max-w-2xl">
                        
                        {/* Combobox Search */}
                        <div className="space-y-1.5 relative" ref={searchContainerRef}>
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">Select Employee</label>
                            
                            {!selectedEmployee ? (
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Search size={16} />
                                    </div>
                                    <Input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setShowDropdown(true);
                                        }}
                                        onFocus={() => setShowDropdown(true)}
                                        placeholder="Search employee by name, email, or ID..."
                                        className="pl-10 text-gray-900 dark:text-gray-100 transition-colors"
                                    />
                                    {isSearching && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <Loader2 size={16} className="animate-spin text-gray-400" />
                                        </div>
                                    )}

                                    {/* Search Results Dropdown */}
                                    {showDropdown && searchQuery.trim().length >= 2 && (
                                        <div className="absolute z-20 w-full mt-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 animate-in fade-in duration-100">
                                            {searchResults && searchResults.length > 0 ? (
                                                searchResults.map((emp: any) => (
                                                    <button
                                                        key={emp._id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedEmployee(emp);
                                                            setShowDropdown(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 flex flex-col gap-0.5 transition-all"
                                                    >
                                                        <div className="flex justify-between items-center w-full">
                                                            <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">{emp.name}</span>
                                                            <Badge variant="default" className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 capitalize">
                                                                {emp.role}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                                            <span>{emp.email}</span>
                                                            {emp.employeeId && <span>ID: {emp.employeeId}</span>}
                                                        </div>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-4 text-center text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                    No employees match your search query.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Selected Employee Card */
                                <div className="p-4 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-950/50 rounded-xl flex items-center justify-between animate-in zoom-in-95 duration-200">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg text-blue-600 dark:text-blue-400 shrink-0">
                                            <UserCheck size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{selectedEmployee.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                {selectedEmployee.email} {selectedEmployee.employeeId && `• ID: ${selectedEmployee.employeeId}`}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedEmployee(null);
                                            setOverridePassword('');
                                        }}
                                        className="h-8 w-8 p-0 rounded-full border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    >
                                        <X size={14} />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* New Password & Real-Time strength meter */}
                        {selectedEmployee && (
                            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">Temporary / New Password</label>
                                    <div className="relative">
                                        <Input
                                            type={showOverridePass ? "text" : "password"}
                                            value={overridePassword}
                                            onChange={(e) => setOverridePassword(e.target.value)}
                                            placeholder="Assign new secure password..."
                                            disabled={adminOverrideMutation.isPending}
                                            className="text-gray-900 dark:text-gray-100 pr-10 transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowOverridePass(!showOverridePass)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            {showOverridePass ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Override Password strength checker */}
                                {overridePassword && (
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-800 rounded-xl space-y-3">
                                        <div className="flex gap-1 h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div className={cn(
                                                "h-full rounded-full transition-all duration-300",
                                                overrideStrength.score === 1 && "bg-rose-500 w-1/3",
                                                overrideStrength.score === 2 && "bg-amber-500 w-2/3",
                                                overrideStrength.score === 3 && "bg-emerald-500 w-full"
                                            )} />
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Strength: {' '}
                                            <span className={cn(
                                                overrideStrength.score === 1 && "text-rose-500",
                                                overrideStrength.score === 2 && "text-amber-500",
                                                overrideStrength.score === 3 && "text-emerald-500"
                                            )}>
                                                {overrideStrength.score === 1 && "Weak (Insufficient)"}
                                                {overrideStrength.score === 2 && "Medium (Insufficient)"}
                                                {overrideStrength.score === 3 && "Strong (Compliant)"}
                                            </span>
                                        </p>
                                        <ul className="text-xs font-semibold text-gray-600 dark:text-gray-400 space-y-1.5">
                                            <li className="flex items-center gap-1.5">
                                                {overrideStrength.minLength ? (
                                                    <Check size={14} className="text-emerald-500 shrink-0" />
                                                ) : (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0 ml-1.5 mr-1.5" />
                                                )}
                                                <span className={cn(overrideStrength.minLength && "text-emerald-600 dark:text-emerald-400")}>At least 8 characters</span>
                                            </li>
                                            <li className="flex items-center gap-1.5">
                                                {overrideStrength.hasUppercase ? (
                                                    <Check size={14} className="text-emerald-500 shrink-0" />
                                                ) : (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0 ml-1.5 mr-1.5" />
                                                )}
                                                <span className={cn(overrideStrength.hasUppercase && "text-emerald-600 dark:text-emerald-400")}>At least 1 uppercase letter</span>
                                            </li>
                                            <li className="flex items-center gap-1.5">
                                                {overrideStrength.hasSpecial ? (
                                                    <Check size={14} className="text-emerald-500 shrink-0" />
                                                ) : (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0 ml-1.5 mr-1.5" />
                                                )}
                                                <span className={cn(overrideStrength.hasSpecial && "text-emerald-600 dark:text-emerald-400")}>At least 1 special character</span>
                                            </li>
                                        </ul>
                                    </div>
                                )}

                                <div className="flex justify-end pt-2">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={!canSubmitOverride || adminOverrideMutation.isPending}
                                        className="gap-2 font-semibold shadow-sm w-full sm:w-auto"
                                    >
                                        {adminOverrideMutation.isPending ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Overriding Password...
                                            </>
                                        ) : (
                                            <>
                                                <Lock size={16} />
                                                Override and Save Password
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                    </form>
                </section>
            )}

            {/* Security Audit Alert */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 transition-colors">
                <ShieldAlert size={20} className="text-orange-500 dark:text-orange-400 shrink-0 mt-0.5 transition-colors" />
                <p className="text-xs text-orange-800 dark:text-orange-200/80 leading-relaxed transition-colors">
                    <strong className="text-orange-900 dark:text-orange-100">Security & Audit Compliance:</strong> All login active sessions and updates are actively audited. Password requirements are compliant with enterprise SOC2 settings thresholds.
                </p>
            </div>
            
        </div>
    );
}