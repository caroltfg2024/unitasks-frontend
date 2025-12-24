import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    // Obtener token del localStorage
    const token = localStorage.getItem('unitasks_token');

    // Si hay token y la petición es a nuestra API, añadir el header
    if (token && req.url.includes('localhost:8080')) {
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(authReq);
    }

    return next(req);
};
