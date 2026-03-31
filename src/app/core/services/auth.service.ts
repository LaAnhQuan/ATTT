import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();
    public isAuthenticated$ = this.currentUser$.pipe(map(user => !!user));
    public isAdmin$ = this.currentUser$.pipe(map(user => user?.role === 'admin'));


    private apiUrl = `${environment.apiUrl}/api/auth/auth`;

    constructor(
        private http: HttpClient,
        private storageService: StorageService
    ) {
        this.checkInitialLoginState();
    }

    getToken(): string | null {
        return this.storageService.getToken();
    }

    login(credentials: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                this.storageService.saveToken(response.access_token);
                const user: User = { id: response.user_id, username: response.username, role: response.role, email: response.email };
                this.currentUserSubject.next(user);
            }),
            catchError(error => {
                this.currentUserSubject.next(null);
                throw error;
            })
        );
    }

    logout(): void {
        this.storageService.clearToken();
        this.currentUserSubject.next(null);
    }

    isAuthenticated(): boolean {
        return !!this.storageService.getToken();
    }

    private checkInitialLoginState(): void {
        const token = this.storageService.getToken();
        if (token) {
            // In a real app, you'd call an API to validate the token and get user info
            // For now, we'll simulate it if the token exists.
            // This part needs to be implemented properly with a backend endpoint.
            // For example: this.http.get('/api/me').subscribe(user => this.currentUserSubject.next(user));
        }
    }
}
