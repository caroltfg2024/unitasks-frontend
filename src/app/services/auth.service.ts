import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../models/auth.model';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // private apiUrl = 'http://localhost:8080/api/auth';
    private apiUrl = 'https://unitasks-backend.onrender.com/api/auth';
    private tokenKey = 'unitasks_token';
    private userKey = 'unitasks_user';

    // Signals para estado reactivo
    private currentUserSignal = signal<User | null>(this.getStoredUser());

    // Computed para saber si está autenticado
    isAuthenticated = computed(() => !!this.currentUserSignal() && !!this.getToken());
    currentUser = computed(() => this.currentUserSignal());

    constructor(private http: HttpClient, private router: Router) {
        // Verificar token al iniciar
        this.checkAuthStatus();
    }

    /**
     * Registra un nuevo usuario
     */
    register(request: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
            tap(response => this.handleAuthSuccess(response))
        );
    }

    /**
     * Inicia sesión
     */
    login(request: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
            tap(response => this.handleAuthSuccess(response))
        );
    }

    /**
     * Cierra sesión
     */
    logout(): void {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        this.currentUserSignal.set(null);
        this.router.navigate(['/login']);
    }

    /**
     * Obtiene el token JWT almacenado
     */
    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * Obtiene el usuario almacenado
     */
    private getStoredUser(): User | null {
        const userStr = localStorage.getItem(this.userKey);
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
        return null;
    }

    /**
     * Maneja el éxito de autenticación
     */
    private handleAuthSuccess(response: AuthResponse): void {
        localStorage.setItem(this.tokenKey, response.token);
        const user: User = {
            email: response.email,
            name: response.name,
            lastname: response.lastname
        };
        localStorage.setItem(this.userKey, JSON.stringify(user));
        this.currentUserSignal.set(user);
    }

    /**
     * Verifica si el usuario está autenticado al cargar la app
     */
    private checkAuthStatus(): void {
        const token = this.getToken();
        const user = this.getStoredUser();
        if (token && user) {
            this.currentUserSignal.set(user);
        } else {
            this.currentUserSignal.set(null);
        }
    }

    /**
     * Obtiene el nombre completo del usuario
     */
    getFullName(): string {
        const user = this.currentUserSignal();
        if (user) {
            return `${user.name} ${user.lastname}`;
        }
        return '';
    }
}
