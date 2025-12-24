export interface LeaderboardEntry {
    userId: number;
    name: string;
    lastname: string;
    email: string;
    totalTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    doneTasks: number;
    expiredTasks: number;
    points: number;
}
