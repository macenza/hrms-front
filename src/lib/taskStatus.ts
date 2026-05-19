/** Kanban column ids — must match backend Task schema enum values. */
export type TaskStatus = 'To Do' | 'In Progress' | 'Completed' | 'Blocked';

export const UI_COLUMN_ORDER: TaskStatus[] = [
    'To Do',
    'In Progress',
    'Completed',
    'Blocked',
];

export const API_TASK_STATUSES = [...UI_COLUMN_ORDER] as const;
export type ApiTaskStatus = (typeof API_TASK_STATUSES)[number];

const UI_STATUS_ALIASES: Record<string, TaskStatus> = {
    'to do': 'To Do',
    todo: 'To Do',
    'in progress': 'In Progress',
    inprogress: 'In Progress',
    'in-progress': 'In Progress',
    completed: 'Completed',
    complete: 'Completed',
    done: 'Completed',
    blocked: 'Blocked',
};

/** Map API / legacy status strings to Kanban column ids. */
export function toUiTaskStatus(status: string | undefined | null): TaskStatus {
    if (!status) return 'To Do';
    const trimmed = status.trim();
    if (API_TASK_STATUSES.includes(trimmed as ApiTaskStatus)) {
        return trimmed as TaskStatus;
    }
    return UI_STATUS_ALIASES[trimmed.toLowerCase()] ?? 'To Do';
}

/**
 * Pick the exact status string the API accepts for a column.
 * Prefers a value already stored on a task in that column (from the DB).
 */
export function toApiTaskStatus(
    uiStatus: TaskStatus,
    knownApiStatuses: string[] = []
): ApiTaskStatus {
    for (const raw of knownApiStatuses) {
        if (raw && toUiTaskStatus(raw) === uiStatus) {
            const exact = raw.trim();
            if (API_TASK_STATUSES.includes(exact as ApiTaskStatus)) {
                return exact as ApiTaskStatus;
            }
        }
    }
    return uiStatus as ApiTaskStatus;
}

/** Alias used by KanbanBoard when moving cards. */
export const resolveApiTaskStatus = toApiTaskStatus;

export function collectKnownApiStatuses(
    tasks: Array<{ apiStatus?: string; status?: TaskStatus | string }>
): string[] {
    const values = tasks
        .map((t) => (typeof t.apiStatus === 'string' ? t.apiStatus : String(t.status ?? '')))
        .filter(Boolean);
    return [...new Set(values)];
}
