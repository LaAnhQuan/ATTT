import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {

    saveToken(token: string): void {
        localStorage.setItem('access_token', token);
        document.cookie = `access_token=${token}; path=/; SameSite=Strict;`;
    }

    getToken(): string | null {
        return localStorage.getItem('access_token');
    }

    clearToken(): void {
        localStorage.removeItem('access_token');
        document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    }
}
