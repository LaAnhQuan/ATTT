export interface User {
    id: number;
    username: string;
    email: string;
    phone?: string | null;
    password?: string | null;
    role: 'admin' | 'user';
    created_at?: string;
    updated_at?: string;
}

export interface UserListResponse {
    items: User[];
    total: number;
    skip?: number;
    limit?: number;
}
