import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { LeaderboardEntry } from '../../models/leaderboard.model';
import { timeout } from 'rxjs';

@Component({
    selector: 'app-leaderboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
    leaderboard: LeaderboardEntry[] = [];
    loading = true;
    error = '';
    currentUserEmail = '';

    constructor(
        private userService: UserService,
        public authService: AuthService,
        public themeService: ThemeService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {
        const user = this.authService.currentUser();
        if (user) {
            this.currentUserEmail = user.email;
        }
    }

    ngOnInit(): void {
        this.loadLeaderboard();
    }

    loadLeaderboard(): void {
        console.log('Iniciando carga de clasificación...');
        this.userService.getLeaderboard().pipe(
            timeout(10000) // 10 segundos de timeout
        ).subscribe({
            next: (data) => {
                console.log('Clasificación cargada:', data);
                this.leaderboard = data;
                this.loading = false;
                this.error = '';
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error cargando clasificación:', err);
                this.error = 'Error al cargar la clasificación. Por favor, intenta de nuevo.';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    goToDashboard(): void {
        this.router.navigate(['/dashboard']);
    }

    isCurrentUser(entry: LeaderboardEntry): boolean {
        return entry.email === this.currentUserEmail;
    }

    getMedalEmoji(position: number): string {
        if (position === 1) return '🥇';
        if (position === 2) return '🥈';
        if (position === 3) return '🥉';
        return '';
    }
}
