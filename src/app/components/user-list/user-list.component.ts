import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-user-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
    users: User[] = [];
    loading = true;
    error = '';

    constructor(private userService: UserService, private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.userService.getAllUsers().subscribe({
            next: (data) => {
                this.users = data;
                this.loading = false;
                this.cdr.detectChanges(); // Forzar actualización de vista
            },
            error: (err) => {
                console.error('Error fetching users', err);
                this.error = 'Error al cargar los usuarios.';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }
}
