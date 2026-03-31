# 3. Routing

Hệ thống routing của Angular được xây dựng dựa trên `RouterModule`. Với cấu trúc dự án này, chúng ta sẽ tổ chức routing một cách phân cấp và sử dụng **Lazy Loading** để tối ưu hiệu suất.

## 3.1. Cấu hình Route chính (`app.routes.ts`)

File `app.routes.ts` là nơi định nghĩa các route ở cấp cao nhất của ứng dụng. Các route này thường trỏ đến các feature module được tải theo kiểu lazy loading.

**Ví dụ `app.routes.ts`:**

```typescript
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [
  // Route cho các trang không cần layout chính (ví dụ: login, register)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Route cho các trang cần layout chính (sidebar, header)
  {
    path: 'app',
    component: LayoutComponent,
    canActivate: [AuthGuard], // Bảo vệ tất cả các route con bên trong
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
      },
      {
        path: 'users',
        loadChildren: () => import('./features/user/user.routes').then(m => m.USER_ROUTES)
      },
      // Điều hướng mặc định khi vào /app
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Điều hướng mặc định của ứng dụng
  {
    path: '',
    redirectTo: '/app/dashboard',
    pathMatch: 'full'
  },

  // Route cho trang 404 Not Found
  {
    path: '**',
    // component: NotFoundComponent
    redirectTo: '/app/dashboard' // Hoặc hiển thị trang 404
  }
];
```

**Phân tích:**

- **Lazy Loading**: `loadChildren` được sử dụng để tải các module `auth`, `dashboard`, `users` chỉ khi người dùng truy cập vào các đường dẫn tương ứng. Điều này giúp giảm kích thước bundle ban đầu.
- **`AuthGuard`**: `canActivate: [AuthGuard]` được áp dụng cho route cha `/app`. Điều này có nghĩa là mọi nỗ lực truy cập vào `/app/*` đều phải đi qua `AuthGuard`. Guard này sẽ kiểm tra xem người dùng đã đăng nhập chưa.
- **`LayoutComponent`**: Các trang bên trong ứng dụng (sau khi đăng nhập) sẽ được hiển thị bên trong một `LayoutComponent` chung, chứa các thành phần như sidebar, header, footer.
- **Phân tách route**: Các route của từng feature được định nghĩa trong file riêng (`auth.routes.ts`, `user.routes.ts`), giúp `app.routes.ts` gọn gàng và dễ quản lý.

## 3.2. Cấu hình Route của Feature

Mỗi feature sẽ có file routing riêng.

**Ví dụ `features/user/user.routes.ts`:**

```typescript
import { Routes } from '@angular/router';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserDetailComponent } from './components/user-detail/user-detail.component';

export const USER_ROUTES: Routes = [
  {
    path: '',
    component: UserListComponent,
    title: 'Quản lý người dùng'
  },
  {
    path: ':id',
    component: UserDetailComponent,
    title: 'Chi tiết người dùng'
  }
];
```

**Lợi ích của cách tiếp cận này:**

1.  **Tổ chức rõ ràng**: Dễ dàng biết được các route nào thuộc về feature nào.
2.  **Khả năng bảo trì**: Khi sửa đổi một feature, chỉ cần làm việc trong thư mục của feature đó.
3.  **Tối ưu hiệu suất**: Lazy loading là một trong những kỹ thuật quan trọng nhất để cải thiện thời gian tải trang cho các ứng dụng Angular lớn.
