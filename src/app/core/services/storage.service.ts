import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class StorageService {

    saveToken(token: string): void {
        localStorage.setItem('access_token', token);
        document.cookie = `access_token=${token}; path=/; SameSite=Strict;`;
    }

    getToken(): string | null {
        return localStorage.getItem('access_token');
    }

    saveUser(user: User): void {
        localStorage.setItem('current_user', JSON.stringify(user));
    }

    getUser(): User | null {
        const rawUser = localStorage.getItem('current_user');
        if (!rawUser) {
            return null;
        }

        try {
            return JSON.parse(rawUser) as User;
        } catch {
            return null;
        }
    }

    clearToken(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('current_user');
        document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    }
}
