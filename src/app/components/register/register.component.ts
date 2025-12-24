import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/auth.model';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent {
    formData: RegisterRequest = {
        name: '',
        lastname: '',
        email: '',
        password: ''
    };

    confirmPassword = '';
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
        // Validaciones
        if (!this.formData.name || !this.formData.lastname || !this.formData.email || !this.formData.password) {
            this.error = 'Por favor, completa todos los campos';
            return;
        }

        if (this.formData.password.length < 8) {
            this.error = 'La contraseña debe tener al menos 8 caracteres';
            return;
        }

        if (this.formData.password !== this.confirmPassword) {
            this.error = 'Las contraseñas no coinciden';
            return;
        }

        this.loading = true;
        this.error = '';

        this.authService.register(this.formData).subscribe({
            next: () => {
                this.loading = false;
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.loading = false;
                if (err.status === 400) {
                    this.error = 'Este email ya está registrado. Intenta con otro.';
                } else {
                    this.error = 'Error al crear la cuenta. Inténtalo de nuevo.';
                }
                console.error('Register error:', err);
            }
        });
    }
}
