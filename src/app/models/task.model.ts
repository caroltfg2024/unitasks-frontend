export interface Task {
    id: number;
    title: string;
    description: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'EXPIRED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    dueDate?: string;
    createdAt?: string;
    updatedAt?: string;
    // We might get the full user object or just ID depending on backend serialization,
    // looking at Task.java @JsonIgnoreProperties it seems it might serialize some user info.
    // For list view usually we just need basic info.
}
