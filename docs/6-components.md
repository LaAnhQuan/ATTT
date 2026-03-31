# 6. Components

Components là các khối xây dựng cơ bản của một ứng dụng Angular. Chúng ta sẽ phân loại chúng thành "smart components" và "presentational (dumb) components".

## 6.1. Phân loại Components

### Smart Components (Container Components)

- **Vai trò**:
  - Chứa logic nghiệp vụ.
  - Giao tiếp với services để lấy hoặc gửi dữ liệu.
  - Quản lý state của một feature hoặc một trang.
  - Thường là component cha, chứa các presentational components.
- **Ví dụ**: `UserListComponent`, `UserDetailComponent`, `LoginComponent`.
- **Đặc điểm**:
  - Inject services vào constructor.
  - Sử dụng `async` pipe trong template để làm việc với Observables.
  - Xử lý các sự kiện (event) được phát ra từ các component con.

### Presentational Components (Dumb Components)

- **Vai trò**:
  - Chỉ chịu trách nhiệm hiển thị dữ liệu.
  - Nhận dữ liệu từ component cha thông qua `@Input()`.
  - Gửi thông báo về các tương tác của người dùng cho component cha thông qua `@Output()` và `EventEmitter`.
  - Không chứa logic nghiệp vụ phức tạp, không inject services.
- **Ví dụ**: `ButtonComponent`, `UserTableComponent`, `ConfirmationDialogComponent`.
- **Đặc điểm**:
  - Sử dụng `@Input()` và `@Output()`.
  - Có thể tái sử dụng cao.
  - Dễ dàng test vì chúng chỉ phụ thuộc vào input.
  - Thường sử dụng `OnPush` change detection strategy để tối ưu hiệu suất.

## 6.2. Ví dụ thực tế

Hãy xem xét trang danh sách người dùng (`UserListComponent`).

- **`UserListComponent` (Smart Component)**:
  - Inject `UserService`.
  - Gọi `userService.getUsers()` trong `ngOnInit`.
  - Giữ state của danh sách người dùng (`users$`), thông tin phân trang.
  - Chứa các hàm xử lý sự kiện như `onPageChange`, `onDeleteUser`.
  - Truyền dữ liệu `users` vào `UserTableComponent` qua `@Input`.
  - Lắng nghe sự kiện `delete` từ `UserTableComponent` qua `@Output`.

**`user-list.component.html`**
```html
<div>
  <h1>Quản lý người dùng</h1>
  <!-- Component bảng để hiển thị dữ liệu -->
  <app-user-table
    [users]="users$ | async"
    (delete)="handleDeleteUser($event)"
    (edit)="handleEditUser($event)">
  </app-user-table>

  <!-- Component phân trang -->
  <app-paginator
    [totalItems]="totalUsers"
    [pageSize]="pageSize"
    (pageChange)="onPageChange($event)">
  </app-paginator>
</div>
```

- **`UserTableComponent` (Presentational Component)**:
  - Nhận danh sách `users` từ cha qua `@Input() users: User[]`.
  - Hiển thị dữ liệu người dùng trong một bảng HTML.
  - Mỗi hàng có nút "Sửa" và "Xóa".
  - Khi người dùng click nút "Xóa", nó sẽ phát ra một sự kiện `@Output() delete = new EventEmitter<number>()` với ID của người dùng.

**`user-table.component.ts`**
```typescript
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush // Tối ưu hiệu suất
})
export class UserTableComponent {
  @Input() users: User[] | null = [];
  @Output() delete = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();

  displayedColumns: string[] = ['id', 'username', 'email', 'role', 'actions'];

  onDeleteClick(userId: number): void {
    this.delete.emit(userId);
  }

  onEditClick(userId: number): void {
    this.edit.emit(userId);
  }
}
```

**`user-table.component.html`**
```html
<table mat-table [dataSource]="users" class="mat-elevation-z8">
  <!-- Các định nghĩa cột (mat-header-cell, mat-cell) -->
  <ng-container matColumnDef="username">
    <th mat-header-cell *matHeaderCellDef> Tên đăng nhập </th>
    <td mat-cell *matCellDef="let user"> {{user.username}} </td>
  </ng-container>
  <!-- ... các cột khác ... -->
  <ng-container matColumnDef="actions">
    <th mat-header-cell *matHeaderCellDef> Hành động </th>
    <td mat-cell *matCellDef="let user">
      <button mat-icon-button (click)="onEditClick(user.id)">
        <mat-icon>edit</mat-icon>
      </button>
      <button mat-icon-button color="warn" (click)="onDeleteClick(user.id)">
        <mat-icon>delete</mat-icon>
      </button>
    </td>
  </ng-container>

  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
</table>
```

**Lợi ích của mô hình này:**

1.  **Tái sử dụng**: `UserTableComponent` và `PaginatorComponent` có thể được sử dụng ở bất cứ đâu cần hiển thị một bảng dữ liệu có phân trang.
2.  **Dễ test**: Test `UserTableComponent` rất đơn giản, chỉ cần truyền vào các `users` khác nhau và kiểm tra xem nó có hiển thị đúng không, và có phát ra sự kiện khi click nút không.
3.  **Tách biệt rõ ràng**: Logic nghiệp vụ phức tạp nằm gọn trong smart component, trong khi presentational component chỉ tập trung vào UI.
4.  **Tối ưu hiệu suất**: `ChangeDetectionStrategy.OnPush` trên các presentational component giúp Angular bỏ qua việc kiểm tra thay đổi không cần thiết, cải thiện hiệu năng đáng kể.
