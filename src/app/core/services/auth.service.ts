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
                this.storageService.saveUser(user);
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
            const storedUser = this.storageService.getUser();
            if (storedUser) {
                this.currentUserSubject.next(storedUser);
            }
        }
    }
}
