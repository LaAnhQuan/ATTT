export interface User {
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'user';
}

export interface UserListResponse {
    items: User[];
    total: number;
}
