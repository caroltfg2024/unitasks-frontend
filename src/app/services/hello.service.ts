import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class HelloService {
    // private apiUrl = 'http://localhost:8080/api/hello';
    private apiUrl = 'https://unitasks-backend.onrender.com/api/hello';

    constructor(private http: HttpClient) { }

    // Devuelve texto plano del backend
    getHello() {
        return this.http.get(this.apiUrl, { responseType: 'text' });
    }
}
