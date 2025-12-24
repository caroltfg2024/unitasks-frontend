import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { LeaderboardEntry } from '../models/leaderboard.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    // private apiUrl = 'http://localhost:8080/api/users';
    private apiUrl = 'https://unitasks-backend.onrender.com/api/users';

    constructor(private http: HttpClient) { }

    getAllUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl);
    }

    getLeaderboard(): Observable<LeaderboardEntry[]> {
        return this.http.get<LeaderboardEntry[]>(`${this.apiUrl}/leaderboard`);
    }
}
