# 5. Services và Giao tiếp API

Services trong Angular là trái tim của việc quản lý dữ liệu và giao tiếp với backend.

## 5.1. Nguyên tắc thiết kế Service

- **Single Responsibility**: Mỗi service nên chịu trách nhiệm cho một nhóm chức năng liên quan. Ví dụ: `UserService` quản lý các API liên quan đến người dùng, `MaskingService` quản lý các API về masking mode.
- **Cung cấp ở Root (Singleton)**: Hầu hết các service chứa state hoặc giao tiếp với API nên được cung cấp ở root (`providedIn: 'root'`) để đảm bảo chỉ có một instance duy nhất trong toàn bộ ứng dụng.
- **Trừu tượng hóa API**: Component không nên gọi `HttpClient` trực tiếp. Thay vào đó, chúng gọi các phương thức trong service. Service sẽ là nơi xử lý việc xây dựng URL, thêm header (thông qua interceptor), và xử lý dữ liệu trả về.

## 5.2. Ví dụ: `UserService`

Service này sẽ triển khai các phương thức tương ứng với các endpoint trong `API_ENDPOINTS.md` phần "Users".

**`features/user/services/user.service.ts`**

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User, UserListResponse } from '../../../core/models/user.model';

@Injectable({
  providedIn: 'root' // Cung cấp ở root để các module khác cũng có thể dùng nếu cần
})
export class UserService {

  private apiUrl = `${environment.apiUrl}/api/users/users`;

  constructor(private http: HttpClient) { }

  /**
   * Lấy danh sách người dùng với phân trang.
   * @param skip Số lượng bản ghi bỏ qua
   * @param limit Số lượng bản ghi tối đa
   */
  getUsers(skip: number = 0, limit: number = 10): Observable<UserListResponse> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    return this.http.get<UserListResponse>(this.apiUrl, { params });
  }

  /**
   * Lấy thông tin chi tiết của một người dùng.
   * @param userId ID của người dùng
   */
  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`);
  }

  /**
   * Tạo người dùng mới.
   * @param userData Dữ liệu người dùng mới
   */
  createUser(userData: Partial<User>): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData);
  }

  /**
   * Cập nhật thông tin người dùng.
   * @param userId ID của người dùng
   * @param userData Dữ liệu cần cập nhật
   */
  updateUser(userId: number, userData: Partial<User>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}`, userData);
  }

  /**
   * Xóa người dùng. (Chỉ admin)
   * @param userId ID của người dùng
   */
  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }

  /**
   * Lấy thông tin đã giải mã của người dùng.
   * @param userId ID của người dùng
   * @param password Mật khẩu của người dùng đó
   */
  getDecryptedInfo(userId: number, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${userId}/decrypt-info`, { password });
  }

  /**
   * Reset mật khẩu cho người dùng. (Chỉ admin)
   * @param userId ID của người dùng
   * @param newPassword Mật khẩu mới
   */
  resetPassword(userId: number, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/reset-password`, { new_password: newPassword });
  }
}
```

## 5.3. Sử dụng Service trong Component

Component sẽ inject service vào constructor và gọi các phương thức của nó.

**`features/user/components/user-list/user-list.component.ts`**

```typescript
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../../../core/models/user.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  users$: Observable<User[]>;
  totalUsers: number = 0;
  // Các biến cho phân trang
  currentPage: number = 1;
  pageSize: number = 10;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    const skip = (this.currentPage - 1) * this.pageSize;
    this.userService.getUsers(skip, this.pageSize).subscribe(response => {
      this.users$ = of(response.items); // Gán dữ liệu cho observable
      this.totalUsers = response.total;
    });
  }

  // Hàm xử lý sự kiện chuyển trang
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  // Hàm xử lý xóa user
  deleteUser(userId: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      this.userService.deleteUser(userId).subscribe(() => {
        // Tải lại danh sách sau khi xóa thành công
        this.loadUsers();
        // Hiển thị thông báo thành công
      });
    }
  }
}
```

**Lợi ích:**

- **Code dễ đọc**: Logic nghiệp vụ được đóng gói trong service, component chỉ tập trung vào việc hiển thị và tương tác người dùng.
- **Dễ dàng test**: Có thể "mock" (giả lập) service để test component một cách độc lập mà không cần gọi API thật.
- **Tái sử dụng**: `UserService` có thể được inject và sử dụng ở bất kỳ component nào cần thao tác với dữ liệu người dùng.
