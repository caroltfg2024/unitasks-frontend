import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth.model';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    credentials: LoginRequest = {
        email: '',
        password: ''
    };

    loading = false;
    error = '';

    constructor(
        private authService: AuthService,
        private router: Router
    ) {
        // Si ya está autenticado, redirigir al dashboard
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/dashboard']);
        }
    }

    onSubmit(): void {
        if (!this.credentials.email || !this.credentials.password) {
            this.error = 'Por favor, completa todos los campos';
            return;
        }

        this.loading = true;
        this.error = '';

        this.authService.login(this.credentials).subscribe({
            next: () => {
                this.loading = false;
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.loading = false;
                this.error = 'Credenciales incorrectas. Verifica tu email y contraseña.';
                console.error('Login error:', err);
            }
        });
    }
}
