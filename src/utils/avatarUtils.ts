/**
 * Centralized avatar URL resolver — Single Source of Truth.
 * All components should import from here instead of duplicating the URL construction logic.
 */

const API_BASE = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL
        ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
        : 'http://localhost:4000')
    : 'http://localhost:4000';

/**
 * Resolves an avatar path (e.g., "/uploads/avatars/avatar-123.jpg") to a full URL.
 * Returns null if no avatar path is provided (caller should show fallback initials).
 */
export function getAvatarUrl(avatarPath: string | null | undefined): string | null {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `${API_BASE}${avatarPath}`;
}

/**
 * Generates uppercase initials from a name string (max 2 chars).
 * e.g., "Varun Pandey" → "VP", "Alice" → "A"
 */
export function getInitials(name: string): string {
    return (name || '')
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
}
