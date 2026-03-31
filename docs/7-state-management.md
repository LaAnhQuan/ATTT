# 7. Quản lý State

Quản lý state (trạng thái) của ứng dụng là việc duy trì và chia sẻ dữ liệu một cách nhất quán giữa các component. Với một ứng dụng có độ phức tạp trung bình, chúng ta có thể sử dụng các công cụ sẵn có của Angular và RxJS mà không cần đến các thư viện lớn như NgRx hay Akita.

## 7.1. Phương pháp: Services và RxJS

Chúng ta sẽ sử dụng **Angular Services** kết hợp với **RxJS `BehaviorSubject`** để tạo ra các "stores" đơn giản cho việc quản lý state.

- **`BehaviorSubject`**:
  - Là một loại `Subject` đặc biệt của RxJS.
  - Luôn có một giá trị hiện tại. Bất kỳ ai subscribe vào `BehaviorSubject` sẽ ngay lập tức nhận được giá trị cuối cùng của nó.
  - Rất phù hợp để lưu trữ state vì các component có thể truy cập giá trị state bất cứ lúc nào.

## 7.2. Luồng hoạt động

1.  **Tạo Store trong Service**: Một service (ví dụ: `AuthService`, `UserService`) sẽ chứa một `private BehaviorSubject` để lưu trữ state.
2.  **Public Observable**: Service sẽ expose một `public` Observable (thông qua phương thức `.asObservable()`) để các component có thể "lắng nghe" (subscribe) sự thay đổi của state. Việc này ngăn các component tự ý thay đổi state bằng cách gọi `.next()` trực tiếp.
3.  **Component Lắng nghe**: Component sẽ inject service và subscribe vào public observable đó, thường là sử dụng `async` pipe trong template để tự động quản lý subscription.
4.  **Cập nhật State**: Service cung cấp các phương thức public (ví dụ: `login()`, `updateUser()`, `loadUsers()`) để thực hiện các hành động. Sau khi hành động hoàn tất (thường là sau khi gọi API thành công), service sẽ cập nhật `BehaviorSubject` bằng cách gọi `.next()` với dữ liệu mới.
5.  **Thông báo thay đổi**: Ngay khi `.next()` được gọi, tất cả các component đang lắng nghe observable sẽ tự động nhận được dữ liệu mới và cập nhật lại giao diện.

## 7.3. Ví dụ: State của người dùng đăng nhập

Chúng ta đã thấy một phần trong `AuthService`. Đây là phiên bản hoàn chỉnh hơn.

**`core/services/auth.service.ts`**

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
// ... imports khác

@Injectable({ providedIn: 'root' })
export class AuthService {
  // 1. private BehaviorSubject để giữ state
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  // 2. public Observable để các component lắng nghe
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.currentUser$.pipe(map(user => !!user));
  public isAdmin$ = this.currentUser$.pipe(map(user => user?.role === 'admin'));

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    this.checkInitialLoginState();
  }

  // 4. Phương thức public để cập nhật state
  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.storageService.saveToken(response.access_token);
        const user: User = { id: response.user_id, username: response.username, role: response.role };
        // Cập nhật state, thông báo cho toàn bộ ứng dụng
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        // Xử lý lỗi, đảm bảo state không bị sai
        this.currentUserSubject.next(null);
        throw error;
      })
    );
  }

  logout(): void {
    this.storageService.clearToken();
    this.currentUserSubject.next(null);
    // Điều hướng về trang login
  }

  // ...
}
```

### Sử dụng trong Component

Một component `HeaderComponent` có thể hiển thị tên người dùng và nút Logout/Login dựa trên state này.

**`shared/components/header/header.component.ts`**

```typescript
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  currentUser$: Observable<User | null>;
  isAuthenticated$: Observable<boolean>;

  constructor(private authService: AuthService) {
    // 3. Lắng nghe state từ service
    this.currentUser$ = this.authService.currentUser$;
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  logout(): void {
    this.authService.logout();
  }
}
```

**`header.component.html`**

```html
<header>
  <nav>
    <!-- Sử dụng async pipe để tự động subscribe/unsubscribe -->
    <div *ngIf="isAuthenticated$ | async; else guestView">
      <ng-container *ngIf="currentUser$ | async as user">
        <span>Chào, {{ user.username }}!</span>
      </ng-container>
      <button (click)="logout()">Đăng xuất</button>
    </div>
    <ng-template #guestView>
      <a routerLink="/auth/login">Đăng nhập</a>
    </ng-template>
  </nav>
</header>
```

**Ưu điểm của phương pháp này:**

- **Đơn giản**: Dễ hiểu và triển khai, không cần học cú pháp phức tạp của các thư viện bên ngoài.
- **Hiệu quả**: Tận dụng sức mạnh của RxJS để tạo ra luồng dữ liệu reactive.
- **Dễ test**: Dễ dàng mock `BehaviorSubject` trong các bài test.
- **Linh hoạt**: Có thể tạo nhiều "store" khác nhau trong các service khác nhau cho từng feature.
