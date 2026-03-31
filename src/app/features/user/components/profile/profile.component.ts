import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { User } from '../../../../core/models/user.model';
import { StorageService } from '../../../../core/services/storage.service';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    userId: number | null = null;
    user: User | null = null;
    loading = false;
    decryptLoading = false;
    errorMessage: string | null = null;
    decryptErrorMessage: string | null = null;
    decryptSuccessMessage: string | null = null;
    decryptionKey = '';

    constructor(
        private storageService: StorageService,
        private userService: UserService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        const localUser = this.storageService.getUser();
        const userId = localUser?.id;

        if (!userId) {
            this.errorMessage = 'Khong tim thay user_id trong localStorage.';
            this.user = null;
            return;
        }

        this.userId = userId;
        this.fetchUser(userId);
    }

    onDecryptInfo(): void {
        if (this.user?.role !== 'user') {
            this.decryptErrorMessage = 'Chi tai khoan user moi duoc phep giai ma thong tin.';
            this.decryptSuccessMessage = null;
            return;
        }

        if (!this.userId) {
            this.decryptErrorMessage = 'Khong tim thay user_id de giai ma.';
            return;
        }

        const key = this.decryptionKey.trim();
        if (!key) {
            this.decryptErrorMessage = 'Vui long nhap key de giai ma.';
            return;
        }

        this.decryptLoading = true;
        this.decryptErrorMessage = null;
        this.decryptSuccessMessage = null;

        this.userService.getDecryptedInfo(this.userId, key).pipe(
            finalize(() => {
                this.decryptLoading = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: (user) => {
                this.user = user;
                this.storageService.saveUser(user);
                this.decryptSuccessMessage = 'Giai ma thanh cong.';
                this.decryptErrorMessage = null;
                this.cdr.detectChanges();
            },
            error: (error) => {
                this.decryptErrorMessage = error?.error?.message || 'Giai ma that bai. Vui long kiem tra lai key.';
                this.decryptSuccessMessage = null;
                this.cdr.detectChanges();
            }
        });
    }

    private fetchUser(userId: number): void {

        this.loading = true;
        this.errorMessage = null;

        this.userService.getUserById(userId).pipe(
            finalize(() => {
                this.loading = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: (user) => {
                this.user = user;
                this.storageService.saveUser(user);
                this.cdr.detectChanges();
            },
            error: (error) => {
                this.user = null;
                this.errorMessage = error?.error?.message || 'Khong the tai thong tin ca nhan.';
                this.cdr.detectChanges();
            }
        });
    }
}
