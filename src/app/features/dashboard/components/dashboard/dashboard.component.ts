import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { catchError, finalize, of } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { StorageService } from '../../../../core/services/storage.service';
import { User } from '../../../../core/models/user.model';
import { MaskingMode, UserService } from '../../../user/services/user.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatCardModule, MatProgressBarModule, MatTableModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    displayedColumns: string[] = ['id', 'username', 'email', 'phone', 'password', 'role'];
    users: User[] = [];
    total = 0;
    loading = false;
    errorMessage: string | null = null;
    isAdmin = false;
    selectedMaskingMode: MaskingMode = 'mask';
    maskUpdateLoading = false;
    maskUpdateError: string | null = null;
    maskUpdateSuccess: string | null = null;
    readonly maskingModes: MaskingMode[] = ['mask', 'shuffle', 'fake', 'noise'];

    constructor(
        private userService: UserService,
        private storageService: StorageService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        const currentUser = this.storageService.getUser();
        this.isAdmin = currentUser?.role === 'admin';
        this.loadUsers();
    }

    refreshUsers(): void {
        this.loadUsers();
    }

    onMaskingModeChange(mode: string): void {
        if (!this.maskingModes.includes(mode as MaskingMode)) {
            return;
        }
        this.selectedMaskingMode = mode as MaskingMode;
    }

    applyMaskingMode(): void {
        if (!this.isAdmin || this.maskUpdateLoading) {
            return;
        }

        this.maskUpdateLoading = true;
        this.maskUpdateError = null;
        this.maskUpdateSuccess = null;

        this.userService.setGlobalMaskingMode('user', this.selectedMaskingMode).pipe(
            catchError((error) => {
                this.maskUpdateError = error?.error?.message || 'Khong the cap nhat masking mode.';
                return of(null);
            }),
            finalize(() => {
                this.maskUpdateLoading = false;
                this.cdr.detectChanges();
            })
        ).subscribe((response) => {
            if (!response) {
                this.cdr.detectChanges();
                return;
            }

            this.maskUpdateSuccess = `Da ap dung thanh cong masking mode: ${response.masking_mode}.`;
            this.cdr.detectChanges();
        });
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
                // Ensure view updates immediately even in delayed change-detection scenarios.
                this.cdr.detectChanges();
            })
        ).subscribe((response) => {
            if (!response || !Array.isArray(response.items)) {
                this.errorMessage = 'Du lieu API khong dung dinh dang mong doi.';
                this.users = [];
                this.total = 0;
                this.cdr.detectChanges();
                return;
            }

            this.users = response.items;
            this.total = typeof response.total === 'number' ? response.total : response.items.length;
            this.cdr.detectChanges();
        });
    }
}
