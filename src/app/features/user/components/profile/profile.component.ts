import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { User } from '../../../../core/models/user.model';
import { StorageService } from '../../../../core/services/storage.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    user: User | null = null;

    constructor(private storageService: StorageService) { }

    ngOnInit(): void {
        this.user = this.storageService.getUser();
    }
}
