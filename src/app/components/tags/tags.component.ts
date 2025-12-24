import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterService } from '../../services/filter.service';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

@Component({
    selector: 'app-tags',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './tags.component.html',
    styleUrls: ['./tags.component.css']
})
export class TagsComponent implements OnInit {
    tags = [
        { name: 'Tareas', status: '', color: '', isDivider: true },
        { name: 'TODAS', status: 'ALL', color: '#6366f1', count: 0 },
        { name: 'PENDIENTES', status: 'PENDING', color: '#cbd5e1', count: 0 },
        { name: 'EN PROCESO', status: 'IN_PROGRESS', color: '#fde047', count: 0 },
        { name: 'COMPLETADAS', status: 'DONE', color: '#4ade80', count: 0 },
        { name: 'EXPIRADAS', status: 'EXPIRED', color: '#ef4444', count: 0 },
        { name: 'Prioridades', status: '', color: '', isDivider: true },
        { name: 'ALTA', status: 'HIGH', color: '#8b5cf6', count: 0 },
        { name: 'MEDIA', status: 'MEDIUM', color: '#0d9488', count: 0 },
        { name: 'BAJA', status: 'LOW', color: '#475569', count: 0 }
    ];

    constructor(
        private filterService: FilterService,
        private taskService: TaskService
    ) { }

    ngOnInit(): void {
        this.taskService.tasks$.subscribe(tasks => {
            this.updateCounts(tasks);
        });
    }

    get currentFilter(): string {
        return this.filterService.currentFilter;
    }

    updateCounts(tasks: Task[]): void {
        const now = new Date();
        this.tags.forEach(tag => {
            if (tag.isDivider) return;

            if (tag.status === 'ALL') {
                tag.count = tasks.length;
            } else if (tag.status === 'EXPIRED') {
                tag.count = tasks.filter(t => (t.status === 'EXPIRED' || (t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE'))).length;
            } else {
                // For any other filter, exclude tasks that are effectively expired
                tag.count = tasks.filter(t => {
                    const isExpired = t.status === 'EXPIRED' || (t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE');
                    if (isExpired) return false;

                    if (['HIGH', 'MEDIUM', 'LOW'].includes(tag.status)) {
                        return t.priority === tag.status;
                    }
                    return t.status === tag.status;
                }).length;
            }
        });
    }

    selectFilter(status: string) {
        if (!status) return;
        this.filterService.setFilter(status);
    }
}
