import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const authToken = authService.getToken();

    if (authToken) {
        const normalizedToken = authToken.startsWith('Bearer ')
            ? authToken.slice(7)
            : authToken;

        const authReq = req.clone({
            withCredentials: true,
            setHeaders: {
                Authorization: `Bearer ${normalizedToken}`
            }
        });

        return next(authReq);
    }

    return next(req);
};
