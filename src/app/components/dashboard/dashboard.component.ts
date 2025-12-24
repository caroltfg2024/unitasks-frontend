import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HelloComponent } from '../hello/hello.component';
import { TaskListComponent } from '../task-list/task-list.component';
import { TagsComponent } from '../tags/tags.component';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, HelloComponent, TaskListComponent, TagsComponent],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
    constructor(
        public authService: AuthService,
        public themeService: ThemeService,
        private router: Router
    ) { }

    logout(): void {
        this.authService.logout();
    }

    goToLeaderboard(): void {
        this.router.navigate(['/clasificacion']);
    }
}
