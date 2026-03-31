# 1. Tổng quan dự án Frontend

## 1.1. Giới thiệu

Tài liệu này mô tả chi tiết kiến trúc và các quyết định thiết kế khi xây dựng ứng dụng Frontend cho dự án "Data Masking + Encryption Backend". Mục tiêu là tạo ra một codebase sạch, dễ bảo trì, dễ mở rộng và tuân thủ các best practice hiện đại của Angular.

## 1.2. Công nghệ sử dụng

- **Framework**: Angular 17+
- **Ngôn ngữ**: TypeScript
- **UI Framework**: Angular Material & Tailwind CSS (hoặc một UI library khác như PrimeNG, Nebular)
- **Quản lý State**: Angular Services với RxJS (BehaviorSubject, Subject) cho các state đơn giản.
- **HTTP Client**: `HttpClientModule` của Angular.
- **Routing**: `RouterModule` của Angular.
- **Build tool**: Angular CLI

## 1.3. Cấu trúc thư mục tổng quan

Cấu trúc thư mục được tổ chức theo feature, giúp dễ dàng tìm kiếm, quản lý và tách biệt logic.

```
src/
├── app/
│   ├── core/                  # Core services, models, interceptors, guards
│   │   ├── guards/            # Route guards (e.g., AuthGuard)
│   │   ├── interceptors/      # HTTP interceptors (e.g., AuthInterceptor)
│   │   ├── models/            # Giao diện TypeScript (interfaces)
│   │   └── services/          # Services cốt lõi (Auth, Logger, Storage)
│   │
│   ├── features/              # Các module tính năng
│   │   ├── auth/              # Module đăng nhập, đăng ký
│   │   │   ├── components/
│   │   │   └── services/
│   │   ├── user/              # Module quản lý user
│   │   │   ├── components/
│   │   │   └── services/
│   │   └── dashboard/         # Module dashboard
│   │
│   ├── shared/                # Components, directives, pipes dùng chung
│   │   ├── components/
│   │   ├── directives/
│   │   ├── pipes/
│   │   └── material.module.ts # Module import/export các component của Angular Material
│   │
│   ├── app.component.ts
│   ├── app.config.ts
│   ├── app.routes.ts
│   └── ...
│
├── assets/                    # Tài nguyên tĩnh (images, fonts, etc.)
├── environments/              # Cấu hình môi trường
│   ├── environment.ts
│   └── environment.prod.ts
│
├── index.html
├── main.ts
└── styles.css
```
