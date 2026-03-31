import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User, UserListResponse } from '../../../core/models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private apiUrl = `${environment.apiUrl}/api/users/users`;

    constructor(private http: HttpClient) { }

    getUsers(skip: number = 0, limit: number = 10): Observable<UserListResponse> {
        const params = new HttpParams()
            .set('skip', skip.toString())
            .set('limit', limit.toString());

        return this.http.get<UserListResponse>(this.apiUrl, { params });
    }

    getUserById(userId: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${userId}`);
    }

    createUser(userData: Partial<User>): Observable<User> {
        return this.http.post<User>(this.apiUrl, userData);
    }

    updateUser(userId: number, userData: Partial<User>): Observable<any> {
        return this.http.put(`${this.apiUrl}/${userId}`, userData);
    }

    deleteUser(userId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${userId}`);
    }

    getDecryptedInfo(userId: number, password: string): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/${userId}/decrypt-info`, { password });
    }

    resetPassword(userId: number, newPassword: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/${userId}/reset-password`, { new_password: newPassword });
    }
}
