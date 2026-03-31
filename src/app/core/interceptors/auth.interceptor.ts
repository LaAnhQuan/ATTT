import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    if (authService.isAuthenticated()) {
        const authToken = authService.getToken();
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${authToken}`
            }
        });
        return next(authReq);
    }
    return next(req);
};
