import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { catchError, finalize, of } from 'rxjs';
import { User } from '../../../../core/models/user.model';
import { UserService } from '../../../user/services/user.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    users: User[] = [];
    total = 0;
    loading = false;
    errorMessage: string | null = null;

    constructor(private userService: UserService) { }

    ngOnInit(): void {
        this.loadUsers();
    }

    private loadUsers(): void {
        this.loading = true;
        this.errorMessage = null;

        this.userService.getUsers(0, 50).pipe(
            catchError((error) => {
                this.errorMessage = error?.error?.message || 'Khong the tai danh sach nhan vien.';
                return of({ items: [], total: 0 });
            }),
            finalize(() => {
                this.loading = false;
            })
        ).subscribe((response) => {
            if (!response || !Array.isArray(response.items)) {
                this.errorMessage = 'Du lieu API khong dung dinh dang mong doi.';
                this.users = [];
                this.total = 0;
                return;
            }

            this.users = response.items;
            this.total = typeof response.total === 'number' ? response.total : response.items.length;
        });
    }
}
