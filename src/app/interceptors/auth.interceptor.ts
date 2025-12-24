import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    // Obtener token del localStorage
    const token = localStorage.getItem('unitasks_token');

    // Solo para referencia: añadir token en local
    // if (token && req.url.includes('localhost:8080')) {
    //     const authReq = req.clone({
    //         setHeaders: {
    //             Authorization: `Bearer ${token}`
    //         }
    //     });
    //     return next(authReq);
    // }

    // Añadir el token a cualquier petición a la API (local o Render)
    if (token && req.url.includes('/api/')) {
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(authReq);
    }

    return next(req);
};
