// Interfaces para autenticación

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    lastname: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    email: string;
    name: string;
    lastname: string;
}

export interface User {
    email: string;
    name: string;
    lastname: string;
}
