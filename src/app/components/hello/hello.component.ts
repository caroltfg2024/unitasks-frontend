import { Component, OnInit, ChangeDetectorRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelloService } from '../../services/hello.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-hello',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './hello.component.html',
    styleUrls: ['./hello.component.css']
})
export class HelloComponent implements OnInit {
    message: string = 'Cargando...';
    userName: string = 'Usuario';

    constructor(
        private helloService: HelloService,
        public authService: AuthService,
        private cdr: ChangeDetectorRef
    ) {
        // Efecto reactivo que actualiza el nombre cuando cambia el usuario
        effect(() => {
            const user = this.authService.currentUser();
            if (user) {
                this.userName = user.name.split(' ')[0];
            }
        });
    }

    ngOnInit() {
        // El nombre ya se maneja en el constructor con effect
    }
}

