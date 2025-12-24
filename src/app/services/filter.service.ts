import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FilterService {
    private filterSubject = new BehaviorSubject<string>('ALL');
    filter$ = this.filterSubject.asObservable();

    setFilter(status: string) {
        this.filterSubject.next(status);
    }

    get currentFilter() {
        return this.filterSubject.value;
    }
}
