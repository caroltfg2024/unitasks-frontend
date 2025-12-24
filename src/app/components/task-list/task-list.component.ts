import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { FilterService } from '../../services/filter.service';

import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import confetti from 'canvas-confetti';

import { ThemeService } from '../../services/theme.service';

@Component({
    selector: 'app-task-list',
    standalone: true,
    imports: [CommonModule, FormsModule, DragDropModule],
    templateUrl: './task-list.component.html',
    styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit, OnDestroy {
    tasks: Task[] = [];
    currentFilter = 'ALL';
    loading = true;
    error = '';
    private timerInterval: any;

    viewMode: 'grid' | 'list' | 'timeline' | 'calendar' = 'grid';

    calendarWeek: Array<{ label: string, date: Date, isToday: boolean, tasks: Task[] }> = [];

    // Modal state
    showEditModal = false;
    showAddModal = false;
    showDeleteModal = false;
    editingTask: Task | null = null;
    taskToDelete: Task | null = null;
    newTask: any = {
        title: '',
        description: '',
        priority: 'MEDIUM',
        dueDate: ''
    };
    editedTask: any = {
        title: '',
        description: '',
        priority: 'MEDIUM',
        dueDate: ''
    };

    // Toast state
    showToast = false;
    toastAction = '';
    toastTitle = '';
    toastType: 'delete' | 'edit' | 'create' = 'delete';

    // Highlight state
    newlyCreatedTaskId: number | null = null;

    constructor(
        private taskService: TaskService,
        private filterService: FilterService,
        private cdr: ChangeDetectorRef,
        public themeService: ThemeService
    ) { }

    onDrop(event: CdkDragDrop<Task[]>) {
        if (this.currentFilter === 'ALL') {
            moveItemInArray(this.tasks, event.previousIndex, event.currentIndex);
        } else {
            const currentFiltered = this.filteredTasks;
            const prevItem = currentFiltered[event.previousIndex];
            const targetItem = currentFiltered[event.currentIndex];

            const prevIndexInMain = this.tasks.indexOf(prevItem);
            const targetIndexInMain = this.tasks.indexOf(targetItem);

            if (prevIndexInMain !== -1 && targetIndexInMain !== -1) {
                moveItemInArray(this.tasks, prevIndexInMain, targetIndexInMain);
            }
        }
        this.cdr.detectChanges();
    }

    ngOnInit(): void {
        this.taskService.tasks$.subscribe(tasks => {
            if (tasks.length > 0 || !this.loading) {
                this.tasks = tasks;
                this.loading = false;
                this.updateCalendarWeek();
                this.cdr.detectChanges();
            }
        });

        this.taskService.getAllTasks().subscribe({
            next: () => {
                this.startTimer();
                this.updateCalendarWeek();
            },
            error: (err) => {
                console.error('Error fetching tasks', err);
                this.error = 'Error al cargar las tareas.';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });

        this.filterService.filter$.subscribe(filter => {
            this.currentFilter = filter;
            this.cdr.detectChanges();
        });
    }

    ngOnChanges(): void {
        this.updateCalendarWeek();
    }

    updateCalendarWeek(): void {
        // Calcular el lunes de la semana actual
        const now = new Date();
        const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // Lunes=1, Domingo=7
        const monday = new Date(now);
        monday.setDate(now.getDate() - dayOfWeek + 1);
        monday.setHours(0, 0, 0, 0);

        this.calendarWeek = [];
        const dayLabels = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            const isToday = now.toDateString() === date.toDateString();
            // Filtrar tareas de ese día
            const tasks = this.tasks
                .filter(t => t.dueDate && new Date(t.dueDate).toDateString() === date.toDateString())
                .sort((a, b) => {
                    const aTime = a.dueDate ? new Date(a.dueDate).getTime() : 0;
                    const bTime = b.dueDate ? new Date(b.dueDate).getTime() : 0;
                    return aTime - bTime;
                });
            this.calendarWeek.push({
                label: dayLabels[i],
                date,
                isToday,
                tasks
            });
        }
    }

    get filteredTasks(): Task[] {
        let filtered = this.tasks;

        if (this.currentFilter !== 'ALL') {
            filtered = this.tasks.filter(task => {
                const expired = this.isExpired(task);

                // If we are looking for EXPIRED tasks, show them
                if (this.currentFilter === 'EXPIRED') {
                    return expired || task.status === 'EXPIRED';
                }

                // For any other filter (PENDING, IN_PROGRESS, HIGH, etc.), 
                // if the task is expired, it should NOT show up
                if (expired || task.status === 'EXPIRED') {
                    return false;
                }

                if (this.currentFilter === 'PENDING') {
                    return task.status === 'PENDING';
                }
                if (['HIGH', 'MEDIUM', 'LOW'].includes(this.currentFilter)) {
                    return task.priority === this.currentFilter;
                }
                return task.status === this.currentFilter;
            });
        }

        // Always show newest first (by ID descending)
        return [...filtered].sort((a, b) => b.id - a.id);
    }

    get timelineTasks(): Task[] {
        return [...this.filteredTasks]
            .filter(t => t.dueDate)
            .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
    }

    ngOnDestroy(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    startTimer(): void {
        this.timerInterval = setInterval(() => {
            this.cdr.detectChanges();
        }, 1000);
    }

    getTaskProgress(task: Task): number {
        if (!task.dueDate || !task.createdAt) return 0;

        const start = new Date(task.createdAt).getTime();
        const end = new Date(task.dueDate).getTime();
        const now = new Date().getTime();

        if (now >= end) return 100;
        if (now <= start) return 0;

        const total = end - start;
        const elapsed = now - start;

        return (elapsed / total) * 100;
    }

    getTimeRemaining(dueDateStr: string | undefined): string {
        if (!dueDateStr) return '';
        const dueDate = new Date(dueDateStr);
        const now = new Date();
        const diff = dueDate.getTime() - now.getTime();

        if (diff <= 0) return 'Vencido';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return `${hours}h ${minutes}m ${seconds}s`;
    }

    getTimerStatus(dueDateStr: string | undefined): 'safe' | 'warning' | 'critical' {
        if (!dueDateStr) return 'safe';
        const dueDate = new Date(dueDateStr);
        const now = new Date();
        const diff = dueDate.getTime() - now.getTime();

        const oneHour = 1000 * 60 * 60;
        const oneDay = oneHour * 24;

        if (diff < oneHour) return 'critical';
        if (diff < oneDay) return 'warning';
        return 'safe';
    }

    getTimerValues(dueDateStr: string | undefined): { h: string, m: string, s: string } {
        if (!dueDateStr) return { h: '0', m: '0', s: '0' };
        const dueDate = new Date(dueDateStr);
        const now = new Date();
        const diff = dueDate.getTime() - now.getTime();

        if (diff <= 0) return { h: '0', m: '0', s: '0' };

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return {
            h: hours.toString(),
            m: minutes.toString(),
            s: seconds.toString()
        };
    }

    isExpired(task: Task): boolean {
        if (!task.dueDate || task.status === 'DONE') return false;
        const now = new Date();
        const dueDate = new Date(task.dueDate);
        return dueDate < now;
    }

    toggleStatus(task: Task): void {
        let nextStatus = '';

        if (task.status === 'PENDING' || task.status === 'EXPIRED') {
            nextStatus = 'IN_PROGRESS';
        } else if (task.status === 'IN_PROGRESS') {
            nextStatus = 'DONE';
        } else if (task.status === 'DONE') {
            nextStatus = 'PENDING';
        }

        if (nextStatus) {
            this.taskService.updateTaskStatus(task.id, nextStatus).subscribe({
                next: (updatedTask) => {
                    const wasDone = task.status !== 'DONE' && updatedTask.status === 'DONE';
                    task.status = updatedTask.status;

                    if (wasDone) {
                        this.triggerSuccessEffect();
                    }

                    this.cdr.detectChanges();
                },
                error: (err) => console.error('Error updating status', err)
            });
        }
    }

    private showNotification(action: string, title: string, type: 'delete' | 'edit' | 'create'): void {
        this.toastAction = action;
        this.toastTitle = title;
        this.toastType = type;
        this.showToast = true;
        this.cdr.detectChanges();

        setTimeout(() => {
            this.showToast = false;
            this.cdr.detectChanges();
        }, 4000); // 4 segundos
    }

    private triggerSuccessEffect(): void {
        // Play triumphant sound
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
        audio.volume = 0.4;
        audio.play().catch(err => console.log('Audio playback delayed until user interaction', err));

        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 3000 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    }

    get weeklyStats() {
        const stats = [];
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            d.setHours(0, 0, 0, 0);

            const dayLabel = i === 0 ? 'Hoy' : i === 1 ? 'Ayer' : days[d.getDay()];
            const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;

            const count = this.tasks.filter(t => {
                if (t.status !== 'DONE') return false;

                const dueDate = t.dueDate ? new Date(t.dueDate) : null;
                const updateDate = new Date(t.updatedAt || t.createdAt || '');

                let reportDate = updateDate;

                if (dueDate) {
                    dueDate.setHours(0, 0, 0, 0);
                    // Si el vencimiento fue hoy o en el pasado, lo usamos para el reporte histórico
                    if (dueDate <= now) {
                        reportDate = dueDate;
                    }
                }

                reportDate.setHours(0, 0, 0, 0);
                return reportDate.getTime() === d.getTime();
            }).length;


            stats.push({
                day: dayLabel,
                date: dateStr,
                count: count,
                fullDate: d
            });
        }
        return stats;
    }

    get totalCompletedToday(): number {
        return this.weeklyStats.find(s => s.day === 'Hoy')?.count || 0;
    }

    openAddModal(): void {
        this.newTask = {
            title: '',
            description: '',
            priority: 'MEDIUM',
            dueDate: ''
        };
        this.showAddModal = true;
        this.cdr.detectChanges();
    }

    closeAddModal(): void {
        this.showAddModal = false;
        this.cdr.detectChanges();
    }

    createTask(): void {
        if (this.newTask.title.trim()) {
            this.taskService.createTask(this.newTask).subscribe({
                next: (createdTask: Task) => {
                    this.newlyCreatedTaskId = createdTask.id;
                    this.showNotification('Se creó la tarjeta', createdTask.title, 'create');
                    this.closeAddModal();

                    // Remove glow effect after 5 seconds
                    setTimeout(() => {
                        this.newlyCreatedTaskId = null;
                        this.cdr.detectChanges();
                    }, 5000);

                    this.cdr.detectChanges();
                },
                error: (err) => console.error('Error creating task', err)
            });
        }
    }

    editTask(task: Task): void {
        this.editingTask = task;
        // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
        let formattedDate = '';
        if (task.dueDate) {
            const d = new Date(task.dueDate);
            formattedDate = d.toISOString().slice(0, 16);
        }

        this.editedTask = {
            title: task.title,
            description: task.description,
            priority: task.priority,
            dueDate: formattedDate
        };
        this.showEditModal = true;
        this.cdr.detectChanges();
    }

    closeEditModal(): void {
        this.showEditModal = false;
        this.editingTask = null;
        this.cdr.detectChanges();
    }

    saveTask(): void {
        if (this.editingTask) {
            const updatedTask = {
                ...this.editingTask,
                ...this.editedTask
            };

            this.taskService.updateTask(this.editingTask.id, updatedTask).subscribe({
                next: () => {
                    this.showNotification('Se actualizó la tarjeta', updatedTask.title, 'edit');
                    this.closeEditModal();
                    this.cdr.detectChanges();
                },
                error: (err) => console.error('Error updating task', err)
            });
        }
    }

    deleteTask(task: Task): void {
        this.taskToDelete = task;
        this.showDeleteModal = true;
        this.cdr.detectChanges();
    }

    closeDeleteModal(): void {
        this.showDeleteModal = false;
        this.taskToDelete = null;
        this.cdr.detectChanges();
    }

    confirmDelete(): void {
        if (this.taskToDelete) {
            const title = this.taskToDelete.title;
            this.taskService.deleteTask(this.taskToDelete.id).subscribe({
                next: () => {
                    this.showNotification('Se eliminó la tarjeta', title, 'delete');
                    this.closeDeleteModal();
                    this.cdr.detectChanges();
                },
                error: (err) => console.error('Error deleting task', err)
            });
        }
    }
}
