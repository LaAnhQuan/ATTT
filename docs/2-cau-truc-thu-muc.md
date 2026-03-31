# 2. Cấu trúc thư mục chi tiết

Dưới đây là giải thích chi tiết về vai trò của từng thư mục trong cấu trúc dự án.

## `src/app/core`

Thư mục này chứa các thành phần cốt lõi, nền tảng của ứng dụng, được sử dụng xuyên suốt và chỉ nên được import vào `AppModule` (hoặc cung cấp ở root).

- **`guards/`**: Chứa các Route Guards để bảo vệ các route.
  - `auth.guard.ts`: Kiểm tra người dùng đã đăng nhập hay chưa trước khi cho phép truy cập vào một route. Nếu chưa, sẽ điều hướng về trang login.
- **`interceptors/`**: Chứa các HTTP Interceptors để can thiệp vào request/response.
  - `auth.interceptor.ts`: Tự động gắn `Authorization: Bearer <token>` vào header của mỗi HTTP request gửi đi. Nó sẽ lấy token từ `StorageService`.
  - `error.interceptor.ts`: Bắt và xử lý các lỗi HTTP tập trung (ví dụ: 401, 403, 500), có thể hiển thị thông báo lỗi chung hoặc thực hiện các hành động như logout.
- **`models/`**: Định nghĩa các interface hoặc class TypeScript cho các đối tượng dữ liệu (DTOs) trao đổi với backend. Ví dụ: `user.model.ts`, `auth.model.ts`.
- **`services/`**: Chứa các services có phạm vi toàn ứng dụng (singleton).
  - `auth.service.ts`: Quản lý logic xác thực, đăng nhập, đăng xuất.
  - `storage.service.ts`: Cung cấp một lớp trừu tượng để làm việc với `localStorage` và `sessionStorage` (hoặc `cookies`). Service này giúp việc lưu/lấy/xóa token và thông tin người dùng trở nên an toàn và nhất quán.
  - `logger.service.ts`: Service ghi log, có thể tùy chỉnh để chỉ hiển thị log ở môi trường dev.

## `src/app/features`

Mỗi thư mục con trong `features` đại diện cho một tính năng lớn của ứng dụng (ví dụ: `auth`, `users`, `dashboard`). Việc chia theo feature giúp:

- **Tách biệt logic**: Code của một tính năng được gom lại một chỗ.
- **Lazy Loading**: Dễ dàng cấu hình lazy loading cho từng feature module, giúp tăng tốc độ tải trang ban đầu.

Mỗi feature module thường có cấu trúc riêng:
- `components/`: Chứa các component của feature đó.
- `services/`: Chứa các service dành riêng cho feature đó.
- `feature-name.routes.ts`: Định nghĩa các route của feature.
- `feature-name.component.ts`: Component chính của feature.

## `src/app/shared`

Thư mục này chứa các thành phần có thể tái sử dụng ở nhiều feature module khác nhau.

- **`components/`**: Các component chung như `Button`, `Input`, `Spinner`, `LayoutComponent`...
- **`directives/`**: Các directive tùy chỉnh.
- **`pipes/`**: Các pipe tùy chỉnh (ví dụ: `formatDate`, `truncateText`).
- **`material.module.ts`** (ví dụ): Một module chuyên để import và export các component từ thư viện UI (như Angular Material), giúp tránh việc phải import lặp lại ở nhiều nơi.

## `src/environments`

Chứa các file cấu hình cho từng môi trường khác nhau (development, production, staging...).

- `environment.ts`: Dùng cho môi trường development.
- `environment.prod.ts`: Dùng cho môi trường production.

Các file này thường chứa các biến như `apiUrl`, `enableDebug`, etc.
