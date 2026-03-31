# 4. Authentication (Xác thực)

Quy trình xác thực là một phần quan trọng của hầu hết các ứng dụng web. Dưới đây là cách chúng ta triển khai nó một cách an toàn và hiệu quả trong Angular.

## 4.1. Luồng hoạt động

1.  **Người dùng nhập thông tin**: Người dùng truy cập trang Login và nhập `username`, `password`.
2.  **Gọi API Login**: `LoginComponent` gọi `AuthService.login(username, password)`.
3.  **`AuthService` gửi Request**: `AuthService` sử dụng `HttpClient` để gửi một `POST` request đến endpoint `/api/auth/auth/login` của backend.
4.  **Backend xử lý**: Backend xác thực thông tin, nếu thành công, trả về một `access_token` và thông tin người dùng.
5.  **Lưu trữ Token**: `AuthService` nhận được token và gọi `StorageService` để lưu trữ nó.
    -   **`localStorage`**: Lưu `access_token` vào `localStorage` để duy trì trạng thái đăng nhập sau khi người dùng tắt trình duyệt.
    -   **`Cookie`**: Đồng thời lưu `access_token` vào `cookie` (với cờ `HttpOnly` và `Secure` nếu có thể từ backend, hoặc từ frontend nếu cần). Việc lưu vào cookie có thể giúp chống lại một số cuộc tấn công XSS và là một lớp bảo vệ bổ sung.
6.  **Cập nhật State**: `AuthService` cập nhật một `BehaviorSubject` (ví dụ: `currentUser$`) để thông báo cho các phần khác của ứng dụng rằng người dùng đã đăng nhập.
7.  **Điều hướng**: `LoginComponent` điều hướng người dùng đến trang dashboard (`/app/dashboard`).
8.  **Gửi Request kèm Token**: Mọi request tiếp theo đến API sẽ được `AuthInterceptor` "chặn" lại.
9.  **`AuthInterceptor` hoạt động**: Interceptor này sẽ đọc token từ `StorageService` và tự động thêm `Authorization: Bearer <token>` vào header của request trước khi gửi đi.
10. **Đăng xuất**: Khi người dùng click Logout, `AuthService.logout()` sẽ được gọi. Service này sẽ xóa token khỏi `localStorage` và `cookie`, cập nhật `currentUser$` thành `null`, và điều hướng người dùng về trang Login.

## 4.2. Triển khai chi tiết

### `StorageService` (`core/services/storage.service.ts`)

Tạo một service để quản lý việc tương tác với `localStorage` và `cookies`. Điều này giúp mã nguồn sạch hơn và dễ dàng thay đổi cơ chế lưu trữ trong tương lai.

```typescript
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {

  // Lưu vào cả localStorage và cookie
  saveToken(token: string): void {
    localStorage.setItem('access_token', token);
    // Cài đặt cookie, có thể thêm các tùy chọn an toàn
    document.cookie = `access_token=${token}; path=/; SameSite=Strict;`;
  }

  getToken(): string | null {
    // Ưu tiên lấy từ localStorage, hoặc có thể đọc từ cookie nếu cần
    return localStorage.getItem('access_token');
  }

  // Xóa khỏi cả hai nơi
  clearToken(): void {
    localStorage.removeItem('access_token');
    // Xóa cookie bằng cách set thời gian hết hạn trong quá khứ
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
  }

  // Các hàm lưu/lấy thông tin người dùng khác...
}
```

### `AuthService` (`core/services/auth.service.ts`)

Service trung tâm xử lý logic xác thực.

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { StorageService } from './storage.service';
import { User } from '../models/user.model'; // Giả sử có model User
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private apiUrl = `${environment.apiUrl}/api/auth/auth`;

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    // Kiểm tra trạng thái đăng nhập khi service được khởi tạo
    this.checkInitialLoginState();
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        this.storageService.saveToken(response.access_token);
        // Giả sử response có thông tin user
        const user: User = { id: response.user_id, username: response.username, role: response.role };
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    this.storageService.clearToken();
    this.currentUserSubject.next(null);
    // Thường sẽ có điều hướng ở component gọi hàm này
  }

  isAuthenticated(): boolean {
    return !!this.storageService.getToken();
  }

  private checkInitialLoginState(): void {
    const token = this.storageService.getToken();
    if (token) {
      // Nếu có token, có thể gọi API để lấy thông tin user và cập nhật currentUserSubject
      // Hoặc giải mã token (nếu là JWT) để lấy thông tin cơ bản
      // Ví dụ đơn giản:
      // const decodedToken = jwt_decode(token);
      // this.currentUserSubject.next(decodedToken.user);
    }
  }
}
```

### `AuthInterceptor` (`core/interceptors/auth.interceptor.ts`)

Interceptor này tự động thêm token vào mỗi request.

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.authService.isAuthenticated()) {
      const token = this.authService.storageService.getToken(); // Lấy token
      // Clone request và thêm header Authorization
      const clonedReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(clonedReq);
    }
    // Nếu không có token, gửi request gốc đi
    return next.handle(req);
  }
}
```

### Cung cấp Interceptor trong `app.config.ts`

Để Interceptor hoạt động, bạn cần cung cấp nó trong file cấu hình chính của ứng dụng.

```typescript
// app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // Cung cấp HttpClient và đăng ký interceptor
    provideHttpClient(withInterceptors([AuthInterceptor]))
  ]
};
```

Với `withInterceptors`, `AuthInterceptor` sẽ được áp dụng cho mọi `HttpClient` request trong ứng dụng.
