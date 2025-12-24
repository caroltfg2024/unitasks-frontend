import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    // private apiUrl = 'http://localhost:8080/api/tasks';
    private apiUrl = 'https://unitasks-backend.onrender.com/api/tasks';
    private tasksSubject = new BehaviorSubject<Task[]>([]);
    tasks$ = this.tasksSubject.asObservable();

    constructor(private http: HttpClient) { }

    refreshTasks(): void {
        this.http.get<Task[]>(this.apiUrl).subscribe(tasks => {
            this.tasksSubject.next(tasks);
        });
    }

    getAllTasks(): Observable<Task[]> {
        return this.http.get<Task[]>(this.apiUrl).pipe(
            tap(tasks => this.tasksSubject.next(tasks))
        );
    }

    updateTaskStatus(id: number, status: string): Observable<Task> {
        return this.http.patch<Task>(`${this.apiUrl}/${id}/status?status=${status}`, {}).pipe(
            tap(() => this.refreshTasks())
        );
    }

    updateTask(id: number, task: Task): Observable<Task> {
        return this.http.put<Task>(`${this.apiUrl}/${id}`, task).pipe(
            tap(() => this.refreshTasks())
        );
    }

    deleteTask(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            tap(() => this.refreshTasks())
        );
    }

    createTask(task: any): Observable<Task> {
        return this.http.post<Task>(this.apiUrl, task).pipe(
            tap(() => this.refreshTasks())
        );
    }
}
